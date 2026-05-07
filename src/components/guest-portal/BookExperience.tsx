'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, Filter, Hotel, Sparkles, Users, X, Building2, BedDouble } from 'lucide-react'
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

  return (
    <div className="relative space-y-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-56 w-[88%] rounded-[3rem] bg-gradient-to-r from-violet-100/45 via-orange-100/45 to-sky-100/45 blur-3xl" />

      <div className="overflow-hidden rounded-2xl border border-[#ead8c4] bg-[#fff6ed] py-2 shadow-sm">
        <motion.div
          className="flex w-max whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 24, ease: 'linear', repeat: Infinity }}
        >
          {[...bookingTicker, ...bookingTicker].map((item, idx) => (
            <span key={`${item}-${idx}`} className="inline-flex items-center gap-2 px-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b5a3c]">
              <Sparkles className="h-3.5 w-3.5 text-[#d4722a]" />
              {item}
            </span>
          ))}
        </motion.div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <motion.label
          whileHover={{ y: -6, rotateX: 3, rotateY: -3 }}
          transition={{ duration: 0.2 }}
          className="group relative overflow-hidden rounded-2xl border border-[#e8d9c8] bg-gradient-to-br from-[#fffdfa] via-[#fff8f2] to-[#f6f0ff] p-4 shadow-premium"
          style={{ transformStyle: 'preserve-3d', perspective: 900 }}
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-azure-200 bg-azure-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-azure-700">
            <Building2 className="h-3.5 w-3.5" />
            Choose Property
          </div>
          <p className="mb-2 text-sm font-semibold text-[#564637]">Hotel</p>
          <select
            className="w-full rounded-xl border border-[#d8e7ff] bg-white/90 px-3 py-2.5 text-sm shadow-sm outline-none transition-all duration-200 focus:border-azure-400 focus:ring-2 focus:ring-azure-200 group-hover:border-azure-300"
            value={selectedHotel}
            onChange={(e) => setSelectedHotel(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          >
            <option value="all">All Hotels</option>
            {hotels.map((hotel) => (
              <option key={hotel.hotel_id} value={hotel.hotel_id}>{hotel.hotel_name}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-azure-200/30 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
        </motion.label>

        <motion.label
          whileHover={{ y: -6, rotateX: 3, rotateY: 3 }}
          transition={{ duration: 0.2 }}
          className="group relative overflow-hidden rounded-2xl border border-[#ecd8c4] bg-gradient-to-br from-[#fffdfa] via-[#fff8f3] to-[#fff4e8] p-4 shadow-premium"
          style={{ transformStyle: 'preserve-3d', perspective: 900 }}
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-700">
            <BedDouble className="h-3.5 w-3.5" />
            Curate Stay
          </div>
          <p className="mb-2 text-sm font-semibold text-[#564637]">Room Category</p>
          <select
            className="w-full rounded-xl border border-[#f0dfcb] bg-white/90 px-3 py-2.5 text-sm shadow-sm outline-none transition-all duration-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 group-hover:border-amber-300"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute -left-8 -bottom-8 h-24 w-24 rounded-full bg-amber-200/35 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
        </motion.label>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div
          key={`rooms-${filteredRooms.length}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-[#ead8c4] bg-white/85 px-4 py-3 shadow-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#8b5a3c]">Matching Rooms</p>
          <p className="mt-2 text-3xl font-bold text-[#3f2f22]">{filteredRooms.length}</p>
        </motion.div>
        <motion.div
          key={`rate-${minNightlyRate}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-[#ead8c4] bg-white/85 px-4 py-3 shadow-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#8b5a3c]">From Per Night</p>
          <p className="mt-2 text-3xl font-bold text-[#d4722a]">{formatCurrency(minNightlyRate)}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-[#ead8c4] bg-white/85 px-4 py-3 shadow-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#8b5a3c]">Booking Status</p>
          <p className="mt-2 text-xl font-bold text-[#3f2f22]">{selectedRoom ? 'Room Selected' : 'Awaiting Selection'}</p>
        </motion.div>
      </div>

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
              <p className="absolute bottom-3 right-3 rounded-full gradient-gold px-3 py-1 text-xs font-semibold text-white">{formatCurrency(Number(room.base_price))}</p>
            </div>
            <div className="space-y-3 p-5">
              <p className="text-xs uppercase tracking-wider text-violet-600">{room.type_category}</p>
              <h3 className="text-xl font-semibold text-stone-900">{room.type_name}</h3>
              <p className="line-clamp-2 text-sm text-stone-600">{room.description}</p>
              <div className="flex items-center justify-between text-sm text-stone-500">
                <span className="inline-flex items-center gap-1"><Users className="h-4 w-4 text-azure-500" /> {room.max_occupancy} Guests</span>
                <span className="inline-flex items-center gap-1"><Hotel className="h-4 w-4 text-gold-500" /> {hotelMap.get(room.hotel_id)?.hotel_name}</span>
              </div>
              <motion.button
                onClick={() => setSelectedRoom(room)}
                whileHover={{ y: -2, scale: 1.03, x: 2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 rounded-full border border-[#f0c8a8] bg-[#fff2e7] px-4 py-2 text-sm font-semibold text-[#b85c1f] shadow-sm transition-all hover:border-[#e2a77d] hover:bg-[#ffe7d3]"
              >
                Book This Room
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-3xl border border-[#efdecb] bg-gradient-to-b from-white to-[#fdf8f2] p-6 shadow-premium">
          <h3 className="font-display text-xl font-bold text-stone-900">Seasonal Offers</h3>
          <div className="mt-4 space-y-3">
            {activeOffers.map((offer) => (
              <div key={offer.pricing_id} className="rounded-2xl border border-amber-100 bg-gradient-to-r from-amber-50 to-white p-3">
                <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-amber-700"><Sparkles className="h-3 w-3" /> {offer.season_name}</p>
                <p className="mt-1 text-sm font-semibold text-stone-900">{hotelMap.get(offer.hotel_id)?.hotel_name}</p>
                <p className="text-xs text-stone-500">{offer.start_date} to {offer.end_date}</p>
                <p className="mt-1 text-sm font-bold text-azure-700">{formatCurrency(Number(offer.price_per_night))}/night</p>
              </div>
            ))}
          </div>
          <p className="mt-4 inline-flex items-center gap-2 text-xs text-stone-500"><Filter className="h-3 w-3" /> Rates update dynamically by season and plan.</p>
        </div>
        <div className="rounded-3xl border border-[#efdecb] bg-gradient-to-b from-white to-[#fdf8f2] p-6 shadow-premium">
          <h3 className="font-display text-xl font-bold text-stone-900">Why Book Direct</h3>
          <p className="mt-2 text-sm text-stone-600">Unlock premium perks with direct booking at Grand Azure Hotel Group.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-azure-100 bg-azure-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-azure-700">Best PKR Rate</p>
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
            <div className="rounded-2xl border border-gold-100 bg-amber-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Loyalty Benefits</p>
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
              <p className="text-sm font-semibold text-azure-700">{formatCurrency(Number(selectedRoom.base_price))}/night</p>
              <button disabled={loading} onClick={submitBooking} className="inline-flex items-center gap-2 rounded-xl gradient-azure px-5 py-3 text-sm font-semibold text-white shadow-azure disabled:opacity-70">
                <CalendarDays className="h-4 w-4" /> {loading ? 'Processing...' : 'Confirm Booking'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
