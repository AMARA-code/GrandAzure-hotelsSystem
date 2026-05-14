'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, ChevronDown, LogOut, User, Loader2,
  ArrowLeft, Mail, Shield, RefreshCw, X,
  LayoutDashboard, CalendarCheck, BedDouble,
  Wrench, Sparkles, FileText, Settings,
  BarChart3, Users, Star, MessageSquare,
  Receipt, Package, UserSquare2, Building2,
  UtensilsCrossed, CheckCheck, ShoppingBag,
  BookOpen,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import BrandMark from '@/components/guest-portal/BrandMark'
import { formatDistanceToNow } from 'date-fns'

/* ─────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────── */
interface TopbarProps {
  onMenuClick: () => void
}

interface LiveStats {
  arrivalsToday: number
  departuresToday: number
  occupiedRooms: number
  totalRooms: number
  pendingHousekeeping: number
  revenue: number
  confirmedBookings: number
}

interface TickerItem {
  label: string
  value: string
  accent: string
}

interface CurrentUser {
  firstName: string
  lastName: string
  fullName: string
  email: string
  roleName: string
  initials: string
}

interface Notification {
  notification_id: number
  type: 'review' | 'booking' | 'order'
  title: string
  message: string
  link: string
  is_read: boolean
  created_at: string
}

type DropdownView = 'main' | 'profile'

/* ─────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────── */
function cap(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : ''
}
function initials(first: string, last: string) {
  return (cap(first).charAt(0) + cap(last).charAt(0)).toUpperCase()
}

function notifIcon(type: Notification['type']) {
  if (type === 'review')  return <Star className="w-3.5 h-3.5 text-amber-500" />
  if (type === 'booking') return <CalendarCheck className="w-3.5 h-3.5 text-blue-500" />
  if (type === 'order')   return <ShoppingBag className="w-3.5 h-3.5 text-emerald-500" />
  return <Bell className="w-3.5 h-3.5 text-slate-400" />
}

function notifBg(type: Notification['type']) {
  if (type === 'review')  return 'bg-amber-50 border-amber-100'
  if (type === 'booking') return 'bg-blue-50 border-blue-100'
  if (type === 'order')   return 'bg-emerald-50 border-emerald-100'
  return 'bg-slate-50 border-slate-100'
}

/* ─────────────────────────────────────────────────────────────
   PremiumAvatar
───────────────────────────────────────────────────────────── */
interface PremiumAvatarProps {
  size?: number
  rounded?: 'full' | 'md' | 'lg' | 'xl'
  className?: string
  style?: React.CSSProperties
}

