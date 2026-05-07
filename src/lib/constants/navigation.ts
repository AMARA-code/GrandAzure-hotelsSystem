import {
  LayoutDashboard, CalendarCheck, BedDouble, Users,
  Sparkles, Wrench, Receipt, UserSquare2, Star,
  Package, MessageSquare, BarChart3, Building2, UtensilsCrossed
} from 'lucide-react'

export const navigation = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard',    href: '/dashboard',    icon: LayoutDashboard, color: 'text-azure-600' },
      { name: 'Analytics',    href: '/analytics',    icon: BarChart3,       color: 'text-violet-600' },
    ]
  },
  {
    title: 'Operations',
    items: [
      { name: 'Bookings',     href: '/bookings',     icon: CalendarCheck,   color: 'text-emerald-600' },
      { name: 'Rooms',        href: '/rooms',        icon: BedDouble,       color: 'text-azure-500' },
      { name: 'Housekeeping', href: '/housekeeping', icon: Sparkles,        color: 'text-gold-500' },
      { name: 'Maintenance',  href: '/maintenance',  icon: Wrench,          color: 'text-rose-500' },
      { name: 'Restaurants',  href: '/restaurants',  icon: UtensilsCrossed, color: 'text-amber-600' },
    ]
  },
  {
    title: 'Guests & Loyalty',
    items: [
      { name: 'Guests',       href: '/guests',       icon: Users,           color: 'text-azure-600' },
      { name: 'Loyalty',      href: '/loyalty',      icon: Star,            color: 'text-gold-500' },
      { name: 'Reviews',      href: '/reviews',      icon: MessageSquare,   color: 'text-emerald-600' },
    ]
  },
  {
    title: 'Finance & Stock',
    items: [
      { name: 'Finance',      href: '/finance',      icon: Receipt,         color: 'text-emerald-600' },
      { name: 'Inventory',    href: '/inventory',    icon: Package,         color: 'text-gold-600' },
    ]
  },
  {
    title: 'Management',
    items: [
      { name: 'Staff',        href: '/staff',        icon: UserSquare2,     color: 'text-violet-600' },
      { name: 'Conference',   href: '/conference',   icon: Building2,       color: 'text-azure-600' },
    ]
  },
]

export const guestNavigation = [
  { name: 'Home',        href: '/' },
  { name: 'Our Hotels',  href: '/hotels' },
  { name: 'Book a Room', href: '/book' },
  { name: 'My Account',  href: '/my-account' },
]