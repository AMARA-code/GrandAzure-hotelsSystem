
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, ArrowRight, Sparkles, Star, CheckCircle2, RotateCcw, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

type Step = 'request' | 'sent' | 'reset' | 'success'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('request')
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setTilt({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 6,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * -6,
    })
  }

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/forgot-password?step=reset`,
      })
      if (error) { toast.error(error.message); return }
      setStep('sent')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/forgot-password?step=reset`,
      })
      toast.success('Reset link resent to your inbox.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) { toast.error(error.message); return }
      setStep('success')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const tickerItems = [
    'Secure Recovery', 'Encrypted Link', 'Instant Delivery',
    'Account Protection', 'Enterprise Security', 'Privacy First',
  ]

  const pastelCards = [
    { label: 'Encrypted',    color: 'from-rose-100   to-rose-50   text-rose-700   border-rose-200'   },
    { label: '5-Min Expiry', color: 'from-sky-100    to-sky-50    text-sky-700    border-sky-200'    },
    { label: 'Instant Link', color: 'from-violet-100 to-violet-50 text-violet-700 border-violet-200' },
    { label: 'Safe & Secure',color: 'from-emerald-100 to-emerald-50 text-emerald-700 border-emerald-200' },
  ]

  const steps = [
    { label: 'Request Link',   done: step !== 'request'                      },
    { label: 'Check Inbox',    done: step === 'reset' || step === 'success'   },
    { label: 'New Password',   done: step === 'success'                       },
  ]

  const inp = 'w-full pl-11 pr-4 py-3.5 rounded-2xl border border-[#ead8c4] bg-white/80 text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-[#d4722a]/20 focus:border-[#d4722a] hover:border-[#d4722a]/50 hover:-translate-y-px transition-all duration-200 text-sm shadow-sm'

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative"
      style={{ background: 'linear-gradient(135deg, #fdf8f2 0%, #fff6ed 35%, #fef9f5 65%, #fdf4ee 100%)' }}
    >
      {/* Ambient pastel blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-45 blur-[120px]"
          style={{ background: 'radial-gradient(circle, #fde8d0 0%, #fbcfaa 60%, transparent 100%)' }} />
        <div className="absolute -bottom-40 -right-40 w-[550px] h-[550px] rounded-full opacity-40 blur-[110px]"
          style={{ background: 'radial-gradient(circle, #dbeafe 0%, #bfdbfe 60%, transparent 100%)' }} />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full opacity-28 blur-[90px]"
          style={{ background: 'radial-gradient(circle, #fdf4ff 0%, #f3e8ff 60%, transparent 100%)' }} />
        <div className="absolute bottom-1/3 left-1/4 w-[350px] h-[350px] rounded-full opacity-28 blur-[80px]"
          style={{ background: 'radial-gradient(circle, #f0fdf4 0%, #dcfce7 60%, transparent 100%)' }} />
        <div className="absolute top-10 right-10 w-[220px] h-[220px] rounded-full opacity-25 blur-[60px]"
          style={{ background: 'radial-gradient(circle, #fefce8 0%, #fef9c3 60%, transparent 100%)' }} />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #d4722a 1px, transparent 0)', backgroundSize: '28px 28px' }} />
      </div>

      <div className="w-full max-w-5xl relative z-10">

        {/* Ticker */}
        <div className="overflow-hidden rounded-2xl border border-[#ead8c4] bg-[#fff6ed]/90 py-2.5 mb-6 shadow-sm backdrop-blur-sm">
          <motion.div className="flex w-max whitespace-nowrap"
            animate={{ x: ['0%', '-50%'] }} transition={{ duration: 26, ease: 'linear', repeat: Infinity }}>
            {[...tickerItems, ...tickerItems].map((item, idx) => (
              <span key={idx} className="inline-flex items-center gap-2 px-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b5a3c]">
                <Sparkles className="h-3 w-3 text-[#d4722a]" />{item}
              </span>
            ))}
          </motion.div>
        </div>

        {/* 3D Card */}
        <motion.div
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setTilt({ x: 0, y: 0 })}
          animate={{ rotateX: tilt.y, rotateY: tilt.x }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          style={{
            transformStyle: 'preserve-3d', perspective: 1400,
            boxShadow: '0 32px 80px rgba(139,90,60,0.18), 0 8px 24px rgba(139,90,60,0.10)',
          }}
          className="grid lg:grid-cols-[1fr_1.1fr] overflow-hidden rounded-3xl border border-[#ead8c4]"
        >

          {/* Left panel */}
          <div
            className="relative hidden lg:flex flex-col justify-between overflow-hidden p-10"
            style={{ background: 'linear-gradient(160deg, #fff8f0 0%, #fdecd8 50%, #fde3c4 100%)' }}
          >
            {/* Floating pastel shapes */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-10 right-4 w-24 h-24 rounded-2xl rotate-12 bg-rose-100/80 border border-rose-200/60" />
              <div className="absolute top-1/3 right-0 w-14 h-14 rounded-xl -rotate-6 bg-sky-100/70 border border-sky-200/50" />
              <div className="absolute top-2/3 right-6 w-16 h-16 rounded-2xl rotate-8 bg-violet-100/70 border border-violet-200/50" />
              <div className="absolute bottom-8 left-6 w-20 h-20 rounded-2xl -rotate-10 bg-emerald-100/70 border border-emerald-200/50" />
              <div className="absolute top-1/2 left-2 w-10 h-10 rounded-xl rotate-20 bg-amber-100/80 border border-amber-200/60" />
            </div>
            <div className="absolute top-5 right-5 opacity-10">
              <svg width="72" height="72" viewBox="0 0 60 60" fill="none">
                <path d="M30 5L35 20L51 20L38 30L43 46L30 37L17 46L22 30L9 20L25 20Z" stroke="#c9a84c" strokeWidth="1.5" fill="none" />
              </svg>
            </div>

            {/* Brand */}
            <div className="relative z-10">
              <div className="inline-flex items-center gap-3 rounded-2xl border border-[#ead8c4] bg-white/70 px-4 py-2.5 backdrop-blur-sm shadow-sm">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#d4722a] to-[#b85e1f] flex items-center justify-center">
                  <Star className="h-3.5 w-3.5 text-white fill-white" />
                </div>
                <span className="font-display text-base font-bold text-stone-800">Grand <span className="text-[#d4722a]">Azure</span></span>
              </div>
            </div>

            <div className="relative z-10 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px w-6 bg-[#c9a84c]" />
                  <Sparkles className="h-3 w-3 text-[#c9a84c]" />
                  <div className="h-px w-6 bg-[#c9a84c]" />
                </div>
                <h1 className="font-display text-4xl font-bold text-stone-900 leading-tight">
                  Secure<br /><em className="text-[#d4722a] not-italic">Account Recovery</em>
                </h1>
                <p className="mt-2.5 text-sm text-stone-500 leading-relaxed">
                  We'll send a secure, encrypted reset link to your inbox in moments.
                </p>
              </div>

              {/* Progress stepper */}
              <div className="space-y-2.5">
                {steps.map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 * i + 0.3 }}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl border text-xs font-medium transition-all duration-300 ${
                      s.done
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-white/60 border-[#ead8c4] text-stone-500'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold transition-all duration-300 ${
                      s.done ? 'bg-emerald-500 text-white' : 'bg-[#ead8c4] text-[#8b5a3c]'
                    }`}>
                      {s.done ? '✓' : i + 1}
                    </div>
                    {s.label}
                  </motion.div>
                ))}
              </div>

              {/* Pastel security cards */}
              <div className="grid grid-cols-2 gap-2">
                {pastelCards.map((c, i) => (
                  <motion.div
                    key={c.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i + 0.5 }}
                    whileHover={{ y: -4, rotateX: 5, rotateY: -5, scale: 1.03 }}
                    style={{ transformStyle: 'preserve-3d' }}
                    className={`rounded-2xl border bg-gradient-to-br px-3 py-2.5 text-[11px] font-semibold flex items-center gap-1.5 ${c.color}`}
                  >
                    <Sparkles className="h-2.5 w-2.5 flex-shrink-0" />{c.label}
                  </motion.div>
                ))}
              </div>
            </div>

            <p className="relative z-10 text-[10px] text-stone-400 tracking-wide">© 2025 Grand Azure Hotel Group</p>
            <div className="absolute bottom-0 left-0 right-0 h-[3px]"
              style={{ background: 'linear-gradient(90deg, transparent, #c9a84c 30%, #d4722a 60%, transparent)' }} />
          </div>

          {/* Right form panel */}
          <div className="px-8 py-10 lg:px-12 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #fffaf7 0%, #fdf5ee 100%)' }}>

            {/* Mobile brand */}
            <div className="flex lg:hidden justify-center mb-6">
              <span className="font-display text-2xl font-bold text-stone-900">Grand <span className="text-[#d4722a]">Azure</span></span>
            </div>

            <AnimatePresence mode="wait">

              {/* ── STEP 1: Request ── */}
              {step === 'request' && (
                <motion.div
                  key="request"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-px w-5 bg-[#d4722a]" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#d4722a]">Account Recovery</span>
                  </div>
                  <h2 className="font-display text-4xl font-bold text-stone-900 leading-tight">
                    Reset Your<br /><span className="text-[#8b5a3c]">Password</span>
                  </h2>
                  <p className="mt-2 mb-7 text-sm text-stone-400 leading-relaxed">
                    Enter your registered email and we'll send a secure reset link straight to your inbox.
                  </p>

                  {/* Gold ornament */}
                  <div className="flex items-center gap-3 mb-7">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#ead8c4]" />
                    <div className="w-1.5 h-1.5 rotate-45 bg-[#c9a84c]" />
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#ead8c4]" />
                  </div>

                  <form onSubmit={handleRequestReset} className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8b5a3c]">Registered Email</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#c4a882] transition-colors group-focus-within:text-[#d4722a]" />
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@grandazure.com" required className={inp} />
                      </div>
                    </div>

                    {/* Info note */}
                    <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl bg-amber-50 border border-amber-200">
                      <div className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-amber-700 text-[10px] font-bold">i</span>
                      </div>
                      <p className="text-xs text-amber-700 leading-relaxed">
                        A reset link will be sent to your inbox. Check your spam folder if you don't see it within a few minutes. The link expires in 5 minutes.
                      </p>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.01, y: -2 }} whileTap={{ scale: 0.99 }}
                      type="submit" disabled={loading}
                      className="w-full py-3.5 px-6 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ background: 'linear-gradient(135deg, #d4722a 0%, #b85e1f 100%)', boxShadow: '0 8px 24px rgba(212,114,42,0.35)' }}
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>Send Reset Link <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/20"><ArrowRight className="h-3.5 w-3.5" /></span></>
                      )}
                    </motion.button>
                  </form>

                  <p className="mt-6 text-center text-sm text-stone-400">
                    Remembered it?{' '}
                    <Link href="/login" className="font-semibold text-[#d4722a] hover:text-[#8b5a3c] transition-colors">Back to sign in</Link>
                  </p>
                </motion.div>
              )}

              {/* ── STEP 2: Email Sent ── */}
              {step === 'sent' && (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center text-center"
                >
                  {/* Animated envelope */}
                  <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                    className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #fff6ed, #fdecd8)', border: '2px solid #ead8c4' }}
                  >
                    <Mail className="h-9 w-9 text-[#d4722a]" />
                  </motion.div>

                  <div className="flex items-center gap-2 mb-3 justify-center">
                    <div className="h-px w-5 bg-[#d4722a]" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#d4722a]">Email Sent</span>
                    <div className="h-px w-5 bg-[#d4722a]" />
                  </div>
                  <h2 className="font-display text-4xl font-bold text-stone-900 leading-tight mb-2">
                    Check Your<br /><span className="text-[#8b5a3c]">Inbox</span>
                  </h2>
                  <p className="text-sm text-stone-400 leading-relaxed mb-8 max-w-sm">
                    We've sent a secure reset link to{' '}
                    <span className="font-semibold text-[#d4722a]">{email}</span>.
                    The link expires in 5 minutes.
                  </p>

                  {/* What happens next */}
                  <div className="w-full space-y-3 mb-8">
                    {[
                      { text: 'Open the email from Grand Azure', color: 'bg-rose-50 border-rose-200 text-rose-700' },
                      { text: 'Click the secure reset link inside', color: 'bg-sky-50 border-sky-200 text-sky-700' },
                      { text: 'Enter and confirm your new password', color: 'bg-violet-50 border-violet-200 text-violet-700' },
                      { text: 'Sign in with your new credentials', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.08 * i + 0.2 }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-xs font-medium text-left ${item.color}`}
                      >
                        <div className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">{i + 1}</div>
                        {item.text}
                      </motion.div>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01, y: -2 }} whileTap={{ scale: 0.99 }}
                    onClick={handleResend} disabled={loading}
                    className="w-full py-3.5 px-6 rounded-2xl border-2 border-[#ead8c4] text-[#8b5a3c] font-semibold text-sm flex items-center justify-center gap-2.5 hover:border-[#d4722a]/50 hover:bg-orange-50/60 transition-all duration-200 hover:-translate-y-px disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-[#d4722a]/30 border-t-[#d4722a] rounded-full animate-spin" />
                    ) : (
                      <><RotateCcw className="h-4 w-4" /> Resend Email</>
                    )}
                  </motion.button>

                  <p className="mt-5 text-sm text-stone-400">
                    <Link href="/login" className="font-semibold text-[#d4722a] hover:text-[#8b5a3c] transition-colors">← Back to sign in</Link>
                  </p>
                </motion.div>
              )}

              {/* ── STEP 3: Reset Password (arrives via email link) ── */}
              {step === 'reset' && (
                <motion.div
                  key="reset"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-px w-5 bg-[#d4722a]" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#d4722a]">New Password</span>
                  </div>
                  <h2 className="font-display text-4xl font-bold text-stone-900 leading-tight">
                    Create a New<br /><span className="text-[#8b5a3c]">Password</span>
                  </h2>
                  <p className="mt-2 mb-7 text-sm text-stone-400 leading-relaxed">
                    Choose a strong password to secure your Grand Azure account.
                  </p>

                  <div className="flex items-center gap-3 mb-7">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#ead8c4]" />
                    <div className="w-1.5 h-1.5 rotate-45 bg-[#c9a84c]" />
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#ead8c4]" />
                  </div>

                  <form onSubmit={handleResetPassword} className="space-y-5">
                    {/* New password */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8b5a3c]">New Password</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#c4a882] transition-colors group-focus-within:text-[#d4722a]" />
                        <input type={showNew ? 'text' : 'password'} value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min. 8 characters" required minLength={8}
                          className="w-full pl-11 pr-12 py-3.5 rounded-2xl border border-[#ead8c4] bg-white/80 text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-[#d4722a]/20 focus:border-[#d4722a] hover:border-[#d4722a]/50 hover:-translate-y-px transition-all duration-200 text-sm shadow-sm" />
                        <button type="button" onClick={() => setShowNew(!showNew)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c4a882] hover:text-[#d4722a] transition-colors">
                          {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm password */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8b5a3c]">Confirm Password</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#c4a882] transition-colors group-focus-within:text-[#d4722a]" />
                        <input type={showConfirm ? 'text' : 'password'} value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat your password" required
                          className={`w-full pl-11 pr-12 py-3.5 rounded-2xl border bg-white/80 text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 hover:-translate-y-px transition-all duration-200 text-sm shadow-sm ${
                            confirmPassword && confirmPassword !== newPassword
                              ? 'border-red-300 focus:ring-red-200/40 focus:border-red-400'
                              : confirmPassword && confirmPassword === newPassword
                              ? 'border-emerald-300 focus:ring-emerald-200/40 focus:border-emerald-400'
                              : 'border-[#ead8c4] focus:ring-[#d4722a]/20 focus:border-[#d4722a] hover:border-[#d4722a]/50'
                          }`} />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c4a882] hover:text-[#d4722a] transition-colors">
                          {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {confirmPassword && confirmPassword !== newPassword && (
                        <p className="text-[11px] text-red-500 font-medium pl-1">Passwords do not match</p>
                      )}
                      {confirmPassword && confirmPassword === newPassword && (
                        <p className="text-[11px] text-emerald-600 font-medium pl-1 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Passwords match
                        </p>
                      )}
                    </div>

                    {/* Password tips */}
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { text: '8+ characters',      color: 'bg-rose-50 border-rose-200 text-rose-600'    },
                        { text: 'Uppercase letter',   color: 'bg-sky-50 border-sky-200 text-sky-600'       },
                        { text: 'Number included',    color: 'bg-violet-50 border-violet-200 text-violet-600' },
                        { text: 'Special character',  color: 'bg-amber-50 border-amber-200 text-amber-600' },
                      ].map((tip) => (
                        <div key={tip.text} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[11px] font-medium ${tip.color}`}>
                          <Sparkles className="h-2.5 w-2.5 flex-shrink-0" />{tip.text}
                        </div>
                      ))}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.01, y: -2 }} whileTap={{ scale: 0.99 }}
                      type="submit" disabled={loading}
                      className="w-full py-3.5 px-6 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ background: 'linear-gradient(135deg, #d4722a 0%, #b85e1f 100%)', boxShadow: '0 8px 24px rgba(212,114,42,0.35)' }}
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>Update Password <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/20"><ArrowRight className="h-3.5 w-3.5" /></span></>
                      )}
                    </motion.button>
                  </form>
                </motion.div>
              )}

              {/* ── STEP 4: Success ── */}
              {step === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center text-center py-6"
                >
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 180, delay: 0.15 }}
                    className="w-24 h-24 rounded-3xl flex items-center justify-center mb-8 shadow-xl"
                    style={{ background: 'linear-gradient(135deg, #d4722a, #b85e1f)', boxShadow: '0 16px 48px rgba(212,114,42,0.4)' }}
                  >
                    <ShieldCheck className="h-11 w-11 text-white" />
                  </motion.div>

                  <div className="flex items-center gap-2 mb-3 justify-center">
                    <div className="h-px w-5 bg-[#d4722a]" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#d4722a]">All Done</span>
                    <div className="h-px w-5 bg-[#d4722a]" />
                  </div>
                  <h2 className="font-display text-4xl font-bold text-stone-900 leading-tight mb-3">
                    Password<br /><span className="text-[#8b5a3c]">Updated!</span>
                  </h2>
                  <p className="text-sm text-stone-400 leading-relaxed mb-10 max-w-xs">
                    Your password has been successfully updated. You can now sign in with your new credentials.
                  </p>

                  <div className="w-full space-y-3 mb-8">
                    {[
                      { text: 'Password updated successfully',        color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
                      { text: 'All active sessions were invalidated', color: 'bg-sky-50 border-sky-200 text-sky-700'             },
                      { text: 'Your account is now fully secured',    color: 'bg-violet-50 border-violet-200 text-violet-700'    },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * i + 0.3 }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-xs font-medium ${item.color}`}
                      >
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0" />{item.text}
                      </motion.div>
                    ))}
                  </div>

                  <motion.div className="w-full" whileHover={{ scale: 1.01, y: -2 }} whileTap={{ scale: 0.99 }}>
                    <Link
                      href="/login"
                      className="w-full py-3.5 px-6 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2.5 transition-all duration-200"
                      style={{ background: 'linear-gradient(135deg, #d4722a 0%, #b85e1f 100%)', boxShadow: '0 8px 24px rgba(212,114,42,0.35)' }}
                    >
                      Sign In Now
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/20">
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </Link>
                  </motion.div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
