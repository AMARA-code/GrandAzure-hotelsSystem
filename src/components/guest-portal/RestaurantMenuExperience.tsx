'use client'

import { useMemo, useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform, useScroll, useInView } from 'framer-motion'
import { toast } from 'sonner'
import {
  BadgePercent,
  BedDouble,
  Flame,
  Minus,
  Plus,
  ShoppingCart,
  Sparkles,
  Trash2,
  UtensilsCrossed,
  X,
  ChevronRight,
  Clock,
  ArrowRight,
  Leaf,
  Award,
  Phone,
} from 'lucide-react'
import { DEFAULT_MENU, FOOD_PLACEHOLDER_IMAGES, type MenuItem } from '@/lib/guest-portal/restaurant-menu'
import { formatCurrency } from '@/lib/utils/formatters'
import Image from 'next/image'

/* ─── Types ─────────────────────────────────────────────────────────────── */
type RestaurantType = {
  restaurant_id: number
  hotel_id: number
  restaurant_name: string
  cuisine_type: string | null
  open_time: string | null
  close_time: string | null
  hotel_name?: string
  city?: string
}

type OrderType = 'dine_in' | 'room_service' | 'takeaway'

type CartLine = {
  item: MenuItem
  qty: number
}

/* ─── Palette ─────────────────────────────────────────────────────────────── */
const PASTEL_CARDS = [
  { bg: '#FFF4ED', border: '#F5C9A8', accent: '#D4722A', tag: '#FDE8D4' },
  { bg: '#EFF6FF', border: '#BFDBFE', accent: '#2563EB', tag: '#DBEAFE' },
  { bg: '#F0FDF4', border: '#BBF7D0', accent: '#16A34A', tag: '#DCFCE7' },
  { bg: '#FDF4FF', border: '#E9D5FF', accent: '#9333EA', tag: '#F3E8FF' },
  { bg: '#FFF7ED', border: '#FED7AA', accent: '#EA580C', tag: '#FFEDD5' },
  { bg: '#F0F9FF', border: '#BAE6FD', accent: '#0284C7', tag: '#E0F2FE' },
]

/* ─── Floating 3D Orb ────────────────────────────────────────────────────── */
function FloatingOrb({ x, y, size, color, delay = 0 }: { x: string; y: string; size: number; color: string; delay?: number }) {
  return (
    <motion.div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        filter: 'blur(60px)',
        opacity: 0.35,
        pointerEvents: 'none',
      }}
      animate={{
        y: [0, -30, 0, 20, 0],
        x: [0, 15, -10, 0],
        scale: [1, 1.08, 0.96, 1],
      }}
      transition={{
        duration: 12 + delay * 2,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    />
  )
}

/* ─── 3D Rotating Plate ─────────────────────────────────────────────────── */
function RotatingPlate({ emoji, style }: { emoji: string; style?: React.CSSProperties }) {
  return (
    <motion.div
      style={{
        position: 'absolute',
        fontSize: '3.5rem',
        filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.18))',
        transformStyle: 'preserve-3d',
        ...style,
      }}
      animate={{
        rotateY: [0, 15, -10, 0],
        rotateX: [0, -10, 8, 0],
        y: [0, -20, 10, 0],
      }}
      transition={{
        duration: 7,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {emoji}
    </motion.div>
  )
}

/* ─── Tilt Card ─────────────────────────────────────────────────────────── */
function TiltCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [7, -7]), { stiffness: 280, damping: 28 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-7, 7]), { stiffness: 280, damping: 28 })
  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    x.set((e.clientX - r.left) / r.width - 0.5)
    y.set((e.clientY - r.top) / r.height - 0.5)
  }
  function onLeave() { x.set(0); y.set(0) }
  return (
    <motion.div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 900 }}>
      {children}
    </motion.div>
  )
}