function PremiumAvatar({ size = 28, rounded = 'full', className, style }: PremiumAvatarProps) {
  const s   = size
  const cx  = s / 2
  const cy  = s / 2
  const r   = cx - 0.5

  const radiiMap = { full: r, md: s * 0.22, lg: s * 0.28, xl: s * 0.34 }
  const clipR    = radiiMap[rounded]
  const uid = `av-${s}-${rounded}`

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} className={className} style={style} aria-hidden="true">
      <defs>
        <clipPath id={uid}>
          {rounded === 'full'
            ? <circle cx={cx} cy={cy} r={r} />
            : <rect x={0} y={0} width={s} height={s} rx={clipR} />}
        </clipPath>
      </defs>
      <rect x={0} y={0} width={s} height={s} fill="#F5C9A8" clipPath={`url(#${uid})`} />
      <ellipse cx={cx} cy={s * 1.06} rx={s * 0.40} ry={s * 0.26} fill="#C4621A" clipPath={`url(#${uid})`} />
      <path d={`M${cx - s*0.145} ${s*0.745}L${cx} ${s*0.875}L${cx+s*0.145} ${s*0.745}L${cx+s*0.115} ${s*0.67}L${cx} ${s*0.75}L${cx-s*0.115} ${s*0.67}Z`} fill="white" opacity={0.92} clipPath={`url(#${uid})`} />
      <rect x={cx-s*0.10} y={s*0.575} width={s*0.20} height={s*0.22} rx={s*0.10} fill="#E8A87C" clipPath={`url(#${uid})`} />
      <ellipse cx={cx} cy={s*0.435} rx={s*0.305} ry={s*0.325} fill="#F0B080" clipPath={`url(#${uid})`} />
      <path d={`M${cx-s*0.305} ${s*0.41}Q${cx-s*0.305} ${s*0.10} ${cx} ${s*0.10}Q${cx+s*0.305} ${s*0.10} ${cx+s*0.305} ${s*0.41}Q${cx+s*0.245} ${s*0.235} ${cx} ${s*0.235}Q${cx-s*0.245} ${s*0.235} ${cx-s*0.305} ${s*0.41}Z`} fill="#5C3A1A" clipPath={`url(#${uid})`} />
      <ellipse cx={cx-s*0.305} cy={s*0.45} rx={s*0.052} ry={s*0.082} fill="#E8A87C" clipPath={`url(#${uid})`} />
      <ellipse cx={cx+s*0.305} cy={s*0.45} rx={s*0.052} ry={s*0.082} fill="#E8A87C" clipPath={`url(#${uid})`} />
      <ellipse cx={cx-s*0.11} cy={s*0.445} rx={s*0.065} ry={s*0.062} fill="white" clipPath={`url(#${uid})`} />
      <ellipse cx={cx-s*0.11} cy={s*0.447} rx={s*0.042} ry={s*0.042} fill="#3D2008" clipPath={`url(#${uid})`} />
      <circle cx={cx-s*0.088} cy={s*0.428} r={s*0.014} fill="white" clipPath={`url(#${uid})`} />
      <ellipse cx={cx+s*0.11} cy={s*0.445} rx={s*0.065} ry={s*0.062} fill="white" clipPath={`url(#${uid})`} />
      <ellipse cx={cx+s*0.11} cy={s*0.447} rx={s*0.042} ry={s*0.042} fill="#3D2008" clipPath={`url(#${uid})`} />
      <circle cx={cx+s*0.132} cy={s*0.428} r={s*0.014} fill="white" clipPath={`url(#${uid})`} />
      <path d={`M${cx-s*0.175} ${s*0.375}Q${cx-s*0.11} ${s*0.345}${cx-s*0.045} ${s*0.375}`} stroke="#5C3A1A" strokeWidth={s*0.038} fill="none" strokeLinecap="round" clipPath={`url(#${uid})`} />
      <path d={`M${cx+s*0.045} ${s*0.375}Q${cx+s*0.11} ${s*0.345}${cx+s*0.175} ${s*0.375}`} stroke="#5C3A1A" strokeWidth={s*0.038} fill="none" strokeLinecap="round" clipPath={`url(#${uid})`} />
      <ellipse cx={cx} cy={s*0.535} rx={s*0.04} ry={s*0.026} fill="#D4895C" opacity={0.45} clipPath={`url(#${uid})`} />
      <path d={`M${cx-s*0.125} ${s*0.585}Q${cx} ${s*0.635}${cx+s*0.125} ${s*0.585}`} stroke="#C06040" strokeWidth={s*0.030} fill="none" strokeLinecap="round" clipPath={`url(#${uid})`} />
      <ellipse cx={cx-s*0.22} cy={s*0.52} rx={s*0.07} ry={s*0.045} fill="#E87050" opacity={0.13} clipPath={`url(#${uid})`} />
      <ellipse cx={cx+s*0.22} cy={s*0.52} rx={s*0.07} ry={s*0.045} fill="#E87050" opacity={0.13} clipPath={`url(#${uid})`} />
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────────
   MobileTicker
