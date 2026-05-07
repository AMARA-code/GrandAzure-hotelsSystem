'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  BadgePercent,
  BedDouble,
  Flame,
  Minus,
  Plus,
  ShoppingCart,
  Sparkles,
  Trash2,
  UtensilsCrossed,
  X,
} from 'lucide-react'
import { DEFAULT_MENU, FOOD_PLACEHOLDER_IMAGES, type MenuItem } from '@/lib/guest-portal/restaurant-menu'
import { formatCurrency } from '@/lib/utils/formatters'
import Image from 'next/image'

type RestaurantType = {
  restaurant_id: number
  hotel_id: number
  restaurant_name: string
  cuisine_type: string | null
  open_time: string | null
  close_time: string | null
  hotel_name?: string
  city?: string
}

type OrderType = 'dine_in' | 'room_service' | 'takeaway'

type CartLine = {
  item: MenuItem
  qty: number
}

function spicyLabel(level: number | undefined) {
  if (!level) return null
  if (level === 1) return 'Mild'
  if (level === 2) return 'Medium'
  return 'Spicy'
}

export default function RestaurantMenuExperience({
  restaurants,
  guestId,
}: {
  restaurants: RestaurantType[]
  guestId: number | null
}) {
  const [restaurantId, setRestaurantId] = useState<number>(restaurants[0]?.restaurant_id ?? 0)
  const [orderType, setOrderType] = useState<OrderType>('dine_in')
  const [tableNo, setTableNo] = useState('')
  const [chargedToRoom, setChargedToRoom] = useState(false)
  const [notes, setNotes] = useState('')
  const [activeCategoryId, setActiveCategoryId] = useState<'all' | string>('all')
  const [cartOpen, setCartOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const allCategories = useMemo(
    () => [{ id: 'all', name: 'All', items: [] as MenuItem[] }, ...DEFAULT_MENU.categories],
    []
  )

  const categoriesToRender = useMemo(() => {
    if (activeCategoryId === 'all') return DEFAULT_MENU.categories
    return DEFAULT_MENU.categories.filter((cat) => cat.id === activeCategoryId)
  }, [activeCategoryId])

  const [cart, setCart] = useState<Record<string, CartLine>>({})

  const cartLines = useMemo(() => Object.values(cart), [cart])
  const subtotal = useMemo(() => cartLines.reduce((sum, line) => sum + line.item.price * line.qty, 0), [cartLines])
  const serviceCharge = useMemo(() => Math.round(subtotal * 0.05), [subtotal])
  const tax = useMemo(() => Math.round(subtotal * 0.16), [subtotal])
  const total = subtotal + serviceCharge + tax

  const addItem = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev[item.id]
      const nextQty = (existing?.qty ?? 0) + 1
      return { ...prev, [item.id]: { item, qty: nextQty } }
    })
  }

  const decItem = (itemId: string) => {
    setCart((prev) => {
      const existing = prev[itemId]
      if (!existing) return prev
      const nextQty = existing.qty - 1
      if (nextQty <= 0) {
        const { [itemId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [itemId]: { ...existing, qty: nextQty } }
    })
  }

  const incItem = (itemId: string) => {
    setCart((prev) => {
      const existing = prev[itemId]
      if (!existing) return prev
      return { ...prev, [itemId]: { ...existing, qty: existing.qty + 1 } }
    })
  }

  const clearCart = () => setCart({})

  const placeOrder = async () => {
    if (!restaurantId) {
      toast.error('Please select a restaurant outlet.')
      return
    }
    if (!cartLines.length) {
      toast.error('Your cart is empty.')
      return
    }
    if (orderType === 'dine_in' && !tableNo) {
      toast.error('Please enter table number for dine-in.')
      return
    }

    setSubmitting(true)
    try {
      const itemized = cartLines.map((line) => ({
        id: line.item.id,
        name: line.item.name,
        qty: line.qty,
        unitPrice: line.item.price,
        lineTotal: line.item.price * line.qty,
      }))

      const notesPayload = {
        guestNotes: notes || null,
        breakdown: {
          subtotal,
          serviceCharge,
          tax,
          total,
        },
        items: itemized,
      }

      const payload: any = {
        restaurant_id: restaurantId,
        order_type: orderType,
        table_no: orderType === 'dine_in' ? tableNo : null,
        total_amount: String(total),
        charged_to_room: chargedToRoom,
        notes: JSON.stringify(notesPayload),
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

      toast.success('Your order is placed.')
      clearCart()
      setNotes('')
      setTableNo('')
      setCartOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/70 bg-white/85 p-4 shadow-premium glass sm:p-5"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
                <Sparkles className="h-3 w-3" /> Dining
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold text-slate-900 sm:text-3xl">Menu & Order</h2>
              <p className="mt-1 text-xs text-slate-600 sm:text-sm">Curated dishes, premium service, seamless ordering.</p>
            </div>

            <button
              onClick={() => setCartOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-lg sm:py-3"
            >
              <ShoppingCart className="h-4 w-4" />
              Cart ({cartLines.reduce((s, l) => s + l.qty, 0)})
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:mt-5 sm:gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="font-medium text-slate-700">Outlet</span>
              <select
                value={restaurantId}
                onChange={(e) => setRestaurantId(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2"
              >
                {restaurants.map((r) => (
                  <option key={r.restaurant_id} value={r.restaurant_id}>
                    {r.restaurant_name} — {r.hotel_name}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {([
                { key: 'dine_in', label: 'Dine-in', icon: UtensilsCrossed },
                { key: 'room_service', label: 'Room', icon: BedDouble },
                { key: 'takeaway', label: 'Takeaway', icon: BadgePercent },
              ] as const).map((t) => {
                const active = orderType === t.key
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setOrderType(t.key)}
                    className={`rounded-xl sm:rounded-2xl border-2 px-2 py-2.5 sm:px-3 sm:py-3 text-[11px] sm:text-xs font-semibold transition-all ${
                      active ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    <t.icon className={`mx-auto mb-2 h-4 w-4 ${active ? 'text-amber-600' : 'text-slate-400'}`} />
                    {t.label}
                  </button>
                )
              })}
            </div>
          </div>

          {orderType === 'dine_in' && (
            <div className="mt-4 grid gap-3 sm:gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-700">Table No</span>
                <input
                  value={tableNo}
                  onChange={(e) => setTableNo(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2"
                  placeholder="e.g. T05"
                />
              </label>
              <div className="rounded-2xl border border-violet-100 bg-violet-50 px-3 py-3 sm:px-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-violet-900">Charge to Room</p>
                    <p className="text-xs text-violet-700/80">Optional for in-house guests.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setChargedToRoom((v) => !v)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${chargedToRoom ? 'bg-violet-500' : 'bg-slate-300'}`}
                  >
                    <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${chargedToRoom ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        <div className="sticky top-[58px] sm:top-[72px] z-10 -mx-1 overflow-x-auto px-1">
          <div className="flex gap-2">
            {allCategories.map((cat) => {
              const active = cat.id === activeCategoryId
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategoryId(cat.id)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                    active
                      ? 'gradient-premium text-white shadow-premium ring-1 ring-white/50'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-azure-50 hover:border-azure-200 hover:text-azure-700'
                  }`}
                >
                  {cat.name}
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-8">
          {categoriesToRender.map((cat) => (
              <section key={cat.id} className="space-y-4">
                <h3 className="font-display text-2xl font-bold text-slate-900">{cat.name}</h3>
                <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {cat.items.map((item, idx) => (
                    <motion.article
                      key={item.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      whileHover={{ y: -6, rotateX: 2, rotateY: -2 }}
                      style={{ transformStyle: 'preserve-3d' }}
                      className="rounded-3xl border border-slate-200 bg-white p-4 shadow-premium sm:p-5"
                    >
                      <div className="space-y-3">
                        <div>
                          <div className="relative mb-3 h-36 w-full overflow-hidden rounded-2xl border border-slate-200">
                            <Image
                              src={item.imageSrc ?? FOOD_PLACEHOLDER_IMAGES[(idx + cat.items.length) % FOOD_PLACEHOLDER_IMAGES.length]}
                              alt={item.name}
                              fill
                              sizes="(max-width: 768px) 100vw, 50vw"
                              className="object-cover"
                              priority={idx < 2}
                            />
                          </div>
                          <h4 className="text-lg font-bold text-slate-900">{item.name}</h4>
                          <p className="mt-1 text-sm font-bold text-azure-700">{formatCurrency(item.price)}</p>
                          <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {item.tags?.map((t) => (
                              <span key={t} className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                                {t}
                              </span>
                            ))}
                            {spicyLabel(item.spicyLevel) && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                                <Flame className="h-3 w-3" />
                                {spicyLabel(item.spicyLevel)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={() => addItem(item)}
                            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-3 py-2 text-xs font-bold text-white"
                          >
                            <Plus className="h-3 w-3" /> Add
                          </button>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </section>
            ))}
        </div>
      </div>

      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={() => setCartOpen(false)}
            />
            <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 20 }}
                className="w-full max-w-lg overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-2xl sm:rounded-3xl"
              >
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-4">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-slate-700" />
                    <p className="text-sm font-bold text-slate-900">Your cart</p>
                  </div>
                  <button className="rounded-xl border border-slate-200 p-2" onClick={() => setCartOpen(false)}>
                    <X className="h-4 w-4 text-slate-600" />
                  </button>
                </div>
                <div className="max-h-[56vh] overflow-y-auto p-4 sm:max-h-[60vh] sm:p-5">
                  {!cartLines.length ? (
                    <p className="text-sm text-slate-500">Your cart is empty. Add items from the menu.</p>
                  ) : (
                    <div className="space-y-3">
                      {cartLines.map((line) => (
                        <div key={line.item.id} className="flex items-start justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900">{line.item.name}</p>
                            <p className="text-xs text-slate-500">{formatCurrency(line.item.price)} each</p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => decItem(line.item.id)} className="rounded-xl border border-slate-200 p-1.5 sm:p-2">
                              <Minus className="h-4 w-4 text-slate-700" />
                            </button>
                            <span className="w-8 text-center text-sm font-bold text-slate-900">{line.qty}</span>
                            <button onClick={() => incItem(line.item.id)} className="rounded-xl border border-slate-200 p-1.5 sm:p-2">
                              <Plus className="h-4 w-4 text-slate-700" />
                            </button>
                            <button
                              onClick={() =>
                                setCart((prev) => {
                                  const { [line.item.id]: _, ...rest } = prev
                                  return rest
                                })
                              }
                              className="rounded-xl border border-rose-200 bg-rose-50 p-1.5 sm:p-2"
                            >
                              <Trash2 className="h-4 w-4 text-rose-700" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="border-t border-slate-100 bg-white px-4 py-4 sm:px-5">
                  <div className="mb-3 space-y-1.5 text-sm">
                    <div className="flex items-center justify-between text-slate-700">
                      <span>Subtotal</span>
                      <span className="font-semibold">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span>Service charge (5%)</span>
                      <span className="font-semibold">{formatCurrency(serviceCharge)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span>Tax (16%)</span>
                      <span className="font-semibold">{formatCurrency(tax)}</span>
                    </div>
                  </div>
                  <div className="mb-3 flex items-center justify-between text-sm">
                    <span className="text-slate-600">Total</span>
                    <span className="font-bold text-slate-900">{formatCurrency(total)}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={clearCart} className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
                      Clear
                    </button>
                    <button
                      onClick={placeOrder}
                      disabled={submitting || !cartLines.length}
                      className="flex-1 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
                    >
                      {submitting ? 'Placing…' : 'Place order'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

