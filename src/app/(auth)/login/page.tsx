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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 7
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -7
    setTilt({ x, y })
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { toast.error(error.message); return }
      const signedInEmail = data.user?.email ?? email
      const { data: staff } = await supabase
        .from('staff').select('staff_id')
        .eq('email', signedInEmail).eq('is_active', true).maybeSingle()
      toast.success('Welcome back!')
      const isAdminEmail = signedInEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase()
      router.push(staff || isAdminEmail ? '/dashboard' : '/')
      router.refresh()
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const tickerItems = [
    'Luxury Collection', '5-Star Experience', 'Premium Service',
    'Concierge on Demand', 'Signature Suites', 'Award-Winning Hospitality',
  ]

  const pastelCards = [
    { label: 'Private Butler', color: 'from-rose-100 to-rose-50 text-rose-700 border-rose-200' },
    { label: 'Rooftop Evenings', color: 'from-sky-100 to-sky-50 text-sky-700 border-sky-200' },
    { label: 'Spa & Wellness', color: 'from-violet-100 to-violet-50 text-violet-700 border-violet-200' },
    { label: 'Fine Dining', color: 'from-emerald-100 to-emerald-50 text-emerald-700 border-emerald-200' },
  ]

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative"
      style={{ background: 'linear-gradient(135deg, #fdf8f2 0%, #fff6ed 35%, #fef9f5 65%, #fdf4ee 100%)' }}
    >
      {/* Ambient pastel blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-48 -left-48 w-[700px] h-[700px] rounded-full opacity-50 blur-[130px]"
          style={{ background: 'radial-gradient(circle, #fde8d0 0%, #fbcfaa 60%, transparent 100%)' }} />
        <div className="absolute -bottom-48 -right-48 w-[600px] h-[600px] rounded-full opacity-40 blur-[110px]"
          style={{ background: 'radial-gradient(circle, #dbeafe 0%, #bfdbfe 60%, transparent 100%)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-30 blur-[90px]"
          style={{ background: 'radial-gradient(circle, #dcfce7 0%, #bbf7d0 60%, transparent 100%)' }} />
        <div className="absolute top-16 right-1/4 w-[350px] h-[350px] rounded-full opacity-35 blur-[80px]"
          style={{ background: 'radial-gradient(circle, #fdf4ff 0%, #f3e8ff 60%, transparent 100%)' }} />
        <div className="absolute bottom-16 left-1/4 w-[280px] h-[280px] rounded-full opacity-30 blur-[70px]"
          style={{ background: 'radial-gradient(circle, #fefce8 0%, #fef9c3 60%, transparent 100%)' }} />
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #d4722a 1px, transparent 0)', backgroundSize: '28px 28px' }} />
      </div>

      <div className="w-full max-w-5xl relative z-10">

        {/* Ticker */}
        <div className="overflow-hidden rounded-2xl border border-[#ead8c4] bg-[#fff6ed]/90 py-2.5 mb-6 shadow-sm backdrop-blur-sm">
          <motion.div className="flex w-max whitespace-nowrap"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 24, ease: 'linear', repeat: Infinity }}>
            {[...tickerItems, ...tickerItems].map((item, idx) => (
              <span key={idx} className="inline-flex items-center gap-2 px-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b5a3c]">
                <Sparkles className="h-3 w-3 text-[#d4722a]" />{item}
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
            perspective: 1400,
            boxShadow: '0 32px 80px rgba(139,90,60,0.18), 0 8px 24px rgba(139,90,60,0.10), 0 2px 8px rgba(139,90,60,0.06)',
          }}
          className="grid lg:grid-cols-[1fr_1.1fr] overflow-hidden rounded-3xl border border-[#ead8c4]"
        >
          {/* Left decorative panel */}
          <div
            className="relative hidden lg:flex flex-col justify-between overflow-hidden p-10"
            style={{ background: 'linear-gradient(160deg, #fff8f0 0%, #fdecd8 50%, #fde3c4 100%)' }}
          >
            {/* Floating pastel shapes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-8 right-6 w-28 h-28 rounded-2xl rotate-12 bg-rose-100/70 border border-rose-200/60" />
              <div className="absolute top-1/3 right-2 w-16 h-16 rounded-xl -rotate-8 bg-sky-100/60 border border-sky-200/50" />
              <div className="absolute bottom-24 right-8 w-20 h-20 rounded-2xl rotate-6 bg-violet-100/60 border border-violet-200/50" />
              <div className="absolute bottom-6 left-8 w-24 h-24 rounded-2xl -rotate-10 bg-emerald-100/60 border border-emerald-200/50" />
              <div className="absolute top-1/2 left-4 w-10 h-10 rounded-xl rotate-20 bg-amber-100/70 border border-amber-200/60" />
            </div>

            {/* Gold star ornament */}
            <div className="absolute top-5 right-5 opacity-12">
              <svg width="72" height="72" viewBox="0 0 60 60" fill="none">
                <path d="M30 5L35 20L51 20L38 30L43 46L30 37L17 46L22 30L9 20L25 20Z" stroke="#c9a84c" strokeWidth="1.5" fill="none" />
              </svg>
            </div>

            {/* Brand */}
            <div className="relative z-10">
              <div className="inline-flex items-center rounded-2xl border border-[#ead8c4] bg-white/70 px-4 py-2.5 backdrop-blur-sm shadow-sm">
                <BrandMark />
              </div>
            </div>

            <div className="relative z-10 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px w-6 bg-[#c9a84c]" />
                  <Sparkles className="h-3 w-3 text-[#c9a84c]" />
                  <div className="h-px w-6 bg-[#c9a84c]" />
                </div>
                <h1 className="font-display text-5xl font-bold text-stone-900 leading-[1.1]">
                  Where Luxury<br />
                  <em className="text-[#d4722a] not-italic">Meets Excellence</em>
                </h1>
                <p className="mt-3 text-sm text-stone-500 leading-relaxed max-w-xs">
                  Manage Pakistan's most prestigious properties from one elegant platform.
                </p>
              </div>

              {/* Pastel feature cards */}
              <div className="grid grid-cols-2 gap-2.5">
                {pastelCards.map((card, i) => (
                  <motion.div
                    key={card.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 * i + 0.3 }}
                    whileHover={{ y: -5, rotateX: 5, rotateY: -5, scale: 1.03 }}
                    style={{ transformStyle: 'preserve-3d' }}
                    className={`rounded-2xl border bg-gradient-to-br px-3.5 py-3 text-xs font-semibold flex items-center gap-2 ${card.color}`}
                  >
                    <Sparkles className="h-3 w-3 flex-shrink-0" />{card.label}
                  </motion.div>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2.5">
                {[{ value: '3', label: 'Properties' }, { value: '180', label: 'Rooms' }, { value: '5★', label: 'Rated' }].map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-[#ead8c4] bg-white/60 p-3 text-center backdrop-blur-sm shadow-sm">
                    <p className="font-display text-xl font-bold text-stone-900">{stat.value}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8b5a3c] mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <p className="relative z-10 text-[10px] text-stone-400 tracking-wide">© 2025 Grand Azure Hotel Group</p>

            {/* Gold bottom line */}
            <div className="absolute bottom-0 left-0 right-0 h-[3px]"
              style={{ background: 'linear-gradient(90deg, transparent, #c9a84c 30%, #d4722a 60%, transparent)' }} />
          </div>

          {/* Right form panel */}
          <div
            className="px-8 py-10 lg:px-12"
            style={{ background: 'linear-gradient(180deg, #fffaf7 0%, #fdf5ee 100%)' }}
          >
            {/* Mobile brand */}
            <div className="flex lg:hidden justify-center mb-8">
              <BrandMark />
            </div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px w-5 bg-[#d4722a]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#d4722a]">Welcome Back</span>
              </div>
              <h2 className="font-display text-4xl font-bold text-stone-900 leading-tight">
                Sign In to<br /><span className="text-[#8b5a3c]">Your Account</span>
              </h2>
              <p className="mt-2 mb-7 text-sm text-stone-400 leading-relaxed">
                Access your dashboard and manage bookings across all properties.
              </p>
              {/* Ornament divider */}
              <div className="flex items-center gap-3 mb-7">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#ead8c4]" />
                <div className="w-1.5 h-1.5 rotate-45 bg-[#c9a84c]" />
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#ead8c4]" />
              </div>
            </motion.div>

            <motion.form
              onSubmit={handleLogin}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-5"
            >
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8b5a3c]">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#c4a882] transition-colors group-focus-within:text-[#d4722a]" />
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@grandazure.com" required
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-[#ead8c4] bg-white/80 text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-[#d4722a]/20 focus:border-[#d4722a] hover:border-[#d4722a]/50 hover:-translate-y-px transition-all duration-200 text-sm shadow-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8b5a3c]">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#c4a882] transition-colors group-focus-within:text-[#d4722a]" />
                  <input
                    type={showPassword ? 'text' : 'password'} value={password}
                    onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                    className="w-full pl-11 pr-12 py-3.5 rounded-2xl border border-[#ead8c4] bg-white/80 text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-[#d4722a]/20 focus:border-[#d4722a] hover:border-[#d4722a]/50 hover:-translate-y-px transition-all duration-200 text-sm shadow-sm"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c4a882] hover:text-[#d4722a] transition-colors">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Options row */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded accent-[#d4722a]" />
                  <span className="text-xs text-stone-400">Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-xs font-semibold text-[#d4722a] hover:text-[#8b5a3c] transition-colors">
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.01, y: -2 }} whileTap={{ scale: 0.99 }}
                type="submit" disabled={loading}
                className="w-full py-3.5 px-6 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #d4722a 0%, #b85e1f 100%)', boxShadow: '0 8px 24px rgba(212,114,42,0.35)' }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Sign In <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/20"><ArrowRight className="h-3.5 w-3.5" /></span></>
                )}
              </motion.button>
            </motion.form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#ead8c4]" /></div>
              <div className="relative flex justify-center">
                <span className="bg-[#fffaf7] px-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#c4a882]">Guest Portal</span>
              </div>
            </div>

            {/* Guest CTA */}
            <Link href="/"
              className="w-full py-3.5 px-6 rounded-2xl border-2 border-[#ead8c4] text-[#8b5a3c] font-semibold text-sm flex items-center justify-center gap-2.5 hover:border-[#d4722a]/50 hover:bg-orange-50/60 transition-all duration-200 hover:-translate-y-px">
              <Star className="h-4 w-4 text-[#c9a84c]" />
              Book a Room as Guest
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <p className="mt-5 text-center text-sm text-stone-400">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-semibold text-[#d4722a] hover:text-[#8b5a3c] transition-colors">Sign up</Link>
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