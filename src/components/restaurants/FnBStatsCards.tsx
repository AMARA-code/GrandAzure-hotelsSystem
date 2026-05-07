'use client'

import { motion } from 'framer-motion'
import { ShoppingBag, TrendingUp, Users, UtensilsCrossed } from 'lucide-react'
import type { FnBStats } from '@/types/restaurant'

function formatPKR(v: number) {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency', currency: 'PKR', maximumFractionDigits: 0
  }).format(v)
}

export default function FnBStatsCards({ stats }: { stats: FnBStats }) {
  const cards = [
    {
      label: 'Total Orders',
      value: stats.total_orders.toString(),
      sub: `${stats.served_orders} served`,
      sub2: `${stats.pending_orders} pending`,
      icon: ShoppingBag,
      iconBg: 'bg-azure-100',
      iconColor: 'text-azure-600',
      valueColor: 'text-azure-700',
      accent: 'from-azure-500 to-azure-600',
      bar: 'bg-azure-500',
      glow: 'hover:shadow-azure',
      pct: stats.total_orders > 0 ? Math.round((stats.served_orders / stats.total_orders) * 100) : 0,
    },
    {
      label: 'Total F&B Revenue',
      value: formatPKR(stats.total_revenue),
      sub: `Avg ${formatPKR(stats.avg_order_value)}`,
      sub2: 'per order',
      icon: TrendingUp,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      valueColor: 'text-emerald-700',
      accent: 'from-emerald-500 to-emerald-600',
      bar: 'bg-emerald-500',
      glow: 'hover:shadow-[0_8px_30px_rgba(16,185,129,0.25)]',
      pct: 100,
    },
    {
      label: 'Unique Guests',
      value: stats.unique_guests.toString(),
      sub: 'Guests who',
      sub2: 'ordered F&B',
      icon: Users,
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-600',
      valueColor: 'text-violet-700',
      accent: 'from-violet-500 to-violet-600',
      bar: 'bg-violet-500',
      glow: 'hover:shadow-[0_8px_30px_rgba(139,92,246,0.25)]',
      pct: 75,
    },
    {
      label: 'Dine-in vs Room Svc',
      value: `${stats.dine_in_orders} / ${stats.room_service_orders}`,
      sub: `${stats.dine_in_orders} dine-in`,
      sub2: `${stats.room_service_orders} room service`,
      icon: UtensilsCrossed,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      valueColor: 'text-amber-700',
      accent: 'from-amber-400 to-orange-500',
      bar: 'bg-amber-500',
      glow: 'hover:shadow-gold',
      pct: stats.dine_in_orders + stats.room_service_orders > 0
        ? Math.round((stats.dine_in_orders / (stats.dine_in_orders + stats.room_service_orders)) * 100)
        : 0,
    },
  ]

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-5">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className={`relative bg-white rounded-2xl p-4 lg:p-6 border border-slate-100 shadow-premium ${card.glow} transition-all duration-300 overflow-hidden cursor-default group`}
        >
          {/* Top gradient bar */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.accent} rounded-t-2xl`} />

          {/* Background circle decoration */}
          <motion.div
            className={`absolute -bottom-8 -right-8 w-28 h-28 rounded-full bg-gradient-to-br ${card.accent} opacity-[0.07]`}
            whileHover={{ scale: 1.4, opacity: 0.12 }}
            transition={{ duration: 0.4 }}
          />

          {/* Icon */}
          <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl ${card.iconBg} flex items-center justify-center mb-3 lg:mb-4`}>
            <card.icon className={`w-5 h-5 lg:w-6 lg:h-6 ${card.iconColor}`} />
          </div>

          {/* Value */}
          <div className={`text-xl lg:text-3xl font-bold ${card.valueColor} font-display mb-1 leading-tight`}>
            {card.value}
          </div>

          {/* Label */}
          <div className="text-xs lg:text-sm font-semibold text-slate-700 mb-1">{card.label}</div>

          {/* Sub */}
          <div className="text-xs text-slate-400 hidden sm:block">
            {card.sub} · {card.sub2}
          </div>

          {/* Progress bar */}
          <div className="mt-3 lg:mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${card.pct}%` }}
              transition={{ delay: i * 0.08 + 0.4, duration: 0.8, ease: 'easeOut' }}
              className={`h-full ${card.bar} rounded-full`}
            />
          </div>
        </motion.div>
      ))}
    </div>
  )
}