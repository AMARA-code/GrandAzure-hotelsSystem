'use client'

import type { OrderStatus, OrderType } from '@/types/restaurant'

const statusConfig: Record<OrderStatus, { label: string; classes: string; dot: string }> = {
  pending:   { label: 'Pending',   classes: 'bg-amber-50 text-amber-700 border-amber-200',     dot: 'bg-amber-400 animate-pulse' },
  preparing: { label: 'Preparing', classes: 'bg-blue-50 text-blue-700 border-blue-200',         dot: 'bg-blue-400 animate-pulse' },
  ready:     { label: 'Ready',     classes: 'bg-violet-50 text-violet-700 border-violet-200',   dot: 'bg-violet-500' },
  served:    { label: 'Served',    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  cancelled: { label: 'Cancelled', classes: 'bg-rose-50 text-rose-600 border-rose-200',         dot: 'bg-rose-400' },
}

const typeConfig: Record<OrderType, { label: string; classes: string }> = {
  dine_in:      { label: 'Dine-in',      classes: 'bg-azure-50 text-azure-700 border-azure-200' },
  room_service: { label: 'Room Service', classes: 'bg-violet-50 text-violet-700 border-violet-200' },
  takeaway:     { label: 'Takeaway',     classes: 'bg-slate-50 text-slate-700 border-slate-200' },
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const cfg = statusConfig[status] ?? statusConfig.pending
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

export function OrderTypeBadge({ type }: { type: OrderType }) {
  const cfg = typeConfig[type] ?? typeConfig.dine_in
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.classes}`}>
      {cfg.label}
    </span>
  )
}