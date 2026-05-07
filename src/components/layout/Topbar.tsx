'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, Bell, ChevronDown, LogOut, User, Settings, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

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

export default function Topbar({ onMenuClick }: TopbarProps) {
  const router = useRouter()

  const [userDropdown, setUserDropdown] = useState(false)
  const [notifOpen, setNotifOpen]       = useState(false)
  const [stats, setStats]               = useState<LiveStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const userDropdownRef = useRef<HTMLDivElement>(null)
  const notifDropdownRef = useRef<HTMLDivElement>(null)

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
          occupiedRooms,
          totalRooms,
          pendingHousekeeping: hkRes.count          ?? 0,
          revenue,
          confirmedBookings:   confirmedRes.count   ?? 0,
        })
      } catch {
        // keep previous
      } finally {
        setLoadingStats(false)
      }
    }

    fetchStats()
    const iv = setInterval(fetchStats, 60_000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node))
        setUserDropdown(false)
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target as Node))
        setNotifOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Signed out successfully')
    router.push('/login')
    router.refresh()
  }

  const occupancyPct = stats
    ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100)
    : 0

  const notificationItems = stats ? [
    { label: 'Arrivals Today', value: String(stats.arrivalsToday), route: '/bookings' },
    { label: 'Pending Housekeeping', value: String(stats.pendingHousekeeping), route: '/housekeeping' },
    { label: 'Open Maintenance', value: String(stats.pendingHousekeeping), route: '/maintenance' },
    { label: 'Confirmed Bookings', value: String(stats.confirmedBookings), route: '/bookings' },
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
    <header className="h-14 bg-card border-b border-border sticky top-0 z-30">

      {/* Animated rainbow bottom line */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[2px] pointer-events-none z-20"
        style={{
          background: 'linear-gradient(90deg, #38bdf8, #818cf8, #f472b6, #34d399, #fbbf24, #f87171, #38bdf8)',
          backgroundSize: '400% 100%',
        }}
        animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
      />

      {/* Main row */}
      <div className="flex items-center h-full gap-1 px-4">

        {/* ── LEFT: hamburger (mobile only) ── */}
        <div className="flex items-center flex-shrink-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-all"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* ── CENTER: ticker pill ── */}
        <div className="hidden md:flex flex-1 justify-center min-w-0">
          <div
            className="relative flex items-center h-8 rounded-full border border-border bg-muted overflow-hidden"
            style={{ width: '820px', maxWidth: '100%' }}
          >
            {/* Left fade */}
            <div
              className="absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none rounded-l-full"
              style={{ background: 'linear-gradient(to right, #fdfaf6, transparent)' }}
            />
            {/* Right fade */}
            <div
              className="absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none rounded-r-full"
              style={{ background: 'linear-gradient(to left, #fdfaf6, transparent)' }}
            />

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

        <div className="md:hidden flex-1 min-w-0">
          <div className="mx-2 rounded-full border border-border bg-muted px-3 py-1.5 text-[11px] font-semibold text-muted-foreground truncate">
            {loadingStats ? 'Loading operations...' : `Occupancy ${occupancyPct}% · Bookings ${stats?.confirmedBookings ?? 0}`}
          </div>
        </div>

        {/* ── RIGHT: bell + user ── */}
        <div className="flex items-center gap-2 flex-shrink-0">

          {/* Bell */}
          <div ref={notifDropdownRef} className="relative">
            <button
              onClick={() => setNotifOpen((prev) => !prev)}
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
                  className="absolute top-full right-0 mt-2 w-64 bg-card rounded-xl border border-border shadow-premium-lg overflow-hidden z-50"
                >
                  <div className="p-3 border-b border-border/80">
                    <p className="text-sm font-semibold text-foreground">Notifications</p>
                    <p className="text-xs text-muted-foreground/80">Live operations snapshot</p>
                  </div>
                  <div className="p-1.5 space-y-0.5">
                    {notificationItems.length === 0 ? (
                      <p className="px-3 py-2 text-xs text-muted-foreground">No updates yet.</p>
                    ) : (
                      notificationItems.map((item) => (
                        <button
                          key={item.label}
                          onClick={() => {
                            setNotifOpen(false)
                            router.push(item.route)
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors"
                        >
                          <span>{item.label}</span>
                          <span className="font-semibold text-foreground">{item.value}</span>
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User dropdown */}
          <div ref={userDropdownRef} className="relative">
            <button
              onClick={() => setUserDropdown(!userDropdown)}
              className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-lg border border-[#e9dac9] bg-gradient-to-r from-[#fff9f2] to-[#fdf4ea] hover:bg-muted transition-all"
            >
              <div className="w-6 h-6 rounded-md gradient-azure flex items-center justify-center flex-shrink-0">
                <User className="w-3 h-3 text-white" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-[11px] font-semibold text-foreground leading-tight">Admin</p>
                <p className="text-[10px] text-muted-foreground/80 leading-tight">General Manager</p>
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
                  className="absolute top-full right-0 mt-2 w-48 bg-card rounded-xl border border-border shadow-premium-lg overflow-hidden z-50"
                >
                  <div className="p-3 border-b border-border/80">
                    <p className="text-sm font-semibold text-foreground">Admin User</p>
                    <p className="text-xs text-muted-foreground/80">admin@grandazure.com</p>
                  </div>
                  <div className="m-1.5 rounded-lg border border-[#ecd8c4] bg-[#fff6ed] p-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8b5a3c]">Current Account</p>
                    <p className="mt-1 text-xs text-foreground">admin@grandazure.com</p>
                    <div className="mt-2 grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => {
                          setUserDropdown(false)
                          router.push('/login')
                        }}
                        className="rounded-md border border-[#e8c8a8] bg-[#fff0e2] px-2 py-1.5 text-[11px] font-semibold text-[#b85c1f] hover:bg-[#ffe6d0] transition-colors"
                      >
                        Switch: Sign In
                      </button>
                      <button
                        onClick={() => {
                          setUserDropdown(false)
                          router.push('/signup')
                        }}
                        className="rounded-md border border-[#d7e4ff] bg-[#edf3ff] px-2 py-1.5 text-[11px] font-semibold text-[#2b66c4] hover:bg-[#dfeaff] transition-colors"
                      >
                        New: Sign Up
                      </button>
                    </div>
                  </div>
                  <div className="p-1.5 space-y-0.5">
                    <button
                      onClick={() => {
                        setUserDropdown(false)
                        router.push('/my-account')
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors"
                    >
                      <User className="w-4 h-4 text-muted-foreground/80" />
                      My Profile
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdown(false)
                        router.push('/staff')
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors"
                    >
                      <Settings className="w-4 h-4 text-muted-foreground/80" />
                      Settings
                    </button>
                    <div className="border-t border-border/80 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}