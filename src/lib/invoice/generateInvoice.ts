/**
 * src/lib/invoice/generateInvoice.ts
 *
 * Generates a full invoice HTML string that can be:
 *  - Converted to PDF via a headless browser (puppeteer / playwright)
 *  - Sent directly as an HTML email body
 *  - Rendered in an <iframe> for the guest to download/print
 *
 * No external dependencies required beyond what Next.js already has.
 */

export interface InvoiceData {
  invoiceNo: string
  invoiceDate: string              // e.g. "18 May 2026"
  confirmationNo: string

  // Hotel
  hotelName: string
  hotelAddress: string
  hotelCity: string
  hotelPhone: string
  hotelEmail: string

  // Guest
  guestName: string
  guestEmail: string
  guestPhone: string

  // Booking details
  roomTypeName: string
  checkIn: string                  // e.g. "20 May 2026"
  checkOut: string                 // e.g. "23 May 2026"
  totalNights: number
  adults: number
  children: number

  // Financials (all in PKR)
  ratePerNight: number
  subtotal: number                 // ratePerNight × totalNights
  discountLabel: string | null     // e.g. "Advance Payment Discount (10%)"
  discountAmount: number           // 0 if no discount
  taxRate: number                  // e.g. 0.17 for 17% GST
  taxAmount: number
  totalAmount: number              // final amount due

  // Payment
  paymentMethod: string            // e.g. "JazzCash Advance Payment"
  paidAmount: number               // 0 if pay-at-hotel
  balanceDue: number

  // Status
  paymentStatus: 'paid' | 'pending' | 'partially_paid'
}

