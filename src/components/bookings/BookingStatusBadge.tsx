import { cn } from '@/lib/utils/cn'
import {
  Clock, CheckCircle, XCircle,
  LogIn, LogOut, AlertCircle
} from 'lucide-react'

const statusConfig = {
  confirmed: {
    label: 'Confirmed',
    icon: Clock,
    bg: 'bg-azure-50',
    text: 'text-azure-700',
    border: 'border-azure-200',
    dot: 'bg-azure-500',
  },
  checked_in: {
    label: 'Checked In',
    icon: LogIn,
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  checked_out: {
    label: 'Checked Out',
    icon: LogOut,
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
  },
  no_show: {
    label: 'No Show',
    icon: AlertCircle,
    bg: 'bg-gold-50',
    text: 'text-gold-700',
    border: 'border-gold-200',
    dot: 'bg-gold-500',
  },
}

interface BookingStatusBadgeProps {
  status: string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

export default function BookingStatusBadge({
  status,
  size = 'md',
  showIcon = true,
}: BookingStatusBadgeProps) {
  const config = statusConfig[status as keyof typeof statusConfig] ?? statusConfig.confirmed
  const Icon = config.icon

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full border font-semibold',
      config.bg, config.text, config.border,
      size === 'sm'  && 'px-2 py-0.5 text-xs',
      size === 'md'  && 'px-3 py-1 text-xs',
      size === 'lg'  && 'px-4 py-1.5 text-sm',
    )}>
      {showIcon && <Icon className={cn(
        size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'
      )} />}
      {config.label}
    </span>
  )
}