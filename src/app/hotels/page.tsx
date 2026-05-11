import PublicShell from '@/components/guest-portal/PublicShell'
import { getPublicHotels, getViewerContext } from '@/lib/supabase/guest-portal'
import HotelsShowcase from '@/components/guest-portal/HotelsShowcase'
import { Sparkles, Crown, Building2, ConciergeBell } from 'lucide-react'

export default async function HotelsPage() {
  const [viewer, hotels] = await Promise.all([getViewerContext(), getPublicHotels()])

  return (
    <PublicShell isAuthenticated={viewer.isAuthenticated} isStaff={viewer.isStaff}>
      <section className="relative mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="absolute inset-x-0 top-4 -z-10 mx-auto h-56 w-[90%] rounded-[3rem] bg-gradient-to-r from-orange-100/55 via-rose-100/45 to-sky-100/55 blur-3xl" />
 <HotelsShowcase hotels={hotels} />
      </section>
    </PublicShell>
  )
}