function formatPKR(amount: number): string {
  return `PKR ${amount.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function generateInvoiceHTML(data: InvoiceData): string {
  const statusColor =
    data.paymentStatus === 'paid'
      ? '#16a34a'
      : data.paymentStatus === 'partially_paid'
        ? '#d97706'
        : '#dc2626'

  const statusLabel =
    data.paymentStatus === 'paid'
      ? 'PAID'
      : data.paymentStatus === 'partially_paid'
        ? 'PARTIALLY PAID'
        : 'PAYMENT PENDING'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice ${data.invoiceNo} — Grand Azure Hotels</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'DM Sans', sans-serif;
      background: #f8f6f1;
      color: #1a1410;
      min-height: 100vh;
      padding: 40px 20px;
    }

    .page {
      max-width: 760px;
      margin: 0 auto;
      background: #fff;
      border: 1px solid #e8e0d0;
      box-shadow: 0 4px 40px rgba(0,0,0,0.08);
    }

    /* ── Header ── */
    .header {
      background: #0a1628;
      color: #fff;
      padding: 40px 48px 32px;
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: '';
      position: absolute;
      top: -60px; right: -60px;
      width: 200px; height: 200px;
      border-radius: 50%;
      background: rgba(196, 164, 97, 0.15);
    }
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 28px;
    }
    .brand-name {
      font-family: 'Cormorant Garamond', serif;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: 0.5px;
      color: #fff;
    }
    .brand-tagline {
      font-size: 11px;
      color: #c4a461;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-top: 2px;
    }
    .invoice-badge {
      text-align: right;
    }
    .invoice-label {
      font-size: 11px;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #c4a461;
    }
    .invoice-no {
      font-family: 'Cormorant Garamond', serif;
      font-size: 22px;
      font-weight: 600;
      color: #fff;
      margin-top: 4px;
    }
    .header-meta {
      display: flex;
      gap: 40px;
    }
    .meta-item label {
      font-size: 10px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #8a9bb5;
    }
    .meta-item span {
      display: block;
      font-size: 13px;
      color: #e8e4dc;
      margin-top: 2px;
    }

    /* ── Status Banner ── */
    .status-banner {
      background: ${statusColor}18;
      border-left: 4px solid ${statusColor};
      padding: 12px 48px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .status-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: ${statusColor};
      flex-shrink: 0;
    }
    .status-text {
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: ${statusColor};
    }

    /* ── Body ── */
    .body { padding: 40px 48px; }

    /* Parties */
    .parties {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      margin-bottom: 40px;
      padding-bottom: 32px;
      border-bottom: 1px solid #e8e0d0;
    }
    .party-label {
      font-size: 10px;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      color: #8a7a60;
      margin-bottom: 10px;
    }
    .party-name {
      font-family: 'Cormorant Garamond', serif;
      font-size: 18px;
      font-weight: 600;
      color: #0a1628;
      margin-bottom: 4px;
    }
    .party-detail {
      font-size: 13px;
      color: #6b6257;
      line-height: 1.6;
    }

    /* Stay Details */
    .section-title {
      font-size: 10px;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      color: #8a7a60;
      margin-bottom: 16px;
    }
    .stay-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0;
      border: 1px solid #e8e0d0;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 36px;
    }
    .stay-cell {
      padding: 16px 20px;
      border-right: 1px solid #e8e0d0;
    }
    .stay-cell:last-child { border-right: none; }
    .stay-cell label {
      font-size: 10px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #8a9bb5;
      display: block;
      margin-bottom: 4px;
    }
    .stay-cell span {
      font-size: 13px;
      font-weight: 500;
      color: #0a1628;
    }

    /* Line Items */
    .line-items {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 8px;
    }
    .line-items thead tr {
      background: #f4f0e8;
    }
    .line-items th {
      font-size: 10px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #6b6257;
      padding: 10px 16px;
      text-align: left;
      font-weight: 500;
    }
    .line-items th:last-child { text-align: right; }
    .line-items td {
      padding: 14px 16px;
      font-size: 13px;
      color: #1a1410;
      border-bottom: 1px solid #f0ebe0;
    }
    .line-items td:last-child { text-align: right; }
    .line-items tr:last-child td { border-bottom: none; }

    /* Totals */
    .totals {
      margin-left: auto;
      width: 280px;
      margin-top: 16px;
      margin-bottom: 36px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 7px 0;
      font-size: 13px;
      color: #4a4035;
      border-bottom: 1px solid #f0ebe0;
    }
    .total-row:last-child { border-bottom: none; }
    .total-row.discount { color: #16a34a; }
    .total-row.grand {
      font-weight: 600;
      font-size: 16px;
      color: #0a1628;
      padding: 12px 0 0;
      border-top: 2px solid #0a1628;
      border-bottom: none;
    }
    .total-row.balance {
      font-size: 14px;
      font-weight: 500;
      color: ${data.balanceDue > 0 ? '#dc2626' : '#16a34a'};
    }

    /* Payment Info */
    .payment-info {
      background: #f4f0e8;
      border-radius: 6px;
      padding: 20px 24px;
      margin-bottom: 32px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .pi-item label {
      font-size: 10px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #8a7a60;
      display: block;
      margin-bottom: 3px;
    }
    .pi-item span {
      font-size: 13px;
      font-weight: 500;
      color: #0a1628;
    }

    /* JazzCash note */
    .jazzcash-note {
      background: #fff7ed;
      border: 1px solid #fed7aa;
      border-radius: 6px;
      padding: 16px 20px;
      margin-bottom: 32px;
      font-size: 12.5px;
      color: #92400e;
      line-height: 1.6;
    }
    .jazzcash-note strong { color: #78350f; }

    /* Footer */
    .footer {
      background: #0a1628;
      padding: 24px 48px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .footer-brand {
      font-family: 'Cormorant Garamond', serif;
      font-size: 16px;
      color: #c4a461;
    }
    .footer-note {
      font-size: 11px;
      color: #5a7096;
      text-align: right;
    }

    @media print {
      body { background: white; padding: 0; }
      .page { box-shadow: none; border: none; }
    }
  </style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div class="header-top">
      <div>
        <div class="brand-name">Grand Azure</div>
        <div class="brand-tagline">Hotels &amp; Resorts · Pakistan</div>
      </div>
      <div class="invoice-badge">
        <div class="invoice-label">Invoice</div>
        <div class="invoice-no">${data.invoiceNo}</div>
      </div>
    </div>
    <div class="header-meta">
      <div class="meta-item">
        <label>Date Issued</label>
        <span>${data.invoiceDate}</span>
      </div>
      <div class="meta-item">
        <label>Confirmation No.</label>
        <span>${data.confirmationNo}</span>
      </div>
      <div class="meta-item">
        <label>Hotel</label>
        <span>${data.hotelName}</span>
      </div>
    </div>
  </div>

  <!-- Status Banner -->
  <div class="status-banner">
    <div class="status-dot"></div>
    <div class="status-text">${statusLabel}</div>
  </div>

  <!-- Body -->
  <div class="body">

    <!-- Parties -->
    <div class="parties">
      <div>
        <div class="party-label">Billed To</div>
        <div class="party-name">${data.guestName}</div>
        <div class="party-detail">
          ${data.guestEmail}<br/>
          ${data.guestPhone}
        </div>
      </div>
      <div>
        <div class="party-label">From</div>
        <div class="party-name">${data.hotelName}</div>
        <div class="party-detail">
          ${data.hotelAddress}, ${data.hotelCity}<br/>
          ${data.hotelPhone}<br/>
          ${data.hotelEmail}
        </div>
      </div>
    </div>

    <!-- Stay Details -->
    <div class="section-title">Stay Details</div>
    <div class="stay-grid">
      <div class="stay-cell">
        <label>Room Type</label>
        <span>${data.roomTypeName}</span>
      </div>
      <div class="stay-cell">
        <label>Check-In</label>
        <span>${data.checkIn}</span>
      </div>
      <div class="stay-cell">
        <label>Check-Out</label>
        <span>${data.checkOut}</span>
      </div>
      <div class="stay-cell">
        <label>Nights · Guests</label>
        <span>${data.totalNights}N · ${data.adults}A${data.children > 0 ? ` ${data.children}C` : ''}</span>
      </div>
    </div>

    <!-- Line Items -->
    <div class="section-title">Charges</div>
    <table class="line-items">
      <thead>
        <tr>
          <th>Description</th>
          <th>Rate / Night</th>
          <th>Nights</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${data.roomTypeName} — Room Charge</td>
          <td>${formatPKR(data.ratePerNight)}</td>
          <td>${data.totalNights}</td>
          <td>${formatPKR(data.subtotal)}</td>
        </tr>
        ${data.taxAmount > 0 ? `
        <tr>
          <td>GST (${Math.round(data.taxRate * 100)}%)</td>
          <td>—</td>
          <td>—</td>
          <td>${formatPKR(data.taxAmount)}</td>
        </tr>` : ''}
      </tbody>
    </table>

    <!-- Totals -->
    <div class="totals">
      <div class="total-row">
        <span>Subtotal</span>
        <span>${formatPKR(data.subtotal)}</span>
      </div>
      ${data.discountAmount > 0 ? `
      <div class="total-row discount">
        <span>${data.discountLabel ?? 'Discount'}</span>
        <span>− ${formatPKR(data.discountAmount)}</span>
      </div>` : ''}
      ${data.taxAmount > 0 ? `
      <div class="total-row">
        <span>GST (${Math.round(data.taxRate * 100)}%)</span>
        <span>${formatPKR(data.taxAmount)}</span>
      </div>` : ''}
      <div class="total-row grand">
        <span>Total</span>
        <span>${formatPKR(data.totalAmount)}</span>
      </div>
      ${data.paidAmount > 0 ? `
      <div class="total-row">
        <span>Paid (${data.paymentMethod})</span>
        <span>− ${formatPKR(data.paidAmount)}</span>
      </div>` : ''}
      <div class="total-row balance">
        <span>Balance Due at Hotel</span>
        <span>${formatPKR(data.balanceDue)}</span>
      </div>
    </div>

    <!-- Payment Info -->
    <div class="payment-info">
      <div class="pi-item">
        <label>Payment Method</label>
        <span>${data.paymentMethod}</span>
      </div>
      <div class="pi-item">
        <label>Amount Paid</label>
        <span>${formatPKR(data.paidAmount)}</span>
      </div>
      <div class="pi-item">
        <label>Balance Due at Check-In</label>
        <span>${formatPKR(data.balanceDue)}</span>
      </div>
      <div class="pi-item">
        <label>Status</label>
        <span style="color:${statusColor};font-weight:600">${statusLabel}</span>
      </div>
    </div>

    ${data.balanceDue > 0 ? `
    <div class="jazzcash-note">
      <strong>Note:</strong> A balance of <strong>${formatPKR(data.balanceDue)}</strong> is due at the time of check-in.
      Please carry this invoice and a valid CNIC/Passport for verification.
      For queries, contact us at <strong>${data.hotelEmail}</strong> or call <strong>${data.hotelPhone}</strong>.
    </div>` : ''}

  </div><!-- /body -->

  <!-- Footer -->
  <div class="footer">
    <div class="footer-brand">Grand Azure Hotels &amp; Resorts</div>
    <div class="footer-note">
      This is a computer-generated invoice.<br/>
      grandazure.co · ${data.hotelEmail}
    </div>
  </div>

</div>
</body>
</html>`
}

