import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'
import { buildInvoiceData, generateInvoiceHTML } from '@/lib/invoice/generateInvoice'

const resend = new Resend(process.env.RESEND_API_KEY)

// ── helpers ────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(n)

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

// ── Unpaid confirmation email ──────────────────────────────────────────────
function buildUnpaidConfirmationEmail(data: {
  guestName: string
  confirmationNo: string
  hotelName: string
  hotelCity: string
  roomTypeName: string
  checkIn: string
  checkOut: string
  nights: number
  adults: number
  children: number
  totalAmount: number
  taxAmount: number
  specialRequests: string | null
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Booking Confirmed – Grand Azure</title>
</head>
<body style="margin:0;padding:0;background:#f5f0eb;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0eb;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a0f07 0%,#2d1a0a 50%,#3d2410 100%);border-radius:20px 20px 0 0;padding:40px 40px 32px;text-align:center;">
            <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#c9905a;font-family:Arial,sans-serif;">Grand Azure Hotel Group</p>
            <h1 style="margin:0;font-size:32px;color:#f5ede3;font-weight:400;letter-spacing:0.05em;">Booking Confirmed</h1>
            <p style="margin:16px 0 0;font-size:13px;color:#a07050;font-family:Arial,sans-serif;">Your stay has been confirmed by our team</p>
            <div style="margin:24px auto 0;width:60px;height:2px;background:linear-gradient(to right,transparent,#D4722A,transparent);"></div>
          </td>
        </tr>

        <!-- Confirmation badge -->
        <tr>
          <td style="background:#ffffff;padding:28px 40px 20px;text-align:center;">
            <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#b07a56;font-family:Arial,sans-serif;">Confirmation Number</p>
            <p style="margin:0;font-size:28px;font-weight:700;color:#D4722A;letter-spacing:0.06em;font-family:Arial,sans-serif;">${data.confirmationNo}</p>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="background:#ffffff;padding:0 40px 24px;">
            <p style="margin:0;font-size:16px;color:#3f2f22;line-height:1.7;">Dear <strong>${data.guestName}</strong>,</p>
            <p style="margin:12px 0 0;font-size:15px;color:#6b5444;line-height:1.7;">
              We are delighted to confirm your reservation at <strong>${data.hotelName}</strong>.
              Our team looks forward to welcoming you and ensuring an exceptional stay.
            </p>
          </td>
        </tr>

        <!-- Stay details -->
        <tr>
          <td style="background:#ffffff;padding:0 40px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#fffdf9,#fff8f0);border:1px solid #e8d2b8;border-radius:16px;overflow:hidden;">
              <tr><td style="padding:20px 24px 16px;border-bottom:1px solid #f0dece;">
                <p style="margin:0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#b07a56;font-family:Arial,sans-serif;">Stay Details</p>
              </td></tr>
              <tr><td style="padding:16px 24px 0;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="50%" style="padding-bottom:14px;vertical-align:top;">
                      <p style="margin:0 0 4px;font-size:11px;color:#b07a56;text-transform:uppercase;letter-spacing:0.1em;font-family:Arial,sans-serif;">Property</p>
                      <p style="margin:0;font-size:14px;font-weight:700;color:#3f2f22;">${data.hotelName}</p>
                      <p style="margin:2px 0 0;font-size:12px;color:#8b5a3c;">${data.hotelCity}, Pakistan</p>
                    </td>
                    <td width="50%" style="padding-bottom:14px;vertical-align:top;">
                      <p style="margin:0 0 4px;font-size:11px;color:#b07a56;text-transform:uppercase;letter-spacing:0.1em;font-family:Arial,sans-serif;">Room Type</p>
                      <p style="margin:0;font-size:14px;font-weight:700;color:#3f2f22;">${data.roomTypeName}</p>
                    </td>
                  </tr>
                  <tr>
                    <td width="50%" style="padding-bottom:14px;vertical-align:top;">
                      <p style="margin:0 0 4px;font-size:11px;color:#b07a56;text-transform:uppercase;letter-spacing:0.1em;font-family:Arial,sans-serif;">Check-In</p>
                      <p style="margin:0;font-size:13px;font-weight:600;color:#3f2f22;">${fmtDate(data.checkIn)}</p>
                      <p style="margin:2px 0 0;font-size:11px;color:#8b5a3c;">From 3:00 PM</p>
                    </td>
                    <td width="50%" style="padding-bottom:14px;vertical-align:top;">
                      <p style="margin:0 0 4px;font-size:11px;color:#b07a56;text-transform:uppercase;letter-spacing:0.1em;font-family:Arial,sans-serif;">Check-Out</p>
                      <p style="margin:0;font-size:13px;font-weight:600;color:#3f2f22;">${fmtDate(data.checkOut)}</p>
                      <p style="margin:2px 0 0;font-size:11px;color:#8b5a3c;">Until 12:00 PM</p>
                    </td>
                  </tr>
                  <tr>
                    <td width="50%" style="padding-bottom:14px;vertical-align:top;">
                      <p style="margin:0 0 4px;font-size:11px;color:#b07a56;text-transform:uppercase;letter-spacing:0.1em;font-family:Arial,sans-serif;">Duration</p>
                      <p style="margin:0;font-size:14px;font-weight:700;color:#3f2f22;">${data.nights} Night${data.nights !== 1 ? 's' : ''}</p>
                    </td>
                    <td width="50%" style="padding-bottom:14px;vertical-align:top;">
                      <p style="margin:0 0 4px;font-size:11px;color:#b07a56;text-transform:uppercase;letter-spacing:0.1em;font-family:Arial,sans-serif;">Guests</p>
                      <p style="margin:0;font-size:14px;font-weight:700;color:#3f2f22;">${data.adults} Adult${data.adults !== 1 ? 's' : ''}${data.children > 0 ? ` + ${data.children} Child${data.children !== 1 ? 'ren' : ''}` : ''}</p>
                    </td>
                  </tr>
                </table>
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- Payment summary (unpaid) -->
        <tr>
          <td style="background:#ffffff;padding:0 40px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf6ee;border:1px solid #e8d2b8;border-radius:16px;">
              <tr><td style="padding:20px 24px 16px;border-bottom:1px solid #f0dece;">
                <p style="margin:0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#b07a56;font-family:Arial,sans-serif;">Payment Summary</p>
              </td></tr>
              <tr><td style="padding:16px 24px 4px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-size:13px;color:#6b5444;padding-bottom:8px;">Room Charges</td>
                    <td style="font-size:13px;color:#3f2f22;font-weight:600;text-align:right;padding-bottom:8px;">${fmt(data.totalAmount - data.taxAmount)}</td>
                  </tr>
                  <tr>
                    <td style="font-size:13px;color:#6b5444;padding-bottom:12px;">Tax (16%)</td>
                    <td style="font-size:13px;color:#3f2f22;font-weight:600;text-align:right;padding-bottom:12px;">${fmt(data.taxAmount)}</td>
                  </tr>
                  <tr style="border-top:1px solid #e8d2b8;">
                    <td style="font-size:15px;font-weight:700;color:#3f2f22;padding-top:12px;padding-bottom:16px;">Total Due at Check-In</td>
                    <td style="font-size:18px;font-weight:700;color:#D4722A;text-align:right;padding-top:12px;padding-bottom:16px;">${fmt(data.totalAmount)}</td>
                  </tr>
                </table>
              </td></tr>
            </table>
          </td>
        </tr>

        ${data.specialRequests ? `
        <tr>
          <td style="background:#ffffff;padding:0 40px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbf5;border:1px solid #f0dece;border-radius:16px;padding:20px 24px;">
              <tr><td>
                <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#b07a56;font-family:Arial,sans-serif;">Special Requests Noted</p>
                <p style="margin:0;font-size:13px;color:#6b5444;line-height:1.6;">${data.specialRequests}</p>
              </td></tr>
            </table>
          </td>
        </tr>` : ''}

        <!-- Policies -->
        <tr>
          <td style="background:#ffffff;padding:0 40px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8d2b8;border-radius:16px;overflow:hidden;">
              <tr style="background:#3f2f22;">
                <td style="padding:14px 20px;">
                  <p style="margin:0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#c9905a;font-family:Arial,sans-serif;">Important Information</p>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 20px;background:#fdf6ee;">
                  <p style="margin:0 0 8px;font-size:12px;color:#6b5444;line-height:1.7;">• Please present this confirmation and a valid CNIC / Passport at check-in.</p>
                  <p style="margin:0 0 8px;font-size:12px;color:#6b5444;line-height:1.7;">• Check-in time: 3:00 PM &nbsp;|&nbsp; Check-out time: 12:00 PM</p>
                  <p style="margin:0 0 8px;font-size:12px;color:#6b5444;line-height:1.7;">• For amendments or cancellations, please contact us at least 24 hours in advance.</p>
                  <p style="margin:0;font-size:12px;color:#6b5444;line-height:1.7;">• Payment is due at check-in unless otherwise arranged.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a0f07,#2d1a0a);border-radius:0 0 20px 20px;padding:32px 40px;text-align:center;">
            <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#f5ede3;letter-spacing:0.1em;">Grand Azure Hotel Group</p>
            <p style="margin:0 0 4px;font-size:11px;color:#a07050;font-family:Arial,sans-serif;">Karachi &nbsp;·&nbsp; Lahore &nbsp;·&nbsp; Islamabad</p>
            <p style="margin:16px 0 0;font-size:11px;color:#6b4c30;font-family:Arial,sans-serif;">
              Questions? Reply to this email or visit <a href="https://grandazure.co" style="color:#D4722A;text-decoration:none;">grandazure.co</a>
            </p>
            <p style="margin:8px 0 0;font-size:10px;color:#4a3020;font-family:Arial,sans-serif;">© ${new Date().getFullYear()} Grand Azure Hotel Group. All rights reserved.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ── Paid confirmation email (confirmation + embedded invoice) ──────────────
function buildPaidConfirmationEmail(data: {
  guestName: string
  confirmationNo: string
  hotelName: string
  hotelCity: string
  roomTypeName: string
  checkIn: string
  checkOut: string
  nights: number
  adults: number
  children: number
  originalAmount: number    // before discount
  taxAmount: number
  discountAmount: number
  discountLabel: string
  paidAmount: number        // what guest actually paid (= new total)
  specialRequests: string | null
  invoiceHTML: string       // full invoice HTML to embed inline
}): string {
  const hasDiscount = data.discountAmount > 0

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Booking Confirmed & Paid – Grand Azure</title>
</head>
<body style="margin:0;padding:0;background:#f5f0eb;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0eb;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header — green tint for paid -->
        <tr>
          <td style="background:linear-gradient(135deg,#0a1f12 0%,#0d2b18 50%,#123520 100%);border-radius:20px 20px 0 0;padding:40px 40px 32px;text-align:center;">
            <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#6ee7a0;font-family:Arial,sans-serif;">Grand Azure Hotel Group</p>
            <h1 style="margin:0;font-size:32px;color:#f5ede3;font-weight:400;letter-spacing:0.05em;">Booking Confirmed</h1>
            <!-- PAID badge -->
            <div style="margin:16px auto 0;display:inline-block;background:#16a34a;color:#fff;font-family:Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.15em;padding:6px 20px;border-radius:999px;text-transform:uppercase;">
              ✓ &nbsp;PAID IN FULL
            </div>
            <div style="margin:20px auto 0;width:60px;height:2px;background:linear-gradient(to right,transparent,#6ee7a0,transparent);"></div>
          </td>
        </tr>

        <!-- Confirmation badge -->
        <tr>
          <td style="background:#ffffff;padding:28px 40px 20px;text-align:center;">
            <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#b07a56;font-family:Arial,sans-serif;">Confirmation Number</p>
            <p style="margin:0;font-size:28px;font-weight:700;color:#D4722A;letter-spacing:0.06em;font-family:Arial,sans-serif;">${data.confirmationNo}</p>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="background:#ffffff;padding:0 40px 24px;">
            <p style="margin:0;font-size:16px;color:#3f2f22;line-height:1.7;">Dear <strong>${data.guestName}</strong>,</p>
            <p style="margin:12px 0 0;font-size:15px;color:#6b5444;line-height:1.7;">
              We are delighted to confirm your reservation at <strong>${data.hotelName}</strong>. Your payment has been received and verified.
              Your invoice is attached below — please bring it along at check-in.
            </p>
          </td>
        </tr>

        <!-- Stay details -->
        <tr>
          <td style="background:#ffffff;padding:0 40px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#fffdf9,#fff8f0);border:1px solid #e8d2b8;border-radius:16px;overflow:hidden;">
              <tr><td style="padding:20px 24px 16px;border-bottom:1px solid #f0dece;">
                <p style="margin:0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#b07a56;font-family:Arial,sans-serif;">Stay Details</p>
              </td></tr>
              <tr><td style="padding:16px 24px 0;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="50%" style="padding-bottom:14px;vertical-align:top;">
                      <p style="margin:0 0 4px;font-size:11px;color:#b07a56;text-transform:uppercase;letter-spacing:0.1em;font-family:Arial,sans-serif;">Property</p>
                      <p style="margin:0;font-size:14px;font-weight:700;color:#3f2f22;">${data.hotelName}</p>
                      <p style="margin:2px 0 0;font-size:12px;color:#8b5a3c;">${data.hotelCity}, Pakistan</p>
                    </td>
                    <td width="50%" style="padding-bottom:14px;vertical-align:top;">
                      <p style="margin:0 0 4px;font-size:11px;color:#b07a56;text-transform:uppercase;letter-spacing:0.1em;font-family:Arial,sans-serif;">Room Type</p>
                      <p style="margin:0;font-size:14px;font-weight:700;color:#3f2f22;">${data.roomTypeName}</p>
                    </td>
                  </tr>
                  <tr>
                    <td width="50%" style="padding-bottom:14px;vertical-align:top;">
                      <p style="margin:0 0 4px;font-size:11px;color:#b07a56;text-transform:uppercase;letter-spacing:0.1em;font-family:Arial,sans-serif;">Check-In</p>
                      <p style="margin:0;font-size:13px;font-weight:600;color:#3f2f22;">${fmtDate(data.checkIn)}</p>
                      <p style="margin:2px 0 0;font-size:11px;color:#8b5a3c;">From 3:00 PM</p>
                    </td>
                    <td width="50%" style="padding-bottom:14px;vertical-align:top;">
                      <p style="margin:0 0 4px;font-size:11px;color:#b07a56;text-transform:uppercase;letter-spacing:0.1em;font-family:Arial,sans-serif;">Check-Out</p>
                      <p style="margin:0;font-size:13px;font-weight:600;color:#3f2f22;">${fmtDate(data.checkOut)}</p>
                      <p style="margin:2px 0 0;font-size:11px;color:#8b5a3c;">Until 12:00 PM</p>
                    </td>
                  </tr>
                  <tr>
                    <td width="50%" style="padding-bottom:14px;vertical-align:top;">
                      <p style="margin:0 0 4px;font-size:11px;color:#b07a56;text-transform:uppercase;letter-spacing:0.1em;font-family:Arial,sans-serif;">Duration</p>
                      <p style="margin:0;font-size:14px;font-weight:700;color:#3f2f22;">${data.nights} Night${data.nights !== 1 ? 's' : ''}</p>
                    </td>
                    <td width="50%" style="padding-bottom:14px;vertical-align:top;">
                      <p style="margin:0 0 4px;font-size:11px;color:#b07a56;text-transform:uppercase;letter-spacing:0.1em;font-family:Arial,sans-serif;">Guests</p>
                      <p style="margin:0;font-size:14px;font-weight:700;color:#3f2f22;">${data.adults} Adult${data.adults !== 1 ? 's' : ''}${data.children > 0 ? ` + ${data.children} Child${data.children !== 1 ? 'ren' : ''}` : ''}</p>
                    </td>
                  </tr>
                </table>
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- Payment summary (paid — shows discount breakdown) -->
        <tr>
          <td style="background:#ffffff;padding:0 40px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:16px;">
              <tr><td style="padding:20px 24px 16px;border-bottom:1px solid #bbf7d0;">
                <p style="margin:0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#15803d;font-family:Arial,sans-serif;">Payment Receipt</p>
              </td></tr>
              <tr><td style="padding:16px 24px 4px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-size:13px;color:#6b5444;padding-bottom:8px;">Room Charges</td>
                    <td style="font-size:13px;color:#3f2f22;font-weight:600;text-align:right;padding-bottom:8px;">${fmt(data.originalAmount - data.taxAmount)}</td>
                  </tr>
                  <tr>
                    <td style="font-size:13px;color:#6b5444;padding-bottom:8px;">Tax (16%)</td>
                    <td style="font-size:13px;color:#3f2f22;font-weight:600;text-align:right;padding-bottom:8px;">${fmt(data.taxAmount)}</td>
                  </tr>
                  ${hasDiscount ? `
                  <tr>
                    <td style="font-size:13px;color:#16a34a;padding-bottom:8px;">${data.discountLabel}</td>
                    <td style="font-size:13px;color:#16a34a;font-weight:600;text-align:right;padding-bottom:8px;">− ${fmt(data.discountAmount)}</td>
                  </tr>` : ''}
                  <tr style="border-top:1px solid #bbf7d0;">
                    <td style="font-size:13px;color:#6b5444;padding-top:10px;padding-bottom:8px;">Paid via JazzCash</td>
                    <td style="font-size:13px;color:#16a34a;font-weight:600;text-align:right;padding-top:10px;padding-bottom:8px;">− ${fmt(data.paidAmount)}</td>
                  </tr>
                  <tr>
                    <td style="font-size:15px;font-weight:700;color:#3f2f22;padding-bottom:16px;">Balance Due at Hotel</td>
                    <td style="font-size:18px;font-weight:700;color:#16a34a;text-align:right;padding-bottom:16px;">PKR 0</td>
                  </tr>
                </table>
              </td></tr>
            </table>
          </td>
        </tr>

        ${data.specialRequests ? `
        <tr>
          <td style="background:#ffffff;padding:0 40px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbf5;border:1px solid #f0dece;border-radius:16px;padding:20px 24px;">
              <tr><td>
                <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#b07a56;font-family:Arial,sans-serif;">Special Requests Noted</p>
                <p style="margin:0;font-size:13px;color:#6b5444;line-height:1.6;">${data.specialRequests}</p>
              </td></tr>
            </table>
          </td>
        </tr>` : ''}

        <!-- Policies — no "payment due at check-in" since already paid -->
        <tr>
          <td style="background:#ffffff;padding:0 40px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8d2b8;border-radius:16px;overflow:hidden;">
              <tr style="background:#3f2f22;">
                <td style="padding:14px 20px;">
                  <p style="margin:0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#c9905a;font-family:Arial,sans-serif;">Important Information</p>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 20px;background:#fdf6ee;">
                  <p style="margin:0 0 8px;font-size:12px;color:#6b5444;line-height:1.7;">• Please present this email and a valid CNIC / Passport at check-in.</p>
                  <p style="margin:0 0 8px;font-size:12px;color:#6b5444;line-height:1.7;">• Check-in time: 3:00 PM &nbsp;|&nbsp; Check-out time: 12:00 PM</p>
                  <p style="margin:0 0 8px;font-size:12px;color:#6b5444;line-height:1.7;">• For amendments or cancellations, please contact us at least 24 hours in advance.</p>
                  <p style="margin:0;font-size:12px;color:#16a34a;font-weight:600;line-height:1.7;">✓ Your payment has been received — no further payment is required.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Divider before invoice -->
        <tr>
          <td style="background:#f5f0eb;padding:12px 40px;text-align:center;">
            <p style="margin:0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#b07a56;font-family:Arial,sans-serif;">Your Invoice</p>
            <div style="margin:8px auto 0;width:60px;height:1px;background:#e8d2b8;"></div>
          </td>
        </tr>

        <!-- Embedded invoice -->
        <tr>
          <td style="padding:0;">
            ${data.invoiceHTML}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a0f07,#2d1a0a);border-radius:0 0 20px 20px;padding:32px 40px;text-align:center;">
            <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#f5ede3;letter-spacing:0.1em;">Grand Azure Hotel Group</p>
            <p style="margin:0 0 4px;font-size:11px;color:#a07050;font-family:Arial,sans-serif;">Karachi &nbsp;·&nbsp; Lahore &nbsp;·&nbsp; Islamabad</p>
            <p style="margin:16px 0 0;font-size:11px;color:#6b4c30;font-family:Arial,sans-serif;">
              Questions? Reply to this email or visit <a href="https://grandazure.co" style="color:#D4722A;text-decoration:none;">grandazure.co</a>
            </p>
            <p style="margin:8px 0 0;font-size:10px;color:#4a3020;font-family:Arial,sans-serif;">© ${new Date().getFullYear()} Grand Azure Hotel Group. All rights reserved.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ── POST handler ───────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const { bookingId } = await request.json()

    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // ── 1. Fetch full booking details ──────────────────────────────────────
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select(`
        booking_id,
        confirmation_no,
        booking_status,
        check_in_date,
        check_out_date,
        total_nights,
        adults,
        children,
        total_amount,
        tax_amount,
        discount_amount,
        discount_applied,
        advance_payment_amount,
        payment_method,
        payment_status,
        special_requests,
        guests (
          guest_id,
          first_name,
          last_name,
          email,
          phone
        ),
        hotels (
          hotel_id,
          hotel_name,
          city,
          address_line1,
          phone,
          email
        ),
        booking_rooms (
          room_id,
          rate_per_night,
          room_types (
            type_name
          )
        )
      `)
      .eq('booking_id', bookingId)
      .single()

    if (fetchError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const isPendingStatus =
      booking.booking_status === 'pending_approval' ||
      booking.booking_status === 'pending'

    if (!isPendingStatus) {
      return NextResponse.json(
        { error: `Booking is not in a pending status (current: ${booking.booking_status})` },
        { status: 400 }
      )
    }

    // ── 2. Update status to confirmed ──────────────────────────────────────
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ booking_status: 'confirmed' })
      .eq('booking_id', bookingId)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update booking status' }, { status: 500 })
    }

    // ── 3. Build & send the right email ───────────────────────────────────
    const guest       = booking.guests as any
    const hotel       = booking.hotels as any
    const bookingRooms = booking.booking_rooms as any[]
    const roomTypeName = bookingRooms?.[0]?.room_types?.type_name ?? 'Deluxe Room'

    const guestName  = `${guest?.first_name ?? ''} ${guest?.last_name ?? ''}`.trim()
    const guestEmail = guest?.email

    if (!guestEmail) {
      return NextResponse.json({ success: true, emailSent: false, reason: 'No guest email on record' })
    }

    const advancePaid    = Number(booking.advance_payment_amount ?? 0)
    const discountAmount = Number(booking.discount_amount ?? 0)
    const isPaid         = advancePaid > 0   // guest already paid via JazzCash

    let html: string
    let subject: string

    if (isPaid) {
      // ── Paid path: embed full invoice ────────────────────────────────────
      // The original total before discount (what was stored before submit-payment ran)
      // is recoverable as: advance_paid + discount_amount (since total was already
      // updated to advance_paid by submit-payment/route.ts)
      const originalTotal = advancePaid + discountAmount

      const invoiceData = buildInvoiceData({
        booking: {
          booking_id:             booking.booking_id,
          confirmation_no:        booking.confirmation_no,
          check_in_date:          booking.check_in_date,
          check_out_date:         booking.check_out_date,
          total_nights:           booking.total_nights,
          total_amount:           advancePaid,           // discounted total
          tax_amount:             Number(booking.tax_amount ?? 0),
          adults:                 booking.adults,
          children:               booking.children,
          discount_amount:        discountAmount || null,
          discount_applied:       booking.discount_applied ?? discountAmount > 0,
          advance_payment_amount: advancePaid,
          payment_method:         booking.payment_method,
          created_at:             new Date().toISOString(),
        },
        guest: {
          first_name: guest?.first_name ?? '',
          last_name:  guest?.last_name  ?? '',
          email:      guest?.email      ?? '',
          phone:      guest?.phone      ?? '',
        },
        hotel: {
          hotel_name:    hotel?.hotel_name    ?? 'Grand Azure Hotel',
          address_line1: hotel?.address_line1 ?? '',
          city:          hotel?.city          ?? '',
          phone:         hotel?.phone         ?? '',
          email:         hotel?.email         ?? '',
        },
        roomTypeName,
        invoiceNo: `INV-${booking.confirmation_no}`,
      })

      const invoiceHTML = generateInvoiceHTML(invoiceData)

      html = buildPaidConfirmationEmail({
        guestName,
        confirmationNo:  booking.confirmation_no,
        hotelName:       hotel?.hotel_name ?? 'Grand Azure Hotel',
        hotelCity:       hotel?.city       ?? 'Pakistan',
        roomTypeName,
        checkIn:         booking.check_in_date,
        checkOut:        booking.check_out_date,
        nights:          booking.total_nights,
        adults:          booking.adults,
        children:        booking.children,
        originalAmount:  originalTotal,
        taxAmount:       Number(booking.tax_amount ?? 0),
        discountAmount,
        discountLabel:   discountAmount > 0 ? 'Online Booking Discount (10%)' : '',
        paidAmount:      advancePaid,
        specialRequests: booking.special_requests,
        invoiceHTML,
      })

      subject = `✓ Paid & Confirmed – ${booking.confirmation_no} | Grand Azure Hotels`
    } else {
      // ── Unpaid path: plain confirmation ──────────────────────────────────
      html = buildUnpaidConfirmationEmail({
        guestName,
        confirmationNo:  booking.confirmation_no,
        hotelName:       hotel?.hotel_name ?? 'Grand Azure Hotel',
        hotelCity:       hotel?.city       ?? 'Pakistan',
        roomTypeName,
        checkIn:         booking.check_in_date,
        checkOut:        booking.check_out_date,
        nights:          booking.total_nights,
        adults:          booking.adults,
        children:        booking.children,
        totalAmount:     Number(booking.total_amount),
        taxAmount:       Number(booking.tax_amount ?? 0),
        specialRequests: booking.special_requests,
      })

      subject = `Booking Confirmed – ${booking.confirmation_no} | Grand Azure Hotels`
    }

    const { error: emailError } = await resend.emails.send({
      from:    'Grand Azure Hotels <bookings@grandazure.co>',
      to:      [guestEmail],
      subject,
      html,
    })

    if (emailError) {
      console.error('[Resend] Email send failed:', emailError)
      return NextResponse.json({
        success:    true,
        emailSent:  false,
        emailError: emailError.message,
      })
    }

    return NextResponse.json({ success: true, emailSent: true })

  } catch (err: any) {
    console.error('[confirm/route] Unhandled error:', err)
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}