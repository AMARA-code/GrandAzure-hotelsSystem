'use client'

import { cn } from '@/lib/utils/cn'

export type PagePurposeAvatarVariant =
  | 'analytics'
  | 'dashboard'
  | 'bookings'
  | 'guests'
  | 'rooms'
  | 'finance'
  | 'housekeeping'
  | 'maintenance'
  | 'staff'
  | 'reviews'
  | 'conference'
  | 'restaurants'
  | 'inventory'
  | 'loyalty'

const FRAME: Record<
  PagePurposeAvatarVariant,
  string
> = {
  analytics:
    'border-amber-200 bg-amber-50 shadow-sm',
  dashboard:
    'border-sky-200 bg-gradient-to-br from-sky-50 to-cyan-50 shadow-sm',
  bookings:
    'border-azure-200 bg-azure-50 shadow-sm',
  guests:
    'border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50/80 shadow-sm',
  rooms:
    'border-azure-300/70 bg-gradient-to-br from-azure-50 to-slate-50 shadow-sm',
  finance:
    'border-emerald-200/90 bg-gradient-to-br from-emerald-50 via-white to-cyan-50/60 shadow-sm',
  housekeeping:
    'border-emerald-300/70 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-sm',
  maintenance:
    'border-indigo-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm',
  staff:
    'border-slate-300/80 bg-gradient-to-br from-slate-50 to-zinc-50 shadow-sm',
  reviews:
    'border-amber-200/90 bg-gradient-to-br from-amber-50 via-white to-orange-50/70 shadow-sm',
  conference:
    'border-cyan-200/90 bg-gradient-to-br from-sky-50 to-indigo-50/70 shadow-sm',
  restaurants:
    'border-orange-200/90 bg-orange-50/95 shadow-[0_4px_14px_rgba(212,114,42,0.15)]',
  inventory:
    'border-blue-200/90 bg-gradient-to-br from-blue-50 to-slate-50 shadow-sm',
  loyalty:
    'border-violet-200/90 bg-gradient-to-br from-violet-50 via-amber-50/40 to-orange-50/50 shadow-sm',
}

