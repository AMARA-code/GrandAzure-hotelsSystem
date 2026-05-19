'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarCheck, Plus, Download, Building2, ChevronDown, FileText, Receipt } from 'lucide-react'
import { PagePurposeAvatar } from '@/components/layout/PagePurposeAvatar'
import Link from 'next/link'
import { useBookings, type BookingFilters } from '@/lib/hooks/useBookings'
import BookingCard from '@/components/bookings/BookingCard'
import BookingFiltersBar from '@/components/bookings/BookingFilters'
import { cn } from '@/lib/utils/cn'

const statusTabs = [
  { label: 'All',         value: 'all',         color: 'gradient-azure'   },
  { label: 'Pending',     value: 'pending',     color: 'bg-amber-500'     },
  { label: 'Confirmed',   value: 'confirmed',   color: 'bg-azure-500'     },
  { label: 'Checked In',  value: 'checked_in',  color: 'bg-emerald-500'   },
  { label: 'Checked Out', value: 'checked_out', color: 'bg-slate-500'     },
  { label: 'Cancelled',   value: 'cancelled',   color: 'bg-rose-500'      },
]

const hotelTabs = [
  { label: 'All Properties', value: 'all', icon: '🏨' },
  { label: 'Karachi',        value: '1',   icon: '🌊' },
  { label: 'Lahore',         value: '2',   icon: '🌿' },
  { label: 'Islamabad',      value: '3',   icon: '🏔️' },
]

