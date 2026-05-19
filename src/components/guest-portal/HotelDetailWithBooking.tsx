'use client'

import { useState } from 'react'
import HotelDetailShowcase from '@/components/guest-portal/HotelDetailShowcase'
import BookExperience from '@/components/guest-portal/BookExperience'

type HotelType = {
  hotel_id: number
  hotel_name: string
  city: string
  state_province: string
  star_rating: number
  total_rooms: number
  address_line1: string
  phone: string
  email: string
}

type RoomType = {
  room_type_id: number
  hotel_id: number
  type_name: string
  type_category: string
  description: string
  max_occupancy: number
  base_price: number | string
  area_sqft?: number | string
  view_type?: string | null
  bed_type?: string | null
  bed_count?: number | null
  smoking?: boolean | null
}

type SeasonalType = {
  pricing_id: number
  hotel_id: number
  season_name: string
  start_date: string
  end_date: string
  price_per_night: number | string
}

type RatePlanType = { rate_plan_id: number; hotel_id: number; plan_name: string; is_active: boolean }

export default function HotelDetailWithBooking({
  hotel,
  roomTypes,
  roomAmenities,
  hotels,
  allRoomTypes,
  seasonalPricing,
  ratePlans,
  userEmail,
  isAuthenticated,
}: {
  hotel: HotelType
  roomTypes: RoomType[]
  roomAmenities: Record<number, string[]>
  hotels: { hotel_id: number; hotel_name: string; city: string }[]
  allRoomTypes: RoomType[]
  seasonalPricing: SeasonalType[]
  ratePlans: RatePlanType[]
  userEmail: string | null
  isAuthenticated: boolean
}) {
  const [openRoomTypeId, setOpenRoomTypeId] = useState<number | null>(null)

  return (
    <>
      <HotelDetailShowcase
        hotel={hotel}
        roomTypes={roomTypes}
        roomAmenities={roomAmenities}
        onRoomBook={room => setOpenRoomTypeId(room.room_type_id)}
      />
      <BookExperience
        showCatalog={false}
        initialRoomTypeId={openRoomTypeId}
        onBookingModalClose={() => setOpenRoomTypeId(null)}
        hotels={hotels}
        roomTypes={allRoomTypes}
        seasonalPricing={seasonalPricing}
        ratePlans={ratePlans}
        userEmail={userEmail}
        isAuthenticated={isAuthenticated}
      />
    </>
  )
}
