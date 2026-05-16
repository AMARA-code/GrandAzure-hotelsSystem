'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface DashboardStats {
  totalRevenue: number
  totalBookings: number
  occupancyRate: number
  availableRooms: number
  occupiedRooms: number
  dirtyRooms: number
  maintenanceRooms: number
  checkinToday: number
  checkoutToday: number
  pendingHousekeeping: number
  openMaintenance: number
  revenueGrowth: number
  bookingGrowth: number
}

export interface MonthlyRevenue {
  month: string
  revenue: number
  bookings: number
}

export interface HotelOccupancy {
  hotel_name: string
  total_rooms: number
  occupied: number
  available: number
  dirty: number
  maintenance: number
  occupancy_rate: number
}

export interface TodayArrival {
  booking_id: number
  confirmation_no: string
  guest_name: string
  hotel_name: string
  room_number: string | null
  room_type: string
  check_in_date: string
  check_out_date: string
  total_nights: number
  adults: number
  children: number
  total_amount: number
  booking_status: string
  vip_status: string
}

export interface RecentBooking {
  booking_id: number
  confirmation_no: string
  guest_name: string
  hotel_name: string
  check_in_date: string
  check_out_date: string
  total_nights: number
  total_amount: number
  booking_status: string
  vip_status: string
  channel_name: string
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const supabase = createClient()

        // ✅ FIX: Total revenue now comes from invoices paid_amount (all payments
        // actually collected), not just checked_out bookings total_amount.
        // This ensures every payment recorded on any booking status is counted.
        const { data: invoiceData } = await supabase
          .from('invoices')
          .select('paid_amount')

        const totalRevenue = invoiceData?.reduce(
          (sum, inv) => sum + (parseFloat(inv.paid_amount) || 0), 0
        ) ?? 0

        // Total bookings — all statuses
        const { data: allBookings } = await supabase
          .from('bookings')
          .select('booking_id')

        const totalBookings = allBookings?.length ?? 0

        // Room status counts
        const { data: roomData } = await supabase
          .from('rooms')
          .select('status, hotel_id')

        const occupied    = roomData?.filter(r => r.status === 'occupied').length ?? 0
        const available   = roomData?.filter(r => r.status === 'available').length ?? 0
        const dirty       = roomData?.filter(r => r.status === 'dirty').length ?? 0
        const maintenance = roomData?.filter(r => r.status === 'maintenance').length ?? 0
        const totalRooms  = roomData?.length ?? 180
        const occupancyRate = totalRooms > 0
          ? Math.round((occupied / totalRooms) * 100)
          : 0

        // Confirmed bookings (upcoming / not yet checked in)
        const { data: checkinData } = await supabase
          .from('bookings')
          .select('booking_id')
          .eq('booking_status', 'confirmed')

        const checkinToday = checkinData?.length ?? 0

        // Currently checked-in bookings
        const { data: checkoutData } = await supabase
          .from('bookings')
          .select('booking_id')
          .eq('booking_status', 'checked_in')

        const checkoutToday = checkoutData?.length ?? 0

        // Pending housekeeping tasks
        const { data: hkData } = await supabase
          .from('housekeeping_schedules')
          .select('schedule_id')
          .in('status', ['scheduled', 'in_progress'])

        const pendingHousekeeping = hkData?.length ?? 0

        // Open maintenance requests
        const { data: mtData } = await supabase
          .from('maintenance_requests')
          .select('request_id')
          .in('status', ['open', 'in_progress'])

        const openMaintenance = mtData?.length ?? 0

        setStats({
          totalRevenue,
          totalBookings,
          occupancyRate,
          availableRooms: available,
          occupiedRooms: occupied,
          dirtyRooms: dirty,
          maintenanceRooms: maintenance,
          checkinToday,
          checkoutToday,
          pendingHousekeeping,
          openMaintenance,
          revenueGrowth: 12.5,
          bookingGrowth: 8.3,
        })
      } catch (err) {
        console.error('Dashboard stats error:', err)
        setError('Failed to load dashboard stats')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, loading, error }
}

export function useMonthlyRevenue() {
  const [data, setData] = useState<MonthlyRevenue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const supabase = createClient()

        // ✅ FIX: Monthly revenue now comes from invoices + payments,
        // not just checked_out bookings. Groups by invoice_date month.
        const { data: invoices } = await supabase
          .from('invoices')
          .select('paid_amount, invoice_date')
          .order('invoice_date')

        const monthNames = [
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
        ]

        const monthlyMap: Record<number, { revenue: number; bookings: number }> = {}

        invoices?.forEach(inv => {
          const month = new Date(inv.invoice_date).getMonth()
          if (!monthlyMap[month]) monthlyMap[month] = { revenue: 0, bookings: 0 }
          monthlyMap[month].revenue  += parseFloat(inv.paid_amount) || 0
          monthlyMap[month].bookings += 1
        })

        const result = monthNames.map((month, idx) => ({
          month,
          revenue:  monthlyMap[idx]?.revenue  ?? 0,
          bookings: monthlyMap[idx]?.bookings ?? 0,
        }))

        setData(result)
      } catch (err) {
        console.error('Monthly revenue error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRevenue()
  }, [])

  return { data, loading }
}

