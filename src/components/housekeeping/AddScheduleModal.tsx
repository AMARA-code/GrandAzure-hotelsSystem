'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createBrowserClient } from '@supabase/ssr'
import {
  X, Sparkles, BedDouble, User, Calendar,
  Clock, FileText, Building2, Save
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'
import { format } from 'date-fns'

interface Props {
  hotels:    any[]
  onClose:   () => void
  onSuccess: () => void
}

const TASK_TYPES = [
  { value: 'daily_clean',    label: 'Daily Clean',    icon: '🧹', desc: 'Regular daily room cleaning'     },
  { value: 'checkout_clean', label: 'Checkout Clean', icon: '🛏️', desc: 'Deep clean after guest checkout' },
  { value: 'deep_clean',     label: 'Deep Clean',     icon: '✨', desc: 'Thorough deep cleaning session'  },
  { value: 'inspection',     label: 'Inspection',     icon: '🔍', desc: 'Quality inspection of the room'  },
  { value: 'turndown',       label: 'Turndown',       icon: '🌙', desc: 'Evening turndown service'        },
]

const SHIFTS = [
  { value: 'morning',   label: 'Morning',   time: '6:00 AM – 2:00 PM'  },
  { value: 'afternoon', label: 'Afternoon', time: '2:00 PM – 10:00 PM' },
  { value: 'flexible',  label: 'Flexible',  time: 'Any time of day'    },
  { value: 'night',     label: 'Night',     time: '10:00 PM – 6:00 AM' },
]

const PRIORITIES = [
  { value: 'normal',    label: 'Normal',    icon: '🔵', color: 'text-azure-700 bg-azure-50 border-azure-200'  },
  { value: 'high',      label: 'High',      icon: '🟡', color: 'text-amber-700 bg-amber-50 border-amber-200'  },
  { value: 'emergency', label: 'Emergency', icon: '🔴', color: 'text-rose-700 bg-rose-50 border-rose-200'     },
  { value: 'low',       label: 'Low',       icon: '⚪', color: 'text-slate-600 bg-slate-100 border-slate-200' },
]

export function AddScheduleModal({ hotels, onClose, onSuccess }: Props) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [rooms,        setRooms]        = useState<any[]>([])
  const [staff,        setStaff]        = useState<any[]>([])
  const [saving,       setSaving]       = useState(false)
  const [loadingRooms, setLoadingRooms] = useState(false)

  const [form, setForm] = useState({
    hotel_id:          '',
    room_id:           '',
    assigned_to:       '',
    scheduled_date:    format(new Date(), 'yyyy-MM-dd'),
    shift:             'morning',
    task_type:         'daily_clean',
    priority:          'normal',
    estimated_minutes: '30',
    notes:             '',
  })

  const set = (key: string, val: string) =>
    setForm(prev => ({ ...prev, [key]: val }))

  useEffect(() => {
    if (!form.hotel_id) { setRooms([]); setStaff([]); return }
    const load = async () => {
      setLoadingRooms(true)
      const [roomsRes, staffRes] = await Promise.all([
        supabase
          .from('rooms')
          .select('room_id, room_number, floor_number, status')
          .eq('hotel_id', form.hotel_id)
          .eq('is_deleted', false)
          .order('floor_number')
          .order('room_number'),
        supabase
          .from('staff')
          .select('staff_id, first_name, last_name')
          .eq('hotel_id', form.hotel_id)
          .eq('is_active', true)
          .eq('is_deleted', false)
          .order('first_name'),
      ])
      setRooms(roomsRes.data || [])
      setStaff(staffRes.data || [])
      set('room_id', '')
      set('assigned_to', '')
      setLoadingRooms(false)
    }
    load()
  }, [form.hotel_id])

  const handleSubmit = async () => {
    if (!form.hotel_id || !form.room_id || !form.assigned_to || !form.scheduled_date) {
      toast.error('Please fill in all required fields')
      return
    }
    setSaving(true)
    try {
      const { error } = await supabase
        .from('housekeeping_schedules')
        .insert({
          hotel_id:          Number(form.hotel_id),
          room_id:           Number(form.room_id),
          assigned_to:       Number(form.assigned_to),
          scheduled_date:    form.scheduled_date,
          shift:             form.shift,
          task_type:         form.task_type,
          priority:          form.priority,
          estimated_minutes: Number(form.estimated_minutes) || null,
          notes:             form.notes || null,
          status:            'scheduled',
        })
      if (error) throw error
      toast.success('Schedule added successfully!')
      onSuccess()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const selectedTask  = TASK_TYPES.find(t => t.value === form.task_type)
  const selectedHotel = hotels.find((h: any) => String(h.hotel_id) === form.hotel_id)
  const selectedRoom  = rooms.find(r => String(r.room_id) === form.room_id)
  const selectedStaff = staff.find((s: any) => String(s.staff_id) === form.assigned_to)
  const isFormValid   = !!(form.hotel_id && form.room_id && form.assigned_to && form.scheduled_date)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{    opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm"
      // ✅ FIX: explicit React.MouseEvent type — resolves TS7006
      onClick={(e: React.MouseEvent<HTMLDivElement>) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 24 }}
        animate={{ opacity: 1, scale: 1,    y:  0 }}
        exit={{    opacity: 0, scale: 0.95, y: 24 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        className="bg-white rounded-3xl shadow-premium-xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col"
      >
        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 sm:px-6 py-4 sm:py-5 relative overflow-hidden shrink-0">
          <div
            className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 90% 10%, white 0%, transparent 50%)' }}
          />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 flex items-center justify-center text-lg sm:text-xl shrink-0">
                {selectedTask?.icon ?? '🧹'}
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-white font-display leading-tight">
                  Add Housekeeping Schedule
                </h2>
                <p className="text-emerald-100 text-xs sm:text-sm truncate">
                  Assign a cleaning task to a staff member
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors shrink-0 ml-2"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">

          {/* Hotel + Date — stack on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                Hotel <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={form.hotel_id}
                  onChange={e => set('hotel_id', e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 appearance-none"
                >
                  <option value="">Select hotel…</option>
                  {hotels.map((h: any) => (
                    <option key={h.hotel_id} value={String(h.hotel_id)}>{h.hotel_name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                Scheduled Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={form.scheduled_date}
                  onChange={e => set('scheduled_date', e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
                />
              </div>
            </div>
          </div>

          {/* Room + Staff — stack on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                Room <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <BedDouble className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={form.room_id}
                  onChange={e => set('room_id', e.target.value)}
                  disabled={!form.hotel_id || loadingRooms}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 disabled:opacity-50 appearance-none"
                >
                  <option value="">{loadingRooms ? 'Loading…' : 'Select room…'}</option>
                  {rooms.map(r => (
                    <option key={r.room_id} value={String(r.room_id)}>
                      Room {r.room_number} — Floor {r.floor_number} ({r.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                Assign To <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={form.assigned_to}
                  onChange={e => set('assigned_to', e.target.value)}
                  disabled={!form.hotel_id || loadingRooms}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 disabled:opacity-50 appearance-none"
                >
                  <option value="">{loadingRooms ? 'Loading…' : 'Select staff…'}</option>
                  {staff.map((s: any) => (
                    <option key={s.staff_id} value={String(s.staff_id)}>
                      {s.first_name} {s.last_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Task Type — 2 cols on mobile, 3 on sm+ */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
              Task Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TASK_TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => set('task_type', t.value)}
                  className={cn(
                    'flex items-start gap-2 sm:gap-2.5 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl border text-left transition-all',
                    form.task_type === t.value
                      ? 'border-emerald-400 bg-emerald-50 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  )}
                >
                  <span className="text-base sm:text-lg leading-none mt-0.5 shrink-0">{t.icon}</span>
                  <div className="min-w-0">
                    <p className={cn(
                      'text-xs font-semibold',
                      form.task_type === t.value ? 'text-emerald-700' : 'text-slate-700'
                    )}>
                      {t.label}
                    </p>
                    <p className="text-xs text-slate-400 leading-tight mt-0.5 hidden sm:block">{t.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Shift — 2 cols on mobile, 4 on sm+ */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
              Shift
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SHIFTS.map(s => (
                <button
                  key={s.value}
                  onClick={() => set('shift', s.value)}
                  className={cn(
                    'flex flex-col items-center px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl border text-center transition-all',
                    form.shift === s.value
                      ? 'border-emerald-400 bg-emerald-50 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  )}
                >
                  <p className={cn(
                    'text-xs font-semibold',
                    form.shift === s.value ? 'text-emerald-700' : 'text-slate-700'
                  )}>
                    {s.label}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-tight">{s.time}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Priority + Est. Time — stack on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
                Priority
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PRIORITIES.map(p => (
                  <button
                    key={p.value}
                    onClick={() => set('priority', p.value)}
                    className={cn(
                      'flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-xl border text-xs font-semibold transition-all',
                      form.priority === p.value
                        ? p.color + ' ring-2 ring-offset-1 ring-current'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                    )}
                  >
                    <span>{p.icon}</span>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                Est. Duration (minutes)
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  min="5"
                  max="480"
                  value={form.estimated_minutes}
                  onChange={e => set('estimated_minutes', e.target.value)}
                  placeholder="30"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
                />
              </div>
              <div className="flex gap-2 mt-2">
                {[15, 30, 45, 60].map(m => (
                  <button
                    key={m}
                    onClick={() => set('estimated_minutes', String(m))}
                    className={cn(
                      'flex-1 py-1 rounded-lg text-xs font-medium border transition-all',
                      form.estimated_minutes === String(m)
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300'
                    )}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
              Notes (optional)
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <textarea
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                placeholder="Special instructions, items to restock, guest preferences…"
                rows={3}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 placeholder:text-slate-300"
              />
            </div>
          </div>

          {/* Summary */}
          {isFormValid && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-emerald-50 to-emerald-50/50 border border-emerald-200 rounded-2xl p-3 sm:p-4"
            >
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Schedule Summary
              </p>
              {/* Stack to 1 col on mobile, 2 cols on sm+ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-slate-600">
                <span>📅 {format(new Date(form.scheduled_date), 'dd MMM yyyy')}</span>
                <span>🏨 {selectedHotel?.hotel_name ?? '—'}</span>
                <span>🛏️ Room {selectedRoom?.room_number ?? '—'}</span>
                <span>👤 {selectedStaff ? `${selectedStaff.first_name} ${selectedStaff.last_name}` : '—'}</span>
                <span>{selectedTask?.icon} {selectedTask?.label}</span>
                <span>⏱️ ~{form.estimated_minutes} minutes</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* ── Footer ── */}
        {/* On mobile: stacks vertically (column-reverse so Cancel is below), on sm+: single row */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 bg-slate-50/50 shrink-0">
          <p className="text-xs text-slate-400 text-center sm:text-left">
            <span className="text-rose-500">*</span> Required fields
          </p>
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={saving || !isFormValid}
              className={cn(
                'flex-1 sm:flex-none px-3 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 transition-all',
                !saving && isFormValid
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200 hover:shadow-emerald-300'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              )}
            >
              <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {saving ? 'Saving…' : 'Create Schedule'}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}