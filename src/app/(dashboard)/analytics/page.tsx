'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import {
  TrendingUp, Users, Star, DollarSign, BarChart2, Activity,
  Award, Filter, Download, RefreshCw, Bed, Calendar,
  ArrowUpRight, ArrowDownRight, Sparkles, Globe, Target,
  X, Check, CheckCircle2
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface RevenueSummary {
  hotel_id: number; hotel_name: string; month_year: string
  bookings: number; room_nights: number; gross_revenue: string
  tax_collected: string; net_revenue: string; adr: string
  revpar_approx: string; unique_guests: number
}
interface OccupancyRow {
  hotel_id: number; hotel_name: string; city: string; star_rating: number
  total_rooms: number; available: number; occupied: number
  dirty: number; maintenance: number; out_of_order: number; occupancy_pct: string
}
interface BookingStat {
  hotel_name: string; total_bookings: number; confirmed: number
  checked_in: number; checked_out: number; cancelled: number
  avg_stay_nights: string; total_booking_value: string
}
interface RoomTypePerf {
  room_type: string; base_price: string; total_bookings: number
  total_revenue: string; avg_nights: string; unique_guests: number
}
interface ReviewStat {
  hotel_name: string; total_reviews: number; avg_overall: string
  avg_cleanliness: string; avg_service: string; avg_location: string
  avg_value: string; positive_reviews: number; negative_reviews: number
}
interface LoyaltyStat {
  tier_name: string; guest_count: number; avg_points: string; total_lifetime_points: number
}

// ─── Constants ────────────────────────────────────────────────────────────────
const HOTELS = ['Grand Azure Karachi', 'Grand Azure Lahore', 'Azure Boutique Islamabad']
const MONTHS = ['2026-01','2026-02','2026-03','2026-04','2026-05']
const MONTHS_SHORT: Record<string,string> = {
  '2026-01':'Jan','2026-02':'Feb','2026-03':'Mar','2026-04':'Apr','2026-05':'May'
}
const HOTEL_COLORS: Record<string,string> = {
  'Grand Azure Karachi':'#0e8ee6',
  'Grand Azure Lahore':'#8b5cf6',
  'Azure Boutique Islamabad':'#10b981',
}
const TIER_COLORS: Record<string,string> = {
  Diamond:'#0e8ee6', Platinum:'#8b5cf6', Gold:'#f59e0b', Silver:'#94a3b8',
}
const BAR_COLORS = ['#0e8ee6','#8b5cf6','#10b981','#f59e0b','#f43f5e','#06b6d4']

// ─── Static Data ──────────────────────────────────────────────────────────────
const ALL_REVENUE: RevenueSummary[] = [
  { hotel_id:1, hotel_name:'Grand Azure Karachi',       month_year:'2026-01', bookings:4, room_nights:16, gross_revenue:'867000',  tax_collected:'138720', net_revenue:'728280',  adr:'54187.50', revpar_approx:'10837.50', unique_guests:4 },
  { hotel_id:2, hotel_name:'Grand Azure Lahore',        month_year:'2026-01', bookings:1, room_nights:4,  gross_revenue:'80000',   tax_collected:'12800',  net_revenue:'67200',   adr:'20000.00', revpar_approx:'1333.33',  unique_guests:1 },
  { hotel_id:3, hotel_name:'Azure Boutique Islamabad',  month_year:'2026-01', bookings:1, room_nights:3,  gross_revenue:'30000',   tax_collected:'4800',   net_revenue:'25200',   adr:'10000.00', revpar_approx:'750.00',   unique_guests:1 },
  { hotel_id:1, hotel_name:'Grand Azure Karachi',       month_year:'2026-02', bookings:3, room_nights:11, gross_revenue:'595000',  tax_collected:'95200',  net_revenue:'499800',  adr:'54090.91', revpar_approx:'7437.50',  unique_guests:3 },
  { hotel_id:2, hotel_name:'Grand Azure Lahore',        month_year:'2026-02', bookings:1, room_nights:3,  gross_revenue:'36000',   tax_collected:'5760',   net_revenue:'30240',   adr:'12000.00', revpar_approx:'600.00',   unique_guests:1 },
  { hotel_id:3, hotel_name:'Azure Boutique Islamabad',  month_year:'2026-02', bookings:1, room_nights:4,  gross_revenue:'72000',   tax_collected:'11520',  net_revenue:'60480',   adr:'18000.00', revpar_approx:'1800.00',  unique_guests:1 },
  { hotel_id:1, hotel_name:'Grand Azure Karachi',       month_year:'2026-03', bookings:3, room_nights:15, gross_revenue:'881000',  tax_collected:'140960', net_revenue:'740040',  adr:'58733.33', revpar_approx:'11012.50', unique_guests:3 },
  { hotel_id:2, hotel_name:'Grand Azure Lahore',        month_year:'2026-03', bookings:1, room_nights:5,  gross_revenue:'100000',  tax_collected:'16000',  net_revenue:'84000',   adr:'20000.00', revpar_approx:'1666.67',  unique_guests:1 },
  { hotel_id:3, hotel_name:'Azure Boutique Islamabad',  month_year:'2026-03', bookings:1, room_nights:7,  gross_revenue:'245000',  tax_collected:'39200',  net_revenue:'205800',  adr:'35000.00', revpar_approx:'6125.00',  unique_guests:1 },
  { hotel_id:1, hotel_name:'Grand Azure Karachi',       month_year:'2026-04', bookings:3, room_nights:12, gross_revenue:'717000',  tax_collected:'114720', net_revenue:'602280',  adr:'59750.00', revpar_approx:'8962.50',  unique_guests:3 },
  { hotel_id:2, hotel_name:'Grand Azure Lahore',        month_year:'2026-04', bookings:1, room_nights:4,  gross_revenue:'80000',   tax_collected:'12800',  net_revenue:'67200',   adr:'20000.00', revpar_approx:'1333.33',  unique_guests:1 },
  { hotel_id:3, hotel_name:'Azure Boutique Islamabad',  month_year:'2026-04', bookings:1, room_nights:4,  gross_revenue:'40000',   tax_collected:'6400',   net_revenue:'33600',   adr:'10000.00', revpar_approx:'1000.00',  unique_guests:1 },
  { hotel_id:1, hotel_name:'Grand Azure Karachi',       month_year:'2026-05', bookings:2, room_nights:7,  gross_revenue:'117000',  tax_collected:'18720',  net_revenue:'98280',   adr:'16714.29', revpar_approx:'1462.50',  unique_guests:2 },
  { hotel_id:2, hotel_name:'Grand Azure Lahore',        month_year:'2026-05', bookings:1, room_nights:4,  gross_revenue:'48000',   tax_collected:'7680',   net_revenue:'40320',   adr:'12000.00', revpar_approx:'800.00',   unique_guests:1 },
]