/**
 * Builds InvoiceData from a Booking + related records.
 * Call this right before generating the HTML.
 */
export function buildInvoiceData(params: {
  booking: {
    booking_id: number
    confirmation_no: string
    check_in_date: string
    check_out_date: string
    total_nights: number
    total_amount: number
    tax_amount: number
    adults: number
    children: number
    discount_amount: number | null
    discount_applied: boolean
    advance_payment_amount: number | null
    payment_method: string | null
    created_at: string
  }
  guest: { first_name: string; last_name: string; email: string; phone: string }
  hotel: { hotel_name: string; address_line1: string; city: string; phone: string; email: string }
  roomTypeName: string
  invoiceNo: string
}): InvoiceData {
  const { booking, guest, hotel, roomTypeName, invoiceNo } = params

  const discountAmount = booking.discount_amount ?? 0
  const paidAmount = booking.advance_payment_amount ?? 0
  const subtotal = booking.total_amount - booking.tax_amount + discountAmount
  const ratePerNight = booking.total_nights > 0 ? subtotal / booking.total_nights : subtotal
  const totalAmount = booking.total_amount
  const balanceDue = Math.max(0, totalAmount - paidAmount)

  const paymentMethodLabel =
    booking.payment_method === 'jazzcash'
      ? 'JazzCash (Advance)'
      : booking.payment_method === 'pay_at_hotel'
        ? 'Pay at Hotel'
        : booking.payment_method ?? 'N/A'

  const paymentStatus: InvoiceData['paymentStatus'] =
    paidAmount >= totalAmount
      ? 'paid'
      : paidAmount > 0
        ? 'partially_paid'
        : 'pending'

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })

  return {
    invoiceNo,
    invoiceDate: fmt(new Date().toISOString()),
    confirmationNo: booking.confirmation_no,

    hotelName: hotel.hotel_name,
    hotelAddress: hotel.address_line1,
    hotelCity: hotel.city,
    hotelPhone: hotel.phone,
    hotelEmail: hotel.email,

    guestName: `${guest.first_name} ${guest.last_name}`,
    guestEmail: guest.email,
    guestPhone: guest.phone,

    roomTypeName,
    checkIn: fmt(booking.check_in_date),
    checkOut: fmt(booking.check_out_date),
    totalNights: booking.total_nights,
    adults: booking.adults,
    children: booking.children,

    ratePerNight: Math.round(ratePerNight),
    subtotal: Math.round(subtotal),
    discountLabel: booking.discount_applied ? 'Advance Payment Discount (10%)' : null,
    discountAmount: Math.round(discountAmount),
    taxRate: subtotal > 0 ? booking.tax_amount / (subtotal - discountAmount) : 0,
    taxAmount: Math.round(booking.tax_amount),
    totalAmount: Math.round(totalAmount),

    paymentMethod: paymentMethodLabel,
    paidAmount: Math.round(paidAmount),
    balanceDue: Math.round(balanceDue),
    paymentStatus,
  }
}