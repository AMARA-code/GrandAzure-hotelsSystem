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

const cuisineConfig: Record<string, {
  bg: string; text: string; border: string;
  headerClass: string; emoji: string
}> = {
  International: {
    bg: 'bg-azure-50', text: 'text-azure-700', border: 'border-azure-200',
    headerClass: 'bg-gradient-to-br from-azure-800 to-azure-600',
    emoji: '🌍'
  },
  Pakistani: {
    bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200',
    headerClass: 'bg-gradient-to-br from-amber-900 to-amber-700',
    emoji: '🍛'
  },
  Continental: {
    bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200',
    headerClass: 'bg-gradient-to-br from-slate-800 to-emerald-800',
    emoji: '🥩'
  },
  default: {
    bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200',
    headerClass: 'bg-gradient-to-br from-slate-800 to-slate-600',
    emoji: '🍽️'
  },
}

export default function RestaurantCards({ restaurants }: { restaurants: RestaurantWithStats[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
      {restaurants.map((r, i) => {
        const cfg = cuisineConfig[r.cuisine_type ?? ''] ?? cuisineConfig.default

        return (
          <motion.div
            key={r.restaurant_id}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.09, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -6, transition: { duration: 0.25 } }}
            className="bg-white rounded-2xl border border-slate-100 shadow-premium hover:shadow-premium-lg transition-all duration-300 overflow-hidden group cursor-default"
          >
            {/* Card Header — always dark gradient */}
            <div className={`${cfg.headerClass} px-5 py-5 relative overflow-hidden`}>
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/5" />

              <div className="relative flex items-start justify-between">
                <div className="flex-1 min-w-0 mr-3">
                  <motion.div
                    className="text-3xl mb-2"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {cfg.emoji}
                  </motion.div>
                  <h3 className="text-white font-bold font-display text-base lg:text-lg leading-tight">
                    {r.restaurant_name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <MapPin className="w-3 h-3 text-white/60 flex-shrink-0" />
                    <span className="text-xs text-white/70 truncate">{r.hotel_name}</span>
                  </div>
                </div>
                <div className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                  {r.cuisine_type}
                </div>
              </div>

              {/* Status */}
              <div className="relative mt-3">
                {r.is_active ? (
                  <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-2.5 py-1">
                    <motion.div
                      className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />
                    <span className="text-xs font-medium text-emerald-300">Open Now</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 bg-rose-500/20 border border-rose-400/30 rounded-full px-2.5 py-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    <span className="text-xs font-medium text-rose-300">Closed</span>
                  </div>
                )}
              </div>
            </div>

            {/* Card Body */}
            <div className="p-5">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-azure-50 flex items-center justify-center flex-shrink-0 group-hover:bg-azure-100 transition-colors">
                    <Clock className="w-3.5 h-3.5 text-azure-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-slate-400">Hours</div>
                    <div className="text-xs font-semibold text-slate-700 truncate">
                      {formatTime(r.open_time)}–{formatTime(r.close_time)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-100 transition-colors">
                    <Users className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Capacity</div>
                    <div className="text-xs font-semibold text-slate-700">{r.capacity ?? '—'} seats</div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 mb-4" />

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-xl p-3 group-hover:bg-azure-50/50 transition-colors">
                  <div className="flex items-center gap-1.5 mb-1">
                    <ShoppingBag className="w-3 h-3 text-slate-400" />
                    <span className="text-xs text-slate-400">Orders</span>
                  </div>
                  <div className="text-xl font-bold text-slate-800">{r.order_count}</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 group-hover:bg-emerald-50/50 transition-colors">
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingUp className="w-3 h-3 text-slate-400" />
                    <span className="text-xs text-slate-400">Revenue</span>
                  </div>
                  <div className="text-sm font-bold text-emerald-600 leading-tight">{formatPKR(r.revenue)}</div>
                </div>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}