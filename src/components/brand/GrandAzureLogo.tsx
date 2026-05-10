'use client'

import { useId } from 'react'
import { cn } from '@/lib/utils/cn'

/** Grand Azure emblem: horizon · waves · façade — scalable vector mark */
export function GrandAzureLogoMark({
  size = 44,
  className,
  'aria-hidden': ariaHidden = true,
}: {
  size?: number
  className?: string
  'aria-hidden'?: boolean | 'true' | 'false'
}) {
  const uid = useId().replace(/:/g, '')
  const g = (s: string) => `${s}-${uid}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('flex-shrink-0', className)}
      aria-hidden={ariaHidden === true || ariaHidden === 'true'}
    >
      <defs>
        <linearGradient id={g('ga-sky')} x1="8" y1="6" x2="56" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7dd3fc" />
          <stop offset="1" stopColor="#0284c7" />
        </linearGradient>
        <linearGradient id={g('ga-wave')} x1="8" y1="52" x2="56" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0ea5e9" />
          <stop offset="0.5" stopColor="#0369a1" />
          <stop offset="1" stopColor="#0c4a6e" />
        </linearGradient>
        <linearGradient id={g('ga-gold')} x1="12" y1="8" x2="52" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fbbf77" />
          <stop offset="0.45" stopColor="#d97706" />
          <stop offset="1" stopColor="#a16207" />
        </linearGradient>
        <filter id={g('ga-sh')} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodOpacity="0.18" />
        </filter>
      </defs>

      {/* Outer frame */}
      <rect x="3" y="3" width="58" height="58" rx="16" fill="#fdf8f3" stroke={`url(#${g('ga-gold')})`} strokeWidth="1.75" />

      {/* Sky panel */}
      <path
        d="M10 18c0-4 3.5-8 9-8h26c5.5 0 9 4 9 8v16H10V18z"
        fill={`url(#${g('ga-sky')})`}
        opacity="0.92"
      />

      {/* Sun */}
      <circle cx="48" cy="16" r="5" fill="#fef3c7" filter={`url(#${g('ga-sh')})`} />

      {/* Façade — three arches (windows) */}
      <path
        d="M16 36h8v10h-8V36zm12 0h8v10h-8V36zm12 0h8v10h-8V36z"
        fill="#fefce8"
        opacity="0.95"
      />
      <path
        d="M16 36c0-3.5 2.5-6 4-6s4 2.5 4 6zm12 0c0-3.5 2.5-6 4-6s4 2.5 4 6zm12 0c0-3.5 2.5-6 4-6s4 2.5 4 6"
        stroke="#fef9c3"
        strokeWidth="1.25"
      />
      {/* Door */}
      <rect x="28" y="40" width="8" height="12" rx="2" fill="#fefce8" />
      <line x1="32" y1="40" x2="32" y2="52" stroke="#e7e5e4" strokeWidth="0.75" opacity="0.6" />

      {/* Waves — azure */}
      <path
        d="M8 50c8-4 14 4 24 0s14-4 24 0v8H8v-8z"
        fill={`url(#${g('ga-wave')})`}
      />
      <path d="M8 53c10-5 14 3 24-1 10-4 14 4 24-1v6H8v-5z" fill="#0c4a6e" opacity="0.35" />
    </svg>
  )
}

export default GrandAzureLogoMark
