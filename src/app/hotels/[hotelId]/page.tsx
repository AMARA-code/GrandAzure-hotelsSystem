import { notFound } from 'next/navigation'
import PublicShell from '@/components/guest-portal/PublicShell'
import HotelDetailWithBooking from '@/components/guest-portal/HotelDetailWithBooking'
import {
  getHotelById,
  getPublicHotels,
  getPublicRatePlans,
  getPublicRoomTypes,
  getRoomAmenitiesByHotel,
  getRoomTypesByHotel,
  getSeasonalPricingHighlights,
  getViewerContext,
} from '@/lib/supabase/guest-portal'

export default async function HotelDetailPage({
  params,
}: {
  params: Promise<{ hotelId: string }>
}) {
  const { hotelId } = await params
  const parsedHotelId = Number(hotelId)

  if (!Number.isInteger(parsedHotelId)) {
    notFound()
  }

  const [viewer, hotel, roomTypes, roomAmenities, hotels, allRoomTypes, seasonalPricing, ratePlans] =
    await Promise.all([
      getViewerContext(),
      getHotelById(parsedHotelId),
      getRoomTypesByHotel(parsedHotelId),
      getRoomAmenitiesByHotel(parsedHotelId),
      getPublicHotels(),
      getPublicRoomTypes(),
      getSeasonalPricingHighlights(),
      getPublicRatePlans(),
    ])

  if (!hotel) {
    notFound()
  }

  return (
    <PublicShell isAuthenticated={viewer.isAuthenticated} isStaff={viewer.isStaff}>
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <HotelDetailWithBooking
          hotel={hotel}
          roomTypes={roomTypes}
          roomAmenities={roomAmenities}
          hotels={hotels}
          allRoomTypes={allRoomTypes}
          seasonalPricing={seasonalPricing}
          ratePlans={ratePlans}
          userEmail={viewer.userEmail}
          isAuthenticated={viewer.isAuthenticated}
        />
      </section>
    </PublicShell>
  )
}
