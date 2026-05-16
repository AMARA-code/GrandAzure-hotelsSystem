'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createBrowserClient } from '@supabase/ssr'
import {
  X, Mail, Phone, Calendar, Building2,
  Briefcase, Clock, DollarSign, User, Shield,
  CheckCircle, XCircle, Hash, Edit2, Trash2,
  Save, Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils/cn'

// ─── Types ────────────────────────────────────────────────────────────────────
interface StaffMember {
  staff_id: number
  hotel_id: number
  department_id: number
  role_id: number
  manager_id: number | null
  employee_code: string
  first_name: string
  last_name: string
  email: string
  phone: string
  hire_date: string
  employment_type: string
  salary: string
  shift: string
  is_active: boolean
  hotel_name: string
  dept_name: string
  role_name: string
  role_category: string
  manager_first_name: string | null
  manager_last_name: string | null
}

interface Props {
  staff: StaffMember | null
  open: boolean
  onClose: () => void
  onRefresh: () => void
}

// ─── Constants ────────────────────────────────────────────────────────────────
const SHIFTS = [
  { value: 'morning',   label: 'Morning'   },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'night',     label: 'Night'     },
  { value: 'flexible',  label: 'Flexible'  },
]

const EMPLOYMENT_TYPES = [
  { value: 'full_time',  label: 'Full Time'   },
  { value: 'part_time',  label: 'Part Time'   },
  { value: 'contract',   label: 'Contract'    },
  { value: 'internship', label: 'Internship'  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase()
}

function getInitialsBg(name: string) {
  const colors = [
    'from-blue-400 to-blue-600', 'from-emerald-400 to-emerald-600',
    'from-violet-400 to-violet-600', 'from-amber-400 to-amber-600',
    'from-rose-400 to-rose-600', 'from-cyan-400 to-cyan-600',
    'from-orange-400 to-orange-600', 'from-pink-400 to-pink-600',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i)
  return colors[hash % colors.length]
}

function yearsOfService(hireDate: string) {
  const start = new Date(hireDate)
  const now   = new Date()
  const years = now.getFullYear() - start.getFullYear()
  const months = now.getMonth() - start.getMonth()
  const total = years + (months < 0 ? -1 : 0)
  const rem   = (months < 0 ? months + 12 : months)
  if (total === 0) return `${rem} month${rem !== 1 ? 's' : ''}`
  return `${total} yr${total !== 1 ? 's' : ''} ${rem} mo`
}

const SHIFT_COLORS: Record<string, string> = {
  morning:   'bg-amber-50 text-amber-700 border border-amber-200',
  afternoon: 'bg-blue-50 text-blue-700 border border-blue-200',
  night:     'bg-violet-50 text-violet-700 border border-violet-200',
  flexible:  'bg-emerald-50 text-emerald-700 border border-emerald-200',
}
const SHIFT_LABELS: Record<string, string> = {
  morning: 'Morning', afternoon: 'Afternoon', night: 'Night', flexible: 'Flexible',
}
const ROLE_CATEGORY_COLORS: Record<string, string> = {
  management:    'bg-violet-50 text-violet-700 border border-violet-200',
  front_office:  'bg-blue-50 text-blue-700 border border-blue-200',
  housekeeping:  'bg-emerald-50 text-emerald-700 border border-emerald-200',
  maintenance:   'bg-orange-50 text-orange-700 border border-orange-200',
  food_beverage: 'bg-rose-50 text-rose-700 border border-rose-200',
  finance:       'bg-cyan-50 text-cyan-700 border border-cyan-200',
}
const ROLE_CATEGORY_LABELS: Record<string, string> = {
  management: 'Management', front_office: 'Front Office',
  housekeeping: 'Housekeeping', maintenance: 'Maintenance',
  food_beverage: 'F&B', finance: 'Finance',
}
const HOTEL_DOT: Record<number, string> = {
  1: 'bg-[#0e8ee6]', 2: 'bg-emerald-500', 3: 'bg-violet-500',
}

// ─── Row helper ────────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value, mono = false }: {
  icon: React.ReactNode; label: string; value: React.ReactNode; mono?: boolean
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
      <div className="flex-shrink-0 mt-0.5 text-slate-400">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-0.5">{label}</p>
        <div className={cn('text-sm text-slate-700', mono && 'font-mono')}>{value}</div>
      </div>
    </div>
  )
}

// ─── Edit field helpers ───────────────────────────────────────────────────────
const inputCls = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all'
const labelCls = 'block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1'

