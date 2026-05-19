
'use client'

import { useMemo, useState, useEffect, useRef, type MouseEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarDays, Filter, Hotel, Sparkles, Users, X,
  Building2, BedDouble, ChevronDown, Check, Tag, Zap,
  Shield, Clock, ArrowLeft, Phone, Copy, CheckCircle2,
  AlertCircle, Upload, ImageIcon, ArrowRight, Loader2, DollarSign, User
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils/formatters'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

type HotelType  = { hotel_id: number; hotel_name: string; city: string }
type RoomType   = {
  room_type_id: number; hotel_id: number; type_name: string
  type_category: string; description: string; max_occupancy: number
  base_price: number | string; view_type?: string | null
}
type SeasonalType = {
  pricing_id: number; hotel_id: number; season_name: string
  start_date: string; end_date: string; price_per_night: number | string
}
type RatePlanType = { rate_plan_id: number; hotel_id: number; plan_name: string; is_active: boolean }

type ModalStep = 'form' | 'payment_choice' | 'jazzcash_instructions' | 'jazzcash_upload' | 'submitting'

const DISCOUNT_RATE = 0.10
const JAZZCASH_NUMBER   = process.env.NEXT_PUBLIC_JAZZCASH_NUMBER    ?? '03XX-XXXXXXX'
const JAZZCASH_ACCT     = process.env.NEXT_PUBLIC_JAZZCASH_ACCT_NAME ?? 'Grand Azure Hotels'

const roomImageMap: Record<string, string> = {
  'Standard Room':        '/images/rooms/standard-room.jpg',
  'Deluxe Sea View':      '/images/rooms/deluxe-sea-view.jpg',
  'Executive Suite':      '/images/rooms/executive-suite.jpg',
  'Presidential Suite':   '/images/rooms/presidential-suite.jpg',
  'Deluxe Garden View':   '/images/rooms/deluxe-garden-view.jpg',
  'Honeymoon Suite':      '/images/rooms/honeymoon-suite.jpg',
  'Margalla View Deluxe': '/images/rooms/margalla-view-deluxe.jpg',
}

function localTodayYMD(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

// â”€â”€â”€ colour tokens matching globals.css â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const C = {
  primary:    '#D4722A',
  primary100: '#fff2e7',
  primary200: '#ffe4cc',
  primary300: '#f0c8a8',
  primary400: '#e2a77d',
  border:     '#efdecb',
  borderSoft: '#e7d6c3',
  bg:         'linear-gradient(to bottom, #ffffff, #fdf8f2)',
  muted:      '#b07a56',
  text:       '#3f2f22',
  cardBg:     '#fffdf9',
}

export default function BookExperience({
  hotels, roomTypes, seasonalPricing, ratePlans, userEmail, isAuthenticated,
  showCatalog = true,
  initialRoomTypeId = null,
  onBookingModalClose,
}: {
  hotels: HotelType[]; roomTypes: RoomType[]; seasonalPricing: SeasonalType[]
  ratePlans: RatePlanType[]; userEmail: string | null; isAuthenticated: boolean
  /** When false, only the booking modal is rendered (e.g. hotel detail page). */
  showCatalog?: boolean
  /** Open the booking form for this room type (controlled by parent). */
  initialRoomTypeId?: number | null
  onBookingModalClose?: () => void
}) {
  const router = useRouter()
  const supabase = createClient()

  // â”€â”€ filter state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [selectedHotel, setSelectedHotel]     = useState<number | 'all'>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [openDropdown, setOpenDropdown]        = useState<'hotel' | 'category' | null>(null)

  // â”€â”€ room selection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null)

  // â”€â”€ form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [bookingForm, setBookingForm] = useState({
    checkIn: '', checkOut: '', adults: '2', children: '0',
    specialRequests: '', guestFirstName: '', guestLastName: '',
  })

  // â”€â”€ modal step â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [modalStep, setModalStep] = useState<ModalStep>('form')

  // â”€â”€ computed amounts (set when moving to payment_choice) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [amounts, setAmounts] = useState({ total: 0, discount: 0, advance: 0, nights: 0 })

  // â”€â”€ JazzCash upload state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [senderNumber,  setSenderNumber]  = useState('')
  const [transactionId, setTransactionId] = useState('')
  const [file,   setFile]   = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [copied, setCopied] = useState<'number' | 'amount' | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // â”€â”€ saved booking id (set after form submit, used during payment upload) â”€â”€â”€â”€
  const [pendingBookingId, setPendingBookingId] = useState<number | null>(null)
  const [pendingConfNo,    setPendingConfNo]    = useState<string>('')

  const todayYMD = useMemo(() => localTodayYMD(), [])
  const checkoutMin = useMemo(() => {
    if (!bookingForm.checkIn) return todayYMD
    const [y,m,d] = bookingForm.checkIn.split('-').map(Number)
    const next = new Date(y, m-1, d+1)
    return `${next.getFullYear()}-${String(next.getMonth()+1).padStart(2,'0')}-${String(next.getDate()).padStart(2,'0')}`
  }, [bookingForm.checkIn, todayYMD])

  const hotelMap   = useMemo(() => new Map(hotels.map(h => [h.hotel_id, h])), [hotels])
  const categories = useMemo(() => Array.from(new Set(roomTypes.map(r => r.type_category))), [roomTypes])
  const filteredRooms = useMemo(() => roomTypes.filter(r => {
    const byHotel    = selectedHotel === 'all' || r.hotel_id === selectedHotel
    const byCategory = selectedCategory === 'all' || r.type_category === selectedCategory
    return byHotel && byCategory
  }), [roomTypes, selectedHotel, selectedCategory])
  const minNightlyRate = useMemo(() =>
    filteredRooms.length ? Math.min(...filteredRooms.map(r => Number(r.base_price))) : 0
  , [filteredRooms])
  const activeOffers = useMemo(() => seasonalPricing.slice(0, 4), [seasonalPricing])

  // Open booking modal when parent passes a room type id (hotel detail page)
  useEffect(() => {
    if (!initialRoomTypeId) return
    const room = roomTypes.find(r => r.room_type_id === initialRoomTypeId)
    if (!room) return
    setSelectedHotel(room.hotel_id)
    setSelectedRoom(room)
    setModalStep('form')
  }, [initialRoomTypeId, roomTypes])

  // auto-fill guest name
  useEffect(() => {
    if (!isAuthenticated || !userEmail) return
    let cancelled = false
    supabase.from('guests').select('first_name, last_name').eq('email', userEmail).maybeSingle()
      .then(({ data }) => {
        if (cancelled || !data) return
        setBookingForm(prev => ({ ...prev, guestFirstName: data.first_name ?? '', guestLastName: data.last_name ?? '' }))
      })
    return () => { cancelled = true }
  }, [isAuthenticated, userEmail])

  // â”€â”€ helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const fmt = (n: number) => `PKR ${n.toLocaleString('en-PK')}`
  const resetModal = () => {
    setSelectedRoom(null); setModalStep('form')
    setBookingForm({ checkIn:'', checkOut:'', adults:'2', children:'0', specialRequests:'', guestFirstName:'', guestLastName:'' })
    setSenderNumber(''); setTransactionId(''); setFile(null); setPreview(null)
    setUploadError(null); setPendingBookingId(null); setPendingConfNo('')
    onBookingModalClose?.()
  }

  async function copyText(text: string, key: 'number' | 'amount') {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (!f.type.startsWith('image/')) { setUploadError('Please upload an image file.'); return }
    if (f.size > 5 * 1024 * 1024)    { setUploadError('File must be under 5 MB.'); return }
    setUploadError(null); setFile(f); setPreview(URL.createObjectURL(f))
  }

  async function createBooking(
    paymentMethod: 'jazzcash' | 'pay_at_hotel' | null
  ) {
    if (!selectedRoom) return null
    if (!isAuthenticated || !userEmail) { toast.error('Please sign in to book.'); router.push('/login'); return null }

    const checkIn  = new Date(bookingForm.checkIn)
    const checkOut = new Date(bookingForm.checkOut)
    const nights   = Math.ceil((checkOut.getTime() - checkIn.getTime()) / 86400000)

    if (!bookingForm.checkIn || !bookingForm.checkOut || nights <= 0) { toast.error('Please select valid dates.'); return null }
    if (bookingForm.checkIn < todayYMD)                              { toast.error('Check-in must be today or later.'); return null }
    if (bookingForm.checkOut <= bookingForm.checkIn)                 { toast.error('Check-out must be after check-in.'); return null }
    if (!bookingForm.guestFirstName.trim() || !bookingForm.guestLastName.trim()) { toast.error('Please enter guest name.'); return null }

    setModalStep('submitting')

    try {
      let { data: guest } = await supabase.from('guests').select('guest_id').eq('email', userEmail).maybeSingle()
      if (!guest) {
        const { data: ng, error: ge } = await supabase.from('guests').insert({
          first_name: bookingForm.guestFirstName.trim(), last_name: bookingForm.guestLastName.trim(),
          email: userEmail, phone: '+92-000-0000000', vip_status: 'none', marketing_opt_in: true,
        }).select('guest_id').single()
        if (ge || !ng) { toast.error('Could not create guest profile.'); setModalStep('form'); return null }
        guest = ng
      } else {
        await supabase.from('guests').update({
          first_name: bookingForm.guestFirstName.trim(),
          last_name: bookingForm.guestLastName.trim(),
        }).eq('guest_id', guest.guest_id)
      }

      const ratePlan = ratePlans.find(p => p.hotel_id === selectedRoom.hotel_id) ?? ratePlans[0]
      if (!ratePlan) { toast.error('No rate plan found.'); setModalStep('form'); return null }

      const subtotal     = Number(selectedRoom.base_price) * nights
      const taxAmount    = Math.round(subtotal * 0.16)
      const totalAmount  = subtotal + taxAmount
      const confirmationNo = `GAZ-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`

      const { data: booking, error: bookingError } = await supabase.from('bookings').insert({
        hotel_id: selectedRoom.hotel_id,
        guest_id: guest.guest_id,
        channel_id: 1,
        rate_plan_id: ratePlan.rate_plan_id,
        confirmation_no: confirmationNo,
        booking_status: 'pending',
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
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'pay_at_hotel' ? 'pending' : 'pending',
        discount_applied: paymentMethod === 'jazzcash',
      }).select('booking_id').single()

      if (bookingError || !booking) { toast.error(bookingError?.message ?? 'Booking failed.'); setModalStep('form'); return null }

      const { data: availableRoom } = await supabase.from('rooms').select('room_id')
        .eq('hotel_id', selectedRoom.hotel_id).eq('room_type_id', selectedRoom.room_type_id)
        .eq('status', 'available').limit(1).maybeSingle()
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

      const discountAmt = Math.round(totalAmount * DISCOUNT_RATE)
      setAmounts({ total: totalAmount, discount: discountAmt, advance: totalAmount - discountAmt, nights })
      setPendingBookingId(booking.booking_id)
      setPendingConfNo(confirmationNo)
      return booking.booking_id
    } catch (err) {
      console.error(err)
      toast.error('Something went wrong. Please try again.')
      setModalStep('form')
      return null
    }
  }

  const handleFormContinueToPayment = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    const bookingId = await createBooking('jazzcash')
    if (!bookingId) return
    setModalStep('payment_choice')
  }

  // â”€â”€ Step 2a: Pay at Hotel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handlePayAtHotel = async () => {
    if (!pendingBookingId) return
    setModalStep('submitting')
    await supabase.from('bookings').update({
      booking_status: 'pending',
      payment_method: 'pay_at_hotel',
      payment_status: 'pending',
      discount_applied: false,
    }).eq('booking_id', pendingBookingId)
    resetModal()
    router.push(`/book/confirmation/${pendingBookingId}`)
  }

  // â”€â”€ Step 2b: JazzCash â€” upload screenshot â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleJazzCashSubmit = async () => {
    if (!file)          { setUploadError('Please upload your payment screenshot.'); return }
    if (!senderNumber.trim()) { setUploadError('Please enter the JazzCash number you sent from.'); return }
    if (!pendingBookingId) return

    setModalStep('submitting')
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('bookingId',      String(pendingBookingId))
      formData.append('screenshot',     file)
      formData.append('senderNumber',   senderNumber.trim())
      formData.append('transactionId',  transactionId.trim())
      formData.append('advanceAmount',  String(amounts.advance))
      formData.append('discountAmount', String(amounts.discount))

      const res  = await fetch('/api/bookings/submit-payment', { method: 'POST', body: formData })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Upload failed')

      resetModal()
      router.push(`/book/confirmation/${pendingBookingId}`)
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
      setModalStep('jazzcash_upload')
    }
  }

  const bookingTicker = [
    'Free welcome drink on arrival', 'Early check-in subject to availability',
    'Late check-out priority for direct bookings', 'Flexible seasonal plans',
    'Best rate guarantee', 'Loyalty points on every stay',
  ]

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  return (
    <motion.div className={showCatalog ? 'relative space-y-6' : 'relative'}>
      {showCatalog && (
      <>
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-56 w-[88%] rounded-[3rem] bg-gradient-to-r from-amber-100/45 via-orange-100/45 to-orange-50/45 blur-3xl" />

      {/* TICKER */}
      <div className="relative overflow-hidden rounded-xl border border-[#e8d2b8]/70 bg-[#fdf6ee]" style={{ height: 36 }}>
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#fdf6ee] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#fdf6ee] to-transparent" />
        <motion.div className="absolute inset-y-0 flex w-max items-center whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }} transition={{ duration: 28, ease: 'linear', repeat: Infinity }}>
          {[...bookingTicker, ...bookingTicker].map((item, idx) => (
            <span key={`${item}-${idx}`} className="inline-flex items-center gap-2 px-7 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8b5a3c]">
              <span className="h-3 w-px bg-[#D4722A]/30" />
              <Sparkles className="h-2.5 w-2.5 flex-shrink-0" style={{ color: '#D4722A' }} />
              {item}
            </span>
          ))}
        </motion.div>
      </div>

      {/* COMMAND BAR */}
      <div className="relative overflow-hidden rounded-2xl border border-[#e8d2b8]"
        style={{ background: 'linear-gradient(135deg,#fffcf8 0%,#fff8f0 50%,#fffcf8 100%)', boxShadow: '0 1px 3px rgba(139,90,60,0.08),0 8px 24px rgba(139,90,60,0.06),inset 0 1px 0 rgba(255,255,255,0.9)' }}>
        <div className="relative flex flex-col divide-y divide-[#ead8c4]/60 lg:flex-row lg:divide-x lg:divide-y-0">
          {/* Hotel selector */}
          <div className="relative flex min-w-0 flex-1 items-center gap-3 px-5 py-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: 'linear-gradient(135deg,#fff2e7,#ffe4cc)', border: '1px solid #f0c8a8' }}>
              <Building2 className="h-3.5 w-3.5" style={{ color: '#D4722A' }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#b07a56]">Property</p>
              <button type="button" onClick={() => setOpenDropdown(openDropdown === 'hotel' ? null : 'hotel')}
                className="flex w-full items-center justify-between gap-2 bg-transparent text-left text-sm font-semibold text-[#3f2f22] outline-none">
                <span className="truncate">{selectedHotel === 'all' ? 'All Properties' : hotelMap.get(selectedHotel as number)?.hotel_name ?? 'All Properties'}</span>
                <motion.span animate={{ rotate: openDropdown === 'hotel' ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="h-3.5 w-3.5 flex-shrink-0" style={{ color: '#D4722A' }} />
                </motion.span>
              </button>
            </div>
            <AnimatePresence>
              {openDropdown === 'hotel' && (
                <motion.div initial={{ opacity:0, y:6, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:4, scale:0.97 }}
                  className="absolute left-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-[#e8d2b8]"
                  style={{ background: 'linear-gradient(160deg,#fffdf9 0%,#fff8f0 100%)', boxShadow: '0 4px 6px rgba(139,90,60,0.05),0 16px 48px rgba(139,90,60,0.14)' }}>
                  <div className="flex items-center gap-2 border-b border-[#ead8c4]/70 px-4 py-3">
                    <Building2 className="h-3.5 w-3.5" style={{ color: '#D4722A' }} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b07a56]">Select Property</span>
                  </div>
                  <div className="py-1.5">
                    <button type="button" onClick={() => { setSelectedHotel('all'); setOpenDropdown(null) }}
                      className="group flex w-full items-center gap-3 px-4 py-2.5 hover:bg-[#fff2e7]">
                      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border"
                        style={selectedHotel === 'all' ? { background:'#D4722A', borderColor:'#D4722A' } : { borderColor:'#e0c8b0' }}>
                        {selectedHotel === 'all' && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                      </span>
                      <div><p className="text-sm font-semibold text-[#3f2f22]">All Properties</p><p className="text-[11px] text-[#b07a56]">{hotels.length} hotels</p></div>
                    </button>
                    <div className="mx-4 my-1 border-t border-[#ead8c4]/50" />
                    {hotels.map(hotel => (
                      <button key={hotel.hotel_id} type="button" onClick={() => { setSelectedHotel(hotel.hotel_id); setOpenDropdown(null) }}
                        className="group flex w-full items-center gap-3 px-4 py-2.5 hover:bg-[#fff2e7]">
                        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border"
                          style={selectedHotel === hotel.hotel_id ? { background:'#D4722A', borderColor:'#D4722A' } : { borderColor:'#e0c8b0' }}>
                          {selectedHotel === hotel.hotel_id && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                        </span>
                        <div><p className="truncate text-sm font-semibold text-[#3f2f22]">{hotel.hotel_name}</p><p className="text-[11px] text-[#b07a56]">{hotel.city}</p></div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="hidden lg:block" style={{ width:1, background:'linear-gradient(to bottom,transparent,#e0c4a8,transparent)' }} />
          {/* Category */}
          <div className="flex min-w-0 flex-1 items-center gap-3 px-5 py-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg" style={{ background:'linear-gradient(135deg,#fff2e7,#ffe4cc)', border:'1px solid #f0c8a8' }}>
              <BedDouble className="h-3.5 w-3.5" style={{ color:'#D4722A' }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#b07a56]">Room Category</p>
              <div className="relative">
                <select className="w-full appearance-none bg-transparent text-sm font-semibold text-[#3f2f22] outline-none"
                  value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                  <option value="all">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#D4722A]/60" />
              </div>
            </div>
          </div>
          {/* Stats */}
          <div className="flex divide-x divide-[#ead8c4]/60 lg:ml-auto">
            <motion.div key={`rooms-${filteredRooms.length}`} initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }}
              className="flex flex-col items-center justify-center px-6 py-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#b07a56]">Rooms</p>
              <p className="mt-0.5 text-2xl font-bold leading-none text-[#3f2f22]">{filteredRooms.length}</p>
            </motion.div>
            <motion.div key={`rate-${minNightlyRate}`} initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }}
              className="flex flex-col items-center justify-center px-6 py-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#b07a56]">From / Night</p>
              <p className="mt-0.5 text-xl font-bold leading-none" style={{ color:'#D4722A' }}>{formatCurrency(minNightlyRate)}</p>
            </motion.div>
            <div className="flex flex-col items-center justify-center px-6 py-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#b07a56]">Status</p>
              <span className="mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                style={selectedRoom ? { background:'#fff2e7', color:'#D4722A', border:'1px solid #f0c8a8' } : { background:'#f5f0eb', color:'#8b5a3c', border:'1px solid #e8d2b8' }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: selectedRoom ? '#D4722A' : '#b07a56' }} />
                {selectedRoom ? 'Selected' : 'Browsing'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ROOM CARDS */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredRooms.map((room, index) => (
          <motion.div key={room.room_type_id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
            transition={{ delay: index * 0.03 }} whileHover={{ y:-10, rotateX:4, rotateY:-4 }}
            className="group overflow-hidden rounded-3xl border border-[#efdecb] bg-gradient-to-b from-white to-[#fdf8f2] shadow-premium-lg"
            style={{ transformStyle:'preserve-3d' }}>
            <div className="relative h-52 overflow-hidden">
              <Image src={roomImageMap[room.type_name] ?? '/images/placeholders/room-placeholder.jpg'} alt={room.type_name}
                fill sizes="(max-width:768px) 100vw,(max-width:1280px) 50vw,33vw"
                className="object-cover transition duration-500 group-hover:scale-110" priority={index < 2} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <p className="absolute left-3 top-3 rounded-full border border-white/60 bg-white/85 px-3 py-1 text-xs font-semibold text-stone-700">{hotelMap.get(room.hotel_id)?.city}</p>
              <p className="absolute bottom-3 right-3 rounded-full px-3 py-1 text-xs font-semibold text-white shadow-md" style={{ background:'#D4722A' }}>{formatCurrency(Number(room.base_price))}</p>
            </div>
            <div className="space-y-3 p-5">
              <p className="text-xs uppercase tracking-wider" style={{ color:'#D4722A' }}>{room.type_category}</p>
              <h3 className="text-xl font-semibold text-stone-900">{room.type_name}</h3>
              <p className="line-clamp-2 text-sm text-stone-600">{room.description}</p>
              <div className="flex items-center justify-between text-sm text-stone-500">
                <span className="inline-flex items-center gap-1"><Users className="h-4 w-4" style={{ color:'#D4722A' }} /> {room.max_occupancy} Guests</span>
                <span className="inline-flex items-center gap-1"><Hotel className="h-4 w-4" style={{ color:'#D4722A' }} /> {hotelMap.get(room.hotel_id)?.hotel_name}</span>
              </div>
              <motion.button onClick={() => { setSelectedRoom(room); setModalStep('form') }}
                whileHover={{ y:-2, scale:1.03 }} whileTap={{ scale:0.98 }}
                className="inline-flex items-center gap-2 rounded-full border border-[#f0c8a8] bg-[#fff2e7] px-4 py-2 text-sm font-semibold text-[#D4722A] shadow-sm transition-all hover:border-[#e2a77d] hover:bg-[#ffe7d3]">
                Book This Room
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* SEASONAL + WHY DIRECT */}
      <div className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-3xl border border-[#efdecb] bg-gradient-to-b from-white to-[#fdf8f2] p-6 shadow-premium">
          <h3 className="font-display text-xl font-bold text-stone-900">Seasonal Offers</h3>
          <div className="mt-4 space-y-3">
            {activeOffers.map(offer => (
              <div key={offer.pricing_id} className="rounded-2xl border border-[#f0d9c0] p-3" style={{ background:'linear-gradient(to right,#fff6ed,#ffffff)' }}>
                <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide" style={{ color:'#D4722A' }}><Sparkles className="h-3 w-3" /> {offer.season_name}</p>
                <p className="mt-1 text-sm font-semibold text-stone-900">{hotelMap.get(offer.hotel_id)?.hotel_name}</p>
                <p className="text-xs text-stone-500">{offer.start_date} to {offer.end_date}</p>
                <p className="mt-1 text-sm font-bold" style={{ color:'#D4722A' }}>{formatCurrency(Number(offer.price_per_night))}/night</p>
              </div>
            ))}
          </div>
          <p className="mt-4 inline-flex items-center gap-2 text-xs text-stone-500"><Filter className="h-3 w-3" /> Rates update dynamically by season and plan.</p>
        </div>
        <div className="rounded-3xl border border-[#efdecb] bg-gradient-to-b from-white to-[#fdf8f2] p-6 shadow-premium">
          <h3 className="font-display text-xl font-bold text-stone-900">Why Book Direct</h3>
          <p className="mt-2 text-sm text-stone-600">Unlock premium perks with direct booking at Grand Azure Hotel Group.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              { label:'Best PKR Rate', desc:'Exclusive direct discounts and flexible plans.', cls:'border-[#f0c8a8] bg-[#fff2e7]', tCls:'text-[#D4722A]' },
              { label:'Priority Upgrade', desc:'Early upgrade consideration for direct guests.', cls:'border-violet-100 bg-violet-50', tCls:'text-violet-700' },
              { label:'Fast Check-in', desc:'Express arrival desk for confirmed online bookings.', cls:'border-emerald-100 bg-emerald-50', tCls:'text-emerald-700' },
              { label:'Loyalty Benefits', desc:'Earn and redeem points on every eligible stay.', cls:'border-[#f0c8a8] bg-[#fff6ed]', tCls:'text-[#D4722A]' },
            ].map(card => (
              <div key={card.label} className={`rounded-2xl border p-4 ${card.cls}`}>
                <p className={`text-xs font-semibold uppercase tracking-wide ${card.tCls}`}>{card.label}</p>
                <p className="mt-1 text-sm text-stone-700">{card.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-[#ead8c4]">
            <div className="relative h-44 w-full">
              <Image src="/images/hotels/karachi-pool.jpg" alt="Grand Azure luxury experience" fill sizes="(max-width:1280px) 100vw,50vw" className="object-cover" />
            </div>
          </div>
        </div>
      </div>
      </>
      )}

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          BOOKING MODAL â€” multi-step
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <AnimatePresence>
        {selectedRoom && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/50 p-0 sm:items-center sm:p-4">
            <motion.div initial={{ opacity:0, y:24, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }}
              exit={{ opacity:0, y:16, scale:0.97 }} transition={{ duration:0.25, ease:[0.16,1,0.3,1] }}
              className="relative flex w-full max-w-2xl max-h-[92dvh] flex-col overflow-hidden rounded-t-3xl border border-[#efdecb] shadow-2xl sm:max-h-[90vh] sm:rounded-3xl"
              style={{ background:'linear-gradient(to bottom,#ffffff,#fdf8f2)' }}>

              {/* Close button â€” always visible except during submitting */}
              {modalStep !== 'submitting' && (
                <button onClick={resetModal} className="absolute right-3 top-3 z-20 rounded-xl border border-[#ead8c4] bg-white/90 p-2 text-stone-500 shadow-sm hover:bg-white transition-colors sm:right-4 sm:top-4">
                  <X className="h-4 w-4" />
                </button>
              )}

              <div className="booking-modal-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-smooth">
              <AnimatePresence mode="wait">

                {/* â”€â”€ STEP: Submitting spinner â”€â”€ */}
                {modalStep === 'submitting' && (
                  <motion.div key="submitting" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                    className="flex flex-col items-center justify-center gap-4 p-16">
                    <Loader2 className="h-10 w-10 animate-spin" style={{ color:'#D4722A' }} />
                    <p className="text-sm text-stone-500">Processing your bookingâ€¦</p>
                  </motion.div>
                )}

                {/* â”€â”€ STEP 1: Booking Form â”€â”€ */}
                {modalStep === 'form' && (
                  <motion.div key="form" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} className="p-4 pb-6 sm:p-6">
                    <div className="mb-4">
                      <h3 className="font-display text-2xl font-bold text-stone-900">{selectedRoom.type_name}</h3>
                      <p className="text-sm text-stone-500">{hotelMap.get(selectedRoom.hotel_id)?.hotel_name}</p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="space-y-1.5 text-sm sm:col-span-2">
                        <span className="font-medium text-stone-700">Guest first name</span>
                        <input type="text" autoComplete="given-name" placeholder="Legal first name"
                          className="w-full rounded-xl border border-[#e7d6c3] bg-[#fffdf9] px-3 py-2 text-sm focus:border-[#D4722A] focus:outline-none focus:ring-2 focus:ring-[#D4722A]/20"
                          value={bookingForm.guestFirstName} onChange={e => setBookingForm(p => ({ ...p, guestFirstName: e.target.value }))} />
                      </label>
                      <label className="space-y-1.5 text-sm sm:col-span-2">
                        <span className="font-medium text-stone-700">Guest last name</span>
                        <input type="text" autoComplete="family-name" placeholder="Legal last name"
                          className="w-full rounded-xl border border-[#e7d6c3] bg-[#fffdf9] px-3 py-2 text-sm focus:border-[#D4722A] focus:outline-none focus:ring-2 focus:ring-[#D4722A]/20"
                          value={bookingForm.guestLastName} onChange={e => setBookingForm(p => ({ ...p, guestLastName: e.target.value }))} />
                      </label>
                      <label className="space-y-1.5 text-sm">
                        <span className="font-medium text-stone-700">Check-in</span>
                        <input type="date" min={todayYMD}
                          className="w-full rounded-xl border border-[#e7d6c3] bg-[#fffdf9] px-3 py-2 text-sm focus:border-[#D4722A] focus:outline-none focus:ring-2 focus:ring-[#D4722A]/20"
                          value={bookingForm.checkIn} onChange={e => {
                            const v = e.target.value
                            setBookingForm(p => ({ ...p, checkIn: v, checkOut: p.checkOut <= v ? '' : p.checkOut }))
                          }} />
                      </label>
                      <label className="space-y-1.5 text-sm">
                        <span className="font-medium text-stone-700">Check-out</span>
                        <input type="date" min={checkoutMin}
                          className="w-full rounded-xl border border-[#e7d6c3] bg-[#fffdf9] px-3 py-2 text-sm focus:border-[#D4722A] focus:outline-none focus:ring-2 focus:ring-[#D4722A]/20"
                          value={bookingForm.checkOut} onChange={e => setBookingForm(p => ({ ...p, checkOut: e.target.value }))} />
                      </label>
                      <label className="space-y-1.5 text-sm">
                        <span className="font-medium text-stone-700">Adults</span>
                        <input type="number" min={1} max={6}
                          className="w-full rounded-xl border border-[#e7d6c3] bg-[#fffdf9] px-3 py-2 text-sm focus:border-[#D4722A] focus:outline-none focus:ring-2 focus:ring-[#D4722A]/20"
                          value={bookingForm.adults} onChange={e => setBookingForm(p => ({ ...p, adults: e.target.value }))} />
                      </label>
                      <label className="space-y-1.5 text-sm">
                        <span className="font-medium text-stone-700">Children</span>
                        <input type="number" min={0} max={4}
                          className="w-full rounded-xl border border-[#e7d6c3] bg-[#fffdf9] px-3 py-2 text-sm focus:border-[#D4722A] focus:outline-none focus:ring-2 focus:ring-[#D4722A]/20"
                          value={bookingForm.children} onChange={e => setBookingForm(p => ({ ...p, children: e.target.value }))} />
                      </label>
                      <label className="space-y-1.5 text-sm sm:col-span-2">
                        <span className="font-medium text-stone-700">Special Requests</span>
                        <textarea rows={2}
                          className="w-full rounded-xl border border-[#e7d6c3] bg-[#fffdf9] px-3 py-2 text-sm focus:border-[#D4722A] focus:outline-none focus:ring-2 focus:ring-[#D4722A]/20"
                          value={bookingForm.specialRequests} onChange={e => setBookingForm(p => ({ ...p, specialRequests: e.target.value }))} />
                      </label>
                    </div>
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-semibold" style={{ color:'#D4722A' }}>{formatCurrency(Number(selectedRoom.base_price))}/night</p>
                      <button type="button" onClick={handleFormContinueToPayment}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 sm:w-auto"
                        style={{ background:'#D4722A', boxShadow:'0 4px 14px rgba(212,114,42,0.4)' }}>
                        <CalendarDays className="h-4 w-4" /> Book
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* â”€â”€ STEP 2: Payment Choice â”€â”€ */}
                {modalStep === 'payment_choice' && (
                  <motion.div key="payment_choice" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} className="p-4 pb-6 sm:p-6">
                    {/* Back */}
                    <button onClick={() => setModalStep('form')} className="mb-4 inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-600 transition-colors">
                      <ArrowLeft className="h-3.5 w-3.5" /> Back to details
                    </button>

                    <div className="mb-5 text-center sm:mb-6">
                      <p className="text-[10px] font-bold uppercase tracking-[3px] text-[#D4722A] mb-1">Payment Preference</p>
                      <h3 className="text-xl font-bold text-stone-900 sm:text-2xl" style={{ fontFamily:"'Cormorant Garamond',serif" }}>How would you like to pay?</h3>
                      <p className="text-sm text-stone-500 mt-1">Total stay: <span className="font-semibold text-stone-700">{fmt(amounts.total)}</span> Â· {amounts.nights} night{amounts.nights > 1 ? 's' : ''}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {/* Pay at Hotel */}
                      <button onClick={handlePayAtHotel}
                        className="group relative rounded-2xl border-2 border-[#efdecb] bg-gradient-to-b from-white to-[#fdf8f2] p-5 text-left transition-all hover:border-stone-400 hover:shadow-lg">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background:'#f5f0eb', border:'1px solid #e8d2b8' }}>
                          <Hotel className="h-5 w-5" style={{ color:'#8b5a3c' }} />
                        </div>
                        <h4 className="text-base font-semibold text-stone-800 mb-1" style={{ fontFamily:"'Cormorant Garamond',serif" }}>Pay at Hotel</h4>
                        <p className="text-xs text-stone-500 mb-4 leading-relaxed">No payment now. Settle the full amount at check-in.</p>
                        <div className="rounded-xl p-3 mb-3" style={{ background:'#f5f0eb' }}>
                          <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-0.5">Due at Check-In</p>
                          <p className="text-lg font-bold text-stone-800">{fmt(amounts.total)}</p>
                        </div>
                        <ul className="space-y-1">
                          {['No upfront payment','Pay cash or card','Standard cancellation policy'].map(p => (
                            <li key={p} className="flex items-center gap-1.5 text-[11px] text-stone-400">
                              <Check className="h-3 w-3" /> {p}
                            </li>
                          ))}
                        </ul>
                      </button>

                      {/* JazzCash */}
                      <button onClick={() => setModalStep('jazzcash_instructions')}
                        className="group relative rounded-2xl border-2 p-5 text-left transition-all hover:shadow-xl"
                        style={{ borderColor:'#f0c8a8', background:'linear-gradient(135deg,#fff6ed,#fff2e7)' }}>
                        {/* Badge */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold text-white shadow-md whitespace-nowrap"
                            style={{ background:'#D4722A', boxShadow:'0 4px 12px rgba(212,114,42,0.4)' }}>
                            <Tag className="h-2.5 w-2.5" /> 10% OFF
                          </span>
                        </div>
                        <div className="mb-3 mt-2 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background:'#fff2e7', border:'1px solid #f0c8a8' }}>
                          <Zap className="h-5 w-5" style={{ color:'#D4722A' }} />
                        </div>
                        <h4 className="text-base font-semibold mb-1" style={{ color:'#3f2f22', fontFamily:"'Cormorant Garamond',serif" }}>Pay via JazzCash</h4>
                        <p className="text-xs mb-4 leading-relaxed" style={{ color:'#8b5a3c' }}>Send advance payment & unlock 10% off your total stay.</p>
                        <div className="rounded-xl p-3 mb-3" style={{ background:'rgba(255,255,255,0.7)', border:'1px solid #f0c8a8' }}>
                          <div className="flex justify-between mb-1">
                            <span className="text-[10px] text-stone-400">Original</span>
                            <span className="text-xs line-through text-stone-400">{fmt(amounts.total)}</span>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span className="text-[10px] text-emerald-600">10% Discount</span>
                            <span className="text-xs font-medium text-emerald-600">âˆ’ {fmt(amounts.discount)}</span>
                          </div>
                          <div className="border-t border-dashed border-[#f0c8a8] pt-2 flex justify-between items-center">
                            <span className="text-[10px] uppercase tracking-widest text-stone-400">Pay Now</span>
                            <span className="text-lg font-bold" style={{ color:'#D4722A' }}>{fmt(amounts.advance)}</span>
                          </div>
                        </div>
                        <ul className="space-y-1">
                          {['10% instant discount','Priority confirmation','Invoice emailed to you'].map(p => (
                            <li key={p} className="flex items-center gap-1.5 text-[11px]" style={{ color:'#8b5a3c' }}>
                              <Check className="h-3 w-3" style={{ color:'#D4722A' }} /> {p}
                            </li>
                          ))}
                        </ul>
                      </button>
                    </div>

                    {/* Trust row */}
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:gap-5">
                      {[{ icon:Shield, label:'Secure booking' },{ icon:Clock, label:'Fast confirmation' },{ icon:Check, label:'No hidden fees' }].map(({ icon:Icon, label }) => (
                        <div key={label} className="flex items-center gap-1 text-[11px] text-stone-400"><Icon className="h-3 w-3" />{label}</div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* â”€â”€ STEP 3: JazzCash Instructions â”€â”€ */}
                {modalStep === 'jazzcash_instructions' && (
                  <motion.div key="jazzcash_instructions" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} className="p-4 pb-6 sm:p-6">
                    <button onClick={() => setModalStep('payment_choice')} className="mb-4 inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-600 transition-colors">
                      <ArrowLeft className="h-3.5 w-3.5" /> Back
                    </button>
                    <div className="mb-5 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-[3px] text-[#D4722A] mb-1">Step 1 of 2</p>
                      <h3 className="text-2xl font-bold text-stone-900" style={{ fontFamily:"'Cormorant Garamond',serif" }}>Send via JazzCash</h3>
                    </div>

                    {/* Amount highlight */}
                    <div className="rounded-2xl border border-[#f0c8a8] p-4 mb-4" style={{ background:'linear-gradient(135deg,#fff6ed,#fff2e7)' }}>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-[#b07a56] mb-1">Amount to Send</p>
                          <p className="text-3xl font-bold" style={{ color:'#D4722A', fontFamily:"'Cormorant Garamond',serif" }}>{fmt(amounts.advance)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-emerald-600 font-medium">You save</p>
                          <p className="text-lg font-bold text-emerald-600">{fmt(amounts.discount)}</p>
                        </div>
                      </div>
                      <div className="flex justify-between text-[11px] text-[#b07a56]/70 mt-2">
                        <span>Original: <s>{fmt(amounts.total)}</s></span>
                        <span>Ref: {pendingConfNo}</span>
                      </div>
                    </div>

                    {/* JazzCash details */}
                    <div className="rounded-2xl border border-[#efdecb] divide-y divide-[#f0ebe0] bg-white mb-4">
                      <div className="flex items-center justify-between p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background:'#fff2e7', border:'1px solid #f0c8a8' }}><Phone className="h-4 w-4" style={{ color:'#D4722A' }} /></div>
                          <div><p className="text-[10px] uppercase tracking-wider text-stone-400">JazzCash Number</p><p className="text-sm font-semibold font-mono text-stone-800">{JAZZCASH_NUMBER}</p></div>
                        </div>
                        <button onClick={() => copyText(JAZZCASH_NUMBER, 'number')} className="flex items-center gap-1 text-[11px] bg-[#f5f0eb] hover:bg-[#efe8df] text-stone-600 px-2.5 py-1.5 rounded-lg transition-colors">
                          {copied === 'number' ? <><CheckCircle2 className="h-3 w-3 text-emerald-500" />Copied!</> : <><Copy className="h-3 w-3" />Copy</>}
                        </button>
                      </div>
                      <div className="flex items-center gap-3 p-3.5">
                        <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background:'#eff6ff', border:'1px solid #bfdbfe' }}><User className="h-4 w-4 text-blue-500" /></div>
                        <div><p className="text-[10px] uppercase tracking-wider text-stone-400">Account Name</p><p className="text-sm font-semibold text-stone-800">{JAZZCASH_ACCT}</p></div>
                      </div>
                      <div className="flex items-center justify-between p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background:'#f0fdf4', border:'1px solid #bbf7d0' }}><DollarSign className="h-4 w-4 text-emerald-500" /></div>
                          <div><p className="text-[10px] uppercase tracking-wider text-stone-400">Exact Amount</p><p className="text-sm font-semibold text-stone-800">{fmt(amounts.advance)}</p></div>
                        </div>
                        <button onClick={() => copyText(String(amounts.advance), 'amount')} className="flex items-center gap-1 text-[11px] bg-[#f5f0eb] hover:bg-[#efe8df] text-stone-600 px-2.5 py-1.5 rounded-lg transition-colors">
                          {copied === 'amount' ? <><CheckCircle2 className="h-3 w-3 text-emerald-500" />Copied!</> : <><Copy className="h-3 w-3" />Copy</>}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 rounded-xl bg-blue-50 border border-blue-100 p-3.5 mb-5 text-sm text-blue-700">
                      <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <p>After sending, take a <strong>screenshot of the JazzCash confirmation</strong> and upload it in the next step.</p>
                    </div>

                    <button onClick={() => setModalStep('jazzcash_upload')}
                      className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white transition-all hover:opacity-90"
                      style={{ background:'#D4722A', boxShadow:'0 4px 14px rgba(212,114,42,0.35)' }}>
                      I&apos;ve Sent the Payment <ArrowRight className="h-4 w-4" />
                    </button>
                  </motion.div>
                )}

                {/* â”€â”€ STEP 4: Upload Screenshot â”€â”€ */}
                {modalStep === 'jazzcash_upload' && (
                  <motion.div key="jazzcash_upload" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} className="p-4 pb-6 sm:p-6">
                    <button onClick={() => setModalStep('jazzcash_instructions')} className="mb-4 inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-600 transition-colors">
                      <ArrowLeft className="h-3.5 w-3.5" /> Back
                    </button>
                    <div className="mb-5 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-[3px] text-[#D4722A] mb-1">Step 2 of 2</p>
                      <h3 className="text-2xl font-bold text-stone-900" style={{ fontFamily:"'Cormorant Garamond',serif" }}>Upload Payment Proof</h3>
                    </div>

                    {/* Screenshot upload */}
                    <div className="mb-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-2">Payment Screenshot *</p>
                      {preview ? (
                        <div className="relative rounded-xl overflow-hidden border-2 border-[#f0c8a8]">
                          <img src={preview} alt="proof" className="w-full object-cover max-h-48" />
                          <button onClick={() => { setFile(null); setPreview(null); if (fileRef.current) fileRef.current.value='' }}
                            className="absolute top-2 right-2 bg-white/90 text-red-500 rounded-full p-1 shadow">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => fileRef.current?.click()}
                          className="w-full border-2 border-dashed border-[#e7d6c3] hover:border-[#D4722A] hover:bg-[#fff6ed] rounded-xl p-6 flex flex-col items-center gap-2 transition-all cursor-pointer">
                          <div className="h-10 w-10 rounded-xl bg-[#f5f0eb] flex items-center justify-center"><ImageIcon className="h-5 w-5 text-stone-400" /></div>
                          <p className="text-sm font-medium text-stone-600">Click to upload screenshot</p>
                          <p className="text-xs text-stone-400">JPG, PNG up to 5 MB</p>
                          <span className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium" style={{ background:'#fff2e7', color:'#D4722A' }}>
                            <Upload className="h-3 w-3" /> Choose File
                          </span>
                        </button>
                      )}
                      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </div>

                    <div className="mb-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">Your JazzCash Number *</p>
                      <input type="tel" placeholder="03XX-XXXXXXX" value={senderNumber} onChange={e => setSenderNumber(e.target.value)}
                        className="w-full rounded-xl border border-[#e7d6c3] bg-[#fffdf9] px-3 py-2.5 text-sm focus:border-[#D4722A] focus:outline-none focus:ring-2 focus:ring-[#D4722A]/20" />
                    </div>
                    <div className="mb-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">Transaction ID <span className="normal-case font-normal text-stone-400">(optional)</span></p>
                      <input type="text" placeholder="e.g. TT2405XXXXXXXXX" value={transactionId} onChange={e => setTransactionId(e.target.value)}
                        className="w-full rounded-xl border border-[#e7d6c3] bg-[#fffdf9] px-3 py-2.5 text-sm focus:border-[#D4722A] focus:outline-none focus:ring-2 focus:ring-[#D4722A]/20" />
                    </div>

                    <AnimatePresence>
                      {uploadError && (
                        <motion.div initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                          className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600 mb-4">
                          <AlertCircle className="h-4 w-4" />{uploadError}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button onClick={handleJazzCashSubmit}
                      className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white transition-all hover:opacity-90"
                      style={{ background:'#D4722A', boxShadow:'0 4px 14px rgba(212,114,42,0.35)' }}>
                      <Upload className="h-4 w-4" /> Submit Payment Proof
                    </button>
                    <p className="text-center text-xs text-stone-400 mt-3">Booking confirmed after our team verifies your payment Â· usually within 1â€“2 hours</p>
                  </motion.div>
                )}

              </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <style>{`
        .booking-modal-scroll { scrollbar-width: thin; scrollbar-color: #e2a77d #fdf8f2; }
        .booking-modal-scroll::-webkit-scrollbar { width: 8px; }
        .booking-modal-scroll::-webkit-scrollbar-thumb { background: #e2a77d; border-radius: 999px; }
        .booking-modal-scroll::-webkit-scrollbar-track { background: #fdf8f2; }
      `}</style>
    </motion.div>
  )
}





