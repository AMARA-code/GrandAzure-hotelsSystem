'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  })

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()

    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            first_name: form.firstName,
            last_name: form.lastName,
            phone: form.phone,
          },
        },
      })

      if (error) {
        toast.error(error.message)
        return
      }

      if (data.user) {
        await supabase.from('guests').insert({
          first_name: form.firstName,
          last_name: form.lastName,
          email: form.email,
          phone: form.phone,
          vip_status: 'none',
          marketing_opt_in: true,
        })
      }

      toast.success('Account created successfully.')
      router.push('/my-account')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-lg items-center px-4 py-10">
      <motion.form
        onSubmit={handleSignup}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full space-y-5 rounded-3xl border border-border bg-card p-8 shadow-premium-lg"
      >
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Create Account</h1>
          <p className="text-sm text-muted-foreground">Sign up for guest booking and loyalty benefits.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <input placeholder="First Name" required className="rounded-xl border border-border bg-card px-3 py-2 text-sm transition-all duration-200 hover:border-azure-300 hover:-translate-y-px focus:outline-none focus:ring-2 focus:ring-azure-500/35" value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} />
          <input placeholder="Last Name" required className="rounded-xl border border-border bg-card px-3 py-2 text-sm transition-all duration-200 hover:border-azure-300 hover:-translate-y-px focus:outline-none focus:ring-2 focus:ring-azure-500/35" value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} />
        </div>
        <input placeholder="Email" required type="email" className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm transition-all duration-200 hover:border-azure-300 hover:-translate-y-px focus:outline-none focus:ring-2 focus:ring-azure-500/35" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
        <input placeholder="Phone" required className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm transition-all duration-200 hover:border-azure-300 hover:-translate-y-px focus:outline-none focus:ring-2 focus:ring-azure-500/35" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
        <input placeholder="Password" required type="password" minLength={8} className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm transition-all duration-200 hover:border-azure-300 hover:-translate-y-px focus:outline-none focus:ring-2 focus:ring-azure-500/35" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} />
        <button disabled={loading} className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-premium transition-all duration-200 hover:bg-primary/90 hover:-translate-y-px hover:shadow-premium-lg disabled:opacity-70">
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
        <p className="text-sm text-muted-foreground">
          Already have an account? <Link href="/login" className="font-semibold text-azure-700">Sign in</Link>
        </p>
      </motion.form>
    </div>
  )
}
