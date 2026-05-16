'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useBooking, autoTransitionBookings } from '@/lib/hooks/useBookings'
import { formatCurrency } from '@/lib/utils/formatters'

export default function EditBookingPage() {
  const params  = useParams()
  const router  = useRouter()
  const id      = parseInt(params.id as string)
  const { booking, loading } = useBooking(id)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    // Booking fields
    check_in_date:    '',
    check_out_date:   '',
    adults:           '1',
    children:         '0',
    special_requests: '',
    booking_status:   'confirmed',
    // Guest fields
    guest_first_name:    '',
    guest_last_name:     '',
    guest_email:         '',
    guest_phone:         '',
    guest_date_of_birth: '',
    guest_gender:        '',
    guest_nationality:   '',
    guest_passport_no:   '',
    guest_national_id:   '',
    guest_address:       '',
    guest_city:          '',
    guest_country:       '',
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
        guest_first_name:    booking.guest?.first_name ?? '',
        guest_last_name:     booking.guest?.last_name ?? '',
        guest_email:         booking.guest?.email ?? '',
        guest_phone:         booking.guest?.phone ?? '',
        guest_date_of_birth: (booking.guest as any)?.date_of_birth ?? '',
        guest_gender:        (booking.guest as any)?.gender ?? '',
        guest_nationality:   (booking.guest as any)?.nationality ?? '',
        guest_passport_no:   (booking.guest as any)?.passport_no ?? '',
        guest_national_id:   (booking.guest as any)?.national_id ?? '',
        guest_address:       (booking.guest as any)?.address_line1 ?? '',
        guest_city:          (booking.guest as any)?.city ?? '',
        guest_country:       (booking.guest as any)?.country ?? '',
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

      const { data: inv } = await supabase
        .from('invoices')
        .select('paid_amount')
        .eq('booking_id', id)
        .maybeSingle()
      const collected = Number(inv?.paid_amount ?? 0)

      if (total + 0.009 < collected) {
        toast.error(
          `Booking total cannot be less than amount already collected (${formatCurrency(collected)}).`
        )
        setSaving(false)
        return
      }

      // ── Recalculate correct status based on new dates ──────────────────────
      // If staff changed dates, recompute what the status SHOULD be
      // so it stays in sync automatically — no manual status change needed.
      const today = new Date().toISOString().split('T')[0]
      let resolvedStatus = form.booking_status

      // Only auto-correct if staff hasn't manually picked a terminal status
      const terminalStatuses = ['cancelled', 'no_show']
      if (!terminalStatuses.includes(form.booking_status)) {
        if (form.check_in_date > today) {
          // Future booking → always confirmed
          resolvedStatus = 'confirmed'
        } else if (form.check_in_date <= today && form.check_out_date > today) {
          // Currently mid-stay → checked_in
          resolvedStatus = 'checked_in'
        } else if (form.check_out_date <= today) {
          // Past stay → checked_out
          resolvedStatus = 'checked_out'
        }
      }
      // ── End auto status recalculation ──────────────────────────────────────

      // Update booking
      const { error: bookingErr } = await supabase
        .from('bookings')
        .update({
          check_in_date:    form.check_in_date,
          check_out_date:   form.check_out_date,
          adults:           parseInt(form.adults),
          children:         parseInt(form.children),
          total_nights:     nights,
          total_amount:     total,
          tax_amount:       tax,
          booking_status:   resolvedStatus,
          special_requests: form.special_requests || null,
        })
        .eq('booking_id', id)

      if (bookingErr) throw bookingErr

      // Update guest profile
      if (booking?.guest?.guest_id) {
        const guestDetails: Record<string, string | null> = {
          first_name:   form.guest_first_name.trim() || null,
          last_name:    form.guest_last_name.trim() || null,
          phone:        form.guest_phone.trim() || null,
          gender:       form.guest_gender || null,
          nationality:  form.guest_nationality.trim() || null,
          passport_no:  form.guest_passport_no.trim() || null,
          national_id:  form.guest_national_id.trim() || null,
          address_line1: form.guest_address.trim() || null,
          city:         form.guest_city.trim() || null,
          country:      form.guest_country.trim() || null,
        }
        // Only include date_of_birth if set
        if (form.guest_date_of_birth) {
          (guestDetails as any).date_of_birth = form.guest_date_of_birth
        }

        const { error: guestErr } = await supabase
          .from('guests')
          .update(guestDetails)
          .eq('guest_id', booking.guest.guest_id)

        if (guestErr) throw guestErr
      }

      // ── Run auto-transition after save to sync ALL bookings & rooms ────────
      // This ensures room statuses stay accurate system-wide after any date edit
      await autoTransitionBookings()
      // ── End auto-transition ────────────────────────────────────────────────

      toast.success('Booking and guest profile updated!')
      router.push(`/bookings/${id}`)
    } catch (err: any) {
      console.error(err)
      toast.error(err.message ?? 'Failed to update booking')
    } finally {
      setSaving(false)
    }
  }

  // Price preview
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

          {/* ── Guest Basic ── */}
          <div>
            <h2 className="font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Guest — Basic Info
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>First Name</label>
                <input
                  type="text"
                  value={form.guest_first_name}
                  onChange={(e) => setForm((f) => ({ ...f, guest_first_name: e.target.value }))}
                  className={inputClass}
                  placeholder="First name"
                />
              </div>
              <div>
                <label className={labelClass}>Last Name</label>
                <input
                  type="text"
                  value={form.guest_last_name}
                  onChange={(e) => setForm((f) => ({ ...f, guest_last_name: e.target.value }))}
                  className={inputClass}
                  placeholder="Last name"
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  value={form.guest_email}
                  className={`${inputClass} opacity-60 cursor-not-allowed`}
                  readOnly
                />
                <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input
                  type="tel"
                  placeholder="+92 300 1234567"
                  value={form.guest_phone}
                  onChange={(e) => setForm((f) => ({ ...f, guest_phone: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Date of Birth</label>
                <input
                  type="date"
                  value={form.guest_date_of_birth}
                  onChange={(e) => setForm((f) => ({ ...f, guest_date_of_birth: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Gender</label>
                <select
                  value={form.guest_gender}
                  onChange={(e) => setForm((f) => ({ ...f, guest_gender: e.target.value }))}
                  className={inputClass}
                >
                  <option value="">— Select —</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Guest Identity & Address ── */}
          <div>
            <h2 className="font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Guest — Identity & Address
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nationality</label>
                <input
                  type="text"
                  placeholder="e.g. Pakistani"
                  value={form.guest_nationality}
                  onChange={(e) => setForm((f) => ({ ...f, guest_nationality: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Passport No.</label>
                <input
                  type="text"
                  placeholder="Passport number"
                  value={form.guest_passport_no}
                  onChange={(e) => setForm((f) => ({ ...f, guest_passport_no: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>National ID (CNIC)</label>
                <input
                  type="text"
                  placeholder="e.g. 35202-1234567-1"
                  value={form.guest_national_id}
                  onChange={(e) => setForm((f) => ({ ...f, guest_national_id: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>City</label>
                <input
                  type="text"
                  placeholder="e.g. Lahore"
                  value={form.guest_city}
                  onChange={(e) => setForm((f) => ({ ...f, guest_city: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Country</label>
                <input
                  type="text"
                  placeholder="e.g. Pakistan"
                  value={form.guest_country}
                  onChange={(e) => setForm((f) => ({ ...f, guest_country: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Address</label>
                <input
                  type="text"
                  placeholder="Street address"
                  value={form.guest_address}
                  onChange={(e) => setForm((f) => ({ ...f, guest_address: e.target.value }))}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* ── Stay Dates ── */}
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
                  onChange={(e) => setForm((f) => ({ ...f, check_in_date: e.target.value }))}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Check Out</label>
                <input
                  type="date"
                  value={form.check_out_date}
                  onChange={(e) => setForm((f) => ({ ...f, check_out_date: e.target.value }))}
                  className={inputClass}
                  required
                />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Status will auto-update based on the new dates when you save.
            </p>
          </div>

          {/* ── Guest Count ── */}
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
                  onChange={(e) => setForm((f) => ({ ...f, adults: e.target.value }))}
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
                  onChange={(e) => setForm((f) => ({ ...f, children: e.target.value }))}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* ── Status ── */}
          <div>
            <h2 className="font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Booking Status
            </h2>
            <select
              value={form.booking_status}
              onChange={(e) => setForm((f) => ({ ...f, booking_status: e.target.value }))}
              className={inputClass}
            >
              <option value="confirmed">Confirmed</option>
              <option value="checked_in">Checked In</option>
              <option value="checked_out">Checked Out</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>
            <p className="text-xs text-slate-400 mt-2">
              Manually override only for cancelled or no-show. Otherwise status auto-corrects based on dates.
            </p>
          </div>

          {/* ── Special Requests ── */}
          <div>
            <h2 className="font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Special Requests
            </h2>
            <textarea
              value={form.special_requests}
              onChange={(e) => setForm((f) => ({ ...f, special_requests: e.target.value }))}
              placeholder="Any special requests or notes..."
              rows={3}
              className={inputClass}
            />
          </div>

          {/* ── Buttons ── */}
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

        {/* Price Preview sidebar */}
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
                <span className="font-semibold text-slate-800">{formatCurrency(ratePerNight)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Nights</span>
                <span className="font-semibold text-slate-800">{nights > 0 ? nights : '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-semibold text-slate-800">{nights > 0 ? formatCurrency(subtotal) : '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Tax (16%)</span>
                <span className="font-semibold text-slate-800">{nights > 0 ? formatCurrency(tax) : '—'}</span>
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
                <span className="font-semibold text-slate-700">{formatCurrency(booking.total_amount)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Original nights</span>
                <span className="font-semibold text-slate-700">{booking.total_nights}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}