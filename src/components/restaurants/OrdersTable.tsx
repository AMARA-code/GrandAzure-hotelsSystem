'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronDown, MoreHorizontal, CheckCircle2, Clock, XCircle, UtensilsCrossed, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { OrderStatusBadge, OrderTypeBadge } from './OrderStatusBadge'
import { updateOrderStatus } from '@/lib/hooks/useRestaurants'
import type { RestaurantOrder, OrderStatus } from '@/types/restaurant'

function formatPKR(v: string | number) {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency', currency: 'PKR', maximumFractionDigits: 0
  }).format(Number(v))
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready', label: 'Ready' },
  { value: 'served', label: 'Served' },
  { value: 'cancelled', label: 'Cancelled' },
]

const TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'dine_in', label: 'Dine-in' },
  { value: 'room_service', label: 'Room Service' },
  { value: 'takeaway', label: 'Takeaway' },
]

interface Props {
  orders: RestaurantOrder[]
  loading: boolean
  onRefresh: () => void
}

export default function OrdersTable({ orders, loading, onRefresh }: Props) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [actionMenuId, setActionMenuId] = useState<number | null>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  const filtered = useMemo(() => {
    return orders.filter(o => {
      const s = search.toLowerCase()
      const matchSearch = !search ||
        o.guest_name?.toLowerCase().includes(s) ||
        o.restaurant_name?.toLowerCase().includes(s) ||
        o.table_no?.toLowerCase().includes(s) ||
        o.order_id.toString().includes(s)
      const matchStatus = statusFilter === 'all' || o.status === statusFilter
      const matchType = typeFilter === 'all' || o.order_type === typeFilter
      return matchSearch && matchStatus && matchType
    })
  }, [orders, search, statusFilter, typeFilter])

  async function handleStatusUpdate(orderId: number, newStatus: OrderStatus) {
    setUpdatingId(orderId)
    setActionMenuId(null)
    try {
      const servedAt = newStatus === 'served' ? new Date().toISOString() : undefined
      await updateOrderStatus(orderId, newStatus, servedAt)
      toast.success(`Order #${orderId} marked as ${newStatus}`)
      onRefresh()
    } catch {
      toast.error('Failed to update order status')
    } finally {
      setUpdatingId(null)
    }
  }

  // Check if any actions available for an order
  function hasActions(order: RestaurantOrder) {
    return order.status !== 'served' && order.status !== 'cancelled'
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-premium overflow-hidden">

      {/* Header */}
      <div className="p-5 lg:p-6 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display">All Orders</h2>
            <p className="text-sm text-slate-500 mt-0.5">{filtered.length} of {orders.length} orders</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by guest, restaurant, table…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-azure-500/20 focus:border-azure-400 bg-slate-50"
            />
          </div>
          <div className="flex gap-3">
            <div className="relative flex-1 sm:flex-none">
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-azure-500/20 bg-slate-50 cursor-pointer">
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
            <div className="relative flex-1 sm:flex-none">
              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-azure-500/20 bg-slate-50 cursor-pointer">
                {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Table — shows fewer columns on medium screens */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-4 lg:px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Order</th>
              <th className="text-left px-4 lg:px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Restaurant</th>
              {/* Hide Guest column on medium screens when sidebar takes space */}
              <th className="text-left px-4 lg:px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden xl:table-cell">Guest</th>
              <th className="text-left px-4 lg:px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
              {/* Hide Table column on medium */}
              <th className="text-left px-4 lg:px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Table</th>
              <th className="text-left px-4 lg:px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
              <th className="text-left px-4 lg:px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              {/* Hide Time on medium */}
              <th className="text-left px-4 lg:px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Time</th>
              <th className="px-4 lg:px-5 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(9)].map((_, j) => (
                    <td key={j} className="px-4 lg:px-5 py-4">
                      <div className="h-4 bg-slate-100 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-5 py-20 text-center">
                  <div className="flex flex-col items-center gap-3 text-slate-400">
                    <UtensilsCrossed className="w-10 h-10 opacity-30" />
                    <p className="text-sm font-medium">No orders found</p>
                    <p className="text-xs">Try adjusting your filters</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((order, i) => (
                <motion.tr
                  key={order.order_id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  <td className="px-4 lg:px-5 py-4">
                    <span className="text-sm font-bold text-azure-600">#{order.order_id}</span>
                  </td>
                  <td className="px-4 lg:px-5 py-4">
                    <div className="text-sm font-semibold text-slate-800 whitespace-nowrap">{order.restaurant_name}</div>
                    <div className="text-xs text-slate-400 mt-0.5 hidden lg:block">{order.hotel_name}</div>
                  </td>
                  <td className="px-4 lg:px-5 py-4 hidden xl:table-cell">
                    <div className="text-sm text-slate-700">{order.guest_name}</div>
                    {order.charged_to_room && (
                      <div className="text-xs text-violet-600 font-semibold mt-0.5">Room charge</div>
                    )}
                  </td>
                  <td className="px-4 lg:px-5 py-4">
                    <OrderTypeBadge type={order.order_type} />
                  </td>
                  <td className="px-4 lg:px-5 py-4 hidden lg:table-cell">
                    <span className="text-sm text-slate-600">
                      {order.table_no ?? <span className="text-slate-300">—</span>}
                    </span>
                  </td>
                  <td className="px-4 lg:px-5 py-4">
                    <span className="text-sm font-bold text-slate-800 whitespace-nowrap">{formatPKR(order.total_amount)}</span>
                  </td>
                  <td className="px-4 lg:px-5 py-4">
                    <OrderStatusBadge status={order.status as any} />
                  </td>
                  <td className="px-4 lg:px-5 py-4 hidden lg:table-cell">
                    <div className="text-sm text-slate-600 whitespace-nowrap">{format(new Date(order.ordered_at), 'dd MMM yyyy')}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{format(new Date(order.ordered_at), 'hh:mm a')}</div>
                  </td>
                  <td className="px-4 lg:px-5 py-4 relative">
                    {updatingId === order.order_id ? (
                      <div className="w-5 h-5 border-2 border-azure-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <div className="relative">
                        <button
                          onClick={() => setActionMenuId(actionMenuId === order.order_id ? null : order.order_id)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        <AnimatePresence>
                          {actionMenuId === order.order_id && (
                            <>
                              {/* Backdrop to close */}
                              <div className="fixed inset-0 z-10" onClick={() => setActionMenuId(null)} />
                              <motion.div
                                initial={{ opacity: 0, scale: 0.92, y: -6 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.92, y: -6 }}
                                transition={{ type: 'spring', damping: 20, stiffness: 350 }}
                                className="absolute right-0 top-9 z-20 bg-white rounded-xl shadow-premium-lg border border-slate-100 py-1.5 min-w-[175px]"
                              >
                                {/* Always show current status info */}
                                <div className="px-4 py-2 border-b border-slate-100 mb-1">
                                  <div className="text-xs text-slate-400 font-medium">Order #{order.order_id}</div>
                                  <div className="mt-1">
                                    <OrderStatusBadge status={order.status as any} />
                                  </div>
                                </div>

                                {!hasActions(order) ? (
                                  <div className="px-4 py-3 text-xs text-slate-400 text-center">
                                    No actions available
                                  </div>
                                ) : (
                                  <>
                                    {order.status === 'pending' && (
                                      <button onClick={() => handleStatusUpdate(order.order_id, 'preparing')}
                                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors">
                                        <Clock className="w-3.5 h-3.5" /> Mark Preparing
                                      </button>
                                    )}
                                    {(order.status === 'pending' || order.status === 'preparing') && (
                                      <button onClick={() => handleStatusUpdate(order.order_id, 'ready')}
                                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-violet-600 hover:bg-violet-50 transition-colors">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark Ready
                                      </button>
                                    )}
                                    {order.status !== 'served' && (
                                      <button onClick={() => handleStatusUpdate(order.order_id, 'served')}
                                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 transition-colors">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark Served
                                      </button>
                                    )}
                                    {order.status !== 'cancelled' && (
                                      <button onClick={() => handleStatusUpdate(order.order_id, 'cancelled')}
                                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors">
                                        <XCircle className="w-3.5 h-3.5" /> Cancel Order
                                      </button>
                                    )}
                                  </>
                                )}
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-slate-100">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="p-4 space-y-2 animate-pulse">
              <div className="h-4 bg-slate-100 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <UtensilsCrossed className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No orders found</p>
          </div>
        ) : (
          filtered.map((order, i) => (
            <motion.div
              key={order.order_id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="p-4 hover:bg-slate-50/80 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-bold text-azure-600">#{order.order_id}</span>
                    <OrderStatusBadge status={order.status as any} />
                  </div>
                  <div className="text-sm font-semibold text-slate-800">{order.restaurant_name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{order.guest_name}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-base font-bold text-slate-800">{formatPKR(order.total_amount)}</div>
                  {order.charged_to_room && (
                    <div className="text-xs text-violet-600 font-semibold">Room charge</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <OrderTypeBadge type={order.order_type} />
                {order.table_no && (
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg">{order.table_no}</span>
                )}
                <span className="text-xs text-slate-400">
                  {format(new Date(order.ordered_at), 'dd MMM, hh:mm a')}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}