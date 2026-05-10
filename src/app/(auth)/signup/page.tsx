'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import BrandMark from '@/components/guest-portal/BrandMark'

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
  empty:  { label: '',       bars: 0, barColor: '#e5e0da', text: 'text-stone-300' },
  weak:   { label: 'Weak',   bars: 1, barColor: '#f87171', text: 'text-red-400'   },
  fair:   { label: 'Fair',   bars: 2, barColor: '#c9703a', text: 'text-orange-500' },
  good:   { label: 'Good',   bars: 3, barColor: '#c9703a', text: 'text-amber-500' },
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

  const inputClass = 'w-full pl-11 pr-4 py-3.5 rounded-2xl border border-stone-200 bg-white text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-[#c9703a]/12 focus:border-[#c9703a] hover:border-[#c9703a]/40 hover:shadow-[0_0_0_3px_rgba(201,112,58,0.05)] transition-all duration-200 text-sm'

  const benefits = [
    { text: 'Early access to exclusive room offers',       color: 'bg-rose-50   border-rose-200/70   text-rose-700'   },
    { text: 'Complimentary loyalty points on every stay',  color: 'bg-sky-50    border-sky-200/70    text-sky-700'    },
    { text: 'Priority concierge & 24/7 guest support',     color: 'bg-violet-50 border-violet-200/70 text-violet-700' },
    { text: 'Members-only dining & spa privileges',        color: 'bg-emerald-50 border-emerald-200/70 text-emerald-700' },
  ]

  const accentCards = [
    { label: 'VIP Access',     color: 'bg-orange-50 text-orange-700 border-orange-200/70' },
    { label: 'Free to Join',   color: 'bg-amber-50  text-amber-700  border-amber-200/70'  },
    { label: 'Loyalty Points', color: 'bg-sky-50    text-sky-700    border-sky-200/70'    },
    { label: '24/7 Concierge', color: 'bg-rose-50   text-rose-700   border-rose-200/70'   },
  ]

  return (
    <div
      className="min-h-screen flex items-start justify-center px-2 py-6 md:px-3 md:py-8 relative"
      style={{ background: 'linear-gradient(145deg, #f8f6f3 0%, #f3ede6 50%, #f7f4f1 100%)' }}
    >
      {/* Ambient blobs — lighter & airy */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[560px] h-[560px] rounded-full opacity-30 blur-[130px]"
          style={{ background: 'radial-gradient(circle, #eddbc8 0%, #e5ccb0 60%, transparent 100%)' }} />
        <div className="absolute -bottom-40 -left-40 w-[520px] h-[520px] rounded-full opacity-28 blur-[120px]"
          style={{ background: 'radial-gradient(circle, #d4e8fb 0%, #c2d8f5 60%, transparent 100%)' }} />
        <div className="absolute top-1/4 left-1/4 w-[360px] h-[360px] rounded-full opacity-18 blur-[100px]"
          style={{ background: 'radial-gradient(circle, #d4f0e2 0%, #c0e8d2 60%, transparent 100%)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full opacity-18 blur-[90px]"
          style={{ background: 'radial-gradient(circle, #ede8fb 0%, #e0d8f8 60%, transparent 100%)' }} />
        {/* Subtle dot grid */}
        <div className="absolute inset-0 opacity-[0.018]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #b87840 1px, transparent 0)', backgroundSize: '28px 28px' }} />
      </div>

      <div className="w-full max-w-5xl relative z-10 pb-6">

        {/* Ticker */}
        <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/60 py-2 mb-3 shadow-sm backdrop-blur-md">
          <motion.div className="flex w-max whitespace-nowrap"
            animate={{ x: ['0%', '-50%'] }} transition={{ duration: 28, ease: 'linear', repeat: Infinity }}>
            {[
              'Join the Collection', 'Loyalty Rewards', 'Exclusive Benefits', 'VIP Access', 'Curated Stays', 'Priority Service',
              'Join the Collection', 'Loyalty Rewards', 'Exclusive Benefits', 'VIP Access', 'Curated Stays', 'Priority Service',
            ].map((t, i) => (
              <span key={i} className="inline-flex items-center gap-2 px-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b5a3c]">
                <Sparkles className="h-3 w-3 text-[#c9703a]" />{t}
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
          className="grid lg:grid-cols-[1fr_1.35fr] rounded-3xl border border-white/80"
        >

          {/* ── LEFT PANEL ── */}
          <div
            className="relative hidden lg:flex flex-col justify-between p-7 rounded-l-3xl"
            style={{ background: 'linear-gradient(160deg, #ffffff 0%, #faf6f2 40%, #f5ede3 100%)' }}
          >
            {/* Dot texture */}
            <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #b87840 1px, transparent 0)', backgroundSize: '20px 20px' }} />

            {/* Floating shapes — reduced opacity */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-10 right-4  w-24 h-24 rounded-2xl rotate-12  bg-rose-100/35   border border-rose-200/35"   />
              <div className="absolute top-1/3 right-0  w-14 h-14 rounded-xl -rotate-6  bg-sky-100/32    border border-sky-200/30"    />
              <div className="absolute top-2/3 right-6  w-[72px] h-[72px] rounded-2xl rotate-8   bg-violet-100/30  border border-violet-200/28"  />
              <div className="absolute bottom-8 left-6  w-20 h-20 rounded-2xl -rotate-10 bg-emerald-100/30 border border-emerald-200/28" />
              <div className="absolute top-1/2 left-2   w-10 h-10 rounded-xl rotate-20  bg-amber-100/35   border border-amber-200/30"  />
            </div>

            <div className="absolute top-5 right-5 opacity-[0.06]">
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

            <div className="relative z-10 space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px w-6 bg-[#c9703a]" />
                  <Sparkles className="h-3 w-3 text-[#c9703a]" />
                  <div className="h-px w-6 bg-[#c9703a]" />
                </div>
                <h1 className="font-display text-3xl font-bold text-stone-900 leading-tight tracking-tight">
                  Join the<br /><em className="text-[#c9703a] not-italic">Elite Circle</em>
                </h1>
                <p className="mt-2.5 text-sm text-stone-400 leading-relaxed">
                  Unlock privileges that redefine what luxury travel feels like.
                </p>
              </div>

              {/* Benefits */}
              <div className="space-y-2">
                {benefits.map((b, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 * i + 0.3 }}
                    className={`flex items-start gap-2 px-3 py-2 rounded-2xl border text-[11px] font-medium leading-relaxed ${b.color}`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                    {b.text}
                  </motion.div>
                ))}
              </div>

              {/* Accent mini-cards */}
              <div className="grid grid-cols-2 gap-1.5">
                {accentCards.map((c, i) => (
                  <motion.div
                    key={c.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i + 0.5 }}
                    whileHover={{ y: -3, rotateX: 4, rotateY: -4, scale: 1.02 }}
                    style={{ transformStyle: 'preserve-3d' }}
                    className={`rounded-2xl border px-2.5 py-2 text-[10px] font-semibold flex items-center gap-1.5 ${c.color}`}
                  >
                    <Sparkles className="h-2.5 w-2.5 flex-shrink-0" />{c.label}
                  </motion.div>
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
            {/* Mobile brand */}
            <div className="flex lg:hidden justify-center mb-4">
              <BrandMark />
            </div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px w-5 bg-[#c9703a]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c9703a]">Create Account</span>
              </div>
              <h2 className="font-display text-3xl font-bold text-stone-900 leading-tight tracking-tight">
                Begin Your<br /><span className="text-[#7a5c40]">Luxury Journey</span>
              </h2>
              <p className="mt-1.5 mb-4 text-sm text-stone-400 leading-relaxed">
                Loyalty benefits, exclusive offers, and seamless booking await.
              </p>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-stone-200" />
                <div className="w-1.5 h-1.5 rotate-45 bg-[#c9703a]" />
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-stone-200" />
              </div>
            </motion.div>

            <motion.form
              onSubmit={handleSignup}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="space-y-3.5"
            >
              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'firstName', placeholder: 'First Name', val: form.firstName },
                  { key: 'lastName',  placeholder: 'Last Name',  val: form.lastName  },
                ].map(({ key, placeholder, val }) => (
                  <div key={key} className="space-y-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8a6a50]">{placeholder}</label>
                    <div className="relative group">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-300 transition-colors group-focus-within:text-[#c9703a]" />
                      <input
                        type="text" value={val} onChange={set(key as keyof typeof form)}
                        placeholder={placeholder} required
                        className="w-full pl-9 pr-3 py-3.5 rounded-2xl border border-stone-200 bg-white text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-[#c9703a]/12 focus:border-[#c9703a] hover:border-[#c9703a]/40 hover:shadow-[0_0_0_3px_rgba(201,112,58,0.05)] transition-all duration-200 text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8a6a50]">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-300 transition-colors group-focus-within:text-[#c9703a]" />
                  <input type="email" value={form.email} onChange={set('email')} placeholder="ahmed@example.com" required className={inputClass} />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8a6a50]">Phone Number</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-300 transition-colors group-focus-within:text-[#c9703a]" />
                  <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+92 300 0000000" required className={inputClass} />
                </div>
              </div>

              {/* Password + strength */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8a6a50]">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-300 transition-colors group-focus-within:text-[#c9703a]" />
                  <input
                    type={showPassword ? 'text' : 'password'} value={form.password} onChange={set('password')}
                    placeholder="Min. 8 characters" required minLength={8}
                    className="w-full pl-11 pr-12 py-3.5 rounded-2xl border border-stone-200 bg-white text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-[#c9703a]/12 focus:border-[#c9703a] hover:border-[#c9703a]/40 hover:shadow-[0_0_0_3px_rgba(201,112,58,0.05)] transition-all duration-200 text-sm"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300 hover:text-[#c9703a] transition-colors">
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
                          style={{ background: bar <= meta.bars ? meta.barColor : '#e5e0da' }}
                        />
                      ))}
                    </div>
                    <span className={`text-[10px] font-semibold min-w-[36px] ${meta.text}`}>{meta.label}</span>
                  </div>
                )}
              </div>

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.01, y: -1 }} whileTap={{ scale: 0.99 }}
                type="submit" disabled={loading}
                className="w-full py-3.5 px-6 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                style={{
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.25), 0 1px 3px rgba(0,0,0,0.15)',
                }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Create Account
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/20">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </>
                )}
              </motion.button>
            </motion.form>

            <p className="mt-3 text-center text-sm text-stone-400">
              Already a member?{' '}
              <Link href="/login" className="font-semibold text-[#c9703a] hover:text-[#8b5a3c] transition-colors">Sign in</Link>
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