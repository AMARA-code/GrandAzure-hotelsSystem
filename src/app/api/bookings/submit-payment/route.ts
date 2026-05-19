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

    const { error: updateError } = await supabaseAdmin
      .from('bookings')
      .update({
        payment_method: 'jazzcash',
        discount_applied: true,
        discount_amount: discountAmount || null,
        advance_payment_amount: advanceAmount || null,
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

    return NextResponse.json({ success: true, screenshotUrl: storagePath })
  } catch (err: unknown) {
    console.error('[submit-payment] Unhandled error:', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