/* ─── Stat Counter ──────────────────────────────────────────────────────── */
function StatBadge({ value, label, icon: Icon, palette }: { value: string; label: string; icon: any; palette: typeof PASTEL_CARDS[0] }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24, scale: 0.9 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
      style={{
        background: palette.bg,
        border: `1.5px solid ${palette.border}`,
        borderRadius: 20,
        padding: '1.25rem 1rem',
        textAlign: 'center',
      }}
    >
      <Icon style={{ width: 24, height: 24, color: palette.accent, margin: '0 auto 8px' }} />
      <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.8rem', fontWeight: 700, color: palette.accent }}>{value}</div>
      <div style={{ fontSize: '0.72rem', color: '#78716C', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>{label}</div>
    </motion.div>
  )
}

/* ─── Animated Clock ────────────────────────────────────────────────────── */
function useTickingClock() {
  const now = new Date()
  const [tick, setTick] = useState({ s: now.getSeconds(), m: now.getMinutes(), h: now.getHours() % 12 })
  useEffect(() => {
    const id = setInterval(() => {
      const d = new Date()
      setTick({ s: d.getSeconds(), m: d.getMinutes(), h: d.getHours() % 12 })
    }, 1000)
    return () => clearInterval(id)
  }, [])
  return tick
}

function ClockFace() {
  const { s, m, h } = useTickingClock()
  const sDeg = s * 6
  const mDeg = m * 6 + s * 0.1
  const hDeg = h * 30 + m * 0.5

  const cx = 60, cy = 60, R = 58
  const toRad = (deg: number) => (deg - 90) * Math.PI / 180
  const pt = (deg: number, r: number) => ({
    x: cx + r * Math.cos(toRad(deg)),
    y: cy + r * Math.sin(toRad(deg)),
  })

  // Arc helper: sweep from 0 to deg around center
  const arc = (deg: number, r: number) => {
    if (deg <= 0) return ''
    const clamped = Math.min(deg, 359.9)
    const end = pt(clamped, r)
    const large = clamped > 180 ? 1 : 0
    return `M ${cx} ${cy - r} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`
  }

  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      <defs>
        <radialGradient id="clockBg" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFFBF7" />
          <stop offset="100%" stopColor="#FFF0E0" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(212,114,42,0.18)" />
        </filter>
      </defs>

      {/* Face */}
      <circle cx={cx} cy={cy} r={R} fill="url(#clockBg)" filter="url(#shadow)" />
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="#F5C9A8" strokeWidth="1.5" />

      {/* Outer ornament ring — dotted */}
      <circle cx={cx} cy={cy} r={R - 6} fill="none" stroke="rgba(212,114,42,0.12)" strokeWidth="0.8" strokeDasharray="1.5 4" />

      {/* Hour arc track */}
      <circle cx={cx} cy={cy} r={44} fill="none" stroke="rgba(212,114,42,0.08)" strokeWidth="4" strokeLinecap="round" />
      {/* Hour arc fill */}
      <path d={arc(hDeg, 44)} fill="none" stroke="rgba(212,114,42,0.35)" strokeWidth="4" strokeLinecap="round" />

      {/* Minute arc track */}
      <circle cx={cx} cy={cy} r={36} fill="none" stroke="rgba(212,114,42,0.06)" strokeWidth="3" strokeLinecap="round" />
      {/* Minute arc fill */}
      <path d={arc(mDeg, 36)} fill="none" stroke="#D4722A" strokeWidth="3" strokeLinecap="round" opacity="0.7" />

      {/* Hour tick marks */}
      {Array.from({ length: 60 }).map((_, i) => {
        const isMajor = i % 5 === 0
        const isQuarter = i % 15 === 0
        const inner = isMajor ? (isQuarter ? R - 14 : R - 11) : R - 8
        const outer = R - 3
        const deg = i * 6
        const p1 = pt(deg, inner), p2 = pt(deg, outer)
        return (
          <line key={i}
            x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
            stroke={isQuarter ? '#D4722A' : isMajor ? 'rgba(212,114,42,0.55)' : 'rgba(212,114,42,0.2)'}
            strokeWidth={isQuarter ? 2 : isMajor ? 1.2 : 0.7}
            strokeLinecap="round"
          />
        )
      })}

      {/* Quarter dots */}
      {[0, 90, 180, 270].map((deg) => {
        const p = pt(deg, R - 10)
        return <circle key={deg} cx={p.x} cy={p.y} r="2.5" fill="#D4722A" opacity="0.7" />
      })}

      {/* Hour hand */}
      {(() => {
        const tip = pt(hDeg, 24), tail = pt(hDeg + 180, 6)
        return <line x1={tail.x} y1={tail.y} x2={tip.x} y2={tip.y} stroke="#1C1917" strokeWidth="3.5" strokeLinecap="round" filter="url(#glow)" />
      })()}

      {/* Minute hand */}
      {(() => {
        const tip = pt(mDeg, 33), tail = pt(mDeg + 180, 7)
        return <line x1={tail.x} y1={tail.y} x2={tip.x} y2={tip.y} stroke="#D4722A" strokeWidth="2.5" strokeLinecap="round" filter="url(#glow)" />
      })()}

      {/* Second hand */}
      {(() => {
        const tip = pt(sDeg, 37), tail = pt(sDeg + 180, 10)
        return (
          <g style={{ transition: 'transform 0.15s linear' }}>
            <line x1={tail.x} y1={tail.y} x2={tip.x} y2={tip.y} stroke="#EA580C" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx={pt(sDeg, 30).x} cy={pt(sDeg, 30).y} r="2" fill="#EA580C" />
          </g>
        )
      })()}

      {/* Center jewel */}
      <circle cx={cx} cy={cy} r="5.5" fill="#D4722A" filter="url(#glow)" />
      <circle cx={cx} cy={cy} r="3" fill="#FFF4ED" />
      <circle cx={cx - 1} cy={cy - 1} r="1" fill="rgba(255,255,255,0.8)" />
    </svg>
  )
}

