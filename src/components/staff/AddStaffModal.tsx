'use client'

import { useState, useEffect, type MouseEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createBrowserClient } from '@supabase/ssr'
import { X, Loader2, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { toast } from 'sonner'

interface Hotel {
  hotel_id: number
  hotel_name: string
  city: string
}

interface Department {
  department_id: number
  dept_name: string
  hotel_id: number
}

interface Props {
  open: boolean
  hotels: Hotel[]
  departments: Department[]
  onClose: () => void
  onSuccess: () => void
}

interface StaffRole {
  role_id: number
  role_name: string
  role_category: string
  base_salary: string
}

const EMPLOYMENT_TYPES = [
  { value: 'full_time',  label: 'Full Time' },
  { value: 'part_time',  label: 'Part Time' },
  { value: 'contract',   label: 'Contract' },
  { value: 'internship', label: 'Internship' },
]

const SHIFTS = [
  { value: 'morning',   label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'night',     label: 'Night' },
  { value: 'flexible',  label: 'Flexible' },
]

export default function AddStaffModal({ open, hotels, departments, onClose, onSuccess }: Props) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [roles, setRoles] = useState<StaffRole[]>([])
  const [saving, setSaving] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)

  const [form, setForm] = useState({
    hotel_id:        '',
    department_id:   '',
    role_id:         '',
    first_name:      '',
    last_name:       '',
    email:           '',
    phone:           '',
    hire_date:       new Date().toISOString().split('T')[0],
    employment_type: 'full_time',
    salary:          '',
    shift:           'morning',
  })

  const [errors, setErrors] = useState<Partial<typeof form>>({})

  useEffect(() => {
    supabase.from('staff_roles').select('*').then(({ data }) => {
      if (data) setRoles(data)
    })
  }, [])

  // Auto-fill salary from role base_salary
  useEffect(() => {
    if (form.role_id) {
      const role = roles.find(r => r.role_id === Number(form.role_id))
      if (role) setForm(f => ({ ...f, salary: role.base_salary }))
    }
  }, [form.role_id, roles])

  const filteredDepts = departments.filter(
    d => !form.hotel_id || d.hotel_id === Number(form.hotel_id)
  )

  const set = (key: keyof typeof form, val: string) => {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => ({ ...e, [key]: '' }))
  }

  const validate = () => {
    const e: Partial<typeof form> = {}
    if (!form.hotel_id)      e.hotel_id      = 'Required'
    if (!form.department_id) e.department_id = 'Required'
    if (!form.role_id)       e.role_id       = 'Required'
    if (!form.first_name.trim()) e.first_name = 'Required'
    if (!form.last_name.trim())  e.last_name  = 'Required'
    if (!form.email.trim())  e.email  = 'Required'
    if (!form.phone.trim())  e.phone  = 'Required'
    if (!form.salary)        e.salary = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      // Generate employee code
      const hotel = hotels.find(h => h.hotel_id === Number(form.hotel_id))
      const prefix = hotel?.hotel_name.includes('Karachi') ? 'KHI'
        : hotel?.hotel_name.includes('Lahore') ? 'LHE' : 'ISB'

      const { count } = await supabase
        .from('staff')
        .select('*', { count: 'exact', head: true })
        .eq('hotel_id', form.hotel_id)

      const code = `${prefix}-${String((count ?? 0) + 1).padStart(3, '0')}`

      const { error } = await supabase.from('staff').insert({
        hotel_id:        Number(form.hotel_id),
        department_id:   Number(form.department_id),
        role_id:         Number(form.role_id),
        employee_code:   code,
        first_name:      form.first_name.trim(),
        last_name:       form.last_name.trim(),
        email:           form.email.trim(),
        phone:           form.phone.trim(),
        hire_date:       form.hire_date,
        employment_type: form.employment_type,
        salary:          parseFloat(form.salary),
        shift:           form.shift,
        is_active:       true,
        is_deleted:      false,
      })

      if (error) throw error

      toast.success(`${form.first_name} ${form.last_name} added successfully`)
      handleClose()
      onSuccess()
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to add staff member')
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setForm({
      hotel_id: '', department_id: '', role_id: '',
      first_name: '', last_name: '', email: '', phone: '',
      hire_date: new Date().toISOString().split('T')[0],
      employment_type: 'full_time', salary: '', shift: 'morning',
    })
    setErrors({})
    setStep(1)
    onClose()
  }

  const Field = ({
    label, name, type = 'text', placeholder, children
  }: {
    label: string
    name: keyof typeof form
    type?: string
    placeholder?: string
    children?: React.ReactNode
  }) => (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</label>
      {children ?? (
        <input
          type={type}
          value={form[name]}
          onChange={e => set(name, e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-xl border px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400',
            'focus:border-[#0e8ee6] focus:outline-none focus:ring-2 focus:ring-[#0e8ee6]/10 transition-all',
            errors[name] ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-slate-50'
          )}
        />
      )}
      {errors[name] && <p className="mt-1 text-xs text-rose-500">{errors[name]}</p>}
    </div>
  )

  const SelectField = ({
    label, name, children
  }: {
    label: string
    name: keyof typeof form
    children: React.ReactNode
  }) => (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</label>
      <select
        value={form[name]}
        onChange={e => set(name, e.target.value)}
        className={cn(
          'w-full rounded-xl border px-3 py-2.5 text-sm text-slate-800',
          'focus:border-[#0e8ee6] focus:outline-none focus:ring-2 focus:ring-[#0e8ee6]/10 transition-all',
          errors[name] ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-slate-50'
        )}
      >
        {children}
      </select>
      {errors[name] && <p className="mt-1 text-xs text-rose-500">{errors[name]}</p>}
    </div>
  )

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4"
            onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
          >
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <div>
                  <h2 className="font-display text-lg font-bold text-slate-800">Add New Staff Member</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Step {step} of 2</p>
                </div>
                <button
                  onClick={handleClose}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Step indicator */}
              <div className="flex gap-0 px-6 pt-4">
                {[1, 2].map(s => (
                  <div key={s} className="flex items-center gap-1 flex-1">
                    <div className={cn(
                      'h-1.5 flex-1 rounded-full transition-all',
                      step >= s ? 'bg-[#0e8ee6]' : 'bg-slate-100'
                    )} />
                  </div>
                ))}
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-4"
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
                        Personal Information
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="First Name" name="first_name" placeholder="Ahmed" />
                        <Field label="Last Name"  name="last_name"  placeholder="Siddiqui" />
                      </div>
                      <Field label="Email Address" name="email" type="email" placeholder="ahmed@grandazure.com" />
                      <Field label="Phone Number" name="phone" placeholder="+923001234567" />

                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mt-5 mb-3">
                        Assignment
                      </p>
                      <SelectField label="Hotel" name="hotel_id">
                        <option value="">Select hotel</option>
                        {hotels.map(h => <option key={h.hotel_id} value={h.hotel_id}>{h.hotel_name}</option>)}
                      </SelectField>
                      <SelectField label="Department" name="department_id">
                        <option value="">Select department</option>
                        {filteredDepts.map(d => <option key={d.department_id} value={d.department_id}>{d.dept_name}</option>)}
                      </SelectField>
                      <SelectField label="Role" name="role_id">
                        <option value="">Select role</option>
                        {roles.map(r => <option key={r.role_id} value={r.role_id}>{r.role_name}</option>)}
                      </SelectField>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="space-y-4"
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
                        Employment Details
                      </p>
                      <SelectField label="Employment Type" name="employment_type">
                        {EMPLOYMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </SelectField>
                      <SelectField label="Shift" name="shift">
                        {SHIFTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </SelectField>
                      <Field label="Hire Date" name="hire_date" type="date" />
                      <Field label="Monthly Salary (PKR)" name="salary" type="number" placeholder="80000" />

                      {/* Summary */}
                      <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-100 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Summary</p>
                        <div className="space-y-1.5 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Name</span>
                            <span className="font-medium text-slate-700">
                              {form.first_name || '—'} {form.last_name}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Hotel</span>
                            <span className="font-medium text-slate-700">
                              {hotels.find(h => h.hotel_id === Number(form.hotel_id))?.hotel_name ?? '—'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Role</span>
                            <span className="font-medium text-slate-700">
                              {roles.find(r => r.role_id === Number(form.role_id))?.role_name ?? '—'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Salary</span>
                            <span className="font-semibold text-slate-800">
                              PKR {form.salary ? Number(form.salary).toLocaleString() : '—'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="border-t border-slate-100 px-6 py-4 flex gap-3">
                {step === 2 && (
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={step === 1 ? () => setStep(2) : handleSubmit}
                  disabled={saving}
                  className="flex-1 gradient-azure rounded-xl py-2.5 text-sm font-semibold text-white shadow-azure hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                  ) : step === 1 ? (
                    'Continue'
                  ) : (
                    <><CheckCircle className="w-4 h-4" /> Add Staff Member</>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}