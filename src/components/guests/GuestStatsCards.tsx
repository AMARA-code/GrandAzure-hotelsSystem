"use client";

import { motion } from "framer-motion";
import { Users, Crown, Gem, UserX, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface GuestStats {
  total: number;
  diamond: number;
  platinum: number;
  gold: number;
  silver: number;
  standard: number;
  blacklisted: number;
  newThisMonth: number;
  withLoyalty: number;
}

export function GuestStatsCards({ stats }: { stats: GuestStats }) {
  const cards = [
    {
      title: "Total Guests",
      value: stats.total,
      sub: `${stats.newThisMonth} new this month`,
      icon: Users,
      gradient: "from-blue-500 to-azure-600",
      iconBg: "bg-blue-500",
      textColor: "text-blue-600",
    },
    {
      title: "Diamond & Platinum",
      value: stats.diamond + stats.platinum,
      sub: `${stats.diamond} Diamond · ${stats.platinum} Platinum`,
      icon: Gem,
      gradient: "from-violet-500 to-purple-600",
      iconBg: "bg-violet-500",
      textColor: "text-violet-600",
    },
    {
      title: "Loyalty Members",
      value: stats.withLoyalty,
      sub: `${stats.total > 0 ? Math.round((stats.withLoyalty / stats.total) * 100) : 0}% enrollment rate`,
      icon: Crown,
      gradient: "from-amber-500 to-orange-500",
      iconBg: "bg-amber-500",
      textColor: "text-amber-600",
    },
    {
      title: "Blacklisted",
      value: stats.blacklisted,
      sub: "Restricted guests",
      icon: UserX,
      gradient: "from-rose-500 to-red-600",
      iconBg: "bg-rose-500",
      textColor: "text-rose-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="relative bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-slate-100 overflow-hidden shadow-premium hover:shadow-premium-lg transition-all duration-300 hover:-translate-y-0.5"
          >
            <div className={cn("absolute -top-4 -right-4 w-20 h-20 sm:w-24 sm:h-24 rounded-full opacity-10 bg-gradient-to-br", card.gradient)} />

            <div className="flex items-start justify-between mb-2 sm:mb-4">
              <div className={cn("w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm flex-shrink-0", card.iconBg)}>
                <Icon size={16} className="text-white sm:hidden" />
                <Icon size={20} className="text-white hidden sm:block" />
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium bg-emerald-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                <TrendingUp size={9} className="sm:hidden" />
                <TrendingUp size={10} className="hidden sm:block" />
                <span className="hidden sm:inline">Live</span>
              </div>
            </div>

            <div className={cn("text-2xl sm:text-3xl font-bold mb-0.5 sm:mb-1", card.textColor)}>
              {card.value.toLocaleString()}
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-700 mb-0.5 sm:mb-1 leading-tight">{card.title}</div>
            <div className="text-xs text-slate-500 leading-tight line-clamp-1">{card.sub}</div>
          </motion.div>
        );
      })}
    </div>
  );
}