const ALL_OCCUPANCY: OccupancyRow[] = [
  { hotel_id:1, hotel_name:'Grand Azure Karachi',      city:'Karachi',   star_rating:5, total_rooms:80, available:69, occupied:3, dirty:8, maintenance:0, out_of_order:0, occupancy_pct:'3.75' },
  { hotel_id:2, hotel_name:'Grand Azure Lahore',       city:'Lahore',    star_rating:5, total_rooms:60, available:59, occupied:1, dirty:0, maintenance:0, out_of_order:0, occupancy_pct:'1.67' },
  { hotel_id:3, hotel_name:'Azure Boutique Islamabad', city:'Islamabad', star_rating:4, total_rooms:40, available:39, occupied:1, dirty:0, maintenance:0, out_of_order:0, occupancy_pct:'2.50' },
]

const ALL_BOOKINGS: BookingStat[] = [
  { hotel_name:'Grand Azure Karachi',      total_bookings:22, confirmed:2, checked_in:4, checked_out:15, cancelled:1, avg_stay_nights:'4.3', total_booking_value:'5137000' },
  { hotel_name:'Grand Azure Lahore',       total_bookings:6,  confirmed:0, checked_in:1, checked_out:5,  cancelled:0, avg_stay_nights:'4.0', total_booking_value:'392000'  },
  { hotel_name:'Azure Boutique Islamabad', total_bookings:5,  confirmed:0, checked_in:1, checked_out:4,  cancelled:0, avg_stay_nights:'4.4', total_booking_value:'459000'  },
]

const ROOM_PERF: RoomTypePerf[] = [
  { room_type:'Presidential Suite',   base_price:'95000', total_bookings:7, total_revenue:'3945000', avg_nights:'5.9', unique_guests:4 },
  { room_type:'Deluxe Sea View',      base_price:'25000', total_bookings:7, total_revenue:'739000',  avg_nights:'3.6', unique_guests:5 },
  { room_type:'Standard Room',        base_price:'15000', total_bookings:6, total_revenue:'453000',  avg_nights:'3.5', unique_guests:6 },
  { room_type:'Executive Suite',      base_price:'35000', total_bookings:1, total_revenue:'245000',  avg_nights:'7.0', unique_guests:1 },
  { room_type:'Deluxe Garden View',   base_price:'20000', total_bookings:2, total_revenue:'180000',  avg_nights:'4.5', unique_guests:2 },
  { room_type:'Margalla View Deluxe', base_price:'18000', total_bookings:2, total_revenue:'144000',  avg_nights:'4.0', unique_guests:2 },
]

const ALL_REVIEWS: ReviewStat[] = [
  { hotel_name:'Grand Azure Karachi',      total_reviews:6, avg_overall:'9.17', avg_cleanliness:'9.17', avg_service:'9.50', avg_location:'9.00', avg_value:'8.00', positive_reviews:6, negative_reviews:0 },
  { hotel_name:'Azure Boutique Islamabad', total_reviews:1, avg_overall:'8.00', avg_cleanliness:'8.00', avg_service:'9.00', avg_location:'9.00', avg_value:'8.00', positive_reviews:1, negative_reviews:0 },
  { hotel_name:'Grand Azure Lahore',       total_reviews:1, avg_overall:'8.00', avg_cleanliness:'9.00', avg_service:'8.00', avg_location:'8.00', avg_value:'8.00', positive_reviews:1, negative_reviews:0 },
]

const LOYALTY_STATS: LoyaltyStat[] = [
  { tier_name:'Diamond', guest_count:3, avg_points:'148333', total_lifetime_points:655000 },
  { tier_name:'Platinum',guest_count:4, avg_points:'61500',  total_lifetime_points:344000 },
  { tier_name:'Gold',    guest_count:4, avg_points:'23875',  total_lifetime_points:146000 },
  { tier_name:'Silver',  guest_count:1, avg_points:'8200',   total_lifetime_points:12000  },
]

