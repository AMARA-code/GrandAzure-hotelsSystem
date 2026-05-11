import {
  getPublicHotels,
  getPublicRatePlans,
  getPublicRoomTypes,
  getSeasonalPricingHighlights,
  getViewerContext,
} from '@/lib/supabase/guest-portal'
import PublicShell from '@/components/guest-portal/PublicShell'
import BookExperience from '@/components/guest-portal/BookExperience'
import HeroSection from '@/components/guest-portal/HeroSection'

/* ─────────────────────────────────────────────
   Page — pure Server Component
   No 'use client', no framer-motion, no hooks
───────────────────────────────────────────── */
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
        <HeroSection />
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