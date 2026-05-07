import PublicShell from '@/components/guest-portal/PublicShell'
import { getPublicHotels, getPublicReviews, getPublicRoomTypes, getViewerContext } from '@/lib/supabase/guest-portal'
import HomeLanding from '@/components/guest-portal/HomeLanding'

export default async function RootPage() {
  const [viewer, hotels, roomTypes, reviews] = await Promise.all([
    getViewerContext(),
    getPublicHotels(),
    getPublicRoomTypes(),
    getPublicReviews(),
  ])

  const featuredRooms = roomTypes.slice(0, 3)
  const featuredReviews = reviews.slice(0, 3)

  return (
    <PublicShell isAuthenticated={viewer.isAuthenticated} isStaff={viewer.isStaff}>
      <HomeLanding
        hotels={hotels}
        featuredRooms={featuredRooms}
        featuredReviews={featuredReviews as any}
        isAuthenticated={viewer.isAuthenticated}
      />
    </PublicShell>
  )
}
