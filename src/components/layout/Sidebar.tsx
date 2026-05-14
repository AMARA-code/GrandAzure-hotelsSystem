'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, ChevronRight, Star, User, X, CheckCheck, CalendarCheck, ShoppingBag } from 'lucide-react'
import { navigation } from '@/lib/constants/navigation'
import { cn } from '@/lib/utils/cn'
import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'

/* ─────────────────────────────────────────────────────────────
   Types (mirrored from Topbar)
───────────────────────────────────────────────────────────── */
interface Notification {
  notification_id: number
  type: 'review' | 'booking' | 'order'
  title: string
  message: string
  link: string
  is_read: boolean
  created_at: string
}

interface SidebarProps {
  mobileOpen: boolean
  onMobileClose: () => void
  // Notification props — passed down from the shared parent / layout
  notifications?: Notification[]
  onDismiss?: (id: number) => void
  onDismissAll?: () => void
}

/* ─────────────────────────────────────────────────────────────
   Helpers (duplicated from Topbar so Sidebar is self-contained)
───────────────────────────────────────────────────────────── */
function notifIcon(type: Notification['type']) {
  if (type === 'review')  return <Star        className="w-3.5 h-3.5 text-amber-500"   />
  if (type === 'booking') return <CalendarCheck className="w-3.5 h-3.5 text-blue-500"  />
  if (type === 'order')   return <ShoppingBag  className="w-3.5 h-3.5 text-emerald-500" />
  return <Bell className="w-3.5 h-3.5 text-slate-400" />
}

function notifBg(type: Notification['type']) {
  if (type === 'review')  return 'bg-amber-50 border-amber-100'
  if (type === 'booking') return 'bg-blue-50 border-blue-100'
  if (type === 'order')   return 'bg-emerald-50 border-emerald-100'
  return 'bg-slate-50 border-slate-100'
}

