import { createClient } from '@/lib/supabase/server'
import { ADMIN_EMAIL } from '@/lib/constants/admin'

export type ViewerContext = {
  userEmail: string | null
  isAuthenticated: boolean
  isStaff: boolean
}

export async function getViewerContext(): Promise<ViewerContext> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) {
    return { userEmail: null, isAuthenticated: false, isStaff: false }
  }

  const { data: staff } = await supabase
    .from('staff')
    .select('staff_id')
    .eq('email', user.email)
    .eq('is_active', true)
    .maybeSingle()

  return {
    userEmail: user.email,
    isAuthenticated: true,
    isStaff: Boolean(staff) || user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase(),
  }
}

export async function getPublicHotels() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('hotels')
    .select('hotel_id, hotel_name, city, state_province, star_rating, total_rooms, address_line1, phone')
    .order('hotel_id', { ascending: true })

  return data ?? []
}

export async function getPublicRoomTypes() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('room_types')
    .select('room_type_id, hotel_id, type_name, type_category, description, max_occupancy, base_price, area_sqft, view_type')
    .eq('is_active', true)
    .order('hotel_id', { ascending: true })
    .order('room_type_id', { ascending: true })

  return data ?? []
}

export async function getPublicReviews() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('reviews')
    .select(
      'review_id, hotel_id, overall_rating, title, review_text, platform, created_at, is_verified, is_published, guests(first_name,last_name,city,country), hotels(hotel_name)'
    )
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(24)

  return data ?? []
}

export async function getSeasonalPricingHighlights() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('seasonal_pricing')
    .select('pricing_id, season_name, start_date, end_date, price_per_night, room_types(hotel_id)')
    .eq('is_active', true)
    .order('start_date', { ascending: false })
    .limit(10)

  return (data ?? []).map((item) => ({
    pricing_id: item.pricing_id,
    season_name: item.season_name,
    start_date: item.start_date,
    end_date: item.end_date,
    price_per_night: item.price_per_night,
    hotel_id: (item.room_types as { hotel_id?: number } | null)?.hotel_id ?? 0,
  }))
}

export async function getPublicRatePlans() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('room_rate_plans')
    .select('rate_plan_id, hotel_id, plan_name, is_active')
    .eq('is_active', true)
    .order('hotel_id', { ascending: true })
    .order('rate_plan_id', { ascending: true })

  return data ?? []
}

export async function getPublicRestaurants() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('restaurants')
    .select('restaurant_id, hotel_id, restaurant_name, cuisine_type, capacity, open_time, close_time, is_active, hotels(hotel_name, city)')
    .eq('is_active', true)
    .order('restaurant_name', { ascending: true })

  return (data ?? []).map((r: any) => ({
    ...r,
    hotel_name: r.hotels?.hotel_name ?? '',
    city: r.hotels?.city ?? '',
  }))
}

export async function getGuestIdByEmail(email: string | null) {
  if (!email) return null
  const supabase = await createClient()
  const { data } = await supabase
    .from('guests')
    .select('guest_id')
    .eq('email', email)
    .maybeSingle()
  return data?.guest_id ?? null
}

export async function getHotelById(hotelId: number) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('hotels')
    .select('hotel_id, hotel_name, city, state_province, star_rating, total_rooms, address_line1, phone, email')
    .eq('hotel_id', hotelId)
    .maybeSingle()

  return data
}

export async function getRoomTypesByHotel(hotelId: number) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('room_types')
    .select('room_type_id, hotel_id, type_name, type_category, description, max_occupancy, base_price, area_sqft, view_type, bed_type, bed_count, smoking')
    .eq('hotel_id', hotelId)
    .eq('is_active', true)
    .order('base_price', { ascending: true })

  return data ?? []
}

export async function getAmenitiesByHotel(hotelId: number) {
  const supabase = await createClient()

  const roomTypes = await getRoomTypesByHotel(hotelId)
  const roomTypeIds = roomTypes.map((room) => room.room_type_id)
  if (!roomTypeIds.length) return []

  const { data: links } = await supabase
    .from('room_amenities')
    .select('amenity_id')
    .in('room_type_id', roomTypeIds)

  const amenityIds = Array.from(new Set((links ?? []).map((item) => item.amenity_id)))
  if (!amenityIds.length) return []

  const { data: amenities } = await supabase
    .from('amenities')
    .select('amenity_id, amenity_name, icon_code, amenity_type, description')
    .in('amenity_id', amenityIds)
    .order('amenity_name', { ascending: true })

  return amenities ?? []
}

export async function getRoomAmenitiesByHotel(hotelId: number) {
  const supabase = await createClient()
  const roomTypes = await getRoomTypesByHotel(hotelId)
  const roomTypeIds = roomTypes.map((room) => room.room_type_id)
  if (!roomTypeIds.length) return {}

  const { data } = await supabase
    .from('room_amenities')
    .select('room_type_id, amenities(amenity_name)')
    .in('room_type_id', roomTypeIds)

  const map: Record<number, string[]> = {}
  for (const row of data ?? []) {
    const roomTypeId = row.room_type_id as number
    const name = (row.amenities as { amenity_name?: string } | null)?.amenity_name
    if (!name) continue
    if (!map[roomTypeId]) map[roomTypeId] = []
    map[roomTypeId].push(name)
  }

  // de-dupe and keep stable order
  for (const key of Object.keys(map)) {
    map[Number(key)] = Array.from(new Set(map[Number(key)]))
  }

  return map
}

export async function getGuestAccountSnapshot(userEmail: string | null) {
  if (!userEmail) {
    return {
      guest: null,
      bookings: [],
      stats: { totalVisits: 0, totalNights: 0, totalSpend: 0, upcomingVisits: 0, lastVisitDate: null as string | null },
    }
  }

  const supabase = await createClient()

  const { data: guest } = await supabase
    .from('guests')
    .select('guest_id, first_name, last_name, email, vip_status')
    .eq('email', userEmail)
    .maybeSingle()

  if (!guest) {
    return {
      guest: null,
      bookings: [],
      stats: { totalVisits: 0, totalNights: 0, totalSpend: 0, upcomingVisits: 0, lastVisitDate: null as string | null },
    }
  }

  const { data: bookings } = await supabase
    .from('bookings')
    .select('booking_id, confirmation_no, booking_status, check_in_date, check_out_date, total_nights, total_amount, hotels(hotel_name, city)')
    .eq('guest_id', guest.guest_id)
    .order('check_in_date', { ascending: false })

  const bookingRows = bookings ?? []
  const now = new Date().toISOString().slice(0, 10)
  const totalVisits = bookingRows.length
  const totalNights = bookingRows.reduce((sum, row) => sum + Number(row.total_nights ?? 0), 0)
  const totalSpend = bookingRows.reduce((sum, row) => sum + Number(row.total_amount ?? 0), 0)
  const upcomingVisits = bookingRows.filter((row) => String(row.check_in_date) >= now).length
  const lastVisitDate = bookingRows[0]?.check_in_date ?? null

  return {
    guest,
    bookings: bookingRows,
    stats: { totalVisits, totalNights, totalSpend, upcomingVisits, lastVisitDate },
  }
}
