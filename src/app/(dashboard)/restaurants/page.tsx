'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { UtensilsCrossed, RefreshCw, Plus, TrendingUp, ShoppingBag, Users, Utensils } from 'lucide-react'
import { toast } from 'sonner'
import FnBStatsCards from '@/components/restaurants/FnBStatsCards'
import RestaurantCards from '@/components/restaurants/RestaurantCards'
import OrdersTable from '@/components/restaurants/OrdersTable'
import NewOrderModal from '@/components/restaurants/NewOrderModal'
import { useFnBStats, useRestaurantOrders } from '@/lib/hooks/useRestaurants'

export default function RestaurantsPage() {
  const { stats, restaurantStats, loading: statsLoading } = useFnBStats()
  const { orders, loading: ordersLoading, refetch } = useRestaurantOrders()
  const [showNewOrder, setShowNewOrder] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  async function handleRefresh() {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
    toast.success('Data refreshed')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-amber-50/30">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8">

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-2xl lg:rounded-3xl p-6 lg:p-8 shadow-gold"
        >
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/5 rounded-full translate-y-24" />
          <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/10 rounded-full -translate-y-16" />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/30">
                <UtensilsCrossed className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-white font-display leading-tight">
                  Restaurants & F&B
                </h1>
                <p className="text-amber-100 text-sm lg:text-base mt-1">
                  Manage outlets, orders and room service across all properties
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium hover:bg-white/30 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowNewOrder(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-amber-600 text-sm font-bold shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>New Order</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {statsLoading ? (
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-premium animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-slate-100 mb-4" />
                <div className="h-6 bg-slate-100 rounded w-2/3 mb-2" />
                <div className="h-3 bg-slate-100 rounded w-full mb-1" />
                <div className="h-3 bg-slate-100 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : stats ? (
          <FnBStatsCards stats={stats} />
        ) : null}

        {/* Restaurant Outlets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4 lg:mb-5">
            <div>
              <h2 className="text-lg lg:text-xl font-bold text-slate-900 font-display">Our Outlets</h2>
              <p className="text-sm text-slate-500 mt-0.5">{restaurantStats.length} active restaurants</p>
            </div>
          </div>

          {statsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-premium animate-pulse overflow-hidden">
                  <div className="h-28 bg-slate-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                    <div className="h-3 bg-slate-100 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <RestaurantCards restaurants={restaurantStats} />
          )}
        </motion.div>

        {/* Orders Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <OrdersTable
            orders={orders}
            loading={ordersLoading}
            onRefresh={refetch}
          />
        </motion.div>

      </div>

      <NewOrderModal
        open={showNewOrder}
        onClose={() => setShowNewOrder(false)}
        restaurants={restaurantStats}
        onSuccess={() => {
          setShowNewOrder(false)
          refetch()
          toast.success('Order created successfully!')
        }}
      />
    </div>
  )
}