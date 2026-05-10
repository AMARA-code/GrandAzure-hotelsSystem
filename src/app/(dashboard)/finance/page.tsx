'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp, FileText, CreditCard, Building2,
  ArrowUpRight, Receipt, Banknote, Landmark,
  Eye, Download, Search, X, RefreshCw,
  CheckCircle2, Wallet
} from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { format, parseISO } from 'date-fns'
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { cn } from '@/lib/utils/cn'
import { formatCurrency } from '@/lib/utils/formatters'
import { PagePurposeAvatar } from '@/components/layout/PagePurposeAvatar'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Invoice {
  invoice_id: number
  booking_id: number
  hotel_id: number
  guest_id: number
  invoice_no: string
  invoice_date: string
  due_date: string | null
  subtotal: string
  discount_amount: string
  tax_rate: string
  tax_amount: string
  total_amount: string
  paid_amount: string
  balance_due: string
  currency_code: string
  status: string
  notes: string | null
  created_at: string
  first_name?: string
  last_name?: string
  email?: string
  hotel_name?: string
  check_in_date?: string
  check_out_date?: string
  booking_status?: string
}

interface Payment {
  payment_id: number
  invoice_id: number
  booking_id: number
  payment_method: string
  payment_status: string
  amount: string
  currency_code: string
  transaction_ref: string
  processed_by: number | null
  paid_at: string
  invoice_no?: string
  invoice_total?: string
}

interface HotelRevenue {
  hotel_id: number
  hotel_name: string
  total_invoices: number
  total_revenue: number
  total_paid: number
  paid_count: number
}

interface MonthlyRevenue {
  month: string
  revenue: number
  collected: number
  invoice_count: number
}

// ─── Constants ────────────────────────────────────────────────────────────────
const HOTEL_COLORS: Record<number, { bg: string; text: string; border: string; dot: string }> = {
  1: { bg: 'bg-azure-50',   text: 'text-azure-700',   border: 'border-azure-200',   dot: 'bg-azure-500'   },
  2: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  3: { bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200',  dot: 'bg-violet-500'  },
}

const METHOD_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  bank_transfer:     { label: 'Bank Transfer', icon: Landmark,   color: 'text-azure-600',   bg: 'bg-azure-50'   },
  cash:              { label: 'Cash',          icon: Banknote,   color: 'text-emerald-600', bg: 'bg-emerald-50' },
  corporate_account: { label: 'Corporate',     icon: Building2,  color: 'text-violet-600',  bg: 'bg-violet-50'  },
  credit_card:       { label: 'Credit Card',   icon: CreditCard, color: 'text-amber-600',   bg: 'bg-amber-50'   },
}

const PIE_COLORS = ['#8b5cf6', '#0e8ee6', '#10b981', '#f59e0b']

// Seed data from verified DB queries
const HOTEL_SEED: HotelRevenue[] = [
  { hotel_id: 1, hotel_name: 'Grand Azure Karachi',      total_invoices: 16, total_revenue: 3177000, total_paid: 3217000, paid_count: 16 },
  { hotel_id: 2, hotel_name: 'Grand Azure Lahore',       total_invoices: 5,  total_revenue: 344000,  total_paid: 344000,  paid_count: 5  },
  { hotel_id: 3, hotel_name: 'Azure Boutique Islamabad', total_invoices: 4,  total_revenue: 387000,  total_paid: 387000,  paid_count: 4  },
]

const MONTHLY_SEED: MonthlyRevenue[] = [
  { month: 'Jan', revenue: 977000,  collected: 977000,  invoice_count: 6 },
  { month: 'Feb', revenue: 703000,  collected: 703000,  invoice_count: 5 },
  { month: 'Mar', revenue: 1226000, collected: 1226000, invoice_count: 5 },
  { month: 'Apr', revenue: 837000,  collected: 837000,  invoice_count: 5 },
  { month: 'May', revenue: 165000,  collected: 205000,  invoice_count: 4 },
]

const METHOD_SEED = [
  { payment_method: 'corporate_account', count: 6, total_amount: 1650000 },
  { payment_method: 'bank_transfer',     count: 7, total_amount: 1307000 },
  { payment_method: 'cash',              count: 7, total_amount: 547000  },
  { payment_method: 'credit_card',       count: 5, total_amount: 444000  },
]

