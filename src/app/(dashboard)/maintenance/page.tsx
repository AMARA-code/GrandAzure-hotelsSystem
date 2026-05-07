'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Wrench, RefreshCw } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'sonner'
import MaintenanceStats from '@/components/maintenance/MaintenanceStats'
import MaintenanceTable from '@/components/maintenance/MaintenanceTable'
import MaintenanceRequestModal from '@/components/maintenance/MaintenanceRequestModal'
import MaintenanceDetailDrawer from '@/components/maintenance/MaintenanceDetailDrawer'

interface MaintenanceRequest {
  request_id: number
  hotel_id: number
  hotel_name?: string
  room_id?: number | null
  room_number?: string | null
  reported_by: number
  reported_by_name?: string
  assigned_to?: number | null
  assigned_to_name?: string | null
  request_type: string
  priority: string
  status: string
  title: string
  description: string
  estimated_cost?: number | null
  actual_cost?: number | null
  started_at?: string | null
  completed_at?: string | null
  resolution_notes?: string | null
  created_at: string
  updated_at: string
}

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function loadRequests(): Promise<MaintenanceRequest[]> {
  const { data: raw, error } = await supabase
    .from('maintenance_requests')
    .select('request_id,hotel_id,room_id,reported_by,assigned_to,request_type,priority,status,title,description,estimated_cost,actual_cost,started_at,completed_at,resolution_notes,created_at,updated_at')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  if (!raw || raw.length === 0) return []

  const hotelIds = [...new Set(raw.map((r: any) => r.hotel_id).filter(Boolean))] as number[]
  const roomIds  = [...new Set(raw.map((r: any) => r.room_id).filter(Boolean))]  as number[]
  const staffIds = [...new Set([
    ...raw.map((r: any) => r.reported_by),
    ...raw.map((r: any) => r.assigned_to),
  ].filter(Boolean))] as number[]

  const [hotelRes, roomRes, staffRes] = await Promise.all([
    hotelIds.length ? supabase.from('hotels').select('hotel_id,hotel_name').in('hotel_id', hotelIds) : { data: [] },
    roomIds.length  ? supabase.from('rooms').select('room_id,room_number').in('room_id', roomIds)    : { data: [] },
    staffIds.length ? supabase.from('staff').select('staff_id,first_name,last_name').in('staff_id', staffIds) : { data: [] },
  ])

  const hotelMap: Record<number, string> = {}
  ;(hotelRes.data || []).forEach((h: any) => { hotelMap[h.hotel_id] = h.hotel_name })
  const roomMap: Record<number, string> = {}
  ;(roomRes.data || []).forEach((r: any) => { roomMap[r.room_id] = r.room_number })
  const staffMap: Record<number, string> = {}
  ;(staffRes.data || []).forEach((s: any) => { staffMap[s.staff_id] = `${s.first_name} ${s.last_name}` })

  return raw.map((r: any): MaintenanceRequest => ({
    ...r,
    hotel_name:       hotelMap[r.hotel_id]    ?? `Hotel ${r.hotel_id}`,
    room_number:      roomMap[r.room_id]      ?? null,
    reported_by_name: staffMap[r.reported_by] ?? `Staff ${r.reported_by}`,
    assigned_to_name: r.assigned_to ? (staffMap[r.assigned_to] ?? null) : null,
  }))
}

export default function MaintenancePage() {
  const [requests, setRequests]               = useState<MaintenanceRequest[]>([])
  const [loading, setLoading]                 = useState(true)
  const [refreshing, setRefreshing]           = useState(false)
  const [modalOpen, setModalOpen]             = useState(false)
  const [drawerOpen, setDrawerOpen]           = useState(false)
  const [editData, setEditData]               = useState<MaintenanceRequest | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null)

  const fetchData = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true)
    try {
      const data = await loadRequests()
      setRequests(data)
    } catch (err: any) {
      toast.error('Failed to load: ' + err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleEdit = (r: MaintenanceRequest) => {
    setEditData(r); setDrawerOpen(false); setModalOpen(true)
  }
  const handleView = (r: MaintenanceRequest) => {
    setSelectedRequest(r); setDrawerOpen(true)
  }
  const handleDelete = async (id: number) => {
    if (!confirm('Delete this request?')) return
    try {
      const { error } = await supabase
        .from('maintenance_requests')
        .update({ is_deleted: true })
        .eq('request_id', id)
      if (error) throw error
      toast.success('Deleted')
      fetchData()
    } catch (err: any) { toast.error(err.message) }
  }
  const handleStatusChange = async (requestId: number, newStatus: string) => {
    try {
      const updates: any = { status: newStatus }
      if (newStatus === 'in_progress') updates.started_at   = new Date().toISOString()
      if (newStatus === 'completed')   updates.completed_at = new Date().toISOString()
      const { error } = await supabase
        .from('maintenance_requests')
        .update(updates)
        .eq('request_id', requestId)
      if (error) throw error
      toast.success(`Marked as ${newStatus.replace('_', ' ')}`)
      fetchData()
      setSelectedRequest(prev =>
        prev?.request_id === requestId ? { ...prev, status: newStatus } : prev
      )
    } catch (err: any) { toast.error(err.message) }
  }

  const stats = {
    total:              requests.length,
    open:               requests.filter(r => r.status === 'open').length,
    inProgress:         requests.filter(r => r.status === 'in_progress').length,
    completed:          requests.filter(r => r.status === 'completed').length,
    highPriority:       requests.filter(r => r.priority === 'high' || r.priority === 'critical').length,
    totalEstimatedCost: requests.reduce((s, r) => s + (Number(r.estimated_cost) || 0), 0),
    totalActualCost:    requests.reduce((s, r) => s + (Number(r.actual_cost)    || 0), 0),
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/80 overflow-x-hidden">
      <div className="w-full p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">

        {/* ── Page Header ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="flex items-center justify-between gap-2 w-full"
        >
          {/* Left: icon + title */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shadow-azure shrink-0">
              <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-slate-900 font-display leading-tight truncate">
                Maintenance
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-500 truncate hidden sm:block">
                Track and manage all property maintenance requests
              </p>
            </div>
          </div>

          {/* Right: action buttons — always on same row, never wrap */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-slate-200 bg-white text-slate-600 text-[11px] sm:text-xs font-medium hover:bg-slate-50 disabled:opacity-50 shadow-sm transition-all whitespace-nowrap"
            >
              <RefreshCw className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => { setEditData(null); setModalOpen(true) }}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-white text-[11px] sm:text-sm font-semibold shadow-azure hover:shadow-lg transition-all whitespace-nowrap"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
              <span>New Request</span>
            </motion.button>
          </div>
        </motion.div>

        {/* ── Stats Cards ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.35 }}
        >
          <MaintenanceStats stats={stats} loading={loading} />
        </motion.div>

        {/* ── Requests Table / Cards ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.35 }}
        >
          <MaintenanceTable
            requests={requests}
            loading={loading}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </motion.div>
      </div>

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      <MaintenanceRequestModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditData(null) }}
        onSuccess={() => fetchData()}
        editData={editData}
      />
      <MaintenanceDetailDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setSelectedRequest(null) }}
        request={selectedRequest}
        onEdit={handleEdit}
        onStatusChange={handleStatusChange}
      />
    </div>
  )
}