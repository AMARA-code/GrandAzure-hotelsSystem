'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, X } from 'lucide-react'
import { navigation } from '@/lib/constants/navigation'
import { cn } from '@/lib/utils/cn'
import { useState } from 'react'
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
            'rounded-xl p-3 gradient-azure text-white',
            open ? 'space-y-1' : 'flex items-center justify-center'
          )}
        >
          {open ? (
            <>
              <p className="text-xs font-semibold text-white/90">Grand Azure PMS</p>
              <p className="text-xs text-white/60">v1.0.0 — Production</p>
            </>
          ) : (
            <Star className="w-4 h-4 fill-white" />
          )}
        </div>
      </div>
    </>
  )
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const [hovered, setHovered] = useState(false)

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
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={onMobileClose}
            />

            {/* Drawer */}
            <motion.aside
              key="drawer"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="lg:hidden fixed left-0 top-0 h-full w-72 bg-gradient-to-b from-[#fffaf3] via-[#fdf8f3] to-[#f7f1e8] border-r border-border flex flex-col z-50 shadow-premium-lg"
            >
              {/* Mobile Logo + Close */}
              <div className="h-16 flex items-center justify-between px-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <BrandMark />
                </div>
                <button
                  onClick={onMobileClose}
                  className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground/80 hover:text-foreground hover:bg-muted transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Reuse nav content — always "open" on mobile */}
              <NavContent open={true} onLinkClick={onMobileClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}