'use client'

import { useMemo, useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarDays, Filter, Hotel, Sparkles, Users, X, Building2, BedDouble, ChevronDown, Check } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/formatters'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

type HotelType = {
  hotel_id: number
  hotel_name: string
  city: string
}

type RoomType = {
  room_type_id: number
  hotel_id: number
  type_name: string
  type_category: string
  description: string
  max_occupancy: number
  base_price: number | string
  view_type: string
}

type SeasonalType = {
  pricing_id: number
  hotel_id: number
  season_name: string
  start_date: string
  end_date: string
  price_per_night: number | string
}

type RatePlanType = {
  rate_plan_id: number
  hotel_id: number
  plan_name: string
  is_active: boolean
}

const roomImageMap: Record<string, string> = {
  'Standard Room': '/images/rooms/standard-room.jpg',
  'Deluxe Sea View': '/images/rooms/deluxe-sea-view.jpg',
  'Executive Suite': '/images/rooms/executive-suite.jpg',
  'Presidential Suite': '/images/rooms/presidential-suite.jpg',
  'Deluxe Garden View': '/images/rooms/deluxe-garden-view.jpg',
  'Honeymoon Suite': '/images/rooms/honeymoon-suite.jpg',
  'Margalla View Deluxe': '/images/rooms/margalla-view-deluxe.jpg',
}

