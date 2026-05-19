'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, Calendar, BedDouble, MapPin, Clock, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface BookingSummary {
  confirmation_no: string
  check_in_date: string
  check_out_date: string
  total_nights: number
  total_amount: number
  guest_name: string
  hotel_name: string
  hotel_city: string
  room_type: string
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-PK', {
    weekday: 'short', month: 'long', day: 'numeric', year: 'numeric',
  })
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency', currency: 'PKR', maximumFractionDigits: 0,
  }).format(n)
}

// ── Floating particle ──────────────────────────────────────────────────────
function Particle({ delay, x, size, color }: { delay: number; x: number; size: number; color: string }) {
  return (
    <motion.div
      className="pointer-events-none absolute bottom-0 rounded-full opacity-0"
      style={{ left: `${x}%`, width: size, height: size, background: color }}
      animate={{
        y: [0, -120 - Math.random() * 80],
        opacity: [0, 0.5, 0],
        x: [0, (Math.random() - 0.5) * 40],
        scale: [0.5, 1, 0.3],
      }}
      transition={{
        duration: 2.5 + Math.random() * 1.5,
        delay,
        repeat: Infinity,
        repeatDelay: 1 + Math.random() * 2,
        ease: 'easeOut',
      }}
    />
  )
}

// ── Animated concierge SVG character ──────────────────────────────────────
function ConciergeCharacter() {
  return (
    <div className="relative mx-auto" style={{ width: 180, height: 220 }}>
      {/* Shadow under feet */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full"
        style={{ width: 80, height: 10, background: 'rgba(212,114,42,0.12)' }}
        animate={{ scaleX: [1, 0.85, 1], opacity: [0.5, 0.25, 0.5] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Body — floats up/down */}
      <motion.div
        className="absolute inset-x-0 top-0"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg width="180" height="210" viewBox="0 0 180 210" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* ── Jacket / body ── */}
          <rect x="52" y="100" width="76" height="80" rx="8" fill="#2d1a0a" />
          {/* Lapels */}
          <path d="M90 110 L68 130 L78 130 Z" fill="#1a0f07" />
          <path d="M90 110 L112 130 L102 130 Z" fill="#1a0f07" />
          {/* Gold buttons */}
          <circle cx="90" cy="138" r="3" fill="#D4722A" />
          <circle cx="90" cy="150" r="3" fill="#D4722A" />
          {/* White shirt front */}
          <rect x="82" y="110" width="16" height="26" rx="2" fill="#f5ede3" />
          {/* Bow tie */}
          <path d="M82 116 L90 121 L82 126 Z" fill="#D4722A" />
          <path d="M98 116 L90 121 L98 126 Z" fill="#D4722A" />
          <circle cx="90" cy="121" r="2.5" fill="#b05a1a" />
          {/* ── Hat ── */}
          <rect x="60" y="28" width="60" height="36" rx="4" fill="#1a0f07" />
          <rect x="50" y="60" width="80" height="8" rx="4" fill="#2d1a0a" />
          <rect x="60" y="54" width="60" height="6" rx="2" fill="#D4722A" />
          {/* ── Head ── */}
          <ellipse cx="90" cy="85" rx="28" ry="26" fill="#f5deb3" />
          <ellipse cx="63" cy="86" rx="5" ry="7" fill="#f5deb3" />
          <ellipse cx="117" cy="86" rx="5" ry="7" fill="#f5deb3" />
          <ellipse cx="79" cy="83" rx="4" ry="4.5" fill="white" />
          <ellipse cx="101" cy="83" rx="4" ry="4.5" fill="white" />
          <motion.g
            animate={{ x: [-1.5, 1.5, -1.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <circle cx="80" cy="84" r="2.5" fill="#3f2f22" />
            <circle cx="102" cy="84" r="2.5" fill="#3f2f22" />
            <circle cx="81" cy="83" r="0.9" fill="white" />
            <circle cx="103" cy="83" r="0.9" fill="white" />
          </motion.g>
          <path d="M75 77 Q79 74 83 77" stroke="#6b4c2a" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <path d="M97 77 Q101 74 105 77" stroke="#6b4c2a" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <motion.path
            d="M81 94 Q90 101 99 94"
            stroke="#c0845a"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            animate={{ d: ['M81 94 Q90 101 99 94', 'M81 93 Q90 102 99 93', 'M81 94 Q90 101 99 94'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <path d="M83 91 Q90 95 90 91" stroke="#6b4c2a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M90 91 Q90 95 97 91" stroke="#6b4c2a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          {/* ── Left arm (wave) ── */}
          <motion.g
            style={{ originX: '68px', originY: '112px' }}
            animate={{ rotate: [0, -28, 0, -20, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', times: [0, 0.25, 0.5, 0.75, 1] }}
          >
            <rect x="36" y="108" width="34" height="12" rx="6" fill="#2d1a0a" />
            <ellipse cx="36" cy="114" rx="8" ry="9" fill="#f5deb3" />
            <line x1="30" y1="108" x2="28" y2="104" stroke="#e8c99a" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="34" y1="106" x2="33" y2="102" stroke="#e8c99a" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="38" y1="106" x2="38" y2="102" stroke="#e8c99a" strokeWidth="1.5" strokeLinecap="round" />
            <rect x="44" y="108" width="10" height="12" rx="2" fill="#f5ede3" />
          </motion.g>
          {/* ── Right arm (holding tray) ── */}
          <motion.g
            style={{ originX: '112px', originY: '112px' }}
            animate={{ rotate: [0, 4, 0, -4, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <rect x="110" y="108" width="34" height="12" rx="6" fill="#2d1a0a" />
            <ellipse cx="144" cy="114" rx="8" ry="7" fill="#f5deb3" />
            <ellipse cx="152" cy="108" rx="18" ry="5" fill="#c8a060" />
            <ellipse cx="152" cy="106" rx="17" ry="4" fill="#e0b870" />
            <rect x="144" y="97" width="18" height="13" rx="2" fill="#fff8f0" stroke="#D4722A" strokeWidth="1" />
            <path d="M144 97 L153 105 L162 97" stroke="#D4722A" strokeWidth="1" fill="none" />
            <rect x="126" y="108" width="10" height="12" rx="2" fill="#f5ede3" />
          </motion.g>
          {/* ── Legs ── */}
          <motion.g
            style={{ originX: '75px', originY: '178px' }}
            animate={{ rotate: [0, 8, 0, -8, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <rect x="62" y="176" width="22" height="30" rx="6" fill="#1a0f07" />
            <ellipse cx="73" cy="208" rx="13" ry="6" fill="#0f0906" />
            <ellipse cx="69" cy="205" rx="4" ry="2" fill="#2d1a0a" />
          </motion.g>
          <motion.g
            style={{ originX: '105px', originY: '178px' }}
            animate={{ rotate: [0, -8, 0, 8, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <rect x="96" y="176" width="22" height="30" rx="6" fill="#1a0f07" />
            <ellipse cx="107" cy="208" rx="13" ry="6" fill="#0f0906" />
            <ellipse cx="103" cy="205" rx="4" ry="2" fill="#2d1a0a" />
          </motion.g>
        </svg>
      </motion.div>

      {/* Sparkles around character */}
      {[
        { x: 10, y: 30, delay: 0 },
        { x: 155, y: 20, delay: 0.5 },
        { x: 0, y: 80, delay: 1.2 },
        { x: 160, y: 70, delay: 0.8 },
      ].map((s, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: s.x, top: s.y }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5], rotate: [0, 180, 360] }}
          transition={{ duration: 2, delay: s.delay, repeat: Infinity, repeatDelay: 1 }}
        >
          <Sparkles className="h-4 w-4" style={{ color: '#D4722A' }} />
        </motion.div>
      ))}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function BookingConfirmationPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params?.bookingId as string

  const [booking, setBooking] = useState<BookingSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<'loading' | 'reveal' | 'done'>('loading')
  const [isJazzCash, setIsJazzCash] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null)
  const [advanceAmount, setAdvanceAmount] = useState<number>(0)
  const [discountAmount, setDiscountAmount] = useState<number>(0)

  useEffect(() => {
    if (!bookingId) return

    const fetch = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          confirmation_no,
          check_in_date,
          check_out_date,
          total_nights,
          total_amount,
          payment_method,
          payment_status,
          advance_payment_amount,
          discount_amount,
          guests ( first_name, last_name ),
          hotels ( hotel_name, city ),
          booking_rooms ( room_types ( type_name ) )
        `)
        .eq('booking_id', bookingId)
        .single()

      if (!error && data) {
        const g = data.guests as any
        const h = data.hotels as any
        const br = data.booking_rooms as any[]
        setBooking({
          confirmation_no: data.confirmation_no,
          check_in_date: data.check_in_date,
          check_out_date: data.check_out_date,
          total_nights: data.total_nights,
          total_amount: Number(data.total_amount),
          guest_name: `${g?.first_name ?? ''} ${g?.last_name ?? ''}`.trim(),
          hotel_name: h?.hotel_name ?? 'Grand Azure Hotel',
          hotel_city: h?.city ?? 'Pakistan',
          room_type: br?.[0]?.room_types?.type_name ?? 'Deluxe Room',
        })
        // Store payment-related state for conditional UI
        setIsJazzCash(Boolean(data.payment_method === 'jazzcash'))
        setPaymentStatus(String(data.payment_status ?? ''))
        setAdvanceAmount(Number(data.advance_payment_amount ?? 0))
        setDiscountAmount(Number(data.discount_amount ?? 0))
      }
      setLoading(false)
    }

    fetch()

    const t1 = setTimeout(() => setStep('reveal'), 1800)
    const t2 = setTimeout(() => setStep('done'), 3200)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [bookingId])

  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: 5 + (i * 5.5),
    delay: i * 0.18,
    size: 5 + (i % 4) * 2,
    // Light-theme particles: soft terracotta tints
    color: i % 3 === 0 ? 'rgba(212,114,42,0.25)' : i % 3 === 1 ? 'rgba(236,188,137,0.35)' : 'rgba(212,114,42,0.12)',
  }))

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      // Light warm cream background matching --background token in globals.css
      style={{ background: 'linear-gradient(160deg, #FAF6EF 0%, #F7F0E6 45%, #FBF0E3 80%, #FAF6EF 100%)' }}
    >
      {/* ── Ambient glows — light, warm, soft ── */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full blur-3xl"
          style={{ background: 'rgba(212,114,42,0.08)' }}
        />
        <div
          className="absolute right-1/4 bottom-1/3 h-64 w-64 rounded-full blur-3xl"
          style={{ background: 'rgba(236,188,137,0.12)' }}
        />
        <div
          className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: 'rgba(212,114,42,0.05)' }}
        />
      </div>

      {/* ── Subtle dot-grid texture ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: 'radial-gradient(circle, #B85E1E 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* ── Particle emitter ── */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-full overflow-hidden">
        {particles.map(p => (
          <Particle key={p.id} delay={p.delay} x={p.x} size={p.size} color={p.color} />
        ))}
      </div>

      {/* ── Intro loading animation ── */}
      <AnimatePresence>
        {step === 'loading' && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-40 flex flex-col items-center justify-center"
            // Same warm cream background so the loader matches the page
            style={{ background: 'linear-gradient(160deg, #FAF6EF 0%, #FBF0E3 100%)' }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-6"
            >
              {/* Logo mark */}
              <motion.div
                className="flex h-20 w-20 items-center justify-center rounded-3xl"
                style={{
                  background: 'rgba(212,114,42,0.1)',
                  border: '1.5px solid rgba(212,114,42,0.25)',
                  backdropFilter: 'blur(8px)',
                }}
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <span
                  className="text-3xl font-bold"
                  style={{ color: '#D4722A', fontFamily: 'Georgia, serif' }}
                >
                  G
                </span>
              </motion.div>
              <motion.p
                className="text-sm font-semibold tracking-[0.3em] uppercase"
                style={{ color: '#B85E1E' }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Processing Your Booking…
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main content ── */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <AnimatePresence>
          {(step === 'reveal' || step === 'done') && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-lg"
            >

              {/* ── Character ── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="mb-4 flex flex-col items-center"
              >
                <ConciergeCharacter />

                {/* Speech bubble */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5, type: 'spring', bounce: 0.4 }}
                  className="relative -mt-2 max-w-xs rounded-2xl px-5 py-3 text-center"
                  style={{
                    // Warm white card surface from --card token
                    background: '#FDF9F4',
                    border: '1.5px solid rgba(212,114,42,0.2)',
                    boxShadow: '0 4px 24px -2px rgba(212,114,42,0.12)',
                  }}
                >
                  {/* Triangle pointer */}
                  <div
                    className="absolute -top-2 left-1/2 -translate-x-1/2 h-0 w-0"
                    style={{
                      borderLeft: '8px solid transparent',
                      borderRight: '8px solid transparent',
                      borderBottom: '8px solid rgba(212,114,42,0.2)',
                    }}
                  />
                  <p className="text-sm font-medium" style={{ color: '#57534E' }}>
                    Welcome,{' '}
                    <span style={{ color: '#D4722A', fontWeight: 700 }}>
                      {booking?.guest_name?.split(' ')[0] ?? 'valued guest'}
                    </span>
                    ! We{"'"}re thrilled to have you.
                  </p>
                </motion.div>
              </motion.div>

              {/* ── Status badge ── */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mb-6 flex flex-col items-center gap-3"
              >
                <motion.div
                  className="flex h-16 w-16 items-center justify-center rounded-full"
                  style={{ background: 'linear-gradient(135deg, #D4722A, #e8943a)' }}
                  animate={{
                    boxShadow: [
                      '0 0 0 0 rgba(212,114,42,0.3)',
                      '0 0 0 20px rgba(212,114,42,0)',
                      '0 0 0 0 rgba(212,114,42,0)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <CheckCircle className="h-8 w-8 text-white" />
                </motion.div>
                <div className="text-center">
                  <p
                    className="text-xs font-semibold tracking-[0.25em] uppercase mb-1"
                    style={{ color: '#B85E1E' }}
                  >
                    Booking Received
                  </p>
                  <h1
                    className="text-3xl font-bold"
                    style={{ color: '#1C1917', fontFamily: 'Georgia, serif' }}
                  >
                    {booking?.confirmation_no ?? '—'}
                  </h1>
                </div>
              </motion.div>

              {/* ── Email notice card ── */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="mb-4 overflow-hidden rounded-2xl"
                style={{
                  background: '#FDF9F4',        // --card
                  border: '1.5px solid #F0EDE8', // --border
                  boxShadow: '0 4px 24px -2px rgba(0,0,0,0.06), 0 2px 8px -2px rgba(0,0,0,0.03)',
                }}
              >
                {/* Top strip */}
                <div
                  className="flex items-center gap-3 border-b px-5 py-3"
                  style={{ borderColor: '#F0EDE8' }}
                >
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ background: 'rgba(212,114,42,0.1)' }}
                  >
                    <Clock className="h-4 w-4" style={{ color: '#D4722A' }} />
                  </div>
                  <div>
                    <p
                      className="text-xs font-bold uppercase tracking-[0.18em]"
                      style={{ color: '#D4722A' }}
                    >
                      Pending Review
                    </p>
                    <p className="text-[11px]" style={{ color: '#A8A29E' }}>
                      Our team is reviewing your request
                    </p>
                  </div>
                  {/* Animated dot */}
                  <motion.div
                    className="ml-auto h-2.5 w-2.5 rounded-full"
                    style={{ background: '#D4722A' }}
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                  />
                </div>

                {/* Body */}
                <div className="px-5 py-4 space-y-2">
                  {isJazzCash && (paymentStatus === 'pending_verification' || paymentStatus === 'pending') ? (
                    <>
                      <p className="text-sm leading-relaxed" style={{ color: '#292524' }}>
                        We have received your payment proof and are verifying it. Thank you — this helps us confirm your booking faster.
                      </p>
                      <p className="text-sm leading-relaxed" style={{ color: '#78716C' }}>
                        We will send you a <span className="font-semibold" style={{ color: '#292524' }}>receipt</span> along with the confirmation email. Your booking is under review and will be confirmed once verification is complete.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm leading-relaxed" style={{ color: '#292524' }}>
                        Your booking has been received and is currently under review by our reservations team.
                      </p>
                      <p className="text-sm leading-relaxed" style={{ color: '#78716C' }}>
                        Once confirmed, you will receive a{' '}
                        <span className="font-semibold" style={{ color: '#292524' }}>
                          confirmation email
                        </span>{' '}
                        with your full booking details and check-in instructions.
                      </p>
                    </>
                  )}
                </div>
              </motion.div>

              {/* ── Booking summary card ── */}
              {booking && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65, duration: 0.5 }}
                  className="mb-5 overflow-hidden rounded-2xl"
                  style={{
                    background: '#FDF9F4',
                    border: '1.5px solid #F0EDE8',
                    boxShadow: '0 4px 24px -2px rgba(0,0,0,0.06), 0 2px 8px -2px rgba(0,0,0,0.03)',
                  }}
                >
                  <div className="grid grid-cols-2 divide-x" style={{ borderColor: '#F0EDE8' }}>
                    {[
                      { icon: MapPin,    label: 'Property',  value: `${booking.hotel_name}, ${booking.hotel_city}` },
                      { icon: BedDouble, label: 'Room',      value: booking.room_type                             },
                      { icon: Calendar,  label: 'Check-In',  value: formatDate(booking.check_in_date)             },
                      { icon: Calendar,  label: 'Check-Out', value: formatDate(booking.check_out_date)            },
                    ].map((item, i) => (
                      <motion.div
                        key={item.label}
                        className="flex flex-col gap-1 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.75 + i * 0.08 }}
                        style={{ borderBottom: i < 2 ? '1px solid #F0EDE8' : undefined }}
                      >
                        <div className="flex items-center gap-1.5">
                          <item.icon className="h-3 w-3 flex-shrink-0" style={{ color: '#D4722A' }} />
                          <p
                            className="text-[10px] font-bold uppercase tracking-[0.18em]"
                            style={{ color: '#A8A29E' }}
                          >
                            {item.label}
                          </p>
                        </div>
                        <p
                          className="text-xs font-semibold leading-snug"
                          style={{ color: '#292524' }}
                        >
                          {item.value}
                        </p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Total / Advance display */}
                  <div
                    className="flex items-center justify-between px-5 py-3"
                    style={{
                      borderTop: '1.5px solid #F0EDE8',
                      background: 'rgba(212,114,42,0.05)',
                    }}
                  >
                    {isJazzCash && advanceAmount > 0 ? (
                      <>
                        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#78716C' }}>Advance Paid</p>
                        <p className="text-base font-bold" style={{ color: '#D4722A' }}>{formatCurrency(advanceAmount)}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#78716C' }}>Total Amount</p>
                        <p className="text-base font-bold" style={{ color: '#D4722A' }}>{formatCurrency(booking.total_amount)}</p>
                      </>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ── CTA buttons ── */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                className="flex flex-col gap-3 sm:flex-row"
              >
                <Link
                  href="/my-account"
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold transition-all hover:opacity-90 active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #D4722A, #e8943a)',
                    color: 'white',
                    boxShadow: '0 4px 24px -2px rgba(212,114,42,0.35)',
                  }}
                >
                  View My Bookings
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="https://grand-azure-hotels-system.vercel.app/"
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition-all hover:opacity-80 active:scale-95"
                  style={{
                    background: '#FDF9F4',
                    border: '1.5px solid #E7E3DC',
                    color: '#292524',
                    boxShadow: '0 2px 8px -2px rgba(0,0,0,0.06)',
                  }}
                >
                  Back to Home
                </Link>
              </motion.div>

              {/* Footer note */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="mt-5 text-center text-[11px]"
                style={{ color: '#A8A29E' }}
              >
                Grand Azure Hotel Group &nbsp;·&nbsp; Karachi · Lahore · Islamabad
                <br />
                <a
                  href="https://grand-azure-hotels-system.vercel.app/"
                  className="hover:underline"
                  style={{ color: '#78716C' }}
                >
                  grand-azure-hotels-system.vercel.app
                </a>
              </motion.p>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}