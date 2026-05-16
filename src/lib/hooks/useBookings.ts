'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export interface Booking {
  booking_id: number
  confirmation_no: string
  check_in_date: string
  check_out_date: string
  total_nights: number
  adults: number
  children: number
  total_amount: number
  tax_amount: number
  booking_status: string
  booking_source: string
  special_requests: string | null
  loyalty_points_earned: number
  created_at: string
  guest: {
    guest_id: number
    first_name: string
    last_name: string
    email: string
    phone: string
    nationality: string | null
    vip_status: string
  }
  hotel: {
    hotel_id: number
    hotel_name: string
    hotel_code: string
  }
  channel: {
    channel_name: string
    channel_type: string
  }
  rate_plan: {
    plan_name: string
    meal_plan: string
  }
  booking_rooms: {
    room_id: number
    rate_per_night: number
    room: {
      room_number: string
      floor_number: number
    }
    room_type: {
      type_name: string
      type_category: string
    }
  }[]
  paid_amount?: number
}

export interface BookingFilters {
  search: string
  status: string
  hotel_id: string
  channel_type: string
  date_from: string
  date_to: string
}

// ── Auto-transition bookings + fully reconcile room statuses ───────────────
// STEP 1 — Fix all booking statuses based on today's date.
// STEP 2 — Reconcile every room's status from scratch using live bookings
//           as the single source of truth. Manual overrides are ignored.
//           Rule: room is 'occupied' if and only if it has a checked_in
//           booking right now. Everything else is 'available'.
export async function autoTransitionBookings(): Promise<void> {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  try {
    // ── STEP 1: Fix booking statuses ──────────────────────────────────────

    // A) confirmed → checked_in  (check-in reached, not yet departed)
    const { data: toCheckIn } = await supabase
      .from('bookings')
      .select('booking_id')
      .eq('booking_status', 'confirmed')
      .lte('check_in_date', today)
      .gt('check_out_date', today)

    if (toCheckIn && toCheckIn.length > 0) {
      await supabase
        .from('bookings')
        .update({ booking_status: 'checked_in' })
        .in('booking_id', toCheckIn.map((b: any) => b.booking_id))
    }

    // B) checked_in → checked_out  (checkout date reached)
    const { data: toCheckOut } = await supabase
      .from('bookings')
      .select('booking_id')
      .eq('booking_status', 'checked_in')
      .lte('check_out_date', today)

    if (toCheckOut && toCheckOut.length > 0) {
      await supabase
        .from('bookings')
        .update({ booking_status: 'checked_out' })
        .in('booking_id', toCheckOut.map((b: any) => b.booking_id))
    }

    // C) checked_out → checked_in  (manual correction: guest still mid-stay)
    const { data: wronglyOut } = await supabase
      .from('bookings')
      .select('booking_id')
      .eq('booking_status', 'checked_out')
      .lte('check_in_date', today)
      .gt('check_out_date', today)

    if (wronglyOut && wronglyOut.length > 0) {
      await supabase
        .from('bookings')
        .update({ booking_status: 'checked_in' })
        .in('booking_id', wronglyOut.map((b: any) => b.booking_id))
    }

    // D) confirmed → checked_out  (both dates passed, never checked in)
    const { data: missedStay } = await supabase
      .from('bookings')
      .select('booking_id')
      .eq('booking_status', 'confirmed')
      .lt('check_out_date', today)

    if (missedStay && missedStay.length > 0) {
      await supabase
        .from('bookings')
        .update({ booking_status: 'checked_out' })
        .in('booking_id', missedStay.map((b: any) => b.booking_id))
    }

    // ── STEP 2: Reconcile ALL room statuses from scratch ──────────────────
    // After booking statuses are corrected above, fetch every room_id
    // that belongs to a currently checked_in booking — these are the ONLY
    // rooms that should be 'occupied'. Everything else → 'available'.

    const { data: activeBookingRooms } = await supabase
      .from('bookings')
      .select('booking_rooms(room_id)')
      .eq('booking_status', 'checked_in')

    const occupiedRoomIds: number[] = (activeBookingRooms ?? []).flatMap(
      (b: any) => (b.booking_rooms ?? []).map((br: any) => br.room_id)
    )
    const occupiedSet = new Set(occupiedRoomIds)

    // Fetch all non-deleted rooms
    const { data: allRooms } = await supabase
      .from('rooms')
      .select('room_id, status')
      .eq('is_deleted', false)

    if (!allRooms) return

    // Rooms that should be occupied but aren't
    const shouldBeOccupied = allRooms
      .filter((r: any) => occupiedSet.has(r.room_id) && r.status !== 'occupied')
      .map((r: any) => r.room_id)

    // Rooms marked occupied but have no active checked_in booking
    const shouldBeAvailable = allRooms
      .filter((r: any) => !occupiedSet.has(r.room_id) && r.status === 'occupied')
      .map((r: any) => r.room_id)

    // Apply both corrections in parallel
    await Promise.all([
      shouldBeOccupied.length > 0
        ? supabase
            .from('rooms')
            .update({ status: 'occupied' })
            .in('room_id', shouldBeOccupied)
        : Promise.resolve(),
      shouldBeAvailable.length > 0
        ? supabase
            .from('rooms')
            .update({ status: 'available' })
            .in('room_id', shouldBeAvailable)
        : Promise.resolve(),
    ])

  } catch (err) {
    console.error('autoTransitionBookings error:', err)
  }
}

