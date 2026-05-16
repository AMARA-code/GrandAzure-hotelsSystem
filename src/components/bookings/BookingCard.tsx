'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Crown, BedDouble, Moon,
  Building2, Calendar,
  ChevronRight, Globe, Users
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { vipColors } from '@/lib/constants/colors'
import BookingStatusBadge from './BookingStatusBadge'
import { cn } from '@/lib/utils/cn'
import type { Booking } from '@/lib/hooks/useBookings'

interface BookingCardProps {
  booking: Booking
  index: number
}

const channelColors: Record<string, string> = {
  direct:    'bg-azure-100 text-azure-700',
  ota:       'bg-violet-100 text-violet-700',
  corporate: 'bg-emerald-100 text-emerald-700',
  walk_in:   'bg-gold-100 text-gold-700',
  phone:     'bg-slate-100 text-slate-700',
  agent:     'bg-rose-100 text-rose-700',
}

const hotelAccents: Record<number, { bar: string; badge: string }> = {
  1: { bar: 'from-azure-500 to-azure-700',   badge: 'bg-azure-50 text-azure-700 border-azure-200'   },
  2: { bar: 'from-emerald-500 to-emerald-700', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  3: { bar: 'from-violet-500 to-violet-700',  badge: 'bg-violet-50 text-violet-700 border-violet-200'  },
}

export default function BookingCard({ booking, index }: BookingCardProps) {
  const vip         = vipColors[booking.guest?.vip_status as keyof typeof vipColors] ?? vipColors.none
  const channelColor = channelColors[booking.channel?.channel_type] ?? channelColors.direct
  const hotelId     = booking.hotel?.hotel_id ?? 1
  const accent      = hotelAccents[hotelId] ?? hotelAccents[1]

  const bookingTotal = Number(booking.total_amount ?? 0)
  const rawPaid      = Number(booking.paid_amount ?? 0)
  const paidShown    = bookingTotal > 0 ? Math.min(rawPaid, bookingTotal) : rawPaid
  const balanceDue   = Math.max(0, bookingTotal - paidShown)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl border border-slate-100 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden group"
    >
      <Link href={`/bookings/${booking.booking_id}`}>

        {/* Color top bar per hotel */}
        <div className={`h-1 w-full bg-gradient-to-r ${accent.bar}`} />

        <div className="p-5 space-y-4">

          {/* Top Row — Guest name + Status */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              {/* Guest Name */}
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-slate-900 text-base leading-tight">
                  {booking.guest?.first_name} {booking.guest?.last_name}
                </p>
                {booking.guest?.vip_status !== 'none' && (
                  <span className={cn(
                    'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border',
                    vip.bg, vip.text, vip.border
                  )}>
                    <Crown className="w-2.5 h-2.5" />
                    {booking.guest?.vip_status}
                  </span>
                )}
              </div>
              {/* Confirmation No */}
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                {booking.confirmation_no}
              </p>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <BookingStatusBadge status={booking.booking_status} size="sm" />
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-azure-400 group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>

          {/* Hotel + Room Row */}
          <div className="grid grid-cols-2 gap-2">
            <div className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold',
              accent.badge
            )}>
              <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">
                {booking.hotel?.hotel_name
                  .replace('Grand Azure ', '')
                  .replace('Azure Boutique ', '')}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-100 bg-slate-50 text-xs font-semibold text-slate-600">
              <BedDouble className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">
                {booking.booking_rooms?.[0]?.room?.room_number
                  ? `Rm ${booking.booking_rooms[0].room.room_number}`
                  : 'TBA'
                }
              </span>
            </div>
          </div>

          {/* Dates Row */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <Calendar className="w-4 h-4 text-azure-400 flex-shrink-0" />
            <span className="text-xs font-semibold text-slate-700">
              {formatDate(booking.check_in_date)}
            </span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-xs font-semibold text-slate-700">
              {formatDate(booking.check_out_date)}
            </span>
            <div className="ml-auto flex items-center gap-3">
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Moon className="w-3.5 h-3.5 text-azure-400" />
                {booking.total_nights}n
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                {booking.adults + booking.children}
              </span>
            </div>
          </div>

          {/* Bottom Row — Channel + Amount */}
          <div className="flex items-center justify-between">
            <span className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-semibold',
              channelColor
            )}>
              {booking.channel?.channel_name ?? 'Direct'}
            </span>
            <div className="text-right space-y-0.5">
              {bookingTotal > 0 ? (
                <>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                    Total / Paid
                  </p>
                  <p className="text-base font-bold text-slate-900 leading-tight">
                    {formatCurrency(bookingTotal)}
                    <span className="text-slate-300 font-normal mx-1">·</span>
                    <span className={paidShown < bookingTotal ? 'text-azure-600' : 'text-emerald-600'}>
                      {formatCurrency(paidShown)}
                    </span>
                  </p>
                  {balanceDue > 0 && (
                    <p className="text-[11px] text-amber-700 font-medium">
                      Due {formatCurrency(balanceDue)}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-slate-400 text-sm">No amount set</p>
              )}
              {booking.booking_rooms?.[0]?.rate_per_night > 0 && (
                <p className="text-xs text-slate-400">
                  {formatCurrency(booking.booking_rooms[0].rate_per_night)}/night
                </p>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}