'use client'

import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { MapPin, Phone, Star, ArrowRight, Sparkles, ChevronLeft, ChevronRight, Award, BedDouble, Building2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

type HotelType = {
  hotel_id: number
  hotel_name: string
  city: string
  state_province: string
  star_rating: number
  address_line1: string
  phone: string
  total_rooms: number
}

const heroSlides = [
  {
    city: 'Karachi',
    image: '/images/hotels/karachi-lobby.jpg',
    headline: 'Where the\nArabian Sea',
    accent: 'Meets Opulence',
    tagline: 'Karachi\'s most coveted address on the waterfront',
    badge: 'Flagship Property',
  },
  {
    city: 'Lahore',
    image: '/images/hotels/lahore-lobby.jpg',
    headline: 'Timeless\nMughal Splendour',
    accent: 'Reimagined',
    tagline: 'A palace experience in the heart of cultural Lahore',
    badge: 'Heritage Collection',
  },
  {
    city: 'Islamabad',
    image: '/images/hotels/islamabad-hero.jpg',
    headline: 'Margalla\nHills Serenity',
    accent: 'Elevated',
    tagline: 'The capital\'s premier retreat above the city skyline',
    badge: 'Mountain Escape',
  },
]

const cityImageMap: Record<string, string> = {
  Karachi: '/images/hotels/karachi-hero.jpg',
  Lahore: '/images/hotels/lahore-hero.jpg',
  Islamabad: '/images/hotels/islamabad-hero.jpg',
}

const experienceCards = [
  {
    label: 'Private Butler Service',
    image: '/images/hotels/karachi-lobby.jpg',
    icon: '🛎',
    hue: 'from-[#7c3a0e]/80 to-[#D4722A]/60',
  },
  {
    label: 'Skyline Rooftop Evenings',
    image: '/images/hotels/lahore-lobby.jpg',
    icon: '🌆',
    hue: 'from-[#0a2c4a]/80 to-[#1a6fa8]/60',
  },
  {
    label: 'Chef-Curated Dining',
    image: '/images/amenities/swimming-pool.jpg',
    icon: '🍽',
    hue: 'from-[#1a0a2e]/80 to-[#6b21a8]/60',
  },
  {
    label: 'Holistic Spa Rituals',
    image: '/images/hotels/islamabad-lobby.jpg',
    icon: '✦',
    hue: 'from-[#022c22]/80 to-[#065f46]/60',
  },
]

const tickerItems = [
  'Concierge on Demand',
  'Signature Suites',
  'Award-Winning Hospitality',
  'Personalised City Tours',
  'Fine Dining Experiences',
  'Wellness & Serenity',
]

function GoldText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`inline-block ${className}`}
      style={{
        background: 'linear-gradient(90deg,#D4722A 0%,#D4722A 30%,#e08a49 50%,#D4722A 70%,#D4722A 100%)',
        backgroundSize: '200% auto',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        animation: 'shimmerGold 4s linear infinite',
      }}
    >
      {children}
    </span>
  )
}

