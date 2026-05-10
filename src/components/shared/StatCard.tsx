'use client'

import { motion } from 'framer-motion'
import type { ComponentType } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface StatCardProps {
  title: string
  value: string
  subtitle?: string
  icon: ComponentType<{ className?: string }>
  iconColor: string
  iconBg: string
  trend?: number
  trendLabel?: string
  delay?: number
  accent?: 'azure' | 'gold' | 'emerald' | 'rose' | 'violet'
}

const accentStyles = {
  azure:   { bar: 'gradient-azure',  glow: 'shadow-azure' },
  gold:    { bar: 'gradient-gold',   glow: 'shadow-gold'  },
  emerald: { bar: 'bg-emerald-500',  glow: ''             },
  rose:    { bar: 'bg-rose-500',     glow: ''             },
  violet:  { bar: 'bg-violet-500',   glow: ''             },
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  iconBg,
  trend,
  trendLabel,
  delay = 0,
  accent = 'azure',
}: StatCardProps) {
  const style = accentStyles[accent]
  const isPositive = (trend ?? 0) >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="relative bg-card rounded-2xl p-6 border border-border shadow-card hover:shadow-premium-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group premium-hover"
    >
      {/* Top accent bar */}
      <div className={cn('absolute top-0 left-0 right-0 h-1 rounded-t-2xl', style.bar)} />

      {/* Background decoration */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-muted group-hover:bg-muted/80 transition-colors duration-300" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', iconBg)}>
            <Icon className={cn('w-6 h-6', iconColor)} />
          </div>

          {trend !== undefined && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: delay + 0.2 }}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold',
                isPositive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              )}
            >
              {isPositive
                ? <TrendingUp className="w-3 h-3" />
                : <TrendingDown className="w-3 h-3" />
              }
              {Math.abs(trend)}%
            </motion.div>
          )}
        </div>

        {/* Value */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.1 }}
          className="text-2xl font-bold text-foreground mb-1"
        >
          {value}
        </motion.p>

        {/* Title */}
        <p className="text-sm font-medium text-muted-foreground">{title}</p>

        {/* Subtitle / trend label */}
        {(subtitle || trendLabel) && (
          <p className="text-xs text-muted-foreground/80 mt-1">
            {subtitle || trendLabel}
          </p>
        )}
      </div>
    </motion.div>
  )
}