export default function BookExperience({
  hotels,
  roomTypes,
  seasonalPricing,
  ratePlans,
  userEmail,
  isAuthenticated,
}: {
  hotels: HotelType[]
  roomTypes: RoomType[]
  seasonalPricing: SeasonalType[]
  ratePlans: RatePlanType[]
  userEmail: string | null
  isAuthenticated: boolean
}) {
  const router = useRouter()
  const [selectedHotel, setSelectedHotel] = useState<number | 'all'>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null)
  const [loading, setLoading] = useState(false)
  const [bookingForm, setBookingForm] = useState({
    checkIn: '',
    checkOut: '',
    adults: '2',
    children: '0',
    specialRequests: '',
  })

  const hotelMap = useMemo(() => new Map(hotels.map((hotel) => [hotel.hotel_id, hotel])), [hotels])
  const categories = useMemo(() => Array.from(new Set(roomTypes.map((room) => room.type_category))), [roomTypes])

  const filteredRooms = useMemo(() => {
    return roomTypes.filter((room) => {
      const byHotel = selectedHotel === 'all' || room.hotel_id === selectedHotel
      const byCategory = selectedCategory === 'all' || room.type_category === selectedCategory
      return byHotel && byCategory
    })
  }, [roomTypes, selectedHotel, selectedCategory])

  const minNightlyRate = useMemo(() => {
    if (!filteredRooms.length) return 0
    return Math.min(...filteredRooms.map((room) => Number(room.base_price)))
  }, [filteredRooms])

  const activeOffers = useMemo(() => seasonalPricing.slice(0, 4), [seasonalPricing])

  const bookingTicker = [
    'Free welcome drink on arrival',
    'Early check-in subject to availability',
    'Late check-out priority for direct bookings',
    'Flexible seasonal plans',
    'Best rate guarantee',
    'Loyalty points on every stay',
  ]

  const submitBooking = async () => {
    if (!selectedRoom) return
    if (!isAuthenticated || !userEmail) {
      toast.error('Please sign in first to complete booking.')
      router.push('/login')
      return
    }

    const checkIn = new Date(bookingForm.checkIn)
    const checkOut = new Date(bookingForm.checkOut)
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))

    if (!bookingForm.checkIn || !bookingForm.checkOut || nights <= 0) {
      toast.error('Please select valid check-in and check-out dates.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      let { data: guest } = await supabase
        .from('guests')
        .select('guest_id')
        .eq('email', userEmail)
        .maybeSingle()

      if (!guest) {
        const { data: newGuest, error: guestInsertError } = await supabase
          .from('guests')
          .insert({
            first_name: 'Guest',
            last_name: 'User',
            email: userEmail,
            phone: '+92-000-0000000',
            vip_status: 'none',
            marketing_opt_in: true,
          })
          .select('guest_id')
          .single()

        if (guestInsertError || !newGuest) {
          toast.error('Could not create guest profile.')
          return
        }
        guest = newGuest
      }

      const ratePlan = ratePlans.find((plan) => plan.hotel_id === selectedRoom.hotel_id) ?? ratePlans[0]
      if (!ratePlan) {
        toast.error('No active rate plan found.')
        return
      }

      const subtotal = Number(selectedRoom.base_price) * nights
      const taxAmount = Math.round(subtotal * 0.16)
      const totalAmount = subtotal + taxAmount
      const confirmationNo = `GAZ-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`

      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          hotel_id: selectedRoom.hotel_id,
          guest_id: guest.guest_id,
          channel_id: 1,
          rate_plan_id: ratePlan.rate_plan_id,
          confirmation_no: confirmationNo,
          booking_status: 'confirmed',
          booking_source: 'online',
          check_in_date: bookingForm.checkIn,
          check_out_date: bookingForm.checkOut,
          adults: Number(bookingForm.adults),
          children: Number(bookingForm.children),
          total_nights: nights,
          total_amount: totalAmount,
          tax_amount: taxAmount,
          loyalty_points_earned: Math.floor(totalAmount / 1000),
          special_requests: bookingForm.specialRequests || null,
        })
        .select('booking_id')
        .single()

      if (bookingError || !booking) {
        toast.error(bookingError?.message ?? 'Booking failed.')
        return
      }

      const { data: availableRoom } = await supabase
        .from('rooms')
        .select('room_id')
        .eq('hotel_id', selectedRoom.hotel_id)
        .eq('room_type_id', selectedRoom.room_type_id)
        .eq('status', 'available')
        .limit(1)
        .maybeSingle()

      if (availableRoom) {
        await supabase.from('booking_rooms').insert({
          booking_id: booking.booking_id,
          room_id: availableRoom.room_id,
          room_type_id: selectedRoom.room_type_id,
          rate_per_night: Number(selectedRoom.base_price),
          extra_bed: false,
          extra_bed_charge: 0,
        })
      }

      toast.success(`Booking confirmed (${confirmationNo})`)
      setSelectedRoom(null)
      setBookingForm({ checkIn: '', checkOut: '', adults: '2', children: '0', specialRequests: '' })
      router.push('/my-account')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  const [openDropdown, setOpenDropdown] = useState<'hotel' | 'category' | null>(null)

  return (
    <div className="relative space-y-6">
      {/* Ambient blob */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-56 w-[88%] rounded-[3rem] bg-gradient-to-r from-amber-100/45 via-orange-100/45 to-orange-50/45 blur-3xl" />

      {/* ── TICKER ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-xl border border-[#e8d2b8]/70 bg-[#fdf6ee]" style={{ height: 36 }}>
        {/* left/right fade masks */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#fdf6ee] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#fdf6ee] to-transparent" />

        <motion.div
          className="absolute inset-y-0 flex w-max items-center whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 28, ease: 'linear', repeat: Infinity }}
        >
          {[...bookingTicker, ...bookingTicker].map((item, idx) => (
            <span
              key={`${item}-${idx}`}
              className="inline-flex items-center gap-2 px-7 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8b5a3c]"
            >
              {/* thin amber rule */}
              <span className="h-3 w-px bg-[#D4722A]/30" />
              <Sparkles className="h-2.5 w-2.5 flex-shrink-0" style={{ color: '#D4722A' }} />
              {item}
            </span>
          ))}
        </motion.div>
      </div>

      {/* ── COMMAND BAR  (filters + live stats in one unified strip) ───── */}
      <div
        className="relative overflow-hidden rounded-2xl border border-[#e8d2b8]"
        style={{
          background: 'linear-gradient(135deg, #fffcf8 0%, #fff8f0 50%, #fffcf8 100%)',
          boxShadow: '0 1px 3px rgba(139,90,60,0.08), 0 8px 24px rgba(139,90,60,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
        }}
      >
        {/* subtle grain texture overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'1\'/%3E%3C/svg%3E")', backgroundSize: '128px 128px' }}
        />

        <div className="relative flex flex-col divide-y divide-[#ead8c4]/60 lg:flex-row lg:divide-x lg:divide-y-0">

          {/* ── Hotel selector ── */}
          <div className="relative flex min-w-0 flex-1 items-center gap-3 px-5 py-4">
            <div
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
              style={{ background: 'linear-gradient(135deg, #fff2e7, #ffe4cc)', border: '1px solid #f0c8a8' }}
            >
              <Building2 className="h-3.5 w-3.5" style={{ color: '#D4722A' }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#b07a56]">Property</p>
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'hotel' ? null : 'hotel')}
                className="flex w-full items-center justify-between gap-2 bg-transparent text-left text-sm font-semibold text-[#3f2f22] outline-none"
              >
                <span className="truncate">
                  {selectedHotel === 'all' ? 'All Properties' : hotelMap.get(selectedHotel as number)?.hotel_name ?? 'All Properties'}
                </span>
                <motion.span animate={{ rotate: openDropdown === 'hotel' ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="h-3.5 w-3.5 flex-shrink-0" style={{ color: '#D4722A' }} />
                </motion.span>
              </button>
            </div>

            <AnimatePresence>
              {openDropdown === 'hotel' && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.97 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute left-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-[#e8d2b8]"
                  style={{
                    background: 'linear-gradient(160deg, #fffdf9 0%, #fff8f0 100%)',
                    boxShadow: '0 4px 6px rgba(139,90,60,0.05), 0 16px 48px rgba(139,90,60,0.14), 0 0 0 1px rgba(255,255,255,0.6) inset',
                  }}
                >
                  {/* Panel header */}
                  <div className="flex items-center gap-2 border-b border-[#ead8c4]/70 px-4 py-3">
                    <Building2 className="h-3.5 w-3.5 flex-shrink-0" style={{ color: '#D4722A' }} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b07a56]">Select Property</span>
                  </div>

                  <div className="py-1.5">
                    {/* All Properties option */}
                    <button
                      type="button"
                      onClick={() => { setSelectedHotel('all'); setOpenDropdown(null) }}
                      className="group flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors duration-100 hover:bg-[#fff2e7]"
                    >
                      <span
                        className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border transition-all"
                        style={
                          selectedHotel === 'all'
                            ? { background: '#D4722A', borderColor: '#D4722A' }
                            : { background: 'transparent', borderColor: '#e0c8b0' }
                        }
                      >
                        {selectedHotel === 'all' && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#3f2f22]">All Properties</p>
                        <p className="text-[11px] text-[#b07a56]">{hotels.length} hotels</p>
                      </div>
                    </button>

                    {/* Divider */}
                    <div className="mx-4 my-1 border-t border-[#ead8c4]/50" />

                    {hotels.map((hotel) => (
                      <button
                        key={hotel.hotel_id}
                        type="button"
                        onClick={() => { setSelectedHotel(hotel.hotel_id); setOpenDropdown(null) }}
                        className="group flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors duration-100 hover:bg-[#fff2e7]"
                      >
                        <span
                          className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border transition-all"
                          style={
                            selectedHotel === hotel.hotel_id
                              ? { background: '#D4722A', borderColor: '#D4722A' }
                              : { background: 'transparent', borderColor: '#e0c8b0' }
                          }
                        >
                          {selectedHotel === hotel.hotel_id && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-[#3f2f22]">{hotel.hotel_name}</p>
                          <p className="text-[11px] text-[#b07a56]">{hotel.city}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* thin amber divider accent on lg */}
          <div className="hidden lg:block" style={{ width: 1, background: 'linear-gradient(to bottom, transparent, #e0c4a8, transparent)' }} />

          {/* ── Room category selector ── */}
          <div className="group flex min-w-0 flex-1 items-center gap-3 px-5 py-4">
            <div
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
              style={{ background: 'linear-gradient(135deg, #fff2e7, #ffe4cc)', border: '1px solid #f0c8a8' }}
            >
              <BedDouble className="h-3.5 w-3.5" style={{ color: '#D4722A' }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#b07a56]">Room Category</p>
              <div className="relative">
                <select
                  className="w-full appearance-none bg-transparent text-sm font-semibold text-[#3f2f22] outline-none"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#D4722A]/60" />
              </div>
            </div>
          </div>

          {/* ── Stats row ── rendered inline on the same bar, right-aligned ── */}
          <div className="flex divide-x divide-[#ead8c4]/60 lg:ml-auto">
            {/* Matching rooms */}
            <motion.div
              key={`rooms-${filteredRooms.length}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center px-6 py-4"
            >
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#b07a56]">Rooms</p>
              <p className="mt-0.5 text-2xl font-bold leading-none text-[#3f2f22]">{filteredRooms.length}</p>
            </motion.div>

            {/* From per night */}
            <motion.div
              key={`rate-${minNightlyRate}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center px-6 py-4"
            >
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#b07a56]">From / Night</p>
              <p className="mt-0.5 text-xl font-bold leading-none" style={{ color: '#D4722A' }}>{formatCurrency(minNightlyRate)}</p>
            </motion.div>

            {/* Booking status — pill */}
            <div className="flex flex-col items-center justify-center px-6 py-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#b07a56]">Status</p>
              <span
                className="mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                style={
                  selectedRoom
                    ? { background: '#fff2e7', color: '#D4722A', border: '1px solid #f0c8a8' }
                    : { background: '#f5f0eb', color: '#8b5a3c', border: '1px solid #e8d2b8' }
                }
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: selectedRoom ? '#D4722A' : '#b07a56' }}
                />
                {selectedRoom ? 'Selected' : 'Browsing'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── ROOM CARDS ──────────────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredRooms.map((room, index) => (
          <motion.div
            key={room.room_type_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            whileHover={{ y: -10, rotateX: 4, rotateY: -4 }}
            className="group overflow-hidden rounded-3xl border border-[#efdecb] bg-gradient-to-b from-white to-[#fdf8f2] shadow-premium-lg"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="relative h-52 overflow-hidden">
              <Image
                src={roomImageMap[room.type_name] ?? '/images/placeholders/room-placeholder.jpg'}
                alt={room.type_name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                className="object-cover transition duration-500 group-hover:scale-110"
                priority={index < 2}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <p className="absolute left-3 top-3 rounded-full border border-white/60 bg-white/85 px-3 py-1 text-xs font-semibold text-stone-700">{hotelMap.get(room.hotel_id)?.city}</p>
              <p className="absolute bottom-3 right-3 rounded-full px-3 py-1 text-xs font-semibold text-white shadow-md" style={{ background: '#D4722A' }}>{formatCurrency(Number(room.base_price))}</p>
            </div>
            <div className="space-y-3 p-5">
              <p className="text-xs uppercase tracking-wider" style={{ color: '#D4722A' }}>{room.type_category}</p>
              <h3 className="text-xl font-semibold text-stone-900">{room.type_name}</h3>
              <p className="line-clamp-2 text-sm text-stone-600">{room.description}</p>
              <div className="flex items-center justify-between text-sm text-stone-500">
                <span className="inline-flex items-center gap-1">
                  <Users className="h-4 w-4" style={{ color: '#D4722A' }} /> {room.max_occupancy} Guests
                </span>
                <span className="inline-flex items-center gap-1">
                  <Hotel className="h-4 w-4" style={{ color: '#D4722A' }} /> {hotelMap.get(room.hotel_id)?.hotel_name}
                </span>
              </div>
              <motion.button
                onClick={() => setSelectedRoom(room)}
                whileHover={{ y: -2, scale: 1.03, x: 2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 rounded-full border border-[#f0c8a8] bg-[#fff2e7] px-4 py-2 text-sm font-semibold text-[#D4722A] shadow-sm transition-all hover:border-[#e2a77d] hover:bg-[#ffe7d3]"
              >
                Book This Room
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── SEASONAL OFFERS + WHY BOOK DIRECT ──────────────────────────── */}
      <div className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-3xl border border-[#efdecb] bg-gradient-to-b from-white to-[#fdf8f2] p-6 shadow-premium">
          <h3 className="font-display text-xl font-bold text-stone-900">Seasonal Offers</h3>
          <div className="mt-4 space-y-3">
            {activeOffers.map((offer) => (
              <div key={offer.pricing_id} className="rounded-2xl border border-[#f0d9c0] p-3" style={{ background: 'linear-gradient(to right, #fff6ed, #ffffff)' }}>
                <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide" style={{ color: '#D4722A' }}>
                  <Sparkles className="h-3 w-3" /> {offer.season_name}
                </p>
                <p className="mt-1 text-sm font-semibold text-stone-900">{hotelMap.get(offer.hotel_id)?.hotel_name}</p>
                <p className="text-xs text-stone-500">{offer.start_date} to {offer.end_date}</p>
                <p className="mt-1 text-sm font-bold" style={{ color: '#D4722A' }}>{formatCurrency(Number(offer.price_per_night))}/night</p>
              </div>
            ))}
          </div>
          <p className="mt-4 inline-flex items-center gap-2 text-xs text-stone-500"><Filter className="h-3 w-3" /> Rates update dynamically by season and plan.</p>
        </div>

        <div className="rounded-3xl border border-[#efdecb] bg-gradient-to-b from-white to-[#fdf8f2] p-6 shadow-premium">
          <h3 className="font-display text-xl font-bold text-stone-900">Why Book Direct</h3>
          <p className="mt-2 text-sm text-stone-600">Unlock premium perks with direct booking at Grand Azure Hotel Group.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl p-4" style={{ border: '1px solid #f0c8a8', background: '#fff2e7' }}>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#D4722A' }}>Best PKR Rate</p>
              <p className="mt-1 text-sm text-stone-700">Exclusive direct discounts and flexible plans.</p>
            </div>
            <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Priority Upgrade</p>
              <p className="mt-1 text-sm text-stone-700">Early upgrade consideration for direct guests.</p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Fast Check-in</p>
              <p className="mt-1 text-sm text-stone-700">Express arrival desk for confirmed online bookings.</p>
            </div>
            <div className="rounded-2xl border border-[#f0c8a8] bg-[#fff6ed] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#D4722A' }}>Loyalty Benefits</p>
              <p className="mt-1 text-sm text-stone-700">Earn and redeem points on every eligible stay.</p>
            </div>
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-[#ead8c4]">
            <div className="relative h-44 w-full">
              <Image
                src="/images/hotels/karachi-pool.jpg"
                alt="Grand Azure luxury experience"
                fill
                sizes="(max-width: 1280px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── BOOKING MODAL ───────────────────────────────────────────────── */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/45 p-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl rounded-3xl border border-[#efdecb] bg-gradient-to-b from-white to-[#fdf8f2] p-6 shadow-premium-lg"
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="font-display text-2xl font-bold text-stone-900">{selectedRoom.type_name}</h3>
                <p className="text-sm text-stone-600">{hotelMap.get(selectedRoom.hotel_id)?.hotel_name}</p>
              </div>
              <button onClick={() => setSelectedRoom(null)} className="rounded-xl border border-[#ead8c4] p-2 text-stone-500">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="font-medium text-stone-700">Check-in</span>
                <input type="date" className="w-full rounded-xl border border-[#e7d6c3] bg-[#fffdf9] px-3 py-2" value={bookingForm.checkIn} onChange={(e) => setBookingForm((prev) => ({ ...prev, checkIn: e.target.value }))} />
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-medium text-stone-700">Check-out</span>
                <input type="date" className="w-full rounded-xl border border-[#e7d6c3] bg-[#fffdf9] px-3 py-2" value={bookingForm.checkOut} onChange={(e) => setBookingForm((prev) => ({ ...prev, checkOut: e.target.value }))} />
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-medium text-stone-700">Adults</span>
                <input type="number" min={1} max={6} className="w-full rounded-xl border border-[#e7d6c3] bg-[#fffdf9] px-3 py-2" value={bookingForm.adults} onChange={(e) => setBookingForm((prev) => ({ ...prev, adults: e.target.value }))} />
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-medium text-stone-700">Children</span>
                <input type="number" min={0} max={4} className="w-full rounded-xl border border-[#e7d6c3] bg-[#fffdf9] px-3 py-2" value={bookingForm.children} onChange={(e) => setBookingForm((prev) => ({ ...prev, children: e.target.value }))} />
              </label>
              <label className="space-y-2 text-sm sm:col-span-2">
                <span className="font-medium text-stone-700">Special Requests</span>
                <textarea rows={3} className="w-full rounded-xl border border-[#e7d6c3] bg-[#fffdf9] px-3 py-2" value={bookingForm.specialRequests} onChange={(e) => setBookingForm((prev) => ({ ...prev, specialRequests: e.target.value }))} />
              </label>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <p className="text-sm font-semibold" style={{ color: '#D4722A' }}>{formatCurrency(Number(selectedRoom.base_price))}/night</p>
              <button
                disabled={loading}
                onClick={submitBooking}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white disabled:opacity-70 transition-all hover:opacity-90"
                style={{ background: '#D4722A', boxShadow: '0 4px 14px rgba(212,114,42,0.4)' }}
              >
                <CalendarDays className="h-4 w-4" /> {loading ? 'Processing...' : 'Confirm Booking'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}