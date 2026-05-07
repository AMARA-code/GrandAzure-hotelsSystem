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
}

export interface BookingFilters {
  search: string
  status: string
  hotel_id: string
  channel_type: string
  date_from: string
  date_to: string
}

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
          )
        `)
        .order('booking_id', { ascending: false })

      // Apply filters
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
      }))

      // Client-side search filter
      if (filters.search) {
        const s = filters.search.toLowerCase()
        result = result.filter(b =>
          b.confirmation_no.toLowerCase().includes(s) ||
          b.guest?.first_name?.toLowerCase().includes(s) ||
          b.guest?.last_name?.toLowerCase().includes(s) ||
          b.guest?.email?.toLowerCase().includes(s)
        )
      }

      // Client-side channel filter
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

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  return { bookings, loading, total, refetch: fetchBookings }
}

export function useBooking(id: number) {
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBooking = async () => {
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

  // Update room status when checking in/out
  if (roomIds && roomIds.length > 0) {
    const roomStatus =
      status === 'checked_in'  ? 'occupied'  :
      status === 'checked_out' ? 'dirty'      :
      status === 'cancelled'   ? 'available'  : null

    if (roomStatus) {
      await supabase
        .from('rooms')
        .update({ status: roomStatus })
        .in('room_id', roomIds)
    }
  }
}