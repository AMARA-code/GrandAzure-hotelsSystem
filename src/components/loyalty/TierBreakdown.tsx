"use client";

import { motion } from "framer-motion";

interface Tier {
  tier_id: number;
  tier_name: string;
  min_points: number;
  points_multiplier: string;
  benefits: string;
  member_count: number;
}

interface TierBreakdownProps {
  tiers: Tier[];
  totalMembers: number;
}

const TIER_CONFIG: Record<
  string,
  {
    gradient: string;
    bar: string;
    badge: string;
    badgeText: string;
    border: string;
    ring: string;
    emoji: string;
  }
> = {
  Classic: {
    gradient: "from-slate-100 to-slate-200",
    bar: "bg-gradient-to-r from-slate-300 to-slate-400",
    badge: "bg-slate-100 text-slate-600",
    badgeText: "text-slate-700",
    border: "border-slate-200",
    ring: "ring-slate-200",
    emoji: "🔵",
  },
  Silver: {
    gradient: "from-slate-50 to-slate-100",
    bar: "bg-gradient-to-r from-slate-400 to-slate-500",
    badge: "bg-slate-100 text-slate-700",
    badgeText: "text-slate-700",
    border: "border-slate-300",
    ring: "ring-slate-300",
    emoji: "⚪",
  },
  Gold: {
    gradient: "from-amber-50 to-yellow-50",
    bar: "bg-gradient-to-r from-gold-400 to-gold-500",
    badge: "bg-amber-100 text-amber-700",
    badgeText: "text-amber-700",
    border: "border-amber-200",
    ring: "ring-amber-200",
    emoji: "🟡",
  },
  Platinum: {
    gradient: "from-azure-50 to-blue-50",
    bar: "bg-gradient-to-r from-azure-400 to-azure-600",
    badge: "bg-azure-100 text-azure-700",
    badgeText: "text-azure-700",
    border: "border-azure-200",
    ring: "ring-azure-200",
    emoji: "🔷",
  },
  Diamond: {
    gradient: "from-violet-50 to-purple-50",
    bar: "bg-gradient-to-r from-violet-400 to-violet-600",
    badge: "bg-violet-100 text-violet-700",
    badgeText: "text-violet-700",
    border: "border-violet-200",
    ring: "ring-violet-200",
    emoji: "💎",
  },
};

export default function TierBreakdown({ tiers, totalMembers }: TierBreakdownProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="bg-white rounded-2xl shadow-premium border border-slate-100 p-5 sm:p-6"
    >
      <div className="mb-5">
        <h2 className="text-base font-semibold text-slate-800 font-display">
          Tier Distribution
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          {totalMembers} total enrolled members
        </p>
      </div>

      <div className="space-y-4">
        {tiers.map((tier, i) => {
          const cfg = TIER_CONFIG[tier.tier_name] ?? TIER_CONFIG["Classic"];
          const pct =
            totalMembers > 0
              ? Math.round((tier.member_count / totalMembers) * 100)
              : 0;
          const benefits = tier.benefits.split(",").map((b) => b.trim());

          return (
            <motion.div
              key={tier.tier_id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.07, duration: 0.4 }}
              className={`rounded-xl p-4 bg-gradient-to-r ${cfg.gradient} border ${cfg.border}`}
            >
              {/* Top row */}
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">{cfg.emoji}</span>
                  <div>
                    <p className={`text-sm font-semibold ${cfg.badgeText}`}>
                      {tier.tier_name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {tier.min_points.toLocaleString()}+ pts •{" "}
                      {tier.points_multiplier}× multiplier
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`text-lg font-bold ${cfg.badgeText}`}
                  >
                    {tier.member_count}
                  </span>
                  <span className="text-xs text-slate-400 ml-1">members</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-white/60 rounded-full h-1.5 mb-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ delay: 0.5 + i * 0.07, duration: 0.7, ease: "easeOut" }}
                  className={`h-1.5 rounded-full ${cfg.bar}`}
                />
              </div>

              {/* Benefits */}
              <div className="flex flex-wrap gap-1.5">
                {benefits.map((b, j) => (
                  <span
                    key={j}
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.badge}`}
                  >
                    {b}
                  </span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}