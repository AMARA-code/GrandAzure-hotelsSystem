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
  ArrowRight,
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
        @keyframes pulseOpacity {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 1; }
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

      <div className="relative overflow-hidden rounded-3xl border border-[#e8d5b7] bg-[#fffaf4] shadow-[0_8px_60px_rgba(180,120,30,0.12)]">

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

          <svg className="absolute left-4 top-4 h-16 w-16 opacity-20" viewBox="0 0 64 64" fill="none">
            <path d="M4 4 L4 32 Q4 4 32 4 Z" stroke="#D4722A" strokeWidth="1.2" />
            <path d="M10 10 L10 26 Q10 10 26 10 Z" stroke="#D4722A" strokeWidth="0.6" />
            <circle cx="4" cy="4" r="2.5" fill="#D4722A" />
          </svg>
          <svg className="absolute right-4 top-4 h-16 w-16 -scale-x-100 opacity-20" viewBox="0 0 64 64" fill="none">
            <path d="M4 4 L4 32 Q4 4 32 4 Z" stroke="#D4722A" strokeWidth="1.2" />
            <path d="M10 10 L10 26 Q10 10 26 10 Z" stroke="#D4722A" strokeWidth="0.6" />
            <circle cx="4" cy="4" r="2.5" fill="#D4722A" />
          </svg>
          <svg className="absolute bottom-4 left-4 h-16 w-16 -scale-y-100 opacity-20" viewBox="0 0 64 64" fill="none">
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

        <div className="relative z-10 grid min-h-[520px] lg:grid-cols-[1.2fr_0.8fr]">

          <motion.div
            className="flex flex-col justify-between p-8 sm:p-10 lg:p-12"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="space-y-6">
              <motion.div variants={fadeUp} className="flex items-center gap-2.5">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#e0be85] bg-gradient-to-r from-[#fdf3e2] to-[#fff8ee] px-4 py-1.5 shadow-sm">
                  <Sparkles className="h-3.5 w-3.5 text-[#D4722A]" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a0640e]">
                    Reservation Atelier
                  </span>
                  <span className="h-3 w-px bg-[#D4722A]" />
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-[#D4722A]">
                    <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                    Rooms Available
                  </span>
                </div>
              </motion.div>

              <motion.div variants={fadeUp}>
                <h1 className="font-display text-5xl font-bold leading-[1.08] tracking-tight text-[#2c1a08] sm:text-6xl">
                  Curate Your
                  <br />
                  <span className="gold-shimmer-text font-display text-5xl font-bold italic sm:text-6xl">
                    Perfect Stay
                  </span>
                </h1>
              </motion.div>

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

              <motion.p variants={fadeUp} className="max-w-md text-base leading-7 text-[#7b5c38]">
                Handpicked rooms, dynamic seasonal privileges, and seamless confirmation — crafted for the discerning traveller who expects nothing less than extraordinary.
              </motion.p>

              <motion.div variants={fadeUp}>
                <button className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-[#D4722A] bg-[#D4722A] px-7 py-3.5 text-sm font-bold tracking-wide text-white shadow-[0_4px_24px_rgba(212,114,42,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(212,114,42,0.5)]">
                  <span className="relative z-10">Begin Your Reservation</span>
                  <span className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/20 transition-transform duration-300 group-hover:translate-x-0.5">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </button>
              </motion.div>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="mt-8 grid grid-cols-3 gap-3"
            >
              {[
                { icon: CalendarCheck2, label: 'Confirmation', value: 'Instant',   sub: 'Real-Time'   },
                { icon: ShieldCheck,    label: 'Checkout',     value: 'Secured',   sub: 'End-to-End'  },
                { icon: Gem,            label: 'Benefits',     value: 'Exclusive', sub: 'Direct Perks' },
              ].map((item) => (
                <motion.div
                  key={item.label}
                  variants={fadeUp}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="group rounded-2xl border border-[#e8d2ae] bg-white/70 px-4 py-3.5 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-[0_4px_20px_rgba(212,114,42,0.15)]"
                >
                  <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#a06828]">
                    <item.icon className="h-3 w-3 text-[#D4722A]" />
                    {item.label}
                  </div>
                  <p className="mt-2 text-lg font-bold text-[#2c1a08]">{item.value}</p>
                  <p className="text-[11px] text-[#b89060]">{item.sub}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            variants={fadeLeft}
            initial="hidden"
            animate="visible"
            className="relative flex flex-col border-t border-[#e8d5b7] lg:border-l lg:border-t-0"
          >
            <div className="relative flex-1 overflow-hidden bg-[#fdf5e8]">
              <TiltCard>
                <div className="relative h-full min-h-[300px] w-full">
                  <Image
                    src="/images/hero-room.jpg"
                    alt="Luxury suite interior"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2c1a08]/30 via-transparent to-[#fdf5e8]/10" />
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#fdf5e8]/20" />

                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9, duration: 0.5, type: 'spring' }}
                    className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-[#e0be85]/60 bg-white/80 px-3 py-1.5 shadow-lg backdrop-blur-sm"
                  >
                    <Star className="h-3.5 w-3.5 fill-[#D4722A] text-[#D4722A]" />
                    <span className="text-xs font-bold text-[#2c1a08]">4.9</span>
                    <span className="text-[10px] text-[#a06828]">/ 5.0</span>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.1, duration: 0.6 }}
                    className="absolute bottom-4 left-4 flex gap-2"
                  >
                    <div className="float-image h-14 w-14 overflow-hidden rounded-xl border-2 border-white/80 shadow-lg" style={{ animationDelay: '0s' }}>
                      <Image src="/images/hero-room-thumb-1.jpg" alt="Suite detail" width={56} height={56} className="h-full w-full object-cover" />
                    </div>
                    <div className="float-image h-14 w-14 overflow-hidden rounded-xl border-2 border-white/80 shadow-lg" style={{ animationDelay: '0.4s' }}>
                      <Image src="/images/hero-room-thumb-2.jpg" alt="Room accent" width={56} height={56} className="h-full w-full object-cover" />
                    </div>
                  </motion.div>

                  <div className="absolute right-4 bottom-20 h-10 w-10 spin-slow opacity-25">
                    <svg viewBox="0 0 40 40" fill="none">
                      <circle cx="20" cy="20" r="18" stroke="#D4722A" strokeWidth="0.8" strokeDasharray="4 3" />
                      <circle cx="20" cy="20" r="3" fill="#D4722A" />
                    </svg>
                  </div>
                </div>
              </TiltCard>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3, duration: 0.5 }}
                className="float-image absolute bottom-6 left-1/2 z-20 -translate-x-1/2"
                style={{ animationDelay: '1s', animationDuration: '4s' }}
              >
                <div className="flex items-center gap-2 rounded-full border border-[#e0be85]/70 bg-white/90 px-4 py-2 shadow-[0_4px_20px_rgba(212,114,42,0.2)] backdrop-blur-sm">
                  <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-[#2c1a08]">Suites available tonight</span>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="border-t border-[#e8d5b7] bg-gradient-to-br from-[#fffaf4] to-[#fff4e2] p-6"
            >
              <h2 className="mb-3 text-[9px] font-bold uppercase tracking-[0.22em] text-[#a06828]">
                Guest Privileges
              </h2>
              <div className="space-y-2.5">
                {[
                  { icon: ConciergeBell, text: 'Concierge follow-up after booking'  },
                  { icon: Clock3,        text: 'Priority check-in queue on arrival' },
                ].map((item) => (
                  <motion.div
                    key={item.text}
                    whileHover={{ x: 3 }}
                    className="flex items-center gap-3 rounded-xl border border-[#ead8b8] bg-white/60 px-3.5 py-3 text-sm text-[#5c3d1e] shadow-sm transition-colors hover:bg-white/90"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#e0be85] bg-gradient-to-br from-[#fff3dc] to-[#fde8c0]">
                      <item.icon className="h-3.5 w-3.5 text-[#D4722A]" />
                    </span>
                    {item.text}
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