// ── useBookings ────────────────────────────────────────────────────────────
export function useBookings(filters: BookingFilters) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()

      let query = supabase
        .from('bookings')
        .select(`
          booking_id,
          confirmation_no,
          check_in_date,
          check_out_date,
          total_nights,
          adults,
          children,
          total_amount,
          tax_amount,
          booking_status,
          booking_source,
          special_requests,
          loyalty_points_earned,
          created_at,
          guests!inner (
            guest_id,
            first_name,
            last_name,
            email,
            phone,
            nationality,
            vip_status
          ),
          hotels!inner (
            hotel_id,
            hotel_name,
            hotel_code
          ),
          channels (
            channel_name,
            channel_type
          ),
          room_rate_plans (
            plan_name,
            meal_plan
          ),
          booking_rooms (
            room_id,
            rate_per_night,
            rooms (
              room_number,
              floor_number
            ),
            room_types (
              type_name,
              type_category
            )
          ),
          invoices (
            paid_amount,
            total_amount
          )
        `)
        .order('booking_id', { ascending: false })

      if (filters.status && filters.status !== 'all') {
        query = query.eq('booking_status', filters.status)
      }
      if (filters.hotel_id && filters.hotel_id !== 'all') {
        query = query.eq('hotel_id', parseInt(filters.hotel_id))
      }
      if (filters.date_from) {
        query = query.gte('check_in_date', filters.date_from)
      }
      if (filters.date_to) {
        query = query.lte('check_in_date', filters.date_to)
      }

      const { data, error } = await query
      if (error) throw error

      let result = (data ?? []).map((b: any) => ({
        booking_id:            b.booking_id,
        confirmation_no:       b.confirmation_no,
        check_in_date:         b.check_in_date,
        check_out_date:        b.check_out_date,
        total_nights:          b.total_nights,
        adults:                b.adults,
        children:              b.children,
        total_amount:          b.total_amount,
        tax_amount:            b.tax_amount,
        booking_status:        b.booking_status,
        booking_source:        b.booking_source,
        special_requests:      b.special_requests,
        loyalty_points_earned: b.loyalty_points_earned,
        created_at:            b.created_at,
        guest:                 b.guests,
        hotel:                 b.hotels,
        channel:               b.channels,
        rate_plan:             b.room_rate_plans,
        booking_rooms:         (b.booking_rooms ?? []).map((br: any) => ({
          room_id:        br.room_id,
          rate_per_night: br.rate_per_night,
          room:           br.rooms,
          room_type:      br.room_types,
        })),
        paid_amount: (
          Array.isArray(b.invoices)
            ? b.invoices[0]?.paid_amount
            : (b.invoices as any)?.paid_amount
        ) ?? 0,
      }))

      if (filters.search) {
        const s = filters.search.toLowerCase()
        result = result.filter(b =>
          b.confirmation_no.toLowerCase().includes(s) ||
          b.guest?.first_name?.toLowerCase().includes(s) ||
          b.guest?.last_name?.toLowerCase().includes(s) ||
          b.guest?.email?.toLowerCase().includes(s)
        )
      }

      if (filters.channel_type && filters.channel_type !== 'all') {
        result = result.filter(b =>
          b.channel?.channel_type === filters.channel_type
        )
      }

      setBookings(result)
      setTotal(result.length)
    } catch (err) {
      console.error('Bookings fetch error:', err)
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }, [filters])

  // On mount: run auto-transition + room reconciliation first, then fetch
  useEffect(() => {
    autoTransitionBookings().then(() => fetchBookings())
  }, [fetchBookings])

  return { bookings, loading, total, refetch: fetchBookings }
}

