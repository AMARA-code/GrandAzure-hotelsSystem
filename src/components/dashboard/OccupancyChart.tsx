'use client'

import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { BedDouble } from 'lucide-react'
import { useHotelOccupancy } from '@/lib/hooks/useDashboard'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-premium-lg min-w-[180px]">
        <p className="font-semibold text-slate-800 mb-3">{label}</p>
        {payload.map((entry: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between gap-4 text-sm mb-1">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.fill }} />
              <span className="text-slate-500">{entry.name}</span>
            </div>
            <span className="font-semibold text-slate-800">{entry.value}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function OccupancyChart() {
  const { data, loading } = useHotelOccupancy()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Room Occupancy</h3>
            <p className="text-slate-400 text-sm mt-0.5">Live status per property</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-azure-50 flex items-center justify-center">
            <BedDouble className="w-5 h-5 text-azure-600" />
          </div>
        </div>
      </div>

      {/* Occupancy rates */}
      <div className="px-6 pt-4 grid grid-cols-3 gap-3">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
          ))
        ) : (
          data.map((hotel, idx) => (
            <motion.div
              key={hotel.hotel_name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + idx * 0.1 }}
              className="text-center p-3 rounded-xl bg-slate-50 border border-slate-100"
            >
              <p className="text-2xl font-bold text-slate-900">{hotel.occupancy_rate}%</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-tight">{hotel.hotel_name}</p>
            </motion.div>
          ))
        )}
      </div>

      {/* Bar Chart */}
      <div className="p-6">
        {loading ? (
          <div className="h-52 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-azure-200 border-t-azure-500 rounded-full animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} barGap={4} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="hotel_name"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc', radius: 8 }} />
              <Bar dataKey="occupied" name="Occupied" radius={[6, 6, 0, 0]} maxBarSize={40}>
                {data.map((_, idx) => (
                  <Cell key={idx} fill="#0e8ee6" />
                ))}
              </Bar>
              <Bar dataKey="available" name="Available" radius={[6, 6, 0, 0]} maxBarSize={40}>
                {data.map((_, idx) => (
                  <Cell key={idx} fill="#10b981" />
                ))}
              </Bar>
              <Bar dataKey="dirty" name="Dirty" radius={[6, 6, 0, 0]} maxBarSize={40}>
                {data.map((_, idx) => (
                  <Cell key={idx} fill="#f59e0b" />
                ))}
              </Bar>
              <Bar dataKey="maintenance" name="Maintenance" radius={[6, 6, 0, 0]} maxBarSize={40}>
                {data.map((_, idx) => (
                  <Cell key={idx} fill="#f43f5e" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* Legend */}
        <div className="flex items-center justify-center gap-5 mt-2 flex-wrap">
          {[
            { color: '#0e8ee6', label: 'Occupied' },
            { color: '#10b981', label: 'Available' },
            { color: '#f59e0b', label: 'Dirty' },
            { color: '#f43f5e', label: 'Maintenance' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-slate-500">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}