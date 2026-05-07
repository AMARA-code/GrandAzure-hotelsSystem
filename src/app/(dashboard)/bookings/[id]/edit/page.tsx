'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useBooking } from '@/lib/hooks/useBookings'
import { formatCurrency } from '@/lib/utils/formatters'

export default function EditBookingPage() {
  const params  = useParams()
  const router  = useRouter()
  const id      = parseInt(params.id as string)
  const { booking, loading } = useBooking(id)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    check_in_date:    '',
    check_out_date:   '',
    adults:           '1',
    children:         '0',
    special_requests: '',
    booking_status:   'confirmed',
  })

  useEffect(() => {
    if (booking) {
      setForm({
        check_in_date:    booking.check_in_date,
        check_out_date:   booking.check_out_date,
        adults:           String(booking.adults),
        children:         String(booking.children),
        special_requests: booking.special_requests ?? '',
        booking_status:   booking.booking_status,
      })
    }
  }, [booking])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const supabase = createClient()

      const checkIn  = form.check_in_date ? new Date(form.check_in_date) : null
      const checkOut = form.check_out_date ? new Date(form.check_out_date) : null
      const nights   = checkIn && checkOut
        ? Math.max(0, Math.ceil(
            (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
          ))
        : booking?.total_nights ?? 1

      if (nights <= 0) {
        toast.error('Check-out must be after check-in')
        setSaving(false)
        return
      }

      const ratePerNight = booking?.booking_rooms?.[0]?.rate_per_night ?? 15000
      const subtotal     = ratePerNight * nights
      const tax          = Math.round(subtotal * 0.16)
      const total        = subtotal + tax

      const { error } = await supabase
        .from('bookings')
        .update({
          check_in_date:    form.check_in_date,
          check_out_date:   form.check_out_date,
          adults:           parseInt(form.adults),
          children:         parseInt(form.children),
          total_nights:     nights,
          total_amount:     total,
          tax_amount:       tax,
          booking_status:   form.booking_status,
          special_requests: form.special_requests || null,
        })
        .eq('booking_id', id)

      if (error) throw error

      toast.success('Booking updated successfully!')
      router.push(`/bookings/${id}`)
    } catch (err: any) {
      console.error(err)
      toast.error(err.message ?? 'Failed to update booking')
    } finally {
      setSaving(false)
    }
  }

  // Price preview calculation — safe with empty dates
  const checkIn      = form.check_in_date ? new Date(form.check_in_date) : null
  const checkOut     = form.check_out_date ? new Date(form.check_out_date) : null
  const nights       = checkIn && checkOut
    ? Math.max(0, Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
      ))
    : booking?.total_nights ?? 0
  const ratePerNight = booking?.booking_rooms?.[0]?.rate_per_night ?? 15000
  const subtotal     = ratePerNight * nights
  const tax          = Math.round(subtotal * 0.16)
  const total        = subtotal + tax

  const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-azure-500 focus:border-transparent focus:bg-white transition-all"
  const labelClass = "block text-sm font-semibold text-slate-700 mb-2"

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="h-12 w-64 bg-slate-100 rounded-xl animate-pulse" />
        <div className="h-96 bg-white rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Booking not found</p>
        <Link href="/bookings" className="text-azure-600 hover:underline mt-2 block">
          Back to bookings
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8 max-w-3xl mx-auto">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Link
          href={`/bookings/${id}`}
          className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Booking</h1>
          <p className="text-slate-500 mt-0.5">
            {booking.confirmation_no} — {booking.guest?.first_name} {booking.guest?.last_name}
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSave}
          className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-card p-8 space-y-6"
        >

          {/* Guest — Read Only */}
          <div>
            <h2 className="font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Guest
            </h2>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-xl gradient-azure flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">
                  {booking.guest?.first_name?.[0]}{booking.guest?.last_name?.[0]}
                </span>
              </div>
              <div>
                <p className="font-semibold text-slate-800">
                  {booking.guest?.first_name} {booking.guest?.last_name}
                </p>
                <p className="text-xs text-slate-400">{booking.guest?.email}</p>
              </div>
              <span className="ml-auto text-xs text-slate-400 bg-slate-200 px-2 py-1 rounded-lg">
                Read only
              </span>
            </div>
          </div>

          {/* Stay Dates */}
          <div>
            <h2 className="font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Stay Dates
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Check In</label>
                <input
                  type="date"
                  value={form.check_in_date}
                  onChange={e => setForm(f => ({ ...f, check_in_date: e.target.value }))}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Check Out</label>
                <input
                  type="date"
                  value={form.check_out_date}
                  onChange={e => setForm(f => ({ ...f, check_out_date: e.target.value }))}
                  className={inputClass}
                  required
                />
              </div>
            </div>
          </div>

          {/* Guest Count */}
          <div>
            <h2 className="font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Guest Count
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Adults</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={form.adults}
                  onChange={e => setForm(f => ({ ...f, adults: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Children</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={form.children}
                  onChange={e => setForm(f => ({ ...f, children: e.target.value }))}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <h2 className="font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Booking Status
            </h2>
            <select
              value={form.booking_status}
              onChange={e => setForm(f => ({ ...f, booking_status: e.target.value }))}
              className={inputClass}
            >
              <option value="confirmed">Confirmed</option>
              <option value="checked_in">Checked In</option>
              <option value="checked_out">Checked Out</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>
          </div>

          {/* Special Requests */}
          <div>
            <h2 className="font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Special Requests
            </h2>
            <textarea
              value={form.special_requests}
              onChange={e => setForm(f => ({ ...f, special_requests: e.target.value }))}
              placeholder="Any special requests or notes..."
              rows={3}
              className={inputClass}
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href={`/bookings/${id}`}
              className="px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all"
            >
              Cancel
            </Link>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3 rounded-xl gradient-azure text-white font-semibold shadow-azure hover:opacity-90 transition-all disabled:opacity-70"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </motion.button>
          </div>
        </motion.form>

        {/* Price Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {/* Price Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
            <h3 className="font-bold text-slate-900 mb-4">Price Preview</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Rate per night</span>
                <span className="font-semibold text-slate-800">
                  {formatCurrency(ratePerNight)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Nights</span>
                <span className="font-semibold text-slate-800">
                  {nights > 0 ? nights : '—'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-semibold text-slate-800">
                  {nights > 0 ? formatCurrency(subtotal) : '—'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Tax (16%)</span>
                <span className="font-semibold text-slate-800">
                  {nights > 0 ? formatCurrency(tax) : '—'}
                </span>
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between">
                <span className="font-bold text-slate-900">Total</span>
                <span className="font-bold text-lg text-azure-600">
                  {nights > 0 ? formatCurrency(total) : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Hotel Info */}
          <div className="bg-azure-50 rounded-2xl border border-azure-100 p-5">
            <p className="text-xs font-semibold text-azure-600 mb-1">Property</p>
            <p className="font-bold text-azure-900">{booking.hotel?.hotel_name}</p>
            <p className="text-xs text-azure-600 mt-1">{booking.hotel?.hotel_code}</p>
          </div>

          {/* Room Info */}
          {booking.booking_rooms?.[0] && (
            <div className="bg-violet-50 rounded-2xl border border-violet-100 p-5">
              <p className="text-xs font-semibold text-violet-600 mb-1">Room</p>
              <p className="font-bold text-violet-900">
                Room {booking.booking_rooms[0].room?.room_number}
              </p>
              <p className="text-xs text-violet-600 mt-1">
                {booking.booking_rooms[0].room_type?.type_name}
              </p>
              <p className="text-xs text-violet-600">
                Floor {booking.booking_rooms[0].room?.floor_number}
              </p>
            </div>
          )}

          {/* Current Booking Info */}
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5">
            <p className="text-xs font-semibold text-slate-500 mb-2">Current Booking</p>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Original total</span>
                <span className="font-semibold text-slate-700">
                  {formatCurrency(booking.total_amount)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Original nights</span>
                <span className="font-semibold text-slate-700">
                  {booking.total_nights}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}