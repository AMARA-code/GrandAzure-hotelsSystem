'use client'


import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import PaymentChoice from '@/components/guest-portal/PaymentChoice'
import JazzCashPayment from '@/components/guest-portal/JazzCashPayment'
import type { Booking } from '@/types/database'

type PageStep = 'loading' | 'choice' | 'jazzcash' | 'success' | 'error'

const DISCOUNT_RATE      = 0.10
const JAZZCASH_NUMBER    = process.env.NEXT_PUBLIC_JAZZCASH_NUMBER    ?? '03001234567'
const JAZZCASH_ACCT_NAME = process.env.NEXT_PUBLIC_JAZZCASH_ACCT_NAME ?? 'Grand Azure Hotels'

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = Number(params.id)

  const [step, setStep]       = useState<PageStep>('loading')
  const [booking, setBooking] = useState<Booking | null>(null)
  const [error, setError]     = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const supabase = createClient()

  // ── Fetch booking ─────────────────────────────────────────────────
  useEffect(() => {
    if (!bookingId) { setStep('error'); setError('Invalid booking ID'); return }

    supabase
      .from('bookings')
      .select('*, guests(*), hotels(*), room_types(type_name)')
      .eq('booking_id', bookingId)
      .single()
      .then(({ data, error: err }) => {
        if (err || !data) {
          setError('Booking not found.')
          setStep('error')
          return
        }
        // If already past payment step, redirect
        if (['confirmed', 'checked_in', 'checked_out'].includes(data.booking_status)) {
          router.replace(`/bookings/${bookingId}`)
          return
        }
        setBooking(data as unknown as Booking)
        setStep('choice')
      })
  }, [bookingId]) // eslint-disable-line

  // ── Computed values ───────────────────────────────────────────────
  const totalAmount    = booking?.total_amount ?? 0
  const discountAmount = Math.round(totalAmount * DISCOUNT_RATE)
  const advanceAmount  = totalAmount - discountAmount

  // ── Handlers ─────────────────────────────────────────────────────
  const handleChoice = async (choice: 'pay_at_hotel' | 'jazzcash') => {
    if (choice === 'jazzcash') {
      // Save payment method + discount to booking, set status = pending_payment
      await supabase.from('bookings').update({
        payment_method:         'jazzcash',
        discount_applied:       true,
        discount_amount:        discountAmount,
        advance_payment_amount: advanceAmount,
        total_amount:           advanceAmount,  // update total to discounted price
        booking_status:         'pending_payment',
      }).eq('booking_id', bookingId)

      setStep('jazzcash')
    } else {
      // Pay at hotel — save and mark pending_approval immediately
      setIsSaving(true)
      await supabase.from('bookings').update({
        payment_method:   'pay_at_hotel',
        discount_applied: false,
        booking_status:   'pending_approval',
        payment_status:   'pending',
      }).eq('booking_id', bookingId)
      setIsSaving(false)
      setStep('success')
    }
  }

  const handleJazzCashSuccess = () => {
    setStep('success')
  }

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen bg-[#f8f6f1] py-12 px-4"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      {/* Subtle top bar */}
      <div className="max-w-2xl mx-auto mb-10">
        <div className="flex items-center justify-between">
          <span
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            className="text-xl font-semibold text-[#0a1628]"
          >
            Grand Azure
          </span>
          {booking && (
            <span className="text-xs text-[#8a7a60] font-mono tracking-wider">
              {booking.confirmation_no}
            </span>
          )}
        </div>
        <div className="h-px bg-[#e8e0d0] mt-4" />
      </div>

      <AnimatePresence mode="wait">

        {/* Loading */}
        {step === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-32 gap-4"
          >
            <svg className="animate-spin w-8 h-8 text-[#0a1628]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            <span className="text-sm text-[#8a7a60]">Loading your booking…</span>
          </motion.div>
        )}

        {/* Payment Choice */}
        {step === 'choice' && booking && (
          <motion.div
            key="choice"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            {/* Booking summary pill */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="bg-white border border-[#e8e0d0] rounded-xl px-5 py-4 flex flex-wrap gap-x-8 gap-y-3">
                <SummaryItem label="Hotel"      value={(booking as any).hotels?.hotel_name ?? '—'} />
                <SummaryItem label="Room"       value={(booking as any).room_types?.type_name ?? '—'} />
                <SummaryItem label="Check-In"   value={formatDate(booking.check_in_date)} />
                <SummaryItem label="Check-Out"  value={formatDate(booking.check_out_date)} />
                <SummaryItem label="Nights"     value={String(booking.total_nights)} />
                <SummaryItem label="Guests"     value={`${booking.adults}A${booking.children > 0 ? ` ${booking.children}C` : ''}`} />
              </div>
            </div>

            <PaymentChoice
              totalAmount={totalAmount}
              onChoice={handleChoice}
              isLoading={isSaving}
            />
          </motion.div>
        )}

        {/* JazzCash Upload */}
        {step === 'jazzcash' && booking && (
          <motion.div
            key="jazzcash"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <JazzCashPayment
              bookingId={bookingId}
              confirmationNo={booking.confirmation_no}
              advanceAmount={advanceAmount}
              originalAmount={totalAmount}
              discountAmount={discountAmount}
              jazzcashNumber={JAZZCASH_NUMBER}
              accountName={JAZZCASH_ACCT_NAME}
              onSuccess={handleJazzCashSuccess}
              onBack={() => setStep('choice')}
            />
          </motion.div>
        )}

        {/* Success / Awaiting confirmation */}
        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-lg mx-auto text-center"
          >
            {/* Animated check */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 220, damping: 18, delay: 0.1 }}
              className="w-20 h-20 bg-[#0a1628] rounded-full flex items-center justify-center mx-auto mb-8"
            >
              <svg className="w-10 h-10 text-[#c4a461]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>

            <h1
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              className="text-3xl font-semibold text-[#0a1628] mb-3"
            >
              {booking?.payment_method === 'jazzcash'
                ? 'Payment Proof Submitted!'
                : 'Booking Request Received!'}
            </h1>

            <p className="text-[#6b6257] text-sm leading-relaxed mb-8 max-w-sm mx-auto">
              {booking?.payment_method === 'jazzcash'
                ? 'Our team will verify your JazzCash payment within 1–2 hours. Once verified, you\'ll receive a confirmation email with your invoice.'
                : 'Your booking request has been sent to our team. We\'ll review and send your confirmation email shortly.'}
            </p>

            {/* Confirmation number */}
            {booking && (
              <div className="bg-white border border-[#e8e0d0] rounded-xl px-6 py-5 mb-8 inline-block">
                <div className="text-xs text-[#8a7a60] uppercase tracking-widest mb-1">
                  Confirmation Number
                </div>
                <div className="font-mono text-xl font-bold text-[#0a1628] tracking-wider">
                  {booking.confirmation_no}
                </div>
                <div className="text-xs text-[#8a7a60] mt-2">Keep this for your records</div>
              </div>
            )}

            {/* What happens next */}
            <div className="bg-[#f4f0e8] rounded-xl p-5 text-left mb-8">
              <div className="text-xs font-semibold text-[#8a7a60] uppercase tracking-widest mb-3">
                What happens next
              </div>
              <div className="space-y-2.5">
                {(booking?.payment_method === 'jazzcash'
                  ? [
                      'Our team reviews your JazzCash screenshot',
                      'Payment is verified (within 1–2 hours)',
                      'Confirmation email + invoice sent to you',
                      'Present your email at check-in',
                    ]
                  : [
                      'Our team reviews your booking request',
                      'Confirmation email sent to you',
                      'Pay the full amount at check-in',
                      'Present your email + valid CNIC/Passport',
                    ]
                ).map((item, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-[#4a4035]">
                    <span className="w-5 h-5 bg-[#0a1628] text-white rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => router.push('/my-account')}
              className="bg-[#0a1628] text-white px-8 py-3 rounded-xl text-sm font-medium hover:bg-[#0f2040] transition-colors"
            >
              View My Bookings
            </button>
          </motion.div>
        )}

        {/* Error */}
        {step === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-sm mx-auto text-center py-20"
          >
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-[#0a1628] mb-2">Something went wrong</h2>
            <p className="text-sm text-[#6b6257] mb-6">{error ?? 'Unable to load your booking.'}</p>
            <button
              onClick={() => router.push('/my-account')}
              className="bg-[#0a1628] text-white px-6 py-2.5 rounded-xl text-sm hover:bg-[#0f2040] transition-colors"
            >
              Back to My Account
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-PK', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] text-[#8a7a60] uppercase tracking-wider">{label}</div>
      <div className="text-sm font-medium text-[#0a1628]">{value}</div>
    </div>
  )
}