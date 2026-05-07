'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, ChevronDown, Eye, Edit2, Trash2,
  Wrench, AlertTriangle, Clock, CheckCircle2,
  Building2, User, X, SlidersHorizontal, BedDouble
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils/cn'

interface MaintenanceRequest {
  request_id: number
  hotel_id: number
  hotel_name?: string
  room_id?: number | null
  room_number?: string | null
  reported_by: number
  reported_by_name?: string
  assigned_to?: number | null
  assigned_to_name?: string | null
  request_type: string
  priority: string
  status: string
  title: string
  description: string
  estimated_cost?: number | null
  actual_cost?: number | null
  started_at?: string | null
  completed_at?: string | null
  resolution_notes?: string | null
  created_at: string
  updated_at: string
}

interface Props {
  requests: MaintenanceRequest[]
  loading: boolean
  onView:   (r: MaintenanceRequest) => void
  onEdit:   (r: MaintenanceRequest) => void
  onDelete: (id: number) => void
}

// ── Config maps ───────────────────────────────────────────────────────────────
const priorityConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  low:      { label: 'Low',      color: 'text-emerald-700', bg: 'bg-emerald-50 border border-emerald-200', dot: 'bg-emerald-500' },
  medium:   { label: 'Medium',   color: 'text-amber-700',   bg: 'bg-amber-50 border border-amber-200',     dot: 'bg-amber-400'   },
  high:     { label: 'High',     color: 'text-rose-700',    bg: 'bg-rose-50 border border-rose-200',       dot: 'bg-rose-500'    },
  critical: { label: 'Critical', color: 'text-purple-700',  bg: 'bg-purple-50 border border-purple-200',   dot: 'bg-purple-500'  },
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  open:        { label: 'Open',        color: 'text-rose-700',    bg: 'bg-rose-50 border border-rose-200',       icon: AlertTriangle },
  in_progress: { label: 'In Progress', color: 'text-amber-700',   bg: 'bg-amber-50 border border-amber-200',     icon: Clock         },
  completed:   { label: 'Completed',   color: 'text-emerald-700', bg: 'bg-emerald-50 border border-emerald-200', icon: CheckCircle2  },
  on_hold:     { label: 'On Hold',     color: 'text-slate-700',   bg: 'bg-slate-100 border border-slate-200',    icon: Clock         },
}

const typeIcons: Record<string, string> = {
  electrical: '⚡', plumbing: '🔧', hvac: '❄️',
  furniture: '🪑', structural: '🏗️', it: '💻', other: '🔩',
}

const ALL_STATUSES   = ['open', 'in_progress', 'completed', 'on_hold']
const ALL_PRIORITIES = ['low', 'medium', 'high', 'critical']
const ALL_TYPES      = ['electrical', 'plumbing', 'hvac', 'furniture', 'structural', 'it', 'other']

