'use client'

/**
 * src/components/bookings/AdminPaymentVerification.tsx
 *
 * Shown inside the booking detail page in the admin panel.
 * Displays:
 *  - Payment proof screenshot (fetched as signed URL)
 *  - Sender number + transaction ID
 *  - Discount and amounts breakdown
 *  - "Verify & Confirm Booking" button → POST /api/bookings/confirm
 */

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Booking } from '@/types/database'

interface AdminPaymentVerificationProps {
  booking: Booking
  onConfirmed?: () => void   // callback to refresh parent
}

export default function AdminPaymentVerification({
  booking,
  onConfirmed,
}: AdminPaymentVerificationProps) {
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null)
  const [isLoadingUrl, setIsLoadingUrl]   = useState(false)
  const [isConfirming, setIsConfirming]   = useState(false)
  const [result, setResult]               = useState<{
    success?: boolean
    error?: string
    emailSent?: boolean
    invoiceNo?: string
  } | null>(null)

  const supabase = createClient()

  // ── Fetch signed URL for screenshot ──────────────────────────────
  useEffect(() => {
    if (!booking.jazzcash_screenshot_url) return
    setIsLoadingUrl(true)

    supabase.storage
      .from('payment-proofs')
      .createSignedUrl(booking.jazzcash_screenshot_url, 3600) // 1 hour
      .then(({ data, error }) => {
        if (!error && data?.signedUrl) setScreenshotUrl(data.signedUrl)
        setIsLoadingUrl(false)
      })
  }, [booking.jazzcash_screenshot_url])  // eslint-disable-line

  const handleConfirm = async () => {
    setIsConfirming(true)
    setResult(null)

    try {
      const res = await fetch('/api/bookings/confirm', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ bookingId: booking.booking_id }),
      })
      const data = await res.json()

      if (!res.ok) {
        setResult({ error: data.error ?? 'Failed to confirm booking' })
      } else {
        setResult({
          success:   true,
          emailSent: data.emailSent,
          invoiceNo: data.invoiceNo,
        })
        onConfirmed?.()
      }
    } catch {
      setResult({ error: 'Network error. Please try again.' })
    } finally {
      setIsConfirming(false)
    }
  }

  const isAlreadyConfirmed = booking.booking_status === 'confirmed'
  const isPendingApproval  = booking.booking_status === 'pending_approval'
  const isPendingPayment   = booking.booking_status === 'pending_payment'
  const isPending          = booking.booking_status === 'pending'
  const isJazzCash         = booking.payment_method === 'jazzcash'

  const discountAmount  = booking.discount_amount ?? 0
  const advanceAmount   = booking.advance_payment_amount ?? 0
  const totalAmount     = booking.total_amount
  const balanceDue      = Math.max(0, totalAmount - advanceAmount)

  // ── Not an advance-payment booking ───────────────────────────────
  if (!isJazzCash && booking.payment_method !== 'pay_at_hotel') {
    return null
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">

      {/* Header */}
      <div className="bg-[#0a1628] px-6 py-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-[#8a9bb5] uppercase tracking-widest">Payment Review</div>
          <div className="text-white font-semibold mt-0.5">
            {isJazzCash ? 'JazzCash Advance Payment' : 'Pay at Hotel'}
          </div>
        </div>
        <StatusBadge status={booking.booking_status} paymentStatus={booking.payment_status} />
      </div>

      <div className="p-6 space-y-6">

        {/* ── Amounts breakdown ── */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <AmountRow label="Original Amount"  value={`PKR ${(totalAmount + discountAmount).toLocaleString()}`} />
          {discountAmount > 0 && (
            <AmountRow label="10% Advance Discount" value={`− PKR ${discountAmount.toLocaleString()}`} className="text-green-600" />
          )}
          <AmountRow label="Total Payable" value={`PKR ${totalAmount.toLocaleString()}`} bold />
          {isJazzCash && (
            <>
              <div className="border-t border-gray-200 my-1" />
              <AmountRow label="Paid via JazzCash" value={`PKR ${advanceAmount.toLocaleString()}`} className="text-green-600" />
              <AmountRow
                label="Balance Due at Check-In"
                value={`PKR ${balanceDue.toLocaleString()}`}
                className={balanceDue > 0 ? 'text-red-600' : 'text-green-600'}
                bold
              />
            </>
          )}
        </div>

        {/* ── JazzCash details ── */}
        {isJazzCash && (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Guest Payment Details
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <DetailCell label="Sender Number" value={booking.jazzcash_sender_number ?? '—'} mono />
              <DetailCell label="Transaction ID" value={booking.jazzcash_transaction_id ?? 'Not provided'} mono />
            </div>

            {/* Screenshot */}
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                Payment Screenshot
              </div>
              {isLoadingUrl ? (
                <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Loading screenshot...
                  </div>
                </div>
              ) : screenshotUrl ? (
                <div className="relative rounded-lg overflow-hidden border border-gray-200 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={screenshotUrl}
                    alt="JazzCash payment proof"
                    className="w-full max-h-80 object-contain bg-gray-50"
                  />
                  <a
                    href={screenshotUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-xs text-gray-700 px-3 py-1.5 rounded-full shadow border border-gray-200 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Open full size
                  </a>
                </div>
              ) : (
                <div className="h-32 bg-gray-50 rounded-lg border border-dashed border-gray-200 flex items-center justify-center text-sm text-gray-400">
                  No screenshot uploaded yet
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Pay at Hotel info ── */}
        {!isJazzCash && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-700">
            <strong>Pay at Hotel:</strong> Guest will pay the full amount of{' '}
            <strong>PKR {totalAmount.toLocaleString()}</strong> upon check-in.
            Confirm this booking to send a confirmation email to the guest.
          </div>
        )}

        {/* ── Result banner ── */}
        {result && (
          <div
            className={`rounded-lg px-4 py-3 text-sm flex items-start gap-2
              ${result.success
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-600'
              }`}
          >
            {result.success ? (
              <>
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <div className="font-medium">Booking confirmed! Invoice {result.invoiceNo} generated.</div>
                  {result.emailSent
                    ? <div className="text-xs mt-0.5">Confirmation email sent to guest.</div>
                    : <div className="text-xs mt-0.5 text-yellow-600">⚠ Email failed — please send manually.</div>
                  }
                </div>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>{result.error}</div>
              </>
            )}
          </div>
        )}

        {/* ── Confirm button ── */}
        {!isAlreadyConfirmed && !result?.success && (isPendingApproval || isPendingPayment || isPending) && (
          <div className="space-y-3">
            {isJazzCash && !screenshotUrl && !isLoadingUrl && (
              <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                ⚠ No payment screenshot found. Verify payment via another channel before confirming.
              </div>
            )}

            <button
              onClick={handleConfirm}
              disabled={isConfirming}
              className={`
                w-full py-3.5 rounded-xl text-sm font-semibold uppercase tracking-wider transition-all
                ${isConfirming
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-[#0a1628] text-white hover:bg-[#0f2040] shadow-md cursor-pointer'
                }
              `}
            >
              {isConfirming ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Confirming & Sending Email...
                </span>
              ) : isJazzCash ? (
                '✓ Verify Payment & Confirm Booking'
              ) : (
                '✓ Confirm Booking & Send Email'
              )}
            </button>

            <p className="text-center text-xs text-gray-400">
              This will mark the booking as Confirmed and email the invoice to the guest.
            </p>
          </div>
        )}

        {isAlreadyConfirmed && (
          <div className="flex items-center justify-center gap-2 py-3 text-green-600 text-sm font-medium">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Booking already confirmed
          </div>
        )}

      </div>
    </div>
  )
}

// ── Small helper sub-components ───────────────────────────────────────────────

function StatusBadge({
  status,
  paymentStatus,
}: {
  status: string | null
  paymentStatus: string | null
}) {
  const map: Record<string, { label: string; cls: string }> = {
    pending_payment:      { label: 'Awaiting Payment',    cls: 'bg-orange-100 text-orange-700' },
    pending_approval:     { label: 'Pending Verification', cls: 'bg-yellow-100 text-yellow-700' },
    confirmed:            { label: 'Confirmed',            cls: 'bg-green-100 text-green-700' },
    pending_verification: { label: 'Proof Uploaded',       cls: 'bg-blue-100 text-blue-700' },
    verified:             { label: 'Payment Verified',     cls: 'bg-green-100 text-green-700' },
  }

  const key   = paymentStatus === 'pending_verification' ? 'pending_verification' : (status ?? '')
  const badge = map[key] ?? { label: status ?? '—', cls: 'bg-gray-100 text-gray-600' }

  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider ${badge.cls}`}>
      {badge.label}
    </span>
  )
}

function AmountRow({
  label,
  value,
  bold = false,
  className = 'text-gray-700',
}: {
  label: string
  value: string
  bold?: boolean
  className?: string
}) {
  return (
    <div className={`flex justify-between text-sm ${bold ? 'font-semibold' : ''}`}>
      <span className="text-gray-500">{label}</span>
      <span className={className}>{value}</span>
    </div>
  )
}

function DetailCell({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
      <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-sm text-gray-800 ${mono ? 'font-mono' : 'font-medium'}`}>{value}</div>
    </div>
  )
}