export default function BookingsPage() {
  const [filters, setFilters] = useState<BookingFilters>({
    search:       '',
    status:       'all',
    hotel_id:     'all',
    channel_type: 'all',
    date_from:    '',
    date_to:      '',
  })
  const [exportOpen, setExportOpen] = useState(false)

  const { bookings, loading, total } = useBookings(filters)

  const counts = {
    pending:     bookings.filter(b => b.booking_status === 'pending').length,
    confirmed:   bookings.filter(b => b.booking_status === 'confirmed').length,
    checked_in:  bookings.filter(b => b.booking_status === 'checked_in').length,
    checked_out: bookings.filter(b => b.booking_status === 'checked_out').length,
    cancelled:   bookings.filter(b => b.booking_status === 'cancelled').length,
  }

  const dateTag = new Date().toISOString().slice(0, 10)

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a   = document.createElement('a')
    a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
  }

  const exportCSV = () => {
    const headers = ['Booking ID','Guest Name','Email','Phone','Hotel','Room','Room Type','Check-In','Check-Out','Nights','Adults','Children','Channel','Status','Total Amount','Currency','Special Requests','Created At']
    const rows = bookings.map((b: any) => {
      const ci = b.check_in_date  ? new Date(b.check_in_date)  : null
      const co = b.check_out_date ? new Date(b.check_out_date) : null
      const nights = ci && co ? Math.round((co.getTime() - ci.getTime()) / (1000 * 60 * 60 * 24)) : ''
      return [b.booking_id??'',`${b.first_name??''} ${b.last_name??''}`.trim(),b.email??'',b.phone??'',b.hotel_name??'',b.room_number??'',b.room_type??'',b.check_in_date??'',b.check_out_date??'',nights,b.adults??'',b.children??'',b.channel_type??'',b.booking_status??'',b.total_amount??'',b.currency_code??'PKR',b.special_requests??'',b.created_at??'']
    })
    const csv = [headers,...rows].map(r=>r.map((c:any)=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n')
    triggerDownload(new Blob([csv],{type:'text/csv;charset=utf-8;'}),`bookings_${dateTag}.csv`)
    setExportOpen(false)
  }

  const exportJSON = () => {
    const data = {
      exported_at: new Date().toISOString(),
      filters: { status: filters.status, hotel_id: filters.hotel_id, channel_type: filters.channel_type, date_from: filters.date_from, date_to: filters.date_to, search: filters.search },
      summary: { total: bookings.length, pending: counts.pending, confirmed: counts.confirmed, checked_in: counts.checked_in, checked_out: counts.checked_out, cancelled: counts.cancelled },
      bookings: bookings.map((b: any) => {
        const ci = b.check_in_date  ? new Date(b.check_in_date)  : null
        const co = b.check_out_date ? new Date(b.check_out_date) : null
        const nights = ci && co ? Math.round((co.getTime()-ci.getTime())/(1000*60*60*24)) : null
        return { booking_id: b.booking_id, guest: { name:`${b.first_name??''} ${b.last_name??''}`.trim(), email:b.email??'', phone:b.phone??'' }, property:{ hotel:b.hotel_name??'', room:b.room_number??'', room_type:b.room_type??'' }, stay:{ check_in:b.check_in_date??null, check_out:b.check_out_date??null, nights, adults:b.adults??null, children:b.children??null }, booking:{ channel:b.channel_type??'', status:b.booking_status??'', total_amount:b.total_amount??null, currency:b.currency_code??'PKR', special_requests:b.special_requests??'', created_at:b.created_at??'' } }
      }),
    }
    triggerDownload(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),`bookings_${dateTag}.json`)
    setExportOpen(false)
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/80 overflow-x-hidden">
      <div className="w-full p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="flex items-center justify-between gap-2 w-full"
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <PagePurposeAvatar variant="bookings" size={44} className="shrink-0" />
            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-slate-900 leading-tight truncate">Bookings</h1>
              <p className="text-[10px] sm:text-xs text-slate-500 truncate hidden sm:block">Manage all reservations across properties</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Export */}
            <div className="relative">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => setExportOpen(prev => !prev)} className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-slate-200 bg-white text-slate-600 text-[11px] sm:text-xs font-medium hover:bg-slate-50 shadow-sm transition-all whitespace-nowrap">
                <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="hidden sm:inline">Export</span>
                <ChevronDown className={cn('w-3 h-3 transition-transform duration-200 hidden sm:block', exportOpen && 'rotate-180')} />
              </motion.button>
              <AnimatePresence>
                {exportOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setExportOpen(false)} />
                    <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }} transition={{ duration: 0.15 }} className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-lg border border-slate-100 z-20 overflow-hidden">
                      <div className="p-2">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide px-2 pt-1 pb-2">Export {bookings.length} booking{bookings.length !== 1 ? 's' : ''}</p>
                        <button onClick={exportCSV} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left">
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0"><FileText className="w-3.5 h-3.5 text-emerald-600" /></div>
                          <div><p className="font-semibold text-sm leading-tight">Export as CSV</p><p className="text-xs text-slate-400">Spreadsheet compatible</p></div>
                        </button>
                        <button onClick={exportJSON} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0"><Receipt className="w-3.5 h-3.5 text-blue-600" /></div>
                          <div><p className="font-semibold text-sm leading-tight">Export as JSON</p><p className="text-xs text-slate-400">With summary &amp; filters</p></div>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <Link href="/bookings/new">
              <motion.span whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl gradient-azure text-white text-[11px] sm:text-sm font-semibold shadow-azure hover:opacity-90 transition-all whitespace-nowrap">
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                <span>New Booking</span>
              </motion.span>
            </Link>
          </div>
        </motion.div>

        {/* Summary Cards — now 5 including Pending */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.35 }}
          className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3"
        >
          {[
            { label: 'Pending',     count: counts.pending,     bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-100',   dot: 'bg-amber-500',   status: 'pending'     },
            { label: 'Confirmed',   count: counts.confirmed,   bg: 'bg-azure-50',   text: 'text-azure-700',   border: 'border-azure-100',   dot: 'bg-azure-500',   status: 'confirmed'   },
            { label: 'Checked In',  count: counts.checked_in,  bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', dot: 'bg-emerald-500', status: 'checked_in'  },
            { label: 'Checked Out', count: counts.checked_out, bg: 'bg-slate-50',   text: 'text-slate-700',   border: 'border-slate-100',   dot: 'bg-slate-400',   status: 'checked_out' },
            { label: 'Cancelled',   count: counts.cancelled,   bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-100',    dot: 'bg-rose-500',    status: 'cancelled'   },
          ].map((item, idx) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.12 + idx * 0.05 }}
              onClick={() => setFilters(f => ({ ...f, status: item.status }))}
              className={cn('p-3 sm:p-4 rounded-2xl border text-left transition-all hover:shadow-sm w-full', item.bg, item.border)}
            >
              <div className="flex items-center gap-1.5 mb-1">
                {/* Pulse animation for pending */}
                <div className="relative flex items-center justify-center">
                  <div className={cn('w-2 h-2 rounded-full shrink-0', item.dot)} />
                  {item.status === 'pending' && item.count > 0 && (
                    <div className={cn('absolute w-2 h-2 rounded-full animate-ping opacity-60', item.dot)} />
                  )}
                </div>
                <p className={cn('text-[10px] sm:text-xs font-semibold truncate', item.text)}>{item.label}</p>
              </div>
              <p className={cn('text-xl sm:text-2xl font-bold', item.text)}>
                {loading ? '…' : item.count}
              </p>
            </motion.button>
          ))}
        </motion.div>

        {/* Pending alert banner — only shows when there are pending bookings */}
        <AnimatePresence>
          {!loading && counts.pending > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <button
                onClick={() => setFilters(f => ({ ...f, status: 'pending' }))}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', border: '1px solid #fde68a' }}
              >
                <div className="relative flex-shrink-0">
                  <div className="h-3 w-3 rounded-full bg-amber-500" />
                  <div className="absolute inset-0 h-3 w-3 rounded-full bg-amber-500 animate-ping opacity-60" />
                </div>
                <p className="text-sm font-semibold text-amber-800">
                  {counts.pending} booking{counts.pending !== 1 ? 's' : ''} awaiting review
                </p>
                <span className="ml-auto text-xs font-medium text-amber-600 underline underline-offset-2">View pending →</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hotel Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.35 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-1.5 w-full"
        >
          <div className="flex items-center gap-1" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
            <Building2 className="w-4 h-4 text-slate-400 mx-1 shrink-0" />
            {hotelTabs.map(tab => (
              <button key={tab.value} onClick={() => setFilters(f => ({ ...f, hotel_id: tab.value }))} className={cn('flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-semibold transition-all shrink-0 whitespace-nowrap', filters.hotel_id === tab.value ? 'gradient-azure text-white shadow-azure' : 'text-slate-600 hover:bg-slate-50')}>
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Status Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.35 }}
          className="w-full"
        >
          <div className="flex items-center gap-1.5 pb-0.5" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
            {statusTabs.map(tab => (
              <button key={tab.value} onClick={() => setFilters(f => ({ ...f, status: tab.value }))} className={cn('px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all shrink-0', filters.status === tab.value ? `${tab.color} text-white shadow-sm` : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50')}>
                {tab.label}
                {tab.value === 'pending' && counts.pending > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-white/25 text-[9px] font-bold">
                    {counts.pending}
                  </span>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Filters Bar */}
        <BookingFiltersBar filters={filters} onChange={setFilters} total={total} />

        {/* Results label */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-[11px] sm:text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-800">{total}</span> bookings
            {filters.hotel_id !== 'all' && (
              <span className="text-azure-600 font-semibold"> · {hotelTabs.find(h => h.value === filters.hotel_id)?.label}</span>
            )}
            {filters.status !== 'all' && (
              <span className="text-emerald-600 font-semibold capitalize"> · {filters.status.replace('_', ' ')}</span>
            )}
          </p>
        </div>

        {/* Bookings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-56 sm:h-64 bg-white rounded-2xl border border-slate-100 animate-pulse" />)}
          </div>
        ) : bookings.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-14 sm:py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <CalendarCheck className="w-7 h-7 sm:w-8 sm:h-8 text-slate-300" />
            </div>
            <p className="text-slate-600 font-semibold text-base sm:text-lg">No bookings found</p>
            <p className="text-slate-400 text-sm mt-1 mb-6 px-6">Try adjusting your filters or create a new booking</p>
            <Link href="/bookings/new" className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl gradient-azure text-white font-semibold shadow-azure hover:opacity-90 transition-all text-sm sm:text-base">
              <Plus className="w-4 h-4" /> New Booking
            </Link>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {bookings.map((booking, idx) => (
              <BookingCard key={booking.booking_id} booking={booking} index={idx} />
            ))}
          </motion.div>
        )}

      </div>
    </div>
  )
}