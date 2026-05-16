'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, CalendarCheck } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils/formatters'

function localTodayYMD(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

type HotelRow = {
  hotel_id: number
  hotel_name: string
  city: string | null
}

type RoomTypeRow = {
  room_type_id: number
  hotel_id: number
  type_name: string
  type_category: string
  base_price: number | string
  max_occupancy: number | null
}

type RatePlanRow = {
  rate_plan_id: number
  plan_name: string
  hotel_id: number
}

type ChannelRow = {
  channel_id: number
  channel_name: string
}

// ─── IMPORTANT ────────────────────────────────────────────────────────────────
// Run this in Supabase SQL Editor to find your real channels table name:
//   SELECT table_name FROM information_schema.tables
//   WHERE table_schema = 'public' AND table_name ILIKE '%channel%';
//
// Then update CHANNELS_TABLE below to match, e.g. 'sales_channels'
// ──────────────────────────────────────────────────────────────────────────────
const CHANNELS_TABLE = 'channels' // confirmed table name

// Fallback used only if the channels table cannot be queried
const FALLBACK_CHANNELS: ChannelRow[] = [
  { channel_id: 1, channel_name: 'Direct Website' },
  { channel_id: 2, channel_name: 'Booking.com' },
  { channel_id: 3, channel_name: 'Expedia' },
  { channel_id: 4, channel_name: 'Agoda' },
  { channel_id: 5, channel_name: 'Corporate' },
  { channel_id: 6, channel_name: 'Walk-in' },
  { channel_id: 7, channel_name: 'Phone' },
  { channel_id: 8, channel_name: 'Travel Agent' },
]

export default function NewBookingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [hotels, setHotels] = useState<HotelRow[]>([])
  const [roomTypes, setRoomTypes] = useState<RoomTypeRow[]>([])
  const [ratePlans, setRatePlans] = useState<RatePlanRow[]>([])
  const [channels, setChannels] = useState<ChannelRow[]>(FALLBACK_CHANNELS)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const [form, setForm] = useState({
    hotel_id:            '1',
    guest_email:         '',
    guest_phone:         '',
    guest_first_name:    '',
    guest_last_name:     '',
    guest_date_of_birth: '',
    guest_gender:        '',
    guest_nationality:   '',
    guest_passport_no:   '',
    guest_national_id:   '',
    guest_address:       '',
    guest_city:          '',
    guest_country:       '',
    room_type_id:        '',
    channel_id:          String(FALLBACK_CHANNELS[0].channel_id),
    rate_plan_id:        '',
    check_in_date:       '',
    check_out_date:      '',
    adults:              '1',
    children:            '0',
    special_requests:    '',
  })

  const todayYMD = useMemo(() => localTodayYMD(), [])

  const checkoutMin = useMemo(() => {
    if (!form.check_in_date) return todayYMD
    const [y, m, d] = form.check_in_date.split('-').map(Number)
    const next = new Date(y, m - 1, d + 1)
    return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`
  }, [form.check_in_date, todayYMD])

  const categoryOptions = useMemo(() =>
    Array.from(new Set(roomTypes.map((r) => r.type_category).filter(Boolean))).sort()
  , [roomTypes])

  const filteredRoomTypes = useMemo(() =>
    categoryFilter === 'all' ? roomTypes : roomTypes.filter((r) => r.type_category === categoryFilter)
  , [roomTypes, categoryFilter])

  const nightsCount = useMemo(() => {
    if (!form.check_in_date || !form.check_out_date) return 0
    const ci = new Date(form.check_in_date + 'T12:00:00')
    const co = new Date(form.check_out_date + 'T12:00:00')
    return Math.ceil((co.getTime() - ci.getTime()) / (1000 * 60 * 60 * 24))
  }, [form.check_in_date, form.check_out_date])

  const selectedRoomType = useMemo(() => {
    if (!form.room_type_id) return null
    return roomTypes.find((r) => r.room_type_id === parseInt(form.room_type_id, 10)) ?? null
  }, [form.room_type_id, roomTypes])

  const priceBreakdown = useMemo(() => {
    if (!selectedRoomType || nightsCount <= 0) return { subtotal: 0, tax: 0, total: 0, ratePerNight: 0 }
    const ratePerNight = Number(selectedRoomType.base_price)
    const subtotal = ratePerNight * nightsCount
    const tax = Math.round(subtotal * 0.16)
    return { subtotal, tax, total: subtotal + tax, ratePerNight }
  }, [selectedRoomType, nightsCount])

  // Load channels from DB — gracefully falls back to FALLBACK_CHANNELS if table is missing
  useEffect(() => {
    const loadChannels = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from(CHANNELS_TABLE as any)
        .select('channel_id, channel_name')
        .eq('is_active', true)
        .order('channel_id')

      if (error) {
        console.warn(
          `[NewBooking] Could not load channels from "${CHANNELS_TABLE}":`,
          error.message,
          '— using fallback list. Run: SELECT table_name FROM information_schema.tables WHERE table_name ILIKE \'%channel%\'; to find the real table name, then update CHANNELS_TABLE.'
        )
        return // keep FALLBACK_CHANNELS
      }

      if (data && data.length > 0) {
        const rows = data as ChannelRow[]
        setChannels(rows)
        setForm((f) => ({ ...f, channel_id: String(rows[0].channel_id) }))
      }
    }
    loadChannels()
  }, [])

  // Load hotels
  useEffect(() => {
    const loadHotels = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('hotels')
        .select('hotel_id, hotel_name, city')
        .eq('is_deleted', false)
        .order('hotel_id')

      if (error) {
        console.error('[NewBooking] hotels load error:', error)
        toast.error('Could not load properties')
        setCatalogLoading(false)
        return
      }

      const rows = (data ?? []) as HotelRow[]
      setHotels(rows)
      if (rows.length && !rows.some((h) => String(h.hotel_id) === form.hotel_id)) {
        setForm((f) => ({ ...f, hotel_id: String(rows[0].hotel_id) }))
      }
      setCatalogLoading(false)
    }
    loadHotels()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load room types + rate plans for selected hotel
  const loadPropertyCatalog = useCallback(async (hotelId: number) => {
    const supabase = createClient()
    setCatalogLoading(true)
    try {
      const [rtRes, rpRes] = await Promise.all([
        supabase
          .from('room_types')
          .select('room_type_id, hotel_id, type_name, type_category, base_price, max_occupancy')
          .eq('hotel_id', hotelId)
          .order('type_name'),
        supabase
          .from('room_rate_plans')
          .select('rate_plan_id, plan_name, hotel_id')
          .eq('hotel_id', hotelId)
          .eq('is_active', true)
          .order('rate_plan_id'),
      ])

      if (rtRes.error) throw rtRes.error
      if (rpRes.error) throw rpRes.error

      const rt = (rtRes.data ?? []) as RoomTypeRow[]
      const rp = (rpRes.data ?? []) as RatePlanRow[]
      setRoomTypes(rt)
      setRatePlans(rp)
      setForm((f) => ({
        ...f,
        room_type_id: '',
        rate_plan_id: rp[0] ? String(rp[0].rate_plan_id) : '',
      }))
      setCategoryFilter('all')
    } catch (e: any) {
      console.error('[NewBooking] catalog load error:', e)
      toast.error('Could not load room types or rate plans for this property')
      setRoomTypes([])
      setRatePlans([])
    } finally {
      setCatalogLoading(false)
    }
  }, [])

  useEffect(() => {
    const hid = parseInt(form.hotel_id, 10)
    if (Number.isNaN(hid)) return
    loadPropertyCatalog(hid)
  }, [form.hotel_id, loadPropertyCatalog])

  // Auto-fill guest details from email
  const loadGuestByEmail = useCallback(async () => {
    const email = form.guest_email.trim().toLowerCase()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return
    const supabase = createClient()
    const { data } = await supabase
      .from('guests')
      .select('first_name, last_name, phone, date_of_birth, gender, nationality, passport_no, national_id, address_line1, city, country')
      .eq('email', email)
      .maybeSingle()
    if (data) {
      setForm((f) => ({
        ...f,
        guest_first_name:    data.first_name ?? '',
        guest_last_name:     data.last_name ?? '',
        guest_phone:         data.phone && data.phone !== '+92-000-0000000' ? (data.phone as string) : f.guest_phone,
        guest_date_of_birth: data.date_of_birth ?? '',
        guest_gender:        data.gender ?? '',
        guest_nationality:   data.nationality ?? '',
        guest_passport_no:   data.passport_no ?? '',
        guest_national_id:   data.national_id ?? '',
        guest_address:       data.address_line1 ?? '',
        guest_city:          data.city ?? '',
        guest_country:       data.country ?? '',
      }))
      toast.success('Existing guest profile loaded')
    }
  }, [form.guest_email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.guest_first_name.trim() || !form.guest_last_name.trim()) {
      toast.error('Enter the guest first and last name'); return
    }
    const emailNorm = form.guest_email.trim().toLowerCase()
    if (!emailNorm || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
      toast.error('Enter a valid guest email'); return
    }
    if (!form.room_type_id || !selectedRoomType) {
      toast.error('Select a room type for this property'); return
    }
    if (!form.rate_plan_id) {
      toast.error('No active rate plan — add one in the database or pick another property'); return
    }
    if (!form.channel_id) {
      toast.error('No booking channel selected'); return
    }
    if (!form.check_in_date) {
      toast.error('Select a check-in date'); return
    }
    if (!form.check_out_date) {
      toast.error('Select a check-out date'); return
    }
    if (form.check_in_date < todayYMD) {
      toast.error('Check-in must be today or a future date'); return
    }
    if (form.check_out_date <= form.check_in_date) {
      toast.error('Check-out must be after check-in'); return
    }

    const checkIn  = new Date(form.check_in_date + 'T12:00:00')
    const checkOut = new Date(form.check_out_date + 'T12:00:00')
    const nights   = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    if (nights <= 0) { toast.error('Check-out must be after check-in'); return }

    const maxOcc = selectedRoomType.max_occupancy != null ? Number(selectedRoomType.max_occupancy) : null
    const party  = parseInt(form.adults, 10) + parseInt(form.children, 10)
    if (maxOcc != null && party > maxOcc) {
      toast.error(`This room type allows at most ${maxOcc} guests`); return
    }

    const hotelIdNum = parseInt(form.hotel_id, 10)
    if (selectedRoomType.hotel_id !== hotelIdNum) {
      toast.error('Selected room type does not belong to this property'); return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      // Guest upsert
      const { data: existingGuest, error: guestLookupError } = await supabase
        .from('guests')
        .select('guest_id')
        .eq('email', emailNorm)
        .maybeSingle()

      if (guestLookupError) throw guestLookupError

      let guestIdNum: number
      const phoneVal = form.guest_phone.trim() || '+92-000-0000000'

      const guestDetails: Record<string, string> = {}
      if (form.guest_date_of_birth) guestDetails.date_of_birth = form.guest_date_of_birth
      if (form.guest_gender)        guestDetails.gender         = form.guest_gender
      if (form.guest_nationality)   guestDetails.nationality    = form.guest_nationality
      if (form.guest_passport_no)   guestDetails.passport_no    = form.guest_passport_no
      if (form.guest_national_id)   guestDetails.national_id    = form.guest_national_id
      if (form.guest_address)       guestDetails.address_line1  = form.guest_address
      if (form.guest_city)          guestDetails.city           = form.guest_city
      if (form.guest_country)       guestDetails.country        = form.guest_country

      if (existingGuest?.guest_id != null) {
        guestIdNum = existingGuest.guest_id
        const { error: updErr } = await supabase
          .from('guests')
          .update({
            first_name: form.guest_first_name.trim(),
            last_name:  form.guest_last_name.trim(),
            ...(form.guest_phone.trim() ? { phone: form.guest_phone.trim() } : {}),
            ...guestDetails,
          })
          .eq('guest_id', guestIdNum)
        if (updErr) throw updErr
      } else {
        const { data: inserted, error: insErr } = await supabase
          .from('guests')
          .insert({
            first_name:       form.guest_first_name.trim(),
            last_name:        form.guest_last_name.trim(),
            email:            emailNorm,
            phone:            phoneVal,
            vip_status:       'none',
            marketing_opt_in: false,
            ...guestDetails,
          })
          .select('guest_id')
          .single()
        if (insErr || !inserted) throw insErr ?? new Error('Could not create guest profile')
        guestIdNum = inserted.guest_id
      }

      // Booking insert
      const ratePerNight  = Number(selectedRoomType.base_price)
      const subtotal      = ratePerNight * nights
      const taxAmount     = Math.round(subtotal * 0.16)
      const totalAmount   = subtotal + taxAmount
      const loyaltyEarned = Math.floor(totalAmount / 1000)
      const confNo        = `GAZ-2026-${String(Date.now()).slice(-6)}`

      const bookingPayload = {
        hotel_id:              hotelIdNum,
        guest_id:              guestIdNum,
        channel_id:            parseInt(form.channel_id, 10),
        rate_plan_id:          parseInt(form.rate_plan_id, 10),
        confirmation_no:       confNo,
        booking_status:        'confirmed' as const,
        booking_source:        'online' as const,
        check_in_date:         form.check_in_date,
        check_out_date:        form.check_out_date,
        adults:                parseInt(form.adults, 10),
        children:              parseInt(form.children, 10),
        total_nights:          nights,
        total_amount:          totalAmount,
        tax_amount:            taxAmount,
        loyalty_points_earned: loyaltyEarned,
        special_requests:      form.special_requests || null,
      }

      // Log payload so you can inspect it in the browser console
      console.log('[NewBooking] inserting payload →', bookingPayload)

      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingPayload)
        .select()
        .single()

      if (error) {
        // Surface every part of the Supabase error so you can diagnose immediately
        const detail = [
          error.code    ? `code: ${error.code}`     : null,
          error.message ? error.message              : null,
          error.details ? `details: ${error.details}` : null,
          error.hint    ? `hint: ${error.hint}`      : null,
        ].filter(Boolean).join(' | ')

        console.error('[NewBooking] bookings insert failed:', error)
        throw new Error(detail || 'Booking insert failed — check browser console for full error object')
      }

      // Room assignment (best-effort — non-fatal if no room available)
      const { data: availableRoom } = await supabase
        .from('rooms')
        .select('room_id')
        .eq('hotel_id', hotelIdNum)
        .eq('room_type_id', selectedRoomType.room_type_id)
        .eq('status', 'available')
        .limit(1)
        .maybeSingle()

      if (availableRoom) {
        const { error: brErr } = await supabase.from('booking_rooms').insert({
          booking_id:       data.booking_id,
          room_id:          availableRoom.room_id,
          room_type_id:     selectedRoomType.room_type_id,
          rate_per_night:   ratePerNight,
          extra_bed:        false,
          extra_bed_charge: 0,
        })
        if (brErr) console.error('[NewBooking] booking_rooms insert error:', brErr)
      } else {
        toast.info('Booking saved. Assign a room from Rooms when one is available.')
      }

      toast.success(`Booking ${confNo} created (${formatCurrency(totalAmount)} total)`)
      router.push(`/bookings/${data.booking_id}`)

    } catch (err: any) {
      const msg = err?.message ?? 'Failed to create booking'
      console.error('[NewBooking] caught error:', err)
      toast.error(msg, { duration: 8000 }) // 8s so you can read the full error
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-azure-500 focus:border-transparent focus:bg-white transition-all"
  const labelClass = "block text-sm font-semibold text-slate-700 mb-2"

  return (
    <div className="space-y-6 pb-8 max-w-3xl mx-auto">

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
          <p className="text-slate-500 mt-0.5">Create a new reservation — room charges from database rates</p>
        </div>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-slate-100 shadow-card p-8 space-y-6"
      >

        {/* Property */}
        <div>
          <h2 className="font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Property</h2>
          <div>
            <label className={labelClass}>Property (hotel)</label>
            <select
              value={form.hotel_id}
              onChange={(e) => setForm((f) => ({ ...f, hotel_id: e.target.value }))}
              className={inputClass}
              disabled={!hotels.length}
            >
              {hotels.map((h) => (
                <option key={h.hotel_id} value={String(h.hotel_id)}>
                  {h.hotel_name}{h.city ? ` · ${h.city}` : ''}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">Room types and rates load for the selected property.</p>
          </div>
        </div>

        {/* Guest Basic Info */}
        <div>
          <h2 className="font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Guest — Basic Info</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Email <span className="text-rose-500">*</span></label>
              <input
                type="email" autoComplete="email" placeholder="guest@email.com"
                value={form.guest_email}
                onChange={(e) => setForm((f) => ({ ...f, guest_email: e.target.value }))}
                onBlur={loadGuestByEmail}
                className={inputClass}
              />
              <p className="text-xs text-slate-400 mt-1">Tab away to auto-load existing guest</p>
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input
                type="tel" autoComplete="tel" placeholder="+92 300 1234567"
                value={form.guest_phone}
                onChange={(e) => setForm((f) => ({ ...f, guest_phone: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>First Name <span className="text-rose-500">*</span></label>
              <input
                type="text" autoComplete="given-name" placeholder="First name"
                value={form.guest_first_name}
                onChange={(e) => setForm((f) => ({ ...f, guest_first_name: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Last Name <span className="text-rose-500">*</span></label>
              <input
                type="text" autoComplete="family-name" placeholder="Last name"
                value={form.guest_last_name}
                onChange={(e) => setForm((f) => ({ ...f, guest_last_name: e.target.value }))}
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

        {/* Guest Identity */}
        <div>
          <h2 className="font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Guest — Identity & Address</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nationality</label>
              <input type="text" placeholder="e.g. Pakistani" value={form.guest_nationality}
                onChange={(e) => setForm((f) => ({ ...f, guest_nationality: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Passport No.</label>
              <input type="text" placeholder="Passport number" value={form.guest_passport_no}
                onChange={(e) => setForm((f) => ({ ...f, guest_passport_no: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>National ID (CNIC)</label>
              <input type="text" placeholder="e.g. 35202-1234567-1" value={form.guest_national_id}
                onChange={(e) => setForm((f) => ({ ...f, guest_national_id: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>City</label>
              <input type="text" placeholder="e.g. Lahore" value={form.guest_city}
                onChange={(e) => setForm((f) => ({ ...f, guest_city: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Country</label>
              <input type="text" placeholder="e.g. Pakistan" value={form.guest_country}
                onChange={(e) => setForm((f) => ({ ...f, guest_country: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Address</label>
              <input type="text" placeholder="Street address (optional)" value={form.guest_address}
                onChange={(e) => setForm((f) => ({ ...f, guest_address: e.target.value }))} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Room Type & Rate Plan */}
        <div>
          <h2 className="font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Room Type & Rate Plan</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Room Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setForm((f) => ({ ...f, room_type_id: '' })) }}
                className={inputClass}
                disabled={catalogLoading || !roomTypes.length}
              >
                <option value="all">All categories</option>
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Rate Plan <span className="text-rose-500">*</span></label>
              <select
                value={form.rate_plan_id}
                onChange={(e) => setForm((f) => ({ ...f, rate_plan_id: e.target.value }))}
                className={inputClass}
                disabled={catalogLoading || !ratePlans.length}
              >
                {ratePlans.length === 0
                  ? <option value="">No active plans — check database</option>
                  : ratePlans.map((rp) => (
                      <option key={rp.rate_plan_id} value={String(rp.rate_plan_id)}>{rp.plan_name}</option>
                    ))
                }
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Room Type <span className="text-rose-500">*</span></label>
              <select
                value={form.room_type_id}
                onChange={(e) => setForm((f) => ({ ...f, room_type_id: e.target.value }))}
                className={inputClass}
                disabled={catalogLoading || !filteredRoomTypes.length}
              >
                <option value="">
                  {catalogLoading ? 'Loading…' : filteredRoomTypes.length ? 'Select room type' : 'No room types for this property'}
                </option>
                {filteredRoomTypes.map((rt) => (
                  <option key={rt.room_type_id} value={String(rt.room_type_id)}>
                    {rt.type_name} · {formatCurrency(Number(rt.base_price))}/night · {(rt.type_category ?? '').replace(/_/g, ' ') || '—'}
                  </option>
                ))}
              </select>
              {selectedRoomType?.max_occupancy != null && (
                <p className="text-xs text-slate-500 mt-1">Max occupancy: {selectedRoomType.max_occupancy} guests</p>
              )}
            </div>
          </div>
        </div>

        {/* Stay Dates */}
        <div>
          <h2 className="font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Stay Dates</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Check In <span className="text-rose-500">*</span></label>
              <input
                type="date" min={todayYMD} value={form.check_in_date}
                onChange={(e) => setForm((f) => {
                  const nextIn  = e.target.value
                  const nextOut = f.check_out_date && f.check_out_date <= nextIn ? '' : f.check_out_date
                  return { ...f, check_in_date: nextIn, check_out_date: nextOut }
                })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Check Out <span className="text-rose-500">*</span></label>
              <input
                type="date" min={checkoutMin} value={form.check_out_date}
                onChange={(e) => setForm((f) => ({ ...f, check_out_date: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Charges: nightly rate × nights + 16% tax (computed automatically).</p>
        </div>

        {/* Price Preview */}
        {nightsCount > 0 && selectedRoomType && (
          <div className="rounded-2xl border border-azure-100 bg-azure-50/80 p-5">
            <h3 className="font-bold text-azure-900 text-sm mb-3">Estimated Charges</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-azure-700/90">{formatCurrency(priceBreakdown.ratePerNight)} × {nightsCount} night{nightsCount !== 1 ? 's' : ''}</span>
                <span className="font-semibold text-azure-900">{formatCurrency(priceBreakdown.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-azure-700/90">Tax (16%)</span>
                <span className="font-semibold text-azure-900">{formatCurrency(priceBreakdown.tax)}</span>
              </div>
              <div className="flex justify-between border-t border-azure-200/80 pt-2">
                <span className="font-bold text-azure-900">Total</span>
                <span className="font-bold text-lg text-azure-900">{formatCurrency(priceBreakdown.total)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Guests & Source */}
        <div>
          <h2 className="font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Guests & Source</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>Adults</label>
              <input type="number" min="1" max="10" value={form.adults}
                onChange={(e) => setForm((f) => ({ ...f, adults: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Children</label>
              <input type="number" min="0" max="10" value={form.children}
                onChange={(e) => setForm((f) => ({ ...f, children: e.target.value }))} className={inputClass} />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Channel</label>
              <select
                value={form.channel_id}
                onChange={(e) => setForm((f) => ({ ...f, channel_id: e.target.value }))}
                className={inputClass}
              >
                {channels.map((ch) => (
                  <option key={ch.channel_id} value={String(ch.channel_id)}>{ch.channel_name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Special Requests */}
        <div>
          <h2 className="font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Special Requests</h2>
          <textarea
            value={form.special_requests}
            onChange={(e) => setForm((f) => ({ ...f, special_requests: e.target.value }))}
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
            disabled={loading || catalogLoading}
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