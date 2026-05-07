import PublicShell from '@/components/guest-portal/PublicShell'
import RestaurantMenuExperience from '@/components/guest-portal/RestaurantMenuExperience'
import { getGuestIdByEmail, getPublicRestaurants, getViewerContext } from '@/lib/supabase/guest-portal'

export default async function RestaurantPage() {
  const viewer = await getViewerContext()
  const [restaurants, guestId] = await Promise.all([
    getPublicRestaurants(),
    getGuestIdByEmail(viewer.userEmail),
  ])

  return (
    <PublicShell isAuthenticated={viewer.isAuthenticated} isStaff={viewer.isStaff}>
      <section className="mx-auto w-full max-w-7xl space-y-5 px-3 py-6 sm:space-y-6 sm:px-5 sm:py-8 lg:px-8 lg:py-10">
        <div className="rounded-3xl border border-white/70 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-5 text-white shadow-gold sm:p-7">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Restaurant</h1>
          <p className="mt-2 max-w-2xl text-xs text-white/90 sm:text-sm">
            Place dine-in, room service, or takeaway orders. Orders flow directly into the hotel operations dashboard.
          </p>
        </div>

        <RestaurantMenuExperience restaurants={restaurants} guestId={guestId} />
      </section>
    </PublicShell>
  )
}

