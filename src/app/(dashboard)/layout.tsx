'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [loading,    setLoading]    = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/login'); return }
      setLoading(false)
    }
    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl gradient-azure flex items-center justify-center mx-auto shadow-azure animate-pulse">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
          <p className="text-muted-foreground font-medium">Loading Grand Azure...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-theme min-h-screen bg-background flex overflow-x-hidden">
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* ✅ min-w-0 prevents this flex child from overflowing the row */}
      <div className="flex-1 flex flex-col transition-all duration-300 lg:ml-20 min-w-0">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        {/* ✅ overflow-x-hidden clips any child that still tries to escape */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 sm:px-4 sm:py-5 lg:px-6 lg:py-6 animate-fade-in">
          {/* ✅ min-w-0 on the inner centering div too */}
          <div className="mx-auto w-full max-w-[1600px] min-w-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}