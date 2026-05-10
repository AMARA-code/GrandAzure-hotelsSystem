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

/* ─── Hero Carousel Images ───────────────────────────────────────────────── */
const HERO_IMAGES = [
  '/images/carosoule/hero-1.jpg',
  '/images/carosoule/hero-2.jpg',
  '/images/carosoule/hero-3.jpg',
  '/images/carosoule/hero-4.jpg',
  '/images/carosoule/hero-5.jpg',
]

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

/* ─── Stat Badge ────────────────────────────────────────────────────────── */
function StatBadge({ value, label, icon: Icon, palette }: { value: string; label: string; icon: any; palette: typeof PASTEL_CARDS[0] }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24, scale: 0.9 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
      style={{ background: palette.bg, border: `1.5px solid ${palette.border}`, borderRadius: 20, padding: '1.25rem 1rem', textAlign: 'center' }}
    >
      <Icon style={{ width: 24, height: 24, color: palette.accent, margin: '0 auto 8px' }} />
      <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.8rem', fontWeight: 700, color: palette.accent }}>{value}</div>
      <div style={{ fontSize: '0.72rem', color: '#78716C', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>{label}</div>
    </motion.div>
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
  /* ── Hero carousel ── */
  const [heroImg, setHeroImg] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setHeroImg(i => (i + 1) % HERO_IMAGES.length), 6500)
    return () => clearInterval(id)
  }, [])

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
  const heroParallaxY = useTransform(scrollY, [0, 400], [0, 60])

  const allCategories = useMemo(() => [{ id: 'all', name: 'All', items: [] as MenuItem[] }, ...DEFAULT_MENU.categories], [])
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

  const addItem = (item: MenuItem) => setCart((p) => ({ ...p, [item.id]: { item, qty: (p[item.id]?.qty ?? 0) + 1 } }))
  const decItem = (id: string) => setCart((p) => { const e = p[id]; if (!e) return p; if (e.qty <= 1) { const { [id]: _, ...r } = p; return r }; return { ...p, [id]: { ...e, qty: e.qty - 1 } } })
  const incItem = (id: string) => setCart((p) => p[id] ? { ...p, [id]: { ...p[id], qty: p[id].qty + 1 } } : p)
  const clearCart = () => setCart({})

  const placeOrder = async () => {
    if (!restaurantId) { toast.error('Please select a restaurant outlet.'); return }
    if (!cartLines.length) { toast.error('Your cart is empty.'); return }
    if (orderType === 'dine_in' && !tableNo) { toast.error('Please enter table number.'); return }
    setSubmitting(true)
    try {
      const payload: any = {
        restaurant_id: restaurantId, order_type: orderType,
        table_no: orderType === 'dine_in' ? tableNo : null,
        total_amount: String(total), charged_to_room: chargedToRoom,
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

        /* ══ HERO ══ */
        .hero-wrapper {
          position: relative;
          overflow: hidden;
          min-height: 100vh;
          display: flex;
          align-items: center;
          background: #08050200;
        }
        @media (min-width: 768px) { .hero-wrapper { min-height: 100vh; } }

        /* Layered overlays for depth */
        .hero-ov-base {
          position: absolute; inset: 0;
          background: linear-gradient(
            to right,
            rgba(5,3,2,0.82) 0%,
            rgba(5,3,2,0.55) 38%,
            rgba(5,3,2,0.18) 68%,
            rgba(5,3,2,0.42) 100%
          );
          z-index: 1;
        }
        .hero-ov-bottom {
          position: absolute; inset: 0;
          background: linear-gradient(
            to top,
            rgba(5,3,2,0.88) 0%,
            rgba(5,3,2,0.38) 22%,
            transparent 50%
          );
          z-index: 2;
        }
        .hero-ov-top {
          position: absolute; inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(5,3,2,0.52) 0%,
            transparent 28%
          );
          z-index: 2;
        }
        .hero-grain {
          position: absolute; inset: 0; z-index: 3; pointer-events: none; opacity: 0.38;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.07'/%3E%3C/svg%3E");
        }

        /* Horizontal divider line — purely decorative */
        .hero-rule {
          display: none;
          position: absolute;
          top: 50%;
          right: 0;
          width: 28%;
          height: 1px;
          background: linear-gradient(to left, transparent, rgba(196,137,74,0.22));
          z-index: 4;
        }
        @media (min-width: 900px) { .hero-rule { display: block; } }

        /* Inner layout */
        .hero-inner {
          position: relative;
          z-index: 5;
          width: 100%;
          padding: 7rem 0 6rem;
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        @media (min-width: 900px) {
          .hero-inner {
            flex-direction: row;
            align-items: center;
            padding: 8rem 0 6rem;
          }
          .hero-left  { flex: 0 0 58%; }
          .hero-right { flex: 1; display: flex !important; justify-content: flex-end; padding-right: 1rem; }
        }
        .hero-right { display: none; }

        /* Eyebrow */
        .hero-eyebrow {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 1.6rem;
        }
        .hero-eyebrow-line {
          width: 32px;
          height: 1px;
          background: #C4894A;
          flex-shrink: 0;
        }
        .hero-eyebrow-text {
          font-size: 0.6rem;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: #C4894A;
          font-weight: 500;
        }

        /* Headline */
        .hero-h1 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(3rem, 7vw, 5.2rem);
          line-height: 1.0;
          font-weight: 400;
          letter-spacing: -0.025em;
          color: #F2EAD8;
          display: block;
          margin-bottom: 0.04em;
        }
        .hero-h1-italic {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(3rem, 7vw, 5.2rem);
          line-height: 1.0;
          font-weight: 400;
          font-style: italic;
          letter-spacing: -0.025em;
          color: #C4894A;
          display: block;
          text-shadow: 0 0 60px rgba(196,137,74,0.28);
        }

        .hero-divider {
          width: 44px;
          height: 1px;
          background: rgba(196,137,74,0.4);
          margin: 1.6rem 0;
        }

        .hero-sub {
          font-size: clamp(0.82rem, 1.6vw, 0.92rem);
          color: rgba(242,234,216,0.58);
          line-height: 1.95;
          max-width: 360px;
          font-weight: 300;
          letter-spacing: 0.01em;
          margin-bottom: 2rem;
        }

        /* CTA buttons */
        .hero-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #C4894A;
          color: #1a0e05;
          border: none;
          padding: 14px 32px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border-radius: 2px;
          cursor: pointer;
          transition: background 0.22s, transform 0.18s;
        }
        .hero-btn-primary:hover { background: #d49a5e; transform: translateY(-2px); }

        .hero-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: none;
          border: 1px solid rgba(196,137,74,0.38);
          color: rgba(242,234,216,0.68);
          padding: 14px 28px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.75rem;
          font-weight: 400;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border-radius: 2px;
          cursor: pointer;
          transition: border-color 0.22s, color 0.22s, transform 0.18s;
        }
        .hero-btn-ghost:hover {
          border-color: rgba(196,137,74,0.75);
          color: rgba(242,234,216,0.95);
          transform: translateY(-2px);
        }

        /* Dot nav */
        .hero-dots {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 3rem;
        }

        /* Bottom meta bar */
        .hero-meta-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 6;
          border-top: 1px solid rgba(196,137,74,0.10);
          padding: 1.2rem 2.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          background: rgba(5,3,2,0.28);
          backdrop-filter: blur(8px);
        }
        @media (max-width: 640px) {
          .hero-meta-bar { padding: 1rem 1.25rem; }
          .hero-meta-right { display: none; }
        }

        .hero-meta-stat {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .hero-meta-label {
          font-size: 0.5rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(196,137,74,0.52);
          font-weight: 500;
        }
        .hero-meta-value {
          font-size: 0.72rem;
          color: rgba(242,234,216,0.68);
          font-weight: 300;
        }
        .hero-meta-sep {
          width: 1px;
          height: 26px;
          background: rgba(196,137,74,0.16);
          flex-shrink: 0;
        }

        /* Right panel — open/cuisine info */
        .hero-info-panel {
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-items: flex-end;
        }
        .hero-status-card {
          background: rgba(5,3,2,0.55);
          border: 1px solid rgba(196,137,74,0.18);
          border-radius: 4px;
          padding: 18px 22px;
          backdrop-filter: blur(12px);
          min-width: 200px;
        }
        .hero-vertical-tag {
          writing-mode: vertical-rl;
          text-orientation: mixed;
          font-size: 0.52rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(196,137,74,0.55);
          padding: 16px 8px;
          border: 1px solid rgba(196,137,74,0.14);
          border-radius: 2px;
          white-space: nowrap;
        }

        /* Scroll indicator */
        .hero-scroll {
          position: absolute;
          bottom: 5rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 6;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        @media (max-width: 640px) { .hero-scroll { display: none; } }
        .hero-scroll-text {
          font-size: 0.48rem;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: rgba(196,137,74,0.42);
        }

        /* ── Controls card ── */
        .controls-card { background: #fff; border: 1.5px solid #E7E3DC; border-radius: 18px; padding: 1.25rem; box-shadow: 0 4px 32px rgba(28,25,23,0.06); }
        @media (min-width: 640px) { .controls-card { padding: 1.5rem; border-radius: 20px; } }
        @media (min-width: 768px) { .controls-card { padding: 2rem; border-radius: 24px; } }

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

        .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        @media (min-width: 560px) { .stats-grid { grid-template-columns: repeat(4, 1fr); } }

        .cat-bar { position: sticky; top: 0; z-index: 20; background: rgba(250,250,247,0.92); backdrop-filter: blur(12px); border-bottom: 1px solid #E7E3DC; padding: 0.65rem 0; }
        .cat-btn { white-space: nowrap; border-radius: 999px; padding: 0.4rem 0.9rem; font-size: 0.75rem; font-weight: 600; border: 1.5px solid #E7E3DC; background: #fff; color: #78716C; cursor: pointer; transition: all 0.2s; }
        @media (min-width: 640px) { .cat-btn { padding: 0.45rem 1.1rem; font-size: 0.8rem; } }
        .cat-btn:hover { border-color: #F5C9A8; color: #D4722A; }
        .cat-btn.active { background: #1C1917; border-color: #1C1917; color: #F5ECD5; box-shadow: 0 4px 16px rgba(28,25,23,0.22); }

        .cart-fab { position: fixed; bottom: 1.25rem; right: 1rem; z-index: 30; display: flex; align-items: center; gap: 8px; background: #1C1917; color: #F5ECD5; padding: 0.75rem 1.1rem; border-radius: 999px; font-size: 0.78rem; font-weight: 700; box-shadow: 0 8px 32px rgba(28,25,23,0.28); cursor: pointer; border: none; transition: all 0.22s; }
        .cart-fab:hover { background: #D4722A; transform: translateY(-3px); box-shadow: 0 12px 36px rgba(212,114,42,0.4); }
        @media (min-width: 640px) { .cart-fab { bottom: 1.75rem; right: 1.25rem; padding: 0.85rem 1.4rem; font-size: 0.82rem; } }
        @media (min-width: 768px) { .cart-fab { bottom: 2.5rem; right: 2.5rem; } }

        .menu-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }
        @media (min-width: 480px) { .menu-grid { grid-template-columns: repeat(2, 1fr); gap: 1.25rem; } }
        @media (min-width: 1024px) { .menu-grid { grid-template-columns: repeat(3, 1fr); } }

        .field { width: 100%; border: 1.5px solid #E7E3DC; border-radius: 12px; padding: 0.6rem 0.85rem; font-size: 0.85rem; font-family: inherit; color: #1C1917; background: #FAFAF7; outline: none; transition: border-color 0.18s; }
        .field:focus { border-color: #D4722A; background: #fff; }

        .dinein-grid { display: grid; grid-template-columns: 1fr; gap: 10px; }
        @media (min-width: 480px) { .dinein-grid { grid-template-columns: 1fr 1fr; gap: 12px; } }

        .cart-sheet { background: #FAFAF7; border-radius: 24px 24px 0 0; overflow: hidden; width: 100%; max-width: 480px; }
        @media (min-width: 640px) { .cart-sheet { border-radius: 24px; } }

        .private-card { border-radius: 20px; overflow: hidden; position: relative; background: linear-gradient(135deg, #FFF4ED 0%, #FDF0FF 100%); border: 1.5px solid #F5C9A8; }
        @media (min-width: 768px) { .private-card { border-radius: 28px; } }

        .btn-add { display: inline-flex; align-items: center; gap: 6px; background: #D4722A; color: #fff; border: none; border-radius: 10px; padding: 0.5rem 1.1rem; font-size: 0.78rem; font-weight: 700; cursor: pointer; box-shadow: 0 4px 14px rgba(212,114,42,0.30); transition: background 0.18s, box-shadow 0.18s, transform 0.12s; font-family: inherit; }
        .btn-add:hover { background: #B85E20; box-shadow: 0 6px 20px rgba(212,114,42,0.45); }
        .btn-add:active { transform: scale(0.97); }
      `}</style>

      {/* ══════════════════ HERO ══════════════════ */}
      <section className="hero-wrapper" ref={heroRef}>

        {/* ── Background image crossfade carousel ── */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          <AnimatePresence initial={false}>
            <motion.div
              key={heroImg}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.6, ease: [0.45, 0, 0.55, 1] }}
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url('${HERO_IMAGES[heroImg]}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center 30%',
                willChange: 'opacity',
              }}
            />
          </AnimatePresence>
        </div>

        {/* ── Overlay layers ── */}
        <div className="hero-ov-base" />
        <div className="hero-ov-bottom" />
        <div className="hero-ov-top" />
        <div className="hero-grain" />
        <div className="hero-rule" />

        {/* ── Content ── */}
        <div className="pg" style={{ width: '100%' }}>
          <div className="hero-inner">

            {/* LEFT — Headline + CTA */}
            <div className="hero-left">
              <motion.div style={{ y: heroParallaxY }}>

                {/* Eyebrow */}
                <motion.div
                  className="hero-eyebrow"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="hero-eyebrow-line" />
                  <span className="hero-eyebrow-text">
                    {activeRestaurant?.cuisine_type ?? 'Culinary Excellence'} · Est. 2008
                  </span>
                </motion.div>

                {/* Headline */}
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{ visible: { transition: { staggerChildren: 0.16 } } }}
                >
                  {['Dine Where', 'Flavours Live'].map((line, i) => (
                    <motion.div
                      key={i}
                      variants={{
                        hidden: { opacity: 0, y: 52, skewY: 4 },
                        visible: { opacity: 1, y: 0, skewY: 0 },
                      }}
                      transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {i === 0
                        ? <span className="hero-h1">{line}</span>
                        : <span className="hero-h1-italic">{line}</span>
                      }
                    </motion.div>
                  ))}
                </motion.div>

                {/* Divider */}
                <motion.div
                  className="hero-divider"
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  style={{ transformOrigin: 'left' }}
                  transition={{ duration: 0.7, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                />

                {/* Subline */}
                <motion.p
                  className="hero-sub"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.72, ease: [0.22, 1, 0.36, 1] }}
                >
                  {activeRestaurant
                    ? `${activeRestaurant.restaurant_name} · ${activeRestaurant.hotel_name} · ${activeRestaurant.city}`
                    : 'Curated menus, premium service, and seamless ordering across all our properties.'
                  }
                </motion.p>

                {/* CTAs */}
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.88, ease: [0.22, 1, 0.36, 1] }}
                  style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}
                >
                  <button className="hero-btn-primary">
                    Explore Menu
                  </button>
                  <button className="hero-btn-ghost">
                    Reserve a Table
                  </button>
                </motion.div>

                {/* Dot indicators */}
                <motion.div
                  className="hero-dots"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1, duration: 0.6 }}
                >
                  {HERO_IMAGES.map((_, i) => (
                    <motion.button
                      key={i}
                      onClick={() => setHeroImg(i)}
                      animate={{
                        width: i === heroImg ? 40 : 20,
                        background: i === heroImg ? '#C4894A' : 'rgba(196,137,74,0.28)',
                      }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      style={{
                        height: 2,
                        borderRadius: 1,
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </motion.div>
              </motion.div>
            </div>

            {/* RIGHT — Status + Cuisine panel */}
            <div className="hero-right">
              <motion.div
                className="hero-info-panel"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.9, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Vertical tag */}
                <span className="hero-vertical-tag">Award Winning Chefs</span>

                {/* Open/closed card */}
                <div className="hero-status-card">
                  {(() => {
                    const isOpen = (() => {
                      if (!activeRestaurant?.open_time || !activeRestaurant?.close_time) return true
                      const now = new Date()
                      const [oh, om] = activeRestaurant.open_time.split(':').map(Number)
                      const [ch, cm] = activeRestaurant.close_time.split(':').map(Number)
                      const cur = now.getHours() * 60 + now.getMinutes()
                      return cur >= oh * 60 + om && cur <= ch * 60 + cm
                    })()
                    return (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                          <div style={{ position: 'relative', width: 8, height: 8, flexShrink: 0 }}>
                            <motion.div
                              animate={{ scale: [1, 2.4, 1], opacity: [0.5, 0, 0.5] }}
                              transition={{ duration: 2.2, repeat: Infinity }}
                              style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: isOpen ? '#4ADE80' : '#F87171' }}
                            />
                            <div style={{ position: 'absolute', inset: 1, borderRadius: '50%', background: isOpen ? '#4ADE80' : '#F87171' }} />
                          </div>
                          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: isOpen ? '#4ADE80' : '#F87171', letterSpacing: '0.04em' }}>
                            {isOpen ? 'Currently Open' : 'Currently Closed'}
                          </span>
                        </div>
                        {activeRestaurant?.open_time && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                            <Clock style={{ width: 11, height: 11, color: 'rgba(196,137,74,0.6)', flexShrink: 0 }} />
                            <span style={{ fontSize: '0.68rem', color: 'rgba(242,234,216,0.52)', fontWeight: 300 }}>
                              {activeRestaurant.open_time} – {activeRestaurant.close_time}
                            </span>
                          </div>
                        )}
                        <div style={{ borderTop: '1px solid rgba(196,137,74,0.12)', paddingTop: 10 }}>
                          <p style={{ fontSize: '0.72rem', fontWeight: 500, color: 'rgba(242,234,216,0.72)', marginBottom: 3 }}>
                            {activeRestaurant?.restaurant_name ?? 'Grand Azure'}
                          </p>
                          {activeRestaurant?.city && (
                            <p style={{ fontSize: '0.62rem', color: 'rgba(196,137,74,0.6)', fontWeight: 300 }}>
                              {activeRestaurant.city}
                            </p>
                          )}
                        </div>
                      </>
                    )
                  })()}
                </div>

                {/* Cuisine tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end' }}>
                  {(activeRestaurant?.cuisine_type
                    ? activeRestaurant.cuisine_type.split(',').map(s => s.trim()).filter(Boolean)
                    : ['Continental', 'Asian Fusion', 'Grill']
                  ).map((tag, i) => (
                    <span
                      key={tag}
                      style={{
                        background: 'rgba(5,3,2,0.45)',
                        border: '1px solid rgba(196,137,74,0.22)',
                        borderRadius: 2,
                        padding: '4px 12px',
                        fontSize: '0.6rem',
                        fontWeight: 500,
                        color: 'rgba(196,137,74,0.75)',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* ── Scroll indicator ── */}
        <motion.div
          className="hero-scroll"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.8 }}
        >
          <span className="hero-scroll-text">Scroll</span>
          <motion.div
            animate={{ scaleY: [1, 1.1, 1], opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: 1, height: 36, background: 'linear-gradient(to bottom, rgba(196,137,74,0.7), transparent)' }}
          />
        </motion.div>

        {/* ── Bottom meta bar ── */}
        <motion.div
          className="hero-meta-bar"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ display: 'flex' }}>
              {['🧑‍🍳', '👨‍🍳', '👩‍🍳'].map((e, i) => (
                <span key={i} style={{ fontSize: '1rem', marginLeft: i > 0 ? -5 : 0, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>{e}</span>
              ))}
            </div>
            <span style={{ fontSize: '0.68rem', color: 'rgba(242,234,216,0.5)', fontWeight: 300 }}>
              Trusted by <strong style={{ color: 'rgba(242,234,216,0.75)', fontWeight: 500 }}>800+</strong> guests daily
            </span>
          </div>

          <div className="hero-meta-right" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {[
              { label: 'Rating', value: '4.9 / 5 ★' },
              { label: 'Cuisines', value: '12+ Varieties' },
              { label: 'Michelin', value: '5 Stars' },
              { label: 'Avg Delivery', value: '30 min' },
            ].map((stat, i, arr) => (
              <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div className="hero-meta-stat">
                  <span className="hero-meta-label">{stat.label}</span>
                  <span className="hero-meta-value">{stat.value}</span>
                </div>
                {i < arr.length - 1 && <div className="hero-meta-sep" />}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ══════════════════ STATS STRIP ══════════════════ */}
      <section style={{ background: '#F7F4EF', padding: '2.5rem 0 1rem' }}>
        <div className="pg">
          <div className="stats-grid" style={{ marginBottom: '2rem' }}>
            <StatBadge value="12+" label="Cuisines" icon={UtensilsCrossed} palette={PASTEL_CARDS[0]} />
            <StatBadge value="98%" label="Guest Satisfaction" icon={Award} palette={PASTEL_CARDS[2]} />
            <StatBadge value="5★" label="Michelin Rated" icon={Sparkles} palette={PASTEL_CARDS[3]} />
            <StatBadge value="30min" label="Avg Delivery" icon={Clock} palette={PASTEL_CARDS[1]} />
          </div>

          <motion.div className="controls-card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
              <div style={{ flex: '1 1 200px' }}>
                <span style={{ fontSize: '0.66rem', letterSpacing: '0.14em', color: '#D4722A', textTransform: 'uppercase', fontWeight: 700 }}>Select Outlet</span>
                <select value={restaurantId} onChange={(e) => setRestaurantId(Number(e.target.value))} className="field" style={{ marginTop: 8, display: 'block' }}>
                  {restaurants.map((r) => (<option key={r.restaurant_id} value={r.restaurant_id}>{r.restaurant_name} — {r.hotel_name}</option>))}
                </select>
              </div>
              {activeRestaurant?.open_time && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#78716C', fontWeight: 500, paddingBottom: '0.4rem' }}>
                  <Clock style={{ width: 13, height: 13, color: '#D4722A' }} />{activeRestaurant.open_time} – {activeRestaurant.close_time}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.66rem', letterSpacing: '0.14em', color: '#78716C', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: 10 }}>Order Type</span>
              <div className="order-pills-grid">
                {([
                  { key: 'dine_in',      label: 'Dine-in',      Icon: UtensilsCrossed, desc: 'At your table'     },
                  { key: 'room_service', label: 'Room Service',  Icon: BedDouble,       desc: 'Delivered to room' },
                  { key: 'takeaway',     label: 'Takeaway',      Icon: BadgePercent,    desc: 'Collect & go'      },
                ] as const).map((t) => (
                  <button key={t.key} type="button" onClick={() => setOrderType(t.key)} className={`order-pill${orderType === t.key ? ' active' : ''}`}>
                    <t.Icon style={{ width: 20, height: 20, flexShrink: 0, color: orderType === t.key ? '#D4722A' : '#A8A29E' }} />
                    <div><div className="order-pill-label">{t.label}</div><div className="order-pill-desc">{t.desc}</div></div>
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

      {/* ══════════════════ CATEGORY BAR ══════════════════ */}
      <div className="cat-bar">
        <div className="pg">
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
            {allCategories.map((cat) => (
              <button key={cat.id} onClick={() => setActiveCategoryId(cat.id)} className={`cat-btn${activeCategoryId === cat.id ? ' active' : ''}`}>{cat.name}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════ MENU SECTIONS ══════════════════ */}
      <section className="sec">
        <div className="pg">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
            {categoriesToRender.map((cat, catIdx) => (
              <div key={cat.id}>
                <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
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
                          initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
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
                                {item.tags.map((t) => (<span key={t} style={{ background: palette.tag, border: `1px solid ${palette.border}`, borderRadius: 999, padding: '2px 9px', fontSize: '0.62rem', fontWeight: 600, color: palette.accent }}>{t}</span>))}
                              </div>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', borderTop: `1px solid ${palette.border}`, paddingTop: '0.85rem' }}>
                              <AnimatePresence mode="wait">
                                {inCart === 0 ? (
                                  <motion.button key="add" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }} onClick={() => addItem(item)} className="btn-add" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                                    <Plus style={{ width: 13, height: 13 }} /> Add to order
                                  </motion.button>
                                ) : (
                                  <motion.div key="qty" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#D4722A', border: '1.5px solid #D4722A', borderRadius: 12, padding: '4px 8px' }}>
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

      {/* ══════════════════ PRIVATE DINING ══════════════════ */}
      <section style={{ padding: '0 1.25rem 4rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <motion.div className="private-card" initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
            <div style={{ position: 'absolute', top: -60, right: -60, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,114,42,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -50, left: -50, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(147,51,234,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center', padding: '2.5rem 2rem' }}>
              <motion.div style={{ fontSize: '5rem', flexShrink: 0, transformStyle: 'preserve-3d', filter: 'drop-shadow(0 24px 48px rgba(212,114,42,0.3))' }} animate={{ rotateY: [0, 20, -12, 0], rotateX: [0, -10, 8, 0], y: [0, -14, 6, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}>🍽️</motion.div>
              <div style={{ flex: '1 1 260px' }}>
                <span style={{ fontSize: '0.66rem', letterSpacing: '0.16em', color: '#D4722A', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>Private Dining</span>
                <h2 className="serif" style={{ fontSize: 'clamp(1.4rem, 3.5vw, 2rem)', marginBottom: '0.6rem' }}>Reserve a table for<br /><em style={{ color: '#D4722A', fontStyle: 'italic' }}>special occasions</em></h2>
                <p style={{ fontSize: '0.85rem', color: '#78716C', lineHeight: 1.75, maxWidth: 380, marginBottom: '1.5rem' }}>Bespoke menus, floral arrangements, and dedicated staff for your most memorable moments.</p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <motion.button whileHover={{ scale: 1.04, boxShadow: '0 12px 32px rgba(212,114,42,0.35)' }} whileTap={{ scale: 0.97 }} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#D4722A', color: '#fff', padding: '11px 26px', borderRadius: 12, fontSize: '0.83rem', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 6px 20px rgba(212,114,42,0.28)' }}>
                    <Phone style={{ width: 14, height: 14 }} /> Enquire Now
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', border: '1.5px solid #F5C9A8', color: '#D4722A', padding: '11px 22px', borderRadius: 12, fontSize: '0.83rem', fontWeight: 600, cursor: 'pointer' }}>
                    View Sample Menu <ChevronRight style={{ width: 14, height: 14 }} />
                  </motion.button>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                {[{ icon: '🌸', text: 'Floral Arrangements' }, { icon: '👨‍🍳', text: 'Private Chef' }, { icon: '🥂', text: 'Wine Pairing' }, { icon: '🎵', text: 'Live Music' }].map((feat) => (
                  <motion.div key={feat.text} whileHover={{ x: 4 }} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1.5px solid #F5C9A8', borderRadius: 12, padding: '8px 14px', fontSize: '0.78rem', fontWeight: 600, color: '#78716C' }}>
                    <span style={{ fontSize: '1rem' }}>{feat.icon}</span> {feat.text}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════ CART FAB ══════════════════ */}
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

      {/* ══════════════════ CART DRAWER ══════════════════ */}
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