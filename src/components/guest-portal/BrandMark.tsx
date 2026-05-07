import { Crown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type BrandMarkProps = {
  compact?: boolean
  className?: string
}

export default function BrandMark({ compact = false, className }: BrandMarkProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="relative">
        <div className="absolute inset-0 rounded-2xl bg-[#e9c8ac]/50 blur-lg" />
        <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-[#edc9a7] bg-gradient-to-br from-[#e29a63] to-[#c87030] shadow-premium-lg ring-1 ring-white/80">
          <Crown className="h-5 w-5 text-white" />
        </div>
      </div>
      {!compact && (
        <div>
          <p className="font-display text-lg font-bold leading-tight text-[#3f2f22]">Grand Azure</p>
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#8b6b56]">Hotel Group</p>
        </div>
      )}
    </div>
  )
}
