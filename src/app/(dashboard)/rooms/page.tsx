'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createBrowserClient } from '@supabase/ssr'
import {
  BedDouble, Search, LayoutGrid, List,
  RefreshCw, Building2, CheckCircle2,
  Users, Percent, Sparkles, Wrench, Lock
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'
import { RoomsGrid } from '@/components/rooms/RoomsGrid'
import { RoomDetailModal } from '@/components/rooms/RoomDetailModal'

const STATUS_FILTERS = [
  { value: 'all',       label: 'All Rooms'  },
  { value: 'available', label: 'Available'  },
  { value: 'occupied',  label: 'Occupied'   },
  { value: 'dirty',     label: 'Dirty'      },
]

export default function RoomsPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [rooms,         setRooms]         = useState<any[]>([])
  const [hotels,        setHotels]        = useState<any[]>([])
  const [loading,       setLoading]       = useState(true)
  const [view,          setView]          = useState<'grid' | 'list'>('grid')
  const [search,        setSearch]        = useState('')
  const [statusFilter,  setStatus]        = useState('all')
  const [hotelFilter,   setHotel]         = useState('all')
  const [selectedRoom,  setSelected]      = useState<any | null>(null)
  const [modalOpen,     setModalOpen]     = useState(false)
  const [stats,         setStats]         = useState({
    total: 0, available: 0, occupied: 0,
    cleaning: 0, maintenance: 0, occupancyRate: 0
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [roomsRes, hotelsRes] = await Promise.all([
        supabase
          .from('rooms')
          .select(`
            room_id,
            hotel_id,
            room_type_id,
            room_number,
            floor_number,
            status,
            is_connecting,
            notes,
            last_inspected,
            room_types!room_type_id (
              room_type_id,
              type_name,
              type_category,
              base_price,
              max_occupancy,
              area_sqft,
              bed_type,
              bed_count,
              view_type
            ),
            hotels!hotel_id (
              hotel_id,
              hotel_name,
              city,
              star_rating
            )
          `)
          .eq('is_deleted', false)
          .order('hotel_id')
          .order('floor_number')
          .order('room_number'),
        supabase
          .from('hotels')
          .select('hotel_id, hotel_name, city')
          .eq('is_deleted', false)
          .order('hotel_name'),
      ])

      if (roomsRes.error) throw roomsRes.error
      if (hotelsRes.error) throw hotelsRes.error

      const r = roomsRes.data || []
      setRooms(r)
      setHotels(hotelsRes.data || [])

     const total     = r.length
const available = r.filter(x => x.status === 'available').length
const occupied  = r.filter(x => x.status === 'occupied').length
const dirty     = r.filter(x => x.status === 'dirty').length
setStats({
  total, available, occupied,
  cleaning: dirty, maintenance: 0,
  occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0
})
    } catch (err: any) {
      toast.error('Failed to load rooms: ' + err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = rooms.filter(r => {
    const matchHotel  = hotelFilter === 'all' || String(r.hotel_id) === hotelFilter
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    const q           = search.toLowerCase()
    const matchSearch = !q
      || r.room_number?.toLowerCase().includes(q)
      || (r.room_types as any)?.type_name?.toLowerCase().includes(q)
      || (r.hotels as any)?.hotel_name?.toLowerCase().includes(q)
    return matchHotel && matchStatus && matchSearch
  })

  const openRoom = (room: any) => { setSelected(room); setModalOpen(true) }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-azure-50/30">
      <div className="px-6 pt-6 pb-4">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="w-10 h-10 rounded-xl gradient-azure flex items-center justify-center shadow-azure">
            <BedDouble className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display text-slate-900">Room Management</h1>
            <p className="text-sm text-slate-500">Real-time room status across all properties</p>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {[
           { label: 'Total Rooms',    value: stats.total,              icon: BedDouble,    color: 'azure'   },
{ label: 'Available',      value: stats.available,          icon: CheckCircle2, color: 'emerald' },
{ label: 'Occupied',       value: stats.occupied,           icon: Users,        color: 'blue'    },
{ label: 'Dirty',          value: stats.cleaning,           icon: Sparkles,     color: 'amber'   },
{ label: 'Occupancy Rate', value: `${stats.occupancyRate}%`,icon: Percent,      color: 'violet'  },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-white rounded-2xl p-4 shadow-card border border-slate-100 flex items-center gap-3"
            >
              <div className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                s.color === 'azure'   && 'bg-azure-100',
                s.color === 'emerald' && 'bg-emerald-100',
                s.color === 'blue'    && 'bg-blue-100',
                s.color === 'amber'   && 'bg-amber-100',
                s.color === 'rose'    && 'bg-rose-100',
                s.color === 'violet'  && 'bg-violet-100',
              )}>
                <s.icon className={cn(
                  'w-4 h-4',
                  s.color === 'azure'   && 'text-azure-600',
                  s.color === 'emerald' && 'text-emerald-600',
                  s.color === 'blue'    && 'text-blue-600',
                  s.color === 'amber'   && 'text-amber-600',
                  s.color === 'rose'    && 'text-rose-600',
                  s.color === 'violet'  && 'text-violet-600',
                )} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500 truncate">{s.label}</p>
                <p className="text-lg font-bold text-slate-900 leading-tight">{s.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search rooms, types…"
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-azure-500/30 focus:border-azure-400 shadow-sm"
            />
          </div>

          <select
            value={hotelFilter}
            onChange={e => setHotel(e.target.value)}
            className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none shadow-sm text-slate-700"
          >
            <option value="all">All Hotels</option>
            {hotels.map((h: any) => (
              <option key={h.hotel_id} value={String(h.hotel_id)}>{h.hotel_name}</option>
            ))}
          </select>

          <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {(['grid', 'list'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  'px-3 py-2.5 transition-colors',
                  view === v ? 'bg-azure-500 text-white' : 'text-slate-500 hover:bg-slate-50'
                )}
              >
                {v === 'grid' ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
              </button>
            ))}
          </div>

          <button
            onClick={fetchData}
            className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={cn('w-4 h-4 text-slate-500', loading && 'animate-spin')} />
          </button>
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map(f => {
            const count = f.value === 'all'
              ? rooms.length
              : rooms.filter(r => r.status === f.value).length
            return (
              <button
                key={f.value}
                onClick={() => setStatus(f.value)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5',
                  statusFilter === f.value
                    ? 'gradient-azure text-white border-transparent shadow-azure'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-azure-300 hover:text-azure-600'
                )}
              >
                {f.label}
                <span className={cn(
                  'px-1.5 py-0.5 rounded-full text-xs font-bold',
                  statusFilter === f.value ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                )}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Rooms Content */}
      <div className="px-6 pb-8">
        <RoomsGrid
          rooms={filtered}
          loading={loading}
          view={view}
          onSelectRoom={openRoom}
        />
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {modalOpen && selectedRoom && (
          <RoomDetailModal
            room={selectedRoom}
            onClose={() => { setModalOpen(false); setSelected(null) }}
            onRefresh={fetchData}
          />
        )}
      </AnimatePresence>
    </div>
  )
}