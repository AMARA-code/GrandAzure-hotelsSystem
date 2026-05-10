'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, UtensilsCrossed, BedDouble, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'
import { createOrder } from '@/lib/hooks/useRestaurants'
import type { RestaurantWithStats } from '@/types/restaurant'

interface Props {
  open: boolean
  onClose: () => void
  restaurants: RestaurantWithStats[]
  onSuccess: () => void
}

const ORDER_TYPES = [
  { value: 'dine_in',      label: 'Dine-in',     icon: UtensilsCrossed },
  { value: 'room_service', label: 'Room Service', icon: BedDouble },
  { value: 'takeaway',     label: 'Takeaway',     icon: ShoppingBag },
]

// Input / select shared style — matches homepage warm aesthetic
const inputCls = [
  'w-full px-3 py-2.5 rounded-xl text-sm bg-[#FDF8F3]',
  'border border-[#E7E3DC]',
  'focus:outline-none focus:ring-2 focus:ring-[#D4722A]/20 focus:border-[#D4722A]',
  'placeholder:text-[#A8A29E] text-[#1C1917]',
  'transition-colors',
].join(' ')

export default function NewOrderModal({ open, onClose, restaurants, onSuccess }: Props) {
  const [form, setForm] = useState({
    restaurant_id: '',
    order_type: 'dine_in',
    table_no: '',
    total_amount: '',
    charged_to_room: false,
    notes: '',
    taken_by: 1,
  })
  const [submitting, setSubmitting] = useState(false)

  function set(field: string, value: unknown) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    if (!form.restaurant_id) { toast.error('Please select a restaurant'); return }
    if (!form.total_amount || isNaN(Number(form.total_amount))) { toast.error('Please enter a valid amount'); return }
    setSubmitting(true)
    try {
      await createOrder({
        restaurant_id: Number(form.restaurant_id),
        order_type: form.order_type as 'dine_in' | 'room_service' | 'takeaway',
        table_no: form.order_type === 'dine_in' ? form.table_no || null : null,
        total_amount: form.total_amount,
        charged_to_room: form.charged_to_room,
        notes: form.notes || null,
        taken_by: form.taken_by,
        status: 'pending',
      })
      onSuccess()
      setForm({ restaurant_id: '', order_type: 'dine_in', table_no: '', total_amount: '', charged_to_room: false, notes: '', taken_by: 1 })
    } catch (e: unknown) {
      toast.error('Failed to create order: ' + (e instanceof Error ? e.message : String(e)))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 24 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md flex flex-col overflow-hidden"
              style={{
                maxHeight: 'calc(100vh - 2rem)',
                background: '#fff',
                borderRadius: 20,
                border: '1.5px solid #F3DCC0',
                boxShadow: '0 24px 64px -8px rgba(212,114,42,0.18), 0 8px 24px -4px rgba(0,0,0,0.08)',
              }}
            >

              {/* ── HEADER — cream banner, matches homepage hero style ── */}
              <div
                className="flex-shrink-0 flex items-center justify-between px-6 py-5"
                style={{
                  background: 'linear-gradient(135deg, #FDF8F3 0%, #FBF0E3 60%, #F5DCC0 100%)',
                  borderBottom: '1.5px solid #F3DCC0',
                }}
              >
                {/* Subtle blob decoration */}
                <div style={{
                  position: 'absolute', top: -20, right: 40,
                  width: 100, height: 100, borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(212,114,42,0.10) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }} />

                <div className="flex items-center gap-3 relative">
                  {/* Terracotta icon box — same as restaurant page header */}
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: 'linear-gradient(135deg, #D4722A 0%, #944A15 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(212,114,42,0.30)',
                  }}>
                    <UtensilsCrossed style={{ width: 18, height: 18, color: '#fff' }} />
                  </div>
                  <div>
                    {/* Eyebrow pill — matches homepage badge style */}
                    <div style={{
                      display: 'inline-flex', alignItems: 'center',
                      background: '#FDE8D4', border: '1px solid #F5C9A8',
                      borderRadius: 999, padding: '2px 10px', marginBottom: 3,
                      fontSize: '0.58rem', fontWeight: 700,
                      color: '#C2511A', letterSpacing: '0.12em', textTransform: 'uppercase',
                    }}>
                      F&amp;B Order
                    </div>
                    <h2 style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: '1.15rem', fontWeight: 600,
                      color: '#1C1917', lineHeight: 1.1, margin: 0,
                    }}>
                      New <em style={{ color: '#D4722A', fontStyle: 'italic' }}>Order</em>
                    </h2>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: '#fff', border: '1.5px solid #E7E3DC',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.currentTarget.style.borderColor = '#D4722A'
                    e.currentTarget.style.color = '#D4722A'
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.currentTarget.style.borderColor = '#E7E3DC'
                    e.currentTarget.style.color = '#78716C'
                  }}
                >
                  <X style={{ width: 14, height: 14 }} />
                </button>
              </div>

              {/* ── SCROLLABLE BODY ── */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                {/* Restaurant */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#44403C', marginBottom: 6 }}>
                    Restaurant <span style={{ color: '#E11D48' }}>*</span>
                  </label>
                  <select
                    value={form.restaurant_id}
                    onChange={e => set('restaurant_id', e.target.value)}
                    className={inputCls}
                  >
                    <option value="">Select restaurant…</option>
                    {restaurants.map(r => (
                      <option key={r.restaurant_id} value={r.restaurant_id}>
                        {r.restaurant_name} — {r.hotel_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Order Type */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#44403C', marginBottom: 6 }}>
                    Order Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {ORDER_TYPES.map(t => {
                      const active = form.order_type === t.value
                      return (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => set('order_type', t.value)}
                          style={{
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', gap: 6,
                            padding: '10px 8px', borderRadius: 12,
                            border: active ? '2px solid #D4722A' : '2px solid #E7E3DC',
                            background: active ? '#FFF4ED' : '#fff',
                            color: active ? '#B85E1E' : '#78716C',
                            fontSize: '0.72rem', fontWeight: 600,
                            cursor: 'pointer', transition: 'all 0.15s',
                            boxShadow: active ? '0 2px 8px rgba(212,114,42,0.15)' : 'none',
                          }}
                        >
                          <t.icon style={{
                            width: 16, height: 16,
                            color: active ? '#D4722A' : '#A8A29E',
                          }} />
                          {t.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Table Number — dine-in only */}
                {form.order_type === 'dine_in' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#44403C', marginBottom: 6 }}>
                      Table Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. T05"
                      value={form.table_no}
                      onChange={e => set('table_no', e.target.value)}
                      className={inputCls}
                    />
                  </div>
                )}

                {/* Amount */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#44403C', marginBottom: 6 }}>
                    Total Amount (PKR) <span style={{ color: '#E11D48' }}>*</span>
                  </label>
                  <div className="relative">
                    <span style={{
                      position: 'absolute', left: 12, top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '0.8rem', fontWeight: 600,
                      color: '#A8A29E', pointerEvents: 'none',
                    }}>Rs.</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={form.total_amount}
                      onChange={e => set('total_amount', e.target.value)}
                      className={inputCls}
                      style={{ paddingLeft: 40 }}
                    />
                  </div>
                </div>

                {/* Charge to Room — warm tint instead of violet */}
                <div style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px', borderRadius: 12,
                  background: '#FFF4ED', border: '1.5px solid #F5C9A8',
                }}>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#7C3810' }}>
                      Charge to Room
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#C4A882', marginTop: 2 }}>
                      Bill added to guest room invoice
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => set('charged_to_room', !form.charged_to_room)}
                    style={{
                      position: 'relative', width: 44, height: 24,
                      borderRadius: 999, flexShrink: 0, border: 'none',
                      cursor: 'pointer', transition: 'background 0.2s',
                      background: form.charged_to_room
                        ? 'linear-gradient(135deg, #D4722A 0%, #944A15 100%)'
                        : '#E7E3DC',
                    }}
                  >
                    <span style={{
                      position: 'absolute', top: 2, left: 2,
                      width: 20, height: 20, borderRadius: '50%',
                      background: '#fff',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                      transition: 'transform 0.2s',
                      transform: form.charged_to_room ? 'translateX(20px)' : 'translateX(0)',
                    }} />
                  </button>
                </div>

                {/* Notes */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#44403C', marginBottom: 6 }}>
                    Notes <span style={{ fontSize: '0.72rem', color: '#A8A29E', fontWeight: 400 }}>(optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Special instructions, allergies, preferences…"
                    value={form.notes}
                    onChange={e => set('notes', e.target.value)}
                    className={inputCls}
                    style={{ resize: 'none' }}
                  />
                </div>
              </div>

              {/* ── FOOTER ── */}
              <div style={{
                flexShrink: 0, display: 'flex', gap: 12,
                padding: '16px 24px',
                borderTop: '1.5px solid #F3DCC0',
                background: '#FDF8F3',
              }}>
                <button
                  onClick={onClose}
                  style={{
                    flex: 1, padding: '10px 16px', borderRadius: 10,
                    border: '1.5px solid #E7E3DC', background: '#fff',
                    color: '#57534E', fontSize: '0.83rem', fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.currentTarget.style.borderColor = '#D4722A'
                    e.currentTarget.style.color = '#D4722A'
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.currentTarget.style.borderColor = '#E7E3DC'
                    e.currentTarget.style.color = '#57534E'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{
                    flex: 1, padding: '10px 16px', borderRadius: 10,
                    border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
                    background: submitting
                      ? '#E7E3DC'
                      : 'linear-gradient(135deg, #D4722A 0%, #944A15 100%)',
                    color: submitting ? '#A8A29E' : '#fff',
                    fontSize: '0.83rem', fontWeight: 700,
                    boxShadow: submitting ? 'none' : '0 4px 16px rgba(212,114,42,0.35)',
                    transition: 'all 0.2s',
                  }}
                >
                  {submitting ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <span style={{
                        width: 14, height: 14, borderRadius: '50%',
                        border: '2px solid #C4B89A',
                        borderTopColor: '#78716C',
                        display: 'inline-block',
                        animation: 'spin 0.7s linear infinite',
                      }} />
                      Creating…
                    </span>
                  ) : '+ Create Order'}
                </button>
              </div>

              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}