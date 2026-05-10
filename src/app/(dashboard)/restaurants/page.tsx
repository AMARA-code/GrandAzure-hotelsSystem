'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, Plus } from 'lucide-react'
import { PagePurposeAvatar } from '@/components/layout/PagePurposeAvatar'
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
    <div className="min-h-screen bg-[#FAFAF7]">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8">

        {/* ── Page Header — cream/warm banner matching HomeLanding style ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl lg:rounded-3xl p-6 lg:p-8"
          style={{
            background: 'linear-gradient(135deg, #FDF8F3 0%, #FBF0E3 60%, #F5DCC0 100%)',
            border: '1.5px solid #F3DCC0',
            boxShadow: '0 4px 24px -2px rgba(212,114,42,0.12)',
          }}
        >
          {/* Decorative blobs — warm, subtle */}
          <div style={{
            position: 'absolute', top: -40, right: -40,
            width: 220, height: 220, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212,114,42,0.10) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: -30, left: '30%',
            width: 160, height: 160, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212,114,42,0.07) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <PagePurposeAvatar variant="restaurants" size={56} className="shrink-0" />

              <div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: '#FDE8D4', border: '1px solid #F5C9A8',
                  borderRadius: 999, padding: '3px 12px',
                  fontSize: '0.62rem', fontWeight: 700,
                  color: '#C2511A', letterSpacing: '0.12em',
                  textTransform: 'uppercase', marginBottom: 6,
                }}>
                  F&B Management
                </div>
                <h1 style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
                  fontWeight: 600, color: '#1C1917',
                  letterSpacing: '-0.02em', lineHeight: 1.1,
                  margin: 0,
                }}>
                  Restaurants <em style={{ color: '#D4722A', fontStyle: 'italic' }}>&amp; F&amp;B</em>
                </h1>
                <p style={{ fontSize: '0.85rem', color: '#78716C', marginTop: 4 }}>
                  Manage outlets, orders and room service across all properties
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleRefresh}
                disabled={refreshing}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 18px', borderRadius: 10,
                  background: '#fff', border: '1.5px solid #E7E3DC',
                  color: '#57534E', fontSize: '0.83rem', fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.borderColor = '#D4722A')}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.borderColor = '#E7E3DC')}
              >
                <RefreshCw style={{ width: 15, height: 15 }} className={refreshing ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Refresh</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 8px 28px rgba(212,114,42,0.45)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowNewOrder(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 22px', borderRadius: 10,
                  background: 'linear-gradient(135deg, #D4722A 0%, #944A15 100%)',
                  color: '#fff', fontSize: '0.83rem', fontWeight: 600,
                  cursor: 'pointer', border: 'none',
                  boxShadow: '0 4px 20px rgba(212,114,42,0.35)',
                }}
              >
                <Plus style={{ width: 15, height: 15 }} />
                <span>New Order</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ── Stats Cards ── */}
        {statsLoading ? (
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-[#F0EDE8] shadow-premium animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-[#FFF4ED] mb-4" />
                <div className="h-6 bg-[#FBF0E3] rounded w-2/3 mb-2" />
                <div className="h-3 bg-[#FBF0E3] rounded w-full mb-1" />
                <div className="h-3 bg-[#FBF0E3] rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : stats ? (
          <FnBStatsCards stats={stats} />
        ) : null}

        {/* ── Restaurant Outlets ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4 lg:mb-5">
            <div>
              <span style={{
                fontSize: '0.68rem', letterSpacing: '0.16em',
                color: '#D4722A', textTransform: 'uppercase',
                fontWeight: 700,
              }}>Our Collection</span>
              <h2 style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)',
                fontWeight: 600, color: '#1C1917', marginTop: 4,
              }}>
                Active Outlets
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#78716C', marginTop: 2 }}>
                {restaurantStats.length} active restaurants
              </p>
            </div>
          </div>

          {statsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#F0EDE8] shadow-premium animate-pulse overflow-hidden">
                  <div className="h-28 bg-[#FBF0E3]" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-[#FBF0E3] rounded w-3/4" />
                    <div className="h-3 bg-[#FBF0E3] rounded w-1/2" />
                    <div className="h-3 bg-[#FBF0E3] rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <RestaurantCards restaurants={restaurantStats} />
          )}
        </motion.div>

        {/* ── Orders Table ── */}
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