// ── useBooking (single) ────────────────────────────────────────────────────
export function useBooking(id: number) {
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBooking = async () => {
      await autoTransitionBookings()

      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            booking_id,
            confirmation_no,
            check_in_date,
            check_out_date,
            total_nights,
            adults,
            children,
            total_amount,
            tax_amount,
            booking_status,
            booking_source,
            special_requests,
            loyalty_points_earned,
            created_at,
            guests (
              guest_id,
              first_name,
              last_name,
              email,
              phone,
              nationality,
              vip_status
            ),
            hotels (
              hotel_id,
              hotel_name,
              hotel_code
            ),
            channels (
              channel_name,
              channel_type
            ),
            room_rate_plans (
              plan_name,
              meal_plan
            ),
            booking_rooms (
              room_id,
              rate_per_night,
              rooms (
                room_number,
                floor_number
              ),
              room_types (
                type_name,
                type_category
              )
            ),
            invoices (
              paid_amount,
              total_amount,
              balance_due
            )
          `)
          .eq('booking_id', id)
          .single()

        if (error) throw error

        setBooking({
          booking_id:            data.booking_id,
          confirmation_no:       data.confirmation_no,
          check_in_date:         data.check_in_date,
          check_out_date:        data.check_out_date,
          total_nights:          data.total_nights,
          adults:                data.adults,
          children:              data.children,
          total_amount:          data.total_amount,
          tax_amount:            data.tax_amount,
          booking_status:        data.booking_status,
          booking_source:        data.booking_source,
          special_requests:      data.special_requests,
          loyalty_points_earned: data.loyalty_points_earned,
          created_at:            data.created_at,
          guest:                 data.guests as any,
          hotel:                 data.hotels as any,
          channel:               data.channels as any,
          rate_plan:             data.room_rate_plans as any,
          booking_rooms:         (data.booking_rooms ?? []).map((br: any) => ({
            room_id:        br.room_id,
            rate_per_night: br.rate_per_night,
            room:           br.rooms,
            room_type:      br.room_types,
          })),
          paid_amount: (
            Array.isArray((data as any).invoices)
              ? (data as any).invoices[0]?.paid_amount
              : (data as any).invoices?.paid_amount
          ) ?? 0,
        })
      } catch (err) {
        console.error('Booking fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchBooking()
  }, [id])

  return { booking, loading }
}

// ── updateBookingStatus ────────────────────────────────────────────────────
export async function updateBookingStatus(
  bookingId: number,
  status: string,
  roomIds?: number[]
) {
  const supabase = createClient()

  const { error } = await supabase
    .from('bookings')
    .update({ booking_status: status })
    .eq('booking_id', bookingId)

  if (error) throw error

  if (roomIds && roomIds.length > 0) {
    const roomStatus =
      status === 'checked_in'  ? 'occupied'  :
      status === 'checked_out' ? 'available' :
      status === 'cancelled'   ? 'available' : null

    if (roomStatus) {
      await supabase
        .from('rooms')
        .update({ status: roomStatus })
        .in('room_id', roomIds)
    }
  }
}