'use client'

import { motion } from 'framer-motion'
import { Clock, Users, MapPin, TrendingUp, ShoppingBag } from 'lucide-react'
import type { RestaurantWithStats } from '@/types/restaurant'

function formatPKR(v: number) {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency', currency: 'PKR', maximumFractionDigits: 0
  }).format(v)
}

function formatTime(t: string | null) {
  if (!t) return '—'
  const [h, m] = t.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const h12 = hour % 12 || 12
  return `${h12}:${m} ${ampm}`
}

// Pastel palette — mirrors HomeLanding PASTEL_CARDS exactly
const PASTEL_CARDS = [
  { bg: '#FFF4ED', border: '#F5C9A8', accent: '#D4722A', tag: '#FDE8D4', iconBg: '#FDE8D4' }, // terracotta
  { bg: '#EFF6FF', border: '#BFDBFE', accent: '#2563EB', tag: '#DBEAFE', iconBg: '#DBEAFE' }, // blue
  { bg: '#F0FDF4', border: '#BBF7D0', accent: '#16A34A', tag: '#DCFCE7', iconBg: '#DCFCE7' }, // green
  { bg: '#FDF4FF', border: '#E9D5FF', accent: '#9333EA', tag: '#F3E8FF', iconBg: '#F3E8FF' }, // purple
  { bg: '#FFF7ED', border: '#FED7AA', accent: '#EA580C', tag: '#FFEDD5', iconBg: '#FFEDD5' }, // orange
  { bg: '#F0F9FF', border: '#BAE6FD', accent: '#0284C7', tag: '#E0F2FE', iconBg: '#E0F2FE' }, // sky
]

const cuisineEmoji: Record<string, string> = {
  International: '🌍',
  Pakistani:     '🍛',
  Continental:   '🥩',
  Chinese:       '🥢',
  Italian:       '🍝',
  Arabic:        '🧆',
  default:       '🍽️',
}

export default function RestaurantCards({ restaurants }: { restaurants: RestaurantWithStats[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
      {restaurants.map((r, i) => {
        const p = PASTEL_CARDS[i % PASTEL_CARDS.length]
        const emoji = cuisineEmoji[r.cuisine_type ?? ''] ?? cuisineEmoji.default

        return (
          <motion.div
            key={r.restaurant_id}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.09, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -6, boxShadow: `0 20px 48px ${p.accent}22`, transition: { duration: 0.25 } }}
            style={{
              background: p.bg,
              border: `1.5px solid ${p.border}`,
              borderRadius: 18,
              overflow: 'hidden',
              cursor: 'default',
            }}
          >
            {/* ── Card Header — pastel, light, warm ── */}
            <div style={{
              padding: '20px 20px 16px',
              background: p.bg,
              borderBottom: `1px solid ${p.border}`,
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Decorative blob */}
              <div style={{
                position: 'absolute', top: -20, right: -20,
                width: 80, height: 80, borderRadius: '50%',
                background: p.border, opacity: 0.4,
                pointerEvents: 'none',
              }} />

              <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ flex: 1, minWidth: 0, marginRight: 10 }}>
                  {/* Cuisine tag pill */}
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    background: p.tag, border: `1px solid ${p.border}`,
                    borderRadius: 999, padding: '2px 10px', marginBottom: 8,
                    fontSize: '0.6rem', fontWeight: 700,
                    color: p.accent, letterSpacing: '0.1em', textTransform: 'uppercase',
                  }}>
                    {r.cuisine_type ?? 'Restaurant'}
                  </div>

                  {/* Emoji */}
                  <motion.div
                    style={{ fontSize: 28, lineHeight: 1, marginBottom: 6 }}
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {emoji}
                  </motion.div>

                  {/* Name */}
                  <h3 style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '1.05rem', fontWeight: 600,
                    color: '#1C1917', lineHeight: 1.2, margin: 0,
                  }}>
                    {r.restaurant_name}
                  </h3>

                  {/* Location */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 5 }}>
                    <MapPin style={{ width: 11, height: 11, color: p.accent, flexShrink: 0 }} />
                    <span style={{ fontSize: '0.72rem', color: '#78716C' }} className="truncate">
                      {r.hotel_name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status badge */}
              <div style={{ marginTop: 12 }}>
                {r.is_active ? (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: '#F0FDF4', border: '1px solid #BBF7D0',
                    borderRadius: 999, padding: '3px 10px',
                  }}>
                    <motion.div
                      style={{ width: 6, height: 6, borderRadius: '50%', background: '#16A34A', flexShrink: 0 }}
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#15803D' }}>Open Now</span>
                  </div>
                ) : (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: '#FFF1F2', border: '1px solid #FECDD3',
                    borderRadius: 999, padding: '3px 10px',
                  }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#F43F5E', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#E11D48' }}>Closed</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Card Body ── */}
            <div style={{ padding: '16px 20px 20px' }}>
              {/* Hours & Capacity */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                    background: p.iconBg, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Clock style={{ width: 13, height: 13, color: p.accent }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: '#A8A29E' }}>Hours</div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#1C1917' }} className="truncate">
                      {formatTime(r.open_time)}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                    background: p.iconBg, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Users style={{ width: 13, height: 13, color: p.accent }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: '#A8A29E' }}>Capacity</div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#1C1917' }}>
                      {r.capacity ?? '—'} seats
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: p.border, marginBottom: 14 }} />

              {/* Orders & Revenue */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{
                  background: p.tag, border: `1px solid ${p.border}`,
                  borderRadius: 12, padding: '10px 12px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                    <ShoppingBag style={{ width: 11, height: 11, color: p.accent }} />
                    <span style={{ fontSize: '0.62rem', color: p.accent, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Orders</span>
                  </div>
                  <div style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '1.3rem', fontWeight: 600, color: p.accent,
                  }}>
                    {r.order_count}
                  </div>
                </div>
                <div style={{
                  background: '#F0FDF4', border: '1px solid #BBF7D0',
                  borderRadius: 12, padding: '10px 12px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                    <TrendingUp style={{ width: 11, height: 11, color: '#16A34A' }} />
                    <span style={{ fontSize: '0.62rem', color: '#16A34A', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Revenue</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#15803D', lineHeight: 1.2 }}>
                    {formatPKR(r.revenue)}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}