'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { MapPin, ArrowRight, Star } from 'lucide-react'
import { useRef } from 'react'

type HotelType = {
  hotel_id: number
  hotel_name: string
  city: string
  state_province: string
  star_rating: number
  total_rooms: number
}

// City-specific pastel palettes
const CITY_PALETTE: Record<string, { bg: string; border: string; accent: string; tag: string; label: string; image: string }> = {
  karachi: {
    bg: '#FFF4ED', border: '#F5C9A8', accent: '#C2511A', tag: '#FDE8D4',
    label: 'Coastal Luxury', image: '/images/hotels/karachi-hero.jpg',
  },
  lahore: {
    bg: '#FDF4FF', border: '#E9D5FF', accent: '#7C3AED', tag: '#F3E8FF',
    label: 'Cultural Heritage', image: '/images/hotels/lahore-hero.jpg',
  },
  islamabad: {
    bg: '#EFF6FF', border: '#BFDBFE', accent: '#1D4ED8', tag: '#DBEAFE',
    label: 'Capital Prestige', image: '/images/hotels/islamabad-hero.jpg',
  },
}

function getCityPalette(city: string) {
  const c = city.toLowerCase()
  for (const [key, val] of Object.entries(CITY_PALETTE)) {
    if (c.includes(key)) return val
  }
  return CITY_PALETTE.karachi
}

function StarRow({ count }: { count: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} style={{ width: 11, height: 11, fill: '#D4722A', color: '#D4722A' }} />
      ))}
    </div>
  )
}

function HotelCard({ hotel, index }: { hotel: HotelType; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const pal = getCityPalette(hotel.city)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), { stiffness: 260, damping: 26 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), { stiffness: 260, damping: 26 })
  const glowX = useTransform(x, [-0.5, 0.5], ['-10%', '110%'])

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    x.set((e.clientX - r.left) / r.width - 0.5)
    y.set((e.clientY - r.top) / r.height - 0.5)
  }
  function onLeave() { x.set(0); y.set(0) }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 900 }}
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.12, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/hotels/${hotel.hotel_id}`} style={{ display: 'block', textDecoration: 'none' }}>
        <motion.div
          whileHover={{ boxShadow: `0 24px 56px ${pal.accent}28` }}
          style={{ background: pal.bg, border: `1.5px solid ${pal.border}`, borderRadius: 20, overflow: 'hidden', transition: 'border-color 0.3s', cursor: 'pointer', position: 'relative' }}
        >
          {/* Image */}
          <div style={{ position: 'relative', height: 250, overflow: 'hidden' }}>
            <Image
              src={pal.image}
              alt={hotel.hotel_name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              style={{ objectFit: 'cover', transition: 'transform 0.75s ease' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.transform = 'scale(1.07)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = 'scale(1)')}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.28) 0%, transparent 55%)' }} />

            {/* Shimmer */}
            <motion.div style={{ position: 'absolute', top: 0, bottom: 0, width: '35%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)', left: glowX, pointerEvents: 'none' }} />

            {/* Top labels */}
            <div style={{ position: 'absolute', top: 14, left: 14, right: 14, display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ background: pal.tag, border: `1px solid ${pal.border}`, borderRadius: 999, padding: '4px 12px', fontSize: '0.62rem', fontWeight: 700, color: pal.accent, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {pal.label}
              </div>
              <div style={{ background: 'rgba(255,255,255,0.88)', borderRadius: 999, padding: '4px 10px', fontSize: '0.65rem', fontWeight: 600, color: '#44403C' }}>
                {hotel.total_rooms} rooms
              </div>
            </div>

            {/* Stars bottom-left */}
            <div style={{ position: 'absolute', bottom: 14, left: 14 }}>
              <StarRow count={hotel.star_rating} />
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: '1.3rem 1.5rem 1.5rem' }}>
            <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.35rem', fontWeight: 600, color: '#1C1917', marginBottom: 7, lineHeight: 1.25 }}>
              {hotel.hotel_name}
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: '1.1rem' }}>
              <MapPin style={{ width: 13, height: 13, color: pal.accent, flexShrink: 0 }} />
              <span style={{ fontSize: '0.78rem', color: '#78716C' }}>
                {hotel.city}, {hotel.state_province}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${pal.border}`, paddingTop: '0.9rem' }}>
              <span style={{ fontSize: '0.68rem', letterSpacing: '0.08em', color: pal.accent, fontWeight: 600, textTransform: 'uppercase' }}>
                {hotel.star_rating}-Star Property
              </span>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: pal.tag, border: `1px solid ${pal.border}`, borderRadius: 8, padding: '5px 12px', fontSize: '0.75rem', fontWeight: 700, color: pal.accent }}>
                View Hotel <ArrowRight style={{ width: 12, height: 12 }} />
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  )
}

export default function HomeHotelCards({ hotels }: { hotels: HotelType[] }) {
  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');`}</style>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {hotels.map((hotel, index) => (
          <HotelCard key={hotel.hotel_id} hotel={hotel} index={index} />
        ))}
      </div>
    </>
  )
}
