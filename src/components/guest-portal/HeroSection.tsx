'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useRef } from 'react'
import {
  Sparkles,
  CalendarCheck2,
  ShieldCheck,
  Gem,
  Clock3,
  ConciergeBell,
  Star,
} from 'lucide-react'
import Image from 'next/image'

function GoldParticle({ style }: { style: React.CSSProperties }) {
  return (
    <span
      className="pointer-events-none absolute rounded-full bg-[#D4722A]/40"
      style={style}
    />
  )
}

function TiltCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 20 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 20 })

  function handleMouse(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current!.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  function handleLeave() {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 1000 }}
      className="h-full w-full"
    >
      {children}
    </motion.div>
  )
}

export default function HeroSection() {
  const particles = [
    { width: 6, height: 6, top: '12%', left: '8%',  animationDelay: '0s',   animationDuration: '7s'   },
    { width: 4, height: 4, top: '28%', left: '3%',  animationDelay: '1.2s', animationDuration: '9s'   },
    { width: 8, height: 8, top: '55%', left: '6%',  animationDelay: '2.5s', animationDuration: '8s'   },
    { width: 5, height: 5, top: '75%', left: '12%', animationDelay: '0.8s', animationDuration: '10s'  },
    { width: 3, height: 3, top: '90%', left: '5%',  animationDelay: '3s',   animationDuration: '6s'   },
    { width: 7, height: 7, top: '18%', right: '7%', animationDelay: '1.5s', animationDuration: '8.5s' },
    { width: 4, height: 4, top: '42%', right: '4%', animationDelay: '0.4s', animationDuration: '7.5s' },
    { width: 6, height: 6, top: '68%', right: '9%', animationDelay: '2s',   animationDuration: '9.5s' },
  ]

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
  }

  const fadeUp = {
    hidden: { opacity: 0, y: 28 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
  }

  const fadeLeft = {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
  }

  return (
    <>
      <style>{`
        @keyframes floatY {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
        @keyframes shimmerGold {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes particleDrift {
          0%   { transform: translateY(0) scale(1);   opacity: 0; }
          10%  { opacity: 0.7; }
          90%  { opacity: 0.3; }
          100% { transform: translateY(-80px) scale(0.5); opacity: 0; }
        }
        .gold-shimmer-text {
          background: linear-gradient(90deg, #a85520 0%, #D4722A 30%, #e8915a 50%, #D4722A 70%, #a85520 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmerGold 4s linear infinite;
        }
        .float-image   { animation: floatY 5s ease-in-out infinite; }
        .spin-slow     { animation: spinSlow 18s linear infinite; }
        .particle-drift { animation: particleDrift ease-in-out infinite; }
      `}</style>

      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-[#e8d5b7] bg-[#FFF8F2] shadow-[0_8px_60px_rgba(180,120,30,0.12)]">

        {/* ── Background decorations ── */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-[#f7e4c0]/50 blur-[80px]" />
          <div className="absolute -right-16 top-10 h-80 w-80 rounded-full bg-[#fde8d0]/40 blur-[60px]" />
          <div className="absolute bottom-0 left-1/2 h-48 w-[600px] -translate-x-1/2 rounded-full bg-[#fdf0dc]/60 blur-[50px]" />

          <svg className="absolute inset-0 h-full w-full opacity-[0.035]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#D4722A" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Corner ornaments — hidden on very small screens */}
          <svg className="absolute left-4 top-4 h-12 w-12 sm:h-16 sm:w-16 opacity-20" viewBox="0 0 64 64" fill="none">
            <path d="M4 4 L4 32 Q4 4 32 4 Z" stroke="#D4722A" strokeWidth="1.2" />
            <path d="M10 10 L10 26 Q10 10 26 10 Z" stroke="#D4722A" strokeWidth="0.6" />
            <circle cx="4" cy="4" r="2.5" fill="#D4722A" />
          </svg>
          <svg className="absolute right-4 top-4 h-12 w-12 sm:h-16 sm:w-16 -scale-x-100 opacity-20" viewBox="0 0 64 64" fill="none">
            <path d="M4 4 L4 32 Q4 4 32 4 Z" stroke="#D4722A" strokeWidth="1.2" />
            <path d="M10 10 L10 26 Q10 10 26 10 Z" stroke="#D4722A" strokeWidth="0.6" />
            <circle cx="4" cy="4" r="2.5" fill="#D4722A" />
          </svg>
          <svg className="absolute bottom-4 left-4 h-12 w-12 sm:h-16 sm:w-16 -scale-y-100 opacity-20" viewBox="0 0 64 64" fill="none">
            <path d="M4 4 L4 32 Q4 4 32 4 Z" stroke="#D4722A" strokeWidth="1.2" />
            <circle cx="4" cy="4" r="2.5" fill="#D4722A" />
          </svg>

          {particles.map((p, i) => (
            <GoldParticle
              key={i}
              style={{
                width:             p.width,
                height:            p.height,
                top:               p.top,
                left:              'left'  in p ? p.left  : undefined,
                right:             'right' in p ? (p as any).right : undefined,
                animationDelay:    p.animationDelay,
                animationDuration: p.animationDuration,
              } as React.CSSProperties}
            />
          ))}
        </div>

        {/* ── Main grid: stacks on mobile, side-by-side on lg ── */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr]">

          {/* ══ LEFT / TOP PANEL ══ */}
          <motion.div
            className="flex flex-col justify-between p-6 sm:p-8 lg:p-12"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="space-y-5 sm:space-y-6">

              {/* Badge */}
              <motion.div variants={fadeUp} className="flex items-center gap-2.5">
                <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-[#e0be85] bg-gradient-to-r from-[#fdf3e2] to-[#fff8ee] px-3 py-1.5 sm:px-4 shadow-sm">
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#D4722A]" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.22em] sm:tracking-[0.26em] text-[#a0640e]">
                    Reservation Atelier
                  </span>
                  <span className="hidden xs:block h-3 w-px bg-[#D4722A]" />
                  <span className="hidden xs:flex items-center gap-1 text-[9px] font-semibold text-[#D4722A]">
                    <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                    Rooms Available
                  </span>
                </div>
              </motion.div>

              {/* Headline */}
              <motion.div variants={fadeUp}>
                <h1
                  className="font-display leading-[1.05] tracking-tight text-[#2c1a08]"
                  style={{ fontSize: 'clamp(1.75rem, 5vw, 3.4rem)', fontWeight: 400 }}
                >
                  Curate Your
                  <br />
                  <span
                    className="gold-shimmer-text font-display italic"
                    style={{ fontSize: 'clamp(1.75rem, 5vw, 3.4rem)', fontWeight: 400 }}
                  >
                    Perfect Stay
                  </span>
                </h1>
              </motion.div>

              {/* Divider */}
              <motion.div
                variants={{
                  hidden:  { scaleX: 0, opacity: 0 },
                  visible: { scaleX: 1, opacity: 1, transition: { duration: 0.8, ease: 'easeOut' } },
                }}
                className="origin-left"
              >
                <div className="flex items-center gap-3">
                  <div className="h-px w-16 bg-gradient-to-r from-[#D4722A] to-transparent" />
                  <div className="h-1.5 w-1.5 rotate-45 bg-[#D4722A]" />
                  <div className="h-px w-8 bg-gradient-to-r from-[#D4722A]/50 to-transparent" />
                </div>
              </motion.div>

              {/* Body copy */}
              <motion.p
                variants={fadeUp}
                className="max-w-md text-[#7b5c38]"
                style={{ fontSize: 'clamp(0.78rem, 1.4vw, 0.88rem)', lineHeight: 1.9, fontWeight: 400, letterSpacing: '0.01em' }}
              >
                Handpicked rooms, dynamic seasonal privileges, and seamless confirmation — crafted for the discerning traveller who expects nothing less than extraordinary.
              </motion.p>
            </div>

            {/* ── Stats cards ── */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="mt-7 sm:mt-8 grid grid-cols-3 gap-2 sm:gap-3"
            >
              {[
                { icon: CalendarCheck2, label: 'Confirmation', value: 'Instant',   sub: 'Real-Time'    },
                { icon: ShieldCheck,    label: 'Checkout',     value: 'Secured',   sub: 'End-to-End'   },
                { icon: Gem,            label: 'Benefits',     value: 'Exclusive', sub: 'Direct Perks' },
              ].map((item) => (
                <motion.div
                  key={item.label}
                  variants={fadeUp}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="group rounded-xl sm:rounded-2xl border border-[#e8d2ae] bg-white/70 px-2.5 py-3 sm:px-4 sm:py-3.5 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-[0_4px_20px_rgba(212,114,42,0.15)]"
                >
                  {/* Label row */}
                  <div className="flex items-center gap-1 sm:gap-1.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.12em] sm:tracking-[0.16em] text-[#a06828]">
                    <item.icon className="h-3 w-3 shrink-0 text-[#D4722A]" />
                    {/* Truncate label on very small screens */}
                    <span className="truncate">{item.label}</span>
                  </div>
                  {/* Value */}
                  <p className="mt-1.5 sm:mt-2 text-sm sm:text-lg font-bold text-[#2c1a08] leading-tight">
                    {item.value}
                  </p>
                  {/* Sub — hide on xs if too cramped */}
                  <p className="hidden xs:block text-[10px] sm:text-[11px] text-[#b89060]">{item.sub}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* ══ RIGHT / BOTTOM PANEL ══ */}
          <motion.div
            variants={fadeLeft}
            initial="hidden"
            animate="visible"
            className="relative flex flex-col border-t border-[#e8d5b7] lg:border-l lg:border-t-0"
          >
            {/* Image area */}
            <div className="relative flex-1 overflow-hidden bg-[#FFF8F2]">
              <TiltCard>
                {/* Fixed height on mobile so image is visible; flex-1 takes over on lg */}
                <div className="relative h-56 xs:h-64 sm:h-72 lg:h-full min-h-0 lg:min-h-[300px] w-full">
                  <Image
                    src="/images/hero-room.jpg"
                    alt="Luxury suite interior"
                    fill
                    className="object-cover object-center"
                    priority
                  />

                  {/* Overlay layers */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(to right, rgba(255,248,242,0.82) 0%, rgba(255,248,242,0.48) 38%, rgba(255,248,242,0.18) 65%, rgba(255,248,242,0.32) 100%)',
                    }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(to top, rgba(255,248,242,0.96) 0%, rgba(255,248,242,0.28) 20%, transparent 42%)',
                    }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(to bottom, rgba(255,248,242,0.60) 0%, transparent 24%)',
                    }}
                  />

                  {/* Rating badge */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9, duration: 0.5, type: 'spring' }}
                    className="absolute right-3 top-3 sm:right-4 sm:top-4 flex items-center gap-1.5 rounded-full border border-[#e0be85]/60 bg-white/80 px-2.5 py-1 sm:px-3 sm:py-1.5 shadow-lg backdrop-blur-sm"
                  >
                    <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-[#D4722A] text-[#D4722A]" />
                    <span className="text-[11px] sm:text-xs font-bold text-[#2c1a08]">4.9</span>
                    <span className="text-[9px] sm:text-[10px] text-[#a06828]">/ 5.0</span>
                  </motion.div>

                  {/* Thumbnail strip */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.1, duration: 0.6 }}
                    className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 flex gap-1.5 sm:gap-2"
                  >
                    {[
                      { src: '/images/hero-room-thumb-1.jpg', alt: 'Suite detail', delay: '0s' },
                      { src: '/images/hero-room-thumb-2.jpg', alt: 'Room accent',  delay: '0.4s' },
                    ].map((thumb) => (
                      <div
                        key={thumb.alt}
                        className="float-image h-11 w-11 sm:h-14 sm:w-14 overflow-hidden rounded-lg sm:rounded-xl border-2 border-white/80 shadow-lg"
                        style={{ animationDelay: thumb.delay }}
                      >
                        <Image
                          src={thumb.src}
                          alt={thumb.alt}
                          width={56}
                          height={56}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </motion.div>

                  {/* Spinning ornament */}
                  <div className="absolute right-3 bottom-16 sm:right-4 sm:bottom-20 h-8 w-8 sm:h-10 sm:w-10 spin-slow opacity-25">
                    <svg viewBox="0 0 40 40" fill="none">
                      <circle cx="20" cy="20" r="18" stroke="#D4722A" strokeWidth="0.8" strokeDasharray="4 3" />
                      <circle cx="20" cy="20" r="3" fill="#D4722A" />
                    </svg>
                  </div>
                </div>
              </TiltCard>

              {/* Floating availability pill */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3, duration: 0.5 }}
                className="float-image absolute bottom-4 sm:bottom-6 left-1/2 z-20 -translate-x-1/2 w-max"
                style={{ animationDelay: '1s', animationDuration: '4s' }}
              >
                <div className="flex items-center gap-2 rounded-full border border-[#e0be85]/70 bg-white/90 px-3 py-1.5 sm:px-4 sm:py-2 shadow-[0_4px_20px_rgba(212,114,42,0.2)] backdrop-blur-sm">
                  <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-[11px] sm:text-xs font-semibold text-[#2c1a08] whitespace-nowrap">
                    Suites available tonight
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Guest Privileges panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="border-t border-[#e8d5b7] bg-gradient-to-br from-[#fffaf4] to-[#fff4e2] p-4 sm:p-6"
            >
              <h2 className="mb-2.5 sm:mb-3 text-[9px] font-bold uppercase tracking-[0.22em] text-[#a06828]">
                Guest Privileges
              </h2>

              {/* On mobile: 2-col grid so both items sit side-by-side; on sm+ revert to stacked */}
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-2.5">
                {[
                  { icon: ConciergeBell, text: 'Concierge follow-up after booking'  },
                  { icon: Clock3,        text: 'Priority check-in queue on arrival' },
                ].map((item) => (
                  <motion.div
                    key={item.text}
                    whileHover={{ x: 3 }}
                    className="flex items-center gap-2.5 sm:gap-3 rounded-xl border border-[#ead8b8] bg-white/60 px-3 py-2.5 sm:px-3.5 sm:py-3 text-xs sm:text-sm text-[#5c3d1e] shadow-sm transition-colors hover:bg-white/90"
                  >
                    <span className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-lg border border-[#e0be85] bg-gradient-to-br from-[#fff3dc] to-[#fde8c0]">
                      <item.icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#D4722A]" />
                    </span>
                    <span className="leading-snug">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </>
  )
}