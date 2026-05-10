'use client'

import { motion } from 'framer-motion'
import {
  BedDouble, ArrowUpRight, Building2, Layers,
  Users
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

/**
 * 10 premium pastel radial-mesh gradients.
 * Each is a unique two-stop blend with a directional highlight so every card
 * feels hand-crafted rather than templated.
 */
const PASTEL_GRADIENTS = [
  'bg-[radial-gradient(ellipse_at_top_left,_#fce7f3_0%,_#fdf2f8_60%,_#fff1f2_100%)]',   // rose-blush
  'bg-[radial-gradient(ellipse_at_top_right,_#e0f2fe_0%,_#f0f9ff_60%,_#ecfeff_100%)]',  // sky-frost
  'bg-[radial-gradient(ellipse_at_bottom_left,_#ede9fe_0%,_#f5f3ff_60%,_#faf5ff_100%)]',// lavender-mist
  'bg-[radial-gradient(ellipse_at_top_left,_#d1fae5_0%,_#ecfdf5_60%,_#f0fdf4_100%)]',   // sage-dew
  'bg-[radial-gradient(ellipse_at_bottom_right,_#ffedd5_0%,_#fff7ed_60%,_#fef9c3_100%)]',// peach-cream
  'bg-[radial-gradient(ellipse_at_top,_#f3e8ff_0%,_#fdf4ff_60%,_#fce7f3_100%)]',        // lilac-cloud
  'bg-[radial-gradient(ellipse_at_bottom_left,_#ccfbf1_0%,_#f0fdfa_60%,_#ecfeff_100%)]',// mint-haze
  'bg-[radial-gradient(ellipse_at_top_right,_#fef3c7_0%,_#fffbeb_60%,_#fef9c3_100%)]',  // sand-glow
  'bg-[radial-gradient(ellipse_at_center,_#fce7f3_0%,_#ede9fe_50%,_#e0f2fe_100%)]',     // blush-sky
  'bg-[radial-gradient(ellipse_at_bottom,_#d1fae5_0%,_#ede9fe_60%,_#f5f3ff_100%)]',     // sage-lavender
]

/** 5 decorative SVG patterns that tile inside the card banner */
function CardPattern({ index }: { index: number }) {
  const p = [
    // concentric arcs — feels architectural
    <svg key="arcs" viewBox="0 0 120 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {[24, 40, 56, 72, 88, 104].map((r, i) => (
        <circle key={i} cx="0" cy="56" r={r}
          stroke="currentColor" strokeWidth="1" strokeOpacity={0.18 - i * 0.025} fill="none" />
      ))}
    </svg>,
    // fine diagonal hatch — linen texture
    <svg key="hatch" viewBox="0 0 120 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {Array.from({ length: 22 }, (_, i) => (
        <line key={i} x1={i * 8 - 20} y1="0" x2={i * 8 - 76} y2="56"
          stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.14" />
      ))}
    </svg>,
    // dot grid — refined and airy
    <svg key="dots" viewBox="0 0 120 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {Array.from({ length: 7 }, (_, row) =>
        Array.from({ length: 15 }, (_, col) => (
          <circle key={`${row}-${col}`} cx={col * 9 + 5} cy={row * 9 + 5} r="1.2"
            fill="currentColor" fillOpacity="0.18" />
        ))
      )}
    </svg>,
    // flowing waves — spa / boutique vibe
    <svg key="waves" viewBox="0 0 120 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {[0, 12, 24, 36, 48].map((offset, i) => (
        <path key={i}
          d={`M-10 ${30 + offset} Q20 ${18 + offset} 50 ${30 + offset} T110 ${30 + offset} T170 ${30 + offset}`}
          stroke="currentColor" strokeWidth="1.2" strokeOpacity={0.15 - i * 0.02} fill="none" />
      ))}
    </svg>,
    // hexagon lattice — luxury / geometric
    <svg key="hex" viewBox="0 0 120 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {[[18,14],[46,14],[74,14],[102,14],[32,38],[60,38],[88,38],[116,38]].map(([cx, cy], i) => (
        <polygon key={i}
          points={`${cx},${cy-11} ${cx+9.5},${cy-5.5} ${cx+9.5},${cy+5.5} ${cx},${cy+11} ${cx-9.5},${cy+5.5} ${cx-9.5},${cy-5.5}`}
          stroke="currentColor" strokeWidth="0.9" strokeOpacity="0.16" fill="none" />
      ))}
    </svg>,
  ]
  return p[index % p.length]
}

