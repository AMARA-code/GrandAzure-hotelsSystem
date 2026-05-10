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
  UtensilsCrossed,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import BrandMark from '@/components/guest-portal/BrandMark'

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
        @keyframes mob-ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-${halfWidth}px); }
        }
        .mob-ticker-track {
          animation: mob-ticker ${duration}s linear infinite;
          will-change: transform;
        }
        .mob-ticker-track:hover {
          animation-play-state: paused;
        }
      `
    })

    return () => {
      styleRef.current?.remove()
      styleRef.current = null
    }
  }, [items])

  const doubled = [...items, ...items]

  return (
    <div
      ref={trackRef}
      className="mob-ticker-track h-full flex items-center whitespace-nowrap"
      style={{ width: 'max-content' }}
    >
      {doubled.map((item, i) => (
        <div key={i} className="flex items-center flex-shrink-0">
          <div className="flex items-center gap-[3px] px-2.5">
            <span
              className="font-bold uppercase text-[#9a7558]"
              style={{ fontSize: '9.5px', letterSpacing: '0.1em' }}
            >
              {item.label}
            </span>
            <span style={{ fontSize: '8px', color: '#d0b49a' }}>·</span>
            <span
              className={`font-extrabold tabular-nums ${item.accent}`}
              style={{ fontSize: '11px' }}
            >
              {item.value}
            </span>
          </div>
          <div className="w-px h-3 bg-[#eedcc8] flex-shrink-0" />
        </div>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   NAV_ITEMS — matches navigation constants exactly
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
   MobileDrawer
───────────────────────────────────────────────────────────── */
interface MobileDrawerProps {
  open: boolean
  onClose: () => void
  currentUser: CurrentUser | null
  stats: LiveStats | null
  onLogout: () => void
  onSwitchAccount: () => void
}

function MobileDrawer({
  open, onClose, currentUser, stats, onLogout, onSwitchAccount,
}: MobileDrawerProps) {
  const router = useRouter()
  const [drawerView, setDrawerView] = useState<'main' | 'profile' | 'notifications'>('main')
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!open) {
      resetTimerRef.current = setTimeout(() => setDrawerView('main'), 350)
    } else {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current)
        resetTimerRef.current = null
      }
    }
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
    }
  }, [open])

  const displayName     = currentUser?.fullName  ?? '—'
  const displayEmail    = currentUser?.email     ?? '—'
  const displayRole     = currentUser?.roleName  ?? '—'
  const displayInitials = currentUser?.initials  ?? '?'

  const notifItems = stats ? [
    { label: 'Arrivals Today',       value: String(stats.arrivalsToday),      route: '/bookings',     color: 'text-sky-600'     },
    { label: 'Pending Housekeeping', value: String(stats.pendingHousekeeping), route: '/housekeeping', color: 'text-amber-500'   },
    { label: 'Open Maintenance',     value: String(stats.pendingHousekeeping), route: '/maintenance',  color: 'text-rose-500'    },
    { label: 'Confirmed Bookings',   value: String(stats.confirmedBookings),   route: '/bookings',     color: 'text-emerald-600' },
  ] : []

  const navigate = (route: string) => {
    onClose()
    router.push(route)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden rounded-t-2xl overflow-hidden"
            style={{
              background: '#fffaf5',
              borderTop: '1px solid #eedcc8',
              maxHeight: '88dvh',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
          >
            {/* drag handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-[#e0ccb5]" />
            </div>

            {/* ── MAIN VIEW ── */}
            {drawerView === 'main' && (
              <div className="flex flex-col" style={{ maxHeight: 'calc(88dvh - 24px)' }}>

                {/* profile strip — fixed */}
                <button
                  onClick={() => setDrawerView('profile')}
                  className="flex items-center gap-3 px-5 py-4 border-b border-[#eedcc8] hover:bg-[#fdf4ea] transition-colors text-left w-full flex-shrink-0"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: '#FDF8F2', border: '1.5px solid #F3DCC0', boxShadow: '0 2px 8px rgba(212,114,42,0.10)' }}
                  >
                    <span className="font-bold text-sm leading-none" style={{ color: '#944A15' }}>
                      {displayInitials}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#3d2008] truncate">{displayName}</p>
                    <p className="text-xs text-[#9a7558] truncate">{displayEmail}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </span>
                    <ChevronDown className="w-4 h-4 text-[#c4a882] rotate-[-90deg]" />
                  </div>
                </button>

                {/* bell / notifications — fixed */}
                <button
                  onClick={() => setDrawerView('notifications')}
                  className="flex items-center gap-3 px-5 py-3.5 border-b border-[#eedcc8] hover:bg-[#fdf4ea] transition-colors text-left w-full flex-shrink-0"
                >
                  <div className="relative">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#FDF8F2] border border-[#F3DCC0]">
                      <Bell className="w-4 h-4 text-[#944A15]" />
                    </div>
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 border border-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#3d2008]">Notifications</p>
                    <p className="text-xs text-[#9a7558]">Live operations snapshot</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-[#c4a882] rotate-[-90deg]" />
                </button>

                {/* scrollable nav items */}
                <div className="flex-1 overflow-y-auto min-h-0">
                  <div className="px-3 py-2.5 space-y-0.5">
                    {NAV_ITEMS.map(({ label, icon: Icon, route }) => (
                      <button
                        key={route}
                        onClick={() => navigate(route)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-[#5c3d1e] hover:bg-[#fdebd5] transition-colors font-medium"
                      >
                        <Icon className="w-4 h-4 text-[#b87340] flex-shrink-0" />
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* bottom actions */}
                  <div className="px-3 py-2 border-t border-[#eedcc8] space-y-0.5 pb-8">
                    <button
                      onClick={() => { onClose(); onSwitchAccount() }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-[#5c3d1e] hover:bg-[#fdebd5] transition-colors font-medium"
                    >
                      <RefreshCw className="w-4 h-4 text-[#b87340] flex-shrink-0" />
                      Switch Account
                    </button>
                    <button
                      onClick={() => { onClose(); onLogout() }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-rose-600 hover:bg-rose-50 transition-colors font-medium"
                    >
                      <LogOut className="w-4 h-4 flex-shrink-0" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── PROFILE VIEW ── */}
            {drawerView === 'profile' && (
              <div className="flex flex-col overflow-y-auto" style={{ maxHeight: 'calc(88dvh - 24px)' }}>
                <div className="flex items-center gap-2 px-4 py-3.5 border-b border-[#eedcc8]">
                  <button
                    onClick={() => setDrawerView('main')}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9a7558] hover:bg-[#fdebd5] transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <p className="text-sm font-semibold text-[#3d2008]">My Profile</p>
                </div>

                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: '#FDF8F2', border: '2px solid #F3DCC0', boxShadow: '0 4px 16px rgba(212,114,42,0.12)' }}
                    >
                      <span className="text-lg font-bold leading-none" style={{ color: '#944A15' }}>
                        {displayInitials}
                      </span>
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
                  <button
                    onClick={() => setDrawerView('main')}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9a7558] hover:bg-[#fdebd5] transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <p className="text-sm font-semibold text-[#3d2008]">Notifications</p>
                    <p className="text-[10px] text-[#9a7558]">Live operations snapshot</p>
                  </div>
                </div>
                <div className="p-3 space-y-1 pb-8">
                  {notifItems.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-[#9a7558]">No updates yet.</p>
                  ) : notifItems.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => { onClose(); router.push(item.route) }}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm hover:bg-[#fdebd5] transition-colors"
                    >
                      <span className="text-[#5c3d1e] font-medium">{item.label}</span>
                      <span className={`text-base font-extrabold tabular-nums ${item.color}`}>
                        {item.value}
                      </span>
                    </button>
                  ))}
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
          const full = meta.full_name
            ?? [meta.first_name, meta.last_name].filter(Boolean).join(' ')
            ?? user.email.split('@')[0]
            ?? 'User'
          const [f = '', ...rest] = full.split(' ')
          const l = rest.join(' ')
          setCurrentUser({
            firstName: cap(f), lastName: cap(l),
            fullName: full.trim(), email: user.email,
            roleName: 'Staff', initials: initials(f, l || f),
          })
          return
        }

        const first   = data.first_name ?? ''
        const last    = data.last_name  ?? ''
        const roleRow = Array.isArray(data.staff_roles)
          ? data.staff_roles[0]
          : (data.staff_roles as any)
        const roleName = roleRow?.role_name ?? 'Staff'

        setCurrentUser({
          firstName: cap(first), lastName: cap(last),
          fullName: `${cap(first)} ${cap(last)}`.trim(),
          email: data.email, roleName,
          initials: initials(first, last),
        })
      } catch {
        // silently keep null
      }
    }
    fetchUser()
  }, [])

  /* ── fetch live stats ── */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const supabase = createClient()
        const today = new Date().toISOString().split('T')[0]

        const [arrivalsRes, departuresRes, roomsRes, hkRes, revenueRes, confirmedRes] =
          await Promise.all([
            supabase.from('bookings').select('booking_id', { count: 'exact', head: true })
              .eq('check_in_date', today).eq('booking_status', 'confirmed'),
            supabase.from('bookings').select('booking_id', { count: 'exact', head: true })
              .eq('check_out_date', today).eq('booking_status', 'checked_in'),
            supabase.from('rooms').select('room_id, status').eq('is_deleted', false),
            supabase.from('housekeeping_schedules').select('schedule_id', { count: 'exact', head: true })
              .eq('status', 'scheduled'),
            supabase.from('invoices').select('total_amount').eq('status', 'paid'),
            supabase.from('bookings').select('booking_id', { count: 'exact', head: true })
              .eq('booking_status', 'confirmed').eq('is_deleted', false),
          ])

        const totalRooms    = roomsRes.data?.length ?? 180
        const occupiedRooms = roomsRes.data?.filter((r: any) => r.status === 'occupied').length ?? 0
        const revenue       = revenueRes.data?.reduce(
          (s: number, i: any) => s + (Number(i.total_amount) ?? 0), 0
        ) ?? 0

        setStats({
          arrivalsToday:       arrivalsRes.count   ?? 0,
          departuresToday:     departuresRes.count ?? 0,
          occupiedRooms, totalRooms,
          pendingHousekeeping: hkRes.count         ?? 0,
          revenue,
          confirmedBookings:   confirmedRes.count  ?? 0,
        })
      } catch {
        // keep previous stats
      } finally {
        setLoadingStats(false)
      }
    }

    fetchStats()
    const iv = setInterval(fetchStats, 60_000)
    return () => clearInterval(iv)
  }, [])

  /* ── click-outside for desktop dropdowns ── */
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setUserDropdown(false)
        setDropdownView('main')
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target as Node))
        setNotifOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  /* ── lock body scroll when mobile drawer is open ── */
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

  const closeUserDropdown = () => {
    setUserDropdown(false)
    setDropdownView('main')
  }

  const displayName     = currentUser?.fullName  ?? '—'
  const displayEmail    = currentUser?.email     ?? '—'
  const displayRole     = currentUser?.roleName  ?? '—'
  const displayInitials = currentUser?.initials  ?? '?'

  const occupancyPct = stats
    ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100)
    : 0

  const notificationItems = stats ? [
    { label: 'Arrivals Today',       value: String(stats.arrivalsToday),      route: '/bookings'     },
    { label: 'Pending Housekeeping', value: String(stats.pendingHousekeeping), route: '/housekeeping' },
    { label: 'Open Maintenance',     value: String(stats.pendingHousekeeping), route: '/maintenance'  },
    { label: 'Confirmed Bookings',   value: String(stats.confirmedBookings),   route: '/bookings'     },
  ] : []

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

  return (
    <>
      <div className="h-14 flex-shrink-0" aria-hidden="true" />

      <header className="h-14 bg-white/95 dark:bg-card/95 border-b border-border fixed top-0 left-0 right-0 z-50 backdrop-blur-md shadow-sm">

        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[2px] pointer-events-none z-20"
          style={{
            background: 'linear-gradient(90deg, #D4722A, #E09A58, #C4621A, #D4722A, #F5C9A8, #D4722A)',
            backgroundSize: '400% 100%',
          }}
          animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />

        <div className="flex items-center h-full gap-2 px-4">

          {/* ── LEFT: brand ── */}
          <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
            <button
              onClick={() => setMobileDrawer(true)}
              className="md:hidden flex items-center rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4722A]/35"
              aria-label="Open menu"
            >
              <BrandMark compact />
            </button>
            <button
              onClick={onMenuClick}
              className="hidden md:flex items-center rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4722A]/35"
              aria-label="Toggle sidebar"
            >
              <BrandMark />
            </button>
          </div>

          {/* ── CENTER: desktop ticker ── */}
          <div className="hidden md:flex flex-1 justify-center min-w-0">
            <div
              className="relative flex items-center h-8 rounded-full border border-border bg-muted overflow-hidden"
              style={{ width: '820px', maxWidth: '100%' }}
            >
              <div className="absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none rounded-l-full"
                style={{ background: 'linear-gradient(to right, hsl(var(--muted)), transparent)' }} />
              <div className="absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none rounded-r-full"
                style={{ background: 'linear-gradient(to left, hsl(var(--muted)), transparent)' }} />

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
                        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/80">
                          {item.label}
                        </span>
                        <span className="text-muted-foreground/50 text-[9px]">·</span>
                        <span className={`text-[11px] font-bold tabular-nums ${item.accent}`}>
                          {item.value}
                        </span>
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
            <div
              className="relative mx-1 h-[30px] rounded-full overflow-hidden"
              style={{ border: '1px solid #eedcc8', background: '#fdf7f0' }}
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-7 z-10 pointer-events-none rounded-l-full"
                style={{ background: 'linear-gradient(to right, #fdf7f0 50%, transparent)' }}
              />
              <div
                className="absolute right-0 top-0 bottom-0 w-7 z-10 pointer-events-none rounded-r-full"
                style={{ background: 'linear-gradient(to left, #fdf7f0 50%, transparent)' }}
              />

              {loadingStats ? (
                <div className="h-full flex items-center gap-1.5 px-4">
                  <Loader2 className="w-3 h-3 animate-spin text-[#c4a882]" />
                  <span className="font-bold uppercase text-[#c4a882] tracking-widest" style={{ fontSize: '9px' }}>
                    Loading...
                  </span>
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
                onClick={() => setNotifOpen((p: boolean) => !p)}
                className="relative w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-all"
              >
                <Bell className="w-3.5 h-3.5" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-500 ring-1 ring-white" />
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-card rounded-xl border border-border shadow-lg overflow-hidden z-50"
                  >
                    <div className="p-3 border-b border-border/80">
                      <p className="text-sm font-semibold text-foreground">Notifications</p>
                      <p className="text-xs text-muted-foreground/80">Live operations snapshot</p>
                    </div>
                    <div className="p-1.5 space-y-0.5">
                      {notificationItems.length === 0 ? (
                        <p className="px-3 py-2 text-xs text-muted-foreground">No updates yet.</p>
                      ) : notificationItems.map((item) => (
                        <button
                          key={item.label}
                          onClick={() => { setNotifOpen(false); router.push(item.route) }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors"
                        >
                          <span>{item.label}</span>
                          <span className="font-semibold text-foreground">{item.value}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User button */}
            <div ref={userDropdownRef} className="relative">
              <button
                onClick={() => { setUserDropdown(!userDropdown); setDropdownView('main') }}
                className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-lg border border-[#e9dac9] bg-gradient-to-r from-[#fff9f2] to-[#fdf4ea] hover:opacity-90 transition-all"
              >
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ background: '#FDF8F2', border: '1.5px solid #F3DCC0' }}
                >
                  {currentUser
                    ? <span className="text-[10px] font-bold leading-none" style={{ color: '#944A15' }}>{displayInitials}</span>
                    : <User className="w-3 h-3" style={{ color: '#944A15' }} />
                  }
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-[11px] font-semibold text-foreground leading-tight truncate max-w-[88px]">
                    {currentUser?.firstName ?? '—'}
                  </p>
                  <p className="text-[10px] text-muted-foreground/80 leading-tight truncate max-w-[88px]">
                    {displayRole}
                  </p>
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
                          <button
                            onClick={() => setDropdownView('profile')}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors"
                          >
                            <User className="w-4 h-4 text-muted-foreground/80 flex-shrink-0" />
                            My Profile
                          </button>
                          <button
                            onClick={() => { closeUserDropdown(); handleSwitchAccount() }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors"
                          >
                            <RefreshCw className="w-4 h-4 text-muted-foreground/80 flex-shrink-0" />
                            Switch Account
                          </button>
                          <div className="border-t border-border/80 mt-1 pt-1">
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            >
                              <LogOut className="w-4 h-4 flex-shrink-0" />
                              Sign Out
                            </button>
                          </div>
                        </div>
                      </>
                    )}

                    {dropdownView === 'profile' && (
                      <>
                        <div className="flex items-center gap-2 p-3 border-b border-border/80">
                          <button
                            onClick={() => setDropdownView('main')}
                            className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors flex-shrink-0"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>
                          <p className="text-sm font-semibold text-foreground">My Profile</p>
                        </div>
                        <div className="p-3 space-y-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{ background: '#FDF8F2', border: '1.5px solid #F3DCC0', boxShadow: '0 2px 8px rgba(212,114,42,0.1)' }}
                            >
                              <span className="text-sm font-bold leading-none" style={{ color: '#944A15' }}>
                                {displayInitials}
                              </span>
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
        onLogout={handleLogout}
        onSwitchAccount={handleSwitchAccount}
      />
    </>
  )
}