function Illustration({ variant }: { variant: PagePurposeAvatarVariant }) {
  switch (variant) {
    case 'analytics':
      return (
        <>
          <circle cx="50" cy="50" r="50" fill="#FAEEDA" />
          <rect x="10" y="78" width="80" height="5" rx="2" fill="#C2511A" />
          <rect x="15" y="72" width="70" height="8" rx="2" fill="#E09A58" />
          <rect x="12" y="36" width="50" height="38" rx="3" fill="#fff" stroke="#E09A58" strokeWidth="1.2" />
          <rect x="19" y="60" width="6" height="12" rx="1" fill="#D85A30" />
          <rect x="27" y="54" width="6" height="18" rx="1" fill="#C2511A" />
          <rect x="35" y="47" width="6" height="25" rx="1" fill="#E09A58" />
          <rect x="43" y="51" width="6" height="21" rx="1" fill="#D85A30" />
          <rect x="51" y="44" width="6" height="28" rx="1" fill="#C2511A" />
          <line x1="16" y1="73" x2="62" y2="73" stroke="#E09A58" strokeWidth="0.8" />
          <circle cx="20" cy="42" r="2.5" fill="#D85A30" />
          <circle cx="26" cy="42" r="2.5" fill="#C2511A" />
          <circle cx="32" cy="42" r="2.5" fill="#E09A58" />
          <path d="M36 72 Q36 63 43 61 L57 61 Q64 63 64 72 L64 76 L36 76 Z" fill="#944A15" />
          <path d="M47 61 L50 68 L53 61" fill="#B85E1E" />
          <path d="M36 69 Q26 72 20 76 L26 77 Q32 74 40 71 Z" fill="#944A15" />
          <path d="M64 65 Q74 57 80 47 L76 44 Q71 54 61 63 Z" fill="#944A15" />
          <circle cx="50" cy="54" r="13" fill="#FAC775" />
          <path d="M37 50 Q38 40 50 38 Q62 40 63 50 Q59 44 50 43 Q41 44 37 50 Z" fill="#70370E" />
          <ellipse cx="37" cy="54" rx="3" ry="4" fill="#FAC775" />
          <ellipse cx="63" cy="54" rx="3" ry="4" fill="#FAC775" />
          <circle cx="45" cy="52" r="2" fill="#70370E" />
          <circle cx="55" cy="52" r="2" fill="#70370E" />
          <circle cx="46" cy="51" r="0.8" fill="#fff" />
          <circle cx="56" cy="51" r="0.8" fill="#fff" />
          <path d="M49 56 Q50 58 51 56" fill="none" stroke="#D85A30" strokeWidth="0.8" strokeLinecap="round" />
          <path d="M45 60 Q50 64 55 60" fill="none" stroke="#D85A30" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="82" y1="44" x2="92" y2="34" stroke="#70370E" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="74" cy="51" r="12" fill="none" stroke="#D85A30" strokeWidth="3" />
          <circle cx="74" cy="51" r="9" fill="#FAEEDA" fillOpacity="0.75" />
          <rect x="69" y="54" width="3" height="6" rx="0.5" fill="#D85A30" fillOpacity="0.85" />
          <rect x="73" y="51" width="3" height="9" rx="0.5" fill="#C2511A" fillOpacity="0.85" />
          <rect x="77" y="48" width="3" height="12" rx="0.5" fill="#E09A58" fillOpacity="0.85" />
          <path d="M8 28 L9.5 32 L11 28 L9.5 24 Z" fill="#E09A58" />
          <path d="M88 22 L89.5 26 L91 22 L89.5 18 Z" fill="#D85A30" />
          <circle cx="10" cy="55" r="3" fill="#E09A58" fillOpacity="0.45" />
          <circle cx="88" cy="62" r="3" fill="#E09A58" fillOpacity="0.45" />
        </>
      )

    case 'dashboard':
      return (
        <>
          <circle cx="50" cy="50" r="50" fill="#eef8ff" />
          <ellipse cx="50" cy="88" rx="42" ry="10" fill="#bae6fd" opacity="0.55" />
          <rect x="22" y="38" width="56" height="34" rx="4" fill="#fff" stroke="#0284c7" strokeWidth="1.25" />
          <rect x="30" y="54" width="8" height="12" rx="1" fill="#0ea5e9" />
          <rect x="42" y="48" width="8" height="18" rx="1" fill="#0284c7" />
          <rect x="54" y="52" width="8" height="14" rx="1" fill="#38bdf8" />
          <circle cx="78" cy="22" r="11" fill="#FBF0E3" />
          <path d="M18 76h64v8H18z" fill="#cbd5e1" rx="2" />
          <path d="M28 76V58l8 12 10-22 12 28h-30z" fill="#fecdd3" opacity="0.9" stroke="#f43f5e" strokeWidth="0.75" />
          <path d="M8 18 L12 26 L16 18 L12 14 Z" fill="#D4722A" />
        </>
      )

    case 'bookings':
      return (
        <>
          <circle cx="50" cy="50" r="50" fill="#eef6ff" />
          <rect x="18" y="28" width="64" height="52" rx="6" fill="#fff" stroke="#0369a1" strokeWidth="1.75" />
          <rect x="18" y="28" width="64" height="14" rx="6" fill="#0369a1" />
          <text x="50" y="39" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">
            FEB
          </text>
          <rect x="30" y="48" width="40" height="24" rx="3" fill="#dbeafe" />
          <text x="50" y="65" textAnchor="middle" fill="#0369a1" fontSize="18" fontWeight="800">
            24
          </text>
          <circle cx="68" cy="58" r="12" fill="#10b981" />
          <path d="M64 58l4 4 10-11" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )

    case 'guests':
      return (
        <>
          <circle cx="50" cy="50" r="50" fill="#f5f3ff" />
          <ellipse cx="32" cy="46" rx="13" ry="15" fill="#fcd9bd" stroke="#944A15" strokeWidth="0.75" />
          <ellipse cx="68" cy="46" rx="13" ry="15" fill="#fcd9bd" stroke="#944A15" strokeWidth="0.75" />
          <path d="M32 34c4-12 21-14 36-6 6 3 10 8 12 16" stroke="#5c3d28" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M24 74c6-22 54-22 62 6" stroke="#7c3aed" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <rect x="40" y="68" width="20" height="18" rx="6" fill="#a78bfa" opacity="0.35" />
          <circle cx="50" cy="78" r="4" fill="#6366f1" />
        </>
      )

    case 'rooms':
      return (
        <>
          <circle cx="50" cy="50" r="50" fill="#faf5ff" />
          <rect x="18" y="62" width="64" height="22" rx="4" fill="#bae6fd" stroke="#0369a1" strokeWidth="1.25" />
          <rect x="22" y="66" width="24" height="10" rx="2" fill="#fdf4ff" />
          <ellipse cx="50" cy="58" rx="28" ry="12" fill="#FBF0E3" stroke="#D4722A" strokeWidth="1" />
          <rect x="30" y="48" width="40" height="18" rx="3" fill="#fce7f3" opacity="0.95" stroke="#f472b6" strokeWidth="0.75" />
          <circle cx="50" cy="38" r="6" fill="#E09A58" />
        </>
      )

    case 'finance':
      return (
        <>
          <circle cx="50" cy="50" r="50" fill="#ecfdf5" />
          <path d="M12 70 L28 54 40 62 62 42 76 54 76 74H12z" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="62" cy="42" r="5" fill="#10b981" />
          <circle cx="50" cy="24" r="11" fill="#E09A58" stroke="#C4621A" strokeWidth="1.75" />
          <rect x="44" y="28" width="12" height="14" rx="3" fill="#FBF0E3" stroke="#C4621A" strokeWidth="1" />
          <line x1="47" y1="32" x2="53" y2="38" stroke="#C4621A" strokeWidth="1.5" strokeLinecap="round" />
          <rect x="20" y="58" width="14" height="16" rx="2" fill="#C4621A" opacity="0.85" />
          <rect x="38" y="52" width="14" height="22" rx="2" fill="#ea580c" opacity="0.75" />
        </>
      )

    case 'housekeeping':
      return (
        <>
          <circle cx="50" cy="50" r="50" fill="#ecfdf5" />
          <ellipse cx="50" cy="85" rx="38" ry="8" fill="#a7f3d0" opacity="0.45" />
          <path d="M32 76 L34 54 L62 52 L64 74 Z" fill="#FBF0E3" stroke="#C4621A" strokeWidth="1.2" />
          <rect x="40" y="42" width="20" height="18" rx="4" fill="#ccfbf1" stroke="#14b8a6" strokeWidth="1" />
          <path d="M44 62 L54 72 L74 52" stroke="#10b981" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M20 26 L26 38 L22 40 L17 31 Z" fill="#E09A58" />
          <path d="M70 20 L73 29 L76 26 L71 21 Z" fill="#E09A58" />
        </>
      )

    case 'maintenance':
      return (
        <>
          <circle cx="50" cy="50" r="50" fill="#eef2ff" />
          <circle cx="50" cy="50" r="20" fill="none" stroke="#818cf8" strokeWidth="4" opacity="0.5" />
          <circle cx="50" cy="50" r="24" fill="none" stroke="#4338ca" strokeWidth="3" opacity="0.35" strokeDasharray="14 14" />
          {/* Wrench */}
          <path d="M34 66 L72 30" stroke="#4f46e5" strokeWidth="11" strokeLinecap="round" />
          <path d="M70 26 L76 22 L82 32 L74 38 Z" fill="#4338ca" />
          <circle cx="74" cy="68" r="14" stroke="#6366f1" strokeWidth="4" fill="#e0e7ff" />
        </>
      )

    case 'staff':
      return (
        <>
          <circle cx="50" cy="50" r="50" fill="#fafafa" />
          <rect x="30" y="36" width="40" height="44" rx="8" fill="#fef3c7" stroke="#c2410c" strokeWidth="1.5" />
          <rect x="36" y="44" width="28" height="18" rx="3" fill="#fafafa" stroke="#94a3b8" strokeWidth="0.75" />
          <ellipse cx="50" cy="30" rx="13" ry="15" fill="#fcd9bd" />
          <circle cx="50" cy="26" r="10" fill="#944A15" opacity="0.35" />
          <rect x="44" y="74" width="12" height="8" rx="2" fill="#0ea5e9" />
          <text x="46" y="80" fontSize="6" fill="#fff" fontWeight="800">
            ID
          </text>
        </>
      )

    case 'reviews':
      return (
        <>
          <circle cx="50" cy="50" r="50" fill="#fffbeb" />
          <path
            d="M26 74 C18 74 22 54 42 52 C62 50 74 62 74 74 C74 82 62 82 54 76 C48 92 42 94 42 94 C42 94 42 82 38 78 C34 74 34 74 26 74 Z"
            fill="#FBF0E3"
            stroke="#eab308"
            strokeWidth="1.5"
            opacity="0.95"
          />
          <polygon points="50,32 53,42 62,42 54,47 56,56 50,52 44,56 46,47 38,42 47,42" fill="#D4722A" stroke="#C4621A" strokeWidth="0.75" />
          <ellipse cx="50" cy="66" rx="18" ry="10" fill="none" stroke="#C4621A" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="44" cy="58" r="3" fill="#70370E" />
          <circle cx="56" cy="58" r="3" fill="#70370E" />
        </>
      )

    case 'conference':
      return (
        <>
          <circle cx="50" cy="50" r="50" fill="#f0f9ff" />
          <rect x="18" y="36" width="64" height="28" rx="3" fill="#dbeafe" stroke="#0284c7" strokeWidth="2" />
          <circle cx="50" cy="50" r="6" fill="#0ea5e9" opacity="0.25" />
          <rect x="28" y="66" width="44" height="10" rx="2" fill="#bae6fd" />
          <rect x="42" y="72" width="16" height="18" rx="4" fill="#fcd9bd" />
          <ellipse cx="50" cy="28" rx="10" ry="12" fill="#fcd9bd" />
          <ellipse cx="50" cy="92" rx="28" ry="8" fill="#93c5fd" opacity="0.55" />
        </>
      )

    case 'restaurants':
      return (
        <>
          <circle cx="50" cy="50" r="50" fill="#fff7ed" />
          <path d="M32 76c26-54 76-62 92-72-8 62-82 108-154 114 30-42 82-92 154-174l-92 62z" fill="#fed7aa" opacity="0.9" stroke="#ea580c" strokeWidth="1" />
          <ellipse cx="50" cy="40" rx="38" ry="26" fill="#E09A58" stroke="#C4621A" strokeWidth="2" opacity="0.95" />
          <ellipse cx="50" cy="54" rx="42" ry="26" fill="#E09A58" stroke="#944A15" strokeWidth="1.5" />
          <ellipse cx="50" cy="64" rx="14" ry="14" fill="#FBF0E3" stroke="#FBF0E3" />
          <path d="M36 74h28" stroke="#a16207" strokeWidth="2" opacity="0.5" strokeLinecap="round" />
        </>
      )

    case 'inventory':
      return (
        <>
          <circle cx="50" cy="50" r="50" fill="#eff6ff" />
          <rect x="22" y="58" width="22" height="22" rx="3" fill="#93c5fd" stroke="#1d4ed8" strokeWidth="1.2" opacity="0.95" />
          <rect x="36" y="48" width="22" height="30" rx="3" fill="#bfdbfe" stroke="#2563eb" strokeWidth="1.2" />
          <rect x="50" y="38" width="22" height="38" rx="3" fill="#dbeafe" stroke="#1e40af" strokeWidth="1.25" />
          <circle cx="50" cy="22" r="5" fill="#60a5fa" />
        </>
      )

    case 'loyalty':
      return (
        <>
          <circle cx="50" cy="50" r="50" fill="#faf5ff" />
          <path d="M50 22 L62 42 L82 42 L67 54 L72 74 L50 62 L28 74 L34 54 L18 42 L38 42 Z" fill="none" stroke="#c4b5fd" strokeWidth="2.75" opacity="0.9" />
          <path d="M50 28 L59 43 L74 43 L61 53 L66 69 L50 60 L34 69 L39 53 L26 43 L41 43 Z" fill="#E09A58" stroke="#D4722A" strokeWidth="1" />
          <circle cx="50" cy="48" r="9" fill="#FBF0E3" stroke="#C4621A" strokeWidth="1" />
          <polygon points="50,43 53,49 58,49 54,53 56,58 50,54 44,58 46,53 42,49 47,49" fill="#f59e0b" />
          <ellipse cx="50" cy="86" rx="22" ry="6" fill="#e9d5ff" opacity="0.85" />
        </>
      )

    default:
      return (
        <>
          <circle cx="50" cy="50" r="50" fill="#fafafa" />
          <circle cx="50" cy="50" r="28" stroke="#cbd5e1" strokeWidth="3" />
        </>
      )
  }
}

/** Illustrated page header mascot — mirrors Analytics styling; tint matches each module */
export function PagePurposeAvatar({
  variant,
  size = 40,
  className,
}: {
  variant: PagePurposeAvatarVariant
  size?: number
  className?: string
}) {
  return (
    <div
      style={{ width: size, height: size }}
      className={cn(
        'overflow-hidden rounded-xl border flex-shrink-0',
        FRAME[variant],
        className
      )}
      aria-hidden
    >
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <Illustration variant={variant} />
      </svg>
    </div>
  )
}
