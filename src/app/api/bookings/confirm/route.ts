import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'

const resend = new Resend(process.env.RESEND_API_KEY)

// ── Inline email HTML builder ──────────────────────────────────────────────
function buildBookingConfirmationEmail(data: {
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
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(n)

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

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
            <p style="margin:0;font-size:16px;color:#3f2f22;line-height:1.7;">
              Dear <strong>${data.guestName}</strong>,
            </p>
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
              <tr>
                <td style="padding:20px 24px 16px;border-bottom:1px solid #f0dece;">
                  <p style="margin:0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#b07a56;font-family:Arial,sans-serif;">Stay Details</p>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 24px 0;">
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
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Payment summary -->
        <tr>
          <td style="background:#ffffff;padding:0 40px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf6ee;border:1px solid #e8d2b8;border-radius:16px;">
              <tr>
                <td style="padding:20px 24px 16px;border-bottom:1px solid #f0dece;">
                  <p style="margin:0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#b07a56;font-family:Arial,sans-serif;">Payment Summary</p>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 24px 4px;">
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
                      <td style="font-size:15px;font-weight:700;color:#3f2f22;padding-top:12px;padding-bottom:16px;">Total Amount</td>
                      <td style="font-size:18px;font-weight:700;color:#D4722A;text-align:right;padding-top:12px;padding-bottom:16px;">${fmt(data.totalAmount)}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        ${data.specialRequests ? `
        <!-- Special requests -->
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
              Questions? Reply to this email or visit
              <a href="https://grandazure.co" style="color:#D4722A;text-decoration:none;"> grandazure.co</a>
            </p>
            <p style="margin:8px 0 0;font-size:10px;color:#4a3020;font-family:Arial,sans-serif;">
              © ${new Date().getFullYear()} Grand Azure Hotel Group. All rights reserved.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

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
        special_requests,
        guests (
          first_name,
          last_name,
          email
        ),
        hotels (
          hotel_name,
          city
        ),
        booking_rooms (
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

    // ── Accept both status values for safety ───────────────────────────────
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

    // ── 3. Send confirmation email via Resend ──────────────────────────────
    const guest = booking.guests as any
    const hotel = booking.hotels as any
    const bookingRooms = booking.booking_rooms as any[]
    const roomTypeName = bookingRooms?.[0]?.room_types?.type_name ?? 'Deluxe Room'

    const guestName = `${guest?.first_name ?? ''} ${guest?.last_name ?? ''}`.trim()
    const guestEmail = guest?.email

    if (!guestEmail) {
      return NextResponse.json({ success: true, emailSent: false, reason: 'No guest email on record' })
    }

    const html = buildBookingConfirmationEmail({
      guestName,
      confirmationNo: booking.confirmation_no,
      hotelName: hotel?.hotel_name ?? 'Grand Azure Hotel',
      hotelCity: hotel?.city ?? 'Pakistan',
      roomTypeName,
      checkIn: booking.check_in_date,
      checkOut: booking.check_out_date,
      nights: booking.total_nights,
      adults: booking.adults,
      children: booking.children,
      totalAmount: Number(booking.total_amount),
      taxAmount: Number(booking.tax_amount),
      specialRequests: booking.special_requests,
    })

    const { error: emailError } = await resend.emails.send({
      from: 'Grand Azure Hotels <bookings@grandazure.co>',
      to: [guestEmail],
      subject: `Booking Confirmed – ${booking.confirmation_no} | Grand Azure Hotels`,
      html,
    })

    if (emailError) {
      console.error('[Resend] Email send failed:', emailError)
      // Booking is already confirmed — email failure is non-fatal
      return NextResponse.json({
        success: true,
        emailSent: false,
        emailError: emailError.message,
      })
    }

    return NextResponse.json({ success: true, emailSent: true })

  } catch (err: any) {
    console.error('[confirm/route] Unhandled error:', err)
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}