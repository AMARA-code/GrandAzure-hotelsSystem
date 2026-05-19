'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, Copy, CheckCircle2, AlertCircle, Loader2,
  Phone, User, DollarSign, ArrowRight, ImageIcon, X
} from 'lucide-react'

interface JazzCashPaymentProps {
  bookingId: number
  confirmationNo: string
  advanceAmount: number
  discountAmount: number
  originalAmount: number
  jazzcashNumber?: string
  accountName?: string
  onSuccess: (data: { screenshotUrl: string; senderNumber: string; transactionId: string }) => void
  onBack?: () => void
}

const DEFAULT_JAZZCASH_NUMBER = process.env.NEXT_PUBLIC_JAZZCASH_NUMBER ?? '03XX-XXXXXXX'
const DEFAULT_ACCOUNT_NAME = process.env.NEXT_PUBLIC_JAZZCASH_NAME ?? 'Grand Azure Hotels'

export default function JazzCashPayment({
  bookingId,
  confirmationNo,
  advanceAmount,
  discountAmount,
  originalAmount,
  jazzcashNumber = DEFAULT_JAZZCASH_NUMBER,
  accountName = DEFAULT_ACCOUNT_NAME,
  onSuccess,
  onBack,
}: JazzCashPaymentProps) {
  const [step, setStep] = useState<'instructions' | 'upload'>('instructions')
  const [copied, setCopied] = useState<'number' | 'amount' | null>(null)
  const [senderNumber, setSenderNumber] = useState('')
  const [transactionId, setTransactionId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const fmt = (n: number) => `PKR ${n.toLocaleString('en-PK')}`

  async function copyText(text: string, key: 'number' | 'amount') {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (!f.type.startsWith('image/')) { setError('Please upload an image file (JPG, PNG, etc.)'); return }
    if (f.size > 5 * 1024 * 1024) { setError('File size must be under 5 MB'); return }
    setError(null)
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  function removeFile() {
    setFile(null); setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleSubmit() {
    if (!file) { setError('Please upload your JazzCash payment screenshot'); return }
    if (!senderNumber.trim()) { setError('Please enter the JazzCash number you sent from'); return }
    setUploading(true); setError(null)
    try {
      const formData = new FormData()
      formData.append('bookingId', String(bookingId))
      formData.append('screenshot', file)
      formData.append('senderNumber', senderNumber.trim())
      formData.append('transactionId', transactionId.trim())
      formData.append('advanceAmount', String(advanceAmount))
      formData.append('discountAmount', String(discountAmount))

      const res = await fetch('/api/bookings/submit-payment', { method: 'POST', body: formData })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Upload failed')

      onSuccess({ screenshotUrl: json.screenshotUrl, senderNumber: senderNumber.trim(), transactionId: transactionId.trim() })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {(['instructions', 'upload'] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${step === s ? 'bg-amber-500 scale-125' : (i === 0 && step === 'upload') ? 'bg-amber-300' : 'bg-slate-200'}`} />
            {i === 0 && <div className="w-10 h-px bg-slate-200" />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 'instructions' && (
          <motion.div key="instructions" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
            <div className="text-center mb-6">
              <p className="text-xs tracking-[3px] uppercase text-amber-600 mb-2">Step 1 of 2</p>
              <h3 className="text-2xl font-semibold text-slate-900" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Send Payment via JazzCash</h3>
              <p className="text-sm text-slate-500 mt-1">Follow these steps, then upload your screenshot</p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 mb-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-xs text-amber-600 uppercase tracking-widest mb-1">Amount to Send</p>
                  <p className="text-3xl font-bold text-amber-800" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{fmt(advanceAmount)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-green-600 font-medium">You save</p>
                  <p className="text-lg font-bold text-green-600">{fmt(discountAmount)}</p>
                </div>
              </div>
              <div className="flex justify-between text-xs text-amber-600/70">
                <span>Original: <s>{fmt(originalAmount)}</s></span>
                <span>Booking: {confirmationNo}</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 mb-5">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center"><Phone size={16} className="text-red-500" /></div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">JazzCash Number</p>
                    <p className="text-base font-semibold text-slate-800 font-mono">{jazzcashNumber}</p>
                  </div>
                </div>
                <button onClick={() => copyText(jazzcashNumber, 'number')} className="flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg transition-colors">
                  {copied === 'number' ? <CheckCircle2 size={12} className="text-green-500" /> : <Copy size={12} />}
                  {copied === 'number' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="flex items-center gap-3 p-4">
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center"><User size={16} className="text-blue-500" /></div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Account Name</p>
                  <p className="text-base font-semibold text-slate-800">{accountName}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center"><DollarSign size={16} className="text-green-500" /></div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Exact Amount</p>
                    <p className="text-base font-semibold text-slate-800">{fmt(advanceAmount)}</p>
                  </div>
                </div>
                <button onClick={() => copyText(String(advanceAmount), 'amount')} className="flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg transition-colors">
                  {copied === 'amount' ? <CheckCircle2 size={12} className="text-green-500" /> : <Copy size={12} />}
                  {copied === 'amount' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="flex gap-2.5 bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-sm text-blue-700">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <p>After sending, take a <strong>screenshot of your JazzCash confirmation screen</strong> and proceed to upload it.</p>
            </div>

            <div className="flex gap-3">
              {onBack && (
                <button onClick={onBack} className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium py-3.5 rounded-xl transition-colors text-sm">Back</button>
              )}
              <button onClick={() => setStep('upload')} className={`${onBack ? 'flex-[2]' : 'w-full'} bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors`}>
                I&apos;ve Sent the Payment <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 'upload' && (
          <motion.div key="upload" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
            <div className="text-center mb-6">
              <p className="text-xs tracking-[3px] uppercase text-amber-600 mb-2">Step 2 of 2</p>
              <h3 className="text-2xl font-semibold text-slate-900" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Upload Payment Proof</h3>
              <p className="text-sm text-slate-500 mt-1">Upload your JazzCash confirmation screenshot</p>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-600 uppercase tracking-wider mb-2">Payment Screenshot *</label>
              {preview ? (
                <div className="relative rounded-xl overflow-hidden border-2 border-amber-300 bg-amber-50">
                  <img src={preview} alt="Payment proof" className="w-full object-cover max-h-56" />
                  <button onClick={removeFile} className="absolute top-2 right-2 bg-white/90 hover:bg-white text-red-500 rounded-full p-1 shadow-md"><X size={14} /></button>
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent p-3">
                    <p className="text-white text-xs font-medium">{file?.name}</p>
                  </div>
                </div>
              ) : (
                <button onClick={() => fileRef.current?.click()} className="w-full border-2 border-dashed border-slate-300 hover:border-amber-400 hover:bg-amber-50 rounded-xl p-8 flex flex-col items-center gap-3 transition-all duration-200 cursor-pointer">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center"><ImageIcon size={22} className="text-slate-400" /></div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-600">Click to upload screenshot</p>
                    <p className="text-xs text-slate-400 mt-1">JPG, PNG up to 5 MB</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg font-medium"><Upload size={11} />Choose File</div>
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-600 uppercase tracking-wider mb-2">Your JazzCash Number * <span className="text-slate-400 normal-case">(the number you sent from)</span></label>
              <input type="tel" value={senderNumber} onChange={e => setSenderNumber(e.target.value)} placeholder="03XX-XXXXXXX" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all" />
            </div>

            <div className="mb-5">
              <label className="block text-xs font-medium text-slate-600 uppercase tracking-wider mb-2">Transaction ID <span className="text-slate-400 normal-case">(optional)</span></label>
              <input type="text" value={transactionId} onChange={e => setTransactionId(e.target.value)} placeholder="e.g. TT2405XXXXXXXXX" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all" />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">
                  <AlertCircle size={14} />{error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3">
              <button onClick={() => setStep('instructions')} className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium py-3.5 rounded-xl transition-colors text-sm">Back</button>
              <button onClick={handleSubmit} disabled={uploading} className="flex-[2] bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
                {uploading ? <><Loader2 size={16} className="animate-spin" />Submitting...</> : <><Upload size={16} />Submit Payment Proof</>}
              </button>
            </div>
            <p className="text-center text-xs text-slate-400 mt-4">Your booking will be confirmed after our team verifies your payment (usually within 1–2 hours).</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}