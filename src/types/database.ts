export type HotelStatus = 'active' | 'inactive'
export type RoomStatus = 'available' | 'occupied' | 'dirty' | 'maintenance' | 'blocked'
export type BookingStatus =
  | 'pending_payment'   // NEW — guest chose advance pay, waiting for screenshot upload
  | 'pending_approval'  // NEW — submitted (either pay-at-hotel or payment uploaded), awaiting admin
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled'
  | 'no_show'

export type PaymentMethod =
  | 'cash'
  | 'credit_card'
  | 'debit_card'
  | 'bank_transfer'
  | 'corporate_account'
  | 'jazzcash'          // NEW
  | 'pay_at_hotel'      // NEW

export type PaymentStatus =
  | 'pending'
  | 'pending_verification'  // NEW — screenshot uploaded, admin hasn't verified yet
  | 'verified'              // NEW — admin verified the JazzCash screenshot
  | 'completed'
  | 'failed'
  | 'refunded'

export type GenderType = 'male' | 'female' | 'other'
export type VipStatus = 'none' | 'silver' | 'gold' | 'platinum' | 'diamond'
export type EmploymentType = 'full_time' | 'part_time' | 'contract'
export type ShiftType = 'morning' | 'afternoon' | 'night' | 'flexible'
export type MaintenanceStatus = 'open' | 'in_progress' | 'completed' | 'cancelled'
export type HousekeepingStatus = 'scheduled' | 'in_progress' | 'completed' | 'skipped'
export type MealPlan = 'room_only' | 'bed_breakfast' | 'half_board' | 'full_board'
export type CancellationPolicy = 'flexible' | 'moderate' | 'strict' | 'non_refundable'

export interface Hotel {
  hotel_id: number
  hotel_name: string
  hotel_code: string
  brand: string
  star_rating: number
  address_line1: string
  city: string
  state_province: string
  country: string
  postal_code: string
  phone: string
  email: string
  website: string
  total_rooms: number
  currency_code: string
  created_at: string
}

export interface Department {
  department_id: number
  hotel_id: number
  dept_name: string
  dept_code: string
}

export interface StaffRole {
  role_id: number
  role_name: string
  role_category: string
  base_salary: number
}

export interface Staff {
  staff_id: number
  hotel_id: number
  department_id: number
  role_id: number
  employee_code: string
  first_name: string
  last_name: string
  email: string
  phone: string
  hire_date: string
  employment_type: EmploymentType
  salary: number
  shift: ShiftType
  manager_id: number | null
  is_active: boolean
  created_at: string
}

export interface RoomType {
  room_type_id: number
  hotel_id: number
  type_name: string
  type_category: string
  description: string
  max_occupancy: number
  base_price: number
  area_sqft: number
  bed_type: string
  bed_count: number
  view_type: string
}

export interface Room {
  room_id: number
  hotel_id: number
  room_type_id: number
  room_number: string
  floor_number: number
  status: RoomStatus
  is_smoking: boolean
  notes: string | null
  last_cleaned_at: string | null
}

export interface Guest {
  guest_id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  date_of_birth: string | null
  gender: GenderType | null
  nationality: string | null
  city: string | null
  country: string | null
  vip_status: VipStatus
  marketing_opt_in: boolean
  created_at: string
}

export interface Booking {
  booking_id: number
  hotel_id: number
  guest_id: number
  channel_id: number
  rate_plan_id: number
  confirmation_no: string
  booking_status: BookingStatus
  booking_source: string
  check_in_date: string
  check_out_date: string
  adults: number
  children: number
  total_nights: number
  total_amount: number
  tax_amount: number
  loyalty_points_earned: number
  special_requests: string | null
  created_at: string

  // ── Advance Payment fields (NEW) ──────────────────────────────────
  payment_method: PaymentMethod | null
  advance_payment_amount: number | null   // amount guest paid upfront (after 10% discount)
  discount_amount: number | null          // PKR value of 10% discount
  discount_applied: boolean               // true if advance pay chosen
  jazzcash_screenshot_url: string | null  // Supabase Storage URL of uploaded proof
  jazzcash_sender_number: string | null   // e.g. "03001234567"
  jazzcash_transaction_id: string | null  // optional — guest can enter if visible on receipt
  payment_status: PaymentStatus | null
  payment_verified_by: number | null      // staff_id who verified
  payment_verified_at: string | null