/** Stable hash of a string → integer */
function strHash(s: string, max: number): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h % max
}

/** Premium pastel banner shown at the top of each grid card */
function CardBanner({ typeName, roomNumber }: { typeName: string; roomNumber: string }) {
  const gi = strHash(typeName,   PASTEL_GRADIENTS.length)
  const pi = strHash(roomNumber, 5)

  return (
    <div className={cn('relative h-[54px] overflow-hidden', PASTEL_GRADIENTS[gi])}>
      <div className="absolute inset-0 text-slate-500/50">
        <CardPattern index={pi} />
      </div>
      {/* Bottom fade so content below bleeds in naturally */}
      <div className="absolute bottom-0 inset-x-0 h-5 bg-gradient-to-t from-white/70 to-transparent" />
    </div>
  )
}

/** Small pastel swatch used in list-view rows */
function RowSwatch({ typeName, roomNumber }: { typeName: string; roomNumber: string }) {
  const gi = strHash(typeName,   PASTEL_GRADIENTS.length)
  const pi = strHash(roomNumber, 5)

  return (
    <div className={cn(
      'w-10 h-10 rounded-xl overflow-hidden shrink-0 relative border border-white shadow-sm',
      PASTEL_GRADIENTS[gi]
    )}>
      <div className="absolute inset-0 text-slate-400/50 scale-[2.4] origin-bottom-left">
        <CardPattern index={pi} />
      </div>
    </div>
  )
}

/* ─────────────────────────── RoomCard ─────────────────────────── */

function RoomCard({ room, onClick }: { room: any; onClick: () => void }) {
  const cfg      = STATUS_CONFIG[room.status] ?? STATUS_CONFIG.available
  const rt       = room.room_types as any
  const hotel    = room.hotels    as any
  const price    = rt?.base_price    ?? 0
  const floor    = room.floor_number ?? 1
  const typeName = rt?.type_name     ?? 'Standard Room'

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
      <CardBanner typeName={typeName} roomNumber={room.room_number} />

      <div className="p-4">
        {/* Room number + status */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="text-xl font-bold text-slate-900 font-display leading-none">
              {room.room_number}
            </span>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{typeName}</p>
          </div>
          <div className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
            cfg.bg, cfg.text, cfg.border
          )}>
            <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
            {cfg.label}
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
          <span className="flex items-center gap-1">
            <Building2 className="w-3 h-3" />{hotel?.city ?? '—'}
          </span>
          <span className="flex items-center gap-1">
            <Layers className="w-3 h-3" />Floor {floor}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />{rt?.max_occupancy ?? 2}
          </span>
        </div>

        {/* Tags */}
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

        {/* Price */}
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

/* ─────────────────────────── RoomRow ─────────────────────────── */

function RoomRow({ room, onClick }: { room: any; onClick: () => void }) {
  const cfg      = STATUS_CONFIG[room.status] ?? STATUS_CONFIG.available
  const rt       = room.room_types as any
  const hotel    = room.hotels    as any
  const price    = rt?.base_price ?? 0
  const typeName = rt?.type_name  ?? 'Standard Room'

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
      <RowSwatch typeName={typeName} roomNumber={room.room_number} />

      <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div>
          <p className="font-bold text-slate-900">{room.room_number}</p>
          <p className="text-xs text-slate-500 truncate">{typeName}</p>
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

/* ────────────────────────── Skeleton ──────────────────────────── */

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden animate-pulse">
      <div className="h-[54px] bg-gradient-to-br from-slate-100 to-slate-50" />
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

/* ─────────────────────────── Export ───────────────────────────── */

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