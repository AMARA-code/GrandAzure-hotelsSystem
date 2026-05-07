import { notFound } from 'next/navigation'
import PublicShell from '@/components/guest-portal/PublicShell'
import HotelDetailShowcase from '@/components/guest-portal/HotelDetailShowcase'
import { getHotelById, getRoomAmenitiesByHotel, getRoomTypesByHotel, getViewerContext } from '@/lib/supabase/guest-portal'

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

  const [viewer, hotel, roomTypes, roomAmenities] = await Promise.all([
    getViewerContext(),
    getHotelById(parsedHotelId),
    getRoomTypesByHotel(parsedHotelId),
    getRoomAmenitiesByHotel(parsedHotelId),
  ])

  if (!hotel) {
    notFound()
  }

  return (
    <PublicShell isAuthenticated={viewer.isAuthenticated} isStaff={viewer.isStaff}>
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <HotelDetailShowcase hotel={hotel} roomTypes={roomTypes} roomAmenities={roomAmenities} />
      </section>
    </PublicShell>
  )
}