// ─── Component ────────────────────────────────────────────────────────────────
export default function StaffDetailModal({ staff, open, onClose, onRefresh }: Props) {
  const [editing, setEditing] = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editForm, setEditForm] = useState<Partial<StaffMember>>({})

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  if (!staff) return null

  const fullName = `${staff.first_name} ${staff.last_name}`
  const initials = getInitials(staff.first_name, staff.last_name)
  const bgGrad   = getInitialsBg(fullName)

  const startEdit = () => {
    setEditForm({
      first_name:      staff.first_name,
      last_name:       staff.last_name,
      email:           staff.email,
      phone:           staff.phone,
      shift:           staff.shift,
      employment_type: staff.employment_type,
      salary:          staff.salary,
      hire_date:       staff.hire_date,
      is_active:       staff.is_active,
    })
    setEditing(true)
  }

  const cancelEdit = () => { setEditing(false); setEditForm({}) }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('staff')
        .update({
          first_name:      editForm.first_name,
          last_name:       editForm.last_name,
          email:           editForm.email,
          phone:           editForm.phone,
          shift:           editForm.shift,
          employment_type: editForm.employment_type,
          salary:          parseFloat(editForm.salary as string),
          hire_date:       editForm.hire_date,
          is_active:       editForm.is_active,
        })
        .eq('staff_id', staff.staff_id)
      if (error) throw error
      toast.success('Staff member updated')
      setEditing(false)
      onRefresh()
      onClose()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Delete ${fullName}? This cannot be undone.`)) return
    setDeleting(true)
    try {
      const { error } = await supabase
        .from('staff')
        .update({ is_deleted: true, is_active: false })
        .eq('staff_id', staff.staff_id)
      if (error) throw error
      toast.success(`${fullName} removed`)
      onClose()
      onRefresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setDeleting(false)
    }
  }

  const set = (key: keyof StaffMember, val: any) =>
    setEditForm(f => ({ ...f, [key]: val }))

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => { cancelEdit(); onClose() }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-2xl flex flex-col overflow-hidden"
          >
            {/* ── Header banner ── */}
            <div className={cn('relative bg-gradient-to-br', bgGrad, 'px-6 pt-12 pb-8')}>
              <button
                onClick={() => { cancelEdit(); onClose() }}
                className="absolute right-4 top-4 rounded-xl bg-white/20 p-2 text-white hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/25 text-3xl font-bold text-white shadow-lg select-none">
                {initials}
              </div>

              <h2 className="text-xl font-bold text-white leading-tight">{fullName}</h2>
              <p className="mt-1 text-sm text-white/80">{staff.role_name}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white">
                  {staff.employee_code}
                </span>
                <span className={cn(
                  'rounded-full px-3 py-1 text-xs font-semibold',
                  staff.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                )}>
                  {staff.is_active ? 'Active' : 'Inactive'}
                </span>
                <span className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium',
                  SHIFT_COLORS[staff.shift] ?? 'bg-white/20 text-white'
                )}>
                  {SHIFT_LABELS[staff.shift] ?? staff.shift}
                </span>
              </div>
            </div>

            {/* ── Body ── */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* ── EDIT FORM ── */}
              {editing ? (
                <div className="space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Edit Staff Details</p>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>First Name</label>
                      <input className={inputCls} value={editForm.first_name ?? ''} onChange={e => set('first_name', e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Last Name</label>
                      <input className={inputCls} value={editForm.last_name ?? ''} onChange={e => set('last_name', e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Email</label>
                    <input type="email" className={inputCls} value={editForm.email ?? ''} onChange={e => set('email', e.target.value)} />
                  </div>

                  <div>
                    <label className={labelCls}>Phone</label>
                    <input className={inputCls} value={editForm.phone ?? ''} onChange={e => set('phone', e.target.value)} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Shift</label>
                      <select className={inputCls} value={editForm.shift ?? ''} onChange={e => set('shift', e.target.value)}>
                        {SHIFTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Employment Type</label>
                      <select className={inputCls} value={editForm.employment_type ?? ''} onChange={e => set('employment_type', e.target.value)}>
                        {EMPLOYMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Monthly Salary (PKR)</label>
                      <input type="number" className={inputCls} value={editForm.salary ?? ''} onChange={e => set('salary', e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Hire Date</label>
                      <input type="date" className={inputCls} value={editForm.hire_date ?? ''} onChange={e => set('hire_date', e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Status</label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {[
                        { val: true,  label: 'Active',   cls: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
                        { val: false, label: 'Inactive', cls: 'text-rose-700 bg-rose-50 border-rose-200'          },
                      ].map(opt => (
                        <button
                          key={String(opt.val)}
                          onClick={() => set('is_active', opt.val)}
                          className={cn(
                            'py-2.5 rounded-xl border text-sm font-semibold transition-all',
                            editForm.is_active === opt.val
                              ? opt.cls + ' ring-2 ring-offset-1 ring-current'
                              : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* ── VIEW MODE ── */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Salary</p>
                      <p className="mt-1 text-base font-bold text-slate-800">{formatCurrency(parseFloat(staff.salary))}</p>
                      <p className="text-[10px] text-slate-400">per month</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Tenure</p>
                      <p className="mt-1 text-base font-bold text-slate-800">{yearsOfService(staff.hire_date)}</p>
                      <p className="text-[10px] text-slate-400">of service</p>
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Contact</p>
                    <div className="rounded-2xl border border-slate-100 bg-white px-4 divide-y divide-slate-50">
                      <InfoRow icon={<Mail className="w-4 h-4" />} label="Email"
                        value={<a href={`mailto:${staff.email}`} className="text-[#0e8ee6] hover:underline break-all">{staff.email}</a>}
                      />
                      <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone" value={staff.phone} mono />
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Position</p>
                    <div className="rounded-2xl border border-slate-100 bg-white px-4 divide-y divide-slate-50">
                      <InfoRow icon={<Briefcase className="w-4 h-4" />} label="Role"
                        value={
                          <div className="flex items-center gap-2 flex-wrap">
                            <span>{staff.role_name}</span>
                            <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', ROLE_CATEGORY_COLORS[staff.role_category] ?? 'bg-slate-100 text-slate-500')}>
                              {ROLE_CATEGORY_LABELS[staff.role_category] ?? staff.role_category}
                            </span>
                          </div>
                        }
                      />
                      <InfoRow icon={<Building2 className="w-4 h-4" />} label="Department" value={staff.dept_name} />
                      <InfoRow
                        icon={<div className="flex items-center gap-1.5"><span className={cn('h-2 w-2 rounded-full', HOTEL_DOT[staff.hotel_id] ?? 'bg-slate-300')} /></div>}
                        label="Hotel" value={staff.hotel_name}
                      />
                      {staff.manager_first_name && (
                        <InfoRow icon={<Shield className="w-4 h-4" />} label="Reports To"
                          value={`${staff.manager_first_name} ${staff.manager_last_name}`}
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Employment</p>
                    <div className="rounded-2xl border border-slate-100 bg-white px-4 divide-y divide-slate-50">
                      <InfoRow icon={<Hash className="w-4 h-4" />} label="Employee Code" value={staff.employee_code} mono />
                      <InfoRow icon={<User className="w-4 h-4" />} label="Employment Type"
                        value={<span className="capitalize">{staff.employment_type.replace('_', ' ')}</span>}
                      />
                      <InfoRow icon={<Clock className="w-4 h-4" />} label="Shift"
                        value={
                          <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', SHIFT_COLORS[staff.shift] ?? 'bg-slate-100 text-slate-500')}>
                            {SHIFT_LABELS[staff.shift] ?? staff.shift}
                          </span>
                        }
                      />
                      <InfoRow icon={<Calendar className="w-4 h-4" />} label="Hire Date"
                        value={new Date(staff.hire_date).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}
                      />
                      <InfoRow icon={<DollarSign className="w-4 h-4" />} label="Monthly Salary"
                        value={<span className="font-semibold text-slate-800">{formatCurrency(parseFloat(staff.salary))}</span>}
                      />
                      <InfoRow
                        icon={staff.is_active ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-rose-500" />}
                        label="Status"
                        value={<span className={cn('font-semibold', staff.is_active ? 'text-emerald-600' : 'text-rose-500')}>{staff.is_active ? 'Active' : 'Inactive'}</span>}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* ── Footer ── */}
            <div className="border-t border-slate-100 bg-white px-6 py-4 flex gap-2">
              {editing ? (
                <>
                  <button onClick={cancelEdit}
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleSave} disabled={saving}
                    className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 py-2.5 text-sm font-semibold text-white shadow-sm hover:shadow-md disabled:opacity-60 transition-all flex items-center justify-center gap-2">
                    {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Save Changes</>}
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleDelete} disabled={deleting}
                    className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 text-sm font-medium hover:bg-rose-50 disabled:opacity-50 transition-colors flex items-center gap-1.5">
                    {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Delete
                  </button>
                  <button onClick={startEdit}
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5">
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                  <button onClick={onClose}
                    className="flex-1 rounded-xl gradient-azure py-2.5 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all">
                    Close
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}