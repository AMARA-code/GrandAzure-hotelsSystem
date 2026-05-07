"use client";

import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface Member {
  first_name: string;
  last_name: string;
  total_points: number;
  vip_status: string;
}

interface PointsChartProps {
  members: Member[];
}

const TIER_COLOR: Record<string, string> = {
  diamond: "#8b5cf6",
  platinum: "#0e8ee6",
  gold: "#f59e0b",
  silver: "#94a3b8",
  classic: "#cbd5e1",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-premium px-4 py-3 text-sm">
        <p className="font-semibold text-slate-800 mb-1">{label}</p>
        <p className="text-azure-600 font-bold">
          {payload[0].value.toLocaleString()} pts
        </p>
      </div>
    );
  }
  return null;
};

export default function PointsChart({ members }: PointsChartProps) {
  const data = members
    .slice(0, 10)
    .map((m) => ({
      name: `${m.first_name} ${m.last_name.charAt(0)}.`,
      points: m.total_points,
      status: m.vip_status,
    }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.5 }}
      className="bg-white rounded-2xl shadow-premium border border-slate-100 p-5 sm:p-6"
    >
      <div className="mb-5">
        <h2 className="text-base font-semibold text-slate-800 font-display">
          Top Members by Points
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Current point balances — top 10
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4">
        {Object.entries(TIER_COLOR).map(([tier, color]) => (
          <div key={tier} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: color }}
            />
            <span className="text-xs text-slate-500 capitalize">{tier}</span>
          </div>
        ))}
      </div>

      <div className="h-52 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 4, right: 4, left: 0, bottom: 4 }}
            barSize={22}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) =>
                v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
              }
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
            <Bar dataKey="points" radius={[6, 6, 0, 0]}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={TIER_COLOR[entry.status] ?? "#0e8ee6"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}