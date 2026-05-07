'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Wrench, Building2, BedDouble, User, Calendar, Clock,
  CheckCircle2, AlertTriangle, DollarSign, FileText, Tag, Edit2
} from 'lucide-react'
import { formatCurrency, formatDateTime } from '@/lib/utils/formatters'
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
  open: boolean
  onClose: () => void
  request: MaintenanceRequest | null
  onEdit: (request: MaintenanceRequest) => void
  onStatusChange: (requestId: number, newStatus: string) => void
}

const priorityConfig: Record<string, { label: string; color: string; bg: string; border: string; dot: string }> = {
  low:      { label: 'Low',      color: 'text-emerald-700', bg: 'bg-emerald-50',  border: 'border-emerald-200', dot: 'bg-emerald-500' },
  medium:   { label: 'Medium',   color: 'text-amber-700',   bg: 'bg-amber-50',    border: 'border-amber-200',   dot: 'bg-amber-500'   },
  high:     { label: 'High',     color: 'text-rose-700',    bg: 'bg-rose-50',     border: 'border-rose-200',    dot: 'bg-rose-500'    },
  critical: { label: 'Critical', color: 'text-purple-700',  bg: 'bg-purple-50',   border: 'border-purple-200',  dot: 'bg-purple-500'  },
}

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string; gradient: string }> = {
  open:        { label: 'Open',        color: 'text-rose-700',    bg: 'bg-rose-50',    border: 'border-rose-200',    gradient: 'from-rose-500 to-rose-600'    },
  in_progress: { label: 'In Progress', color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200',   gradient: 'from-amber-500 to-orange-500'  },
  completed:   { label: 'Completed',   color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', gradient: 'from-emerald-500 to-teal-500'  },
  on_hold:     { label: 'On Hold',     color: 'text-slate-700',   bg: 'bg-slate-100',  border: 'border-slate-200',   gradient: 'from-slate-400 to-slate-500'   },
}

const requestTypeIcons: Record<string, string> = {
  electrical: '⚡',
  plumbing:   '🔧',
  hvac:       '❄️',
  furniture:  '🪑',
  structural: '🏗️',
  it:         '💻',
  other:      '🔩',
}

const STATUS_TRANSITIONS: Record<string, string[]> = {
  open:        ['in_progress', 'on_hold'],
  in_progress: ['completed', 'on_hold'],
  on_hold:     ['open', 'in_progress'],
  completed:   [],
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 leading-none mb-1">{label}</p>
        <div className="text-sm font-medium text-slate-700 break-words">{value || <span className="text-slate-400 italic">Not specified</span>}</div>
      </div>
    </div>
  )
}

export default function MaintenanceDetailDrawer({ open, onClose, request, onEdit, onStatusChange }: Props) {
  if (!request) return null

  const priority = priorityConfig[request.priority] || priorityConfig.medium
  const status   = statusConfig[request.status]     || statusConfig.open
  const transitions = STATUS_TRANSITIONS[request.status] || []

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Drawer — full screen on mobile, side panel on desktop */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full sm:w-[420px] lg:w-[480px] h-full bg-white shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header gradient banner */}
            <div className={`bg-gradient-to-r ${status.gradient} px-5 pt-5 pb-16 shrink-0`}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 pr-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{requestTypeIcons[request.request_type] || '🔩'}</span>
                    <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                      {request.request_type} · #{request.request_id}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white font-display leading-tight line-clamp-2">
                    {request.title}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all shrink-0"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Status + Priority badges — overlapping the banner */}
            <div className="relative -mt-10 px-5 mb-2 flex flex-wrap items-center gap-2 shrink-0">
              <span className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-sm', status.bg, status.border, status.color)}>
                <span className={cn('w-1.5 h-1.5 rounded-full', priority.dot)} />
                {status.label}
              </span>
              <span className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-sm', priority.bg, priority.border, priority.color)}>
                <AlertTriangle className="w-3 h-3" />
                {priority.label} Priority
              </span>
              <button
                onClick={() => onEdit(request)}
                className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 shadow-sm transition-all"
              >
                <Edit2 className="w-3 h-3" />
                Edit
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-5">

              {/* Details card */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 divide-y divide-slate-100 overflow-hidden">
                <InfoRow icon={Building2} label="Hotel" value={request.hotel_name} />
                <InfoRow icon={BedDouble} label="Room" value={request.room_number ? `Room ${request.room_number}` : null} />
                <InfoRow icon={User} label="Reported By" value={request.reported_by_name} />
                <InfoRow icon={User} label="Assigned To" value={request.assigned_to_name} />
                <InfoRow icon={Calendar} label="Created" value={formatDateTime(request.created_at)} />
                {request.started_at && (
                  <InfoRow icon={Clock} label="Started" value={formatDateTime(request.started_at)} />
                )}
                {request.completed_at && (
                  <InfoRow icon={CheckCircle2} label="Completed" value={formatDateTime(request.completed_at)} />
                )}
              </div>

              {/* Description */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Description</p>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{request.description}</p>
              </div>

              {/* Resolution notes */}
              {request.resolution_notes && (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Resolution Notes</p>
                  </div>
                  <p className="text-sm text-emerald-800 leading-relaxed">{request.resolution_notes}</p>
                </div>
              )}

              {/* Cost breakdown */}
              {(request.estimated_cost || request.actual_cost) && (
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Cost Breakdown</p>
                  </div>
                  {request.estimated_cost && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">Estimated</span>
                      <span className="text-sm font-semibold text-slate-700">{formatCurrency(request.estimated_cost)}</span>
                    </div>
                  )}
                  {request.actual_cost && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">Actual</span>
                      <span className="text-sm font-semibold text-emerald-700">{formatCurrency(request.actual_cost)}</span>
                    </div>
                  )}
                  {request.estimated_cost && request.actual_cost && (
                    <>
                      <div className="h-px bg-slate-200" />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Variance</span>
                        <span className={cn('text-sm font-bold', request.actual_cost <= request.estimated_cost ? 'text-emerald-600' : 'text-rose-600')}>
                          {request.actual_cost <= request.estimated_cost ? '▼ ' : '▲ '}
                          {formatCurrency(Math.abs(request.actual_cost - request.estimated_cost))}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Status actions */}
              {transitions.length > 0 && (
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Change Status</p>
                  <div className="flex flex-wrap gap-2">
                    {transitions.map(newStatus => {
                      const cfg = statusConfig[newStatus]
                      if (!cfg) return null
                      return (
                        <motion.button
                          key={newStatus}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => onStatusChange(request.request_id, newStatus)}
                          className={cn(
                            'flex-1 min-w-[120px] py-2.5 px-4 rounded-xl border text-xs font-semibold transition-all',
                            cfg.bg, cfg.border, cfg.color, 'hover:shadow-sm'
                          )}
                        >
                          Mark as {cfg.label}
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}