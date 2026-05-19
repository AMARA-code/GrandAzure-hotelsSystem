import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('booking_id, booking_status')
      .eq('booking_id', bookingId)
      .single()

    if (fetchError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.booking_status !== 'pending' && booking.booking_status !== 'pending_payment') {
      return NextResponse.json({ error: 'Booking is not awaiting payment proof' }, { status: 400 })
    }

    const safeFilename = screenshot.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const storagePath = `bookings/${bookingId}/${Date.now()}-${safeFilename}`
    const fileBuffer = Buffer.from(await screenshot.arrayBuffer())

    // Try uploading; include detailed errors for easier debugging
    let uploadResult = await supabase.storage
      .from('payment-proofs')
      .upload(storagePath, fileBuffer, {
        contentType: screenshot.type || 'application/octet-stream',
        upsert: false,
      })

    if (uploadResult.error) {
      // Retry with upsert true as a fallback (some environments need this)
      console.warn('[submit-payment] initial upload failed, retrying with upsert=true', uploadResult.error)
      uploadResult = await supabase.storage
        .from('payment-proofs')
        .upload(storagePath, fileBuffer, {
          contentType: screenshot.type || 'application/octet-stream',
          upsert: true,
        })
    }

    if (uploadResult.error) {
      console.error('[submit-payment] storage upload failed:', uploadResult.error)
      return NextResponse.json({ error: uploadResult.error.message ?? 'Failed to upload payment screenshot' }, { status: 500 })
    }

    const { error: updateError } = await supabase.from('bookings').update({
      payment_method: 'jazzcash',
      discount_applied: true,
      discount_amount: discountAmount || null,
      advance_payment_amount: advanceAmount || null,
      booking_status: 'pending',
      payment_status: 'pending_verification',
      jazzcash_screenshot_url: storagePath,
      jazzcash_sender_number: senderNumber,
      jazzcash_transaction_id: transactionId || null,
    }).eq('booking_id', bookingId)

    if (updateError) {
      console.error('[submit-payment] booking update failed:', updateError)
      return NextResponse.json({ error: 'Failed to update booking payment details' }, { status: 500 })
    }

    return NextResponse.json({ success: true, screenshotUrl: storagePath })
  } catch (err: any) {
    console.error('[submit-payment] Unhandled error:', err)
    return NextResponse.json({ error: err?.message ?? 'Internal server error' }, { status: 500 })
  }
}
