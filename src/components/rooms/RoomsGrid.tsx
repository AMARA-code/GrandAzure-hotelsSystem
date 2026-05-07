'use client'

import { motion } from 'framer-motion'
import {
  BedDouble, Wifi, Wind, Tv2, Bath, Coffee,
  Users, ArrowUpRight, Building2, Layers,
  CheckCircle2, Wrench, Sparkles, Lock, Star
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { formatCurrency } from '@/lib/utils/formatters'

interface Props {
  rooms:        any[]
  loading:      boolean
  view:         'grid' | 'list'
  onSelectRoom: (room: any) => void
}

const STATUS_CONFIG: Record<string, {
  label: string; bg: string; text: string; border: string; dot: string
}> = {
  available: { label: 'Available', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  occupied:  { label: 'Occupied',  bg: 'bg-azure-50',   text: 'text-azure-700',   border: 'border-azure-200',   dot: 'bg-azure-500'   },
  dirty:     { label: 'Dirty',     bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-500'   },
}

const FLOOR_COLORS = [
  'from-azure-500 to-azure-600',
  'from-violet-500 to-violet-600',
  'from-emerald-500 to-emerald-600',
  'from-amber-500 to-amber-600',
  'from-rose-500 to-rose-600',
  'from-cyan-500 to-cyan-600',
]

function RoomCard({ room, onClick }: { room: any; onClick: () => void }) {
  const cfg        = STATUS_CONFIG[room.status] ?? STATUS_CONFIG.available
  const rt         = room.room_types as any
  const hotel      = room.hotels    as any
  const price      = rt?.base_price     ?? 0
  const floor      = room.floor_number  ?? 1
  const floorColor = FLOOR_COLORS[(floor - 1) % FLOOR_COLORS.length]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{    opacity: 0, scale: 0.96 }}
      whileHover={{ y: -3, boxShadow: '0 12px 32px rgba(14,142,230,0.12)' }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="bg-white rounded-2xl border border-slate-100 shadow-card cursor-pointer overflow-hidden group"
    >
      <div className={cn('h-1.5 bg-gradient-to-r', floorColor)} />
      <div className="p-4">
        {/* Room number + status */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-slate-900 font-display">
                {room.room_number}
              </span>
              {rt?.type_category === 'suite' && (
                <Star className="w-3.5 h-3.5 text-gold-500 fill-gold-400" />
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
              {rt?.type_name ?? 'Standard Room'}
            </p>
          </div>
          <div className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
            cfg.bg, cfg.text, cfg.border
          )}>
            <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
            {cfg.label}
          </div>
        </div>

        {/* Hotel + floor + occupancy */}
        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
          <span className="flex items-center gap-1">
            <Building2 className="w-3 h-3" />
            {hotel?.city ?? '—'}
          </span>
          <span className="flex items-center gap-1">
            <Layers className="w-3 h-3" />
            Floor {floor}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {rt?.max_occupancy ?? 2}
          </span>
        </div>

        {/* Bed type + view */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {rt?.bed_type && (
            <span className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-full text-xs text-slate-500 capitalize">
              {String(rt.bed_type).replace('_', ' ')}
            </span>
          )}
          {rt?.view_type && (
            <span className="px-2 py-0.5 bg-azure-50 border border-azure-100 rounded-full text-xs text-azure-600 capitalize">
              {String(rt.view_type).replace('_', ' ')}
            </span>
          )}
          {rt?.area_sqft && (
            <span className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-full text-xs text-slate-500">
              {rt.area_sqft} sqft
            </span>
          )}
        </div>

        {/* Price + arrow */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
          <div>
            <p className="text-xs text-slate-400">Base rate / night</p>
            <p className="text-sm font-bold text-slate-900">{formatCurrency(price)}</p>
          </div>
          <div className="w-7 h-7 rounded-xl bg-azure-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight className="w-3.5 h-3.5 text-azure-600" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function RoomRow({ room, onClick }: { room: any; onClick: () => void }) {
  const cfg   = STATUS_CONFIG[room.status] ?? STATUS_CONFIG.available
  const rt    = room.room_types as any
  const hotel = room.hotels    as any
  const price = rt?.base_price ?? 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{    opacity: 0, x: -10 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="bg-white border border-slate-100 rounded-xl px-5 py-3.5 flex items-center gap-4 cursor-pointer hover:shadow-card-hover hover:border-azure-200 transition-all group"
    >
      <div className="w-10 h-10 rounded-xl gradient-azure flex items-center justify-center shrink-0">
        <BedDouble className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div>
          <p className="font-bold text-slate-900">{room.room_number}</p>
          <p className="text-xs text-slate-500 truncate">{rt?.type_name ?? '—'}</p>
        </div>
        <div className="hidden sm:block">
          <p className="text-xs text-slate-400">Hotel</p>
          <p className="text-sm text-slate-700">{hotel?.hotel_name ?? '—'}</p>
        </div>
        <div className="hidden sm:block">
          <p className="text-xs text-slate-400">Floor · Guests</p>
          <p className="text-sm text-slate-700">
            Floor {room.floor_number ?? '—'} · {rt?.max_occupancy ?? 2} guests
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Rate / night</p>
          <p className="text-sm font-semibold text-slate-900">{formatCurrency(price)}</p>
        </div>
      </div>
      <div className={cn(
        'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shrink-0',
        cfg.bg, cfg.text, cfg.border
      )}>
        <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
        {cfg.label}
      </div>
      <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-azure-500 transition-colors shrink-0" />
    </motion.div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden animate-pulse">
      <div className="h-1.5 bg-slate-200" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <div className="space-y-1.5">
            <div className="h-5 w-16 bg-slate-200 rounded" />
            <div className="h-3 w-24 bg-slate-100 rounded" />
          </div>
          <div className="h-6 w-20 bg-slate-100 rounded-full" />
        </div>
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => <div key={i} className="h-3 w-16 bg-slate-100 rounded" />)}
        </div>
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => <div key={i} className="h-5 w-16 bg-slate-100 rounded-full" />)}
        </div>
        <div className="flex justify-between pt-3 border-t border-slate-50">
          <div className="space-y-1">
            <div className="h-2 w-12 bg-slate-100 rounded" />
            <div className="h-4 w-20 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function RoomsGrid({ rooms, loading, view, onSelectRoom }: Props) {
  if (loading) {
    return (
      <div className={cn(
        'mt-4',
        view === 'grid'
          ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
          : 'flex flex-col gap-2'
      )}>
        {[...Array(12)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  if (!rooms.length) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <BedDouble className="w-7 h-7 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700 mb-1">No rooms found</h3>
        <p className="text-sm text-slate-400">Try adjusting your filters</p>
      </motion.div>
    )
  }

  // Group by hotel name for grid view
  const byHotel: Record<string, any[]> = {}
  rooms.forEach(r => {
    const name = (r.hotels as any)?.hotel_name ?? 'Unknown Hotel'
    if (!byHotel[name]) byHotel[name] = []
    byHotel[name].push(r)
  })

  if (view === 'list') {
    return (
      <div className="flex flex-col gap-2 mt-4">
        {rooms.map(r => (
          <RoomRow key={r.room_id} room={r} onClick={() => onSelectRoom(r)} />
        ))}
      </div>
    )
  }

  return (
    <div className="mt-4 space-y-8">
      {Object.entries(byHotel).map(([hotelName, hotelRooms]) => (
        <div key={hotelName}>
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-4 h-4 text-azure-600" />
            <h2 className="text-sm font-semibold text-slate-700">{hotelName}</h2>
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {hotelRooms.length} rooms
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {hotelRooms.map(r => (
              <RoomCard key={r.room_id} room={r} onClick={() => onSelectRoom(r)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}