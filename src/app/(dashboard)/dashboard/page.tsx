'use client'

import { motion } from 'framer-motion'
import {
  TrendingUp, BedDouble, CalendarCheck,
  LogOut, Wrench, Sparkles, DollarSign, Users
} from 'lucide-react'
import StatCard from '@/components/shared/StatCard'
import RevenueChart from '@/components/dashboard/RevenueChart'
import OccupancyChart from '@/components/dashboard/OccupancyChart'
import TodayArrivals from '@/components/dashboard/TodayArrivals'
import RecentBookings from '@/components/dashboard/RecentBookings'
import QuickActions from '@/components/dashboard/QuickActions'
import { PagePurposeAvatar } from '@/components/layout/PagePurposeAvatar'
import { useDashboardStats } from '@/lib/hooks/useDashboard'
import { formatCurrency } from '@/lib/utils/formatters'

export default function DashboardPage() {
  const { stats, loading } = useDashboardStats()

  const statCards = [
    {
      title: 'Total Revenue',
      value: loading ? '...' : formatCurrency(stats?.totalRevenue ?? 0),
      subtitle: 'All checked-out bookings',
      icon: DollarSign,
      iconColor: 'text-azure-600',
      iconBg: 'bg-azure-50',
      trend: stats?.revenueGrowth,
      trendLabel: 'vs last month',
      accent: 'azure' as const,
      delay: 0.1,
    },
    {
      title: 'Total Bookings',
      value: loading ? '...' : String(stats?.totalBookings ?? 0),
      subtitle: 'Across all properties',
      icon: CalendarCheck,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      trend: stats?.bookingGrowth,
      trendLabel: 'vs last month',
      accent: 'emerald' as const,
      delay: 0.15,
    },
    {
      title: 'Occupancy Rate',
      value: loading ? '...' : `${stats?.occupancyRate ?? 0}%`,
      subtitle: `${stats?.occupiedRooms ?? 0} of 180 rooms occupied`,
      icon: BedDouble,
      iconColor: 'text-violet-600',
      iconBg: 'bg-violet-50',
      accent: 'violet' as const,
      delay: 0.2,
    },
    {
      title: 'Available Rooms',
      value: loading ? '...' : String(stats?.availableRooms ?? 0),
      subtitle: 'Ready for check-in',
      icon: TrendingUp,
      iconColor: 'text-gold-600',
      iconBg: 'bg-gold-50',
      accent: 'gold' as const,
      delay: 0.25,
    },
    {
      title: 'Confirmed Bookings',
      value: loading ? '...' : String(stats?.checkinToday ?? 0),
      subtitle: 'Confirmed upcoming',
      icon: Users,
      iconColor: 'text-azure-600',
      iconBg: 'bg-azure-50',
      accent: 'azure' as const,
      delay: 0.3,
    },
    {
      title: 'Checked In',
      value: loading ? '...' : String(stats?.checkoutToday ?? 0),
      subtitle: 'Currently checked in',
      icon: LogOut,
      iconColor: 'text-slate-600',
      iconBg: 'bg-slate-100',
      accent: 'azure' as const,
      delay: 0.35,
    },
    {
      title: 'Housekeeping',
      value: loading ? '...' : String(stats?.pendingHousekeeping ?? 0),
      subtitle: 'Pending tasks',
      icon: Sparkles,
      iconColor: 'text-gold-600',
      iconBg: 'bg-gold-50',
      accent: 'gold' as const,
      delay: 0.4,
    },
    {
      title: 'Maintenance',
      value: loading ? '...' : String(stats?.openMaintenance ?? 0),
      subtitle: 'Open requests',
      icon: Wrench,
      iconColor: 'text-rose-600',
      iconBg: 'bg-rose-50',
      accent: 'rose' as const,
      delay: 0.45,
    },
  ]

  return (
    <div className="space-y-6 pb-8">

      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between gap-4"
      >
        <div className="flex items-start gap-3 min-w-0">
          <PagePurposeAvatar variant="dashboard" size={44} className="mt-0.5 shrink-0" />
          <div className="min-w-0">
          <h1 className="text-2xl font-bold text-slate-900">
            Good {getGreeting()},{' '}
            <span className="text-gradient-azure">Grand Azure</span>
          </h1>
          <p className="text-slate-500 mt-0.5">
            {new Date().toLocaleDateString('en-PK', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200">
          <div className="w-2 h-2 rounded-full bg-azure-500" />
          <span className="text-sm font-medium text-slate-700">Operational overview</span>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>

      {/* Occupancy Chart */}
      <OccupancyChart />

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <TodayArrivals />
        </div>
        <div className="lg:col-span-2">
          <RecentBookings />
        </div>
      </div>

    </div>
  )
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Morning'
  if (hour < 17) return 'Afternoon'
  return 'Evening'
}