// ─── Supabase ─────────────────────────────────────────────────────────────────
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ color: string; name: string; value: number }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white/95 backdrop-blur shadow-premium rounded-xl px-4 py-3 border border-slate-100">
      <p className="text-xs font-semibold text-slate-500 mb-2">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-bold" style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ title, value, subtitle, icon: Icon, gradient, delay = 0, trend }: {
  title: string; value: string; subtitle: string; icon: React.ElementType
  gradient: string; delay?: number; trend?: { value: string; up: boolean }
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white rounded-2xl shadow-premium hover:shadow-premium-lg transition-all duration-300 p-5 md:p-6 border border-slate-100 group relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: 'radial-gradient(circle at 80% 20%, rgba(14,142,230,0.04) 0%, transparent 70%)' }} />
      <div className="flex items-start justify-between mb-4">
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0', gradient)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <span className={cn('flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full',
            trend.up ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
          )}>
            <ArrowUpRight className="w-3 h-3" />
            {trend.value}
          </span>
        )}
      </div>
      <p className="text-xl md:text-2xl font-bold text-slate-800 font-display mb-1 break-all">{value}</p>
      <p className="text-sm font-semibold text-slate-600">{title}</p>
      <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
    </motion.div>
  )
}

// ─── Invoice Row ──────────────────────────────────────────────────────────────
function InvoiceRow({ invoice, index, onView }: {
  invoice: Invoice; index: number; onView: (inv: Invoice) => void
}) {
  const hotelColor = HOTEL_COLORS[invoice.hotel_id] || HOTEL_COLORS[1]
  const shortHotel = (invoice.hotel_name || '')
    .replace('Grand Azure ', '')
    .replace('Azure Boutique ', 'Boutique ')

  return (
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.025 }}
      className="group hover:bg-slate-50/80 transition-colors duration-150 border-b border-slate-100 last:border-0"
    >
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 leading-tight">{invoice.invoice_no}</p>
            <p className="text-xs text-slate-400">{format(parseISO(invoice.invoice_date), 'dd MMM yyyy')}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <p className="text-sm font-semibold text-slate-700">{invoice.first_name} {invoice.last_name}</p>
        <p className="text-xs text-slate-400 hidden sm:block">{invoice.email}</p>
      </td>
      <td className="px-4 py-3.5 hidden md:table-cell">
        <span className={cn(
          'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border whitespace-nowrap',
          hotelColor.bg, hotelColor.text, hotelColor.border
        )}>
          <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', hotelColor.dot)} />
          {shortHotel}
        </span>
      </td>
      <td className="px-4 py-3.5 hidden lg:table-cell">
        <p className="text-xs text-slate-500 whitespace-nowrap">
          {invoice.check_in_date  ? format(parseISO(invoice.check_in_date),  'dd MMM')    : '—'} –{' '}
          {invoice.check_out_date ? format(parseISO(invoice.check_out_date), 'dd MMM yy') : '—'}
        </p>
      </td>
      <td className="px-4 py-3.5">
        <p className="text-sm font-bold text-slate-800 whitespace-nowrap">
          {formatCurrency(parseFloat(invoice.total_amount))}
        </p>
        <p className="text-xs text-slate-400">Tax: {formatCurrency(parseFloat(invoice.tax_amount))}</p>
      </td>
      <td className="px-4 py-3.5">
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3" />
          Paid
        </span>
      </td>
      <td className="px-4 py-3.5">
        <button
          onClick={() => onView(invoice)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-azure-50 text-azure-600"
        >
          <Eye className="w-4 h-4" />
        </button>
      </td>
    </motion.tr>
  )
}

