"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, ArrowLeftRight, BarChart2 } from "lucide-react";
import MembersTable from "@/components/loyalty/MembersTable";
import TransactionsTable from "@/components/loyalty/TransactionsTable";
import TierBreakdown from "@/components/loyalty/TierBreakdown";
import PointsChart from "@/components/loyalty/PointsChart";
import LoyaltyStats from "@/components/loyalty/LoyaltyStats";
import { PagePurposeAvatar } from "@/components/layout/PagePurposeAvatar";

interface LoyaltyClientProps {
  members: any[];
  transactions: any[];
  tiers: any[];
  stats: {
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
  };
}

const TABS = [
  { id: "members", label: "Members", icon: Users },
  { id: "transactions", label: "Transactions", icon: ArrowLeftRight },
  { id: "analytics", label: "Analytics", icon: BarChart2 },
];

export default function LoyaltyClient({
  members,
  transactions,
  tiers,
  stats,
}: LoyaltyClientProps) {
  const [activeTab, setActiveTab] = useState("members");

  return (
    <div className="min-h-screen bg-slate-50/60 p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-3"
      >
        <div className="flex items-start gap-3 min-w-0">
          <PagePurposeAvatar variant="loyalty" size={44} className="shrink-0 mt-0.5" />
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
              Loyalty Program
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Grand Azure Rewards — member points, tiers &amp; transactions
            </p>
          </div>
        </div>

        {/* Tier pills summary */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: "Diamond", count: stats.tierCounts.diamond, cls: "bg-violet-100 text-violet-700" },
            { label: "Platinum", count: stats.tierCounts.platinum, cls: "bg-azure-100 text-azure-700" },
            { label: "Gold", count: stats.tierCounts.gold, cls: "bg-amber-100 text-amber-700" },
            { label: "Silver", count: stats.tierCounts.silver, cls: "bg-slate-200 text-slate-600" },
          ].map((t) => (
            <span
              key={t.label}
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${t.cls}`}
            >
              {t.count} {t.label}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Stats */}
      <LoyaltyStats
        totalMembers={stats.totalMembers}
        totalPointsIssued={stats.totalPointsIssued}
        totalLifetimePoints={stats.totalLifetimePoints}
        tierCounts={stats.tierCounts}
      />

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-premium border border-slate-100 p-1 flex gap-1 w-full sm:w-auto sm:inline-flex"
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
                activeTab === tab.id
                  ? "text-white"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="loyalty-tab-bg"
                  className="absolute inset-0 gradient-azure rounded-xl shadow-azure"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.45 }}
                />
              )}
              <Icon className="w-3.5 h-3.5 relative z-10" />
              <span className="relative z-10 hidden sm:inline">{tab.label}</span>
              <span className="relative z-10 sm:hidden text-xs">{tab.label}</span>
            </button>
          );
        })}
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "members" && (
          <motion.div
            key="members"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
          >
            <MembersTable members={members} />
          </motion.div>
        )}

        {activeTab === "transactions" && (
          <motion.div
            key="transactions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
          >
            <TransactionsTable transactions={transactions} />
          </motion.div>
        )}

        {activeTab === "analytics" && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6"
          >
            <PointsChart members={members} />
            <TierBreakdown tiers={tiers} totalMembers={stats.totalMembers} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}