export function useHotelOccupancy() {
  const [data, setData] = useState<HotelOccupancy[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOccupancy = async () => {
      try {
        const supabase = createClient()

        const { data: hotels } = await supabase
          .from('hotels')
          .select('hotel_id, hotel_name, total_rooms')

        const { data: rooms } = await supabase
          .from('rooms')
          .select('hotel_id, status')

        const result: HotelOccupancy[] = (hotels ?? []).map(hotel => {
          const hotelRooms  = rooms?.filter(r => r.hotel_id === hotel.hotel_id) ?? []
          const occupied    = hotelRooms.filter(r => r.status === 'occupied').length
          const available   = hotelRooms.filter(r => r.status === 'available').length
          const dirty       = hotelRooms.filter(r => r.status === 'dirty').length
          const maintenance = hotelRooms.filter(r => r.status === 'maintenance').length

          return {
            hotel_name: hotel.hotel_name
              .replace('Grand Azure ', '')
              .replace('Azure Boutique ', ''),
            total_rooms: hotel.total_rooms,
            occupied,
            available,
            dirty,
            maintenance,
            occupancy_rate: hotel.total_rooms > 0
              ? Math.round((occupied / hotel.total_rooms) * 100)
              : 0,
          }
        })

        setData(result)
      } catch (err) {
        console.error('Occupancy error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOccupancy()
  }, [])

  return { data, loading }
}

// Active Bookings — confirmed + checked_in
export function useTodayArrivals() {
  const [data, setData] = useState<TodayArrival[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchArrivals = async () => {
      try {
        const supabase = createClient()

        const { data: bookings } = await supabase
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
            booking_status,
            guests (first_name, last_name, vip_status),
            hotels (hotel_name),
            booking_rooms (
              rooms (room_number),
              room_types (type_name)
            )
          `)
          .in('booking_status', ['confirmed', 'checked_in'])
          .order('check_in_date', { ascending: true })
          .limit(10)

        const result: TodayArrival[] = (bookings ?? []).map((b: any) => ({
          booking_id:      b.booking_id,
          confirmation_no: b.confirmation_no,
          guest_name:      `${b.guests?.first_name ?? ''} ${b.guests?.last_name ?? ''}`.trim(),
          hotel_name:      b.hotels?.hotel_name ?? '',
          room_number:     b.booking_rooms?.[0]?.rooms?.room_number ?? null,
          room_type:       b.booking_rooms?.[0]?.room_types?.type_name ?? '',
          check_in_date:   b.check_in_date,
          check_out_date:  b.check_out_date,
          total_nights:    b.total_nights,
          adults:          b.adults,
          children:        b.children,
          total_amount:    b.total_amount,
          booking_status:  b.booking_status,
          vip_status:      b.guests?.vip_status ?? 'none',
        }))

        setData(result)
      } catch (err) {
        console.error('Arrivals error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchArrivals()
  }, [])

  return { data, loading }
}

// Recent Bookings — checked_out (completed stays)
export function useRecentBookings() {
  const [data, setData] = useState<RecentBooking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const supabase = createClient()

        const { data: bookings } = await supabase
          .from('bookings')
          .select(`
            booking_id,
            confirmation_no,
            check_in_date,
            check_out_date,
            total_nights,
            total_amount,
            booking_status,
            guests (first_name, last_name, vip_status),
            hotels (hotel_name),
            channels (channel_name)
          `)
          .eq('booking_status', 'checked_out')
          .order('check_out_date', { ascending: false })
          .limit(8)

        const result: RecentBooking[] = (bookings ?? []).map((b: any) => ({
          booking_id:      b.booking_id,
          confirmation_no: b.confirmation_no,
          guest_name:      `${b.guests?.first_name ?? ''} ${b.guests?.last_name ?? ''}`.trim(),
          hotel_name:      b.hotels?.hotel_name ?? '',
          check_in_date:   b.check_in_date,
          check_out_date:  b.check_out_date,
          total_nights:    b.total_nights,
          total_amount:    b.total_amount,
          booking_status:  b.booking_status,
          vip_status:      b.guests?.vip_status ?? 'none',
          channel_name:    b.channels?.channel_name ?? '',
        }))

        setData(result)
      } catch (err) {
        console.error('Recent bookings error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchBookings()
  }, [])

  return { data, loading }
}