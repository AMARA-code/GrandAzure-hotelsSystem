'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import { ArrowRight, BedDouble, Sparkles, Star, ChevronRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/formatters'
import HomeHotelCards from '@/components/guest-portal/HomeHotelCards'
import { useRef, useEffect, useState } from 'react'

type Hotel = {
  hotel_id: number
  hotel_name: string
  city: string
  state_province: string
  star_rating: number
  total_rooms: number
}

type Room = {
  room_type_id: number
  type_name: string
  type_category: string
  description: string
  max_occupancy: number
  base_price: number | string
}

type Review = {
  review_id: number
  overall_rating: number
  title: string
  review_text: string
  guests?: { first_name?: string; last_name?: string } | null
}

const PASTEL_CARDS = [
  { bg: '#FFF4ED', border: '#F5C9A8', accent: '#D4722A', tag: '#FDE8D4' },
  { bg: '#EFF6FF', border: '#BFDBFE', accent: '#2563EB', tag: '#DBEAFE' },
  { bg: '#F0FDF4', border: '#BBF7D0', accent: '#16A34A', tag: '#DCFCE7' },
  { bg: '#FDF4FF', border: '#E9D5FF', accent: '#9333EA', tag: '#F3E8FF' },
  { bg: '#FFF7ED', border: '#FED7AA', accent: '#EA580C', tag: '#FFEDD5' },
  { bg: '#F0F9FF', border: '#BAE6FD', accent: '#0284C7', tag: '#E0F2FE' },
]

const TICKER_ITEMS = [
  '✦ Karachi · Clifton',
  '✦ Lahore · Gulberg',
  '✦ Islamabad · F-7',
  '✦ Award-Winning Hospitality',
  '✦ Michelin-Starred Dining',
  '✦ Rooftop Pools',
  '✦ World-Class Spa',
  '✦ 24 / 7 Concierge',
]

function TickerStrip() {
  return (
    <div style={{ overflow: 'hidden', background: '#1C1917', padding: '11px 0' }}>
      <motion.div
        style={{ display: 'flex', whiteSpace: 'nowrap', width: 'max-content' }}
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 30, ease: 'linear', repeat: Infinity }}
      >
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <span key={i} style={{ display: 'inline-block', padding: '0 2.5rem', fontSize: '0.68rem', letterSpacing: '0.18em', fontWeight: 700, color: '#F5ECD5', textTransform: 'uppercase' }}>
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const step = to / 55
    const timer = setInterval(() => {
      start += step
      if (start >= to) { setCount(to); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 22)
    return () => clearInterval(timer)
  }, [to])
  return <>{count}{suffix}</>
}

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
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 900 }}
    >{children}</motion.div>
  )
}

const ROOM_IMAGES: Record<string, string> = {
  presidential: '/images/rooms/presidential-suite.jpg',
  honeymoon: '/images/rooms/honeymoon-suite.jpg',
  executive: '/images/rooms/executive-suite.jpg',
  suite: '/images/rooms/executive-suite.jpg',
  deluxe: '/images/rooms/deluxe-sea-view.jpg',
  garden: '/images/rooms/deluxe-garden-view.jpg',
  standard: '/images/rooms/standard-room.jpg',
}
function getRoomImage(name: string) {
  const n = name.toLowerCase()
  for (const [k, v] of Object.entries(ROOM_IMAGES)) if (n.includes(k)) return v
  return '/images/rooms/standard-room.jpg'
}

function Stars({ rating, max = 10 }: { rating: number; max?: number }) {
  const filled = Math.round((rating / max) * 5)
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} style={{ width: 13, height: 13, fill: i < filled ? '#F59E0B' : 'none', color: i < filled ? '#F59E0B' : '#D1D5DB' }} />
      ))}
    </div>
  )
}

