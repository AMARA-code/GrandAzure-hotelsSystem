'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createBrowserClient } from '@supabase/ssr'
import {
  Users, UserCheck, Building2, Search, Plus,
  ChevronDown, ChevronUp, Calendar,
  DollarSign, Filter, RefreshCw,
  X, MoreHorizontal, Shield
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils/cn'
import StaffDetailModal from '@/components/staff/StaffDetailModal'
import AddStaffModal from '@/components/staff/AddStaffModal'

// ─── Types ────────────────────────────────────────────────────────────────────
interface StaffMember {
  staff_id: number
  hotel_id: number
  department_id: number
  role_id: number
  manager_id: number | null
  employee_code: string
  first_name: string
  last_name: string
  email: string
  phone: string
  hire_date: string
  employment_type: string
  salary: string
  shift: string
  is_active: boolean
  hotel_name: string
  dept_name: string
  role_name: string
  role_category: string
  manager_first_name: string | null
  manager_last_name: string | null
}

interface Hotel {
  hotel_id: number
  hotel_name: string
  city: string
}

interface Department {
  department_id: number
  dept_name: string
  hotel_id: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase()
}

function getInitialsBg(name: string) {
  const colors = [
    'bg-blue-100 text-blue-700',
    'bg-emerald-100 text-emerald-700',
    'bg-violet-100 text-violet-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-cyan-100 text-cyan-700',
    'bg-orange-100 text-orange-700',
    'bg-pink-100 text-pink-700',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i)
  return colors[hash % colors.length]
}

const SHIFT_COLORS: Record<string, string> = {
  morning:   'bg-amber-50 text-amber-700 border border-amber-200',
  afternoon: 'bg-blue-50 text-blue-700 border border-blue-200',
  night:     'bg-violet-50 text-violet-700 border border-violet-200',
  flexible:  'bg-emerald-50 text-emerald-700 border border-emerald-200',
}
const SHIFT_LABELS: Record<string, string> = {
  morning: 'Morning', afternoon: 'Afternoon', night: 'Night', flexible: 'Flexible',
}
const ROLE_CATEGORY_COLORS: Record<string, string> = {
  management:    'bg-violet-50 text-violet-700 border border-violet-200',
  front_office:  'bg-blue-50 text-blue-700 border border-blue-200',
  housekeeping:  'bg-emerald-50 text-emerald-700 border border-emerald-200',
  maintenance:   'bg-orange-50 text-orange-700 border border-orange-200',
  food_beverage: 'bg-rose-50 text-rose-700 border border-rose-200',
  finance:       'bg-cyan-50 text-cyan-700 border border-cyan-200',
}
const ROLE_CATEGORY_LABELS: Record<string, string> = {
  management: 'Management', front_office: 'Front Office',
  housekeeping: 'Housekeeping', maintenance: 'Maintenance',
  food_beverage: 'F&B', finance: 'Finance',
}
const HOTEL_ACCENT: Record<number, string> = {
  1: 'border-l-[#0e8ee6]',
  2: 'border-l-emerald-500',
  3: 'border-l-violet-500',
}
const HOTEL_DOT: Record<number, string> = {
  1: 'bg-[#0e8ee6]',
  2: 'bg-emerald-500',
  3: 'bg-violet-500',
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StaffPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [staff, setStaff]               = useState<StaffMember[]>([])
  const [hotels, setHotels]             = useState<Hotel[]>([])
  const [departments, setDepartments]   = useState<Department[]>([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [hotelFilter, setHotelFilter]   = useState('all')
  const [deptFilter, setDeptFilter]     = useState('all')
  const [shiftFilter, setShiftFilter]   = useState('all')
  const [catFilter, setCatFilter]       = useState('all')
  const [activeFilter, setActiveFilter] = useState('all')
  const [showFilters, setShowFilters]   = useState(false)
  const [sortField, setSortField]       = useState('hire_date')
  const [sortDir, setSortDir]           = useState<'asc' | 'desc'>('desc')
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)
  const [showDetail, setShowDetail]     = useState(false)
  const [showAdd, setShowAdd]           = useState(false)
  const [viewMode, setViewMode]         = useState<'table' | 'grid'>('table')

  // ─── Fetch ───────────────────────────────────────────────────────────────────
  const fetchAll = async () => {
    setLoading(true)
    try {
      const [staffRes, hotelRes, deptRes] = await Promise.all([
        supabase.from('staff').select(`
          staff_id, hotel_id, department_id, role_id, manager_id,
          employee_code, first_name, last_name, email, phone,
          hire_date, employment_type, salary, shift, is_active,
          hotels:hotel_id ( hotel_name ),
          departments:department_id ( dept_name ),
          staff_roles:role_id ( role_name, role_category ),
          manager:manager_id ( first_name, last_name )
        `).eq('is_deleted', false),
        supabase.from('hotels').select('hotel_id, hotel_name, city').eq('is_deleted', false),
        supabase.from('departments').select('department_id, dept_name, hotel_id').eq('is_deleted', false),
      ])

      if (staffRes.data) {
        const mapped: StaffMember[] = (staffRes.data as any[]).map(s => ({
          ...s,
          hotel_name:         s.hotels?.hotel_name ?? '',
          dept_name:          s.departments?.dept_name ?? '',
          role_name:          s.staff_roles?.role_name ?? '',
          role_category:      s.staff_roles?.role_category ?? '',
          manager_first_name: s.manager?.first_name ?? null,
          manager_last_name:  s.manager?.last_name ?? null,
        }))
        setStaff(mapped)
      }
      if (hotelRes.data) setHotels(hotelRes.data)
      if (deptRes.data)  setDepartments(deptRes.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  // ─── Filtered & sorted ───────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...staff]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(s =>
        `${s.first_name} ${s.last_name}`.toLowerCase().includes(q) ||
        s.employee_code.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.role_name.toLowerCase().includes(q) ||
        s.dept_name.toLowerCase().includes(q)
      )
    }
    if (hotelFilter !== 'all') list = list.filter(s => s.hotel_id === Number(hotelFilter))
    if (deptFilter  !== 'all') list = list.filter(s => s.department_id === Number(deptFilter))
    if (shiftFilter !== 'all') list = list.filter(s => s.shift === shiftFilter)
    if (catFilter   !== 'all') list = list.filter(s => s.role_category === catFilter)
    if (activeFilter === 'active')   list = list.filter(s => s.is_active)
    if (activeFilter === 'inactive') list = list.filter(s => !s.is_active)

    list.sort((a, b) => {
      let av: any = a[sortField as keyof StaffMember]
      let bv: any = b[sortField as keyof StaffMember]
      if (typeof av === 'string') av = av.toLowerCase()
      if (typeof bv === 'string') bv = bv.toLowerCase()
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1  : -1
      return 0
    })
    return list
  }, [staff, search, hotelFilter, deptFilter, shiftFilter, catFilter, activeFilter, sortField, sortDir])

  // ─── Stats ────────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total       = staff.length
    const active      = staff.filter(s => s.is_active).length
    const managers    = staff.filter(s => s.role_category === 'management').length
    const totalSalary = staff.reduce((sum, s) => sum + parseFloat(s.salary || '0'), 0)
    const byHotel     = hotels.map(h => ({
      name:  h.hotel_name.replace('Grand Azure ', '').replace('Azure Boutique ', 'Boutique '),
      count: staff.filter(s => s.hotel_id === h.hotel_id).length,
      id:    h.hotel_id,
    }))
    return { total, active, managers, totalSalary, byHotel }
  }, [staff, hotels])

  const availableDepts = useMemo(() => {
    if (hotelFilter === 'all') return departments
    return departments.filter(d => d.hotel_id === Number(hotelFilter))
  }, [hotelFilter, departments])

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ChevronDown className="w-3 h-3 opacity-30" />
    return sortDir === 'asc'
      ? <ChevronUp   className="w-3 h-3 text-[#0e8ee6]" />
      : <ChevronDown className="w-3 h-3 text-[#0e8ee6]" />
  }

  const activeFilterCount = [hotelFilter, deptFilter, shiftFilter, catFilter, activeFilter]
    .filter(f => f !== 'all').length

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    // KEY FIX: w-full + min-w-0 prevents content from escaping its container.
    // All padding is symmetric: px-4 on mobile, px-6 on md, px-8 on xl.
    // No fixed widths — everything uses percentages / flex / grid.
    <div className="w-full min-w-0 bg-slate-50 min-h-screen">
      <div className="w-full min-w-0 px-4 py-6 md:px-6 xl:px-8">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-6 flex flex-wrap items-start justify-between gap-3"
        >
          <div className="min-w-0">
            <h1 className="font-display text-xl font-bold text-slate-800 sm:text-2xl xl:text-3xl truncate">
              Staff Management
            </h1>
            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
              {stats.total} team members across {hotels.length} properties
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={fetchAll}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50 transition-colors sm:text-sm"
            >
              <RefreshCw className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">Refresh</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 gradient-azure rounded-xl px-3 py-2 text-xs font-semibold text-white shadow-azure transition-all hover:shadow-lg sm:px-4 sm:text-sm"
            >
              <Plus className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Add Staff</span>
            </motion.button>
          </div>
        </motion.div>

        {/* ── Stats Cards ── */}
        {/* 2 cols on mobile, 4 cols on lg and above */}
        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            {
              label: 'Total Staff',
              value: loading ? '—' : stats.total,
              sub: `${stats.active} active`,
              icon: <Users className="w-4 h-4 sm:w-5 sm:h-5" />,
              iconClass: 'bg-blue-50 text-[#0e8ee6]',
            },
            {
              label: 'Active Members',
              value: loading ? '—' : stats.active,
              sub: `${stats.total - stats.active} inactive`,
              icon: <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />,
              iconClass: 'bg-emerald-50 text-emerald-600',
            },
            {
              label: 'Management',
              value: loading ? '—' : stats.managers,
              sub: 'Managerial roles',
              icon: <Shield className="w-4 h-4 sm:w-5 sm:h-5" />,
              iconClass: 'bg-violet-50 text-violet-600',
            },
            {
              label: 'Payroll',
              value: loading ? '—' : formatCurrency(stats.totalSalary),
              sub: 'Monthly total',
              icon: <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />,
              iconClass: 'bg-amber-50 text-amber-600',
            },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
              className="rounded-2xl bg-white p-3 shadow-premium border border-slate-100 sm:p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium text-slate-500 truncate sm:text-xs">{card.label}</p>
                  <p className="mt-1 text-lg font-bold text-slate-800 truncate sm:text-xl xl:text-2xl">
                    {card.value}
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-400 truncate sm:text-xs">{card.sub}</p>
                </div>
                <div className={cn('flex-shrink-0 rounded-xl p-1.5 sm:p-2', card.iconClass)}>
                  {card.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Hotel Pills ── */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
          className="mb-4 flex flex-wrap gap-2"
        >
          {stats.byHotel.map(h => (
            <button
              key={h.id}
              onClick={() => setHotelFilter(hotelFilter === String(h.id) ? 'all' : String(h.id))}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium border transition-all',
                hotelFilter === String(h.id)
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              )}
            >
              <span className={cn('h-2 w-2 rounded-full flex-shrink-0', HOTEL_DOT[h.id])} />
              <span className="truncate max-w-[100px] sm:max-w-none">{h.name}</span>
              <span className={cn(
                'rounded-full px-1.5 py-0.5 text-[10px] font-semibold flex-shrink-0',
                hotelFilter === String(h.id) ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              )}>
                {h.count}
              </span>
            </button>
          ))}
        </motion.div>

        {/* ── Search + Filters ── */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="mb-4 rounded-2xl bg-white shadow-premium border border-slate-100 overflow-hidden"
        >
          {/* Top bar */}
          <div className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:gap-3 sm:p-4">
            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search name, code, role…"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-8 pr-7 text-xs text-slate-800 placeholder-slate-400 focus:border-[#0e8ee6] focus:outline-none focus:ring-2 focus:ring-[#0e8ee6]/10 transition-all sm:py-2.5 sm:text-sm sm:pl-9"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  <X className="w-3 h-3 text-slate-400 hover:text-slate-600" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Filter toggle */}
              <button
                onClick={() => setShowFilters(v => !v)}
                className={cn(
                  'flex items-center gap-1.5 rounded-xl border px-2.5 py-2 text-xs font-medium transition-all sm:px-3 sm:text-sm',
                  showFilters || activeFilterCount > 0
                    ? 'border-[#0e8ee6] bg-blue-50 text-[#0e8ee6]'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                )}
              >
                <Filter className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#0e8ee6] text-[9px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* View toggle */}
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5 gap-0.5">
                {(['table', 'grid'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={cn(
                      'rounded-lg px-2.5 py-1.5 text-[10px] font-medium transition-all capitalize sm:px-3 sm:text-xs',
                      viewMode === mode
                        ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
                        : 'text-slate-500 hover:text-slate-700'
                    )}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Filter panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="border-t border-slate-100 px-3 py-3 grid grid-cols-2 gap-2 sm:px-4 sm:py-4 sm:gap-3 md:grid-cols-3 xl:grid-cols-5">
                  {/* Hotel */}
                  <div>
                    <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[11px]">Hotel</label>
                    <select
                      value={hotelFilter}
                      onChange={e => { setHotelFilter(e.target.value); setDeptFilter('all') }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-[#0e8ee6] focus:outline-none sm:px-3 sm:py-2 sm:text-sm"
                    >
                      <option value="all">All Hotels</option>
                      {hotels.map(h => <option key={h.hotel_id} value={h.hotel_id}>{h.hotel_name}</option>)}
                    </select>
                  </div>
                  {/* Dept */}
                  <div>
                    <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[11px]">Department</label>
                    <select
                      value={deptFilter}
                      onChange={e => setDeptFilter(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-[#0e8ee6] focus:outline-none sm:px-3 sm:py-2 sm:text-sm"
                    >
                      <option value="all">All Depts</option>
                      {availableDepts.map(d => <option key={d.department_id} value={d.department_id}>{d.dept_name}</option>)}
                    </select>
                  </div>
                  {/* Category */}
                  <div>
                    <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[11px]">Category</label>
                    <select
                      value={catFilter}
                      onChange={e => setCatFilter(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-[#0e8ee6] focus:outline-none sm:px-3 sm:py-2 sm:text-sm"
                    >
                      <option value="all">All</option>
                      {Object.entries(ROLE_CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  {/* Shift */}
                  <div>
                    <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[11px]">Shift</label>
                    <select
                      value={shiftFilter}
                      onChange={e => setShiftFilter(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-[#0e8ee6] focus:outline-none sm:px-3 sm:py-2 sm:text-sm"
                    >
                      <option value="all">All Shifts</option>
                      {Object.entries(SHIFT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  {/* Status */}
                  <div>
                    <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[11px]">Status</label>
                    <select
                      value={activeFilter}
                      onChange={e => setActiveFilter(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-[#0e8ee6] focus:outline-none sm:px-3 sm:py-2 sm:text-sm"
                    >
                      <option value="all">All</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                {activeFilterCount > 0 && (
                  <div className="border-t border-slate-100 px-3 pb-3 sm:px-4">
                    <button
                      onClick={() => {
                        setHotelFilter('all'); setDeptFilter('all')
                        setShiftFilter('all'); setCatFilter('all'); setActiveFilter('all')
                      }}
                      className="text-xs font-medium text-rose-500 hover:text-rose-600 transition-colors"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Result count ── */}
        <div className="mb-3">
          <p className="text-xs text-slate-500 sm:text-sm">
            {loading ? 'Loading…' : `${filtered.length} of ${staff.length} staff members`}
          </p>
        </div>

        {/* ── Skeleton ── */}
        {loading && (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-14 rounded-2xl bg-white animate-pulse border border-slate-100 sm:h-16" />
            ))}
          </div>
        )}

        {/* ── TABLE VIEW ── */}
        {!loading && viewMode === 'table' && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="rounded-2xl bg-white shadow-premium border border-slate-100 overflow-hidden"
          >
            {/* Scrollable wrapper — table scrolls horizontally inside the card */}
            <div className="overflow-x-auto w-full">
              <table className="w-full" style={{ minWidth: '700px' }}>
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    {[
                      { label: 'Employee',   field: 'first_name',  w: 'w-[200px]' },
                      { label: 'Role',       field: 'role_name',   w: 'w-[160px]' },
                      { label: 'Dept',       field: 'dept_name',   w: 'w-[120px]' },
                      { label: 'Hotel',      field: 'hotel_name',  w: 'w-[100px]' },
                      { label: 'Shift',      field: 'shift',       w: 'w-[90px]'  },
                      { label: 'Salary',     field: 'salary',      w: 'w-[110px]' },
                      { label: 'Hired',      field: 'hire_date',   w: 'w-[100px]' },
                      { label: 'Status',     field: 'is_active',   w: 'w-[80px]'  },
                      { label: '',           field: '',            w: 'w-[40px]'  },
                    ].map(col => (
                      <th
                        key={col.label}
                        onClick={() => col.field && handleSort(col.field)}
                        className={cn(
                          col.w,
                          'px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:px-4 sm:text-[11px]',
                          col.field && 'cursor-pointer select-none hover:text-slate-600'
                        )}
                      >
                        <span className="flex items-center gap-1">
                          {col.label}
                          {col.field && <SortIcon field={col.field} />}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-16 text-center text-sm text-slate-400">
                          No staff members found
                        </td>
                      </tr>
                    ) : filtered.map((s, i) => (
                      <motion.tr
                        key={s.staff_id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: Math.min(i * 0.025, 0.3) }}
                        onClick={() => { setSelectedStaff(s); setShowDetail(true) }}
                        className={cn(
                          'group cursor-pointer border-b border-slate-50 transition-colors hover:bg-slate-50/60',
                          'border-l-2',
                          HOTEL_ACCENT[s.hotel_id] ?? 'border-l-slate-200'
                        )}
                      >
                        {/* Employee — initials + name text only */}
                        <td className="px-3 py-3 sm:px-4 sm:py-3.5">
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <div className={cn(
                              'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-[11px] font-bold sm:h-9 sm:w-9 sm:text-xs',
                              getInitialsBg(`${s.first_name}${s.last_name}`)
                            )}>
                              {getInitials(s.first_name, s.last_name)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-800 truncate sm:text-sm">
                                {s.first_name} {s.last_name}
                              </p>
                              <p className="text-[10px] text-slate-400 sm:text-xs">{s.employee_code}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-3 py-3 sm:px-4 sm:py-3.5">
                          <p className="text-xs text-slate-700 truncate sm:text-sm">{s.role_name}</p>
                          <span className={cn(
                            'mt-0.5 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-medium sm:px-2 sm:text-[10px]',
                            ROLE_CATEGORY_COLORS[s.role_category] ?? 'bg-slate-100 text-slate-500'
                          )}>
                            {ROLE_CATEGORY_LABELS[s.role_category] ?? s.role_category}
                          </span>
                        </td>

                        {/* Dept */}
                        <td className="px-3 py-3 sm:px-4 sm:py-3.5">
                          <p className="text-xs text-slate-600 truncate sm:text-sm">{s.dept_name}</p>
                        </td>

                        {/* Hotel */}
                        <td className="px-3 py-3 sm:px-4 sm:py-3.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className={cn('h-2 w-2 rounded-full flex-shrink-0', HOTEL_DOT[s.hotel_id] ?? 'bg-slate-300')} />
                            <p className="text-xs text-slate-600 truncate sm:text-sm">
                              {s.hotel_name.replace('Grand Azure ', '').replace('Azure Boutique ', '')}
                            </p>
                          </div>
                        </td>

                        {/* Shift */}
                        <td className="px-3 py-3 sm:px-4 sm:py-3.5">
                          <span className={cn(
                            'rounded-full px-2 py-0.5 text-[10px] font-medium whitespace-nowrap sm:px-2.5 sm:py-1',
                            SHIFT_COLORS[s.shift] ?? 'bg-slate-100 text-slate-500 border border-slate-200'
                          )}>
                            {SHIFT_LABELS[s.shift] ?? s.shift}
                          </span>
                        </td>

                        {/* Salary */}
                        <td className="px-3 py-3 sm:px-4 sm:py-3.5">
                          <p className="text-xs font-semibold text-slate-700 sm:text-sm">
                            {formatCurrency(parseFloat(s.salary))}
                          </p>
                          <p className="text-[10px] text-slate-400">/mo</p>
                        </td>

                        {/* Hired */}
                        <td className="px-3 py-3 sm:px-4 sm:py-3.5">
                          <p className="text-xs text-slate-600 whitespace-nowrap sm:text-sm">
                            {new Date(s.hire_date).toLocaleDateString('en-PK', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="px-3 py-3 sm:px-4 sm:py-3.5">
                          <span className={cn(
                            'rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap sm:px-2.5 sm:py-1',
                            s.is_active
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-600 border border-rose-200'
                          )}>
                            {s.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>

                        {/* More */}
                        <td className="px-3 py-3 sm:px-4 sm:py-3.5">
                          <button
                            onClick={e => { e.stopPropagation(); setSelectedStaff(s); setShowDetail(true) }}
                            className="rounded-lg p-1.5 text-slate-400 opacity-0 transition-all group-hover:opacity-100 hover:bg-slate-100 hover:text-slate-700"
                          >
                            <MoreHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ── GRID VIEW ── */}
        {!loading && viewMode === 'grid' && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {filtered.length === 0 ? (
                <div className="col-span-full py-16 text-center text-sm text-slate-400">
                  No staff members found
                </div>
              ) : filtered.map((s, i) => (
                <motion.div
                  key={s.staff_id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ delay: Math.min(i * 0.035, 0.35) }}
                  onClick={() => { setSelectedStaff(s); setShowDetail(true) }}
                  className={cn(
                    'group cursor-pointer rounded-2xl bg-white border shadow-premium p-3 sm:p-4',
                    'transition-all hover:-translate-y-0.5 hover:shadow-lg',
                    'border-l-4 border-slate-100',
                    HOTEL_ACCENT[s.hotel_id] ?? 'border-l-slate-200'
                  )}
                >
                  {/* Header: initials + name text only */}
                  <div className="flex items-start gap-2 mb-3 sm:gap-3">
                    <div className={cn(
                      'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-xs font-bold sm:h-11 sm:w-11 sm:text-sm',
                      getInitialsBg(`${s.first_name}${s.last_name}`)
                    )}>
                      {getInitials(s.first_name, s.last_name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 truncate leading-tight">
                        {s.first_name} {s.last_name}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 sm:text-xs">{s.employee_code}</p>
                    </div>
                    <span className={cn(
                      'rounded-full px-1.5 py-0.5 text-[9px] font-semibold flex-shrink-0 sm:px-2 sm:text-[10px]',
                      s.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'
                    )}>
                      {s.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Role */}
                  <div className="mb-3">
                    <p className="text-xs font-medium text-slate-700 truncate sm:text-sm">{s.role_name}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <span className={cn(
                        'rounded-full px-1.5 py-0.5 text-[9px] font-medium sm:px-2 sm:text-[10px]',
                        ROLE_CATEGORY_COLORS[s.role_category] ?? 'bg-slate-100 text-slate-500'
                      )}>
                        {ROLE_CATEGORY_LABELS[s.role_category] ?? s.role_category}
                      </span>
                      <span className={cn(
                        'rounded-full px-1.5 py-0.5 text-[9px] font-medium sm:px-2 sm:text-[10px]',
                        SHIFT_COLORS[s.shift] ?? 'bg-slate-100 text-slate-500'
                      )}>
                        {SHIFT_LABELS[s.shift] ?? s.shift}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-1.5 border-t border-slate-50 pt-3">
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 sm:text-xs">
                      <Building2 className="w-3 h-3 flex-shrink-0 text-slate-400" />
                      <span className="truncate">
                        {s.dept_name} · {s.hotel_name.replace('Grand Azure ', '').replace('Azure Boutique ', '')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 sm:text-xs">
                      <DollarSign className="w-3 h-3 flex-shrink-0 text-slate-400" />
                      <span>{formatCurrency(parseFloat(s.salary))} / mo</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 sm:text-xs">
                      <Calendar className="w-3 h-3 flex-shrink-0 text-slate-400" />
                      <span>Since {new Date(s.hire_date).toLocaleDateString('en-PK', { month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

      </div>

      {/* ── Modals ── */}
      <StaffDetailModal
        staff={selectedStaff}
        open={showDetail}
        onClose={() => { setShowDetail(false); setSelectedStaff(null) }}
      />
      <AddStaffModal
        open={showAdd}
        hotels={hotels}
        departments={departments}
        onClose={() => setShowAdd(false)}
        onSuccess={() => { setShowAdd(false); fetchAll() }}
      />
    </div>
  )
}