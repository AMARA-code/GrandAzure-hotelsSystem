'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      const signedInEmail = data.user?.email ?? email
      const { data: staff } = await supabase
        .from('staff')
        .select('staff_id')
        .eq('email', signedInEmail)
        .eq('is_active', true)
        .maybeSingle()

      toast.success('Welcome back!')
      const isAdminEmail = signedInEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase()
      router.push(staff || isAdminEmail ? '/dashboard' : '/')
      router.refresh()
    } catch (err) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* Left Panel — Branding */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/hotels/karachi-hero.jpg"
            alt="Grand Azure Hotel"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-azure-900/80 via-azure-800/70 to-slate-900/80" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="inline-flex rounded-2xl bg-white/12 p-2 backdrop-blur-sm">
            <BrandMark />
          </div>

          {/* Center Text */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <h1 className="font-display text-5xl font-bold text-white leading-tight">
                Where Luxury
                <br />
                <span className="text-gold-300">Meets Excellence</span>
              </h1>
              <p className="mt-4 text-azure-100 text-lg leading-relaxed max-w-md">
                Managing three of Pakistan's most prestigious hotels from one powerful platform.
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="grid grid-cols-3 gap-4"
            >
              {[
                { value: '3', label: 'Properties' },
                { value: '180', label: 'Rooms' },
                { value: '5★', label: 'Rated' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="glass rounded-2xl p-4 text-center"
                >
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-azure-200 text-sm">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Footer */}
          <p className="text-azure-300 text-sm">
            © 2025 Grand Azure Hotel Group. All rights reserved.
          </p>
        </div>
      </motion.div>

      {/* Right Panel — Login Form */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex-1 flex items-center justify-center p-8"
      >
        <div className="w-full max-w-md space-y-8 rounded-3xl border border-border bg-card/95 p-7 shadow-premium-lg supports-backdrop-filter:backdrop-blur-sm">

          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-3 justify-center">
            <BrandMark />
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-foreground"
            >
              Welcome back
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground"
            >
              Sign in to continue to your account
            </motion.p>
          </div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onSubmit={handleLogin}
            className="space-y-5"
          >
            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@grandazure.com"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground/80 focus:outline-none focus:ring-2 focus:ring-azure-500/40 focus:border-azure-400 transition-all duration-200 shadow-sm hover:border-azure-300 hover:-translate-y-px"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-12 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground/80 focus:outline-none focus:ring-2 focus:ring-azure-500/40 focus:border-azure-400 transition-all duration-200 shadow-sm hover:border-azure-300 hover:-translate-y-px"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/80 hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-azure-600 hover:text-azure-700 font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 shadow-premium hover:bg-primary/90 hover:-translate-y-px hover:shadow-premium-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </motion.form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-4 text-muted-foreground/80">
                Guest Portal
              </span>
            </div>
          </div>

          {/* Guest Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Link
              href="/"
              className="w-full py-3 px-6 rounded-xl border-2 border-border text-foreground font-semibold flex items-center justify-center gap-2 hover:border-azure-300 hover:text-azure-700 hover:bg-azure-50 transition-all duration-200 hover:-translate-y-px"
            >
              Book a Room as Guest
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account? <Link href="/signup" className="font-semibold text-azure-700">Sign up</Link>
          </p>

          {/* Footer Note */}
          <p className="text-center text-xs text-muted-foreground/80">
            Protected by enterprise-grade security.
            <br />
            Grand Azure Hotel Group © 2025
          </p>
        </div>
      </motion.div>
    </div>
  )
}