/* ─────────────────────────────────────────────────────────────
   MobileNotificationPanel
───────────────────────────────────────────────────────────── */
function MobileNotificationPanel({
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
      <div className="flex flex-col items-center justify-center py-8 gap-2 text-center px-4">
        <div className="w-9 h-9 rounded-full bg-[#fdf0e0] border border-[#f0dfc0] flex items-center justify-center">
          <Bell className="w-4 h-4 text-[#c4a882]" />
        </div>
        <p className="text-xs font-semibold text-[#5c3d1e]">All caught up!</p>
        <p className="text-[11px] text-[#b08060]">No new notifications from guests.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#f0dfc0]">
        <div>
          <p className="text-xs font-semibold text-[#3d2008]">Notifications</p>
          <p className="text-[10px] text-[#b08060]">{notifications.length} unread</p>
        </div>
        <button
          onClick={onDismissAll}
          className="flex items-center gap-1 text-[10px] font-semibold text-[#9a7558] hover:text-[#3d2008] transition-colors px-2 py-1 rounded-lg hover:bg-[#fdebd5]"
        >
          <CheckCheck className="w-3 h-3" />
          Mark all read
        </button>
      </div>

      {/* list */}
      <div className="space-y-1 p-1.5">
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
   NavContent
───────────────────────────────────────────────────────────── */
function NavContent({ open, onLinkClick }: { open: boolean; onLinkClick?: () => void }) {
  const pathname = usePathname()

  return (
    <>
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {navigation.map((section) => (
          <div key={section.title}>
            <AnimatePresence>
              {open && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-widest px-3 mb-2"
                >
                  {section.title}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href))
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onLinkClick}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative',
                      isActive
                        ? 'bg-azure-50 text-azure-700 shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full gradient-azure"
                      />
                    )}

                    <Icon
                      className={cn(
                        'w-5 h-5 flex-shrink-0 transition-colors',
                        isActive ? item.color : 'text-muted-foreground/70 group-hover:text-foreground'
                      )}
                    />

                    <AnimatePresence>
                      {open && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className="font-medium text-sm whitespace-nowrap overflow-hidden"
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-border/80 shrink-0">
        <div
          className={cn(
            'rounded-xl p-3',
            open ? 'space-y-1' : 'flex items-center justify-center'
          )}
          style={{
            background: '#FDF8F2',
            border: '1.5px solid #F3DCC0',
          }}
        >
          {open ? (
            <>
              <p className="text-xs font-semibold" style={{ color: '#944A15' }}>Grand Azure PMS</p>
              <p className="text-xs" style={{ color: '#C4A882' }}>v1.0.0 — Production</p>
            </>
          ) : (
            <Star className="w-4 h-4" style={{ fill: '#D4722A', color: '#D4722A' }} />
          )}
        </div>
      </div>
    </>
  )
}

/* ─────────────────────────────────────────────────────────────
   Sidebar (main export)
───────────────────────────────────────────────────────────── */
export default function Sidebar({
  mobileOpen,
  onMobileClose,
  notifications = [],
  onDismiss,
  onDismissAll,
}: SidebarProps) {
  const router = useRouter()
  const [hovered, setHovered] = useState(false)
  const [notifExpanded, setNotifExpanded] = useState(false)

  const unreadCount = notifications.length

  /* Lock body scroll while mobile sidebar is open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  /* Collapse notif panel when drawer closes */
  useEffect(() => {
    if (!mobileOpen) setNotifExpanded(false)
  }, [mobileOpen])

  /* Close on Escape */
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onMobileClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onMobileClose])

  const handleNavigate = (link: string) => {
    onMobileClose()
    router.push(link)
  }

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <motion.aside
        animate={{ width: hovered ? 288 : 80 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="hidden lg:flex fixed left-0 top-14 h-[calc(100vh-56px)] bg-white border-r border-border flex-col z-40 shadow-premium overflow-hidden"
      >
        <NavContent open={hovered} />
      </motion.aside>

      {/* ── MOBILE OVERLAY ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onMobileClose}
              className="lg:hidden fixed left-0 right-0 bottom-0 z-30 top-14"
              style={{
                background: 'rgba(15, 10, 5, 0.45)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
              }}
            />

            <motion.aside
              key="drawer"
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className={cn(
                'lg:hidden fixed left-0 top-14 bottom-0 z-40 flex w-[272px] flex-col overflow-hidden',
                'border-r border-[#f0dfc0]',
                'bg-white',
                'shadow-premium-lg'
              )}
            >
              {/* ── Quick actions header ── */}
              <div className="p-3 border-b border-[#f0dfc0]/90 bg-white shrink-0">
                <div className="grid grid-cols-2 gap-2">

                  {/* Notifications button — toggles inline panel */}
                  <button
                    onClick={() => setNotifExpanded((p) => !p)}
                    className={cn(
                      'flex items-center justify-between rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors',
                      notifExpanded
                        ? 'border-[#e0aa70] bg-[#fff3e0] text-[#944A15]'
                        : 'border-[#f0dfc0] bg-[#fff9f2] text-[#944A15] hover:bg-[#fdf0e0]'
                    )}
                    style={{ boxShadow: '0 1px 3px rgba(212,114,42,0.08)' }}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <span className="relative">
                        <Bell className="w-3.5 h-3.5" />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1.5 min-w-[14px] h-3.5 rounded-full bg-rose-500 border border-white flex items-center justify-center text-[8px] font-bold text-white px-0.5 leading-none">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </span>
                      Notifications
                    </span>
                    <motion.div
                      animate={{ rotate: notifExpanded ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                    </motion.div>
                  </button>

                  {/* Profile link — unchanged */}
                  <Link
                    href="/staff"
                    onClick={onMobileClose}
                    className="flex items-center justify-between rounded-xl border border-[#f0dfc0] bg-[#fff9f2] px-3 py-2.5 text-xs font-semibold text-[#944A15] hover:bg-[#fdf0e0] transition-colors"
                    style={{ boxShadow: '0 1px 3px rgba(212,114,42,0.08)' }}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      Profile
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                  </Link>
                </div>

                {/* ── Inline notification panel (expands below quick actions) ── */}
                <AnimatePresence>
                  {notifExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div
                        className="mt-2 rounded-xl border border-[#f0dfc0] overflow-hidden"
                        style={{ background: '#fffaf5' }}
                      >
                        <MobileNotificationPanel
                          notifications={notifications}
                          onDismiss={onDismiss ?? (() => {})}
                          onDismissAll={onDismissAll ?? (() => {})}
                          onNavigate={handleNavigate}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Scrollable nav area */}
              <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
                <NavContent open={true} onLinkClick={onMobileClose} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}