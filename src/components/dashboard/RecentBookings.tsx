'use client'

import { motion } from 'framer-motion'
import { Clock, Crown, ArrowRight, Building2 } from 'lucide-react'
import Link from 'next/link'
import { useRecentBookings } from '@/lib/hooks/useDashboard'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { vipColors, bookingStatusColors } from '@/lib/constants/colors'
import { cn } from '@/lib/utils/cn'

export default function RecentBookings() {
  const { data, loading } = useRecentBookings()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-azure-50 flex items-center justify-center">
            <Clock className="w-4 h-4 text-azure-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Recent Checkouts</h3>
            <p className="text-slate-400 text-xs">Completed stays</p>
          </div>
        </div>
        <Link
          href="/bookings"
          className="flex items-center gap-1 text-xs text-azure-600 font-semibold hover:text-azure-700 transition-colors"
        >
          View all
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* List */}
      <div className="divide-y divide-slate-50">
        {loading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          data.map((booking, idx) => {
            const vip    = vipColors[booking.vip_status as keyof typeof vipColors] ?? vipColors.none
            const status = bookingStatusColors[booking.booking_status as keyof typeof bookingStatusColors] ?? bookingStatusColors.checked_out

            return (
              <motion.div
                key={booking.booking_id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.05 * idx }}
                className="px-5 py-3 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between gap-3">

                  {/* Left — Guest */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-slate-800 text-sm truncate">
                        {booking.guest_name}
                      </p>
                      {booking.vip_status !== 'none' && (
                        <span className={cn(
                          'flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-semibold border flex-shrink-0',
                          vip.bg, vip.text, vip.border
                        )}>
                          <Crown className="w-2 h-2" />
                          {booking.vip_status}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {booking.hotel_name
                          .replace('Grand Azure ', '')
                          .replace('Azure Boutique ', '')}
                      </span>
                      <span>·</span>
                      <span>{booking.channel_name}</span>
                    </div>
                  </div>

                  {/* Right — Date + Amount */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-slate-900">
                      {formatCurrency(booking.total_amount)}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatDate(booking.check_out_date)} · {booking.total_nights}n
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </motion.div>
  )
}