/* ─── Floating Particle ─────────────────────────────────────────────────── */
function Particle({ x, y, size, color, delay }: { x: string; y: string; size: number; color: string; delay: number }) {
  return (
    <motion.div
      style={{ position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: '50%', background: color, pointerEvents: 'none', zIndex: 0 }}
      animate={{ y: [0, -16, 5, -9, 0], x: [0, 5, -3, 2, 0], opacity: [0.45, 0.9, 0.55, 0.85, 0.45], scale: [1, 1.25, 0.85, 1.1, 1] }}
      transition={{ duration: 7 + delay * 1.5, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  )
}

/* ─── Hero Right Panel ──────────────────────────────────────────────────── */
function HeroRightPanel({ restaurant }: { restaurant?: { restaurant_name: string; cuisine_type: string | null; open_time: string | null; close_time: string | null; hotel_name?: string; city?: string } }) {
  const [activeIdx, setActiveIdx] = useState(0)

  const HIGHLIGHTS = [
    { emoji: '🍖', label: 'Slow-Roasted Lamb',     sub: 'Signature · 4 hrs',  palette: PASTEL_CARDS[0] },
    { emoji: '🐟', label: 'Pan-Seared Sea Bass',   sub: "Chef's Choice",       palette: PASTEL_CARDS[1] },
    { emoji: '🍄', label: 'Wild Mushroom Risotto',  sub: 'Vegetarian',          palette: PASTEL_CARDS[2] },
    { emoji: '🥩', label: 'Truffle Tenderloin',     sub: 'Signature · Rare',   palette: PASTEL_CARDS[3] },
  ]
  useEffect(() => {
    const id = setInterval(() => setActiveIdx(i => (i + 1) % HIGHLIGHTS.length), 3200)
    return () => clearInterval(id)
  }, [])

  const isOpen = (() => {
    if (!restaurant?.open_time || !restaurant?.close_time) return true
    const now = new Date()
    const [oh, om] = restaurant.open_time.split(':').map(Number)
    const [ch, cm] = restaurant.close_time.split(':').map(Number)
    const cur = now.getHours() * 60 + now.getMinutes()
    return cur >= oh * 60 + om && cur <= ch * 60 + cm
  })()

  const cuisineTags = restaurant?.cuisine_type
    ? restaurant.cuisine_type.split(',').map((s: string) => s.trim()).filter(Boolean)
    : ['Continental', 'Asian Fusion', 'Grill']

  const PARTICLES = [
    { x: '6%',  y: '10%', size: 7,  color: '#FDE8D4', delay: 0   },
    { x: '88%', y: '16%', size: 9,  color: '#DBEAFE', delay: 1   },
    { x: '18%', y: '80%', size: 6,  color: '#DCFCE7', delay: 2   },
    { x: '78%', y: '74%', size: 8,  color: '#F3E8FF', delay: 0.5 },
    { x: '52%', y: '4%',  size: 5,  color: '#FED7AA', delay: 1.5 },
    { x: '93%', y: '48%', size: 5,  color: '#FDE8D4', delay: 2.5 },
    { x: '3%',  y: '50%', size: 7,  color: '#DCFCE7', delay: 3   },
    { x: '62%', y: '90%', size: 6,  color: '#DBEAFE', delay: 1.2 },
  ]

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 400 }}>
      {PARTICLES.map((p, i) => <Particle key={i} {...p} />)}

      {/* Ambient glow */}
      <motion.div
        animate={{ scale: [1, 1.07, 0.96, 1], opacity: [0.35, 0.52, 0.38, 0.35] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', top: '15%', left: '10%', right: '10%', bottom: '15%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,201,168,0.38) 0%, rgba(219,234,254,0.14) 60%, transparent 80%)', filter: 'blur(32px)', pointerEvents: 'none', zIndex: 0 }}
      />

      {/* Outer dashed ring */}
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 42, repeat: Infinity, ease: 'linear' }} style={{ position: 'absolute', top: '50%', left: '50%', width: 330, height: 330, marginTop: -165, marginLeft: -165, borderRadius: '50%', border: '1.5px dashed rgba(212,114,42,0.14)', pointerEvents: 'none', zIndex: 0 }} />
      <motion.div animate={{ rotate: -360 }} transition={{ duration: 27, repeat: Infinity, ease: 'linear' }} style={{ position: 'absolute', top: '50%', left: '50%', width: 220, height: 220, marginTop: -110, marginLeft: -110, borderRadius: '50%', border: '1px dotted rgba(212,114,42,0.10)', pointerEvents: 'none', zIndex: 0 }} />

      {/* ── Row 1: Clock + Open status ── */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 12, marginBottom: 12, alignItems: 'stretch' }}>

        {/* Clock */}
        <motion.div
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
          style={{ background: '#FFF4ED', border: '1.5px solid #F5C9A8', borderRadius: 20, padding: '14px 14px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 4px 20px rgba(212,114,42,0.10)', flexShrink: 0 }}
        >
          <ClockFace />
          <div style={{ fontSize: '0.58rem', fontWeight: 700, color: '#D4722A', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center' }}>
            {restaurant?.open_time && restaurant?.close_time ? `${restaurant.open_time} – ${restaurant.close_time}` : 'Open Daily'}
          </div>
        </motion.div>

        {/* Open/Closed — fills remaining height */}
        <motion.div
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.45 }}
          style={{ background: isOpen ? '#F0FDF4' : '#FFF1F2', border: `1.5px solid ${isOpen ? '#BBF7D0' : '#FECDD3'}`, borderRadius: 20, padding: '20px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12, flex: 1 }}
        >
          {/* Pulsing status dot + label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ position: 'relative', width: 12, height: 12, flexShrink: 0 }}>
              <motion.div
                animate={{ scale: [1, 2.2, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: isOpen ? '#22C55E' : '#F43F5E' }}
              />
              <div style={{ position: 'absolute', inset: 2, borderRadius: '50%', background: isOpen ? '#22C55E' : '#F43F5E' }} />
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: isOpen ? '#15803D' : '#BE123C' }}>
              {isOpen ? 'Currently Open' : 'Currently Closed'}
            </div>
          </div>
          <div style={{ fontSize: '0.7rem', color: '#78716C', lineHeight: 1.5 }}>
            <strong style={{ color: '#1C1917', display: 'block', marginBottom: 2 }}>{restaurant?.restaurant_name ?? 'Grand Azure Restaurant'}</strong>
            {restaurant?.hotel_name && <span style={{ display: 'block' }}>{restaurant.hotel_name}</span>}
            {restaurant?.city && <span style={{ color: '#D4722A' }}>📍 {restaurant.city}</span>}
          </div>
        </motion.div>
      </div>

      {/* ── Row 2: Rotating spotlight ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7 }}
        style={{ position: 'relative', zIndex: 1, background: HIGHLIGHTS[activeIdx].palette.bg, border: `1.5px solid ${HIGHLIGHTS[activeIdx].palette.border}`, borderRadius: 20, padding: '15px 18px', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12, boxShadow: `0 4px 24px ${HIGHLIGHTS[activeIdx].palette.border}`, transition: 'background 0.6s ease, border-color 0.6s ease, box-shadow 0.6s ease', overflow: 'hidden' }}
      >
        {/* Shimmer sweep */}
        <motion.div
          animate={{ x: ['-100%', '220%'] }}
          transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.6, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: 0, left: 0, width: '38%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.38), transparent)', pointerEvents: 'none', zIndex: 0 }}
        />
        <AnimatePresence mode="wait">
          <motion.div key={activeIdx} initial={{ scale: 0.5, opacity: 0, rotate: -18 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} exit={{ scale: 0.5, opacity: 0, rotate: 18 }} transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }} style={{ fontSize: '2.6rem', flexShrink: 0, zIndex: 1 }}>
            {HIGHLIGHTS[activeIdx].emoji}
          </motion.div>
        </AnimatePresence>
        <div style={{ zIndex: 1, flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.57rem', fontWeight: 700, color: HIGHLIGHTS[activeIdx].palette.accent, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 3 }}>Chef's Spotlight</div>
          <AnimatePresence mode="wait">
            <motion.div key={activeIdx + 'l'} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.32 }} style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '0.98rem', fontWeight: 600, color: '#1C1917', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {HIGHLIGHTS[activeIdx].label}
            </motion.div>
          </AnimatePresence>
          <div style={{ fontSize: '0.62rem', color: '#78716C', marginTop: 3 }}>{HIGHLIGHTS[activeIdx].sub}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, zIndex: 1 }}>
          {HIGHLIGHTS.map((_, i) => (
            <motion.div key={i} animate={{ scale: i === activeIdx ? 1 : 0.65, opacity: i === activeIdx ? 1 : 0.3 }} style={{ width: 6, height: 6, borderRadius: '50%', background: HIGHLIGHTS[activeIdx].palette.accent }} />
          ))}
        </div>
      </motion.div>

      {/* ── Row 3: Real cuisine tags + city ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.9 }}
        style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', gap: 7 }}
      >
        {cuisineTags.map((tag: string, i: number) => (
          <motion.div key={tag} initial={{ opacity: 0, scale: 0.75 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.95 + i * 0.08, type: 'spring', stiffness: 280 }} whileHover={{ y: -2, scale: 1.06 }}
            style={{ background: PASTEL_CARDS[i % PASTEL_CARDS.length].bg, border: `1.5px solid ${PASTEL_CARDS[i % PASTEL_CARDS.length].border}`, borderRadius: 999, padding: '5px 13px', fontSize: '0.68rem', fontWeight: 600, color: PASTEL_CARDS[i % PASTEL_CARDS.length].accent }}>
            {tag}
          </motion.div>
        ))}
        {restaurant?.city && (
          <motion.div initial={{ opacity: 0, scale: 0.75 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.1, type: 'spring', stiffness: 280 }} whileHover={{ y: -2 }}
            style={{ background: '#FFF7ED', border: '1.5px solid #FED7AA', borderRadius: 999, padding: '5px 13px', fontSize: '0.68rem', fontWeight: 600, color: '#EA580C', display: 'flex', alignItems: 'center', gap: 5 }}>
            📍 {restaurant.city}
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function spicyLabel(level: number | undefined) {
  if (!level) return null
  if (level === 1) return 'Mild'
  if (level === 2) return 'Medium'
  return 'Spicy'
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function RestaurantMenuExperience({
  restaurants,
  guestId,
}: {
  restaurants: RestaurantType[]
  guestId: number | null
}) {
  const [restaurantId, setRestaurantId] = useState<number>(restaurants[0]?.restaurant_id ?? 0)
  const [orderType, setOrderType] = useState<OrderType>('dine_in')
  const [tableNo, setTableNo] = useState('')
  const [chargedToRoom, setChargedToRoom] = useState(false)
  const [notes, setNotes] = useState('')
  const [activeCategoryId, setActiveCategoryId] = useState<'all' | string>('all')
  const [cartOpen, setCartOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [cart, setCart] = useState<Record<string, CartLine>>({})
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const heroParallaxY = useTransform(scrollY, [0, 400], [0, 80])

  const allCategories = useMemo(
    () => [{ id: 'all', name: 'All', items: [] as MenuItem[] }, ...DEFAULT_MENU.categories],
    []
  )
  const categoriesToRender = useMemo(() => {
    if (activeCategoryId === 'all') return DEFAULT_MENU.categories
    return DEFAULT_MENU.categories.filter((cat) => cat.id === activeCategoryId)
  }, [activeCategoryId])

  const cartLines = useMemo(() => Object.values(cart), [cart])
  const subtotal = useMemo(() => cartLines.reduce((sum, l) => sum + l.item.price * l.qty, 0), [cartLines])
  const serviceCharge = useMemo(() => Math.round(subtotal * 0.05), [subtotal])
  const tax = useMemo(() => Math.round(subtotal * 0.16), [subtotal])
  const total = subtotal + serviceCharge + tax
  const totalItems = cartLines.reduce((s, l) => s + l.qty, 0)

  const addItem = (item: MenuItem) =>
    setCart((p) => ({ ...p, [item.id]: { item, qty: (p[item.id]?.qty ?? 0) + 1 } }))
  const decItem = (id: string) =>
    setCart((p) => {
      const e = p[id]
      if (!e) return p
      if (e.qty <= 1) { const { [id]: _, ...r } = p; return r }
      return { ...p, [id]: { ...e, qty: e.qty - 1 } }
    })
  const incItem = (id: string) =>
    setCart((p) => p[id] ? { ...p, [id]: { ...p[id], qty: p[id].qty + 1 } } : p)
  const clearCart = () => setCart({})

  const placeOrder = async () => {
    if (!restaurantId) { toast.error('Please select a restaurant outlet.'); return }
    if (!cartLines.length) { toast.error('Your cart is empty.'); return }
    if (orderType === 'dine_in' && !tableNo) { toast.error('Please enter table number.'); return }
    setSubmitting(true)
    try {
      const payload: any = {
        restaurant_id: restaurantId,
        order_type: orderType,
        table_no: orderType === 'dine_in' ? tableNo : null,
        total_amount: String(total),
        charged_to_room: chargedToRoom,
        notes: JSON.stringify({ guestNotes: notes || null, breakdown: { subtotal, serviceCharge, tax, total }, items: cartLines.map((l) => ({ id: l.item.id, name: l.item.name, qty: l.qty, unitPrice: l.item.price, lineTotal: l.item.price * l.qty })) }),
        taken_by: 1, status: 'pending', guest_id: guestId,
      }
      const res = await fetch('/api/restaurant-orders', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error ?? 'Failed to place order'); return }
      toast.success('Your order has been placed.')
      clearCart(); setNotes(''); setTableNo(''); setCartOpen(false)
    } finally { setSubmitting(false) }
  }

  const activeRestaurant = restaurants.find((r) => r.restaurant_id === restaurantId)

  return (
    <div style={{ background: '#FAFAF7', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", color: '#1C1917', overflowX: 'hidden' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        .pg { width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 1.25rem; }
        @media (min-width: 640px)  { .pg { padding: 0 1.75rem; } }
        @media (min-width: 1024px) { .pg { padding: 0 2.5rem; } }

        .sec { padding: 3rem 0; }
        @media (min-width: 768px) { .sec { padding: 5rem 0; } }

        .serif { font-family: 'Playfair Display', Georgia, serif; font-weight: 600; line-height: 1.12; letter-spacing: -0.02em; color: #1C1917; }

        /* ── HERO ── */
        .hero-wrapper {
          position: relative;
          overflow: hidden;
          padding: 1.75rem 0 1.75rem;
          background: linear-gradient(135deg, #FDF6EE 0%, #FEF0E6 25%, #FDF4FF 55%, #EFF8FF 80%, #F0FDF6 100%);
          min-height: auto;
          display: flex;
          align-items: center;
        }
        @media (min-width: 640px) { .hero-wrapper { padding: 2.25rem 0 2rem; } }
        @media (min-width: 768px) { .hero-wrapper { padding: 3rem 0 2.5rem; min-height: 520px; } }
        @media (min-width: 900px) { .hero-wrapper { padding: 3.5rem 0 3rem; min-height: 580px; } }

        /* Grain texture overlay */
        .hero-wrapper::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
          opacity: 0.55;
          pointer-events: none;
          z-index: 0;
        }

        /* Diagonal editorial lines */
        .hero-wrapper::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 56px,
            rgba(212,114,42,0.018) 56px,
            rgba(212,114,42,0.018) 57px
          );
          pointer-events: none;
          z-index: 0;
        }

        /* Hero two-column layout */
        .hero-inner {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          position: relative;
          z-index: 2;
          width: 100%;
        }
        @media (min-width: 900px) {
          .hero-inner { flex-direction: row; align-items: center; gap: 2.5rem; }
          .hero-left { flex: 0 0 52%; }
          .hero-right { flex: 1; align-items: center; }
        }

        /* Hide hero right panel on very small screens */
        .hero-right { display: none; }
        @media (min-width: 560px) { .hero-right { display: flex; justify-content: center; align-items: center; position: relative; } }

        /* Decorative divider */
        .hero-divider {
          width: 48px;
          height: 2px;
          background: linear-gradient(to right, #D4722A, transparent);
          margin: 0.75rem 0;
        }
        @media (min-width: 768px) { .hero-divider { margin: 1rem 0; } }

        /* Controls card */
        .controls-card { background: #fff; border: 1.5px solid #E7E3DC; border-radius: 18px; padding: 1.25rem; box-shadow: 0 4px 32px rgba(28,25,23,0.06); }
        @media (min-width: 640px) { .controls-card { padding: 1.5rem; border-radius: 20px; } }
        @media (min-width: 768px) { .controls-card { padding: 2rem; border-radius: 24px; } }

        /* Order type pills — stack to 1 col on very small screens */
        .order-pills-grid { display: grid; grid-template-columns: 1fr; gap: 8px; }
        @media (min-width: 400px) { .order-pills-grid { grid-template-columns: repeat(3, 1fr); gap: 10px; } }

        .order-pill { border: 2px solid #E7E3DC; background: #fff; border-radius: 12px; padding: 0.65rem 0.75rem; cursor: pointer; transition: all 0.22s; text-align: center; display: flex; align-items: center; gap: 10px; justify-content: flex-start; }
        @media (min-width: 400px) { .order-pill { border-radius: 14px; padding: 0.75rem 0.5rem; flex-direction: column; align-items: center; justify-content: center; gap: 0; } }
        .order-pill:hover { border-color: #F5C9A8; background: #FFF4ED; }
        .order-pill.active { border-color: #D4722A; background: #FFF4ED; box-shadow: 0 4px 16px rgba(212,114,42,0.18); }
        .order-pill-label { font-size: 0.78rem; font-weight: 700; letter-spacing: 0.03em; color: #78716C; text-transform: uppercase; }
        @media (min-width: 400px) { .order-pill-label { font-size: 0.66rem; letter-spacing: 0.05em; margin-top: 6px; } }
        .order-pill.active .order-pill-label { color: #D4722A; }
        .order-pill-desc { font-size: 0.68rem; color: #A8A29E; }
        @media (min-width: 400px) { .order-pill-desc { font-size: 0.62rem; margin-top: 2px; } }

        /* Stats strip — 2×2 on mobile, 4-across on md+ */
        .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        @media (min-width: 560px) { .stats-grid { grid-template-columns: repeat(4, 1fr); } }

        /* Category tabs */
        .cat-bar { position: sticky; top: 0; z-index: 20; background: rgba(250,250,247,0.92); backdrop-filter: blur(12px); border-bottom: 1px solid #E7E3DC; padding: 0.65rem 0; }
        .cat-btn { white-space: nowrap; border-radius: 999px; padding: 0.4rem 0.9rem; font-size: 0.75rem; font-weight: 600; border: 1.5px solid #E7E3DC; background: #fff; color: #78716C; cursor: pointer; transition: all 0.2s; }
        @media (min-width: 640px) { .cat-btn { padding: 0.45rem 1.1rem; font-size: 0.8rem; } }
        .cat-btn:hover { border-color: #F5C9A8; color: #D4722A; }
        .cat-btn.active { background: #1C1917; border-color: #1C1917; color: #F5ECD5; box-shadow: 0 4px 16px rgba(28,25,23,0.22); }

        /* Cart FAB — compact on mobile */
        .cart-fab { position: fixed; bottom: 1.25rem; right: 1rem; z-index: 30; display: flex; align-items: center; gap: 8px; background: #1C1917; color: #F5ECD5; padding: 0.75rem 1.1rem; border-radius: 999px; font-size: 0.78rem; font-weight: 700; box-shadow: 0 8px 32px rgba(28,25,23,0.28); cursor: pointer; border: none; transition: all 0.22s; }
        .cart-fab:hover { background: #D4722A; transform: translateY(-3px); box-shadow: 0 12px 36px rgba(212,114,42,0.4); }
        @media (min-width: 640px) { .cart-fab { bottom: 1.75rem; right: 1.25rem; padding: 0.85rem 1.4rem; font-size: 0.82rem; } }
        @media (min-width: 768px) { .cart-fab { bottom: 2.5rem; right: 2.5rem; } }

        /* Food cards grid */
        .menu-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }
        @media (min-width: 480px) { .menu-grid { grid-template-columns: repeat(2, 1fr); gap: 1.25rem; } }
        @media (min-width: 1024px) { .menu-grid { grid-template-columns: repeat(3, 1fr); } }

        /* Input / select */
        .field { width: 100%; border: 1.5px solid #E7E3DC; border-radius: 12px; padding: 0.6rem 0.85rem; font-size: 0.85rem; font-family: inherit; color: #1C1917; background: #FAFAF7; outline: none; transition: border-color 0.18s; }
        .field:focus { border-color: #D4722A; background: #fff; }

        /* Dine-in sub-fields — stack on small screens */
        .dinein-grid { display: grid; grid-template-columns: 1fr; gap: 10px; }
        @media (min-width: 480px) { .dinein-grid { grid-template-columns: 1fr 1fr; gap: 12px; } }

        /* Cart drawer */
        .cart-sheet { background: #FAFAF7; border-radius: 24px 24px 0 0; overflow: hidden; width: 100%; max-width: 480px; }
        @media (min-width: 640px) { .cart-sheet { border-radius: 24px; } }

        /* Private dining card */
        .private-card {
          border-radius: 20px;
          overflow: hidden;
          position: relative;
          background: linear-gradient(135deg, #FFF4ED 0%, #FDF0FF 100%);
          border: 1.5px solid #F5C9A8;
        }
        @media (min-width: 768px) { .private-card { border-radius: 28px; } }

        /* ── Unified Add-to-order button ── */
        .btn-add {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #D4722A;
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 0.5rem 1.1rem;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(212,114,42,0.30);
          transition: background 0.18s, box-shadow 0.18s, transform 0.12s;
          font-family: inherit;
        }
        .btn-add:hover { background: #B85E20; box-shadow: 0 6px 20px rgba(212,114,42,0.45); }
        .btn-add:active { transform: scale(0.97); }
      `}</style>

      {/* ── HERO ── */}
      <section className="hero-wrapper" ref={heroRef}>
        {/* Very subtle warm orbs — far less saturated than before */}
        <FloatingOrb x="60%" y="-10%" size={380} color="radial-gradient(circle, rgba(245,201,168,0.4), rgba(253,232,212,0.15))" delay={0} />
        <FloatingOrb x="-10%" y="40%" size={300} color="radial-gradient(circle, rgba(219,234,254,0.3), rgba(237,233,254,0.1))" delay={3} />
        <FloatingOrb x="75%" y="60%" size={240} color="radial-gradient(circle, rgba(220,252,231,0.25), transparent)" delay={5} />

        <div className="pg">
          <div className="hero-inner">

            {/* ── LEFT: Heading + badges ── */}
            <div className="hero-left">
              <motion.div style={{ y: heroParallaxY }}>

                {/* Eyebrow */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}
                >
                  <div style={{ width: 32, height: 1.5, background: '#D4722A', borderRadius: 2 }} />
                  <span style={{ fontSize: '0.67rem', fontWeight: 700, color: '#D4722A', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                    Culinary Excellence
                  </span>
                </motion.div>

                {/* Main heading with stagger */}
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
                >
                  {['Dine Where', 'Flavours Live'].map((line, i) => (
                    <motion.div
                      key={i}
                      variants={{
                        hidden: { opacity: 0, y: 40, skewY: 4 },
                        visible: { opacity: 1, y: 0, skewY: 0 },
                      }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <h1 className="serif" style={{ fontSize: 'clamp(2.4rem, 6vw, 4.2rem)', marginBottom: '0.06em', lineHeight: 1.05 }}>
                        {i === 1 ? <em style={{ color: '#D4722A', fontStyle: 'italic' }}>{line}</em> : line}
                      </h1>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Decorative divider */}
                <div className="hero-divider" />

                {/* Sub */}
                <motion.p
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.45 }}
                  style={{ fontSize: 'clamp(0.83rem, 2vw, 0.96rem)', color: '#78716C', lineHeight: 1.85, maxWidth: 420, marginBottom: '1.75rem' }}
                >
                  {activeRestaurant
                    ? `${activeRestaurant.restaurant_name} · ${activeRestaurant.hotel_name} · ${activeRestaurant.city}`
                    : 'Curated menus, premium service, seamless ordering across all our properties.'}
                </motion.p>

                {/* Feature badges */}
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.55 } } }}
                  style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}
                >
                  {[
                    { icon: Award, label: 'Award-Winning Chefs', color: '#D4722A', bg: '#FDE8D4', border: '#F5C9A8' },
                    { icon: Leaf, label: 'Farm-to-Table', color: '#16A34A', bg: '#DCFCE7', border: '#BBF7D0' },
                    { icon: Sparkles, label: 'Curated Pairings', color: '#9333EA', bg: '#F3E8FF', border: '#E9D5FF' },
                  ].map((b) => (
                    <motion.div
                      key={b.label}
                      variants={{ hidden: { opacity: 0, y: 12, scale: 0.9 }, visible: { opacity: 1, y: 0, scale: 1 } }}
                      transition={{ type: 'spring', stiffness: 260 }}
                      style={{ display: 'flex', alignItems: 'center', gap: 7, background: b.bg, border: `1.5px solid ${b.border}`, borderRadius: 999, padding: '7px 14px', fontSize: '0.74rem', color: b.color, fontWeight: 600 }}
                    >
                      <b.icon style={{ width: 12, height: 12 }} />
                      {b.label}
                    </motion.div>
                  ))}
                </motion.div>

                {/* Social proof row */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.85 }}
                  style={{ marginTop: '1.75rem', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}
                >
                  <div style={{ display: 'flex' }}>
                    {['🧑‍🍳', '👨‍🍳', '👩‍🍳'].map((e, i) => (
                      <span key={i} style={{ fontSize: '1.2rem', marginLeft: i > 0 ? -6 : 0, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}>{e}</span>
                    ))}
                  </div>
                  <div style={{ width: 1, height: 28, background: '#E7E3DC' }} />
                  <span style={{ fontSize: '0.78rem', color: '#78716C', lineHeight: 1.5 }}>
                    Trusted by <strong style={{ color: '#1C1917' }}>800+</strong> guests daily
                  </span>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[1,2,3,4,5].map(i => (
                      <span key={i} style={{ color: '#F59E0B', fontSize: '0.75rem' }}>★</span>
                    ))}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#78716C' }}>4.9 / 5</span>
                </motion.div>
              </motion.div>
            </div>

            {/* ── RIGHT: Live restaurant panel ── */}
            <div className="hero-right" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <HeroRightPanel restaurant={activeRestaurant} />
            </div>

          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section style={{ background: '#F7F4EF', padding: '2.5rem 0 1rem' }}>
        <div className="pg">
          <div className="stats-grid" style={{ marginBottom: '2rem' }}>
            <StatBadge value="12+" label="Cuisines" icon={UtensilsCrossed} palette={PASTEL_CARDS[0]} />
            <StatBadge value="98%" label="Guest Satisfaction" icon={Award} palette={PASTEL_CARDS[2]} />
            <StatBadge value="5★" label="Michelin Rated" icon={Sparkles} palette={PASTEL_CARDS[3]} />
            <StatBadge value="30min" label="Avg Delivery" icon={Clock} palette={PASTEL_CARDS[1]} />
          </div>

          {/* Controls card */}
          <motion.div
            className="controls-card"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Outlet selector */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
              <div style={{ flex: '1 1 200px' }}>
                <span style={{ fontSize: '0.66rem', letterSpacing: '0.14em', color: '#D4722A', textTransform: 'uppercase', fontWeight: 700 }}>Select Outlet</span>
                <select value={restaurantId} onChange={(e) => setRestaurantId(Number(e.target.value))} className="field" style={{ marginTop: 8, display: 'block' }}>
                  {restaurants.map((r) => (
                    <option key={r.restaurant_id} value={r.restaurant_id}>{r.restaurant_name} — {r.hotel_name}</option>
                  ))}
                </select>
              </div>
              {activeRestaurant?.open_time && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#78716C', fontWeight: 500, paddingBottom: '0.4rem' }}>
                  <Clock style={{ width: 13, height: 13, color: '#D4722A' }} />
                  {activeRestaurant.open_time} – {activeRestaurant.close_time}
                </div>
              )}
            </div>

            {/* Order type */}
            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.66rem', letterSpacing: '0.14em', color: '#78716C', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: 10 }}>Order Type</span>
              <div className="order-pills-grid">
                {([
                  { key: 'dine_in', label: 'Dine-in', Icon: UtensilsCrossed, desc: 'At your table' },
                  { key: 'room_service', label: 'Room Service', Icon: BedDouble, desc: 'Delivered to room' },
                  { key: 'takeaway', label: 'Takeaway', Icon: BadgePercent, desc: 'Collect & go' },
                ] as const).map((t) => (
                  <button key={t.key} type="button" onClick={() => setOrderType(t.key)} className={`order-pill${orderType === t.key ? ' active' : ''}`}>
                    <t.Icon style={{ width: 20, height: 20, flexShrink: 0, color: orderType === t.key ? '#D4722A' : '#A8A29E' }} />
                    <div>
                      <div className="order-pill-label">{t.label}</div>
                      <div className="order-pill-desc">{t.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence>
              {orderType === 'dine_in' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                  <div className="dinein-grid" style={{ paddingTop: '0.5rem' }}>
                    <label>
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#78716C', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Table No.</span>
                      <input value={tableNo} onChange={(e) => setTableNo(e.target.value)} className="field" placeholder="e.g. T05" />
                    </label>
                    <div style={{ background: '#FDF4FF', border: '1.5px solid #E9D5FF', borderRadius: 12, padding: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#7C3AED', marginBottom: 2 }}>Charge to Room</p>
                          <p style={{ fontSize: '0.65rem', color: '#A78BFA' }}>In-house guests only</p>
                        </div>
                        <button type="button" onClick={() => setChargedToRoom((v) => !v)} style={{ position: 'relative', width: 44, height: 24, borderRadius: 999, background: chargedToRoom ? '#9333EA' : '#D1D5DB', border: 'none', cursor: 'pointer', transition: 'background 0.22s', flexShrink: 0 }}>
                          <motion.span animate={{ x: chargedToRoom ? 20 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} style={{ position: 'absolute', left: 2, top: 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', display: 'block', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* ── CATEGORY BAR ── */}
      <div className="cat-bar">
        <div className="pg">
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
            {allCategories.map((cat) => (
              <button key={cat.id} onClick={() => setActiveCategoryId(cat.id)} className={`cat-btn${activeCategoryId === cat.id ? ' active' : ''}`}>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── MENU SECTIONS ── */}
      <section className="sec">
        <div className="pg">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
            {categoriesToRender.map((cat, catIdx) => (
              <div key={cat.id}>
                <motion.div
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}
                >
                  <div>
                    <span style={{ fontSize: '0.66rem', letterSpacing: '0.16em', color: PASTEL_CARDS[catIdx % PASTEL_CARDS.length].accent, textTransform: 'uppercase', fontWeight: 700 }}>{cat.items.length} dishes</span>
                    <h2 className="serif" style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', marginTop: 4 }}>{cat.name}</h2>
                  </div>
                  <div style={{ height: 1, flex: 1, minWidth: 40, background: `linear-gradient(to right, ${PASTEL_CARDS[catIdx % PASTEL_CARDS.length].border}, transparent)`, marginBottom: 6, marginLeft: 16 }} />
                </motion.div>

                <div className="menu-grid">
                  {cat.items.map((item, idx) => {
                    const palette = PASTEL_CARDS[(idx + catIdx) % PASTEL_CARDS.length]
                    const inCart = cart[item.id]?.qty ?? 0
                    return (
                      <TiltCard key={item.id}>
                        <motion.article
                          initial={{ opacity: 0, y: 28 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                          whileHover={{ boxShadow: `0 20px 48px ${palette.accent}22` }}
                          style={{ background: palette.bg, border: `1.5px solid ${palette.border}`, borderRadius: 20, overflow: 'hidden', height: '100%' }}
                        >
                          <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                            <Image
                              src={item.imageSrc ?? FOOD_PLACEHOLDER_IMAGES[(idx + cat.items.length) % FOOD_PLACEHOLDER_IMAGES.length]}
                              alt={item.name} fill
                              sizes="(max-width: 560px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              style={{ objectFit: 'cover', transition: 'transform 0.7s ease' }}
                              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.transform = 'scale(1.08)')}
                              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.transform = 'scale(1)')}
                            />
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.38) 0%, transparent 55%)' }} />
                            <div style={{ position: 'absolute', top: 12, left: 12, background: palette.tag, border: `1px solid ${palette.border}`, borderRadius: 999, padding: '3px 12px', fontSize: '0.6rem', fontWeight: 700, color: palette.accent, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{cat.name}</div>
                            {item.spicyLevel && (
                              <div style={{ position: 'absolute', top: 12, right: 12, background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: 999, padding: '3px 10px', fontSize: '0.6rem', fontWeight: 700, color: '#E11D48', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Flame style={{ width: 10, height: 10 }} />{spicyLabel(item.spicyLevel)}
                              </div>
                            )}
                            <div style={{ position: 'absolute', bottom: 12, left: 12 }}>
                              <span className="serif" style={{ color: '#fff', fontSize: '1.3rem', textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>{formatCurrency(item.price)}</span>
                              <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)', marginLeft: 4 }}>/serving</span>
                            </div>
                          </div>
                          <div style={{ padding: '1.1rem 1.25rem 1.3rem' }}>
                            <h3 className="serif" style={{ fontSize: '1.1rem', marginBottom: 5 }}>{item.name}</h3>
                            <p style={{ fontSize: '0.8rem', color: '#78716C', lineHeight: 1.65, marginBottom: '0.85rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.description}</p>
                            {!!item.tags?.length && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: '0.9rem' }}>
                                {item.tags.map((t) => (
                                  <span key={t} style={{ background: palette.tag, border: `1px solid ${palette.border}`, borderRadius: 999, padding: '2px 9px', fontSize: '0.62rem', fontWeight: 600, color: palette.accent }}>{t}</span>
                                ))}
                              </div>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', borderTop: `1px solid ${palette.border}`, paddingTop: '0.85rem' }}>
                              <AnimatePresence mode="wait">
                                {inCart === 0 ? (
                                  <motion.button
                                    key="add"
                                    initial={{ opacity: 0, scale: 0.85 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.85 }}
                                    onClick={() => addItem(item)}
                                    className="btn-add"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.97 }}
                                  >
                                    <Plus style={{ width: 13, height: 13 }} /> Add to order
                                  </motion.button>
                                ) : (
                                  <motion.div key="qty" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#D4722A', border: `1.5px solid #D4722A`, borderRadius: 12, padding: '4px 8px' }}>
                                    <button onClick={() => decItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: '#fff', padding: 2 }}><Minus style={{ width: 14, height: 14 }} /></button>
                                                                        <span style={{ minWidth: 20, textAlign: 'center', fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>{inCart}</span>
                                    <button onClick={() => addItem(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: '#fff', padding: 2 }}><Plus style={{ width: 14, height: 14 }} /></button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </motion.article>
                      </TiltCard>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRIVATE DINING ── */}
      <section style={{ padding: '0 1.25rem 4rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <motion.div
            className="private-card"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div style={{ position: 'absolute', top: -60, right: -60, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,114,42,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -50, left: -50, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(147,51,234,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center', padding: '2.5rem 2rem' }}>
              <motion.div
                style={{ fontSize: '5rem', flexShrink: 0, transformStyle: 'preserve-3d', filter: 'drop-shadow(0 24px 48px rgba(212,114,42,0.3))' }}
                animate={{ rotateY: [0, 20, -12, 0], rotateX: [0, -10, 8, 0], y: [0, -14, 6, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              >
                🍽️
              </motion.div>

              <div style={{ flex: '1 1 260px' }}>
                <span style={{ fontSize: '0.66rem', letterSpacing: '0.16em', color: '#D4722A', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>Private Dining</span>
                <h2 className="serif" style={{ fontSize: 'clamp(1.4rem, 3.5vw, 2rem)', marginBottom: '0.6rem' }}>
                  Reserve a table for<br /><em style={{ color: '#D4722A', fontStyle: 'italic' }}>special occasions</em>
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#78716C', lineHeight: 1.75, maxWidth: 380, marginBottom: '1.5rem' }}>
                  Bespoke menus, floral arrangements, and dedicated staff for your most memorable moments.
                </p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <motion.button
                    whileHover={{ scale: 1.04, boxShadow: '0 12px 32px rgba(212,114,42,0.35)' }}
                    whileTap={{ scale: 0.97 }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#D4722A', color: '#fff', padding: '11px 26px', borderRadius: 12, fontSize: '0.83rem', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 6px 20px rgba(212,114,42,0.28)' }}
                  >
                    <Phone style={{ width: 14, height: 14 }} /> Enquire Now
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', border: '1.5px solid #F5C9A8', color: '#D4722A', padding: '11px 22px', borderRadius: 12, fontSize: '0.83rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    View Sample Menu <ChevronRight style={{ width: 14, height: 14 }} />
                  </motion.button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                {[
                  { icon: '🌸', text: 'Floral Arrangements' },
                  { icon: '👨‍🍳', text: 'Private Chef' },
                  { icon: '🥂', text: 'Wine Pairing' },
                  { icon: '🎵', text: 'Live Music' },
                ].map((feat) => (
                  <motion.div
                    key={feat.text}
                    whileHover={{ x: 4 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1.5px solid #F5C9A8', borderRadius: 12, padding: '8px 14px', fontSize: '0.78rem', fontWeight: 600, color: '#78716C' }}
                  >
                    <span style={{ fontSize: '1rem' }}>{feat.icon}</span> {feat.text}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FLOATING CART FAB ── */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.button className="cart-fab" initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: 20 }} onClick={() => setCartOpen(true)}>
            <ShoppingCart style={{ width: 17, height: 17 }} />
            <span>{totalItems} item{totalItems > 1 ? 's' : ''}</span>
            <span style={{ width: 1, background: 'rgba(255,255,255,0.2)', alignSelf: 'stretch' }} />
            <span style={{ color: '#F5C9A8', fontWeight: 800 }}>{formatCurrency(total)}</span>
            <ArrowRight style={{ width: 15, height: 15, opacity: 0.7 }} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── CART DRAWER ── */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCartOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(28,25,23,0.55)', backdropFilter: 'blur(6px)' }} />
            <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
              <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} transition={{ type: 'spring', damping: 28, stiffness: 320 }} className="cart-sheet" style={{ maxWidth: 480, width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E7E3DC', background: '#FDF8F3', padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ShoppingCart style={{ width: 16, height: 16, color: '#D4722A' }} />
                    <span className="serif" style={{ fontSize: '1.05rem' }}>Your Order</span>
                    <span style={{ background: '#FDE8D4', border: '1px solid #F5C9A8', borderRadius: 999, padding: '2px 9px', fontSize: '0.68rem', fontWeight: 700, color: '#D4722A' }}>{totalItems}</span>
                  </div>
                  <button onClick={() => setCartOpen(false)} style={{ background: '#fff', border: '1.5px solid #E7E3DC', borderRadius: 10, padding: '0.4rem', cursor: 'pointer', display: 'flex' }}>
                    <X style={{ width: 15, height: 15, color: '#78716C' }} />
                  </button>
                </div>

                <div style={{ maxHeight: '48vh', overflowY: 'auto', padding: '1rem 1.25rem' }}>
                  {!cartLines.length ? (
                    <p style={{ textAlign: 'center', color: '#A8A29E', fontSize: '0.85rem', padding: '2rem 0' }}>Your cart is empty. Add dishes from the menu.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {cartLines.map((line, li) => {
                        const pal = PASTEL_CARDS[li % PASTEL_CARDS.length]
                        return (
                          <motion.div key={line.item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} style={{ display: 'flex', alignItems: 'center', gap: 10, background: pal.bg, border: `1.5px solid ${pal.border}`, borderRadius: 14, padding: '0.75rem 1rem' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1C1917', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{line.item.name}</p>
                              <p style={{ fontSize: '0.72rem', color: '#78716C', marginTop: 2 }}>{formatCurrency(line.item.price)} each</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <button onClick={() => decItem(line.item.id)} style={{ background: '#fff', border: `1.5px solid ${pal.border}`, borderRadius: 8, padding: '4px', cursor: 'pointer', display: 'flex' }}><Minus style={{ width: 13, height: 13, color: '#78716C' }} /></button>
                              <span style={{ minWidth: 22, textAlign: 'center', fontSize: '0.9rem', fontWeight: 700, color: pal.accent }}>{line.qty}</span>
                              <button onClick={() => incItem(line.item.id)} style={{ background: '#fff', border: `1.5px solid ${pal.border}`, borderRadius: 8, padding: '4px', cursor: 'pointer', display: 'flex' }}><Plus style={{ width: 13, height: 13, color: '#78716C' }} /></button>
                              <button onClick={() => setCart((p) => { const { [line.item.id]: _, ...r } = p; return r })} style={{ background: '#FFF1F2', border: '1.5px solid #FECDD3', borderRadius: 8, padding: '4px', cursor: 'pointer', display: 'flex', marginLeft: 2 }}><Trash2 style={{ width: 13, height: 13, color: '#E11D48' }} /></button>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  )}
                  {cartLines.length > 0 && (
                    <div style={{ marginTop: 14 }}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#78716C', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Special Requests</label>
                      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="field" rows={2} placeholder="Allergies, preferences…" style={{ resize: 'none' }} />
                    </div>
                  )}
                </div>

                <div style={{ borderTop: '1px solid #E7E3DC', background: '#fff', padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: '0.85rem' }}>
                    {[{ label: 'Subtotal', val: subtotal }, { label: 'Service (5%)', val: serviceCharge }, { label: 'Tax (16%)', val: tax }].map((row) => (
                      <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#78716C' }}>
                        <span>{row.label}</span><span style={{ fontWeight: 600 }}>{formatCurrency(row.val)}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 700, color: '#1C1917', borderTop: '1px solid #E7E3DC', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                      <span>Total</span>
                      <span className="serif" style={{ color: '#D4722A' }}>{formatCurrency(total)}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={clearCart} style={{ flex: '0 0 auto', background: '#fff', border: '1.5px solid #E7E3DC', borderRadius: 12, padding: '0.7rem 1.1rem', fontSize: '0.82rem', fontWeight: 600, color: '#78716C', cursor: 'pointer' }}>Clear</button>
                    <button onClick={placeOrder} disabled={submitting || !cartLines.length} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: submitting || !cartLines.length ? '#A8A29E' : '#D4722A', color: '#fff', border: 'none', borderRadius: 12, padding: '0.7rem 1.25rem', fontSize: '0.85rem', fontWeight: 700, cursor: submitting || !cartLines.length ? 'not-allowed' : 'pointer', transition: 'background 0.2s', boxShadow: cartLines.length ? '0 4px 20px rgba(212,114,42,0.3)' : 'none' }}>
                      {submitting ? 'Placing…' : <>Place Order <ArrowRight style={{ width: 14, height: 14 }} /></>}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}