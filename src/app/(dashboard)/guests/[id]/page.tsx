'use client'

import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import {
  ArrowLeft, Crown, Mail, Phone,
  MapPin, Calendar, Star, CreditCard,
  BedDouble, TrendingUp, ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { vipColors } from '@/lib/constants/colors'
import { cn } from '@/lib/utils/cn'
import BookingStatusBadge from '@/components/bookings/BookingStatusBadge'

interface GuestProfile {
  guest_id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  date_of_birth: string | null
  gender: string | null
  nationality: string | null
  city: string | null
  country: string | null
  vip_status: string
  marketing_opt_in: boolean
  created_at: string
}

interface GuestBooking {
  booking_id: number
  confirmation_no: string
  check_in_date: string
  check_out_date: string
  total_nights: number
  total_amount: number
  booking_status: string
  hotel_name: string
}

interface LoyaltyInfo {
  card_number: string
  total_points: number
  lifetime_points: number
  tier_name: string
  enrolled_at: string
}

export default function GuestProfilePage() {
  const params = useParams()
  const id = parseInt(params.id as string)
  const [guest, setGuest] = useState<GuestProfile | null>(null)
  const [bookings, setBookings] = useState<GuestBooking[]>([])
  const [loyalty, setLoyalty] = useState<LoyaltyInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGuest = async () => {
      try {
        const supabase = createClient()

        // Fetch guest
        const { data: guestData } = await supabase
          .from('guests')
          .select('*')
          .eq('guest_id', id)
          .single()

        setGuest(guestData)

        // Fetch bookings
        const { data: bookingData } = await supabase
          .from('bookings')
          .select(`
            booking_id,
            confirmation_no,
            check_in_date,
            check_out_date,
            total_nights,
            total_amount,
            booking_status,
            hotels (hotel_name)
          `)
          .eq('guest_id', id)
          .order('booking_id', { ascending: false })

        setBookings((bookingData ?? []).map((b: any) => ({
          booking_id:      b.booking_id,
          confirmation_no: b.confirmation_no,
          check_in_date:   b.check_in_date,
          check_out_date:  b.check_out_date,
          total_nights:    b.total_nights,
          total_amount:    b.total_amount,
          booking_status:  b.booking_status,
          hotel_name:      b.hotels?.hotel_name ?? '',
        })))

        // Fetch loyalty
        const { data: loyaltyData } = await supabase
          .from('loyalty_program')
          .select(`
            card_number,
            total_points,
            lifetime_points,
            enrolled_at,
            loyalty_tiers (tier_name)
          `)
          .eq('guest_id', id)
          .single()

        if (loyaltyData) {
          setLoyalty({
            card_number:     loyaltyData.card_number,
            total_points:    loyaltyData.total_points,
            lifetime_points: loyaltyData.lifetime_points,
            enrolled_at:     loyaltyData.enrolled_at,
            tier_name:       (loyaltyData.loyalty_tiers as any)?.tier_name ?? 'Classic',
          })
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchGuest()
  }, [id])

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="h-12 w-64 bg-slate-100 rounded-xl animate-pulse" />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-1 h-64 bg-white rounded-2xl animate-pulse" />
          <div className="col-span-2 h-64 bg-white rounded-2xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (!guest) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Guest not found</p>
        <Link href="/guests" className="text-azure-600 hover:underline mt-2 block">
          Back to guests
        </Link>
      </div>
    )
  }

  const vip = vipColors[guest.vip_status as keyof typeof vipColors] ?? vipColors.none
  const totalSpend = bookings.reduce((sum, b) => sum + b.total_amount, 0)
  const totalStays = bookings.filter(b => b.booking_status === 'checked_out').length

  return (
    <div className="space-y-6 pb-8 max-w-5xl mx-auto">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Link
          href="/guests"
          className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Guest Profile</h1>
          <p className="text-slate-500 mt-0.5">
            {guest.first_name} {guest.last_name}
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column */}
        <div className="space-y-6">

          {/* Guest Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 text-center"
          >
            <h2 className="text-xl font-bold text-slate-900">
              {guest.first_name} {guest.last_name}
            </h2>

            {/* VIP Badge */}
            {guest.vip_status !== 'none' && (
              <span className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border mt-2',
                vip.bg, vip.text, vip.border
              )}>
                <Crown className="w-3.5 h-3.5" />
                {guest.vip_status.toUpperCase()} Member
              </span>
            )}

            {/* Contact */}
            <div className="mt-5 space-y-2.5 text-left">
              <div className="flex items-center gap-2.5 text-sm text-slate-600">
                <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="truncate">{guest.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-slate-600">
                <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                {guest.phone}
              </div>
              {guest.nationality && (
                <div className="flex items-center gap-2.5 text-sm text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  {guest.city ? `${guest.city}, ` : ''}{guest.nationality}
                </div>
              )}
              {guest.date_of_birth && (
                <div className="flex items-center gap-2.5 text-sm text-slate-600">
                  <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  {formatDate(guest.date_of_birth)}
                </div>
              )}
            </div>
          </motion.div>

          {/* Loyalty Card */}
          {loyalty && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-azure-600 to-violet-600 rounded-2xl p-6 text-white shadow-premium-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-azure-100 text-xs font-semibold uppercase tracking-wider">
                    Loyalty Card
                  </p>
                  <p className="text-white font-bold text-lg mt-0.5">
                    {loyalty.tier_name}
                  </p>
                </div>
                <Star className="w-8 h-8 text-gold-300 fill-gold-300" />
              </div>

              <p className="text-azure-200 text-xs font-mono mb-4">
                {loyalty.card_number}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-azure-200 text-xs">Available</p>
                  <p className="text-white font-bold text-lg">
                    {loyalty.total_points.toLocaleString()}
                  </p>
                  <p className="text-azure-200 text-xs">points</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-azure-200 text-xs">Lifetime</p>
                  <p className="text-white font-bold text-lg">
                    {loyalty.lifetime_points.toLocaleString()}
                  </p>
                  <p className="text-azure-200 text-xs">points</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-card p-6"
          >
            <h3 className="font-bold text-slate-900 mb-4">Guest Stats</h3>
            <div className="space-y-4">
              {[
                {
                  label: 'Total Bookings',
                  value: String(bookings.length),
                  icon: BedDouble,
                  color: 'text-azure-600',
                  bg: 'bg-azure-50',
                },
                {
                  label: 'Completed Stays',
                  value: String(totalStays),
                  icon: Star,
                  color: 'text-gold-600',
                  bg: 'bg-gold-50',
                },
                {
                  label: 'Total Spend',
                  value: formatCurrency(totalSpend),
                  icon: TrendingUp,
                  color: 'text-emerald-600',
                  bg: 'bg-emerald-50',
                },
              ].map(stat => (
                <div key={stat.label} className="flex items-center gap-3">
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', stat.bg)}>
                    <stat.icon className={cn('w-4 h-4', stat.color)} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-400">{stat.label}</p>
                    <p className="font-bold text-slate-800">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column — Bookings */}
        <div className="lg:col-span-2 space-y-6">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">Booking History</h3>
              <p className="text-slate-400 text-sm mt-0.5">
                All reservations by this guest
              </p>
            </div>

            <div className="divide-y divide-slate-50">
              {bookings.length === 0 ? (
                <div className="py-12 text-center">
                  <BedDouble className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-400">No bookings found</p>
                </div>
              ) : (
                bookings.map((booking, idx) => (
                  <motion.div
                    key={booking.booking_id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 * idx }}
                    className="px-6 py-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-slate-800 text-sm">
                            {booking.confirmation_no}
                          </p>
                          <BookingStatusBadge
                            status={booking.booking_status}
                            size="sm"
                            showIcon={false}
                          />
                        </div>
                        <p className="text-xs text-slate-500">
                          {booking.hotel_name
                            .replace('Grand Azure ', '')
                            .replace('Azure Boutique ', '')}
                          {' · '}
                          {formatDate(booking.check_in_date)}
                          {' → '}
                          {formatDate(booking.check_out_date)}
                          {' · '}
                          {booking.total_nights} nights
                        </p>
                      </div>

                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="text-right">
                          <p className="font-bold text-slate-900 text-sm">
                            {formatCurrency(booking.total_amount)}
                          </p>
                        </div>
                        <Link
                          href={`/bookings/${booking.booking_id}`}
                          className="w-8 h-8 rounded-lg bg-azure-50 flex items-center justify-center text-azure-600 hover:bg-azure-100 transition-colors"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}