'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Zap, Hotel, Tag, Shield, Clock } from 'lucide-react'

interface PaymentChoiceProps {
  totalAmount: number
  onChoice: (choice: 'pay_at_hotel' | 'jazzcash') => Promise<void>
  isLoading: boolean
}

const DISCOUNT_RATE = 0.10

export default function PaymentChoice({ totalAmount, onChoice, isLoading }: PaymentChoiceProps) {
  const [selected, setSelected] = useState<'pay_at_hotel' | 'jazzcash' | null>(null)

  const discountAmount = Math.round(totalAmount * DISCOUNT_RATE)
  const advanceAmount = totalAmount - discountAmount
  const fmt = (n: number) => `PKR ${n.toLocaleString('en-PK')}`

  function handleSelect(method: 'pay_at_hotel' | 'jazzcash') {
    if (isLoading) return
    setSelected(method)
    setTimeout(() => onChoice(method), 320)
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <p className="text-xs tracking-[3px] uppercase text-amber-600 font-medium mb-2">
          Payment Preference
        </p>
        <h2
          className="text-3xl font-semibold text-slate-900"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          How would you like to pay?
        </h2>
        <p className="text-sm text-slate-500 mt-2">
          Total stay value:{' '}
          <span className="font-medium text-slate-700">{fmt(totalAmount)}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Pay at Hotel */}
        <motion.button
          onClick={() => handleSelect('pay_at_hotel')}
          whileTap={{ scale: 0.98 }}
          disabled={isLoading}
          className={`relative rounded-2xl border-2 p-6 text-left transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
            selected === 'pay_at_hotel'
              ? 'border-slate-800 bg-slate-800 text-white shadow-xl'
              : 'border-slate-200 bg-white hover:border-slate-400 hover:shadow-lg'
          }`}
        >
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${
            selected === 'pay_at_hotel' ? 'bg-white/10' : 'bg-slate-100'
          }`}>
            <Hotel size={20} className={selected === 'pay_at_hotel' ? 'text-white' : 'text-slate-600'} />
          </div>

          <h3
            className={`text-lg font-semibold mb-1 ${selected === 'pay_at_hotel' ? 'text-white' : 'text-slate-800'}`}
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Pay at Hotel
          </h3>
          <p className={`text-sm mb-5 leading-relaxed ${selected === 'pay_at_hotel' ? 'text-slate-300' : 'text-slate-500'}`}>
            No payment required now. Settle the full amount at check-in.
          </p>

          <div className={`rounded-xl p-3 mb-4 ${selected === 'pay_at_hotel' ? 'bg-white/10' : 'bg-slate-50'}`}>
            <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">Due at Check-In</p>
            <p className={`text-xl font-bold ${selected === 'pay_at_hotel' ? 'text-white' : 'text-slate-800'}`}>
              {fmt(totalAmount)}
            </p>
          </div>

          <ul className="space-y-1.5">
            {['No upfront payment', 'Free cancellation policy applies', 'Pay cash or card at hotel'].map(p => (
              <li key={p} className={`flex items-center gap-2 text-xs ${selected === 'pay_at_hotel' ? 'text-slate-300' : 'text-slate-500'}`}>
                <Check size={11} />
                {p}
              </li>
            ))}
          </ul>

          <AnimatePresence>
            {selected === 'pay_at_hotel' && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-4 right-4 w-6 h-6 bg-white rounded-full flex items-center justify-center"
              >
                <Check size={12} className="text-slate-800" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* JazzCash Advance */}
        <motion.button
          onClick={() => handleSelect('jazzcash')}
          whileTap={{ scale: 0.98 }}
          disabled={isLoading}
          className={`relative rounded-2xl border-2 p-6 text-left transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
            selected === 'jazzcash'
              ? 'border-amber-500 bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-xl shadow-amber-200'
              : 'border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-100'
          }`}
        >
          {/* Discount badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md shadow-amber-200 whitespace-nowrap">
              <Tag size={9} />
              10% OFF
            </span>
          </div>

          <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 mt-2 ${
            selected === 'jazzcash' ? 'bg-white/20' : 'bg-amber-100'
          }`}>
            <Zap size={20} className={selected === 'jazzcash' ? 'text-white' : 'text-amber-600'} />
          </div>

          <h3
            className={`text-lg font-semibold mb-1 ${selected === 'jazzcash' ? 'text-white' : 'text-amber-900'}`}
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Pay via JazzCash
          </h3>
          <p className={`text-sm mb-5 leading-relaxed ${selected === 'jazzcash' ? 'text-amber-100' : 'text-amber-700'}`}>
            Send advance payment to our JazzCash account & unlock a 10% discount instantly.
          </p>

          <div className={`rounded-xl p-3 mb-4 ${selected === 'jazzcash' ? 'bg-white/15' : 'bg-white/80'}`}>
            <div className="flex justify-between mb-1">
              <span className={`text-xs ${selected === 'jazzcash' ? 'text-amber-200' : 'text-slate-400'}`}>Original</span>
              <span className={`text-sm line-through ${selected === 'jazzcash' ? 'text-amber-200' : 'text-slate-400'}`}>{fmt(totalAmount)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className={`text-xs ${selected === 'jazzcash' ? 'text-green-300' : 'text-green-600'}`}>Discount (10%)</span>
              <span className={`text-sm font-medium ${selected === 'jazzcash' ? 'text-green-300' : 'text-green-600'}`}>− {fmt(discountAmount)}</span>
            </div>
            <div className={`border-t border-dashed pt-2 ${selected === 'jazzcash' ? 'border-white/30' : 'border-amber-200'}`}>
              <div className="flex justify-between items-center">
                <span className={`text-xs uppercase tracking-widest ${selected === 'jazzcash' ? 'text-amber-200' : 'text-slate-500'}`}>Pay Now</span>
                <span className={`text-xl font-bold ${selected === 'jazzcash' ? 'text-white' : 'text-amber-800'}`}>{fmt(advanceAmount)}</span>
              </div>
            </div>
          </div>

          <ul className="space-y-1.5">
            {['10% instant discount applied', 'Priority booking confirmation', 'Invoice emailed immediately'].map(p => (
              <li key={p} className={`flex items-center gap-2 text-xs ${selected === 'jazzcash' ? 'text-amber-100' : 'text-amber-700'}`}>
                <Check size={11} className={selected === 'jazzcash' ? 'text-amber-200' : 'text-amber-500'} />
                {p}
              </li>
            ))}
          </ul>

          <AnimatePresence>
            {selected === 'jazzcash' && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-4 right-4 w-6 h-6 bg-white rounded-full flex items-center justify-center"
              >
                <Check size={12} className="text-amber-500" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Trust row */}
      <div className="flex items-center justify-center gap-6 mt-6">
        {[
          { icon: Shield, label: 'Secure booking' },
          { icon: Clock,  label: 'Instant confirmation' },
          { icon: Check,  label: 'No hidden fees' },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-xs text-slate-400">
            <Icon size={11} />
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}