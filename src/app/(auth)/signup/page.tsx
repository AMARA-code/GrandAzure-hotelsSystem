
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Sparkles, Star, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

type PasswordStrength = 'empty' | 'weak' | 'fair' | 'good' | 'strong'

function getStrength(pw: string): PasswordStrength {
  if (!pw) return 'empty'
  let s = 0
  if (pw.length >= 8) s++
  if (pw.length >= 12) s++
  if (/[A-Z]/.test(pw)) s++
  if (/[0-9]/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  if (s <= 1) return 'weak'
  if (s === 2) return 'fair'
  if (s === 3) return 'good'
  return 'strong'
}

const STRENGTH_META = {
  empty:  { label: '',       bars: 0, barColor: '#ead8c4', text: 'text-stone-300' },
  weak:   { label: 'Weak',   bars: 1, barColor: '#f87171', text: 'text-red-400' },
  fair:   { label: 'Fair',   bars: 2, barColor: '#d4722a', text: 'text-orange-500' },
  good:   { label: 'Good',   bars: 3, barColor: '#c9a84c', text: 'text-amber-500' },
  strong: { label: 'Strong', bars: 4, barColor: '#4ade80', text: 'text-emerald-500' },
}

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' })

  const strength = getStrength(form.password)
  const meta = STRENGTH_META[strength]

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }))

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setTilt({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 6,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * -6,
    })
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email, password: form.password,
        options: { data: { first_name: form.firstName, last_name: form.lastName, phone: form.phone } },
      })
      if (error) { toast.error(error.message); return }
      if (data.user) {
        await supabase.from('guests').insert({
          first_name: form.firstName, last_name: form.lastName,
          email: form.email, phone: form.phone, vip_status: 'none', marketing_opt_in: true,
        })
      }
      toast.success('Account created! Welcome to Grand Azure.')
      router.push('/my-account')
      router.refresh()
    } finally { setLoading(false) }
  }

  const inp = 'w-full pl-11 pr-4 py-3.5 rounded-2xl border border-[#ead8c4] bg-white/80 text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-[#d4722a]/20 focus:border-[#d4722a] hover:border-[#d4722a]/50 hover:-translate-y-px transition-all duration-200 text-sm shadow-sm'

  const benefits = [
    { text: 'Early access to exclusive room offers', color: 'bg-rose-50 border-rose-200 text-rose-700' },
    { text: 'Complimentary loyalty points on every stay', color: 'bg-sky-50 border-sky-200 text-sky-700' },
    { text: 'Priority concierge & 24/7 guest support', color: 'bg-violet-50 border-violet-200 text-violet-700' },
    { text: 'Members-only dining & spa privileges', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  ]

  const accentCards = [
    { label: 'VIP Access',      color: 'from-orange-100 to-orange-50 text-orange-700 border-orange-200' },
    { label: 'Free to Join',    color: 'from-amber-100  to-amber-50  text-amber-700  border-amber-200'  },
    { label: 'Loyalty Points',  color: 'from-sky-100    to-sky-50    text-sky-700    border-sky-200'    },
    { label: '24/7 Concierge',  color: 'from-rose-100   to-rose-50   text-rose-700   border-rose-200'   },
  ]

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative"
      style={{ background: 'linear-gradient(135deg, #fdf8f2 0%, #fff6ed 35%, #fef9f5 65%, #fdf4ee 100%)' }}
    >
      {/* Pastel blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-45 blur-[120px]"
          style={{ background: 'radial-gradient(circle, #fde8d0 0%, #fbd5b0 60%, transparent 100%)' }} />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full opacity-40 blur-[110px]"
          style={{ background: 'radial-gradient(circle, #dbeafe 0%, #bfdbfe 60%, transparent 100%)' }} />
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full opacity-30 blur-[90px]"
          style={{ background: 'radial-gradient(circle, #f0fdf4 0%, #dcfce7 60%, transparent 100%)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full opacity-30 blur-[80px]"
          style={{ background: 'radial-gradient(circle, #fdf4ff 0%, #f3e8ff 60%, transparent 100%)' }} />
        <div className="absolute top-1/2 right-10 w-[250px] h-[250px] rounded-full opacity-25 blur-[70px]"
          style={{ background: 'radial-gradient(circle, #fefce8 0%, #fef9c3 60%, transparent 100%)' }} />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #d4722a 1px, transparent 0)', backgroundSize: '28px 28px' }} />
      </div>

      <div className="w-full max-w-5xl relative z-10">

        {/* Ticker */}
        <div className="overflow-hidden rounded-2xl border border-[#ead8c4] bg-[#fff6ed]/90 py-2.5 mb-6 shadow-sm backdrop-blur-sm">
          <motion.div className="flex w-max whitespace-nowrap"
            animate={{ x: ['0%', '-50%'] }} transition={{ duration: 28, ease: 'linear', repeat: Infinity }}>
            {['Join the Collection', 'Loyalty Rewards', 'Exclusive Benefits', 'VIP Access', 'Curated Stays', 'Priority Service',
              'Join the Collection', 'Loyalty Rewards', 'Exclusive Benefits', 'VIP Access', 'Curated Stays', 'Priority Service'].map((t, i) => (
              <span key={i} className="inline-flex items-center gap-2 px-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b5a3c]">
                <Sparkles className="h-3 w-3 text-[#d4722a]" />{t}
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
          className="grid lg:grid-cols-[1fr_1.35fr] overflow-hidden rounded-3xl border border-[#ead8c4]"
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
              <div className="absolute top-2/3 right-6 w-18 h-18 rounded-2xl rotate-8 bg-violet-100/70 border border-violet-200/50" />
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

            <div className="relative z-10 space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px w-6 bg-[#c9a84c]" />
                  <Sparkles className="h-3 w-3 text-[#c9a84c]" />
                  <div className="h-px w-6 bg-[#c9a84c]" />
                </div>
                <h1 className="font-display text-4xl font-bold text-stone-900 leading-tight">
                  Join the<br /><em className="text-[#d4722a] not-italic">Elite Circle</em>
                </h1>
                <p className="mt-2.5 text-sm text-stone-500 leading-relaxed">
                  Unlock privileges that redefine what luxury travel feels like.
                </p>
              </div>

              {/* Benefits */}
              <div className="space-y-2.5">
                {benefits.map((b, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 * i + 0.3 }}
                    className={`flex items-start gap-2.5 px-3.5 py-2.5 rounded-2xl border text-xs font-medium leading-relaxed ${b.color}`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                    {b.text}
                  </motion.div>
                ))}
              </div>

              {/* Accent cards */}
              <div className="grid grid-cols-2 gap-2">
                {accentCards.map((c, i) => (
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
          <div className="px-8 py-10 lg:px-12" style={{ background: 'linear-gradient(180deg, #fffaf7 0%, #fdf5ee 100%)' }}>

            {/* Mobile brand */}
            <div className="flex lg:hidden justify-center mb-6">
              <span className="font-display text-2xl font-bold text-stone-900">Grand <span className="text-[#d4722a]">Azure</span></span>
            </div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px w-5 bg-[#d4722a]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#d4722a]">Create Account</span>
              </div>
              <h2 className="font-display text-4xl font-bold text-stone-900 leading-tight">
                Begin Your<br /><span className="text-[#8b5a3c]">Luxury Journey</span>
              </h2>
              <p className="mt-2 mb-6 text-sm text-stone-400 leading-relaxed">
                Loyalty benefits, exclusive offers, and seamless booking await.
              </p>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#ead8c4]" />
                <div className="w-1.5 h-1.5 rotate-45 bg-[#c9a84c]" />
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#ead8c4]" />
              </div>
            </motion.div>

            <motion.form
              onSubmit={handleSignup}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'firstName', placeholder: 'First Name', val: form.firstName },
                  { key: 'lastName',  placeholder: 'Last Name',  val: form.lastName  },
                ].map(({ key, placeholder, val }) => (
                  <div key={key} className="space-y-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8b5a3c]">{placeholder}</label>
                    <div className="relative group">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#c4a882] transition-colors group-focus-within:text-[#d4722a]" />
                      <input type="text" value={val} onChange={set(key as any)} placeholder={placeholder} required
                        className="w-full pl-9 pr-3 py-3.5 rounded-2xl border border-[#ead8c4] bg-white/80 text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-[#d4722a]/20 focus:border-[#d4722a] hover:border-[#d4722a]/50 hover:-translate-y-px transition-all duration-200 text-sm shadow-sm" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8b5a3c]">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#c4a882] transition-colors group-focus-within:text-[#d4722a]" />
                  <input type="email" value={form.email} onChange={set('email')} placeholder="ahmed@example.com" required className={inp} />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8b5a3c]">Phone Number</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#c4a882] transition-colors group-focus-within:text-[#d4722a]" />
                  <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+92 300 0000000" required className={inp} />
                </div>
              </div>

              {/* Password + strength */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8b5a3c]">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#c4a882] transition-colors group-focus-within:text-[#d4722a]" />
                  <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={set('password')}
                    placeholder="Min. 8 characters" required minLength={8}
                    className="w-full pl-11 pr-12 py-3.5 rounded-2xl border border-[#ead8c4] bg-white/80 text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-[#d4722a]/20 focus:border-[#d4722a] hover:border-[#d4722a]/50 hover:-translate-y-px transition-all duration-200 text-sm shadow-sm" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c4a882] hover:text-[#d4722a] transition-colors">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Strength bars */}
                {form.password && (
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex gap-1 flex-1">
                      {[1, 2, 3, 4].map((bar) => (
                        <div
                          key={bar}
                          className="h-1 flex-1 rounded-full transition-all duration-300"
                          style={{ background: bar <= meta.bars ? meta.barColor : '#ead8c4' }}
                        />
                      ))}
                    </div>
                    <span className={`text-[10px] font-semibold min-w-[36px] ${meta.text}`}>{meta.label}</span>
                  </div>
                )}
              </div>

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.01, y: -2 }} whileTap={{ scale: 0.99 }}
                type="submit" disabled={loading}
                className="w-full py-3.5 px-6 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                style={{ background: 'linear-gradient(135deg, #d4722a 0%, #b85e1f 100%)', boxShadow: '0 8px 24px rgba(212,114,42,0.35)' }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Create Account <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/20"><ArrowRight className="h-3.5 w-3.5" /></span></>
                )}
              </motion.button>
            </motion.form>

            <p className="mt-5 text-center text-sm text-stone-400">
              Already a member?{' '}
              <Link href="/login" className="font-semibold text-[#d4722a] hover:text-[#8b5a3c] transition-colors">Sign in</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
