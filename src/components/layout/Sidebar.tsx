'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, X } from 'lucide-react'
import { navigation } from '@/lib/constants/navigation'
import { cn } from '@/lib/utils/cn'
import { useState, useEffect } from 'react'
import BrandMark from '@/components/guest-portal/BrandMark'

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
        className="hidden lg:flex fixed left-0 top-0 h-full bg-gradient-to-b from-[#fffaf3] via-[#fdf8f3] to-[#f7f1e8] border-r border-border flex-col z-40 shadow-premium overflow-hidden"
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-border">
          <BrandMark compact={!hovered} />
        </div>

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
              className="lg:hidden fixed left-0 right-0 bottom-0 z-20"
              style={{
                top: 56,
                background: 'rgba(15, 10, 5, 0.45)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
              }}
            />

            {/*
              Drawer — slides in from the left, starts at top-14 (56px),
              sits below the topbar with no duplicate header/logo/close row.
              z-30 keeps it above the backdrop but below the topbar.
            */}
            <motion.aside
              key="drawer"
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="lg:hidden fixed left-0 bottom-0 flex flex-col z-30"
              style={{
                top: 56,
                width: 272,
                /* Premium warm-cream — matches your existing desktop sidebar palette */
                background: 'linear-gradient(160deg, #fffaf3 0%, #fdf5e8 50%, #f7f1e8 100%)',
                borderRight: '1px solid #f0dfc0',
                boxShadow: '8px 0 40px rgba(120,60,10,0.10), 2px 0 8px rgba(120,60,10,0.06)',
              }}
            >
              {/* Amber accent rule — visual continuation of the topbar gradient line */}
              <div
                className="w-full flex-shrink-0"
                style={{
                  height: 2,
                  background: 'linear-gradient(90deg, #e8a264, #c97c3a, #f5c07a, #e8a264)',
                }}
              />

              <NavContent open={true} onLinkClick={onMobileClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}