  // Joined fields
  guest?: Guest
  hotel?: Hotel
}

export interface Invoice {
  invoice_id: number
  booking_id: number
  hotel_id: number
  guest_id: number
  invoice_no: string
  invoice_date: string
  subtotal: number
  discount_amount: number        // NEW — 0 if no discount
  tax_rate: number
  tax_amount: number
  total_amount: number
  paid_amount: number
  balance_due: number
  payment_method: PaymentMethod | null
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  created_at: string
}

export interface Payment {
  payment_id: number
  invoice_id: number
  booking_id: number
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  amount: number
  currency_code: string
  transaction_ref: string | null
  paid_at: string | null
}

export interface LoyaltyTier {
  tier_id: number
  tier_name: string
  min_points: number
  points_multiplier: number
  benefits: string
}

export interface LoyaltyProgram {
  loyalty_id: number
  guest_id: number
  tier_id: number
  card_number: string
  total_points: number
  lifetime_points: number
  enrolled_at: string
  last_activity: string | null
  tier?: LoyaltyTier
}

export interface HousekeepingSchedule {
  schedule_id: number
  hotel_id: number
  room_id: number
  assigned_to: number
  scheduled_date: string
  task_type: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: HousekeepingStatus
  estimated_minutes: number
  notes: string | null
}

export interface MaintenanceRequest {
  request_id: number
  hotel_id: number
  room_id: number | null
  reported_by: number
  assigned_to: number | null
  request_type: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: MaintenanceStatus
  title: string
  description: string
  estimated_cost: number | null
  actual_cost: number | null
  started_at: string | null
  completed_at: string | null
  resolution_notes: string | null
  created_at: string
}

export interface Review {
  review_id: number
  hotel_id: number
  guest_id: number
  booking_id: number
  overall_rating: number
  cleanliness_rating: number
  service_rating: number
  location_rating: number
  value_rating: number
  title: string
  review_text: string
  platform: string
  is_verified: boolean
  is_published: boolean
  created_at: string
  guest?: Guest
}

export interface InventoryItem {
  item_id: number
  hotel_id: number
  category_id: number
  item_name: string
  sku: string
  unit: string
  unit_cost: number
  current_stock: number
  reorder_level: number
  max_stock: number
  supplier: string | null
}

export interface Restaurant {
  restaurant_id: number
  hotel_id: number
  restaurant_name: string
  cuisine_type: string
  capacity: number
  open_time: string
  close_time: string
  is_active: boolean
}

export interface ConferenceHall {
  hall_id: number
  hotel_id: number
  hall_name: string
  capacity_theatre: number | null
  capacity_boardroom: number | null
  capacity_banquet: number | null
  area_sqft: number
  hourly_rate: number
  full_day_rate: number
  is_active: boolean
}

// Dashboard summary types
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
}

export interface RevenueByHotel {
  hotel_name: string
  total_bookings: number
  total_revenue: number
}

export interface OccupancyData {
  date: string
  occupancy_rate: number
  revenue: number
}

// ── NEW: advance-payment workflow helpers ─────────────────────────────────────

/** Shape returned by the payment-choice step before booking is saved */
export interface AdvancePaymentIntent {
  bookingId: number
  confirmationNo: string
  guestEmail: string
  guestName: string
  hotelName: string
  roomTypeName: string
  checkIn: string
  checkOut: string
  totalNights: number
  originalAmount: number       // full price without discount
  discountAmount: number       // 10% of originalAmount
  advanceAmount: number        // what guest must pay now (originalAmount - discountAmount)
  balanceDue: number           // 0 because full advance; or remaining for partial
  jazzcashNumber: string       // hotel's JazzCash account number to send to
  accountName: string          // account holder name shown to guest
}

/** What the admin sees for a pending-payment booking */
export interface PendingPaymentReview {
  booking: Booking
  screenshotUrl: string | null
  senderNumber: string | null
  transactionId: string | null
  advanceAmount: number
  discountAmount: number
}