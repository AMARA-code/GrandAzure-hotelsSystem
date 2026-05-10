'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, ChevronRight, Star, User } from 'lucide-react'
import { navigation } from '@/lib/constants/navigation'
import { cn } from '@/lib/utils/cn'
import { useState, useEffect } from 'react'

interface SidebarProps {
  mobileOpen: boolean
  onMobileClose: () => void
}

function NavContent({ open, onLinkClick }: { open: boolean; onLinkClick?: () => void }) {
  const pathname = usePathname()

  return (
    <>
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
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
      <div className="p-3 border-t border-border/80">
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

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const [hovered, setHovered] = useState(false)

  /* Lock body scroll while mobile sidebar is open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  /* Close on Escape */
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onMobileClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onMobileClose])

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <motion.aside
        animate={{ width: hovered ? 288 : 80 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="hidden lg:flex fixed left-0 top-14 h-[calc(100vh-56px)] bg-gradient-to-b from-[#fffaf3] via-[#fdf8f3] to-[#f7f1e8] border-r border-border flex-col z-40 shadow-premium overflow-hidden"
      >
        <NavContent open={hovered} />
      </motion.aside>

      {/* ── MOBILE OVERLAY ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/*
              Backdrop — starts at top-14 (56px) so the topbar stays
              fully visible and clickable above it.
              z-20 keeps it below the topbar (z-30).
            */}
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

            {/*
              Drawer — below the main topbar (top-14), no logo row (logo lives in desktop sidebar only).
              z-40: above backdrop (z-30), below topbar (z-50).
            */}
            <motion.aside
              key="drawer"
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className={cn(
                'lg:hidden fixed left-0 top-14 bottom-0 z-40 flex w-[272px] flex-col overflow-hidden',
                'border-r border-[#f0dfc0]',
                'bg-gradient-to-b from-[#fffaf3] via-[#fdf8f3] to-[#f7f1e8]',
                'backdrop-blur-md',
                'shadow-premium-lg'
              )}
            >
              <div className="p-3 border-b border-[#f0dfc0]/90 bg-white/45 backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/bookings"
                    onClick={onMobileClose}
                    className="flex items-center justify-between rounded-xl border border-[#f0dfc0] bg-[#fff9f2] px-3 py-2.5 text-xs font-semibold text-[#944A15] shadow-premium"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5" />
                      Notifications
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                  </Link>
                  <Link
                    href="/staff"
                    onClick={onMobileClose}
                    className="flex items-center justify-between rounded-xl border border-[#f0dfc0] bg-[#fff9f2] px-3 py-2.5 text-xs font-semibold text-[#944A15] shadow-premium"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      Profile
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                  </Link>
                </div>
              </div>
              <NavContent open={true} onLinkClick={onMobileClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}