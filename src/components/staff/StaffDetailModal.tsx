'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Mail, Phone, Calendar, Building2,
  Briefcase, Clock, DollarSign, User, Shield,
  CheckCircle, XCircle, Hash
} from 'lucide-react'
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
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase()
}

function getInitialsBg(name: string) {
  const colors = [
    'from-blue-400 to-blue-600',
    'from-emerald-400 to-emerald-600',
    'from-violet-400 to-violet-600',
    'from-amber-400 to-amber-600',
    'from-rose-400 to-rose-600',
    'from-cyan-400 to-cyan-600',
    'from-orange-400 to-orange-600',
    'from-pink-400 to-pink-600',
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
  const rem   = ((months < 0 ? months + 12 : months))
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
  1: 'bg-[#0e8ee6]',
  2: 'bg-emerald-500',
  3: 'bg-violet-500',
}

// ─── Row helper ────────────────────────────────────────────────────────────────
function InfoRow({
  icon, label, value, mono = false
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  mono?: boolean
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

// ─── Component ────────────────────────────────────────────────────────────────
export default function StaffDetailModal({ staff, open, onClose }: Props) {
  if (!staff) return null

  const fullName  = `${staff.first_name} ${staff.last_name}`
  const initials  = getInitials(staff.first_name, staff.last_name)
  const bgGrad    = getInitialsBg(fullName)

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
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
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-xl bg-white/20 p-2 text-white hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Initials — large, text only, no image/avatar icon */}
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/25 text-3xl font-bold text-white shadow-lg select-none">
                {initials}
              </div>

              {/* Name & role */}
              <h2 className="text-xl font-bold text-white leading-tight">{fullName}</h2>
              <p className="mt-1 text-sm text-white/80">{staff.role_name}</p>

              {/* Pills row */}
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white">
                  {staff.employee_code}
                </span>
                <span className={cn(
                  'rounded-full px-3 py-1 text-xs font-semibold',
                  staff.is_active
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-rose-100 text-rose-700'
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

              {/* Service summary cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Salary</p>
                  <p className="mt-1 text-base font-bold text-slate-800">
                    {formatCurrency(parseFloat(staff.salary))}
                  </p>
                  <p className="text-[10px] text-slate-400">per month</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Tenure</p>
                  <p className="mt-1 text-base font-bold text-slate-800">
                    {yearsOfService(staff.hire_date)}
                  </p>
                  <p className="text-[10px] text-slate-400">of service</p>
                </div>
              </div>

              {/* Contact */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Contact</p>
                <div className="rounded-2xl border border-slate-100 bg-white px-4 divide-y divide-slate-50">
                  <InfoRow
                    icon={<Mail className="w-4 h-4" />}
                    label="Email"
                    value={
                      <a href={`mailto:${staff.email}`} className="text-[#0e8ee6] hover:underline break-all">
                        {staff.email}
                      </a>
                    }
                  />
                  <InfoRow
                    icon={<Phone className="w-4 h-4" />}
                    label="Phone"
                    value={staff.phone}
                    mono
                  />
                </div>
              </div>

              {/* Position */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Position</p>
                <div className="rounded-2xl border border-slate-100 bg-white px-4 divide-y divide-slate-50">
                  <InfoRow
                    icon={<Briefcase className="w-4 h-4" />}
                    label="Role"
                    value={
                      <div className="flex items-center gap-2 flex-wrap">
                        <span>{staff.role_name}</span>
                        <span className={cn(
                          'rounded-full px-2 py-0.5 text-[10px] font-medium',
                          ROLE_CATEGORY_COLORS[staff.role_category] ?? 'bg-slate-100 text-slate-500'
                        )}>
                          {ROLE_CATEGORY_LABELS[staff.role_category] ?? staff.role_category}
                        </span>
                      </div>
                    }
                  />
                  <InfoRow
                    icon={<Building2 className="w-4 h-4" />}
                    label="Department"
                    value={staff.dept_name}
                  />
                  <InfoRow
                    icon={<div className="flex items-center gap-1.5">
                      <span className={cn('h-2 w-2 rounded-full', HOTEL_DOT[staff.hotel_id] ?? 'bg-slate-300')} />
                    </div>}
                    label="Hotel"
                    value={staff.hotel_name}
                  />
                  {staff.manager_first_name && (
                    <InfoRow
                      icon={<Shield className="w-4 h-4" />}
                      label="Reports To"
                      value={`${staff.manager_first_name} ${staff.manager_last_name}`}
                    />
                  )}
                </div>
              </div>

              {/* Employment */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Employment</p>
                <div className="rounded-2xl border border-slate-100 bg-white px-4 divide-y divide-slate-50">
                  <InfoRow
                    icon={<Hash className="w-4 h-4" />}
                    label="Employee Code"
                    value={staff.employee_code}
                    mono
                  />
                  <InfoRow
                    icon={<User className="w-4 h-4" />}
                    label="Employment Type"
                    value={
                      <span className="capitalize">
                        {staff.employment_type.replace('_', ' ')}
                      </span>
                    }
                  />
                  <InfoRow
                    icon={<Clock className="w-4 h-4" />}
                    label="Shift"
                    value={
                      <span className={cn(
                        'rounded-full px-2.5 py-1 text-xs font-medium',
                        SHIFT_COLORS[staff.shift] ?? 'bg-slate-100 text-slate-500'
                      )}>
                        {SHIFT_LABELS[staff.shift] ?? staff.shift}
                      </span>
                    }
                  />
                  <InfoRow
                    icon={<Calendar className="w-4 h-4" />}
                    label="Hire Date"
                    value={new Date(staff.hire_date).toLocaleDateString('en-PK', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  />
                  <InfoRow
                    icon={<DollarSign className="w-4 h-4" />}
                    label="Monthly Salary"
                    value={
                      <span className="font-semibold text-slate-800">
                        {formatCurrency(parseFloat(staff.salary))}
                      </span>
                    }
                  />
                  <InfoRow
                    icon={staff.is_active
                      ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                      : <XCircle className="w-4 h-4 text-rose-500" />
                    }
                    label="Status"
                    value={
                      <span className={cn(
                        'font-semibold',
                        staff.is_active ? 'text-emerald-600' : 'text-rose-500'
                      )}>
                        {staff.is_active ? 'Active' : 'Inactive'}
                      </span>
                    }
                  />
                </div>
              </div>
            </div>

            {/* ── Footer ── */}
            <div className="border-t border-slate-100 bg-white px-6 py-4">
              <button
                onClick={onClose}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}