'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Crown, BedDouble, Calendar,
  Users, Moon, Globe, CreditCard, Star,
  Phone, Mail, MapPin, Building2,
  XCircle, LogIn, LogOut,
  Receipt, MessageSquare, Pencil, CheckCircle, Clock
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useBooking, updateBookingStatus } from '@/lib/hooks/useBookings'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils/formatters'
import { vipColors } from '@/lib/constants/colors'
import BookingStatusBadge from '@/components/bookings/BookingStatusBadge'
import { cn } from '@/lib/utils/cn'

export default function BookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = parseInt(params.id as string)
  const { booking, loading } = useBooking(bookingId)
  const [actionLoading, setActionLoading] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)

  // ── Confirm pending booking + trigger email ────────────────────────────
  const handleConfirmBooking = async () => {
    if (!booking) return
    setConfirmLoading(true)
    try {
      const res = await fetch('/api/bookings/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.booking_id }),
      })

      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error ?? 'Failed to confirm booking')
        return
      }

      if (result.emailSent) {
        toast.success('Booking confirmed & confirmation email sent to guest!')
      } else {
        toast.success('Booking confirmed! (Email skipped — check Resend dashboard)')
      }

      window.location.reload()
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setConfirmLoading(false)
    }
  }

  // ── Other status changes ───────────────────────────────────────────────
  const handleStatusChange = async (newStatus: string) => {
    if (!booking) return
    setActionLoading(true)
    try {
      const roomIds = booking.booking_rooms.map(br => br.room_id)
      await updateBookingStatus(booking.booking_id, newStatus, roomIds)
      toast.success(`Booking ${newStatus.replace('_', ' ')} successfully`)
      window.location.reload()
    } catch {
      toast.error('Failed to update booking status')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 w-64 bg-slate-100 rounded-xl animate-pulse" />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 h-96 bg-white rounded-2xl animate-pulse" />
          <div className="h-96 bg-white rounded-2xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Booking not found</p>
        <Link href="/bookings" className="text-azure-600 hover:underline mt-2 block">Back to bookings</Link>
      </div>
    )
  }

  const vip = vipColors[booking.guest?.vip_status as keyof typeof vipColors] ?? vipColors.none
  const bookingTotalPay = Number(booking.total_amount ?? 0)
  const rawPaid         = Number(booking.paid_amount ?? 0)
  const paidDisplay     = bookingTotalPay > 0 ? Math.min(rawPaid, bookingTotalPay) : rawPaid
  const balanceLeft     = Math.max(0, bookingTotalPay - paidDisplay)

  // Match both legacy 'pending' and current 'pending_approval'
  const isPending =
    booking.booking_status === 'pending_approval' ||
    booking.booking_status === 'pending'

  return (
    <div className="space-y-6 pb-8">

      {/* ── Pending review banner ──────────────────────────────────────── */}
      {isPending && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-2xl px-5 py-4"
          style={{ background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', border: '1px solid #fde68a' }}
        >
          <div className="relative flex-shrink-0">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-800">This booking is awaiting your confirmation</p>
            <p className="text-xs text-amber-600 mt-0.5">
              The guest has been shown a holding page and told to expect a confirmation email.
              Click <strong>Confirm &amp; Send Email</strong> to approve and automatically send their confirmation to <strong>{booking.guest?.email}</strong>.
            </p>
          </div>
        </motion.div>
      )}

      {/* ── Header ────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex items-center gap-4">
          <Link href="/bookings" className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{booking.confirmation_no}</h1>
              <BookingStatusBadge status={booking.booking_status} size="lg" />
            </div>
            <p className="text-slate-500 mt-0.5">Created {formatDateTime(booking.created_at)}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 flex-wrap">

          {/* ── CONFIRM BOOKING (pending → confirmed + email) ── */}
          {isPending && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleConfirmBooking}
              disabled={confirmLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold shadow-sm transition-all disabled:opacity-70"
              style={{ background: 'linear-gradient(135deg, #D4722A, #e8943a)', boxShadow: '0 4px 14px rgba(212,114,42,0.35)' }}
            >
              {confirmLoading ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Confirming…
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Confirm &amp; Send Email
                </>
              )}
            </motion.button>
          )}

          {/* Cancel (available for pending and confirmed) */}
          {(isPending || booking.booking_status === 'confirmed') && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleStatusChange('cancelled')}
              disabled={actionLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-50 text-rose-600 font-semibold border border-rose-200 hover:bg-rose-100 transition-all disabled:opacity-70"
            >
              <XCircle className="w-4 h-4" />
              Cancel
            </motion.button>
          )}

          {/* Check In (confirmed only) */}
          {booking.booking_status === 'confirmed' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleStatusChange('checked_in')}
              disabled={actionLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-semibold shadow-sm hover:bg-emerald-600 transition-all disabled:opacity-70"
            >
              <LogIn className="w-4 h-4" />
              Check In
            </motion.button>
          )}

          {/* Check Out */}
          {booking.booking_status === 'checked_in' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleStatusChange('checked_out')}
              disabled={actionLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-azure text-white font-semibold shadow-azure hover:opacity-90 transition-all disabled:opacity-70"
            >
              <LogOut className="w-4 h-4" />
              Check Out
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* ── Main grid ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Guest Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
            <h2 className="font-bold text-slate-900 text-lg mb-5 flex items-center gap-2">
              <Users className="w-5 h-5 text-azure-500" /> Guest Information
            </h2>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl gradient-azure flex items-center justify-center flex-shrink-0 shadow-azure">
                <span className="text-white text-xl font-bold">{booking.guest?.first_name?.[0]}{booking.guest?.last_name?.[0]}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-xl font-bold text-slate-900">{booking.guest?.first_name} {booking.guest?.last_name}</h3>
                  {booking.guest?.vip_status !== 'none' && (
                    <span className={cn('flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border', vip.bg, vip.text, vip.border)}>
                      <Crown className="w-3.5 h-3.5" /> {booking.guest?.vip_status?.toUpperCase()} Member
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600"><Mail className="w-4 h-4 text-slate-400" />{booking.guest?.email}</div>
                  <div className="flex items-center gap-2 text-sm text-slate-600"><Phone className="w-4 h-4 text-slate-400" />{booking.guest?.phone}</div>
                  <div className="flex items-center gap-2 text-sm text-slate-600"><MapPin className="w-4 h-4 text-slate-400" />{booking.guest?.nationality ?? 'N/A'}</div>
                  <div className="flex items-center gap-2 text-sm text-slate-600"><Star className="w-4 h-4 text-gold-400" />{booking.loyalty_points_earned} points earned</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stay Details */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
            <h2 className="font-bold text-slate-900 text-lg mb-5 flex items-center gap-2">
              <BedDouble className="w-5 h-5 text-azure-500" /> Stay Details
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Check In',  value: formatDate(booking.check_in_date),  icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                { label: 'Check Out', value: formatDate(booking.check_out_date), icon: Calendar, color: 'text-rose-500',    bg: 'bg-rose-50'    },
                { label: 'Nights',    value: String(booking.total_nights),       icon: Moon,     color: 'text-azure-500',   bg: 'bg-azure-50'   },
                { label: 'Guests',    value: `${booking.adults} Adults${booking.children > 0 ? ` + ${booking.children} Children` : ''}`, icon: Users, color: 'text-violet-500', bg: 'bg-violet-50' },
              ].map(item => (
                <div key={item.label} className={`${item.bg} rounded-xl p-4`}>
                  <item.icon className={`w-5 h-5 ${item.color} mb-2`} />
                  <p className="text-xs text-slate-500 mb-0.5">{item.label}</p>
                  <p className="font-bold text-slate-900 text-sm">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {booking.booking_rooms.map((br, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-azure-100 flex items-center justify-center">
                      <BedDouble className="w-5 h-5 text-azure-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">Room {br.room?.room_number}</p>
                      <p className="text-xs text-slate-500">{br.room_type?.type_name} · Floor {br.room?.floor_number}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{formatCurrency(br.rate_per_night)}</p>
                    <p className="text-xs text-slate-400">per night</p>
                  </div>
                </div>
              ))}
            </div>
            {booking.special_requests && (
              <div className="mt-4 p-4 rounded-xl bg-gold-50 border border-gold-100">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-gold-600" />
                  <p className="text-sm font-semibold text-gold-800">Special Requests</p>
                </div>
                <p className="text-sm text-gold-700">{booking.special_requests}</p>
              </div>
            )}
          </motion.div>

          {/* Hotel Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
            <h2 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-azure-500" /> Property
            </h2>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl gradient-azure flex items-center justify-center shadow-azure">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-lg">{booking.hotel?.hotel_name}</p>
                <p className="text-slate-500 text-sm">{booking.hotel?.hotel_code}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right column */}
        <div className="space-y-6">

          {/* Payment Summary */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
            <h2 className="font-bold text-slate-900 text-lg mb-5 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-azure-500" /> Payment Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Room charges</span>
                <span className="font-semibold text-slate-800">{formatCurrency(booking.total_amount - booking.tax_amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Tax (16%)</span>
                <span className="font-semibold text-slate-800">{formatCurrency(booking.tax_amount)}</span>
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between">
                <span className="font-bold text-slate-900">Total</span>
                <span className="font-bold text-xl text-slate-900">{formatCurrency(booking.total_amount)}</span>
              </div>
              {bookingTotalPay > 0 && (
                <>
                  <div className="flex justify-between text-sm pt-2">
                    <span className="text-slate-500">Collected</span>
                    <span className="font-semibold text-emerald-700">{formatCurrency(paidDisplay)}</span>
                  </div>
                  {balanceLeft > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Balance due</span>
                      <span className="font-semibold text-amber-700">{formatCurrency(balanceLeft)}</span>
                    </div>
                  )}
                </>
              )}
            </div>
            {booking.rate_plan && (
              <div className="mt-4 p-3 rounded-xl bg-azure-50 border border-azure-100">
                <p className="text-xs text-azure-600 font-semibold mb-0.5">Rate Plan</p>
                <p className="text-sm font-bold text-azure-800">{booking.rate_plan.plan_name}</p>
                <p className="text-xs text-azure-600 capitalize">{booking.rate_plan.meal_plan?.replace('_', ' ')}</p>
              </div>
            )}
          </motion.div>

          {/* Booking Source */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
            <h2 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-azure-500" /> Booking Source
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Channel</span>
                <span className="font-semibold text-slate-800">{booking.channel?.channel_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Type</span>
                <span className="font-semibold text-slate-800 capitalize">{booking.channel?.channel_type?.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Source</span>
                <span className="font-semibold text-slate-800 capitalize">{booking.booking_source}</span>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
            <h2 className="font-bold text-slate-900 text-lg mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link href={`/bookings/${booking.booking_id}/edit`} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors text-left group">
                <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center"><Pencil className="w-4 h-4 text-violet-600" /></div>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">Edit Booking</span>
              </Link>
              <Link href={`/bookings/${booking.booking_id}/payment`} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors text-left group">
                <div className="w-8 h-8 rounded-lg bg-gold-50 flex items-center justify-center"><CreditCard className="w-4 h-4 text-gold-600" /></div>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">Add Payment</span>
              </Link>
              <Link href={`/guests/${booking.guest?.guest_id}`} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors text-left group">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center"><Users className="w-4 h-4 text-emerald-600" /></div>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">Guest Profile</span>
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}