'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ADMIN_EMAIL } from '@/lib/constants/admin'
import BrandMark from '@/components/guest-portal/BrandMark'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [fieldError, setFieldError] = useState<string | null>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 6
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -6
    setTilt({ x, y })
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setFieldError(null)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        const isCredentialsError =
          error.message.toLowerCase().includes('invalid login credentials') ||
          error.message.toLowerCase().includes('invalid credentials') ||
          error.message.toLowerCase().includes('wrong password') ||
          error.status === 400

        const errorMessage = isCredentialsError
          ? 'Incorrect email or password. Please try again.'
          : error.message

        setFieldError(errorMessage)
        toast.error(errorMessage)
        return
      }

      const signedInEmail = data.user?.email ?? email
      const { data: staff } = await supabase
        .from('staff').select('staff_id')
        .eq('email', signedInEmail).eq('is_active', true).maybeSingle()
      toast.success('Welcome back!')
      const isAdminEmail = signedInEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase()
      router.push(staff || isAdminEmail ? '/dashboard' : '/')
      router.refresh()
    } catch {
      const msg = 'Something went wrong. Please try again.'
      setFieldError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const tickerItems = [
    'Luxury Collection', '5-Star Experience', 'Premium Service',
    'Concierge on Demand', 'Signature Suites', 'Award-Winning Hospitality',
  ]

  const featureCards = [
    { label: 'Private Butler',   color: 'bg-rose-50   text-rose-700   border-rose-200/70'   },
    { label: 'Rooftop Evenings', color: 'bg-sky-50    text-sky-700    border-sky-200/70'    },
    { label: 'Spa & Wellness',   color: 'bg-violet-50 text-violet-700 border-violet-200/70' },
    { label: 'Fine Dining',      color: 'bg-emerald-50 text-emerald-700 border-emerald-200/70' },
  ]

  return (
    <div
      className="min-h-screen flex items-start justify-center px-2 py-6 md:px-3 md:py-8 relative"
      style={{ background: 'linear-gradient(145deg, #f8f6f3 0%, #f3ede6 50%, #f7f4f1 100%)' }}
    >
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-48 -left-48 w-[600px] h-[600px] rounded-full opacity-35 blur-[140px]"
          style={{ background: 'radial-gradient(circle, #eddbc8 0%, #e8cdb5 60%, transparent 100%)' }} />
        <div className="absolute -bottom-40 -right-40 w-[520px] h-[520px] rounded-full opacity-28 blur-[120px]"
          style={{ background: 'radial-gradient(circle, #d4e8fb 0%, #c2daf8 60%, transparent 100%)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full opacity-20 blur-[100px]"
          style={{ background: 'radial-gradient(circle, #d4f0e2 0%, #c2e8d4 60%, transparent 100%)' }} />
        <div className="absolute top-12 right-1/4 w-[300px] h-[300px] rounded-full opacity-22 blur-[80px]"
          style={{ background: 'radial-gradient(circle, #ede8fb 0%, #e0d8f8 60%, transparent 100%)' }} />
        <div className="absolute inset-0 opacity-[0.018]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #b87840 1px, transparent 0)', backgroundSize: '28px 28px' }} />
      </div>

      <div className="w-full max-w-5xl relative z-10 pb-6">

        {/* Ticker */}
        <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/60 py-2 mb-3 shadow-sm backdrop-blur-md">
          <motion.div className="flex w-max whitespace-nowrap"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 24, ease: 'linear', repeat: Infinity }}>
            {[...tickerItems, ...tickerItems].map((item, idx) => (
              <span key={idx} className="inline-flex items-center gap-2 px-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b5a3c]">
                <Sparkles className="h-3 w-3 text-[#c9703a]" />{item}
              </span>
            ))}
          </motion.div>
        </div>

        {/* 3D card */}
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
            <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #b87840 1px, transparent 0)', backgroundSize: '20px 20px' }} />

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-8 right-6 w-28 h-28 rounded-2xl rotate-12 bg-rose-100/40 border border-rose-200/40" />
              <div className="absolute top-1/3 right-2 w-16 h-16 rounded-xl -rotate-8 bg-sky-100/40 border border-sky-200/35" />
              <div className="absolute bottom-24 right-8 w-20 h-20 rounded-2xl rotate-6 bg-violet-100/35 border border-violet-200/30" />
              <div className="absolute bottom-6 left-8 w-24 h-24 rounded-2xl -rotate-10 bg-emerald-100/35 border border-emerald-200/30" />
              <div className="absolute top-1/2 left-4 w-10 h-10 rounded-xl rotate-20 bg-amber-100/40 border border-amber-200/35" />
            </div>

            <div className="absolute top-5 right-5 opacity-[0.07]">
              <svg width="72" height="72" viewBox="0 0 60 60" fill="none">
                <path d="M30 5L35 20L51 20L38 30L43 46L30 37L17 46L22 30L9 20L25 20Z" stroke="#c9703a" strokeWidth="1.5" fill="none" />
              </svg>
            </div>

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
                  Where Luxury<br />
                  <em className="text-[#c9703a] not-italic">Meets Excellence</em>
                </h1>
                <p className="mt-3 text-sm text-stone-400 leading-relaxed max-w-xs">
                  Manage Pakistan's most prestigious properties from one elegant platform.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {featureCards.map((card, i) => (
                  <motion.div
                    key={card.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 * i + 0.3 }}
                    whileHover={{ y: -4, rotateX: 4, rotateY: -4, scale: 1.02 }}
                    style={{ transformStyle: 'preserve-3d' }}
                    className={`rounded-2xl border bg-gradient-to-br px-3.5 py-3 text-xs font-semibold flex items-center gap-2 ${card.color}`}
                  >
                    <Sparkles className="h-3 w-3 flex-shrink-0" />{card.label}
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {[{ value: '3', label: 'Properties' }, { value: '180', label: 'Rooms' }, { value: '5★', label: 'Rated' }].map((stat) => (
                  <div key={stat.label}
                    className="rounded-2xl border border-white/70 bg-white/65 p-2.5 text-center backdrop-blur-sm shadow-sm">
                    <p className="font-display text-lg font-bold text-stone-900">{stat.value}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9a7a60] mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <p className="relative z-10 text-[10px] text-stone-300 tracking-wide">© 2025 Grand Azure Hotel Group</p>

            <div className="absolute bottom-0 left-0 right-0 h-[2px]"
              style={{ background: 'linear-gradient(90deg, transparent, #c9703a 30%, #c9703a 70%, transparent)' }} />
          </div>

          {/* ── RIGHT FORM PANEL ── */}
          <div
            className="px-6 py-6 lg:px-8 lg:py-8 rounded-r-3xl"
            style={{ background: '#ffffff' }}
          >
            <div className="flex lg:hidden justify-center mb-4">
              <BrandMark />
            </div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px w-5 bg-[#c9703a]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c9703a]">Welcome Back</span>
              </div>
              <h2 className="font-display text-3xl font-bold text-stone-900 leading-tight tracking-tight">
                Sign In to<br /><span className="text-[#7a5c40]">Your Account</span>
              </h2>
              <p className="mt-1.5 mb-4 text-sm text-stone-400 leading-relaxed">
                Access your dashboard and manage bookings across all properties.
              </p>
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-stone-200" />
                <div className="w-1.5 h-1.5 rotate-45 bg-[#c9703a]" />
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-stone-200" />
              </div>
            </motion.div>

            <motion.form
              onSubmit={handleLogin}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              {/* Inline error banner */}
              {fieldError && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3"
                >
                  <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs font-medium text-red-700 leading-relaxed">{fieldError}</p>
                </motion.div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8a6a50]">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-300 transition-colors group-focus-within:text-[#c9703a]" />
                  <input
                    type="email" value={email}
                    onChange={(e) => { setEmail(e.target.value); setFieldError(null) }}
                    placeholder="you@grandazure.com" required
                    className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border bg-white text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${
                      fieldError
                        ? 'border-red-300 focus:ring-red-100 focus:border-red-400'
                        : 'border-stone-200 focus:ring-[#c9703a]/12 focus:border-[#c9703a] hover:border-[#c9703a]/40 hover:shadow-[0_0_0_3px_rgba(201,112,58,0.05)]'
                    }`}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8a6a50]">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-300 transition-colors group-focus-within:text-[#c9703a]" />
                  <input
                    type={showPassword ? 'text' : 'password'} value={password}
                    onChange={(e) => { setPassword(e.target.value); setFieldError(null) }}
                    placeholder="••••••••" required
                    className={`w-full pl-11 pr-12 py-3.5 rounded-2xl border bg-white text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${
                      fieldError
                        ? 'border-red-300 focus:ring-red-100 focus:border-red-400'
                        : 'border-stone-200 focus:ring-[#c9703a]/12 focus:border-[#c9703a] hover:border-[#c9703a]/40 hover:shadow-[0_0_0_3px_rgba(201,112,58,0.05)]'
                    }`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300 hover:text-[#c9703a] transition-colors">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Options row */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded accent-[#c9703a]" />
                  <span className="text-xs text-stone-400">Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-xs font-semibold text-[#c9703a] hover:text-[#8b5a3c] transition-colors">
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.01, y: -1 }} whileTap={{ scale: 0.99 }}
                type="submit" disabled={loading}
                className="w-full py-3.5 px-6 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.25), 0 1px 3px rgba(0,0,0,0.15)',
                }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/20">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </>
                )}
              </motion.button>
            </motion.form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-100" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-300">Guest Portal</span>
              </div>
            </div>

            {/* Guest CTA */}
            <Link href="/"
              className="w-full py-3.5 px-6 rounded-2xl border-2 border-stone-900 text-stone-900 font-semibold text-sm flex items-center justify-center gap-2.5 hover:bg-stone-900 hover:text-white transition-all duration-200 group">
              <Star className="h-4 w-4 text-stone-900 group-hover:text-white transition-colors" />
              Book a Room as Guest
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <p className="mt-4 text-center text-sm text-stone-400">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-semibold text-[#c9703a] hover:text-[#8b5a3c] transition-colors">Sign up</Link>
            </p>
            <p className="mt-3 text-center text-[10px] text-stone-300 leading-relaxed">
              Protected by enterprise-grade security.<br />Grand Azure Hotel Group © 2025
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}