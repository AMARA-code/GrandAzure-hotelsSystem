import PublicShell from '@/components/guest-portal/PublicShell'
import { getPublicHotels, getPublicRatePlans, getPublicRoomTypes, getSeasonalPricingHighlights, getViewerContext } from '@/lib/supabase/guest-portal'
import BookExperience from '@/components/guest-portal/BookExperience'
import { Sparkles, CalendarCheck2, ShieldCheck, Gem, Clock3, ConciergeBell } from 'lucide-react'

export default async function BookPage() {
  const [viewer, hotels, roomTypes, seasonalPricing, ratePlans] = await Promise.all([
    getViewerContext(),
    getPublicHotels(),
    getPublicRoomTypes(),
    getSeasonalPricingHighlights(),
    getPublicRatePlans(),
  ])

  return (
    <PublicShell isAuthenticated={viewer.isAuthenticated} isStaff={viewer.isStaff}>
      <section className="relative mx-auto w-full max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="absolute inset-x-0 top-4 -z-10 mx-auto h-56 w-[92%] rounded-[3rem] bg-gradient-to-r from-[#fbe4d2]/55 via-[#f7e6ff]/45 to-[#ddeeff]/55 blur-3xl" />
        <div className="overflow-hidden rounded-3xl border border-[#efe0cf] bg-gradient-to-br from-[#fff9f2] via-[#fffdfb] to-[#f7f0e6] shadow-premium-lg">
          <div className="grid gap-0 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="p-7 sm:p-9">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#f3caa8] bg-[#fff1e2] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#b85c1f]">
                <Sparkles className="h-3.5 w-3.5" />
                Reservation Atelier
              </div>
              <h1 className="mt-5 font-display text-4xl font-bold text-[#3f2f22] sm:text-5xl">
                Curate Your
                <span className="ml-2 text-[#d4722a] italic">Perfect Stay</span>
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#7b6857] sm:text-base">
                Handpicked rooms, dynamic seasonal privileges, and seamless confirmation crafted for a premium booking experience.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  { icon: CalendarCheck2, label: 'Instant Confirmation', value: 'Real-Time' },
                  { icon: ShieldCheck, label: 'Secure Checkout', value: 'Protected' },
                  { icon: Gem, label: 'Direct Benefits', value: 'Exclusive Perks' },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-[#ead8c4] bg-white/80 px-4 py-3">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#8b5a3c]">
                      <item.icon className="h-3.5 w-3.5 text-[#d4722a]" />
                      {item.label}
                    </div>
                    <p className="mt-2 text-xl font-bold text-[#3f2f22]">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-[#efe0cf] bg-[#fff4e8] p-7 lg:border-l lg:border-t-0">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#b85c1f]">Guest Privileges</h2>
              <div className="mt-4 space-y-3">
                <div className="flex items-start gap-2 rounded-xl border border-[#f2d3b8] bg-white/80 p-3 text-sm text-[#5f4b3b]">
                  <ConciergeBell className="mt-0.5 h-4 w-4 text-[#d4722a]" />
                  Concierge follow-up after booking.
                </div>
                <div className="flex items-start gap-2 rounded-xl border border-[#f2d3b8] bg-white/80 p-3 text-sm text-[#5f4b3b]">
                  <Clock3 className="mt-0.5 h-4 w-4 text-[#d4722a]" />
                  Priority check-in queue on arrival.
                </div>
              </div>
            </div>
          </div>
        </div>
        <BookExperience
          hotels={hotels}
          roomTypes={roomTypes}
          seasonalPricing={seasonalPricing}
          ratePlans={ratePlans}
          userEmail={viewer.userEmail}
          isAuthenticated={viewer.isAuthenticated}
        />
      </section>
    </PublicShell>
  )
}
