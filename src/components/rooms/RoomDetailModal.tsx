'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { createBrowserClient } from '@supabase/ssr'
import {
  X, BedDouble, Building2, Layers, Users,
  Sparkles, Wrench, CheckCircle2, Lock,
  Save, Eye, Maximize2, Wind
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'
import { formatCurrency } from '@/lib/utils/formatters'

interface Props {
  room:      any
  onClose:   () => void
  onRefresh: () => void
}

const STATUSES = [
  { value: 'available', label: 'Available', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { value: 'dirty',     label: 'Dirty',     icon: Sparkles,     color: 'text-amber-600 bg-amber-50 border-amber-200'       },
  { value: 'occupied',  label: 'Occupied',  icon: Users,        color: 'text-azure-600 bg-azure-50 border-azure-200'       },
]

export function RoomDetailModal({ room, onClose, onRefresh }: Props) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [status,  setStatus]  = useState(room.status)
  const [notes,   setNotes]   = useState(room.notes ?? '')
  const [saving,  setSaving]  = useState(false)
  const [editing, setEditing] = useState(false)

  const rt    = room.room_types as any
  const hotel = room.hotels    as any

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('rooms')
        .update({ status, notes })
        .eq('room_id', room.room_id)
      if (error) throw error
      toast.success(`Room ${room.room_number} updated`)
      onRefresh()
      setEditing(false)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{    opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1,    y:  0 }}
        exit={{    opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="bg-white rounded-3xl shadow-premium-xl w-full max-w-lg overflow-hidden"
      >
        {/* Gradient header */}
        <div className="gradient-azure p-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 0%, transparent 60%)' }}
          />
          <div className="relative flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BedDouble className="w-5 h-5 text-white/80" />
                <span className="text-white/70 text-sm font-medium">Room</span>
              </div>
              <h2 className="text-3xl font-bold text-white font-display">{room.room_number}</h2>
              <p className="text-white/80 text-sm mt-0.5">{rt?.type_name ?? 'Standard Room'}</p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="flex gap-4 mt-4">
            {[
              { icon: Building2, label: hotel?.hotel_name ?? '—'          },
              { icon: Layers,    label: `Floor ${room.floor_number ?? 1}` },
              { icon: Users,     label: `${rt?.max_occupancy ?? 2} guests`},
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-1.5 text-white/80 text-xs">
                <s.icon className="w-3.5 h-3.5" />
                {s.label}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Status selector */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
              Room Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {STATUSES.map(s => {
                const Ic = s.icon
                return (
                  <button
                    key={s.value}
                    onClick={() => { setStatus(s.value); setEditing(true) }}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all',
                      status === s.value
                        ? s.color + ' ring-2 ring-offset-1 ring-current'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                    )}
                  >
                    <Ic className="w-4 h-4" />
                    {s.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Category',  value: rt?.type_category ?? '—'                              },
              { label: 'Base Rate', value: formatCurrency(rt?.base_price ?? 0)                   },
              { label: 'Area',      value: rt?.area_sqft ? `${rt.area_sqft} sqft` : '—'          },
              { label: 'Bed Type',  value: String(rt?.bed_type ?? '—').replace('_', ' ')         },
              { label: 'Bed Count', value: rt?.bed_count ? `${rt.bed_count} bed(s)` : '—'        },
              { label: 'View',      value: String(rt?.view_type ?? '—').replace('_', ' ')        },
            ].map(d => (
              <div key={d.label} className="bg-slate-50 rounded-xl px-3 py-2.5">
                <p className="text-xs text-slate-400 mb-0.5">{d.label}</p>
                <p className="text-sm font-semibold text-slate-800 capitalize">{d.value}</p>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
              Internal Notes
            </label>
            <textarea
              value={notes}
              onChange={e => { setNotes(e.target.value); setEditing(true) }}
              placeholder="Add notes for housekeeping or maintenance…"
              rows={3}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-azure-500/30 focus:border-azure-400 placeholder:text-slate-300"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!editing || saving}
            className={cn(
              'px-5 py-2.5 text-sm font-semibold rounded-xl flex items-center gap-2 transition-all',
              editing && !saving
                ? 'gradient-azure text-white shadow-azure'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            )}
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}