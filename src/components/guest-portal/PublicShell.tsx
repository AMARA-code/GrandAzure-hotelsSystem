'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils/cn'
import BrandMark from '@/components/guest-portal/BrandMark'

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Hotels', href: '/hotels' },
  { label: 'Book', href: '/book' },
  { label: 'Restaurant', href: '/restaurant' },
]

type PublicShellProps = {
  children: React.ReactNode
  isAuthenticated: boolean
  isStaff: boolean
}

export default function PublicShell({ children, isAuthenticated, isStaff }: PublicShellProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-azure-50/25 to-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-card/70 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/">
            <BrandMark />
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-xl px-4 py-2 text-sm font-medium transition-all',
                  pathname === item.href
                    ? 'bg-azure-100 text-azure-700 shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {isAuthenticated ? (
              <>
                <Link
                  href={isStaff ? '/dashboard' : '/my-account'}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
                >
                  {isStaff ? 'Dashboard' : 'My Account'}
                </Link>
                <Link href="/book" className="rounded-xl gradient-azure px-4 py-2 text-sm font-semibold text-white shadow-azure">
                  Book Now
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="rounded-xl px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted">
                  Sign In
                </Link>
                <Link href="/signup" className="rounded-xl gradient-gold px-4 py-2 text-sm font-semibold text-white shadow-gold">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <button
            className="rounded-xl border border-border p-2 md:hidden"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5 text-foreground" /> : <Menu className="h-5 w-5 text-foreground" />}
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <>
              <motion.div
                key="public-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm md:hidden"
                onClick={() => setOpen(false)}
              />
              <motion.aside
                key="public-drawer"
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                transition={{ duration: 0.28, ease: 'easeInOut' }}
                className="fixed left-0 top-0 z-50 h-full w-72 border-r border-border bg-gradient-to-b from-[#fffaf3] via-[#fdf8f3] to-[#f7f1e8] shadow-premium-lg md:hidden"
              >
                <div className="flex h-16 items-center justify-between border-b border-border px-4">
                  <BrandMark />
                  <button
                    onClick={() => setOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted"
                    aria-label="Close menu"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-1 p-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'block rounded-xl px-3 py-2 text-sm font-medium transition-all',
                        pathname === item.href
                          ? 'bg-azure-100 text-azure-700 shadow-sm'
                          : 'text-foreground hover:bg-muted'
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="my-3 h-px bg-border" />
                  <Link
                    href={isAuthenticated ? (isStaff ? '/dashboard' : '/my-account') : '/login'}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-3 py-2 text-sm font-semibold text-azure-700 hover:bg-azure-50"
                  >
                    {isAuthenticated ? (isStaff ? 'Dashboard' : 'My Account') : 'Sign In'}
                  </Link>
                  {!isAuthenticated && (
                    <Link
                      href="/signup"
                      onClick={() => setOpen(false)}
                      className="mt-2 block rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-premium"
                    >
                      Sign Up
                    </Link>
                  )}
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </header>

      <main className="animate-fade-in">{children}</main>

      <footer className="mt-16 border-t border-border bg-card">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Grand Azure Hotel Group. All rights reserved.</p>
          <p className="flex items-center gap-1"><Sparkles className="h-4 w-4 text-gold-500" /> Luxury stays across Pakistan.</p>
        </div>
      </footer>
    </div>
  )
}
