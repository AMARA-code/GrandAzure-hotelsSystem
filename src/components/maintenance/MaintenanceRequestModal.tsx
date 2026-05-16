'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Wrench, Building2, BedDouble, User, FileText, DollarSign, ChevronDown } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'

// ── Types ─────────────────────────────────────────────────────────────────────
type RequestType = 'electrical' | 'plumbing' | 'hvac' | 'furniture' | 'structural' | 'it' | 'other'
type PriorityType = 'low' | 'medium' | 'high' | 'critical'
type StatusType = 'open' | 'in_progress' | 'on_hold' | 'completed'

interface FormData {
  hotel_id: string
  room_id: string
  reported_by: string
  assigned_to: string
  request_type: RequestType
  priority: PriorityType
  status: StatusType
  title: string
  description: string
  estimated_cost: string
}

interface Hotel { hotel_id: number; hotel_name: string }
interface Room  { room_id: number; room_number: string }
interface Staff { staff_id: number; first_name: string; last_name: string }

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  editData?: any
}

// ── Constants ─────────────────────────────────────────────────────────────────
const REQUEST_TYPES: RequestType[] = ['electrical', 'plumbing', 'hvac', 'furniture', 'structural', 'it', 'other']

const PRIORITIES: { value: PriorityType; label: string; color: string; bg: string }[] = [
  { value: 'low',      label: 'Low',      color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-300' },
  { value: 'medium',   label: 'Medium',   color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-300'     },
  { value: 'high',     label: 'High',     color: 'text-rose-700',    bg: 'bg-rose-50 border-rose-300'       },
  { value: 'critical', label: 'Critical', color: 'text-purple-700',  bg: 'bg-purple-50 border-purple-300'   },
]

const STATUSES: { value: StatusType; label: string; color: string; bg: string }[] = [
  { value: 'open',        label: 'Open',        color: 'text-rose-700',    bg: 'bg-rose-50 border-rose-300'       },
  { value: 'in_progress', label: 'In Progress', color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-300'     },
  { value: 'on_hold',     label: 'On Hold',     color: 'text-slate-700',   bg: 'bg-slate-100 border-slate-300'    },
  { value: 'completed',   label: 'Completed',   color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-300' },
]

// ── Style helpers ─────────────────────────────────────────────────────────────
const fieldClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all duration-200'
const labelClass =
  'block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide'

// ── Component ─────────────────────────────────────────────────────────────────
export default function MaintenanceRequestModal({ open, onClose, onSuccess, editData }: Props) {
  const [hotels, setHotels]         = useState<Hotel[]>([])
  const [rooms, setRooms]           = useState<Room[]>([])
  const [staff, setStaff]           = useState<Staff[]>([])
  const [submitting, setSubmitting] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { register, handleSubmit, watch, reset } = useForm<FormData>({
    defaultValues: {
      hotel_id: '', room_id: '', reported_by: '', assigned_to: '',
      request_type: 'electrical', priority: 'medium', status: 'open',
      title: '', description: '', estimated_cost: '',
    },
  })

  const selectedHotel    = watch('hotel_id')
  const selectedPriority = watch('priority')
  const selectedStatus   = watch('status')

  // Load hotels + staff on open
  useEffect(() => {
    if (!open) return
    supabase.from('hotels').select('hotel_id, hotel_name').then(({ data }) => setHotels(data || []))
    supabase.from('staff').select('staff_id, first_name, last_name').eq('is_active', true)
      .then(({ data }) => setStaff(data || []))
  }, [open])

  // Load rooms when hotel changes
  useEffect(() => {
    if (!selectedHotel) { setRooms([]); return }
    supabase.from('rooms').select('room_id, room_number').eq('hotel_id', Number(selectedHotel))
      .then(({ data }) => setRooms(data || []))
  }, [selectedHotel])

  // Populate form for edit
  useEffect(() => {
    if (editData && open) {
      reset({
        hotel_id:       String(editData.hotel_id      ?? ''),
        room_id:        String(editData.room_id       ?? ''),
        reported_by:    String(editData.reported_by   ?? ''),
        assigned_to:    String(editData.assigned_to   ?? ''),
        request_type:   editData.request_type         ?? 'electrical',
        priority:       editData.priority             ?? 'medium',
        status:         editData.status               ?? 'open',
        title:          editData.title                ?? '',
        description:    editData.description          ?? '',
        estimated_cost: String(editData.estimated_cost ?? ''),
      })
    } else if (open) {
      reset({
        hotel_id: '', room_id: '', reported_by: '', assigned_to: '',
        request_type: 'electrical', priority: 'medium', status: 'open',
        title: '', description: '', estimated_cost: '',
      })
    }
  }, [editData, open])

  // ── Submit ─────────────────────────────────────────────────────────────────
  const onSubmit = async (data: FormData) => {
    if (!data.hotel_id)    { toast.error('Select a hotel'); return }
    if (!data.reported_by) { toast.error('Select a reporter'); return }
    if (!data.title || data.title.length < 3) { toast.error('Title must be at least 3 characters'); return }

    setSubmitting(true)
    try {
      const payload: any = {
        hotel_id:       Number(data.hotel_id),
        room_id:        data.room_id        ? Number(data.room_id)        : null,
        reported_by:    Number(data.reported_by),
        assigned_to:    data.assigned_to    ? Number(data.assigned_to)    : null,
        request_type:   data.request_type,
        priority:       data.priority,
        title:          data.title.trim(),
        description:    data.description?.trim() ?? '',
        estimated_cost: data.estimated_cost ? Number(data.estimated_cost) : null,
      }

      // Only include status on edit (new requests default to 'open' via DB)
      if (editData) payload.status = data.status

      if (editData) {
        const { error } = await supabase.from('maintenance_requests').update(payload).eq('request_id', editData.request_id)
        if (error) throw error
        toast.success('Request updated successfully')
      } else {
        const { error } = await supabase.from('maintenance_requests').insert(payload)
        if (error) throw error
        toast.success('Maintenance request created!')
      }
      onSuccess()
      onClose()
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="relative w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[88vh] overflow-y-auto bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border-0 sm:border border-slate-100"
          >
            {/* Mobile drag handle */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-slate-200" />
            </div>

            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-5 sm:px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shadow-sm">
                  <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-800 font-display">
                    {editData ? 'Edit Request' : 'New Maintenance Request'}
                  </h2>
                  <p className="text-xs text-slate-500 hidden sm:block">Fill in the details below</p>
                </div>
              </div>
              <button type="button" onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={handleSubmit(onSubmit)} className="px-5 sm:px-6 py-5 space-y-5">

              {/* Hotel + Request Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}><Building2 className="w-3 h-3 inline mr-1 mb-0.5" />Hotel</label>
                  <div className="relative">
                    <select {...register('hotel_id')} className={cn(fieldClass, 'appearance-none pr-8')}>
                      <option value="">Select hotel</option>
                      {hotels.map(h => <option key={h.hotel_id} value={h.hotel_id}>{h.hotel_name}</option>)}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className={labelClass}><Wrench className="w-3 h-3 inline mr-1 mb-0.5" />Request Type</label>
                  <div className="relative">
                    <select {...register('request_type')} className={cn(fieldClass, 'appearance-none pr-8')}>
                      {REQUEST_TYPES.map(t => (
                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Room + Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}><BedDouble className="w-3 h-3 inline mr-1 mb-0.5" />Room (Optional)</label>
                  <div className="relative">
                    <select {...register('room_id')} disabled={!selectedHotel}
                      className={cn(fieldClass, 'appearance-none pr-8', !selectedHotel && 'opacity-50 cursor-not-allowed')}
                    >
                      <option value="">No specific room</option>
                      {rooms.map(r => <option key={r.room_id} value={r.room_id}>Room {r.room_number}</option>)}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Priority Level</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {PRIORITIES.map(p => (
                      <label key={p.value} className={cn(
                        'flex items-center justify-center rounded-xl border-2 py-2 px-1 cursor-pointer transition-all text-center',
                        selectedPriority === p.value
                          ? `${p.bg} ${p.color} font-semibold`
                          : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-white'
                      )}>
                        <input type="radio" value={p.value} {...register('priority')} className="sr-only" />
                        <span className="text-[10px] sm:text-xs font-medium leading-none">{p.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status — only shown when editing */}
              {editData && (
                <div>
                  <label className={labelClass}>Status</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {STATUSES.map(s => (
                      <label key={s.value} className={cn(
                        'flex items-center justify-center rounded-xl border-2 py-2.5 px-2 cursor-pointer transition-all text-center',
                        selectedStatus === s.value
                          ? `${s.bg} ${s.color} font-semibold`
                          : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-white'
                      )}>
                        <input type="radio" value={s.value} {...register('status')} className="sr-only" />
                        <span className="text-xs font-medium leading-none">{s.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Title */}
              <div>
                <label className={labelClass}><FileText className="w-3 h-3 inline mr-1 mb-0.5" />Title</label>
                <input {...register('title')} placeholder="e.g. AC not cooling in Room 305" className={fieldClass} />
              </div>

              {/* Description */}
              <div>
                <label className={labelClass}>Description</label>
                <textarea {...register('description')} rows={3}
                  placeholder="Describe the issue in detail..."
                  className={cn(fieldClass, 'resize-none')}
                />
              </div>

              {/* Reported By + Assigned To */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}><User className="w-3 h-3 inline mr-1 mb-0.5" />Reported By</label>
                  <div className="relative">
                    <select {...register('reported_by')} className={cn(fieldClass, 'appearance-none pr-8')}>
                      <option value="">Select staff</option>
                      {staff.map(s => <option key={s.staff_id} value={s.staff_id}>{s.first_name} {s.last_name}</option>)}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className={labelClass}><User className="w-3 h-3 inline mr-1 mb-0.5" />Assign To (Optional)</label>
                  <div className="relative">
                    <select {...register('assigned_to')} className={cn(fieldClass, 'appearance-none pr-8')}>
                      <option value="">Unassigned</option>
                      {staff.map(s => <option key={s.staff_id} value={s.staff_id}>{s.first_name} {s.last_name}</option>)}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Estimated Cost */}
              <div className="sm:max-w-xs">
                <label className={labelClass}><DollarSign className="w-3 h-3 inline mr-1 mb-0.5" />Estimated Cost (PKR)</label>
                <input type="number" {...register('estimated_cost')} placeholder="e.g. 15000" className={fieldClass} />
              </div>

              {/* Footer */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button type="button" onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit" disabled={submitting}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-white text-sm font-semibold shadow-azure hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  {submitting ? 'Saving...' : editData ? 'Update Request' : 'Create Request'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}