/* ─────────────────────────────────────────────
   Cinematic Hero — light/cream style matching restaurant page
───────────────────────────────────────────── */
function CinematicHero() {
  const [active, setActive] = useState(0)
  const [dir, setDir] = useState(1)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const go = (next: number, direction: number) => {
    setDir(direction)
    setActive(next)
  }

  const next = () => go((active + 1) % heroSlides.length, 1)
  const back = () => go((active - 1 + heroSlides.length) % heroSlides.length, -1)

  useEffect(() => {
    timerRef.current = setInterval(next, 6000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [active])

  const slide = heroSlides[active]

  return (
    <div
      className="relative w-full overflow-hidden rounded-[1.5rem] shadow-[0_16px_56px_rgba(0,0,0,0.12)]"
      style={{ minHeight: 420 }}
    >
      <style>{`
        @keyframes shimmerGold {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes kenBurns {
          0%   { transform: scale(1)    translateX(0); }
          100% { transform: scale(1.07) translateX(-1%); }
        }
        .kb { animation: kenBurns 8s ease-out forwards; }

        /* ── Hero height mirrors .hero-wrapper ── */
        .hotel-hero-inner {
          position: relative;
          min-height: 420px;
          display: flex;
          align-items: center;
          background: #FFF8F2;
        }
        @media (min-width: 768px) {
          .hotel-hero-inner { min-height: 480px; }
        }

        /* ── Headline matches .hero-h1 exactly ── */
        .hotel-h1 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(2rem, 5vw, 3.4rem);
          line-height: 1.05;
          font-weight: 400;
          letter-spacing: -0.025em;
          color: #1C1917;
          display: block;
          margin-bottom: 0.04em;
        }
        /* Accent / italic line — matches .hero-h1-italic */
        .hotel-h1-italic {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(2rem, 5vw, 3.4rem);
          line-height: 1.05;
          font-weight: 400;
          font-style: italic;
          letter-spacing: -0.025em;
          display: block;
        }

        /* Sub-copy matches .hero-sub */
        .hotel-sub {
          font-size: clamp(0.8rem, 1.4vw, 0.88rem);
          color: #78716C;
          line-height: 1.9;
          max-width: 340px;
          font-weight: 400;
          letter-spacing: 0.01em;
        }

        /* Eyebrow matches .hero-eyebrow-text */
        .hotel-eyebrow-text {
          font-size: 0.6rem;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: #C4894A;
          font-weight: 600;
        }

        /* Meta bar at bottom — mirrors .hero-meta-bar */
        .hotel-meta-bar {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          z-index: 6;
          border-top: 1px solid rgba(196,137,74,0.14);
          padding: 0.85rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          background: rgba(255,248,242,0.88);
          backdrop-filter: blur(8px);
        }
        @media (max-width: 640px) {
          .hotel-meta-bar { padding: 0.75rem 1.25rem; }
          .hotel-meta-right { display: none !important; }
        }
        .hotel-meta-label { font-size: 0.5rem; letter-spacing: 0.22em; text-transform: uppercase; color: #C4894A; font-weight: 600; }
        .hotel-meta-value { font-size: 0.72rem; color: #78716C; font-weight: 400; margin-top: 3px; }
        .hotel-meta-sep   { width: 1px; height: 22px; background: rgba(196,137,74,0.2); flex-shrink: 0; }
      `}</style>

      {/* ── Background image layer ── */}
      <div className="hotel-hero-inner">
        <AnimatePresence mode="sync">
          <motion.div
            key={active}
            className="absolute inset-0"
            initial={{ opacity: 0, x: dir * 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -50 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="kb absolute inset-0">
              <Image
                src={slide.image}
                alt={slide.city}
                fill
                priority
                className="object-cover"
                sizes="100vw"
              />
            </div>
            {/* Light cream gradient overlays — matching restaurant hero exactly */}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(255,248,242,0.96) 0%, rgba(255,248,242,0.84) 42%, rgba(255,248,242,0.54) 68%, rgba(255,248,242,0.72) 100%)' }} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(255,248,242,0.98) 0%, rgba(255,248,242,0.32) 18%, transparent 40%)' }} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(255,248,242,0.72) 0%, transparent 22%)' }} />
          </motion.div>
        </AnimatePresence>

        {/* ── Decorative gold corner brackets ── */}
        <div className="pointer-events-none absolute inset-0 z-10">
          <div className="absolute left-6 top-0 h-full w-px" style={{ background: 'linear-gradient(to bottom, transparent, rgba(212,114,42,0.15), transparent)' }} />
          <div className="absolute right-6 top-0 h-full w-px" style={{ background: 'linear-gradient(to bottom, transparent, rgba(212,114,42,0.15), transparent)' }} />
          <svg className="absolute left-5 top-5 h-10 w-10 opacity-30" viewBox="0 0 48 48" fill="none">
            <path d="M2 24 L2 2 L24 2" stroke="#D4722A" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <svg className="absolute right-5 top-5 h-10 w-10 -scale-x-100 opacity-30" viewBox="0 0 48 48" fill="none">
            <path d="M2 24 L2 2 L24 2" stroke="#D4722A" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <svg className="absolute left-5 bottom-16 h-10 w-10 -scale-y-100 opacity-30" viewBox="0 0 48 48" fill="none">
            <path d="M2 24 L2 2 L24 2" stroke="#D4722A" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <svg className="absolute right-5 bottom-16 h-10 w-10 scale-[-1] opacity-30" viewBox="0 0 48 48" fill="none">
            <path d="M2 24 L2 2 L24 2" stroke="#D4722A" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>

        {/* ── Content ── */}
        <div className="relative z-20 w-full px-5 sm:px-10 lg:px-14" style={{ paddingTop: '3.5rem', paddingBottom: '5rem' }}>
          <div className="flex flex-col gap-0 lg:flex-row lg:items-center">

            {/* LEFT — mirrors .hero-left */}
            <div className="lg:flex-[0_0_58%]">

              {/* Eyebrow */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`eyebrow-${active}`}
                  className="flex items-center gap-3 mb-5"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="w-7 h-px flex-shrink-0" style={{ background: '#C4894A' }} />
                  <span className="hotel-eyebrow-text">{slide.city}, Pakistan · {slide.badge}</span>
                </motion.div>
              </AnimatePresence>

              {/* Headline */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`headline-${active}`}
                  initial={{ opacity: 0, y: 36, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -16, filter: 'blur(4px)' }}
                  transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-1"
                >
                  {slide.headline.split('\n').map((line, i) => (
                    <span key={i} className="hotel-h1">{line}</span>
                  ))}
                  <span className="hotel-h1-italic">
                    <GoldText>{slide.accent}</GoldText>
                  </span>
                </motion.div>
              </AnimatePresence>

              {/* Divider */}
              <motion.div
                className="my-4"
                style={{ width: 36, height: 1, background: 'rgba(196,137,74,0.35)' }}
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.7, delay: 0.5 }}
              />

              {/* Sub-copy */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={`sub-${active}`}
                  className="hotel-sub mb-6"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.65, delay: 0.2 }}
                >
                  {slide.tagline}
                </motion.p>
              </AnimatePresence>

              {/* CTAs */}
              <motion.div
                className="flex flex-wrap items-center gap-3"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.65 }}
              >
                <Link
                  href="/book"
                  className="inline-flex items-center gap-2.5"
                  style={{
                    background: '#D4722A',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 28px',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    borderRadius: 2,
                    transition: 'background 0.22s, transform 0.18s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#B85E20'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#D4722A'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
                >
                  Reserve a Suite
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="#hotels"
                  className="inline-flex items-center gap-2"
                  style={{
                    padding: '12px 22px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#78716C',
                    border: '1px solid rgba(28,25,23,0.18)',
                    borderRadius: 2,
                    backdropFilter: 'blur(8px)',
                    background: 'rgba(255,255,255,0.6)',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.85)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.6)' }}
                >
                  Explore Properties
                </Link>
              </motion.div>

              {/* Slide dots */}
              <motion.div
                className="flex items-center gap-2 mt-7"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.6 }}
              >
                {heroSlides.map((_, i) => (
                  <motion.button
                    key={i}
                    onClick={() => go(i, i > active ? 1 : -1)}
                    animate={{
                      width: i === active ? 36 : 16,
                      background: i === active ? '#C4894A' : 'rgba(196,137,74,0.25)',
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    style={{ height: 2, borderRadius: 1, border: 'none', cursor: 'pointer', padding: 0 }}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </motion.div>
            </div>

            {/* RIGHT — stat panel, hidden on mobile */}
            <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:pr-4">
              <motion.div
                className="flex flex-col gap-3 items-end"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.9, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Vertical tag */}
                <span style={{
                  writingMode: 'vertical-rl',
                  fontSize: '0.52rem',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: 'rgba(196,137,74,0.65)',
                  padding: '14px 8px',
                  border: '1px solid rgba(212,114,42,0.18)',
                  borderRadius: 2,
                  whiteSpace: 'nowrap',
                }}>
                  Luxury Collection
                </span>

                {/* Stats card */}
                <div style={{
                  background: 'rgba(255,255,255,0.88)',
                  border: '1px solid rgba(212,114,42,0.22)',
                  borderRadius: 4,
                  padding: '16px 20px',
                  backdropFilter: 'blur(14px)',
                  minWidth: 190,
                  boxShadow: '0 4px 24px rgba(196,137,74,0.10)',
                }}>
                  {[
                    { icon: Building2, value: '3', label: 'Properties' },
                    { icon: BedDouble, value: '480+', label: 'Suites' },
                    { icon: Award,     value: '5★',  label: 'Rated' },
                  ].map((stat, i) => (
                    <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: i < 2 ? 12 : 0, paddingBottom: i < 2 ? 12 : 0, borderBottom: i < 2 ? '1px solid rgba(212,114,42,0.12)' : 'none' }}>
                      <stat.icon style={{ width: 14, height: 14, color: '#D4722A', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1C1917' }}>{stat.value}</div>
                        <div style={{ fontSize: '0.58rem', color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.14em' }}>{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* City thumbnails */}
                <div className="flex gap-2">
                  {heroSlides.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => go(i, i > active ? 1 : -1)}
                      className="relative overflow-hidden transition-all duration-300"
                      style={{
                        height: 52, width: 40,
                        borderRadius: 8,
                        border: i === active ? '2px solid #D4722A' : '2px solid rgba(28,25,23,0.15)',
                        opacity: i === active ? 1 : 0.5,
                        transform: i === active ? 'scale(1.08)' : 'scale(1)',
                      }}
                    >
                      <Image src={s.image} alt={s.city} fill className="object-cover" sizes="40px" />
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* ── Bottom meta bar ── */}
        <motion.div
          className="hotel-meta-bar"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Prev / Next */}
          <div className="flex items-center gap-2">
            <button
              onClick={back}
              className="flex h-8 w-8 items-center justify-center transition-all hover:border-[#C4894A]"
              style={{ borderRadius: 2, border: '1px solid rgba(28,25,23,0.18)', background: 'rgba(255,255,255,0.6)', color: '#44403C' }}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={next}
              className="flex h-8 w-8 items-center justify-center transition-all"
              style={{ borderRadius: 2, border: '1px solid rgba(212,114,42,0.4)', background: 'rgba(212,114,42,0.12)', color: '#D4722A' }}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Right stats */}
          <div className="hotel-meta-right flex items-center gap-5">
            {[
              { label: 'Properties', value: '3 Cities' },
              { label: 'Rating',     value: '5.0 / 5 ★' },
              { label: 'Suites',     value: '480+ Rooms' },
              { label: 'Service',    value: '24 / 7' },
            ].map((stat, i, arr) => (
              <div key={stat.label} className="flex items-center gap-5">
                <div>
                  <div className="hotel-meta-label">{stat.label}</div>
                  <div className="hotel-meta-value">{stat.value}</div>
                </div>
                {i < arr.length - 1 && <div className="hotel-meta-sep" />}
              </div>
            ))}
          </div>
        </motion.div>
      </div>{/* end hotel-hero-inner */}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Main export
───────────────────────────────────────────── */
export default function HotelsShowcase({ hotels }: { hotels: HotelType[] }) {
  return (
    <div className="space-y-12">

      {/* ════════ CINEMATIC HERO ════════ */}
      <CinematicHero />

      {/* ════════ EXPERIENCE CARDS ════════ */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#D4722A]/40 to-transparent" />
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#D4722A]">Curated Experiences</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#D4722A]/40 to-transparent" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {experienceCards.map((card, index) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.07, duration: 0.6 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative h-40 overflow-hidden rounded-2xl shadow-lg"
              style={{ transformStyle: 'preserve-3d', perspective: 900 }}
            >
              <Image
                src={card.image}
                alt={card.label}
                fill
                sizes="(max-width: 640px) 100vw, 25vw"
                className="object-cover transition duration-700 group-hover:scale-110"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${card.hue}`} />
              <div className="absolute inset-0 flex flex-col justify-end p-4">
                <span className="text-xl">{card.icon}</span>
                <p className="mt-1 text-sm font-bold text-white leading-tight">{card.label}</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60 mt-0.5">
                  Grand Azure Collection
                </p>
              </div>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* ════════ TICKER ════════ */}
      <div className="overflow-hidden rounded-2xl border border-[#D4722A] bg-[#fff6ed] py-2.5 shadow-sm">
        <motion.div
          className="flex w-max whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 28, ease: 'linear', repeat: Infinity }}
        >
          {[...tickerItems, ...tickerItems].map((item, idx) => (
            <span
              key={`${item}-${idx}`}
              className="inline-flex items-center gap-2 px-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b5a3c]"
            >
              <span className="h-1 w-1 rotate-45 bg-[#D4722A] inline-block" />
              {item}
            </span>
          ))}
        </motion.div>
      </div>

      {/* ════════ HOTEL CARDS ════════ */}
      <div id="hotels" className="space-y-4 scroll-mt-24">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#D4722A]">Our Properties</p>
            <h2 className="font-display text-3xl font-bold text-stone-900 mt-1">Across Pakistan</h2>
          </div>
          <Link
            href="/book"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#D4722A] bg-[#D4722A] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#B85E20]"
          >
            Book a Room <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {hotels.map((hotel, index) => (
            <motion.article
              key={hotel.hotel_id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -8 }}
              className="group overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-[0_8px_40px_rgba(0,0,0,0.08)] transition-shadow hover:shadow-[0_20px_60px_rgba(0,0,0,0.14)]"
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={cityImageMap[hotel.city] ?? '/images/placeholders/hotel-placeholder.jpg'}
                  alt={hotel.hotel_name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  className="object-cover transition duration-700 group-hover:scale-110"
                  priority={index < 2}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/65 via-stone-900/10 to-transparent" />

                {/* Lobby thumbnail inset */}
                <div className="absolute bottom-3 right-3 h-14 w-20 overflow-hidden rounded-xl border-2 border-white/70 shadow-lg opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <Image
                    src={hotel.city === 'Karachi' ? '/images/hotels/karachi-lobby.jpg' : hotel.city === 'Lahore' ? '/images/hotels/lahore-lobby.jpg' : '/images/hotels/islamabad-lobby.jpg'}
                    alt="Lobby"
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>

                <div className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full border border-white/60 bg-white/85 px-3 py-1 text-xs font-semibold text-stone-700">
                  <Star className="h-3 w-3 text-[#D4722A]" />
                  {hotel.star_rating}.0 Rating
                </div>
                <div className="absolute right-4 top-4 rounded-full border border-[#D4722A]/40 bg-black/30 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                  {hotel.total_rooms} Rooms
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4 p-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="h-1.5 w-1.5 rotate-45 bg-[#D4722A] inline-block" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#D4722A]">{hotel.city}</p>
                  </div>
                  <h2 className="font-display text-2xl font-bold text-stone-900">{hotel.hotel_name}</h2>
                </div>

                <div className="space-y-2">
                  <p className="flex items-start gap-2 text-sm text-stone-600">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#D4722A]" />
                    {hotel.address_line1}, {hotel.state_province}
                  </p>
                  <p className="flex items-center gap-2 text-sm text-stone-600">
                    <Phone className="h-4 w-4 shrink-0 text-emerald-600" />
                    {hotel.phone}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-stone-100 pt-4">
                  <span className="rounded-full bg-[#fff2e6] px-3 py-1 text-xs font-semibold text-[#D4722A]">
                    Luxury Collection
                  </span>
                  <Link
                    href={`/hotels/${hotel.hotel_id}`}
                    className="group/btn inline-flex items-center gap-1.5 rounded-full border border-[#D4722A]/40 bg-gradient-to-r from-[#D4722A] to-[#B85E20] px-4 py-1.5 text-xs font-semibold text-white shadow-[0_2px_12px_rgba(180,120,30,0.3)] transition-all hover:shadow-[0_4px_20px_rgba(180,120,30,0.5)] hover:-translate-y-0.5"
                  >
                    Explore
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  )
}