const RADAR_DATA = [
  { subject:'Overall',     Karachi:9.17, Lahore:8.00, Islamabad:8.00 },
  { subject:'Cleanliness', Karachi:9.17, Lahore:9.00, Islamabad:8.00 },
  { subject:'Service',     Karachi:9.50, Lahore:8.00, Islamabad:9.00 },
  { subject:'Location',    Karachi:9.00, Lahore:8.00, Islamabad:9.00 },
  { subject:'Value',       Karachi:8.00, Lahore:8.00, Islamabad:8.00 },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtShort = (n: number) => {
  if (n >= 1_000_000) return `PKR ${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000)     return `PKR ${(n / 1_000).toFixed(0)}K`
  return `PKR ${n}`
}

const shortHotelName = (name: string) =>
  name.replace('Grand Azure ', '').replace('Azure Boutique ', 'Boutique ')

// ─── CSV Export ───────────────────────────────────────────────────────────────
function downloadCSV(type: string, filteredRevenue: RevenueSummary[], filteredBookings: BookingStat[]) {
  let csv = '\uFEFF' // BOM for Excel
  let filename = ''

  if (type === 'revenue' || type === 'all') {
    csv += 'REVENUE SUMMARY\r\n'
    csv += 'Hotel,Month,Bookings,Room Nights,Gross Revenue (PKR),Tax (PKR),Net Revenue (PKR),ADR (PKR),RevPAR (PKR),Unique Guests\r\n'
    filteredRevenue.forEach(r => {
      csv += `"${r.hotel_name}","${MONTHS_SHORT[r.month_year]}",${r.bookings},${r.room_nights},${r.gross_revenue},${r.tax_collected},${r.net_revenue},${parseFloat(r.adr).toFixed(0)},${parseFloat(r.revpar_approx).toFixed(0)},${r.unique_guests}\r\n`
    })
    csv += '\r\n'
  }
  if (type === 'bookings' || type === 'all') {
    csv += 'BOOKING STATISTICS\r\n'
    csv += 'Hotel,Total Bookings,Confirmed,Checked In,Checked Out,Cancelled,Avg Stay (Nights),Total Value (PKR)\r\n'
    filteredBookings.forEach(b => {
      csv += `"${b.hotel_name}",${b.total_bookings},${b.confirmed},${b.checked_in},${b.checked_out},${b.cancelled},${b.avg_stay_nights},${b.total_booking_value}\r\n`
    })
    csv += '\r\n'
  }
  if (type === 'occupancy' || type === 'all') {
    csv += 'OCCUPANCY REPORT\r\n'
    csv += 'Hotel,City,Star Rating,Total Rooms,Available,Occupied,Dirty,Maintenance,Out of Order,Occupancy %\r\n'
    ALL_OCCUPANCY.forEach(h => {
      csv += `"${h.hotel_name}","${h.city}",${h.star_rating},${h.total_rooms},${h.available},${h.occupied},${h.dirty},${h.maintenance},${h.out_of_order},${h.occupancy_pct}\r\n`
    })
    csv += '\r\n'
  }
  if (type === 'roomperf' || type === 'all') {
    csv += 'ROOM TYPE PERFORMANCE\r\n'
    csv += 'Room Type,Base Price (PKR),Total Bookings,Total Revenue (PKR),Avg Nights,Unique Guests\r\n'
    ROOM_PERF.forEach(r => {
      csv += `"${r.room_type}",${r.base_price},${r.total_bookings},${r.total_revenue},${r.avg_nights},${r.unique_guests}\r\n`
    })
    csv += '\r\n'
  }
  if (type === 'reviews' || type === 'all') {
    csv += 'REVIEWS & RATINGS\r\n'
    csv += 'Hotel,Total Reviews,Overall,Cleanliness,Service,Location,Value,Positive,Negative\r\n'
    ALL_REVIEWS.forEach(r => {
      csv += `"${r.hotel_name}",${r.total_reviews},${r.avg_overall},${r.avg_cleanliness},${r.avg_service},${r.avg_location},${r.avg_value},${r.positive_reviews},${r.negative_reviews}\r\n`
    })
    csv += '\r\n'
  }
  if (type === 'loyalty' || type === 'all') {
    csv += 'LOYALTY PROGRAM\r\n'
    csv += 'Tier,Guest Count,Avg Points,Total Lifetime Points\r\n'
    LOYALTY_STATS.forEach(l => {
      csv += `"${l.tier_name}",${l.guest_count},${l.avg_points},${l.total_lifetime_points}\r\n`
    })
  }

  const labels: Record<string,string> = {
    revenue:'revenue-summary', bookings:'booking-stats', occupancy:'occupancy-report',
    roomperf:'room-performance', reviews:'reviews-ratings', loyalty:'loyalty-program', all:'all-reports',
  }
  filename = `grand-azure-${labels[type] ?? type}-${new Date().toISOString().slice(0,10)}.csv`

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// ─── Sub-components ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white/95 backdrop-blur-sm shadow-premium-lg rounded-xl p-3 border border-slate-200 text-xs max-w-[220px]">
      <p className="font-bold text-slate-700 mb-2 border-b border-slate-100 pb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-slate-500 truncate">{p.name}:</span>
          <span className="font-bold text-slate-800 ml-auto pl-2">
            {typeof p.value === 'number' && p.value > 999 ? fmtShort(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

function KpiCard({ title, value, sub, icon, gradient, delay, trend, trendVal }: {
  title: string; value: string; sub: string; icon: React.ReactNode
  gradient: string; delay: number; trend?: 'up'|'down'|'neutral'; trendVal?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22,1,0.36,1] }}
      className="relative overflow-hidden rounded-2xl bg-white shadow-premium border border-slate-100 p-4 sm:p-5 hover:shadow-premium-lg transition-all duration-300"
    >
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 blur-2xl ${gradient}`} />
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${gradient} shadow-md`}>{icon}</div>
        {trend && trendVal && (
          <span className={`flex items-center gap-1 text-[10px] sm:text-xs font-semibold px-2 py-1 rounded-full ${
            trend==='up' ? 'bg-emerald-50 text-emerald-600' : trend==='down' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-500'
          }`}>
            {trend==='up' ? <ArrowUpRight className="w-3 h-3"/> : trend==='down' ? <ArrowDownRight className="w-3 h-3"/> : null}
            {trendVal}
          </span>
        )}
      </div>
      <p className="text-[10px] sm:text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">{title}</p>
      <p className="text-xl sm:text-2xl font-bold text-slate-800 font-display leading-tight">{value}</p>
      <p className="text-[10px] sm:text-xs text-slate-400 mt-1">{sub}</p>
    </motion.div>
  )
}

function SectionHeader({ title, sub, icon }: { title: string; sub: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4 sm:mb-5">
      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl gradient-azure flex items-center justify-center shadow-azure flex-shrink-0">{icon}</div>
      <div>
        <h2 className="text-sm sm:text-base font-bold text-slate-800 font-display">{title}</h2>
        <p className="text-[10px] sm:text-xs text-slate-400">{sub}</p>
      </div>
    </div>
  )
}

function Toast({ message, show }: { message: string; show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity:0, y:40, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:20, scale:0.95 }}
          className="fixed bottom-6 right-4 sm:right-6 z-[200] flex items-center gap-2 bg-slate-900 text-white text-xs font-medium px-4 py-3 rounded-2xl shadow-premium-xl max-w-[90vw]"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Filter Drawer ────────────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, selHotels, setSelHotels, selMonths, setSelMonths, onApply }: {
  open: boolean; onClose: () => void
  selHotels: string[]; setSelHotels: (v:string[]) => void
  selMonths: string[]; setSelMonths: (v:string[]) => void
  onApply: () => void
}) {
  const toggleHotel = (h: string) =>
    setSelHotels(selHotels.includes(h) ? selHotels.filter(x=>x!==h) : [...selHotels,h])
  const toggleMonth = (m: string) =>
    setSelMonths(selMonths.includes(m) ? selMonths.filter(x=>x!==m) : [...selMonths,m])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose}
            className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px]" />
          <motion.div
            initial={{opacity:0, x:320}} animate={{opacity:1, x:0}} exit={{opacity:0, x:320}}
            transition={{type:'spring', stiffness:300, damping:30}}
            className="fixed top-0 right-0 h-full w-80 max-w-[92vw] z-50 bg-white shadow-premium-xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl gradient-azure flex items-center justify-center shadow-azure">
                  <Filter className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Filter Analytics</p>
                  <p className="text-[10px] text-slate-400">Narrow down the data view</p>
                </div>
              </div>
              <button onClick={onClose}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-7">
              {/* Properties */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Properties</p>
                  <div className="flex gap-2">
                    <button onClick={()=>setSelHotels([...HOTELS])} className="text-[10px] font-semibold text-azure-600 hover:underline">All</button>
                    <span className="text-slate-300">·</span>
                    <button onClick={()=>setSelHotels([])} className="text-[10px] font-semibold text-slate-400 hover:underline">None</button>
                  </div>
                </div>
                <div className="space-y-2">
                  {HOTELS.map(h => (
                    <button key={h} onClick={()=>toggleHotel(h)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left ${
                        selHotels.includes(h) ? 'border-azure-200 bg-azure-50' : 'border-slate-100 bg-slate-50/70 hover:border-slate-200 hover:bg-slate-50'
                      }`}>
                      <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all ${
                        selHotels.includes(h) ? 'gradient-azure' : 'border-2 border-slate-300 bg-white'
                      }`}>
                        {selHotels.includes(h) && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{background:HOTEL_COLORS[h]}} />
                      <span className={`text-xs font-medium truncate flex-1 ${selHotels.includes(h)?'text-azure-700':'text-slate-600'}`}>{h}</span>
                      {selHotels.includes(h) && <Check className="w-3 h-3 text-azure-500 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Months */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Months</p>
                  <div className="flex gap-2">
                    <button onClick={()=>setSelMonths([...MONTHS])} className="text-[10px] font-semibold text-azure-600 hover:underline">All</button>
                    <span className="text-slate-300">·</span>
                    <button onClick={()=>setSelMonths([])} className="text-[10px] font-semibold text-slate-400 hover:underline">None</button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {MONTHS.map(m => (
                    <button key={m} onClick={()=>toggleMonth(m)}
                      className={`py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        selMonths.includes(m) ? 'border-azure-300 bg-azure-50 text-azure-700' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                      }`}>
                      {MONTHS_SHORT[m]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary badge */}
              <div className={`p-3.5 rounded-xl border transition-all ${
                selHotels.length===HOTELS.length && selMonths.length===MONTHS.length
                  ? 'bg-slate-50 border-slate-100' : 'bg-amber-50 border-amber-100'
              }`}>
                <p className="text-xs font-bold text-slate-700 mb-1">
                  {selHotels.length===HOTELS.length && selMonths.length===MONTHS.length ? '✅ Showing all data' : '⚠️ Filtered view'}
                </p>
                <p className="text-[10px] text-slate-500">
                  {selHotels.length} of {HOTELS.length} hotels · {selMonths.length} of {MONTHS.length} months selected
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-slate-100 flex gap-2.5">
              <button onClick={()=>{setSelHotels([...HOTELS]);setSelMonths([...MONTHS])}}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                Reset
              </button>
              <button onClick={onApply}
                className="flex-1 py-2.5 rounded-xl gradient-azure text-white text-xs font-semibold shadow-azure hover:opacity-90 transition-all">
                Apply Filters
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Export Modal ─────────────────────────────────────────────────────────────
function ExportModal({ open, onClose, onExport }: {
  open: boolean; onClose: () => void; onExport: (type: string) => void
}) {
  const options = [
    { id:'revenue',   label:'Revenue Summary',      sub:'Monthly revenue by hotel',       icon:'💰' },
    { id:'bookings',  label:'Booking Statistics',    sub:'Bookings by hotel & status',     icon:'📋' },
    { id:'occupancy', label:'Occupancy Report',      sub:'Room status & occupancy %',      icon:'🏨' },
    { id:'roomperf',  label:'Room Performance',      sub:'Revenue per room category',      icon:'🛏️' },
    { id:'reviews',   label:'Reviews & Ratings',     sub:'Guest satisfaction scores',      icon:'⭐' },
    { id:'loyalty',   label:'Loyalty Program',       sub:'Tier distribution & points',     icon:'🎖️' },
  ]

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" />
          <motion.div
            initial={{opacity:0,scale:0.95,y:16}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.95,y:16}}
            transition={{type:'spring',stiffness:340,damping:28}}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-premium-xl border border-slate-100 w-full max-w-sm">
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md">
                    <Download className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Export Report</p>
                    <p className="text-[10px] text-slate-400">Downloads as .csv file</p>
                  </div>
                </div>
                <button onClick={onClose}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              <div className="p-4 grid grid-cols-2 gap-2">
                {options.map(opt => (
                  <button key={opt.id} onClick={()=>{onExport(opt.id);onClose()}}
                    className="flex items-start gap-2 p-3 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/60 transition-all text-left group">
                    <span className="text-lg flex-shrink-0">{opt.icon}</span>
                    <div>
                      <p className="text-xs font-semibold text-slate-700 group-hover:text-emerald-700 transition-colors leading-tight">{opt.label}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{opt.sub}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="px-4 pb-4">
                <button onClick={()=>{onExport('all');onClose()}}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2">
                  <Download className="w-3.5 h-3.5" />
                  Export All Reports (CSV)
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function AnalyticsPage() {
  const [activeTab, setActiveTab]           = useState<'overview'|'revenue'|'occupancy'|'guests'|'reviews'>('overview')
  const [loading, setLoading]               = useState(false)
  const [filterOpen, setFilterOpen]         = useState(false)
  const [exportOpen, setExportOpen]         = useState(false)
  const [selHotels, setSelHotels]           = useState<string[]>([...HOTELS])
  const [selMonths, setSelMonths]           = useState<string[]>([...MONTHS])
  const [appliedHotels, setAppliedHotels]   = useState<string[]>([...HOTELS])
  const [appliedMonths, setAppliedMonths]   = useState<string[]>([...MONTHS])
  const [toast, setToast]                   = useState({ show:false, message:'' })
  const [refreshKey, setRefreshKey]         = useState(0)

  const showToast = (msg: string) => {
    setToast({ show:true, message:msg })
    setTimeout(() => setToast({ show:false, message:'' }), 3000)
  }

  const handleApply = () => {
    setAppliedHotels([...selHotels])
    setAppliedMonths([...selMonths])
    setFilterOpen(false)
    showToast(`Filters applied — ${selHotels.length} hotels · ${selMonths.length} months`)
  }

  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => { setLoading(false); setRefreshKey(k=>k+1); showToast('Data refreshed successfully') }, 1200)
  }

  const handleExport = (type: string) => {
    downloadCSV(type, filteredRevenue, filteredBookings)
    const labels: Record<string,string> = {
      revenue:'Revenue Summary', bookings:'Booking Statistics', occupancy:'Occupancy Report',
      roomperf:'Room Performance', reviews:'Reviews & Ratings', loyalty:'Loyalty Program', all:'All Reports',
    }
    showToast(`Downloaded "${labels[type]}" as CSV`)
  }

  const clearFilters = () => {
    setSelHotels([...HOTELS]); setSelMonths([...MONTHS])
    setAppliedHotels([...HOTELS]); setAppliedMonths([...MONTHS])
    showToast('All filters cleared')
  }

  // ── Derived/filtered data ──
  const filteredRevenue   = ALL_REVENUE.filter(r => appliedHotels.includes(r.hotel_name) && appliedMonths.includes(r.month_year))
  const filteredBookings  = ALL_BOOKINGS.filter(b => appliedHotels.includes(b.hotel_name))
  const filteredOccupancy = ALL_OCCUPANCY.filter(h => appliedHotels.includes(h.hotel_name))
  const filteredReviews   = ALL_REVIEWS.filter(r => appliedHotels.includes(r.hotel_name))

  // KPIs
  const totalNetRevenue  = filteredRevenue.reduce((s,r)=>s+parseFloat(r.net_revenue),0)
  const totalBookings    = filteredBookings.reduce((s,b)=>s+b.total_bookings,0)
  const totalRooms       = filteredOccupancy.reduce((s,h)=>s+h.total_rooms,0)
  const totalOccupied    = filteredOccupancy.reduce((s,h)=>s+h.occupied,0)
  const overallOccupancy = totalRooms>0 ? ((totalOccupied/totalRooms)*100).toFixed(1) : '0.0'
  const avgRating        = filteredReviews.length>0
    ? (filteredReviews.reduce((s,r)=>s+parseFloat(r.avg_overall),0)/filteredReviews.length).toFixed(1) : '—'

  const activeFilterCount = (appliedHotels.length<HOTELS.length?1:0)+(appliedMonths.length<MONTHS.length?1:0)

  // Chart data
  const revenueChartData = appliedMonths.map(m => {
    const row: Record<string,any> = { month: MONTHS_SHORT[m] }
    filteredRevenue.filter(r=>r.month_year===m).forEach(r => { row[r.hotel_name] = Math.round(parseFloat(r.net_revenue)) })
    return row
  })
  const adrChartData = appliedMonths.map(m => {
    const row: Record<string,any> = { month: MONTHS_SHORT[m] }
    filteredRevenue.filter(r=>r.month_year===m).forEach(r => { row[r.hotel_name] = Math.round(parseFloat(r.adr)) })
    return row
  })
  const occupancyPieData = filteredOccupancy.map(h=>({ name:h.city, value:h.occupied, color:HOTEL_COLORS[h.hotel_name] }))
  const roomBarData = ROOM_PERF.map(r=>({ name:r.room_type.length>16?r.room_type.slice(0,14)+'…':r.room_type, revenue:Math.round(parseFloat(r.total_revenue)), bookings:r.total_bookings }))
  const loyaltyPieData = LOYALTY_STATS.map(l=>({ name:l.tier_name, value:l.guest_count, color:TIER_COLORS[l.tier_name] }))
  const bookingStatusData = filteredBookings.map(b=>({
    hotel: b.hotel_name.replace('Grand Azure ','GA ').replace('Azure Boutique ','Boutique '),
    Confirmed:b.confirmed, 'Checked In':b.checked_in, 'Checked Out':b.checked_out, Cancelled:b.cancelled,
  }))

  const TABS = [
    { id:'overview',  label:'Overview',  icon:<BarChart2 className="w-3.5 h-3.5"/> },
    { id:'revenue',   label:'Revenue',   icon:<TrendingUp className="w-3.5 h-3.5"/> },
    { id:'occupancy', label:'Occupancy', icon:<Bed className="w-3.5 h-3.5"/> },
    { id:'guests',    label:'Guests',    icon:<Users className="w-3.5 h-3.5"/> },
    { id:'reviews',   label:'Reviews',   icon:<Star className="w-3.5 h-3.5"/> },
  ]

  return (
    <div className="min-h-screen bg-slate-50/60 p-3 sm:p-4 lg:p-6">
      <Toast message={toast.message} show={toast.show} />
      <FilterDrawer open={filterOpen} onClose={()=>setFilterOpen(false)}
        selHotels={selHotels} setSelHotels={setSelHotels}
        selMonths={selMonths} setSelMonths={setSelMonths}
        onApply={handleApply} />
      <ExportModal open={exportOpen} onClose={()=>setExportOpen(false)} onExport={handleExport} />

      {/* ── Header ── */}
      <motion.div key={refreshKey} initial={{opacity:0,y:-16}} animate={{opacity:1,y:0}} transition={{duration:0.45}} className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl gradient-premium flex items-center justify-center shadow-azure">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold font-display text-gradient-azure">Analytics & Reports</h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 ml-10">
              {appliedHotels.length} propert{appliedHotels.length===1?'y':'ies'} · {appliedMonths.length} month{appliedMonths.length===1?'':'s'} · Jan–May 2026
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter */}
            <button onClick={()=>{setSelHotels(appliedHotels);setSelMonths(appliedMonths);setFilterOpen(true)}}
              className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all shadow-card ${
                activeFilterCount>0 ? 'border-azure-300 bg-azure-50 text-azure-700' : 'border-slate-200 bg-white text-slate-600 hover:border-azure-300 hover:text-azure-600'
              }`}>
              <Filter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Filter</span>
              {activeFilterCount>0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full gradient-azure text-white text-[9px] font-bold flex items-center justify-center shadow-sm">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Export */}
            <button onClick={()=>setExportOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 transition-all shadow-card">
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Refresh */}
            <button onClick={handleRefresh} disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl gradient-azure text-white text-xs font-semibold shadow-azure hover:opacity-90 transition-all disabled:opacity-70">
              <RefreshCw className={`w-3.5 h-3.5 ${loading?'animate-spin':''}`} />
              <span className="hidden sm:inline">{loading?'Refreshing…':'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Active filter pills */}
        <AnimatePresence>
          {activeFilterCount>0 && (
            <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
              className="mt-3 flex flex-wrap gap-1.5 items-center">
              {appliedHotels.length<HOTELS.length && appliedHotels.map(h=>(
                <span key={h} className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full bg-azure-50 text-azure-700 border border-azure-100">
                  <span className="w-1.5 h-1.5 rounded-full" style={{background:HOTEL_COLORS[h]}} />{shortHotelName(h)}
                </span>
              ))}
              {appliedMonths.length<MONTHS.length && appliedMonths.map(m=>(
                <span key={m} className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-100">
                  📅 {MONTHS_SHORT[m]}
                </span>
              ))}
              <button onClick={clearFilters}
                className="text-[10px] font-semibold text-rose-500 hover:text-rose-600 px-2 py-1 rounded-full hover:bg-rose-50 transition-colors flex items-center gap-1">
                <X className="w-3 h-3"/>Clear all
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="mt-4 flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
          {TABS.map(tab => (
            <button key={tab.id} onClick={()=>setActiveTab(tab.id as any)}
              className={`relative flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab===tab.id ? 'bg-white text-azure-600 shadow-premium border border-azure-100' : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
              }`}>
              {tab.icon}{tab.label}
              {activeTab===tab.id && (
                <motion.div layoutId="analyticsTab"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full gradient-azure"/>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KpiCard title="Total Net Revenue" value={fmtShort(totalNetRevenue)} sub={`${appliedMonths.length} months · ${appliedHotels.length} hotels`}
          icon={<DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-white"/>} gradient="gradient-azure" delay={0.05} trend="up" trendVal="+12.4%"/>
        <KpiCard title="Total Bookings" value={String(totalBookings)} sub="Across selected properties"
          icon={<Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white"/>} gradient="bg-gradient-to-br from-violet-500 to-violet-600" delay={0.1} trend="up" trendVal="+8.1%"/>
        <KpiCard title="Live Occupancy" value={`${overallOccupancy}%`} sub={`${totalOccupied} of ${totalRooms} rooms`}
          icon={<Bed className="w-4 h-4 sm:w-5 sm:h-5 text-white"/>} gradient="bg-gradient-to-br from-emerald-500 to-emerald-600" delay={0.15} trend="neutral" trendVal="Live"/>
        <KpiCard title="Avg Guest Rating" value={`${avgRating}/10`} sub="All published reviews"
          icon={<Star className="w-4 h-4 sm:w-5 sm:h-5 text-white"/>} gradient="bg-gradient-to-br from-amber-400 to-amber-500" delay={0.2} trend="up" trendVal="Excellent"/>
      </div>

      {/* ── Tab Content ── */}
      <AnimatePresence mode="wait">

        {/* ══════ OVERVIEW ══════ */}
        {activeTab==='overview' && (
          <motion.div key="overview" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.35}} className="space-y-5">
            <div className="bg-white rounded-2xl shadow-premium border border-slate-100 p-4 sm:p-5">
              <SectionHeader title="Net Revenue by Hotel" sub="Monthly net revenue — filtered view" icon={<TrendingUp className="w-3.5 h-3.5 text-white"/>}/>
              <div className="h-52 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueChartData} margin={{top:4,right:8,left:0,bottom:0}}>
                    <defs>
                      {Object.entries(HOTEL_COLORS).map(([name,color])=>(
                        <linearGradient key={name} id={`g${name.replace(/\s/g,'')}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor={color} stopOpacity={0.25}/>
                          <stop offset="95%" stopColor={color} stopOpacity={0.02}/>
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                    <XAxis dataKey="month" tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fontSize:10,fill:'#94a3b8'}} axisLine={false} tickLine={false} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}K`:v} width={44}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:10,paddingTop:8}}/>
                    {appliedHotels.map(name=>(
                      <Area key={name} type="monotone" dataKey={name} stroke={HOTEL_COLORS[name]} strokeWidth={2.5}
                        fill={`url(#g${name.replace(/\s/g,'')})`} dot={{r:3,fill:HOTEL_COLORS[name]}} activeDot={{r:5}}/>
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl shadow-premium border border-slate-100 p-4 sm:p-5">
                <SectionHeader title="Booking Status" sub="By hotel and booking status" icon={<Calendar className="w-3.5 h-3.5 text-white"/>}/>
                <div className="h-48 sm:h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bookingStatusData} margin={{top:4,right:4,left:-16,bottom:0}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                      <XAxis dataKey="hotel" tick={{fontSize:10,fill:'#94a3b8'}} axisLine={false} tickLine={false}/>
                      <YAxis tick={{fontSize:10,fill:'#94a3b8'}} axisLine={false} tickLine={false}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:10}}/>
                      <Bar dataKey="Confirmed"   stackId="a" fill="#0e8ee6"/>
                      <Bar dataKey="Checked In"  stackId="a" fill="#10b981"/>
                      <Bar dataKey="Checked Out" stackId="a" fill="#8b5cf6"/>
                      <Bar dataKey="Cancelled"   stackId="a" fill="#f43f5e" radius={[4,4,0,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-premium border border-slate-100 p-4 sm:p-5">
                <SectionHeader title="Live Room Occupancy" sub="Current status across properties" icon={<Bed className="w-3.5 h-3.5 text-white"/>}/>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="h-40 w-40 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={occupancyPieData} cx="50%" cy="50%" innerRadius="50%" outerRadius="76%" paddingAngle={3} dataKey="value">
                          {occupancyPieData.map((e,i)=><Cell key={i} fill={e.color}/>)}
                        </Pie>
                        <Tooltip formatter={(v:any)=>[`${v} rooms`,'Occupied']}/>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-3 w-full">
                    {filteredOccupancy.map(h=>(
                      <div key={h.hotel_id}>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs font-semibold text-slate-700">{h.city}</span>
                          <span className="text-xs font-bold text-slate-800">{parseFloat(h.occupancy_pct).toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div initial={{width:0}} animate={{width:`${parseFloat(h.occupancy_pct)}%`}} transition={{delay:0.3,duration:0.8}}
                            className="h-full rounded-full" style={{background:HOTEL_COLORS[h.hotel_name]}}/>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">{h.occupied} occ · {h.available} avail · {h.dirty} dirty</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-premium border border-slate-100 p-4 sm:p-5">
              <SectionHeader title="Room Type Revenue" sub="Total revenue per room category" icon={<Target className="w-3.5 h-3.5 text-white"/>}/>
              <div className="h-52 sm:h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={roomBarData} layout="vertical" margin={{top:4,right:8,left:0,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false}/>
                    <XAxis type="number" tick={{fontSize:10,fill:'#94a3b8'}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}K`}/>
                    <YAxis type="category" dataKey="name" tick={{fontSize:10,fill:'#64748b'}} axisLine={false} tickLine={false} width={110}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Bar dataKey="revenue" radius={[0,6,6,0]}>
                      {roomBarData.map((_,i)=><Cell key={i} fill={BAR_COLORS[i%BAR_COLORS.length]}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}

        {/* ══════ REVENUE ══════ */}
        {activeTab==='revenue' && (
          <motion.div key="revenue" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.35}} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {filteredBookings.map((h,i)=>(
                <motion.div key={h.hotel_name} initial={{opacity:0,scale:0.96}} animate={{opacity:1,scale:1}} transition={{delay:i*0.08}}
                  className="bg-white rounded-2xl shadow-premium border border-slate-100 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2.5 h-2.5 rounded-full" style={{background:HOTEL_COLORS[h.hotel_name]}}/>
                    <p className="text-xs font-semibold text-slate-700 truncate">{h.hotel_name}</p>
                  </div>
                  <p className="text-xl font-bold font-display text-slate-800 mb-1">{fmtShort(parseFloat(h.total_booking_value))}</p>
                  <p className="text-[10px] text-slate-400">{h.total_bookings} bookings · avg {h.avg_stay_nights} nights</p>
                  <div className="mt-3 pt-3 border-t border-slate-50 grid grid-cols-3 gap-2 text-center">
                    <div><p className="text-xs font-bold text-emerald-600">{h.checked_in}</p><p className="text-[10px] text-slate-400">In-House</p></div>
                    <div><p className="text-xs font-bold text-azure-600">{h.confirmed}</p><p className="text-[10px] text-slate-400">Confirmed</p></div>
                    <div><p className="text-xs font-bold text-rose-500">{h.cancelled}</p><p className="text-[10px] text-slate-400">Cancelled</p></div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="bg-white rounded-2xl shadow-premium border border-slate-100 p-4 sm:p-5">
              <SectionHeader title="Average Daily Rate (ADR)" sub="PKR per room per night — monthly trend" icon={<Activity className="w-3.5 h-3.5 text-white"/>}/>
              <div className="h-56 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={adrChartData} margin={{top:4,right:8,left:0,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                    <XAxis dataKey="month" tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fontSize:10,fill:'#94a3b8'}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}K`} width={40}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:11}}/>
                    {appliedHotels.map(name=>(
                      <Line key={name} type="monotone" dataKey={name} stroke={HOTEL_COLORS[name]} strokeWidth={2.5}
                        dot={{r:4,fill:HOTEL_COLORS[name],strokeWidth:2,stroke:'#fff'}} activeDot={{r:6}}/>
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-premium border border-slate-100 p-4 sm:p-5">
              <SectionHeader title="Monthly Revenue Breakdown" sub="Gross, tax & net revenue by hotel" icon={<Globe className="w-3.5 h-3.5 text-white"/>}/>
              <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                <table className="w-full text-xs min-w-[600px]">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {['Hotel','Month','Bookings','Rooms','Gross','Tax','Net Revenue','ADR','RevPAR'].map(h=>(
                        <th key={h} className="text-left py-2.5 px-2 text-slate-400 font-semibold whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRevenue.map((r,i)=>(
                      <motion.tr key={i} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.025}}
                        className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                        <td className="py-2 px-2">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{background:HOTEL_COLORS[r.hotel_name]}}/>
                            <span className="font-medium text-slate-700 truncate max-w-[80px]">{shortHotelName(r.hotel_name)}</span>
                          </div>
                        </td>
                        <td className="py-2 px-2 text-slate-500">{MONTHS_SHORT[r.month_year]}</td>
                        <td className="py-2 px-2 font-semibold text-slate-700">{r.bookings}</td>
                        <td className="py-2 px-2 text-slate-600">{r.room_nights}</td>
                        <td className="py-2 px-2 font-semibold text-slate-800">{fmtShort(parseFloat(r.gross_revenue))}</td>
                        <td className="py-2 px-2 text-rose-500">{fmtShort(parseFloat(r.tax_collected))}</td>
                        <td className="py-2 px-2 font-bold text-emerald-600">{fmtShort(parseFloat(r.net_revenue))}</td>
                        <td className="py-2 px-2 text-slate-600">{fmtShort(parseFloat(r.adr))}</td>
                        <td className="py-2 px-2 text-violet-600">{fmtShort(parseFloat(r.revpar_approx))}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-200 bg-slate-50/50">
                      <td colSpan={4} className="py-2 px-2 text-xs font-bold text-slate-600 uppercase tracking-wide">Total</td>
                      <td className="py-2 px-2 font-bold text-slate-800">{fmtShort(filteredRevenue.reduce((s,r)=>s+parseFloat(r.gross_revenue),0))}</td>
                      <td className="py-2 px-2 font-bold text-rose-500">{fmtShort(filteredRevenue.reduce((s,r)=>s+parseFloat(r.tax_collected),0))}</td>
                      <td className="py-2 px-2 font-bold text-emerald-600">{fmtShort(totalNetRevenue)}</td>
                      <td colSpan={2}/>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ══════ OCCUPANCY ══════ */}
        {activeTab==='occupancy' && (
          <motion.div key="occupancy" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.35}} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {filteredOccupancy.map((h,i)=>{
                const color=HOTEL_COLORS[h.hotel_name], pct=parseFloat(h.occupancy_pct)
                return (
                  <motion.div key={h.hotel_id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.1}}
                    className="bg-white rounded-2xl shadow-premium border border-slate-100 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-700">{h.hotel_name}</p>
                        <p className="text-[10px] text-slate-400">{h.city} · {'⭐'.repeat(h.star_rating)}</p>
                      </div>
                      <span className="text-2xl font-bold font-display" style={{color}}>{pct.toFixed(1)}%</span>
                    </div>
                    <div className="relative w-24 h-24 mx-auto mb-4">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3"/>
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke={color} strokeWidth="3"
                          strokeDasharray={`${pct} ${100-pct}`} strokeLinecap="round"/>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-slate-700">{h.occupied}/{h.total_rooms}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[{l:'Available',v:h.available,c:'#10b981'},{l:'Occupied',v:h.occupied,c:color},{l:'Dirty',v:h.dirty,c:'#f59e0b'},{l:'Maint.',v:h.maintenance,c:'#f43f5e'}].map(item=>(
                        <div key={item.l} className="bg-slate-50 rounded-xl p-2 text-center">
                          <p className="text-sm font-bold" style={{color:item.c}}>{item.v}</p>
                          <p className="text-[10px] text-slate-400">{item.l}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )
              })}
            </div>

            <div className="bg-white rounded-2xl shadow-premium border border-slate-100 p-4 sm:p-5">
              <SectionHeader title="Room Type Demand" sub="Revenue & bookings per room category" icon={<Bed className="w-3.5 h-3.5 text-white"/>}/>
              <div className="space-y-3">
                {ROOM_PERF.map((r,i)=>{
                  const maxRev=parseFloat(ROOM_PERF[0].total_revenue)
                  const pct=(parseFloat(r.total_revenue)/maxRev)*100
                  return (
                    <motion.div key={i} initial={{opacity:0,x:-16}} animate={{opacity:1,x:0}} transition={{delay:i*0.06}}
                      className="flex items-center gap-3">
                      <span className="text-xs text-slate-600 font-medium w-32 sm:w-40 flex-shrink-0 truncate">{r.room_type}</span>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div initial={{width:0}} animate={{width:`${pct}%`}} transition={{delay:0.2+i*0.06,duration:0.7}}
                          className="h-full rounded-full" style={{background:BAR_COLORS[i%BAR_COLORS.length]}}/>
                      </div>
                      <span className="text-xs font-bold text-slate-700 w-20 sm:w-24 text-right flex-shrink-0">{fmtShort(parseFloat(r.total_revenue))}</span>
                      <span className="text-[10px] text-slate-400 hidden sm:block w-14 text-right flex-shrink-0">{r.total_bookings} bkgs</span>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* ══════ GUESTS ══════ */}
        {activeTab==='guests' && (
          <motion.div key="guests" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.35}} className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {label:'Total Enrolled',val:`${LOYALTY_STATS.reduce((s,l)=>s+l.guest_count,0)}`,sub:'Loyalty members',color:'#0e8ee6'},
                {label:'Diamond',val:'3',sub:'148K avg pts',color:'#0e8ee6'},
                {label:'Platinum',val:'4',sub:'61.5K avg pts',color:'#8b5cf6'},
                {label:'Gold',val:'4',sub:'23.9K avg pts',color:'#f59e0b'},
              ].map((item,i)=>(
                <motion.div key={item.label} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}}
                  className="bg-white rounded-2xl shadow-premium border border-slate-100 p-4 text-center">
                  <p className="text-2xl font-bold font-display mb-1" style={{color:item.color}}>{item.val}</p>
                  <p className="text-xs font-semibold text-slate-700">{item.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{item.sub}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl shadow-premium border border-slate-100 p-4 sm:p-5">
                <SectionHeader title="Loyalty Tier Distribution" sub="Enrolled guests by tier" icon={<Award className="w-3.5 h-3.5 text-white"/>}/>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="h-44 w-44 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={loyaltyPieData} cx="50%" cy="50%" innerRadius="50%" outerRadius="75%" paddingAngle={4} dataKey="value">
                          {loyaltyPieData.map((e,i)=><Cell key={i} fill={e.color}/>)}
                        </Pie>
                        <Tooltip formatter={(v:any)=>[`${v} guests`,'Count']}/>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-2 w-full">
                    {LOYALTY_STATS.map((l,i)=>(
                      <motion.div key={l.tier_name} initial={{opacity:0,x:16}} animate={{opacity:1,x:0}} transition={{delay:i*0.1}}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/40">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{background:TIER_COLORS[l.tier_name]}}/>
                          <span className="text-sm font-semibold text-slate-700">{l.tier_name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-800">{l.guest_count} guests</p>
                          <p className="text-[10px] text-slate-400">Avg {parseInt(l.avg_points).toLocaleString()} pts</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-premium border border-slate-100 p-4 sm:p-5">
                <SectionHeader title="Lifetime Points by Tier" sub="Total accumulated loyalty points" icon={<Sparkles className="w-3.5 h-3.5 text-white"/>}/>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={LOYALTY_STATS.map(l=>({tier:l.tier_name,points:l.total_lifetime_points}))} margin={{top:4,right:8,left:0,bottom:0}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                      <XAxis dataKey="tier" tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false}/>
                      <YAxis tick={{fontSize:10,fill:'#94a3b8'}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}K`} width={40}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Bar dataKey="points" radius={[6,6,0,0]}>
                        {LOYALTY_STATS.map((l,i)=><Cell key={i} fill={TIER_COLORS[l.tier_name]}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ══════ REVIEWS ══════ */}
        {activeTab==='reviews' && (
          <motion.div key="reviews" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.35}} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {filteredReviews.map((r,i)=>{
                const color=Object.values(HOTEL_COLORS)[i]
                return (
                  <motion.div key={r.hotel_name} initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} transition={{delay:i*0.1}}
                    className="bg-white rounded-2xl shadow-premium border border-slate-100 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-700">{r.hotel_name}</p>
                        <p className="text-[10px] text-slate-400">{r.total_reviews} reviews</p>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-bold font-display" style={{color}}>{parseFloat(r.avg_overall).toFixed(1)}</span>
                        <p className="text-[10px] text-slate-400">/10</p>
                      </div>
                    </div>
                    {[
                      {label:'Cleanliness',val:parseFloat(r.avg_cleanliness)},
                      {label:'Service',    val:parseFloat(r.avg_service)},
                      {label:'Location',   val:parseFloat(r.avg_location)},
                      {label:'Value',      val:parseFloat(r.avg_value)},
                    ].map(item=>(
                      <div key={item.label} className="mb-2">
                        <div className="flex justify-between text-[10px] mb-0.5">
                          <span className="text-slate-500">{item.label}</span>
                          <span className="font-semibold text-slate-700">{item.val.toFixed(1)}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div initial={{width:0}} animate={{width:`${(item.val/10)*100}%`}} transition={{delay:0.3+i*0.1,duration:0.7}}
                            className="h-full rounded-full" style={{background:color}}/>
                        </div>
                      </div>
                    ))}
                    <div className="mt-3 flex gap-2 flex-wrap">
                      <span className="text-[10px] bg-emerald-50 text-emerald-600 font-semibold px-2 py-1 rounded-full">✓ {r.positive_reviews} Positive</span>
                      {r.negative_reviews>0 && <span className="text-[10px] bg-rose-50 text-rose-500 font-semibold px-2 py-1 rounded-full">✗ {r.negative_reviews} Negative</span>}
                    </div>
                  </motion.div>
                )
              })}
            </div>

            <div className="bg-white rounded-2xl shadow-premium border border-slate-100 p-4 sm:p-5">
              <SectionHeader title="Rating Dimensions Comparison" sub="Radar view across all review categories" icon={<Star className="w-3.5 h-3.5 text-white"/>}/>
              <div className="h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={RADAR_DATA} margin={{top:8,right:24,left:24,bottom:8}}>
                    <PolarGrid stroke="#f1f5f9"/>
                    <PolarAngleAxis dataKey="subject" tick={{fontSize:11,fill:'#64748b'}}/>
                    <PolarRadiusAxis angle={90} domain={[0,10]} tick={{fontSize:9,fill:'#94a3b8'}}/>
                    <Radar name="Karachi"   dataKey="Karachi"   stroke="#0e8ee6" fill="#0e8ee6" fillOpacity={0.15} strokeWidth={2}/>
                    <Radar name="Lahore"    dataKey="Lahore"    stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.12} strokeWidth={2}/>
                    <Radar name="Islamabad" dataKey="Islamabad" stroke="#10b981" fill="#10b981" fillOpacity={0.12} strokeWidth={2}/>
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:11}}/>
                    <Tooltip/>
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}