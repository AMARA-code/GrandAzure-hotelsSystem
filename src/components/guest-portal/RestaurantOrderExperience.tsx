'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { ChefHat, UtensilsCrossed, BedDouble, ShoppingBag, Sparkles } from 'lucide-react'

type RestaurantType = {
  restaurant_id: number
  hotel_id: number
  restaurant_name: string
  cuisine_type: string | null
  capacity: number | null
  open_time: string | null
  close_time: string | null
  hotel_name?: string
  city?: string
}

const ORDER_TYPES = [
  { value: 'dine_in', label: 'Dine-in', icon: UtensilsCrossed },
  { value: 'room_service', label: 'Room Service', icon: BedDouble },
  { value: 'takeaway', label: 'Takeaway', icon: ShoppingBag },
] as const

export default function RestaurantOrderExperience({
  restaurants,
  guestId,
}: {
  restaurants: RestaurantType[]
  guestId: number | null
}) {
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    restaurant_id: restaurants[0]?.restaurant_id?.toString() ?? '',
    order_type: 'dine_in' as (typeof ORDER_TYPES)[number]['value'],
    table_no: '',
    total_amount: '',
    charged_to_room: false,
    notes: '',
  })

  const selectedRestaurant = useMemo(
    () => restaurants.find((r) => String(r.restaurant_id) === form.restaurant_id) ?? null,
    [restaurants, form.restaurant_id]
  )

  const submit = async () => {
    if (!form.restaurant_id) {
      toast.error('Please select a restaurant.')
      return
    }
    if (!form.total_amount || isNaN(Number(form.total_amount))) {
      toast.error('Please enter a valid PKR amount.')
      return
    }

    setSubmitting(true)
    try {
      const payload: any = {
        restaurant_id: Number(form.restaurant_id),
        order_type: form.order_type,
        table_no: form.order_type === 'dine_in' ? form.table_no || null : null,
        total_amount: form.total_amount,
        charged_to_room: form.charged_to_room,
        notes: form.notes || null,
        taken_by: 1,
        status: 'pending',
        guest_id: guestId,
      }

      const res = await fetch('/api/restaurant-orders', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error ?? 'Failed to place order')
        return
      }

      toast.success('Order placed successfully. Our team will begin preparation shortly.')
      setForm((prev) => ({ ...prev, table_no: '', total_amount: '', notes: '' }))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="lg:col-span-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-premium"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900">Place an Order</h2>
            <p className="mt-1 text-sm text-slate-600">Orders placed here appear in the hotel operations system for fulfillment.</p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-3 text-white shadow-gold">
            <ChefHat className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700">Restaurant</span>
            <select
              value={form.restaurant_id}
              onChange={(e) => setForm((p) => ({ ...p, restaurant_id: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2"
            >
              {restaurants.map((r) => (
                <option key={r.restaurant_id} value={r.restaurant_id}>
                  {r.restaurant_name} — {r.hotel_name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700">Total Amount (PKR)</span>
            <input
              type="number"
              min={0}
              value={form.total_amount}
              onChange={(e) => setForm((p) => ({ ...p, total_amount: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2"
              placeholder="e.g. 4500"
            />
          </label>
        </div>

        <div className="mt-4">
          <p className="text-sm font-medium text-slate-700">Order Type</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {ORDER_TYPES.map((t) => {
              const active = form.order_type === t.value
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, order_type: t.value }))}
                  className={`rounded-2xl border-2 px-3 py-3 text-xs font-semibold transition-all ${
                    active
                      ? 'border-amber-300 bg-amber-50 text-amber-800 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <t.icon className={`mx-auto mb-2 h-4 w-4 ${active ? 'text-amber-600' : 'text-slate-400'}`} />
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>

        {form.order_type === 'dine_in' && (
          <div className="mt-4">
            <label className="space-y-2 text-sm">
              <span className="font-medium text-slate-700">Table No (optional)</span>
              <input
                value={form.table_no}
                onChange={(e) => setForm((p) => ({ ...p, table_no: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2"
                placeholder="e.g. T05"
              />
            </label>
          </div>
        )}

        <div className="mt-4 rounded-2xl border border-violet-100 bg-violet-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-violet-900">Charge to Room</p>
              <p className="text-xs text-violet-700/80">If enabled, our team can add this to your room invoice.</p>
            </div>
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, charged_to_room: !p.charged_to_room }))}
              className={`relative h-6 w-11 rounded-full transition-colors ${form.charged_to_room ? 'bg-violet-500' : 'bg-slate-300'}`}
            >
              <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${form.charged_to_room ? 'translate-x-5' : ''}`} />
            </button>
          </div>
        </div>

        <div className="mt-4">
          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700">Notes (optional)</span>
            <textarea
              rows={4}
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2"
              placeholder="Allergies, spice level, delivery instructions…"
            />
          </label>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          disabled={submitting}
          onClick={submit}
          className="mt-5 w-full rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-5 py-3 text-sm font-bold text-white shadow-gold disabled:opacity-70"
        >
          {submitting ? 'Placing order…' : 'Place Order'}
        </motion.button>
      </motion.div>

      <motion.aside
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="lg:col-span-2 space-y-4"
      >
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-premium">
          <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
            <Sparkles className="h-3 w-3" /> Selected outlet
          </p>
          <h3 className="mt-2 font-display text-xl font-bold text-slate-900">
            {selectedRestaurant?.restaurant_name ?? 'Restaurant'}
          </h3>
          <p className="mt-1 text-sm text-slate-600">{selectedRestaurant?.hotel_name} · {selectedRestaurant?.city}</p>
          <div className="mt-4 grid gap-2 text-sm text-slate-700">
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Cuisine</p>
              <p className="font-semibold">{selectedRestaurant?.cuisine_type ?? 'International'}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Hours</p>
              <p className="font-semibold">{selectedRestaurant?.open_time ?? '—'} - {selectedRestaurant?.close_time ?? '—'}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Capacity</p>
              <p className="font-semibold">{selectedRestaurant?.capacity ?? '—'}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-rose-50 p-6 shadow-premium">
          <h4 className="font-display text-lg font-bold text-slate-900">Chef’s Notes</h4>
          <p className="mt-2 text-sm text-slate-600">
            For dietary preferences, add details in Notes. Our team will confirm availability at the time of preparation.
          </p>
        </div>
      </motion.aside>
    </div>
  )
}

