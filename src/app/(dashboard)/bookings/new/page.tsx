'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, CalendarCheck } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export default function NewBookingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    hotel_id:       '1',
    guest_id:       '',
    channel_id:     '1',
    rate_plan_id:   '1',
    check_in_date:  '',
    check_out_date: '',
    adults:         '1',
    children:       '0',
    special_requests: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      const checkIn  = new Date(form.check_in_date)
      const checkOut = new Date(form.check_out_date)
      const nights   = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (nights <= 0) {
        toast.error('Check-out must be after check-in')
        return
      }

      if (!form.guest_id) {
        toast.error('Please enter a Guest ID')
        return
      }

      // Generate confirmation number
      const confNo = `GAZ-2026-${String(Date.now()).slice(-6)}`

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          hotel_id:        parseInt(form.hotel_id),
          guest_id:        parseInt(form.guest_id),
          channel_id:      parseInt(form.channel_id),
          rate_plan_id:    parseInt(form.rate_plan_id),
          confirmation_no: confNo,
          booking_status:  'confirmed',
          booking_source:  'online',
          check_in_date:   form.check_in_date,
          check_out_date:  form.check_out_date,
          adults:          parseInt(form.adults),
          children:        parseInt(form.children),
          total_nights:    nights,
          total_amount:    0,
          tax_amount:      0,
          loyalty_points_earned: 0,
          special_requests: form.special_requests || null,
        })
        .select()
        .single()

      if (error) throw error

      toast.success(`Booking ${confNo} created successfully!`)
      router.push(`/bookings/${data.booking_id}`)
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to create booking')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-azure-500 focus:border-transparent focus:bg-white transition-all"
  const labelClass = "block text-sm font-semibold text-slate-700 mb-2"

  return (
    <div className="space-y-6 pb-8 max-w-3xl mx-auto">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Link
          href="/bookings"
          className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">New Booking</h1>
          <p className="text-slate-500 mt-0.5">Create a new reservation</p>
        </div>
      </motion.div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-slate-100 shadow-card p-8 space-y-6"
      >
        {/* Property & Guest */}
        <div>
          <h2 className="font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
            Property & Guest
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Hotel</label>
              <select
                value={form.hotel_id}
                onChange={e => setForm(f => ({ ...f, hotel_id: e.target.value }))}
                className={inputClass}
              >
                <option value="1">Grand Azure Karachi</option>
                <option value="2">Grand Azure Lahore</option>
                <option value="3">Azure Boutique Islamabad</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Guest ID</label>
              <input
                type="number"
                placeholder="Enter guest ID (1-20)"
                value={form.guest_id}
                onChange={e => setForm(f => ({ ...f, guest_id: e.target.value }))}
                className={inputClass}
                required
              />
            </div>
          </div>
        </div>

        {/* Dates */}
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

        {/* Guests & Channel */}
        <div>
          <h2 className="font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
            Guests & Source
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            <div>
              <label className={labelClass}>Channel</label>
              <select
                value={form.channel_id}
                onChange={e => setForm(f => ({ ...f, channel_id: e.target.value }))}
                className={inputClass}
              >
                <option value="1">Direct Website</option>
                <option value="2">Booking.com</option>
                <option value="3">Expedia</option>
                <option value="4">Agoda</option>
                <option value="5">Corporate</option>
                <option value="6">Walk-in</option>
                <option value="7">Phone</option>
                <option value="8">Travel Agent</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Rate Plan</label>
              <select
                value={form.rate_plan_id}
                onChange={e => setForm(f => ({ ...f, rate_plan_id: e.target.value }))}
                className={inputClass}
              >
                <option value="1">Bed & Breakfast</option>
                <option value="2">Room Only Flexible</option>
                <option value="3">Non-Refundable</option>
              </select>
            </div>
          </div>
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

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/bookings"
            className="px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all"
          >
            Cancel
          </Link>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 rounded-xl gradient-azure text-white font-semibold shadow-azure hover:opacity-90 transition-all disabled:opacity-70"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CalendarCheck className="w-4 h-4" />
                Create Booking
              </>
            )}
          </motion.button>
        </div>
      </motion.form>
    </div>
  )
}