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
  { value: 'dine_in',      label: 'Dine-in',      icon: UtensilsCrossed },
  { value: 'room_service', label: 'Room Service',  icon: BedDouble },
  { value: 'takeaway',     label: 'Takeaway',      icon: ShoppingBag },
]

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

  function set(field: string, value: any) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    if (!form.restaurant_id) { toast.error('Please select a restaurant'); return }
    if (!form.total_amount || isNaN(Number(form.total_amount))) { toast.error('Please enter a valid amount'); return }
    setSubmitting(true)
    try {
      await createOrder({
        restaurant_id: Number(form.restaurant_id),
        order_type: form.order_type as any,
        table_no: form.order_type === 'dine_in' ? form.table_no || null : null,
        total_amount: form.total_amount,
        charged_to_room: form.charged_to_room,
        notes: form.notes || null,
        taken_by: form.taken_by,
        status: 'pending',
      })
      onSuccess()
      setForm({ restaurant_id: '', order_type: 'dine_in', table_no: '', total_amount: '', charged_to_room: false, notes: '', taken_by: 1 })
    } catch (e: any) {
      toast.error('Failed to create order: ' + e.message)
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Modal wrapper — centers and constrains height */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 24 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden"
              style={{ maxHeight: 'calc(100vh - 2rem)' }}
            >
              {/* ── HEADER (always visible) ── */}
              <div className="flex-shrink-0 flex items-center justify-between px-6 py-5"
                style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                    <UtensilsCrossed className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold font-display text-lg leading-tight">New Order</h2>
                    <p className="text-amber-100 text-xs mt-0.5">Create a new F&B order</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/35 flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* ── SCROLLABLE BODY ── */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                {/* Restaurant */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Restaurant <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.restaurant_id}
                    onChange={e => set('restaurant_id', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 bg-slate-50"
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
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Order Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {ORDER_TYPES.map(t => {
                      const active = form.order_type === t.value
                      return (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => set('order_type', t.value)}
                          className={`flex flex-col items-center gap-2 py-3 px-2 rounded-xl border-2 text-xs font-semibold transition-all duration-150 ${
                            active
                              ? 'border-amber-400 bg-amber-50 text-amber-700 shadow-sm'
                              : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <t.icon className={`w-4 h-4 ${active ? 'text-amber-600' : 'text-slate-400'}`} />
                          {t.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Table Number — dine-in only */}
                {form.order_type === 'dine_in' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Table Number</label>
                    <input
                      type="text"
                      placeholder="e.g. T05"
                      value={form.table_no}
                      onChange={e => set('table_no', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 bg-slate-50"
                    />
                  </div>
                )}

                {/* Amount */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Total Amount (PKR) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium select-none">Rs.</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={form.total_amount}
                      onChange={e => set('total_amount', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 bg-slate-50"
                    />
                  </div>
                </div>

                {/* Charge to Room */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-violet-50 border border-violet-100">
                  <div>
                    <div className="text-sm font-semibold text-violet-800">Charge to Room</div>
                    <div className="text-xs text-violet-500 mt-0.5">Bill added to guest room invoice</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => set('charged_to_room', !form.charged_to_room)}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
                      form.charged_to_room ? 'bg-violet-500' : 'bg-slate-300'
                    }`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                      form.charged_to_room ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Notes (optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Special instructions, allergies, preferences…"
                    value={form.notes}
                    onChange={e => set('notes', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 bg-slate-50 resize-none"
                  />
                </div>
              </div>

              {/* ── FOOTER (always visible) ── */}
              <div className="flex-shrink-0 flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/80">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-bold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 disabled:opacity-60 disabled:scale-100 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)' }}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Creating…
                    </span>
                  ) : (
                    '+ Create Order'
                  )}
                </button>
              </div>

            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}