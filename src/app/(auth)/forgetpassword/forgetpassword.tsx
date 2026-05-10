'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, ArrowRight, Sparkles, CheckCircle2, RotateCcw, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import BrandMark from '@/components/guest-portal/BrandMark'

type Step = 'request' | 'sent' | 'reset' | 'success'

export default function ForgotPasswordPage() {
  const searchParams = useSearchParams()
  const [step, setStep] = useState<Step>('request')
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  const appUrl = (() => {
    const raw = (process.env.NEXT_PUBLIC_APP_URL ?? '').trim()
    if (!raw) return ''
    const deduped = raw.includes('/https://') ? raw.split('/https://')[0] : raw
    return deduped.replace(/\/+$/, '')
  })()
  const resetRedirectUrl = `${appUrl || window.location.origin}/forgot-password?step=reset`

  useEffect(() => {
    const code = searchParams.get('code')
    const stepParam = searchParams.get('step')
    const queryType = searchParams.get('type')

    if (stepParam === 'reset') setStep('reset')

    const bootstrapRecovery = async () => {
      const supabase = createClient()

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          toast.error('Reset link is invalid or expired. Request a new one.')
          return
        }
        setStep('reset')
        return
      }

      if (typeof window !== 'undefined' && window.location.hash) {
        const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
        const hashType = hash.get('type')
        const accessToken = hash.get('access_token')
        const refreshToken = hash.get('refresh_token')

        if (hashType === 'recovery' && accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          if (!error) setStep('reset')
        }
      }

      if (queryType === 'recovery') setStep('reset')
    }

    bootstrapRecovery()
  }, [searchParams])

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
        redirectTo: resetRedirectUrl,
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
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: resetRedirectUrl,
      })
      if (error) { toast.error(error.message); return }
      toast.success('Reset link resent to your inbox.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match.'); return }
    if (newPassword.length < 8) { toast.error('Password must be at least 8 characters.'); return }
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

  const securityCards = [
    { label: 'Encrypted',     color: 'bg-rose-50   text-rose-700   border-rose-200/70'   },
    { label: '5-Min Expiry',  color: 'bg-sky-50    text-sky-700    border-sky-200/70'    },
    { label: 'Instant Link',  color: 'bg-violet-50 text-violet-700 border-violet-200/70' },
    { label: 'Safe & Secure', color: 'bg-emerald-50 text-emerald-700 border-emerald-200/70' },
  ]

  const steps = [
    { label: 'Request Link', done: step !== 'request'                    },
    { label: 'Check Inbox',  done: step === 'reset' || step === 'success' },
    { label: 'New Password', done: step === 'success'                     },
  ]

  // Shared input class — matches login/signup style
  const inputClass = 'w-full pl-11 pr-4 py-3.5 rounded-2xl border border-stone-200 bg-white text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-[#c9703a]/12 focus:border-[#c9703a] hover:border-[#c9703a]/40 hover:shadow-[0_0_0_3px_rgba(201,112,58,0.05)] transition-all duration-200 text-sm'
  const passwordInputClass = 'w-full pl-11 pr-12 py-3.5 rounded-2xl border border-stone-200 bg-white text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-[#c9703a]/12 focus:border-[#c9703a] hover:border-[#c9703a]/40 hover:shadow-[0_0_0_3px_rgba(201,112,58,0.05)] transition-all duration-200 text-sm'

  // Black primary button style
  const btnPrimaryStyle = {
    background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)',
    boxShadow: '0 4px 14px rgba(0,0,0,0.25), 0 1px 3px rgba(0,0,0,0.15)',
  }

  return (
    <div
      className="min-h-screen flex items-start justify-center px-2 py-6 md:px-3 md:py-8 relative"
      style={{ background: 'linear-gradient(145deg, #f8f6f3 0%, #f3ede6 50%, #f7f4f1 100%)' }}
    >
      {/* Ambient blobs — lighter & airy */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-35 blur-[140px]"
          style={{ background: 'radial-gradient(circle, #eddbc8 0%, #e8cdb5 60%, transparent 100%)' }} />
        <div className="absolute -bottom-40 -right-40 w-[550px] h-[550px] rounded-full opacity-28 blur-[120px]"
          style={{ background: 'radial-gradient(circle, #d4e8fb 0%, #c2daf8 60%, transparent 100%)' }} />
        <div className="absolute top-1/3 right-1/4 w-[380px] h-[380px] rounded-full opacity-20 blur-[90px]"
          style={{ background: 'radial-gradient(circle, #ede8fb 0%, #e0d8f8 60%, transparent 100%)' }} />
        <div className="absolute bottom-1/3 left-1/4 w-[320px] h-[320px] rounded-full opacity-18 blur-[80px]"
          style={{ background: 'radial-gradient(circle, #d4f0e2 0%, #c0e8d2 60%, transparent 100%)' }} />
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.018]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #b87840 1px, transparent 0)', backgroundSize: '28px 28px' }} />
      </div>

      <div className="w-full max-w-5xl relative z-10 pb-6">

        {/* Ticker */}
        <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/60 py-2 mb-3 shadow-sm backdrop-blur-md">
          <motion.div className="flex w-max whitespace-nowrap"
            animate={{ x: ['0%', '-50%'] }} transition={{ duration: 26, ease: 'linear', repeat: Infinity }}>
            {[...tickerItems, ...tickerItems].map((item, idx) => (
              <span key={idx} className="inline-flex items-center gap-2 px-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b5a3c]">
                <Sparkles className="h-3 w-3 text-[#c9703a]" />{item}
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
            transformStyle: 'preserve-3d',
            perspective: 1800,
            boxShadow: [
              '0 0 0 1px rgba(255,255,255,0.92)',
              '0 2px 4px rgba(160,130,100,0.05)',
              '0 8px 24px rgba(160,130,100,0.10)',
              '0 24px 60px rgba(160,130,100,0.13)',
              '0 48px 100px rgba(160,130,100,0.08)',
            ].join(', '),
          }}
          className="grid lg:grid-cols-[1fr_1.1fr] rounded-3xl border border-white/80"
        >

          {/* ── LEFT DECORATIVE PANEL ── */}
          <div
            className="relative hidden lg:flex flex-col justify-between p-7 rounded-l-3xl"
            style={{ background: 'linear-gradient(160deg, #ffffff 0%, #faf6f2 40%, #f5ede3 100%)' }}
          >
            {/* Dot texture */}
            <div className="absolute inset-0 opacity-[0.025] pointer-events-none rounded-l-3xl"
              style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #b87840 1px, transparent 0)', backgroundSize: '20px 20px' }} />

            {/* Floating shapes — reduced opacity */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-l-3xl">
              <div className="absolute top-10 right-4  w-24 h-24 rounded-2xl rotate-12  bg-rose-100/35   border border-rose-200/35"   />
              <div className="absolute top-1/3 right-0  w-14 h-14 rounded-xl -rotate-6  bg-sky-100/32    border border-sky-200/30"    />
              <div className="absolute top-2/3 right-6  w-[72px] h-[72px] rounded-2xl rotate-8  bg-violet-100/30  border border-violet-200/28" />
              <div className="absolute bottom-8 left-6  w-20 h-20 rounded-2xl -rotate-10 bg-emerald-100/30 border border-emerald-200/28" />
              <div className="absolute top-1/2 left-2   w-10 h-10 rounded-xl rotate-20  bg-amber-100/35   border border-amber-200/30"  />
            </div>

            {/* Star ornament */}
            <div className="absolute top-5 right-5 opacity-[0.07]">
              <svg width="72" height="72" viewBox="0 0 60 60" fill="none">
                <path d="M30 5L35 20L51 20L38 30L43 46L30 37L17 46L22 30L9 20L25 20Z" stroke="#c9703a" strokeWidth="1.5" fill="none" />
              </svg>
            </div>

            {/* Brand — unchanged BrandMark */}
            <div className="relative z-10">
              <div className="inline-flex items-center rounded-2xl border border-white/80 bg-white/75 px-4 py-2.5 backdrop-blur-sm shadow-sm">
                <BrandMark />
              </div>
            </div>

            <div className="relative z-10 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px w-6 bg-[#c9703a]" />
                  <Sparkles className="h-3 w-3 text-[#c9703a]" />
                  <div className="h-px w-6 bg-[#c9703a]" />
                </div>
                <h1 className="font-display text-4xl font-bold text-stone-900 leading-[1.08] tracking-tight">
                  Secure<br /><em className="text-[#c9703a] not-italic">Account Recovery</em>
                </h1>
                <p className="mt-3 text-sm text-stone-400 leading-relaxed max-w-xs">
                  We'll send a secure, encrypted reset link to your inbox in moments.
                </p>
              </div>

              {/* Progress stepper */}
              <div className="space-y-2">
                {steps.map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 * i + 0.3 }}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl border text-xs font-medium transition-all duration-300 ${
                      s.done
                        ? 'bg-emerald-50 border-emerald-200/70 text-emerald-700'
                        : 'bg-white/60 border-stone-200 text-stone-500'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold transition-all duration-300 ${
                      s.done ? 'bg-emerald-500 text-white' : 'bg-stone-200 text-stone-500'
                    }`}>
                      {s.done ? '✓' : i + 1}
                    </div>
                    {s.label}
                  </motion.div>
                ))}
              </div>

              {/* Security cards */}
              <div className="grid grid-cols-2 gap-2">
                {securityCards.map((c, i) => (
                  <motion.div
                    key={c.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i + 0.5 }}
                    whileHover={{ y: -3, rotateX: 4, rotateY: -4, scale: 1.02 }}
                    style={{ transformStyle: 'preserve-3d' }}
                    className={`rounded-2xl border px-3 py-2.5 text-[11px] font-semibold flex items-center gap-1.5 ${c.color}`}
                  >
                    <Sparkles className="h-2.5 w-2.5 flex-shrink-0" />{c.label}
                  </motion.div>
                ))}
              </div>
            </div>

            <p className="relative z-10 text-[10px] text-stone-300 tracking-wide">© 2025 Grand Azure Hotel Group</p>

            {/* Gold bottom line */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-bl-3xl"
              style={{ background: 'linear-gradient(90deg, transparent, #c9703a 30%, #c9703a 70%, transparent)' }} />
          </div>

          {/* ── RIGHT FORM PANEL ── */}
          <div
            className="px-6 py-8 lg:px-10 lg:py-10 rounded-r-3xl"
            style={{ background: '#ffffff' }}
          >
            {/* Mobile brand */}
            <div className="flex lg:hidden justify-center mb-6">
              <BrandMark />
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
                    <div className="h-px w-5 bg-[#c9703a]" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c9703a]">Account Recovery</span>
                  </div>
                  <h2 className="font-display text-3xl font-bold text-stone-900 leading-tight tracking-tight">
                    Reset Your<br /><span className="text-[#7a5c40]">Password</span>
                  </h2>
                  <p className="mt-1.5 mb-5 text-sm text-stone-400 leading-relaxed">
                    Enter your registered email and we'll send a secure reset link straight to your inbox.
                  </p>

                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-stone-200" />
                    <div className="w-1.5 h-1.5 rotate-45 bg-[#c9703a]" />
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-stone-200" />
                  </div>

                  <form onSubmit={handleRequestReset} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8a6a50]">Registered Email</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-300 transition-colors group-focus-within:text-[#c9703a]" />
                        <input
                          type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@grandazure.com" required
                          className={inputClass}
                        />
                      </div>
                    </div>

                    {/* Info note */}
                    <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl bg-amber-50 border border-amber-200/70">
                      <div className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-amber-700 text-[10px] font-bold">i</span>
                      </div>
                      <p className="text-xs text-amber-700 leading-relaxed">
                        A reset link will be sent to your inbox. Check your spam folder if you don't see it. The link expires in 5 minutes.
                      </p>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.01, y: -1 }} whileTap={{ scale: 0.99 }}
                      type="submit" disabled={loading}
                      className="w-full py-3.5 px-6 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                      style={btnPrimaryStyle}
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          Send Reset Link
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/20">
                            <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        </>
                      )}
                    </motion.button>
                  </form>

                  <p className="mt-6 text-center text-sm text-stone-400">
                    Remembered it?{' '}
                    <Link href="/login" className="font-semibold text-[#c9703a] hover:text-[#8b5a3c] transition-colors">Back to sign in</Link>
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
                  <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                    className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 shadow-md"
                    style={{
                      background: 'linear-gradient(160deg, #ffffff 0%, #faf6f2 100%)',
                      border: '1px solid rgba(220,200,180,0.5)',
                      boxShadow: '0 0 0 1px rgba(255,255,255,0.9), 0 8px 24px rgba(160,130,100,0.10)',
                    }}
                  >
                    <Mail className="h-9 w-9 text-[#c9703a]" />
                  </motion.div>

                  <div className="flex items-center gap-2 mb-3 justify-center">
                    <div className="h-px w-5 bg-[#c9703a]" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c9703a]">Email Sent</span>
                    <div className="h-px w-5 bg-[#c9703a]" />
                  </div>
                  <h2 className="font-display text-3xl font-bold text-stone-900 leading-tight tracking-tight mb-2">
                    Check Your<br /><span className="text-[#7a5c40]">Inbox</span>
                  </h2>
                  <p className="text-sm text-stone-400 leading-relaxed mb-6 max-w-sm">
                    We've sent a secure reset link to{' '}
                    <span className="font-semibold text-[#c9703a]">{email}</span>.
                    The link expires in 5 minutes.
                  </p>

                  {/* Steps list */}
                  <div className="w-full space-y-2 mb-6">
                    {[
                      { text: 'Open the email from Grand Azure',       color: 'bg-rose-50   border-rose-200/70   text-rose-700'   },
                      { text: 'Click the secure reset link inside',    color: 'bg-sky-50    border-sky-200/70    text-sky-700'    },
                      { text: 'Enter and confirm your new password',   color: 'bg-violet-50 border-violet-200/70 text-violet-700' },
                      { text: 'Sign in with your new credentials',     color: 'bg-emerald-50 border-emerald-200/70 text-emerald-700' },
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

                  {/* Resend — black outlined button */}
                  <motion.button
                    whileHover={{ scale: 1.01, y: -1 }} whileTap={{ scale: 0.99 }}
                    onClick={handleResend} disabled={loading}
                    className="w-full py-3.5 px-6 rounded-2xl border-2 border-stone-900 text-stone-900 font-semibold text-sm flex items-center justify-center gap-2.5 hover:bg-stone-900 hover:text-white transition-all duration-200 disabled:opacity-50 group"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-stone-400 border-t-stone-900 rounded-full animate-spin" />
                    ) : (
                      <><RotateCcw className="h-4 w-4" /> Resend Email</>
                    )}
                  </motion.button>

                  <p className="mt-5 text-sm text-stone-400">
                    <Link href="/login" className="font-semibold text-[#c9703a] hover:text-[#8b5a3c] transition-colors">← Back to sign in</Link>
                  </p>
                </motion.div>
              )}

              {/* ── STEP 3: Reset Password ── */}
              {step === 'reset' && (
                <motion.div
                  key="reset"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-px w-5 bg-[#c9703a]" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c9703a]">New Password</span>
                  </div>
                  <h2 className="font-display text-3xl font-bold text-stone-900 leading-tight tracking-tight">
                    Create a New<br /><span className="text-[#7a5c40]">Password</span>
                  </h2>
                  <p className="mt-1.5 mb-5 text-sm text-stone-400 leading-relaxed">
                    Choose a strong password to secure your Grand Azure account.
                  </p>

                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-stone-200" />
                    <div className="w-1.5 h-1.5 rotate-45 bg-[#c9703a]" />
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-stone-200" />
                  </div>

                  <form onSubmit={handleResetPassword} className="space-y-4">
                    {/* New password */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8a6a50]">New Password</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-300 transition-colors group-focus-within:text-[#c9703a]" />
                        <input
                          type={showNew ? 'text' : 'password'} value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min. 8 characters" required minLength={8}
                          className={passwordInputClass}
                        />
                        <button type="button" onClick={() => setShowNew(!showNew)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300 hover:text-[#c9703a] transition-colors">
                          {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm password */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8a6a50]">Confirm Password</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-300 transition-colors group-focus-within:text-[#c9703a]" />
                        <input
                          type={showConfirm ? 'text' : 'password'} value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat your password" required
                          className={`w-full pl-11 pr-12 py-3.5 rounded-2xl border bg-white text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${
                            confirmPassword && confirmPassword !== newPassword
                              ? 'border-red-300 focus:ring-red-200/40 focus:border-red-400'
                              : confirmPassword && confirmPassword === newPassword
                              ? 'border-emerald-300 focus:ring-emerald-200/40 focus:border-emerald-400'
                              : 'border-stone-200 focus:ring-[#c9703a]/12 focus:border-[#c9703a] hover:border-[#c9703a]/40 hover:shadow-[0_0_0_3px_rgba(201,112,58,0.05)]'
                          }`}
                        />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300 hover:text-[#c9703a] transition-colors">
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
                        { text: '8+ characters',     color: 'bg-rose-50   border-rose-200/70   text-rose-700'   },
                        { text: 'Uppercase letter',  color: 'bg-sky-50    border-sky-200/70    text-sky-700'    },
                        { text: 'Number included',   color: 'bg-violet-50 border-violet-200/70 text-violet-700' },
                        { text: 'Special character', color: 'bg-amber-50  border-amber-200/70  text-amber-700'  },
                      ].map((tip) => (
                        <div key={tip.text} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[11px] font-medium ${tip.color}`}>
                          <Sparkles className="h-2.5 w-2.5 flex-shrink-0" />{tip.text}
                        </div>
                      ))}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.01, y: -1 }} whileTap={{ scale: 0.99 }}
                      type="submit" disabled={loading}
                      className="w-full py-3.5 px-6 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                      style={btnPrimaryStyle}
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          Update Password
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/20">
                            <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        </>
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
                  className="flex flex-col items-center text-center py-4"
                >
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 180, delay: 0.15 }}
                    className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6"
                    style={{
                      background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.9)',
                    }}
                  >
                    <ShieldCheck className="h-11 w-11 text-white" />
                  </motion.div>

                  <div className="flex items-center gap-2 mb-3 justify-center">
                    <div className="h-px w-5 bg-[#c9703a]" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c9703a]">All Done</span>
                    <div className="h-px w-5 bg-[#c9703a]" />
                  </div>
                  <h2 className="font-display text-3xl font-bold text-stone-900 leading-tight tracking-tight mb-3">
                    Password<br /><span className="text-[#7a5c40]">Updated!</span>
                  </h2>
                  <p className="text-sm text-stone-400 leading-relaxed mb-8 max-w-xs">
                    Your password has been successfully updated. You can now sign in with your new credentials.
                  </p>

                  <div className="w-full space-y-2 mb-7">
                    {[
                      { text: 'Password updated successfully',        color: 'bg-emerald-50 border-emerald-200/70 text-emerald-700' },
                      { text: 'All active sessions were invalidated', color: 'bg-sky-50    border-sky-200/70    text-sky-700'    },
                      { text: 'Your account is now fully secured',    color: 'bg-violet-50 border-violet-200/70 text-violet-700' },
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

                  <motion.div className="w-full" whileHover={{ scale: 1.01, y: -1 }} whileTap={{ scale: 0.99 }}>
                    <Link
                      href="/login"
                      className="w-full py-3.5 px-6 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2.5 transition-all duration-200"
                      style={btnPrimaryStyle}
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