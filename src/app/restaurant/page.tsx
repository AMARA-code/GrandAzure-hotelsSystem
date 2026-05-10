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
      

        <RestaurantMenuExperience restaurants={restaurants} guestId={guestId} />
      </section>
    </PublicShell>
  )
}

