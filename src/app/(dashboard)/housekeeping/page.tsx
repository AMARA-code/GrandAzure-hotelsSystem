'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createBrowserClient } from '@supabase/ssr'
import {
  Sparkles, Search, RefreshCw, Building2,
  Clock, CheckCircle2, User, Calendar,
  Layers, Play, Check, X, ClipboardList,
  Timer, AlertTriangle, Plus, TrendingUp, Zap
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'
import { formatDateTime } from '@/lib/utils/formatters'
import { format } from 'date-fns'
import { AddScheduleModal } from '@/components/housekeeping/AddScheduleModal'
import { PagePurposeAvatar } from '@/components/layout/PagePurposeAvatar'

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  low:       { label: 'Low',       color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' },
  normal:    { label: 'Normal',    color: 'text-azure-700', bg: 'bg-azure-50',  border: 'border-azure-200' },
  high:      { label: 'High',      color: 'text-amber-700', bg: 'bg-amber-50',  border: 'border-amber-200' },
  emergency: { label: 'Emergency', color: 'text-rose-700',  bg: 'bg-rose-50',   border: 'border-rose-200'  },
}

const TASK_CONFIG: Record<string, { label: string; icon: string }> = {
  daily_clean:    { label: 'Daily Clean',    icon: '🧹' },
  checkout_clean: { label: 'Checkout Clean', icon: '🛏️' },
  deep_clean:     { label: 'Deep Clean',     icon: '✨' },
  inspection:     { label: 'Inspection',     icon: '🔍' },
  turndown:       { label: 'Turndown',       icon: '🌙' },
}

const SHIFT_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  morning:   { label: 'Morning',   color: 'text-amber-700',  bg: 'bg-amber-50'  },
  afternoon: { label: 'Afternoon', color: 'text-azure-700',  bg: 'bg-azure-50'  },
  flexible:  { label: 'Flexible',  color: 'text-violet-700', bg: 'bg-violet-50' },
  night:     { label: 'Night',     color: 'text-slate-600',  bg: 'bg-slate-100' },
}

