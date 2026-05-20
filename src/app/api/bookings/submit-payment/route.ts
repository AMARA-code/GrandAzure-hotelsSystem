import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const bookingIdRaw = formData.get('bookingId')
    const screenshot = formData.get('screenshot')
    const senderNumber = formData.get('senderNumber')?.toString().trim() ?? ''
    const transactionId = formData.get('transactionId')?.toString().trim() ?? ''
    const advanceAmount = Number(formData.get('advanceAmount') ?? 0)
    const discountAmount = Number(formData.get('discountAmount') ?? 0)

    if (!bookingIdRaw) {
      return NextResponse.json({ error: 'bookingId is required' }, { status: 400 })
    }

    const bookingId = Number(bookingIdRaw)
    if (!bookingId || Number.isNaN(bookingId)) {
      return NextResponse.json({ error: 'bookingId must be a valid number' }, { status: 400 })
    }

    if (!screenshot || !(screenshot instanceof File)) {
      return NextResponse.json({ error: 'A payment screenshot is required' }, { status: 400 })
    }

    if (!senderNumber) {
      return NextResponse.json({ error: 'Sender number is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) {
      return NextResponse.json({ error: 'You must be signed in to submit payment proof' }, { status: 401 })
    }

    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select(`
        booking_id,
        booking_status,
        hotel_id,
        guest_id,
        total_amount,
        tax_amount,
        discount_amount,
        confirmation_no,
        check_in_date,
        guests!inner ( email )
      `)
      .eq('booking_id', bookingId)
      .single()

    if (fetchError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const guestEmail = (booking.guests as { email?: string })?.email
    if (!guestEmail || guestEmail.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ error: 'You do not have access to this booking' }, { status: 403 })
    }

    if (booking.booking_status !== 'pending' && booking.booking_status !== 'pending_payment') {
      return NextResponse.json({ error: 'Booking is not awaiting payment proof' }, { status: 400 })
    }

    // ── Upload screenshot to storage ──────────────────────────────────────
    const safeFilename = screenshot.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const storagePath = `bookings/${bookingId}/${Date.now()}-${safeFilename}`
    const fileBuffer = Buffer.from(await screenshot.arrayBuffer())

    let uploadResult = await supabaseAdmin.storage
      .from('payment-proofs')
      .upload(storagePath, fileBuffer, {
        contentType: screenshot.type || 'application/octet-stream',
        upsert: false,
      })

    if (uploadResult.error) {
      console.warn('[submit-payment] initial upload failed, retrying with upsert=true', uploadResult.error)
      uploadResult = await supabaseAdmin.storage
        .from('payment-proofs')
        .upload(storagePath, fileBuffer, {
          contentType: screenshot.type || 'application/octet-stream',
          upsert: true,
        })
    }

    if (uploadResult.error) {
      console.error('[submit-payment] storage upload failed:', uploadResult.error)
      return NextResponse.json(
        { error: uploadResult.error.message ?? 'Failed to upload payment screenshot' },
        { status: 500 }
      )
    }

    // ── Compute the canonical total after discount ─────────────────────────
    // When a discount is applied, the guest has paid the discounted amount
    // as full and final settlement. The invoice total must be updated to
    // match what was actually charged — otherwise balance_due stays wrong.
    const originalTotal   = Number(booking.total_amount ?? 0)
    const invoiceTotalAmount = discountAmount > 0
      ? advanceAmount       // discounted price IS the new total; nothing more owed
      : originalTotal

    // ── Update booking row ────────────────────────────────────────────────
    const { error: updateError } = await supabaseAdmin
      .from('bookings')
      .update({
        payment_method: 'jazzcash',
        discount_applied: discountAmount > 0,
        discount_amount: discountAmount || null,
        advance_payment_amount: advanceAmount || null,
        // KEY FIX: persist the discounted total so admin panel shows correct amount
        total_amount: invoiceTotalAmount,
        booking_status: 'pending',
        payment_status: 'pending_verification',
        jazzcash_screenshot_url: storagePath,
        jazzcash_sender_number: senderNumber,
        jazzcash_transaction_id: transactionId || null,
      })
      .eq('booking_id', bookingId)

    if (updateError) {
      console.error('[submit-payment] booking update failed:', updateError)
      return NextResponse.json({ error: 'Failed to update booking payment details' }, { status: 500 })
    }

    // ── Upsert invoice row ────────────────────────────────────────────────
    const { data: existingInvoice } = await supabaseAdmin
      .from('invoices')
      .select('invoice_id, total_amount')
      .eq('booking_id', bookingId)
      .maybeSingle()

    const taxAmount       = Number(booking.tax_amount ?? 0)
    const bookingDiscount = discountAmount || Number(booking.discount_amount ?? 0)
    // subtotal = room charges before tax, before discount
    const subtotal        = originalTotal - taxAmount
    const taxRate         = subtotal > 0 ? Math.round((taxAmount / subtotal) * 100) : 16
    // With a discount, the guest has settled in full — balance is 0
    const balanceDue      = Math.max(0, invoiceTotalAmount - advanceAmount)
    const invoiceStatus   = balanceDue === 0 ? 'paid' : 'partially_paid'

    if (existingInvoice) {
      const { error: invoiceUpdateError } = await supabaseAdmin
        .from('invoices')
        .update({
          paid_amount:     advanceAmount,
          balance_due:     balanceDue,
          discount_amount: bookingDiscount,
          total_amount:    invoiceTotalAmount,  // KEY FIX: reflect discounted total
          payment_method:  'jazzcash',
          status:          invoiceStatus,
          updated_at:      new Date().toISOString(),
        })
        .eq('invoice_id', existingInvoice.invoice_id)

      if (invoiceUpdateError) {
        console.warn('[submit-payment] invoice update failed (non-fatal):', invoiceUpdateError)
      }
    } else {
      const invoiceNo = `INV-${booking.confirmation_no}`

      const { error: invoiceCreateError } = await supabaseAdmin
        .from('invoices')
        .insert({
          booking_id:      bookingId,
          hotel_id:        booking.hotel_id,
          guest_id:        booking.guest_id,
          invoice_no:      invoiceNo,
          invoice_date:    booking.check_in_date,
          due_date:        booking.check_in_date,
          subtotal,
          discount_amount: bookingDiscount,
          tax_rate:        taxRate,
          tax_amount:      taxAmount,
          total_amount:    invoiceTotalAmount,  // KEY FIX: discounted total
          paid_amount:     advanceAmount,
          balance_due:     balanceDue,          // KEY FIX: 0 when discount covers all
          currency_code:   'PKR',
          status:          invoiceStatus,
          payment_method:  'jazzcash',
          created_at:      new Date().toISOString(),
          updated_at:      new Date().toISOString(),
        })

      if (invoiceCreateError) {
        console.warn('[submit-payment] invoice creation failed (non-fatal):', invoiceCreateError)
      }
    }

    return NextResponse.json({ success: true, screenshotUrl: storagePath })
  } catch (err: unknown) {
    console.error('[submit-payment] Unhandled error:', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}