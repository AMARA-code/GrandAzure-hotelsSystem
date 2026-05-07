"use client";

import { motion } from "framer-motion";
import { Users, Star, TrendingUp, Award, Zap, Crown } from "lucide-react";
import { formatNumber } from "@/lib/utils/formatters";

interface LoyaltyStatsProps {
  totalMembers: number;
  totalPointsIssued: number;
  totalLifetimePoints: number;
  tierCounts: {
    classic: number;
    silver: number;
    gold: number;
    platinum: number;
    diamond: number;
  };
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function LoyaltyStats({
  totalMembers,
  totalPointsIssued,
  totalLifetimePoints,
  tierCounts,
}: LoyaltyStatsProps) {
  const redemptionRate =
    totalLifetimePoints > 0
      ? (
          ((totalLifetimePoints - totalPointsIssued) / totalLifetimePoints) *
          100
        ).toFixed(1)
      : "0.0";

  const stats = [
    {
      label: "Total Members",
      value: totalMembers.toString(),
      sub: "Enrolled in program",
      icon: Users,
      gradient: "from-azure-500 to-azure-700",
      glow: "shadow-azure",
      bg: "bg-azure-50",
      iconColor: "text-azure-600",
      textColor: "text-azure-700",
    },
    {
      label: "Active Points",
      value: formatNumber(totalPointsIssued),
      sub: "Current balance across members",
      icon: Star,
      gradient: "from-gold-400 to-gold-600",
      glow: "shadow-gold",
      bg: "bg-amber-50",
      iconColor: "text-amber-600",
      textColor: "text-amber-700",
    },
    {
      label: "Lifetime Points",
      value: formatNumber(totalLifetimePoints),
      sub: "All-time points earned",
      icon: TrendingUp,
      gradient: "from-emerald-400 to-emerald-600",
      glow: "",
      bg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      textColor: "text-emerald-700",
    },
    {
      label: "Redemption Rate",
      value: `${redemptionRate}%`,
      sub: "Points redeemed vs lifetime",
      icon: Zap,
      gradient: "from-violet-400 to-violet-600",
      glow: "",
      bg: "bg-violet-50",
      iconColor: "text-violet-600",
      textColor: "text-violet-700",
    },
    {
      label: "Diamond Members",
      value: tierCounts.diamond.toString(),
      sub: "Highest tier guests",
      icon: Crown,
      gradient: "from-violet-500 to-azure-600",
      glow: "",
      bg: "bg-violet-50",
      iconColor: "text-violet-600",
      textColor: "text-violet-700",
    },
    {
      label: "Platinum Members",
      value: tierCounts.platinum.toString(),
      sub: "Second highest tier",
      icon: Award,
      gradient: "from-slate-400 to-slate-600",
      glow: "",
      bg: "bg-slate-50",
      iconColor: "text-slate-600",
      textColor: "text-slate-700",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="bg-white rounded-2xl p-4 shadow-premium border border-slate-100 flex flex-col gap-3 hover:shadow-premium-lg transition-shadow duration-300"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 leading-tight">
                {stat.label}
              </span>
              <div className={`p-1.5 rounded-lg ${stat.bg}`}>
                <Icon className={`w-3.5 h-3.5 ${stat.iconColor}`} />
              </div>
            </div>
            <div>
              <p className={`text-2xl font-bold ${stat.textColor} leading-none`}>
                {stat.value}
              </p>
              <p className="text-xs text-slate-400 mt-1">{stat.sub}</p>
            </div>
            <div className={`h-1 rounded-full bg-gradient-to-r ${stat.gradient} opacity-70`} />
          </motion.div>
        );
      })}
    </div>
  );
}