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

        <div className="overflow-hidden rounded-3xl border border-[#f2e5d8] bg-gradient-to-br from-[#fff7ef] via-[#fdf9f3] to-[#f7efe4] p-7 shadow-premium-lg sm:p-9">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-100/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-orange-700">
            <Sparkles className="h-3.5 w-3.5" />
            Signature Collection
          </div>
          <h1 className="mt-5 font-display text-4xl font-bold text-[#3f2f22] sm:text-5xl">
            Discover Premium
            <span className="ml-2 text-[#d4722a] italic">City Retreats</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#7b6857] sm:text-base">
            Explore our curated hotels across Pakistan, where refined interiors, five-star service, and unforgettable
            local experiences come together in one seamless stay.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { icon: Building2, label: 'Luxury Properties', value: String(hotels.length), tone: 'text-azure-700 bg-azure-50 border-azure-200' },
              { icon: Crown, label: 'Average Rating', value: '4.9 / 5', tone: 'text-violet-700 bg-violet-50 border-violet-200' },
              { icon: ConciergeBell, label: 'Concierge Access', value: '24 / 7', tone: 'text-amber-700 bg-amber-50 border-amber-200' },
            ].map((item) => (
              <div key={item.label} className={`rounded-2xl border px-4 py-3 ${item.tone}`}>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em]">
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </div>
                <p className="mt-2 text-2xl font-bold">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <HotelsShowcase hotels={hotels} />
      </section>
    </PublicShell>
  )
}