const SCHED_STATUS_CONFIG: Record<string, {
  label: string; color: string; bg: string; border: string
}> = {
  scheduled:   { label: 'Scheduled',   color: 'text-slate-600',   bg: 'bg-slate-50',   border: 'border-slate-200'   },
  in_progress: { label: 'In Progress', color: 'text-azure-700',   bg: 'bg-azure-50',   border: 'border-azure-200'   },
  completed:   { label: 'Completed',   color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  skipped:     { label: 'Skipped',     color: 'text-slate-500',   bg: 'bg-slate-100',  border: 'border-slate-200'   },
  reassigned:  { label: 'Reassigned',  color: 'text-violet-700',  bg: 'bg-violet-50',  border: 'border-violet-200'  },
}

export default function HousekeepingPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [schedules,    setSchedules]    = useState<any[]>([])
  const [logs,         setLogs]         = useState<any[]>([])
  const [hotels,       setHotels]       = useState<any[]>([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [hotelFilter,  setHotelFilter]  = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [activeTab,    setActiveTab]    = useState<'schedules' | 'logs'>('schedules')
  const [updatingId,   setUpdatingId]   = useState<string | null>(null)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [stats, setStats] = useState({
    total: 0, scheduled: 0, inProgress: 0, completed: 0, emergency: 0
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [schedRes, logsRes, hotelRes] = await Promise.all([
        supabase
          .from('housekeeping_schedules')
          .select(`
            schedule_id,
            hotel_id,
            room_id,
            assigned_to,
            scheduled_date,
            shift,
            task_type,
            priority,
            status,
            estimated_minutes,
            notes,
            rooms!housekeeping_schedules_room_id_fkey (
              room_number,
              floor_number,
              hotels!rooms_hotel_id_fkey ( hotel_name, city )
            ),
            staff!housekeeping_schedules_assigned_to_fkey (
              first_name,
              last_name
            )
          `)
          .order('scheduled_date', { ascending: false })
          .order('priority', { ascending: false }),

        supabase
          .from('housekeeping_logs')
          .select(`
            log_id,
            schedule_id,
            staff_id,
            room_id,
            started_at,
            completed_at,
            actual_minutes,
            cleanliness_score,
            damage_reported,
            notes,
            created_at,
            rooms!housekeeping_logs_room_id_fkey (
              room_number,
              hotels!rooms_hotel_id_fkey ( hotel_name )
            ),
            staff!housekeeping_logs_staff_id_fkey (
              first_name,
              last_name
            )
          `)
          .order('created_at', { ascending: false })
          .limit(50),

        supabase
          .from('hotels')
          .select('hotel_id, hotel_name, city')
          .eq('is_deleted', false)
          .order('hotel_name'),
      ])

      if (schedRes.error) throw schedRes.error
      if (logsRes.error)  throw logsRes.error

      const s = schedRes.data || []
      setSchedules(s)
      setLogs(logsRes.data || [])
      setHotels(hotelRes.data || [])

      setStats({
        total:      s.length,
        scheduled:  s.filter(x => x.status === 'scheduled').length,
        inProgress: s.filter(x => x.status === 'in_progress').length,
        completed:  s.filter(x => x.status === 'completed').length,
        emergency:  s.filter(x => x.priority === 'emergency').length,
      })
    } catch (err: any) {
      toast.error('Failed to load: ' + err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const updateStatus = async (id: number, newStatus: string) => {
    setUpdatingId(String(id))
    try {
      const { error } = await supabase
        .from('housekeeping_schedules')
        .update({ status: newStatus })
        .eq('schedule_id', id)
      if (error) throw error
      toast.success('Status updated successfully')
      fetchData()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredSchedules = schedules.filter(s => {
    const room  = s.rooms  as any
    const staff = s.staff  as any
    const matchHotel  = hotelFilter  === 'all' || String(s.hotel_id) === hotelFilter
    const matchStatus = statusFilter === 'all' || s.status === statusFilter
    const q = search.toLowerCase()
    const matchSearch = !q
      || room?.room_number?.toLowerCase().includes(q)
      || staff?.first_name?.toLowerCase().includes(q)
      || staff?.last_name?.toLowerCase().includes(q)
      || s.task_type?.toLowerCase().includes(q)
    return matchHotel && matchStatus && matchSearch
  })

  // Group by date
  const groupedSchedules: Record<string, any[]> = {}
  filteredSchedules.forEach(s => {
    const key = s.scheduled_date || 'Unknown'
    if (!groupedSchedules[key]) groupedSchedules[key] = []
    groupedSchedules[key].push(s)
  })

  const completionRate = stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/20">
      <div className="px-6 pt-6 pb-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6"
        >
          {/* Title row */}
          <div className="flex items-center gap-3">
            <PagePurposeAvatar variant="housekeeping" size={44} className="shadow-lg shadow-emerald-200/60" />
            <div>
              <h1 className="text-2xl font-bold font-display text-slate-900">Housekeeping</h1>
              <p className="text-sm text-slate-500">
                {format(new Date(), 'EEEE, dd MMMM yyyy')} · {stats.total} total tasks
              </p>
            </div>
          </div>

          {/* Actions row — full width on mobile */}
          <div className="flex items-center gap-2 sm:flex-shrink-0">
            <button
              onClick={fetchData}
              className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className={cn('w-4 h-4 text-slate-500', loading && 'animate-spin')} />
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setAddModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 gradient-azure text-white text-sm font-semibold rounded-xl shadow-azure hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Schedule
            </motion.button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
          {[
            { label: 'Total Tasks',  value: stats.total,      color: 'slate',   icon: ClipboardList, sub: 'All schedules'          },
            { label: 'Scheduled',    value: stats.scheduled,  color: 'amber',   icon: Clock,         sub: 'Pending start'          },
            { label: 'In Progress',  value: stats.inProgress, color: 'azure',   icon: Timer,         sub: 'Currently active'       },
            { label: 'Completed',    value: stats.completed,  color: 'emerald', icon: CheckCircle2,  sub: `${completionRate}% done` },
            { label: 'Emergency',    value: stats.emergency,  color: 'rose',    icon: Zap,           sub: 'Need attention'         },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-white rounded-2xl p-4 shadow-card border border-slate-100"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center',
                  s.color === 'slate'   && 'bg-slate-100',
                  s.color === 'amber'   && 'bg-amber-100',
                  s.color === 'azure'   && 'bg-azure-100',
                  s.color === 'emerald' && 'bg-emerald-100',
                  s.color === 'rose'    && 'bg-rose-100',
                )}>
                  <s.icon className={cn(
                    'w-4 h-4',
                    s.color === 'slate'   && 'text-slate-600',
                    s.color === 'amber'   && 'text-amber-600',
                    s.color === 'azure'   && 'text-azure-600',
                    s.color === 'emerald' && 'text-emerald-600',
                    s.color === 'rose'    && 'text-rose-600',
                  )} />
                </div>
                {s.color === 'emerald' && stats.total > 0 && (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {completionRate}%
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-slate-900 mb-0.5">{s.value}</p>
              <p className="text-xs font-medium text-slate-500">{s.label}</p>
              <p className="text-xs text-slate-400">{s.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Progress bar */}
        {stats.total > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-4 shadow-card border border-slate-100 mb-5"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold text-slate-700">Overall Progress</span>
              </div>
              <span className="text-sm font-bold text-emerald-600">{completionRate}% Complete</span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
              />
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {stats.completed} completed
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-azure-500" />
                {stats.inProgress} in progress
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                {stats.scheduled} scheduled
              </span>
            </div>
          </motion.div>
        )}

        {/* Tabs + Filters */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
            {(['schedules', 'logs'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-5 py-2 rounded-lg text-sm font-medium transition-all',
                  activeTab === tab
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                {tab === 'schedules' ? '📋 Schedules' : '📜 Activity Logs'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search…"
                className="pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 shadow-sm w-40"
              />
            </div>
            {activeTab === 'schedules' && (
              <>
                <select
                  value={hotelFilter}
                  onChange={e => setHotelFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm shadow-sm text-slate-700 focus:outline-none"
                >
                  <option value="all">All Hotels</option>
                  {hotels.map((h: any) => (
                    <option key={h.hotel_id} value={String(h.hotel_id)}>{h.hotel_name}</option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm shadow-sm text-slate-700 focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="skipped">Skipped</option>
                  <option value="reassigned">Reassigned</option>
                </select>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">

          {/* Schedules Tab */}
          {activeTab === 'schedules' && (
            <motion.div
              key="schedules"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{    opacity: 0, y: -10 }}
            >
              {loading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 animate-pulse flex gap-4 border border-slate-100">
                      <div className="w-11 h-11 rounded-xl bg-slate-200 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 bg-slate-200 rounded" />
                        <div className="h-3 w-48 bg-slate-100 rounded" />
                      </div>
                      <div className="h-7 w-24 bg-slate-100 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : filteredSchedules.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-24 text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center mb-4">
                    <Sparkles className="w-7 h-7 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-1">No schedules found</h3>
                  <p className="text-sm text-slate-400 mb-5">Add a new schedule to get started</p>
                  <button
                    onClick={() => setAddModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 gradient-azure text-white text-sm font-semibold rounded-xl shadow-azure"
                  >
                    <Plus className="w-4 h-4" />
                    Add First Schedule
                  </button>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedSchedules)
                    .sort(([a], [b]) => b.localeCompare(a))
                    .map(([date, daySchedules]) => (
                      <div key={date}>
                        {/* Date header */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
                            <Calendar className="w-3.5 h-3.5 text-azure-600" />
                            <span className="text-sm font-semibold text-slate-700">
                              {format(new Date(date), 'EEEE, dd MMMM yyyy')}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                            {daySchedules.length} tasks
                          </span>
                          <div className="flex-1 h-px bg-slate-100" />
                        </div>

                        <div className="space-y-2">
                          {daySchedules.map((s, i) => {
                            const room      = s.rooms as any
                            const staff     = s.staff as any
                            const sscfg     = SCHED_STATUS_CONFIG[s.status] ?? SCHED_STATUS_CONFIG.scheduled
                            const pcfg      = PRIORITY_CONFIG[s.priority]   ?? PRIORITY_CONFIG.normal
                            const taskCfg   = TASK_CONFIG[s.task_type]      ?? { label: s.task_type, icon: '🧹' }
                            const shiftCfg  = SHIFT_CONFIG[s.shift]         ?? SHIFT_CONFIG.morning
                            const isEmerg   = s.priority === 'emergency'
                            const staffName = staff
                              ? `${staff.first_name} ${staff.last_name}`
                              : 'Unassigned'

                            return (
                              <motion.div
                                key={s.schedule_id}
                                layout
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                                className={cn(
                                  'bg-white rounded-2xl border shadow-card transition-all hover:shadow-card-hover',
                                  isEmerg           ? 'border-rose-200 bg-rose-50/20' : 'border-slate-100',
                                  s.status === 'completed' && 'opacity-70'
                                )}
                              >
                                <div className="p-4 flex items-center gap-4">
                                  {/* Task icon */}
                                  <div className={cn(
                                    'w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-xl',
                                    isEmerg                    ? 'bg-rose-100'    :
                                    s.status === 'completed'   ? 'bg-emerald-100' :
                                    s.status === 'in_progress' ? 'bg-azure-100'   : 'bg-slate-100'
                                  )}>
                                    {taskCfg.icon}
                                  </div>

                                  {/* Info */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                      <span className="font-bold text-slate-900">
                                        Room {room?.room_number ?? '—'}
                                      </span>
                                      <span className="text-slate-300">·</span>
                                      <span className="text-sm font-medium text-slate-600">
                                        {taskCfg.label}
                                      </span>
                                      <span className={cn(
                                        'px-2 py-0.5 rounded-full text-xs font-semibold border',
                                        pcfg.bg, pcfg.color, pcfg.border
                                      )}>
                                        {pcfg.label}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                                      <span className="flex items-center gap-1">
                                        <Building2 className="w-3 h-3 text-slate-400" />
                                        {(room?.hotels as any)?.hotel_name ?? '—'}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Layers className="w-3 h-3 text-slate-400" />
                                        Floor {room?.floor_number ?? '—'}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <User className="w-3 h-3 text-slate-400" />
                                        {staffName}
                                      </span>
                                      <span className={cn(
                                        'px-2 py-0.5 rounded-full text-xs font-medium',
                                        shiftCfg.bg, shiftCfg.color
                                      )}>
                                        {shiftCfg.label} shift
                                      </span>
                                      {s.estimated_minutes && (
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-3 h-3 text-slate-400" />
                                          ~{s.estimated_minutes} min
                                        </span>
                                      )}
                                    </div>
                                    {s.notes && (
                                      <p className="text-xs text-slate-400 mt-1 italic">"{s.notes}"</p>
                                    )}
                                  </div>

                                  {/* Status + Actions */}
                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className={cn(
                                      'px-3 py-1.5 rounded-full text-xs font-semibold border hidden sm:flex items-center gap-1.5',
                                      sscfg.bg, sscfg.color, sscfg.border
                                    )}>
                                      <span className={cn(
                                        'w-1.5 h-1.5 rounded-full',
                                        s.status === 'scheduled'   && 'bg-slate-400',
                                        s.status === 'in_progress' && 'bg-azure-500 animate-pulse',
                                        s.status === 'completed'   && 'bg-emerald-500',
                                        s.status === 'skipped'     && 'bg-slate-300',
                                        s.status === 'reassigned'  && 'bg-violet-500',
                                      )} />
                                      {sscfg.label}
                                    </span>

                                    {s.status === 'scheduled' && (
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => updateStatus(s.schedule_id, 'in_progress')}
                                        disabled={updatingId === String(s.schedule_id)}
                                        title="Start Task"
                                        className="w-9 h-9 rounded-xl bg-azure-100 hover:bg-azure-200 flex items-center justify-center transition-colors"
                                      >
                                        <Play className="w-3.5 h-3.5 text-azure-600" />
                                      </motion.button>
                                    )}
                                    {s.status === 'in_progress' && (
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => updateStatus(s.schedule_id, 'completed')}
                                        disabled={updatingId === String(s.schedule_id)}
                                        title="Mark Complete"
                                        className="w-9 h-9 rounded-xl bg-emerald-100 hover:bg-emerald-200 flex items-center justify-center transition-colors"
                                      >
                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                      </motion.button>
                                    )}
                                    {(s.status === 'scheduled' || s.status === 'in_progress') && (
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => updateStatus(s.schedule_id, 'skipped')}
                                        disabled={updatingId === String(s.schedule_id)}
                                        title="Skip"
                                        className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                                      >
                                        <X className="w-3.5 h-3.5 text-slate-500" />
                                      </motion.button>
                                    )}
                                    {s.status === 'completed' && (
                                      <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <motion.div
              key="logs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{    opacity: 0, y: -10 }}
              className="space-y-2"
            >
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 animate-pulse flex gap-4 border border-slate-100">
                    <div className="w-11 h-11 rounded-xl bg-slate-200 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-40 bg-slate-200 rounded" />
                      <div className="h-3 w-56 bg-slate-100 rounded" />
                    </div>
                  </div>
                ))
              ) : logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <p className="text-slate-500 font-medium">No activity logs yet</p>
                  <p className="text-sm text-slate-400 mt-1">Completed tasks will appear here</p>
                </div>
              ) : (
                logs.map((log, i) => {
                  const room  = log.rooms as any
                  const staff = log.staff as any
                  const score = log.cleanliness_score
                  return (
                    <motion.div
                      key={log.log_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.025 }}
                      className="bg-white border border-slate-100 rounded-2xl px-5 py-4 flex items-start gap-4 shadow-card hover:shadow-card-hover transition-all"
                    >
                      <div className={cn(
                        'w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
                        log.damage_reported ? 'bg-rose-100' : 'bg-emerald-100'
                      )}>
                        {log.damage_reported
                          ? <AlertTriangle className="w-5 h-5 text-rose-600" />
                          : <CheckCircle2  className="w-5 h-5 text-emerald-600" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900">Room {room?.room_number ?? '—'}</span>
                          <span className="text-slate-300">·</span>
                          <span className="text-sm text-slate-600">{(room?.hotels as any)?.hotel_name ?? '—'}</span>
                          {log.damage_reported && (
                            <span className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold rounded-full">
                              ⚠ Damage Reported
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 flex-wrap">
                          {staff && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {staff.first_name} {staff.last_name}
                            </span>
                          )}
                          {log.started_at && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDateTime(log.started_at)}
                            </span>
                          )}
                          {log.actual_minutes && (
                            <span className="flex items-center gap-1">
                              <Timer className="w-3 h-3" />
                              {log.actual_minutes} min actual
                            </span>
                          )}
                        </div>
                        {log.notes && (
                          <p className="text-xs text-slate-500 mt-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                            {log.notes}
                          </p>
                        )}
                      </div>
                      {score && (
                        <div className={cn(
                          'flex flex-col items-center px-3 py-2 rounded-xl border shrink-0',
                          score >= 4 ? 'bg-emerald-50 border-emerald-200' :
                          score >= 3 ? 'bg-amber-50 border-amber-200'    :
                                       'bg-rose-50 border-rose-200'
                        )}>
                          <span className="text-lg">{score >= 4 ? '⭐' : score >= 3 ? '🌟' : '⚡'}</span>
                          <span className={cn(
                            'text-sm font-bold',
                            score >= 4 ? 'text-emerald-700' :
                            score >= 3 ? 'text-amber-700'   : 'text-rose-700'
                          )}>
                            {score}/5
                          </span>
                          <span className="text-xs text-slate-400">score</span>
                        </div>
                      )}
                    </motion.div>
                  )
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Schedule Modal */}
      <AnimatePresence>
        {addModalOpen && (
          <AddScheduleModal
            hotels={hotels}
            onClose={() => setAddModalOpen(false)}
            onSuccess={() => { setAddModalOpen(false); fetchData() }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}