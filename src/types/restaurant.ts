export type OrderType = 'dine_in' | 'room_service' | 'takeaway'
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled'

export interface Restaurant {
  restaurant_id: number
  hotel_id: number
  restaurant_name: string
  cuisine_type: string | null
  capacity: number | null
  open_time: string | null
  close_time: string | null
  is_active: boolean
  created_at: string
  hotel_name?: string
}

export interface RestaurantOrder {
  order_id: number
  restaurant_id: number
  booking_id: number | null
  guest_id: number | null
  taken_by: number
  table_no: string | null
  order_type: OrderType
  status: OrderStatus
  total_amount: string
  charged_to_room: boolean
  notes: string | null
  ordered_at: string
  served_at: string | null
  // joined
  restaurant_name?: string
  guest_name?: string
  staff_name?: string
  hotel_name?: string
}

export interface FnBStats {
  total_orders: number
  total_revenue: number
  avg_order_value: number
  unique_guests: number
  dine_in_orders: number
  room_service_orders: number
  pending_orders: number
  served_orders: number
}

export interface RestaurantWithStats extends Restaurant {
  order_count: number
  revenue: number
}