function BlobBg() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 520, height: 520, borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%', background: 'radial-gradient(circle, #FDE8D4 0%, #FECDD3 50%, transparent 75%)', opacity: 0.45, filter: 'blur(40px)' }} />
      <div style={{ position: 'absolute', bottom: '0%', left: '-8%', width: 480, height: 480, borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%', background: 'radial-gradient(circle, #DBEAFE 0%, #EDE9FE 60%, transparent 80%)', opacity: 0.4, filter: 'blur(50px)' }} />
    </div>
  )
}

export default function HomeLanding({ hotels, featuredRooms, featuredReviews, isAuthenticated }: {
  hotels: Hotel[]
  featuredRooms: Room[]
  featuredReviews: Review[]
  isAuthenticated: boolean
}) {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])

  return (
    <div style={{ background: '#FAFAF7', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", color: '#1C1917', overflowX: 'hidden' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        a { text-decoration: none; }

        /* Shared page container with safe horizontal padding */
        .pg {
          width: 100%;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
          padding-left: 1.25rem;
          padding-right: 1.25rem;
        }
        @media (min-width: 640px)  { .pg { padding-left: 1.75rem; padding-right: 1.75rem; } }
        @media (min-width: 1024px) { .pg { padding-left: 2.5rem;  padding-right: 2.5rem;  } }

        /* Section vertical rhythm */
        .sec { padding-top: 3rem; padding-bottom: 3rem; }
        @media (min-width: 768px) { .sec { padding-top: 5rem; padding-bottom: 5rem; } }

        /* Hero grid: stacked on mobile, side-by-side on desktop */
        .hero-grid {
          display: flex;
          flex-direction: column-reverse;
          gap: 1.75rem;
          padding-top: 4.5rem;
          padding-bottom: 2.5rem;
        }
        @media (min-width: 900px) {
          .hero-grid {
            flex-direction: row;
            align-items: center;
            gap: 4rem;
            padding-top: 7rem;
            padding-bottom: 4rem;
          }
          .hero-text  { flex: 1 1 0; }
          .hero-media { flex: 1 1 0; }
        }

        /* Hero mosaic */
        .hero-media {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 3;
          max-height: 320px;
        }
        @media (min-width: 900px) {
          .hero-media { max-height: 500px; aspect-ratio: auto; height: 500px; }
        }

        .hero-img-main {
          position: absolute;
          inset: 0;
          right: 48px;
          bottom: 48px;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 16px 48px rgba(0,0,0,0.13);
        }
        @media (min-width: 900px) {
          .hero-img-main { right: 64px; bottom: 64px; border-radius: 20px; }
        }

        .hero-img-accent {
          position: absolute;
          bottom: 0; right: 0;
          width: 110px; height: 98px;
          border-radius: 10px;
          overflow: hidden;
          border: 3px solid #FAFAF7;
          box-shadow: 0 8px 20px rgba(0,0,0,0.12);
        }
        @media (min-width: 480px) { .hero-img-accent { width: 140px; height: 124px; } }
        @media (min-width: 900px) { .hero-img-accent { width: 200px; height: 178px; border-radius: 16px; border-width: 4px; } }

        /* Buttons */
        .btn-row { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 1.5rem; }
        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: #D4722A; color: #fff;
          padding: 13px 22px; border-radius: 8px;
          font-size: 0.85rem; font-weight: 600; letter-spacing: 0.03em;
          box-shadow: 0 4px 20px rgba(212,114,42,0.35);
          transition: all 0.2s; white-space: nowrap;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(212,114,42,0.45); }
        .btn-secondary {
          display: inline-flex; align-items: center; gap: 8px;
          background: #fff; border: 1.5px solid #E7E3DC; color: #44403C;
          padding: 13px 22px; border-radius: 8px;
          font-size: 0.85rem; font-weight: 600;
          transition: all 0.2s; white-space: nowrap;
        }
        .btn-secondary:hover { border-color: #D4722A; color: #D4722A; }
        /* Trust badges */
        .badges { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 1.5rem; }

        /* Stats */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
          padding: 2rem 0;
        }
        @media (min-width: 768px) {
          .stats-grid { grid-template-columns: repeat(4, 1fr); gap: 1.5rem; padding: 3rem 0; }
        }

        /* Cards grids */
        .cards-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
        }
        @media (min-width: 560px) { .cards-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .cards-grid { grid-template-columns: repeat(3, 1fr); } }

        /* Section subheader row */
        .sub-row {
          display: flex; justify-content: space-between;
          align-items: flex-end; flex-wrap: wrap;
          gap: 1rem; margin-bottom: 2rem;
        }

        /* CTA block */
        .cta-block {
          background: #1C1917;
          border-radius: 16px;
          overflow: hidden;
          margin: 0 1.25rem 3rem;
        }
        @media (min-width: 640px)  { .cta-block { margin: 0 1.75rem 4rem; border-radius: 20px; } }
        @media (min-width: 1024px) { .cta-block { max-width: 1160px; margin-left: auto; margin-right: auto; margin-bottom: 4rem; border-radius: 24px; } }

        .cta-inner {
          padding: 2.75rem 1.5rem; text-align: center;
          position: relative; overflow: hidden;
        }
        @media (min-width: 640px)  { .cta-inner { padding: 3.5rem 2.5rem; } }
        @media (min-width: 900px)  { .cta-inner { padding: 5rem 3rem; } }

        .cta-btns {
          display: flex; flex-wrap: wrap;
          gap: 10px; justify-content: center;
        }

        /* Heading utility */
        .serif {
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 600; line-height: 1.12;
          letter-spacing: -0.02em; color: #1C1917;
        }

        /* Hide scroll hint on mobile */
        @media (max-width: 899px) { .scroll-hint { display: none !important; } }
      `}</style>

      {/* ── HERO ── */}
      <section ref={heroRef} style={{ position: 'relative', overflow: 'hidden', background: '#FDF8F3' }}>
        <BlobBg />
        <div className="pg" style={{ position: 'relative', zIndex: 1 }}>
          <div className="hero-grid">

            {/* Text */}
            <div className="hero-text">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#FDE8D4', border: '1px solid #F5C9A8', borderRadius: 999, padding: '5px 14px', fontSize: '0.66rem', fontWeight: 600, color: '#C2511A', letterSpacing: '0.13em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
                  <Sparkles style={{ width: 11, height: 11 }} />
                  Pakistan's Premier Hotel Collection
                </span>
              </motion.div>

              <motion.h1
                className="serif"
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                style={{ fontSize: 'clamp(2.4rem, 8vw, 4.5rem)', marginBottom: '1rem' }}
              >
                Stay Where<br />
                <em style={{ color: '#D4722A', fontStyle: 'italic' }}>Stories Begin</em>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.22 }}
                style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1rem)', color: '#78716C', lineHeight: 1.8, maxWidth: 460 }}
              >
                Modern booking, elevated hospitality, and curated experiences across Karachi, Lahore, and Islamabad.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.32 }}>
                <div className="btn-row">
                  <Link href="/book" className="btn-primary">
                    Book Your Stay <ArrowRight style={{ width: 15, height: 15 }} />
                  </Link>
                  <Link href="/hotels" className="btn-secondary">
                    Explore Hotels
                  </Link>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                <div className="badges">
                  {[{ icon: '⭐', text: '4.9 Rated' }, { icon: '🏆', text: 'Award Winning' }, { icon: '🔒', text: 'Secure Booking' }].map((b, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: '#78716C', fontWeight: 500 }}>
                      <span>{b.icon}</span> {b.text}
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Image mosaic */}
            <motion.div
              className="hero-media"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="hero-img-main">
                <motion.div style={{ y: imgY, height: '120%', position: 'relative' }}>
                  <Image src="/images/hotels/karachi-lobby.jpg" alt="Grand Azure Hotel" fill sizes="(max-width: 900px) 90vw, 50vw" style={{ objectFit: 'cover' }} priority />
                </motion.div>
              </div>
              <div className="hero-img-accent">
                <Image src="/images/hotels/lahore-hero.jpg" alt="Lahore Property" fill sizes="200px" style={{ objectFit: 'cover' }} />
              </div>
            </motion.div>

          </div>
        </div>

        <motion.div
          className="scroll-hint"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}
        >
          <span style={{ fontSize: '0.6rem', letterSpacing: '0.16em', color: '#A8A29E', textTransform: 'uppercase' }}>Scroll</span>
          <div style={{ width: 1, height: 32, background: 'linear-gradient(to bottom, #A8A29E, transparent)' }} />
        </motion.div>
      </section>

      {/* ── TICKER ── */}
      <TickerStrip />

      {/* ── STATS ── */}
      <section style={{ background: '#fff', borderBottom: '1px solid #F0EDE8' }}>
        <div className="pg">
          <div className="stats-grid">
            {[
              { value: 3, suffix: '', label: 'Luxury Properties', color: '#D4722A', bg: '#FFF4ED' },
              { value: 450, suffix: '+', label: 'Curated Rooms', color: '#2563EB', bg: '#EFF6FF' },
              { value: 98, suffix: '%', label: 'Guest Satisfaction', color: '#16A34A', bg: '#F0FDF4' },
              { value: 24, suffix: '/7', label: 'Concierge Service', color: '#9333EA', bg: '#FDF4FF' },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                style={{ textAlign: 'center', padding: '1.25rem 0.75rem', background: s.bg, borderRadius: 14 }}
              >
                <div className="serif" style={{ fontSize: 'clamp(1.8rem, 5vw, 2.6rem)', color: s.color }}>
                  <CountUp to={s.value} suffix={s.suffix} />
                </div>
                <div style={{ fontSize: '0.65rem', letterSpacing: '0.08em', color: '#78716C', textTransform: 'uppercase', marginTop: 6, fontWeight: 600 }}>{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOTELS ── */}
      <section className="sec">
        <div className="pg">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: '2rem' }}>
            <span style={{ fontSize: '0.68rem', letterSpacing: '0.16em', color: '#D4722A', textTransform: 'uppercase', fontWeight: 700 }}>Our Collection</span>
            <h2 className="serif" style={{ fontSize: 'clamp(1.7rem, 4vw, 2.8rem)', marginTop: 8 }}>
              Three Cities. <em style={{ color: '#D4722A' }}>One Standard.</em>
            </h2>
          </motion.div>
          <HomeHotelCards hotels={hotels} />
        </div>
      </section>

      {/* ── ROOMS ── */}
      <section className="sec" style={{ background: '#F7F4EF' }}>
        <div className="pg">
          <div className="sub-row">
            <div>
              <span style={{ fontSize: '0.68rem', letterSpacing: '0.16em', color: '#2563EB', textTransform: 'uppercase', fontWeight: 700 }}>Accommodations</span>
              <h2 className="serif" style={{ fontSize: 'clamp(1.7rem, 4vw, 2.8rem)', marginTop: 8 }}>Rooms & Suites</h2>
            </div>
            <Link href="/book" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#2563EB', fontSize: '0.82rem', fontWeight: 600, borderBottom: '1.5px solid #BFDBFE', paddingBottom: 2 }}>
              View All <ArrowRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>

          <div className="cards-grid">
            {featuredRooms.map((room, idx) => {
              const palette = PASTEL_CARDS[idx % PASTEL_CARDS.length]
              return (
                <TiltCard key={room.room_type_id}>
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ boxShadow: `0 20px 48px ${palette.accent}22` }}
                    style={{ background: palette.bg, border: `1.5px solid ${palette.border}`, borderRadius: 18, overflow: 'hidden' }}
                  >
                    <div style={{ position: 'relative', height: 210, overflow: 'hidden' }}>
                      <Image
                        src={getRoomImage(room.type_name)}
                        alt={room.type_name}
                        fill
                        sizes="(max-width: 560px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        style={{ objectFit: 'cover', transition: 'transform 0.7s ease' }}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.transform = 'scale(1.07)')}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = 'scale(1)')}
                      />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 60%)' }} />
                      <div style={{ position: 'absolute', top: 14, left: 14, background: palette.tag, border: `1px solid ${palette.border}`, borderRadius: 999, padding: '3px 12px', fontSize: '0.62rem', fontWeight: 700, color: palette.accent, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        {room.type_category}
                      </div>
                    </div>
                    <div style={{ padding: '1.25rem 1.25rem 1.4rem' }}>
                      <h3 className="serif" style={{ fontSize: '1.2rem', marginBottom: 6 }}>{room.type_name}</h3>
                      <p style={{ fontSize: '0.82rem', color: '#78716C', lineHeight: 1.65, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {room.description}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${palette.border}`, paddingTop: '0.9rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: '#A8A29E' }}>
                          <BedDouble style={{ width: 14, height: 14 }} />
                          {room.max_occupancy} guests
                        </span>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.58rem', letterSpacing: '0.1em', color: palette.accent, textTransform: 'uppercase', fontWeight: 600, marginBottom: 1 }}>from</div>
                          <div className="serif" style={{ fontSize: '1.25rem', color: palette.accent }}>
                            {formatCurrency(Number(room.base_price))}<span style={{ fontSize: '0.68rem', color: '#A8A29E', marginLeft: 2, fontFamily: 'inherit', fontWeight: 400 }}>/night</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </TiltCard>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <div className="pg">
        <div style={{ height: 1, background: 'linear-gradient(to right, transparent, #E7E3DC, transparent)' }} />
      </div>

      {/* ── REVIEWS ── */}
      <section className="sec">
        <div className="pg">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: '2rem' }}>
            <span style={{ fontSize: '0.68rem', letterSpacing: '0.16em', color: '#9333EA', textTransform: 'uppercase', fontWeight: 700 }}>Testimonials</span>
            <h2 className="serif" style={{ fontSize: 'clamp(1.7rem, 4vw, 2.8rem)', marginTop: 8 }}>
              Guest <em style={{ color: '#9333EA' }}>Stories</em>
            </h2>
          </motion.div>

          <div className="cards-grid">
            {featuredReviews.map((review, idx) => {
              const palette = [PASTEL_CARDS[3], PASTEL_CARDS[0], PASTEL_CARDS[1]][idx % 3]
              return (
                <motion.div
                  key={review.review_id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -6, transition: { duration: 0.25 } }}
                  style={{ background: palette.bg, border: `1.5px solid ${palette.border}`, borderRadius: 18, padding: '1.6rem', position: 'relative', overflow: 'hidden' }}
                >
                  <div style={{ position: 'absolute', top: -16, right: 18, fontFamily: "'Playfair Display', serif", fontSize: '7rem', lineHeight: 1, color: palette.border, fontWeight: 700, pointerEvents: 'none', userSelect: 'none', opacity: 0.7 }}>"</div>
                  <Stars rating={review.overall_rating} />
                  <h3 className="serif" style={{ fontSize: '1.05rem', marginTop: 12, marginBottom: 8 }}>{review.title}</h3>
                  <p style={{ fontSize: '0.83rem', color: '#78716C', lineHeight: 1.7, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '1.25rem' }}>
                    {review.review_text}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderTop: `1px solid ${palette.border}`, paddingTop: '1rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: palette.tag, border: `1.5px solid ${palette.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: palette.accent, flexShrink: 0 }}>
                      {(review.guests?.first_name?.[0] ?? 'G').toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1C1917', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {review.guests?.first_name ?? 'Valued Guest'}{review.guests?.last_name ? ` ${review.guests.last_name.slice(0, 1)}.` : ''}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#A8A29E' }}>Verified Guest</div>
                    </div>
                    <div style={{ background: palette.tag, border: `1px solid ${palette.border}`, borderRadius: 999, padding: '3px 10px', fontSize: '0.72rem', fontWeight: 700, color: palette.accent, flexShrink: 0 }}>
                      {review.overall_rating}/10
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <div className="cta-block">
        <motion.div
          className="cta-inner"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div style={{ position: 'absolute', top: -40, right: -40, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,114,42,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -40, left: -40, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <span style={{ fontSize: '0.68rem', letterSpacing: '0.16em', color: '#D4722A', textTransform: 'uppercase', fontWeight: 700 }}>Begin Your Journey</span>
          <h2 className="serif" style={{ fontSize: 'clamp(1.75rem, 5vw, 3.2rem)', color: '#FDF8F3', marginTop: 14, marginBottom: 16 }}>
            Your next unforgettable<br />stay <em style={{ color: '#D4722A' }}>awaits</em>
          </h2>
          <p style={{ fontSize: '0.93rem', color: '#A8A29E', marginBottom: '2.5rem', lineHeight: 1.75, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
            Experience the finest in Pakistani hospitality — from rooftop pools to award-winning dining.
          </p>
          <div className="cta-btns">
            <Link href="/book" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#D4722A', color: '#fff', padding: '13px 32px', borderRadius: 10, fontSize: '0.85rem', fontWeight: 600, boxShadow: '0 6px 24px rgba(212,114,42,0.4)', whiteSpace: 'nowrap' }}>
              Book Your Stay <ChevronRight style={{ width: 16, height: 16 }} />
            </Link>
            <Link href="/hotels" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.15)', color: '#F5F0E8', padding: '13px 28px', borderRadius: 10, fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
              Explore Hotels
            </Link>
          </div>
        </motion.div>
      </div>

    </div>
  )
}