// ── Mobile card component ─────────────────────────────────────────────────────
function RequestCard({
  r, onView, onEdit, onDelete
}: {
  r: MaintenanceRequest
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const priority   = priorityConfig[r.priority] ?? priorityConfig.medium
  const status     = statusConfig[r.status]     ?? statusConfig.open
  const StatusIcon = status.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
    >
      {/* Top accent bar based on priority */}
      <div className={cn(
        'h-0.5 w-full',
        r.priority === 'high' || r.priority === 'critical' ? 'bg-rose-400' :
        r.priority === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'
      )} />

      <div className="p-3 sm:p-4 space-y-2.5">
        {/* Row 1: emoji + title + priority badge */}
        <div className="flex items-start gap-2">
          <span className="text-base sm:text-lg mt-0.5 shrink-0 leading-none">
            {typeIcons[r.request_type] || '🔩'}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-tight line-clamp-2">
              {r.title}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              #{r.request_id} · {formatDate(r.created_at)}
            </p>
          </div>
          <span className={cn(
            'shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold ml-1',
            priority.bg, priority.color
          )}>
            <span className={cn('w-1 h-1 rounded-full shrink-0', priority.dot)} />
            {priority.label}
          </span>
        </div>

        {/* Row 2: hotel + room + assignee info */}
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <span className="flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-500">
            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate max-w-[100px] sm:max-w-[140px]">{r.hotel_name}</span>
          </span>
          {r.room_number && (
            <span className="flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-500">
              <BedDouble className="w-3 h-3 text-slate-400 shrink-0" />
              <span>Rm {r.room_number}</span>
            </span>
          )}
          {r.assigned_to_name && (
            <span className="flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-500">
              <User className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate max-w-[90px] sm:max-w-[120px]">{r.assigned_to_name}</span>
            </span>
          )}
          {r.estimated_cost && (
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-600">
              {formatCurrency(r.estimated_cost)}
            </span>
          )}
          {r.actual_cost && (
            <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-600">
              Actual: {formatCurrency(r.actual_cost)}
            </span>
          )}
        </div>

        {/* Row 3: status + action buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <span className={cn(
            'inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold',
            status.bg, status.color
          )}>
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </span>
          <div className="flex items-center gap-0.5">
            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={onView}
              className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
              title="View details"
            >
              <Eye className="w-3.5 h-3.5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={onEdit}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
              title="Edit"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={onDelete}
              className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-50 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Skeleton card for loading state ──────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-3 sm:p-4 space-y-2.5 animate-pulse">
      <div className="flex gap-2">
        <div className="w-5 h-5 bg-slate-200 rounded shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 bg-slate-200 rounded w-3/4" />
          <div className="h-2.5 bg-slate-100 rounded w-1/3" />
        </div>
      </div>
      <div className="h-2.5 bg-slate-100 rounded w-2/3" />
      <div className="flex justify-between items-center pt-2 border-t border-slate-100">
        <div className="h-5 w-20 bg-slate-100 rounded-lg" />
        <div className="flex gap-1">
          <div className="w-6 h-6 bg-slate-100 rounded-lg" />
          <div className="w-6 h-6 bg-slate-100 rounded-lg" />
          <div className="w-6 h-6 bg-slate-100 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function MaintenanceTable({
  requests, loading, onView, onEdit, onDelete
}: Props) {
  const [search,         setSearch]         = useState('')
  const [statusFilter,   setStatusFilter]   = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [typeFilter,     setTypeFilter]     = useState('all')
  const [showFilters,    setShowFilters]    = useState(false)

  const filtered = useMemo(() => requests.filter(r => {
    const q = search.toLowerCase()
    const matchSearch = !q
      || r.title.toLowerCase().includes(q)
      || (r.hotel_name         || '').toLowerCase().includes(q)
      || (r.assigned_to_name   || '').toLowerCase().includes(q)
      || (r.reported_by_name   || '').toLowerCase().includes(q)
      || (r.room_number        || '').includes(q)
      || (r.request_type       || '').includes(q)
    const matchStatus   = statusFilter   === 'all' || r.status       === statusFilter
    const matchPriority = priorityFilter === 'all' || r.priority     === priorityFilter
    const matchType     = typeFilter     === 'all' || r.request_type === typeFilter
    return matchSearch && matchStatus && matchPriority && matchType
  }), [requests, search, statusFilter, priorityFilter, typeFilter])

  const activeFilters = [statusFilter, priorityFilter, typeFilter].filter(f => f !== 'all').length
  const clearAll = () => {
    setSearch(''); setStatusFilter('all'); setPriorityFilter('all'); setTypeFilter('all')
  }

  const filterDefs = [
    {
      value: statusFilter, setter: setStatusFilter,
      opts: ALL_STATUSES, ph: 'Status',
      label: (v: string) => statusConfig[v]?.label ?? v,
    },
    {
      value: priorityFilter, setter: setPriorityFilter,
      opts: ALL_PRIORITIES, ph: 'Priority',
      label: (v: string) => priorityConfig[v]?.label ?? v,
    },
    {
      value: typeFilter, setter: setTypeFilter,
      opts: ALL_TYPES, ph: 'Type',
      label: (v: string) => v.charAt(0).toUpperCase() + v.slice(1),
    },
  ]

  const selCls = "text-[10px] sm:text-xs rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400/30 appearance-none cursor-pointer"

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full">

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="px-3 sm:px-4 py-3 border-b border-slate-100 space-y-2">

        {/* Search row */}
        <div className="flex items-center gap-2 w-full">

          {/* Search input */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search requests..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-7 sm:pl-8 pr-7 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-slate-200 bg-slate-50 text-[11px] sm:text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Filter toggle — shows on all sizes, inline filters show on xl+ */}
          <button
            onClick={() => setShowFilters(v => !v)}
            className={cn(
              'xl:hidden flex items-center gap-1 px-2.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border text-[11px] sm:text-xs font-medium transition-all shrink-0',
              showFilters
                ? 'bg-blue-500 text-white border-blue-500'
                : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
            )}
          >
            <SlidersHorizontal className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilters > 0 && (
              <span className={cn(
                'w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center leading-none',
                showFilters ? 'bg-white text-blue-600' : 'bg-blue-500 text-white'
              )}>
                {activeFilters}
              </span>
            )}
          </button>

          {/* Inline filters — xl+ only */}
          <div className="hidden xl:flex items-center gap-1.5 shrink-0">
            {filterDefs.map((f, i) => (
              <div key={i} className="relative">
                <select
                  value={f.value}
                  onChange={e => f.setter(e.target.value)}
                  className={cn(selCls, 'pr-6')}
                >
                  <option value="all">All {f.ph}</option>
                  {f.opts.map(o => (
                    <option key={o} value={o}>{f.label(o)}</option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            ))}
          </div>
        </div>

        {/* Collapsible filter row — shows below xl */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden xl:hidden"
            >
              <div className="flex items-center gap-2 pt-0.5 w-full">
                {filterDefs.map((f, i) => (
                  <div key={i} className="relative flex-1 min-w-0">
                    <select
                      value={f.value}
                      onChange={e => f.setter(e.target.value)}
                      className={cn(selCls, 'w-full pr-5')}
                    >
                      <option value="all">{f.ph}</option>
                      {f.opts.map(o => (
                        <option key={o} value={o}>{f.label(o)}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result count + clear */}
        <div className="flex items-center justify-between">
          <p className="text-[10px] sm:text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{filtered.length}</span>
            {' '}of{' '}
            <span className="font-semibold text-slate-700">{requests.length}</span>
            {' '}requests
          </p>
          {(activeFilters > 0 || search) && (
            <button
              onClick={clearAll}
              className="text-[10px] sm:text-xs text-blue-500 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ── Card layout — all screens below xl ───────────────────────────── */}
      <div className="xl:hidden p-2.5 sm:p-3 space-y-2 sm:space-y-2.5">
        {loading ? (
          [1, 2, 3].map(i => <SkeletonCard key={i} />)
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Wrench className="w-8 h-8 mb-2 opacity-25" />
            <p className="text-xs font-medium">No requests found</p>
            {(activeFilters > 0 || search) && (
              <button
                onClick={clearAll}
                className="mt-2 text-xs text-blue-500 hover:text-blue-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          filtered.map(r => (
            <RequestCard
              key={r.request_id}
              r={r}
              onView={() => onView(r)}
              onEdit={() => onEdit(r)}
              onDelete={() => onDelete(r.request_id)}
            />
          ))
        )}
      </div>

      {/* ── Table layout — xl+ only ───────────────────────────────────────── */}
      <div className="hidden xl:block overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {[
                'Request', 'Hotel / Room', 'Type',
                'Priority', 'Status', 'Assigned To',
                'Est. Cost', ''
              ].map(h => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              [1, 2, 3, 4, 5].map(i => (
                <tr key={i} className="border-b border-slate-100">
                  {[180, 130, 80, 80, 110, 120, 95, 70].map((w, j) => (
                    <td key={j} className="px-4 py-3.5">
                      <div
                        className="h-3.5 bg-slate-100 animate-pulse rounded"
                        style={{ width: w }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Wrench className="w-9 h-9 opacity-25" />
                    <p className="text-sm font-medium">No maintenance requests found</p>
                    {(activeFilters > 0 || search) && (
                      <button
                        onClick={clearAll}
                        className="text-xs text-blue-500 hover:text-blue-700 font-medium mt-1"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((r, idx) => {
                const priority   = priorityConfig[r.priority] ?? priorityConfig.medium
                const status     = statusConfig[r.status]     ?? statusConfig.open
                const StatusIcon = status.icon

                return (
                  <motion.tr
                    key={r.request_id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    className="hover:bg-slate-50/60 transition-colors group"
                  >
                    {/* Request */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5 max-w-[200px]">
                        <span className="text-base shrink-0">
                          {typeIcons[r.request_type] || '🔩'}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate">
                            {r.title}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            #{r.request_id} · {formatDate(r.created_at)}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Hotel / Room */}
                    <td className="px-4 py-3.5">
                      <p className="text-xs text-slate-700 whitespace-nowrap">
                        {r.hotel_name}
                      </p>
                      {r.room_number && (
                        <p className="text-[10px] text-slate-400">
                          Room {r.room_number}
                        </p>
                      )}
                    </td>

                    {/* Type */}
                    <td className="px-4 py-3.5">
                      <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-lg capitalize whitespace-nowrap">
                        {r.request_type}
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="px-4 py-3.5">
                      <span className={cn(
                        'inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap',
                        priority.bg, priority.color
                      )}>
                        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', priority.dot)} />
                        {priority.label}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <span className={cn(
                        'inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap',
                        status.bg, status.color
                      )}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </td>

                    {/* Assigned To */}
                    <td className="px-4 py-3.5">
                      {r.assigned_to_name ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-violet-400 flex items-center justify-center text-[9px] font-bold text-white shrink-0">
                            {r.assigned_to_name.charAt(0)}
                          </div>
                          <span className="text-xs text-slate-700 truncate max-w-[110px]">
                            {r.assigned_to_name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Unassigned</span>
                      )}
                    </td>

                    {/* Est. Cost */}
                    <td className="px-4 py-3.5">
                      <p className="text-xs font-medium text-slate-700 whitespace-nowrap">
                        {r.estimated_cost
                          ? formatCurrency(r.estimated_cost)
                          : <span className="text-slate-300">—</span>
                        }
                      </p>
                      {r.actual_cost && (
                        <p className="text-[10px] text-emerald-600 whitespace-nowrap">
                          {formatCurrency(r.actual_cost)}
                        </p>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <motion.button
                          whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                          onClick={() => onView(r)}
                          className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                          title="View details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                          onClick={() => onEdit(r)}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                          onClick={() => onDelete(r.request_id)}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}