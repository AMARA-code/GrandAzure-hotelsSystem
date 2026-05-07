'use client'

import { motion } from 'framer-motion'
import {
  AlertTriangle, Clock, CheckCircle2,
  Wrench, TrendingUp, DollarSign
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils/formatters'

interface MaintenanceStatsProps {
  stats: {
    total: number
    open: number
    inProgress: number
    completed: number
    highPriority: number
    totalEstimatedCost: number
    totalActualCost: number
  }
  loading: boolean
}

export default function MaintenanceStats({ stats, loading }: MaintenanceStatsProps) {
  const statCards = [
    {
      label: 'Open Requests',
      value: stats.open,
      sub: `${stats.total} total`,
      icon: AlertTriangle,
      gradient: 'from-rose-500 to-rose-600',
      lightBg: 'bg-rose-50',
      border: 'border-rose-100',
      numColor: 'text-rose-600',
      subColor: 'text-rose-400',
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-600',
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      sub: 'Active now',
      icon: Clock,
      gradient: 'from-amber-500 to-orange-500',
      lightBg: 'bg-amber-50',
      border: 'border-amber-100',
      numColor: 'text-amber-600',
      subColor: 'text-amber-400',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
    {
      label: 'Completed',
      value: stats.completed,
      sub: 'Resolved',
      icon: CheckCircle2,
      gradient: 'from-emerald-500 to-teal-500',
      lightBg: 'bg-emerald-50',
      border: 'border-emerald-100',
      numColor: 'text-emerald-600',
      subColor: 'text-emerald-400',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    {
      label: 'High Priority',
      value: stats.highPriority,
      sub: 'Urgent',
      icon: Wrench,
      gradient: 'from-blue-500 to-violet-500',
      lightBg: 'bg-blue-50',
      border: 'border-blue-100',
      numColor: 'text-blue-600',
      subColor: 'text-blue-400',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
  ]

  return (
    <div className="space-y-2.5 sm:space-y-3 w-full">

      {/* ── 4 Stat Cards — always 2×2, never overflow ─────────────────── */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full">
        {statCards.map((card, i) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.35, ease: 'easeOut' }}
              whileHover={{ y: -2, transition: { duration: 0.15 } }}
              className={`
                relative overflow-hidden rounded-xl sm:rounded-2xl border ${card.border}
                ${card.lightBg} p-3 sm:p-4 w-full
              `}
            >
              {/* Subtle top-right glow blob */}
              <div className={`
                absolute -right-4 -top-4 w-16 h-16 sm:w-20 sm:h-20 rounded-full
                bg-gradient-to-br ${card.gradient} opacity-10 pointer-events-none
              `} />

              <div className="relative z-10 flex flex-col gap-2 sm:gap-3">
                {/* Icon */}
                <div className={`
                  inline-flex items-center justify-center
                  w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl
                  ${card.iconBg} shadow-sm
                `}>
                  <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${card.iconColor}`} />
                </div>

                {/* Number */}
                {loading ? (
                  <div className="h-6 sm:h-8 w-8 sm:w-12 bg-white/70 animate-pulse rounded-lg" />
                ) : (
                  <motion.p
                    className={`text-xl sm:text-3xl font-bold ${card.numColor} font-display leading-none`}
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.06 + 0.1, type: 'spring', stiffness: 200 }}
                  >
                    {card.value}
                  </motion.p>
                )}

                {/* Label + sub */}
                <div>
                  <p className="text-[11px] sm:text-xs font-semibold text-slate-700 leading-tight">
                    {card.label}
                  </p>
                  {loading ? (
                    <div className="h-2.5 w-10 bg-white/70 animate-pulse rounded mt-1" />
                  ) : (
                    <p className={`text-[10px] sm:text-[11px] ${card.subColor} mt-0.5`}>
                      {card.sub}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* ── Cost Summary — always side by side, never stack ───────────── */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full">
        {/* Estimated Cost */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26, duration: 0.35, ease: 'easeOut' }}
          className="flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-slate-200 bg-white shadow-sm p-2.5 sm:p-4 w-full overflow-hidden"
        >
          <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shrink-0">
            <TrendingUp className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="text-[9px] sm:text-xs text-slate-500 font-medium leading-tight truncate">
              Est. Cost
            </p>
            {loading ? (
              <div className="h-4 sm:h-6 w-16 sm:w-24 bg-slate-100 animate-pulse rounded mt-0.5" />
            ) : (
              <p className="text-xs sm:text-base font-bold text-slate-800 font-display truncate">
                {formatCurrency(stats.totalEstimatedCost)}
              </p>
            )}
          </div>
        </motion.div>

        {/* Actual Cost */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.35, ease: 'easeOut' }}
          className="flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-emerald-200 bg-emerald-50 shadow-sm p-2.5 sm:p-4 w-full overflow-hidden"
        >
          <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0">
            <DollarSign className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="text-[9px] sm:text-xs text-slate-500 font-medium leading-tight truncate">
              Actual Cost
            </p>
            {loading ? (
              <div className="h-4 sm:h-6 w-16 sm:w-24 bg-emerald-100 animate-pulse rounded mt-0.5" />
            ) : (
              <p className="text-xs sm:text-base font-bold text-emerald-700 font-display truncate">
                {formatCurrency(stats.totalActualCost)}
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}