"use client";

import { Crown, Star, Gem, Award, Circle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface LoyaltyBadgeProps {
  tier: string | null;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

const tierConfig = {
  Classic: {
    label: "Classic",
    icon: Circle,
    className: "bg-slate-100 text-slate-600 border-slate-200",
    iconColor: "text-slate-500",
  },
  Silver: {
    label: "Silver",
    icon: Star,
    className: "bg-slate-100 text-slate-700 border-slate-300",
    iconColor: "text-slate-500",
  },
  Gold: {
    label: "Gold",
    icon: Award,
    className: "bg-amber-50 text-amber-700 border-amber-200",
    iconColor: "text-amber-500",
  },
  Platinum: {
    label: "Platinum",
    icon: Crown,
    className: "bg-violet-50 text-violet-700 border-violet-200",
    iconColor: "text-violet-500",
  },
  Diamond: {
    label: "Diamond",
    icon: Gem,
    className: "bg-blue-50 text-blue-700 border-blue-200",
    iconColor: "text-blue-500",
  },
};

const sizeConfig = {
  sm: "text-xs px-2 py-0.5 gap-1",
  md: "text-sm px-2.5 py-1 gap-1.5",
  lg: "text-base px-3 py-1.5 gap-2",
};

const iconSizeConfig = {
  sm: 10,
  md: 12,
  lg: 14,
};

export function LoyaltyBadge({ tier, size = "md", showIcon = true }: LoyaltyBadgeProps) {
  if (!tier) return null;
  const config = tierConfig[tier as keyof typeof tierConfig] ?? tierConfig.Classic;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold rounded-full border",
        config.className,
        sizeConfig[size]
      )}
    >
      {showIcon && <Icon size={iconSizeConfig[size]} className={config.iconColor} />}
      {config.label}
    </span>
  );
}

export function VipStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    none: { label: "Standard", className: "bg-slate-100 text-slate-600 border-slate-200" },
    silver: { label: "Silver VIP", className: "bg-slate-100 text-slate-700 border-slate-300" },
    gold: { label: "Gold VIP", className: "bg-amber-50 text-amber-700 border-amber-200" },
    platinum: { label: "Platinum VIP", className: "bg-violet-50 text-violet-700 border-violet-200" },
    diamond: { label: "Diamond VIP", className: "bg-blue-50 text-blue-700 border-blue-200" },
  };

  const c = config[status] ?? config.none;
  return (
    <span className={cn("inline-flex items-center text-xs font-semibold rounded-full border px-2 py-0.5", c.className)}>
      {c.label}
    </span>
  );
}