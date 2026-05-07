'use client'

import { motion } from 'framer-motion'
import { Search, Filter, X } from 'lucide-react'
import type { BookingFilters } from '@/lib/hooks/useBookings'

interface BookingFiltersProps {
  filters: BookingFilters
  onChange: (filters: BookingFilters) => void
  total: number
}

const statusOptions = [
  { value: 'all',         label: 'All Status' },
  { value: 'confirmed',   label: 'Confirmed' },
  { value: 'checked_in',  label: 'Checked In' },
  { value: 'checked_out', label: 'Checked Out' },
  { value: 'cancelled',   label: 'Cancelled' },
  { value: 'no_show',     label: 'No Show' },
]

const hotelOptions = [
  { value: 'all', label: 'All Hotels' },
  { value: '1',   label: 'Karachi' },
  { value: '2',   label: 'Lahore' },
  { value: '3',   label: 'Islamabad' },
]

const channelOptions = [
  { value: 'all',       label: 'All Channels' },
  { value: 'direct',    label: 'Direct' },
  { value: 'ota',       label: 'OTA' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'walk_in',   label: 'Walk-in' },
  { value: 'phone',     label: 'Phone' },
  { value: 'agent',     label: 'Agent' },
]

export default function BookingFiltersBar({
  filters,
  onChange,
  total,
}: BookingFiltersProps) {
  const hasActiveFilters =
    filters.search ||
    (filters.status && filters.status !== 'all') ||
    (filters.hotel_id && filters.hotel_id !== 'all') ||
    (filters.channel_type && filters.channel_type !== 'all') ||
    filters.date_from ||
    filters.date_to

  const clearFilters = () => {
    onChange({
      search: '',
      status: 'all',
      hotel_id: 'all',
      channel_type: 'all',
      date_from: '',
      date_to: '',
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 space-y-4"
    >
      {/* Search + Count */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by guest name, email or confirmation no..."
            value={filters.search}
            onChange={e => onChange({ ...filters, search: e.target.value })}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-azure-500 focus:border-transparent focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-semibold text-slate-700">{total}</span>
          <span className="text-sm text-slate-400">bookings</span>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-50 text-rose-600 text-sm font-semibold hover:bg-rose-100 transition-colors border border-rose-200"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Status */}
        <select
          value={filters.status}
          onChange={e => onChange({ ...filters, status: e.target.value })}
          className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-azure-500 focus:bg-white transition-all"
        >
          {statusOptions.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Hotel */}
        <select
          value={filters.hotel_id}
          onChange={e => onChange({ ...filters, hotel_id: e.target.value })}
          className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-azure-500 focus:bg-white transition-all"
        >
          {hotelOptions.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Channel */}
        <select
          value={filters.channel_type}
          onChange={e => onChange({ ...filters, channel_type: e.target.value })}
          className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-azure-500 focus:bg-white transition-all"
        >
          {channelOptions.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Date From */}
        <input
          type="date"
          value={filters.date_from}
          onChange={e => onChange({ ...filters, date_from: e.target.value })}
          className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-azure-500 focus:bg-white transition-all"
        />

        {/* Date To */}
        <input
          type="date"
          value={filters.date_to}
          onChange={e => onChange({ ...filters, date_to: e.target.value })}
          className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-azure-500 focus:bg-white transition-all"
        />
      </div>
    </motion.div>
  )
}