'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  CalendarPlus, BedDouble, Sparkles,
  Wrench, Receipt, Users
} from 'lucide-react'

const actions = [
  {
    label: 'New Booking',
    href: '/bookings/new',
    icon: CalendarPlus,
    gradient: 'gradient-azure',
    shadow: 'shadow-azure',
    text: 'text-white',
  },
  {
    label: 'Room Status',
    href: '/rooms',
    icon: BedDouble,
    gradient: 'bg-emerald-500',
    shadow: '',
    text: 'text-white',
  },
  {
    label: 'Housekeeping',
    href: '/housekeeping',
    icon: Sparkles,
    gradient: 'gradient-gold',
    shadow: 'shadow-gold',
    text: 'text-white',
  },
  {
    label: 'Maintenance',
    href: '/maintenance',
    icon: Wrench,
    gradient: 'bg-rose-500',
    shadow: '',
    text: 'text-white',
  },
  {
    label: 'Finance',
    href: '/finance',
    icon: Receipt,
    gradient: 'bg-violet-500',
    shadow: '',
    text: 'text-white',
  },
  {
    label: 'Guests',
    href: '/guests',
    icon: Users,
    gradient: 'bg-slate-700',
    shadow: '',
    text: 'text-white',
  },
]

export default function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-card p-6"
    >
      <h3 className="font-bold text-slate-900 text-lg mb-4">Quick Actions</h3>
      <div className="grid grid-cols-3 gap-3">
        {actions.map((action, idx) => {
          const Icon = action.icon
          return (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + idx * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href={action.href}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.gradient} ${action.shadow} transition-all duration-200 hover:opacity-90`}
              >
                <Icon className={`w-5 h-5 ${action.text}`} />
                <span className={`text-xs font-semibold ${action.text} text-center leading-tight`}>
                  {action.label}
                </span>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}