───────────────────────────────────────────────────────────── */
function MobileTicker({ items }: { items: TickerItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const styleRef = useRef<HTMLStyleElement | null>(null)

  useEffect(() => {
    const el = trackRef.current
    if (!el || items.length === 0) return
    if (!styleRef.current) {
      const s = document.createElement('style')
      document.head.appendChild(s)
      styleRef.current = s
    }
    requestAnimationFrame(() => {
      const halfWidth = el.scrollWidth / 2
      const duration  = Math.max(16, halfWidth / 45)
      styleRef.current!.textContent = `
        @keyframes mob-ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-${halfWidth}px); } }
        .mob-ticker-track { animation: mob-ticker ${duration}s linear infinite; will-change: transform; }
        .mob-ticker-track:hover { animation-play-state: paused; }
      `
    })
    return () => { styleRef.current?.remove(); styleRef.current = null }
  }, [items])

  const doubled = [...items, ...items]

  return (
    <div ref={trackRef} className="mob-ticker-track h-full flex items-center whitespace-nowrap" style={{ width: 'max-content' }}>
      {doubled.map((item, i) => (
        <div key={i} className="flex items-center flex-shrink-0">
          <div className="flex items-center gap-[3px] px-2.5">
            <span className="font-bold uppercase text-[#9a7558]" style={{ fontSize: '9.5px', letterSpacing: '0.1em' }}>{item.label}</span>
            <span style={{ fontSize: '8px', color: '#d0b49a' }}>·</span>
            <span className={`font-extrabold tabular-nums ${item.accent}`} style={{ fontSize: '11px' }}>{item.value}</span>
          </div>
          <div className="w-px h-3 bg-[#eedcc8] flex-shrink-0" />
        </div>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   NAV_ITEMS
───────────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { label: 'Dashboard',    icon: LayoutDashboard,  route: '/dashboard'    },
  { label: 'Analytics',    icon: BarChart3,        route: '/analytics'    },
  { label: 'Bookings',     icon: CalendarCheck,    route: '/bookings'     },
  { label: 'Rooms',        icon: BedDouble,        route: '/rooms'        },
  { label: 'Housekeeping', icon: Sparkles,         route: '/housekeeping' },
  { label: 'Maintenance',  icon: Wrench,           route: '/maintenance'  },
  { label: 'Restaurants',  icon: UtensilsCrossed,  route: '/restaurants'  },
  { label: 'Guests',       icon: Users,            route: '/guests'       },
  { label: 'Loyalty',      icon: Star,             route: '/loyalty'      },
  { label: 'Reviews',      icon: MessageSquare,    route: '/reviews'      },
  { label: 'Finance',      icon: Receipt,          route: '/finance'      },
  { label: 'Inventory',    icon: Package,          route: '/inventory'    },
  { label: 'Staff',        icon: UserSquare2,      route: '/staff'        },
  { label: 'Conference',   icon: Building2,        route: '/conference'   },
]

/* ─────────────────────────────────────────────────────────────
   NotificationPanel — shared between desktop + mobile
───────────────────────────────────────────────────────────── */
function NotificationPanel({
  notifications,
  onDismiss,
  onDismissAll,
  onNavigate,
}: {
  notifications: Notification[]
  onDismiss: (id: number) => void
  onDismissAll: () => void
  onNavigate: (link: string) => void
}) {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2 text-center px-4">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
          <Bell className="w-4 h-4 text-slate-400" />
        </div>
        <p className="text-sm font-medium text-slate-600">All caught up!</p>
        <p className="text-xs text-slate-400">No new notifications from the guest portal.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/80">
        <div>
          <p className="text-sm font-semibold text-foreground">Notifications</p>
          <p className="text-[10px] text-muted-foreground">{notifications.length} unread</p>
        </div>
        <button
          onClick={onDismissAll}
          className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-muted"
        >
          <CheckCheck className="w-3 h-3" />
          Mark all read
        </button>
      </div>

      {/* list */}
      <div className="overflow-y-auto max-h-72 p-1.5 space-y-1">
        <AnimatePresence initial={false}>
          {notifications.map((n) => (
            <motion.div
              key={n.notification_id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12, height: 0, marginBottom: 0, padding: 0 }}
              transition={{ duration: 0.18 }}
              className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer group ${notifBg(n.type)}`}
              onClick={() => onNavigate(n.link)}
            >
              {/* icon */}
              <div className="w-7 h-7 rounded-lg bg-white/80 border border-white/60 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                {notifIcon(n.type)}
              </div>

              {/* content */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 leading-tight">{n.title}</p>
                <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{n.message}</p>
                <p className="text-[10px] text-slate-400 mt-1">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                </p>
              </div>

              {/* dismiss */}
              <button
                onClick={(e) => { e.stopPropagation(); onDismiss(n.notification_id) }}
                className="w-5 h-5 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-white/60 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   MobileDrawer
───────────────────────────────────────────────────────────── */
interface MobileDrawerProps {
  open: boolean
  onClose: () => void
  currentUser: CurrentUser | null
  stats: LiveStats | null
  notifications: Notification[]
  onDismiss: (id: number) => void
  onDismissAll: () => void
  onLogout: () => void
  onSwitchAccount: () => void
}

function MobileDrawer({
  open, onClose, currentUser, stats,
  notifications, onDismiss, onDismissAll,
  onLogout, onSwitchAccount,
}: MobileDrawerProps) {
  const router = useRouter()
  const [drawerView, setDrawerView] = useState<'main' | 'profile' | 'notifications'>('main')
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!open) {
      resetTimerRef.current = setTimeout(() => setDrawerView('main'), 350)
    } else {
      if (resetTimerRef.current) { clearTimeout(resetTimerRef.current); resetTimerRef.current = null }
    }
    return () => { if (resetTimerRef.current) clearTimeout(resetTimerRef.current) }
  }, [open])

  const displayName  = currentUser?.fullName ?? '—'
  const displayEmail = currentUser?.email   ?? '—'
  const displayRole  = currentUser?.roleName ?? '—'

  const navigate = (route: string) => { onClose(); router.push(route) }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden rounded-t-2xl overflow-hidden"
            style={{ background: '#fffaf5', borderTop: '1px solid #eedcc8', maxHeight: '88dvh' }}
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
          >
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-[#e0ccb5]" />
            </div>

            {/* ── MAIN VIEW ── */}
            {drawerView === 'main' && (
              <div className="flex flex-col" style={{ maxHeight: 'calc(88dvh - 24px)' }}>
                <button
                  onClick={() => setDrawerView('profile')}
                  className="flex items-center gap-3 px-5 py-4 border-b border-[#eedcc8] hover:bg-[#fdf4ea] transition-colors text-left w-full flex-shrink-0"
                >
                  <div className="flex-shrink-0 rounded-xl overflow-hidden" style={{ width: 44, height: 44, border: '1.5px solid #F3DCC0', boxShadow: '0 2px 8px rgba(212,114,42,0.10)', background: '#FDF8F2' }}>
                    <PremiumAvatar size={44} rounded="full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#3d2008] truncate">{displayName}</p>
                    <p className="text-xs text-[#9a7558] truncate">{displayEmail}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Active
                    </span>
                    <ChevronDown className="w-4 h-4 text-[#c4a882] rotate-[-90deg]" />
                  </div>
                </button>

                {/* bell */}
                <button
                  onClick={() => setDrawerView('notifications')}
                  className="flex items-center gap-3 px-5 py-3.5 border-b border-[#eedcc8] hover:bg-[#fdf4ea] transition-colors text-left w-full flex-shrink-0"
                >
                  <div className="relative">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#FDF8F2] border border-[#F3DCC0]">
                      <Bell className="w-4 h-4 text-[#944A15]" />
                    </div>
                    {notifications.length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full bg-rose-500 border border-white flex items-center justify-center text-[9px] font-bold text-white px-0.5">
                        {notifications.length > 9 ? '9+' : notifications.length}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#3d2008]">Notifications</p>
                    <p className="text-xs text-[#9a7558]">
                      {notifications.length === 0 ? 'All caught up' : `${notifications.length} unread from guests`}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-[#c4a882] rotate-[-90deg]" />
                </button>

                <div className="flex-1 overflow-y-auto min-h-0">
                  <div className="px-3 py-2.5 space-y-0.5">
                    {NAV_ITEMS.map(({ label, icon: Icon, route }) => (
                      <button key={route} onClick={() => navigate(route)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-[#5c3d1e] hover:bg-[#fdebd5] transition-colors font-medium"
                      >
                        <Icon className="w-4 h-4 text-[#b87340] flex-shrink-0" />{label}
                      </button>
                    ))}
                  </div>
                  <div className="px-3 py-2 border-t border-[#eedcc8] space-y-0.5 pb-8">
                    <button onClick={() => { onClose(); onSwitchAccount() }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-[#5c3d1e] hover:bg-[#fdebd5] transition-colors font-medium"
                    >
                      <RefreshCw className="w-4 h-4 text-[#b87340] flex-shrink-0" />Switch Account
                    </button>
                    <button onClick={() => { onClose(); onLogout() }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-rose-600 hover:bg-rose-50 transition-colors font-medium"
                    >
                      <LogOut className="w-4 h-4 flex-shrink-0" />Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── PROFILE VIEW ── */}
            {drawerView === 'profile' && (
              <div className="flex flex-col overflow-y-auto" style={{ maxHeight: 'calc(88dvh - 24px)' }}>
                <div className="flex items-center gap-2 px-4 py-3.5 border-b border-[#eedcc8]">
                  <button onClick={() => setDrawerView('main')} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9a7558] hover:bg-[#fdebd5] transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <p className="text-sm font-semibold text-[#3d2008]">My Profile</p>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 rounded-2xl overflow-hidden" style={{ width: 56, height: 56, border: '2px solid #F3DCC0', boxShadow: '0 4px 16px rgba(212,114,42,0.12)', background: '#FDF8F2' }}>
                      <PremiumAvatar size={56} rounded="full" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-[#3d2008]">{displayName}</p>
                      <p className="text-xs text-[#9a7558] mt-0.5">{displayRole}</p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#eedcc8] bg-[#fdf7f0] divide-y divide-[#eedcc8] overflow-hidden">
                    <div className="flex items-start gap-3 px-4 py-3">
                      <Mail className="w-4 h-4 text-[#b87340] flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-[10px] text-[#b08060] uppercase tracking-wide font-semibold">Email</p>
                        <p className="text-sm font-medium text-[#3d2008] break-all">{displayEmail}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 px-4 py-3">
                      <Shield className="w-4 h-4 text-[#b87340] flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-[10px] text-[#b08060] uppercase tracking-wide font-semibold">Role</p>
                        <p className="text-sm font-medium text-[#3d2008]">{displayRole}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                    <p className="text-xs font-semibold text-emerald-700">Active session</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── NOTIFICATIONS VIEW ── */}
            {drawerView === 'notifications' && (
              <div className="flex flex-col overflow-y-auto" style={{ maxHeight: 'calc(88dvh - 24px)' }}>
                <div className="flex items-center gap-2 px-4 py-3.5 border-b border-[#eedcc8]">
                  <button onClick={() => setDrawerView('main')} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9a7558] hover:bg-[#fdebd5] transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#3d2008]">Notifications</p>
                    <p className="text-[10px] text-[#9a7558]">Guest portal activity</p>
                  </div>
                  {notifications.length > 0 && (
                    <button onClick={onDismissAll} className="text-[10px] font-semibold text-[#9a7558] hover:text-[#3d2008] flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-[#fdebd5] transition-colors">
                      <CheckCheck className="w-3 h-3" />Mark all read
                    </button>
                  )}
                </div>
                <div className="p-3 pb-8">
                  <NotificationPanel
                    notifications={notifications}
                    onDismiss={onDismiss}
                    onDismissAll={onDismissAll}
                    onNavigate={(link) => { onClose(); router.push(link) }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/* ─────────────────────────────────────────────────────────────
   Topbar (main export)
───────────────────────────────────────────────────────────── */
export default function Topbar({ onMenuClick }: TopbarProps) {
  const router = useRouter()

  const [userDropdown, setUserDropdown] = useState(false)
  const [dropdownView, setDropdownView] = useState<DropdownView>('main')
  const [notifOpen, setNotifOpen]       = useState(false)
  const [mobileDrawer, setMobileDrawer] = useState(false)

  const [stats, setStats]               = useState<LiveStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const [currentUser, setCurrentUser]   = useState<CurrentUser | null>(null)

  // ── Notifications state ──
  const [notifications, setNotifications] = useState<Notification[]>([])

  const userDropdownRef  = useRef<HTMLDivElement>(null)
  const notifDropdownRef = useRef<HTMLDivElement>(null)

  /* ── fetch current user ── */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = createClient()
        const { data: { user }, error: authErr } = await supabase.auth.getUser()
        if (authErr || !user?.email) return

        const { data, error } = await supabase
          .from('staff')
          .select('first_name, last_name, email, staff_roles ( role_name )')
          .eq('email', user.email)
          .eq('is_deleted', false)
          .eq('is_active', true)
          .single()

        if (error || !data) {
          const meta = user.user_metadata ?? {}
          const full = meta.full_name ?? [meta.first_name, meta.last_name].filter(Boolean).join(' ') ?? user.email.split('@')[0] ?? 'User'
          const [f = '', ...rest] = full.split(' ')
          const l = rest.join(' ')
          setCurrentUser({ firstName: cap(f), lastName: cap(l), fullName: full.trim(), email: user.email, roleName: 'Staff', initials: initials(f, l || f) })
          return
        }

        const first   = data.first_name ?? ''
        const last    = data.last_name  ?? ''
        const roleRow = Array.isArray(data.staff_roles) ? data.staff_roles[0] : (data.staff_roles as any)
        const roleName = roleRow?.role_name ?? 'Staff'
        setCurrentUser({ firstName: cap(first), lastName: cap(last), fullName: `${cap(first)} ${cap(last)}`.trim(), email: data.email, roleName, initials: initials(first, last) })
      } catch { /* silently keep null */ }
    }
    fetchUser()
  }, [])

  /* ── fetch live stats ── */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const supabase = createClient()
        const today = new Date().toISOString().split('T')[0]

        const [arrivalsRes, departuresRes, roomsRes, hkRes, revenueRes, confirmedRes] = await Promise.all([
          supabase.from('bookings').select('booking_id', { count: 'exact', head: true }).eq('check_in_date', today).eq('booking_status', 'confirmed'),
          supabase.from('bookings').select('booking_id', { count: 'exact', head: true }).eq('check_out_date', today).eq('booking_status', 'checked_in'),
          supabase.from('rooms').select('room_id, status').eq('is_deleted', false),
          supabase.from('housekeeping_schedules').select('schedule_id', { count: 'exact', head: true }).eq('status', 'scheduled'),
          supabase.from('invoices').select('total_amount').eq('status', 'paid'),
          supabase.from('bookings').select('booking_id', { count: 'exact', head: true }).eq('booking_status', 'confirmed').eq('is_deleted', false),
        ])

        const totalRooms    = roomsRes.data?.length ?? 180
        const occupiedRooms = roomsRes.data?.filter((r: any) => r.status === 'occupied').length ?? 0
        const revenue       = revenueRes.data?.reduce((s: number, i: any) => s + (Number(i.total_amount) ?? 0), 0) ?? 0

        setStats({
          arrivalsToday:       arrivalsRes.count   ?? 0,
          departuresToday:     departuresRes.count ?? 0,
          occupiedRooms, totalRooms,
          pendingHousekeeping: hkRes.count         ?? 0,
          revenue,
          confirmedBookings:   confirmedRes.count  ?? 0,
        })
      } catch { /* keep previous */ } finally { setLoadingStats(false) }
    }

    fetchStats()
    const iv = setInterval(fetchStats, 60_000)
    return () => clearInterval(iv)
  }, [])

  /* ── fetch notifications ── */
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('notifications')
          .select('*')
          .eq('is_read', false)
          .order('created_at', { ascending: false })
          .limit(20)
        if (data) setNotifications(data as Notification[])
      } catch { /* silently ignore */ }
    }

    fetchNotifications()

    // Realtime subscription — new notifications arrive instantly
    const supabase = createClient()
    const channel = supabase
      .channel('notifications-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        setNotifications((prev) => [payload.new as Notification, ...prev])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  /* ── dismiss one ── */
  const handleDismiss = async (id: number) => {
    // Optimistic update
    setNotifications((prev) => prev.filter((n) => n.notification_id !== id))
    try {
      const supabase = createClient()
      await supabase.from('notifications').update({ is_read: true }).eq('notification_id', id)
    } catch { /* silently ignore */ }
  }

  /* ── dismiss all ── */
  const handleDismissAll = async () => {
    const ids = notifications.map((n) => n.notification_id)
    setNotifications([])
    try {
      const supabase = createClient()
      await supabase.from('notifications').update({ is_read: true }).in('notification_id', ids)
    } catch { /* silently ignore */ }
  }

  /* ── click-outside for desktop dropdowns ── */
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setUserDropdown(false); setDropdownView('main')
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target as Node))
        setNotifOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  /* ── lock body scroll ── */
  useEffect(() => {
    document.body.style.overflow = mobileDrawer ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileDrawer])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Signed out successfully')
    router.push('/login')
    router.refresh()
  }

  const handleSwitchAccount = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const closeUserDropdown = () => { setUserDropdown(false); setDropdownView('main') }

  const displayName  = currentUser?.fullName  ?? '—'
  const displayEmail = currentUser?.email     ?? '—'
  const displayRole  = currentUser?.roleName  ?? '—'
  const occupancyPct = stats ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100) : 0

  const tickerItems: TickerItem[] = stats ? [
    { label: 'Occupancy',    value: `${occupancyPct}%`,                                accent: occupancyPct >= 80 ? 'text-emerald-600' : occupancyPct >= 50 ? 'text-amber-500' : 'text-rose-500' },
    { label: 'Rooms',        value: `${stats.occupiedRooms} / ${stats.totalRooms}`,    accent: 'text-violet-600'  },
    { label: 'Bookings',     value: String(stats.confirmedBookings),                   accent: 'text-emerald-600' },
    { label: 'Housekeeping', value: String(stats.pendingHousekeeping),                 accent: 'text-amber-500'   },
    { label: 'Revenue',      value: `PKR ${(stats.revenue / 1_000_000).toFixed(1)}M`, accent: 'text-violet-600'  },
    { label: 'Arrivals',     value: String(stats.arrivalsToday),                       accent: 'text-sky-600'     },
    { label: 'Departures',   value: String(stats.departuresToday),                     accent: 'text-rose-500'    },
  ] : []

  const loopItems = [...tickerItems, ...tickerItems, ...tickerItems]
  const unreadCount = notifications.length

  return (
    <>
      <div className="h-14 flex-shrink-0" aria-hidden="true" />

      <header className="h-14 bg-white/95 dark:bg-card/95 border-b border-border fixed top-0 left-0 right-0 z-50 backdrop-blur-md shadow-sm">
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[2px] pointer-events-none z-20"
          style={{ background: 'linear-gradient(90deg, #D4722A, #E09A58, #C4621A, #D4722A, #F5C9A8, #D4722A)', backgroundSize: '400% 100%' }}
          animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />

        <div className="flex items-center h-full gap-2 px-4">

          {/* ── LEFT: brand ── */}
          <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
            <button onClick={() => setMobileDrawer(true)} className="md:hidden flex items-center rounded-xl focus:outline-none" aria-label="Open menu">
              <BrandMark compact />
            </button>
            <button onClick={onMenuClick} className="hidden md:flex items-center rounded-xl focus:outline-none" aria-label="Toggle sidebar">
              <BrandMark />
            </button>
          </div>

          {/* ── CENTER: desktop ticker ── */}
          <div className="hidden md:flex flex-1 justify-center min-w-0">
            <div className="relative flex items-center h-8 rounded-full border border-border bg-muted overflow-hidden" style={{ width: '820px', maxWidth: '100%' }}>
              <div className="absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none rounded-l-full" style={{ background: 'linear-gradient(to right, hsl(var(--muted)), transparent)' }} />
              <div className="absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none rounded-r-full" style={{ background: 'linear-gradient(to left, hsl(var(--muted)), transparent)' }} />
              {loadingStats ? (
                <div className="flex items-center gap-2 px-4">
                  <Loader2 className="w-3 h-3 animate-spin text-muted-foreground/60" />
                  <span className="text-[10px] text-muted-foreground/60 tracking-widest uppercase">Loading...</span>
                </div>
              ) : (
                <motion.div
                  className="flex items-center whitespace-nowrap will-change-transform"
                  animate={{ x: ['0%', '-33.333%'] }}
                  transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                >
                  {loopItems.map((item, i) => (
                    <div key={i} className="flex items-center flex-shrink-0">
                      <div className="flex items-center gap-1.5 px-3">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/80">{item.label}</span>
                        <span className="text-muted-foreground/50 text-[9px]">·</span>
                        <span className={`text-[11px] font-bold tabular-nums ${item.accent}`}>{item.value}</span>
                      </div>
                      <div className="w-px h-3 bg-border flex-shrink-0" />
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>

          {/* ── CENTER: mobile ticker ── */}
          <div className="md:hidden flex-1 min-w-0">
            <div className="relative mx-1 h-[30px] rounded-full overflow-hidden" style={{ border: '1px solid #eedcc8', background: '#fdf7f0' }}>
              <div className="absolute left-0 top-0 bottom-0 w-7 z-10 pointer-events-none rounded-l-full" style={{ background: 'linear-gradient(to right, #fdf7f0 50%, transparent)' }} />
              <div className="absolute right-0 top-0 bottom-0 w-7 z-10 pointer-events-none rounded-r-full" style={{ background: 'linear-gradient(to left, #fdf7f0 50%, transparent)' }} />
              {loadingStats ? (
                <div className="h-full flex items-center gap-1.5 px-4">
                  <Loader2 className="w-3 h-3 animate-spin text-[#c4a882]" />
                  <span className="font-bold uppercase text-[#c4a882] tracking-widest" style={{ fontSize: '9px' }}>Loading...</span>
                </div>
              ) : (
                <MobileTicker items={tickerItems} />
              )}
            </div>
          </div>

          {/* ── RIGHT: desktop bell + user ── */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">

            {/* Bell */}
            <div ref={notifDropdownRef} className="relative">
              <button
                onClick={() => setNotifOpen((p) => !p)}
                className="relative w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-all"
              >
                <Bell className="w-3.5 h-3.5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-rose-500 ring-1 ring-white flex items-center justify-center text-[9px] font-bold text-white px-0.5">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-card rounded-xl border border-border shadow-lg overflow-hidden z-50"
                  >
                    <NotificationPanel
                      notifications={notifications}
                      onDismiss={handleDismiss}
                      onDismissAll={handleDismissAll}
                      onNavigate={(link) => { setNotifOpen(false); router.push(link) }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User button */}
            <div ref={userDropdownRef} className="relative">
              <button
                onClick={() => { setUserDropdown(!userDropdown); setDropdownView('main') }}
                className="flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-lg border border-[#e9dac9] bg-gradient-to-r from-[#fff9f2] to-[#fdf4ea] hover:opacity-90 transition-all"
              >
                <div className="rounded-md overflow-hidden flex-shrink-0" style={{ width: 28, height: 28, border: '1.5px solid #F3DCC0', background: '#FDF8F2' }}>
                  <PremiumAvatar size={28} rounded="md" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-[11px] font-semibold text-foreground leading-tight truncate max-w-[88px]">{currentUser?.firstName ?? '—'}</p>
                  <p className="text-[10px] text-muted-foreground/80 leading-tight truncate max-w-[88px]">{displayRole}</p>
                </div>
                <ChevronDown className="w-3 h-3 text-muted-foreground/80" />
              </button>

              <AnimatePresence>
                {userDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 mt-2 w-52 bg-white dark:bg-card rounded-xl border border-border shadow-lg overflow-hidden z-50"
                  >
                    {dropdownView === 'main' && (
                      <>
                        <div className="p-3 border-b border-border/80">
                          <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
                          <p className="text-xs text-muted-foreground/80 truncate">{displayEmail}</p>
                        </div>
                        <div className="p-1.5 space-y-0.5">
                          <button onClick={() => setDropdownView('profile')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors">
                            <User className="w-4 h-4 text-muted-foreground/80 flex-shrink-0" />My Profile
                          </button>
                          <button onClick={() => { closeUserDropdown(); handleSwitchAccount() }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors">
                            <RefreshCw className="w-4 h-4 text-muted-foreground/80 flex-shrink-0" />Switch Account
                          </button>
                          <div className="border-t border-border/80 mt-1 pt-1">
                            <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors">
                              <LogOut className="w-4 h-4 flex-shrink-0" />Sign Out
                            </button>
                          </div>
                        </div>
                      </>
                    )}

                    {dropdownView === 'profile' && (
                      <>
                        <div className="flex items-center gap-2 p-3 border-b border-border/80">
                          <button onClick={() => setDropdownView('main')} className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors flex-shrink-0">
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>
                          <p className="text-sm font-semibold text-foreground">My Profile</p>
                        </div>
                        <div className="p-3 space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 rounded-xl overflow-hidden" style={{ width: 44, height: 44, border: '1.5px solid #F3DCC0', boxShadow: '0 2px 8px rgba(212,114,42,0.1)', background: '#FDF8F2' }}>
                              <PremiumAvatar size={44} rounded="full" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground leading-tight truncate">{displayName}</p>
                              <p className="text-[11px] text-muted-foreground leading-tight">{displayRole}</p>
                            </div>
                          </div>
                          <div className="rounded-lg border border-border/80 bg-muted/40 divide-y divide-border/60 overflow-hidden">
                            <div className="flex items-start gap-2.5 px-3 py-2">
                              <Mail className="w-3.5 h-3.5 text-muted-foreground/60 flex-shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wide font-medium">Email</p>
                                <p className="text-xs font-medium text-foreground break-all">{displayEmail}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2.5 px-3 py-2">
                              <Shield className="w-3.5 h-3.5 text-muted-foreground/60 flex-shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wide font-medium">Role</p>
                                <p className="text-xs font-medium text-foreground">{displayRole}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 animate-pulse" />
                            <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">Active session</p>
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </header>

      {/* ── MOBILE DRAWER ── */}
      <MobileDrawer
        open={mobileDrawer}
        onClose={() => setMobileDrawer(false)}
        currentUser={currentUser}
        stats={stats}
        notifications={notifications}
        onDismiss={handleDismiss}
        onDismissAll={handleDismissAll}
        onLogout={handleLogout}
        onSwitchAccount={handleSwitchAccount}
      />
    </>
  )
}