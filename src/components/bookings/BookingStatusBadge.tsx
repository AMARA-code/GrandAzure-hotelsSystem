import { cn } from '@/lib/utils/cn'

const statusConfig: Record<string, { label: string; dot: string; bg: string; text: string; border: string }> = {
  pending: {
    label:  'Pending',
    dot:    'bg-amber-400',
    bg:     'bg-amber-50',
    text:   'text-amber-700',
    border: 'border-amber-200',
  },
  confirmed: {
    label:  'Confirmed',
    dot:    'bg-azure-500',
    bg:     'bg-azure-50',
    text:   'text-azure-700',
    border: 'border-azure-200',
  },
  checked_in: {
    label:  'Checked In',
    dot:    'bg-emerald-500',
    bg:     'bg-emerald-50',
    text:   'text-emerald-700',
    border: 'border-emerald-200',
  },
  checked_out: {
    label:  'Checked Out',
    dot:    'bg-slate-400',
    bg:     'bg-slate-50',
    text:   'text-slate-600',
    border: 'border-slate-200',
  },
  cancelled: {
    label:  'Cancelled',
    dot:    'bg-rose-500',
    bg:     'bg-rose-50',
    text:   'text-rose-700',
    border: 'border-rose-200',
  },
  no_show: {
    label:  'No Show',
    dot:    'bg-orange-500',
    bg:     'bg-orange-50',
    text:   'text-orange-700',
    border: 'border-orange-200',
  },
}

interface Props {
  status: string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

export default function BookingStatusBadge({ status, size = 'md', showIcon = true }: Props) {
  const cfg = statusConfig[status] ?? {
    label:  status,
    dot:    'bg-slate-400',
    bg:     'bg-slate-50',
    text:   'text-slate-600',
    border: 'border-slate-200',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-semibold',
        cfg.bg, cfg.text, cfg.border,
        size === 'sm' && 'px-2 py-0.5 text-[10px]',
        size === 'md' && 'px-2.5 py-1 text-xs',
        size === 'lg' && 'px-3 py-1.5 text-sm',
      )}
    >
      {showIcon && (
        <span
          className={cn(
            'rounded-full flex-shrink-0',
            cfg.dot,
            status === 'pending' ? 'relative' : '',
            size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2',
          )}
        >
          {status === 'pending' && (
            <span className={cn('absolute inset-0 rounded-full animate-ping opacity-75', cfg.dot)} />
          )}
        </span>
      )}
      {cfg.label}
    </span>
  )
}