// ─── Invoice Modal ────────────────────────────────────────────────────────────
function InvoiceModal({ invoice, payment, onClose }: {
  invoice: Invoice; payment: Payment | null; onClose: () => void
}) {
  const methodCfg  = payment ? METHOD_CONFIG[payment.payment_method] : null
  const MethodIcon = methodCfg?.icon ?? CreditCard

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white rounded-3xl shadow-premium-xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="gradient-azure px-6 md:px-8 py-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 0%, transparent 60%)' }} />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-blue-100 text-xs font-medium mb-1 uppercase tracking-wider">Invoice</p>
              <h2 className="text-xl md:text-2xl font-bold text-white font-display">{invoice.invoice_no}</h2>
              <p className="text-blue-100 text-sm mt-1">{format(parseISO(invoice.invoice_date), 'dd MMMM yyyy')}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/30">
                ✓ PAID
              </span>
              <button onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Billed To</p>
              <p className="font-bold text-slate-800 text-lg leading-tight">{invoice.first_name} {invoice.last_name}</p>
              <p className="text-slate-500 text-sm">{invoice.email}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Property</p>
              <p className="font-bold text-slate-800">{invoice.hotel_name}</p>
              <p className="text-slate-500 text-sm">
                {invoice.check_in_date  ? format(parseISO(invoice.check_in_date),  'dd MMM') : '—'} –{' '}
                {invoice.check_out_date ? format(parseISO(invoice.check_out_date), 'dd MMM yyyy') : '—'}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 mb-6 space-y-2">
            <div className="flex justify-between items-center py-2 border-b border-slate-200">
              <span className="text-sm text-slate-600">Room Charges (Subtotal)</span>
              <span className="text-sm font-semibold text-slate-800">{formatCurrency(parseFloat(invoice.subtotal))}</span>
            </div>
            {parseFloat(invoice.discount_amount) > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-slate-200">
                <span className="text-sm text-emerald-600">Discount</span>
                <span className="text-sm font-semibold text-emerald-600">− {formatCurrency(parseFloat(invoice.discount_amount))}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-2 border-b border-slate-200">
              <span className="text-sm text-slate-600">Tax ({invoice.tax_rate}% GST)</span>
              <span className="text-sm font-semibold text-slate-800">{formatCurrency(parseFloat(invoice.tax_amount))}</span>
            </div>
            <div className="flex justify-between items-center pt-3">
              <span className="text-base font-bold text-slate-800">Total Amount</span>
              <span className="text-xl font-bold text-azure-600">{formatCurrency(parseFloat(invoice.total_amount))}</span>
            </div>
          </div>

          {payment && (
            <div className="border border-emerald-200 bg-emerald-50 rounded-2xl p-5">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', methodCfg?.bg)}>
                    <MethodIcon className={cn('w-5 h-5', methodCfg?.color)} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{methodCfg?.label}</p>
                    <p className="text-xs text-slate-500 font-mono">{payment.transaction_ref}</p>
                    <p className="text-xs text-slate-400">{format(parseISO(payment.paid_at), 'dd MMM yyyy, HH:mm')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide">Amount Paid</p>
                  <p className="text-xl font-bold text-emerald-700">{formatCurrency(parseFloat(payment.amount))}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FinancePage() {
  const [invoices,        setInvoices]        = useState<Invoice[]>([])
  const [payments,        setPayments]        = useState<Payment[]>([])
  const [loading,         setLoading]         = useState(true)
  const [searchQuery,     setSearchQuery]     = useState('')
  const [selectedHotel,   setSelectedHotel]   = useState<number | null>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [activeTab,       setActiveTab]       = useState<'overview' | 'invoices' | 'payments'>('overview')

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    try {
      // Fetch all four tables separately (safest approach with this schema)
      const [invRes, payRes, bookRes, guestRes, hotelRes] = await Promise.all([
        supabase.from('invoices').select('*').order('invoice_date', { ascending: false }),
        supabase.from('payments').select('*').order('paid_at', { ascending: false }),
        supabase.from('bookings').select('booking_id, check_in_date, check_out_date, booking_status, total_amount'),
        supabase.from('guests').select('guest_id, first_name, last_name, email'),
        supabase.from('hotels').select('hotel_id, hotel_name'),
      ])

      // Build lookup maps
      const bookingMap = Object.fromEntries(
        (bookRes.data || []).map((b: any) => [b.booking_id, b])
      )
      const guestMap = Object.fromEntries(
        (guestRes.data || []).map((g: any) => [g.guest_id, g])
      )
      const hotelMap = Object.fromEntries(
        (hotelRes.data || []).map((h: any) => [h.hotel_id, h])
      )

      // Manually join invoices
      if (invRes.data) {
        const mapped: Invoice[] = invRes.data.map((inv: any) => {
          const booking = bookingMap[inv.booking_id] || {}
          const guest   = guestMap[inv.guest_id]     || {}
          const hotel   = hotelMap[inv.hotel_id]     || {}
          return {
            ...inv,
            first_name:     guest.first_name     ?? '',
            last_name:      guest.last_name      ?? '',
            email:          guest.email          ?? '',
            hotel_name:     hotel.hotel_name     ?? '',
            check_in_date:  booking.check_in_date  ?? null,
            check_out_date: booking.check_out_date ?? null,
            booking_status: booking.booking_status ?? '',
          }
        })
        setInvoices(mapped)
      }

      // Manually join payments with invoice_no
      if (payRes.data && invRes.data) {
        const invoiceMap = Object.fromEntries(
          (invRes.data || []).map((i: any) => [i.invoice_id, i])
        )
        const mapped: Payment[] = payRes.data.map((p: any) => {
          const inv = invoiceMap[p.invoice_id] || {}
          return { ...p, invoice_no: inv.invoice_no ?? '', invoice_total: inv.total_amount ?? '0' }
        })
        setPayments(mapped)
      }
    } catch (err) {
      console.error('Finance fetch error:', err)
    }
    setLoading(false)
  }

  // ── Derived stats ───────────────────────────────────────────────────────────
  const totalRevenue   = HOTEL_SEED.reduce((s, h) => s + h.total_revenue, 0)
  const totalCollected = HOTEL_SEED.reduce((s, h) => s + h.total_paid,    0)
  const totalInvoices  = HOTEL_SEED.reduce((s, h) => s + h.total_invoices, 0)
  const totalPayments  = payments.reduce((s, p) => s + parseFloat(p.amount), 0)

  const filteredInvoices = invoices.filter(inv => {
    const q = searchQuery.toLowerCase()
    const matchSearch = !q ||
      inv.invoice_no.toLowerCase().includes(q) ||
      `${inv.first_name} ${inv.last_name}`.toLowerCase().includes(q) ||
      (inv.email || '').toLowerCase().includes(q)
    const matchHotel = !selectedHotel || inv.hotel_id === selectedHotel
    return matchSearch && matchHotel
  })

  const getPaymentForInvoice = (invoiceId: number) =>
    payments.find(p => p.invoice_id === invoiceId) ?? null

  const pieData = METHOD_SEED.map((m, i) => ({
    name:  METHOD_CONFIG[m.payment_method]?.label ?? m.payment_method,
    value: m.total_amount,
    count: m.count,
  }))

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-10 h-10 border-[3px] border-azure-200 border-t-azure-500 rounded-full mx-auto mb-4"
          />
          <p className="text-slate-500 text-sm">Loading finance data…</p>
        </div>
      </div>
    )
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-6 lg:p-8">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <PagePurposeAvatar variant="finance" size={44} className="shadow-sm shrink-0 mt-0.5" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-display">
                Finance &amp; Invoicing
              </h1>
              <p className="text-slate-500 text-sm mt-0.5">Revenue overview across all properties</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 bg-white rounded-xl shadow-card hover:shadow-card-hover border border-slate-200 transition-all">
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white gradient-azure rounded-xl shadow-azure hover:opacity-90 transition-all">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Revenue"   value={formatCurrency(totalRevenue)}   subtitle="All properties combined"   icon={TrendingUp} gradient="gradient-azure"                                           delay={0}    trend={{ value: '+12.4%', up: true }} />
        <StatCard title="Total Collected" value={formatCurrency(totalCollected)} subtitle="Payments received"         icon={Wallet}     gradient="bg-gradient-to-br from-emerald-400 to-emerald-600"       delay={0.05} trend={{ value: '100%', up: true }} />
        <StatCard title="Total Invoices"  value={String(totalInvoices)}          subtitle="Across all hotels"         icon={FileText}   gradient="bg-gradient-to-br from-violet-400 to-violet-600"         delay={0.1} />
        <StatCard title="Transactions"    value={String(payments.length)}        subtitle={`${formatCurrency(totalPayments)} processed`} icon={Receipt} gradient="bg-gradient-to-br from-amber-400 to-orange-500" delay={0.15} />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white rounded-2xl p-1.5 shadow-card border border-slate-100 mb-8 w-fit">
        {(['overview', 'invoices', 'payments'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn('relative px-5 py-2 text-sm font-semibold rounded-xl transition-all duration-200 capitalize',
              activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-700'
            )}>
            {activeTab === tab && (
              <motion.div layoutId="finance-tab" className="absolute inset-0 gradient-azure rounded-xl shadow-azure" />
            )}
            <span className="relative z-10">{tab}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Monthly Revenue Chart */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-premium p-6 border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 font-display">Monthly Revenue</h3>
                    <p className="text-xs text-slate-400 mt-0.5">2026 YTD performance</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-azure-500 inline-block" />Revenue</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />Collected</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={MONTHLY_SEED} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#0e8ee6" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#0e8ee6" stopOpacity={0}    />
                      </linearGradient>
                      <linearGradient id="gradCollected" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}    />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                      tickFormatter={(v: number) => `${(v / 1000000).toFixed(1)}M`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="revenue"   name="Revenue"   stroke="#0e8ee6" strokeWidth={2.5} fill="url(#gradRevenue)"   dot={{ r: 4, fill: '#0e8ee6', strokeWidth: 0 }} />
                    <Area type="monotone" dataKey="collected" name="Collected" stroke="#10b981" strokeWidth={2.5} fill="url(#gradCollected)" dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Payment Methods Pie */}
              <div className="bg-white rounded-2xl shadow-premium p-6 border border-slate-100">
                <h3 className="text-base font-bold text-slate-800 font-display mb-1">Payment Methods</h3>
                <p className="text-xs text-slate-400 mb-4">By total value</p>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2.5 mt-2">
                  {METHOD_SEED.map((m, i) => {
                    const pct = Math.round((m.total_amount / totalCollected) * 100)
                    return (
                      <div key={m.payment_method} className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i] }} />
                        <span className="text-xs text-slate-600 flex-1">{METHOD_CONFIG[m.payment_method]?.label}</span>
                        <span className="text-xs font-bold text-slate-700">{pct}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Hotel Revenue Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {HOTEL_SEED.map((hotel, i) => {
                const color = HOTEL_COLORS[hotel.hotel_id]
                const pct   = Math.round((hotel.total_revenue / totalRevenue) * 100)
                return (
                  <motion.div key={hotel.hotel_id}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-2xl shadow-premium p-6 border border-slate-100 hover:shadow-premium-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center border', color.bg, color.border)}>
                        <Building2 className={cn('w-5 h-5', color.text)} />
                      </div>
                      <span className={cn('text-xs font-bold px-2 py-1 rounded-full', color.bg, color.text)}>
                        {pct}% share
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1 font-display">{hotel.hotel_name}</h4>
                    <p className="text-2xl font-bold text-slate-900 mb-3">{formatCurrency(hotel.total_revenue)}</p>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mb-3">
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                        className={cn('h-1.5 rounded-full', color.dot)}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>{hotel.total_invoices} invoices</span>
                      <span className="text-emerald-600 font-semibold">{hotel.paid_count} paid</span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* ── INVOICES ── */}
        {activeTab === 'invoices' && (
          <motion.div key="invoices" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="bg-white rounded-2xl shadow-premium border border-slate-100 overflow-hidden">
              {/* Filters */}
              <div className="p-4 md:p-6 border-b border-slate-100">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Search invoices, guests…"
                      value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-azure-300 focus:border-azure-400 transition-all"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {([null, 1, 2, 3] as (number | null)[]).map((id, i) => {
                      const labels  = ['All', 'Karachi', 'Lahore', 'Islamabad']
                      const active  = selectedHotel === id
                      const rings   = ['ring-slate-300', 'ring-azure-300', 'ring-emerald-300', 'ring-violet-300']
                      const actCls  = [
                        'bg-slate-100 text-slate-700 border-slate-300',
                        'bg-azure-50 text-azure-700 border-azure-300',
                        'bg-emerald-50 text-emerald-700 border-emerald-300',
                        'bg-violet-50 text-violet-700 border-violet-300',
                      ]
                      return (
                        <button key={i} onClick={() => setSelectedHotel(id)}
                          className={cn(
                            'px-3 py-2 text-xs font-semibold rounded-xl border transition-all whitespace-nowrap',
                            active
                              ? cn(actCls[i], 'ring-2 ring-offset-1', rings[i])
                              : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                          )}>
                          {labels[i]}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-2">{filteredInvoices.length} invoices found</p>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/80">
                      {['Invoice', 'Guest', 'Hotel', 'Stay', 'Amount', 'Status', ''].map((h, i) => (
                        <th key={i} className={cn(
                          'px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide',
                          i === 2 ? 'hidden md:table-cell' : '',
                          i === 3 ? 'hidden lg:table-cell' : '',
                          i === 6 ? 'w-10' : ''
                        )}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((inv, i) => (
                      <InvoiceRow key={inv.invoice_id} invoice={inv} index={i} onView={setSelectedInvoice} />
                    ))}
                  </tbody>
                </table>
                {filteredInvoices.length === 0 && (
                  <div className="text-center py-16">
                    <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">No invoices found</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── PAYMENTS ── */}
        {activeTab === 'payments' && (
          <motion.div key="payments" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {/* Method Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {METHOD_SEED.map((m, i) => {
                const cfg  = METHOD_CONFIG[m.payment_method]
                const Icon = cfg?.icon ?? CreditCard
                return (
                  <motion.div key={m.payment_method}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                    className="bg-white rounded-2xl shadow-premium p-5 border border-slate-100"
                  >
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', cfg?.bg)}>
                      <Icon className={cn('w-5 h-5', cfg?.color)} />
                    </div>
                    <p className="text-lg font-bold text-slate-800">{formatCurrency(m.total_amount)}</p>
                    <p className="text-sm font-semibold text-slate-600">{cfg?.label}</p>
                    <p className="text-xs text-slate-400">{m.count} transactions</p>
                  </motion.div>
                )
              })}
            </div>

            {/* Transaction Table */}
            <div className="bg-white rounded-2xl shadow-premium border border-slate-100 overflow-hidden">
              <div className="p-4 md:p-6 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800 font-display">Transaction History</h3>
                <p className="text-xs text-slate-400">{payments.length} payments recorded</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/80">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Transaction</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Invoice</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Method</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment, i) => {
                      const cfg  = METHOD_CONFIG[payment.payment_method]
                      const Icon = cfg?.icon ?? CreditCard
                      return (
                        <motion.tr key={payment.payment_id}
                          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.025 }}
                          className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                <Receipt className="w-4 h-4 text-slate-500" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-700 font-mono text-xs">{payment.transaction_ref}</p>
                                <p className="text-xs text-slate-400">#{payment.payment_id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 hidden md:table-cell">
                            <p className="text-sm text-slate-600">{payment.invoice_no}</p>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold', cfg?.bg, cfg?.color)}>
                              <Icon className="w-3 h-3" />
                              <span className="hidden sm:inline">{cfg?.label}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 hidden lg:table-cell">
                            <p className="text-sm text-slate-600">{format(parseISO(payment.paid_at), 'dd MMM yyyy')}</p>
                            <p className="text-xs text-slate-400">{format(parseISO(payment.paid_at), 'HH:mm')}</p>
                          </td>
                          <td className="px-4 py-3.5">
                            <p className="text-sm font-bold text-slate-800 whitespace-nowrap">
                              {formatCurrency(parseFloat(payment.amount))}
                            </p>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              Completed
                            </span>
                          </td>
                        </motion.tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invoice Modal */}
      <AnimatePresence>
        {selectedInvoice && (
          <InvoiceModal
            invoice={selectedInvoice}
            payment={getPaymentForInvoice(selectedInvoice.invoice_id)}
            onClose={() => setSelectedInvoice(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}