'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Restaurant, RestaurantOrder, FnBStats, RestaurantWithStats } from '@/types/restaurant'

export function useRestaurants(hotelId?: number) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      let query = supabase
        .from('restaurants')
        .select('*, hotels(hotel_name)')
        .order('restaurant_name')
      if (hotelId) query = query.eq('hotel_id', hotelId)
      const { data, error } = await query
      if (error) throw error
      const mapped = (data || []).map((r: any) => ({
        ...r,
        hotel_name: r.hotels?.hotel_name ?? '',
      }))
      setRestaurants(mapped)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [hotelId])

  useEffect(() => { fetch() }, [fetch])
  return { restaurants, loading, error, refetch: fetch }
}

export function useRestaurantOrders(restaurantId?: number, limit = 50) {
  const [orders, setOrders] = useState<RestaurantOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      let query = supabase
        .from('restaurant_orders')
        .select(`
          *,
          restaurants(restaurant_name, hotels(hotel_name)),
          guests(first_name, last_name),
          staff!taken_by(first_name, last_name)
        `)
        .order('ordered_at', { ascending: false })
        .limit(limit)
      if (restaurantId) query = query.eq('restaurant_id', restaurantId)
      const { data, error } = await query
      if (error) throw error
      const mapped = (data || []).map((o: any) => ({
        ...o,
        restaurant_name: o.restaurants?.restaurant_name ?? '',
        hotel_name: o.restaurants?.hotels?.hotel_name ?? '',
        guest_name: o.guests ? `${o.guests.first_name} ${o.guests.last_name}` : 'Walk-in Guest',
        staff_name: o.staff ? `${o.staff.first_name} ${o.staff.last_name}` : 'Unknown',
      }))
      setOrders(mapped)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [restaurantId, limit])

  useEffect(() => { fetch() }, [fetch])
  return { orders, loading, error, refetch: fetch }
}

export function useFnBStats() {
  const [stats, setStats] = useState<FnBStats | null>(null)
  const [restaurantStats, setRestaurantStats] = useState<RestaurantWithStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()

        const { data: orders } = await supabase
          .from('restaurant_orders')
          .select('total_amount, order_type, status, guest_id')

        if (orders) {
          const total_revenue = orders.reduce((s, o) => s + parseFloat(o.total_amount), 0)
          setStats({
            total_orders: orders.length,
            total_revenue,
            avg_order_value: orders.length ? total_revenue / orders.length : 0,
            unique_guests: new Set(orders.map((o: any) => o.guest_id).filter(Boolean)).size,
            dine_in_orders: orders.filter((o: any) => o.order_type === 'dine_in').length,
            room_service_orders: orders.filter((o: any) => o.order_type === 'room_service').length,
            pending_orders: orders.filter((o: any) => o.status === 'pending').length,
            served_orders: orders.filter((o: any) => o.status === 'served').length,
          })
        }

        const { data: rests } = await supabase
          .from('restaurants')
          .select('*, hotels(hotel_name)')

        const { data: allOrders } = await supabase
          .from('restaurant_orders')
          .select('restaurant_id, total_amount')

        if (rests && allOrders) {
          const mapped = rests.map((r: any) => {
            const ro = allOrders.filter((o: any) => o.restaurant_id === r.restaurant_id)
            return {
              ...r,
              hotel_name: r.hotels?.hotel_name ?? '',
              order_count: ro.length,
              revenue: ro.reduce((s: number, o: any) => s + parseFloat(o.total_amount), 0),
            }
          })
          setRestaurantStats(mapped)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return { stats, restaurantStats, loading }
}

export async function createOrder(payload: Partial<RestaurantOrder>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('restaurant_orders')
    .insert([payload])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateOrderStatus(orderId: number, status: string, servedAt?: string) {
  const supabase = createClient()
  const update: any = { status }
  if (servedAt) update.served_at = servedAt
  const { error } = await supabase
    .from('restaurant_orders')
    .update(update)
    .eq('order_id', orderId)
  if (error) throw error
}