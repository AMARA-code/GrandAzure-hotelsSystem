'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft, CreditCard, Banknote,
  Building, Briefcase, CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useBooking } from '@/lib/hooks/useBookings'
import { formatCurrency } from '@/lib/utils/formatters'

const paymentMethods = [
  { value: 'cash',             label: 'Cash',             icon: Banknote,   color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { value: 'credit_card',      label: 'Credit Card',      icon: CreditCard, color: 'text-azure-600',   bg: 'bg-azure-50',   border: 'border-azure-200'   },
  { value: 'bank_transfer',    label: 'Bank Transfer',    icon: Building,   color: 'text-violet-600',  bg: 'bg-violet-50',  border: 'border-violet-200'  },
  { value: 'corporate_account',label: 'Corporate Account',icon: Briefcase,  color: 'text-gold-600',    bg: 'bg-gold-50',    border: 'border-gold-200'    },
]

export default function AddPaymentPage() {
  const params  = useParams()
  const router  = useRouter()
  const id      = parseInt(params.id as string)
  const { booking, loading } = useBooking(id)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    amount:         '',
    payment_method: 'cash',
    transaction_ref: '',
    notes:          '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.amount || parseFloat(form.amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    setSaving(true)
    try {
      const supabase = createClient()

      // First get or create invoice
      const { data: existingInvoice } = await supabase
        .from('invoices')
        .select('invoice_id, paid_amount, total_amount, balance_due')
        .eq('booking_id', id)
        .single()

      const amount = parseFloat(form.amount)

      if (existingInvoice) {
        // Add payment record
        const { error: payError } = await supabase
          .from('payments')
          .insert({
            invoice_id:     existingInvoice.invoice_id,
            booking_id:     id,
            payment_method: form.payment_method,
            payment_status: 'completed',
            amount:         amount,
            currency_code:  'PKR',
            transaction_ref: form.transaction_ref || `TXN-${Date.now()}`,
            paid_at:        new Date().toISOString(),
          })

        if (payError) throw payError

        // Update invoice paid amount
        const newPaid    = (existingInvoice.paid_amount ?? 0) + amount
        const newBalance = Math.max(0, (existingInvoice.total_amount ?? 0) - newPaid)

        await supabase
          .from('invoices')
          .update({
            paid_amount:  newPaid,
            balance_due:  newBalance,
            status:       newBalance <= 0 ? 'paid' : 'sent',
          })
          .eq('invoice_id', existingInvoice.invoice_id)

      } else {
        // Create invoice first then payment
        const subtotal = (booking?.total_amount ?? 0) - (booking?.tax_amount ?? 0)
        const { data: newInvoice, error: invError } = await supabase
          .from('invoices')
          .insert({
            booking_id:   id,
            hotel_id:     booking?.hotel?.hotel_id,
            guest_id:     booking?.guest?.guest_id,
            invoice_no:   `INV-2026-${String(id).padStart(6, '0')}`,
            invoice_date: new Date().toISOString().split('T')[0],
            subtotal:     subtotal,
            tax_rate:     16,
            tax_amount:   booking?.tax_amount ?? 0,
            total_amount: booking?.total_amount ?? 0,
            paid_amount:  amount,
            balance_due:  Math.max(0, (booking?.total_amount ?? 0) - amount),
            status:       amount >= (booking?.total_amount ?? 0) ? 'paid' : 'sent',
            created_by:   1,
          })
          .select()
          .single()

        if (invError) throw invError

        await supabase
          .from('payments')
          .insert({
            invoice_id:     newInvoice.invoice_id,
            booking_id:     id,
            payment_method: form.payment_method,
            payment_status: 'completed',
            amount:         amount,
            currency_code:  'PKR',
            transaction_ref: form.transaction_ref || `TXN-${Date.now()}`,
            paid_at:        new Date().toISOString(),
          })
      }

      setSuccess(true)
      toast.success(`Payment of ${formatCurrency(amount)} recorded successfully!`)
      setTimeout(() => router.push(`/bookings/${id}`), 1500)
    } catch (err: any) {
      console.error(err)
      toast.error(err.message ?? 'Failed to record payment')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-azure-500 focus:border-transparent focus:bg-white transition-all"
  const labelClass = "block text-sm font-semibold text-slate-700 mb-2"

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="h-12 bg-slate-100 rounded-xl animate-pulse" />
        <div className="h-96 bg-white rounded-2xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8 max-w-2xl mx-auto">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Link
          href={`/bookings/${id}`}
          className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add Payment</h1>
          <p className="text-slate-500 mt-0.5">
            {booking?.confirmation_no} — {booking?.guest?.first_name} {booking?.guest?.last_name}
          </p>
        </div>
      </motion.div>

      {/* Success State */}
      {success ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-emerald-50 rounded-2xl border border-emerald-200 p-12 text-center"
        >
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-emerald-800 mb-2">Payment Recorded!</h2>
          <p className="text-emerald-600">Redirecting to booking...</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="md:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-card p-8 space-y-6"
          >

            {/* Amount */}
            <div>
              <label className={labelClass}>Payment Amount (PKR)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">
                  PKR
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="0"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  className="w-full pl-14 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-azure-500 focus:border-transparent focus:bg-white transition-all"
                  required
                />
              </div>

              {/* Quick amount buttons */}
              {booking && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {[
                    { label: 'Full Amount', value: booking.total_amount },
                    { label: '50%', value: Math.round(booking.total_amount / 2) },
                    { label: 'Tax Only', value: booking.tax_amount },
                  ].map(opt => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, amount: String(opt.value) }))}
                      className="px-3 py-1.5 rounded-lg bg-azure-50 text-azure-700 text-xs font-semibold border border-azure-200 hover:bg-azure-100 transition-colors"
                    >
                      {opt.label} ({formatCurrency(opt.value)})
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label className={labelClass}>Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                {paymentMethods.map(method => {
                  const Icon      = method.icon
                  const isSelected = form.payment_method === method.value
                  return (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, payment_method: method.value }))}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? `${method.bg} ${method.border} ${method.color}`
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isSelected ? method.color : 'text-slate-400'}`} />
                      <span className="text-sm font-semibold">{method.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Transaction Reference */}
            <div>
              <label className={labelClass}>
                Transaction Reference
                <span className="text-slate-400 font-normal ml-1">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. TXN-123456 or cheque number"
                value={form.transaction_ref}
                onChange={e => setForm(f => ({ ...f, transaction_ref: e.target.value }))}
                className={inputClass}
              />
            </div>

            {/* Notes */}
            <div>
              <label className={labelClass}>
                Notes
                <span className="text-slate-400 font-normal ml-1">(optional)</span>
              </label>
              <textarea
                placeholder="Any notes about this payment..."
                rows={2}
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className={inputClass}
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Link
                href={`/bookings/${id}`}
                className="px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all"
              >
                Cancel
              </Link>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3 rounded-xl gradient-azure text-white font-semibold shadow-azure hover:opacity-90 transition-all disabled:opacity-70"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Record Payment
                  </>
                )}
              </motion.button>
            </div>
          </motion.form>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
              <h3 className="font-bold text-slate-900 mb-4">Booking Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-semibold">
                    {formatCurrency((booking?.total_amount ?? 0) - (booking?.tax_amount ?? 0))}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Tax (16%)</span>
                  <span className="font-semibold">
                    {formatCurrency(booking?.tax_amount ?? 0)}
                  </span>
                </div>
                <div className="border-t border-slate-100 pt-3 flex justify-between">
                  <span className="font-bold text-slate-900">Total Due</span>
                  <span className="font-bold text-lg text-slate-900">
                    {formatCurrency(booking?.total_amount ?? 0)}
                  </span>
                </div>
              </div>
            </div>

            {form.amount && parseFloat(form.amount) > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-50 rounded-2xl border border-emerald-100 p-6"
              >
                <h3 className="font-bold text-emerald-800 mb-3">Payment Preview</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600">Paying</span>
                    <span className="font-bold text-emerald-800">
                      {formatCurrency(parseFloat(form.amount))}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600">Remaining</span>
                    <span className="font-bold text-emerald-800">
                      {formatCurrency(
                        Math.max(0, (booking?.total_amount ?? 0) - parseFloat(form.amount))
                      )}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  )
}