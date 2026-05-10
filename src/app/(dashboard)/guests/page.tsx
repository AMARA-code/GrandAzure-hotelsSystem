'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Search, Crown, ArrowRight, MapPin } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { vipColors } from '@/lib/constants/colors'
import { cn } from '@/lib/utils/cn'
import { PagePurposeAvatar } from '@/components/layout/PagePurposeAvatar'

interface Guest {
  guest_id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  nationality: string | null
  city: string | null
  vip_status: string
  country: string | null
}

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchGuests = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('guests')
        .select('guest_id, first_name, last_name, email, phone, nationality, city, country, vip_status')
        .order('guest_id')
      setGuests(data ?? [])
      setLoading(false)
    }
    fetchGuests()
  }, [])

  const filtered = guests.filter(g => {
    const s = search.toLowerCase()
    return (
      g.first_name.toLowerCase().includes(s) ||
      g.last_name.toLowerCase().includes(s) ||
      g.email.toLowerCase().includes(s) ||
      g.phone.includes(s)
    )
  })

  return (
    <div className="space-y-6 pb-8">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4"
      >
        <div className="flex items-start gap-3 min-w-0">
          <PagePurposeAvatar variant="guests" size={44} className="shrink-0 mt-0.5" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Guests</h1>
            <p className="text-slate-500 mt-0.5">
              All registered guests across properties
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-azure-50 border border-azure-100">
          <Users className="w-4 h-4 text-azure-600" />
          <span className="text-sm font-semibold text-azure-700">
            {guests.length} guests
          </span>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, email or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-azure-500 focus:border-transparent shadow-sm transition-all"
        />
      </motion.div>

      {/* VIP Filter Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex items-center gap-2 flex-wrap"
      >
        {['all', 'diamond', 'platinum', 'gold', 'silver', 'none'].map(tier => (
          <button
            key={tier}
            className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all capitalize"
          >
            {tier === 'all' ? 'All Tiers' : tier}
          </button>
        ))}
      </motion.div>

      {/* Guest Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-40 bg-white rounded-2xl border border-slate-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((guest, idx) => {
            const vip = vipColors[guest.vip_status as keyof typeof vipColors] ?? vipColors.none
            return (
              <motion.div
                key={guest.guest_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                whileHover={{ y: -2 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-card hover:shadow-card-hover transition-all duration-200 p-5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-bold text-slate-900">
                      {guest.first_name} {guest.last_name}
                    </p>
                    {guest.vip_status !== 'none' && (
                      <span className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border mt-0.5',
                        vip.bg, vip.text, vip.border
                      )}>
                        <Crown className="w-2.5 h-2.5" />
                        {guest.vip_status}
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/guests/${guest.guest_id}`}
                    className="w-8 h-8 rounded-lg bg-azure-50 flex items-center justify-center text-azure-600 hover:bg-azure-100 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs text-slate-500 truncate">{guest.email}</p>
                  <p className="text-xs text-slate-500">{guest.phone}</p>
                  {(guest.city || guest.nationality) && (
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <MapPin className="w-3 h-3" />
                      {guest.city ? `${guest.city}, ` : ''}{guest.nationality}
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}