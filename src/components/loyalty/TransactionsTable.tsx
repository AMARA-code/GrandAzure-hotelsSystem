"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, TrendingUp, TrendingDown, Gift } from "lucide-react";
import { formatDateTime } from "@/lib/utils/formatters";

interface Transaction {
  transaction_id: number;
  loyalty_id: number;
  booking_id: number | null;
  transaction_type: string;
  points: number;
  balance_after: number;
  description: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface TransactionsTableProps {
  transactions: Transaction[];
}

const TYPE_CONFIG: Record<
  string,
  { label: string; cls: string; icon: React.ElementType; sign: string }
> = {
  earn: {
    label: "Earned",
    cls: "bg-emerald-100 text-emerald-700",
    icon: TrendingUp,
    sign: "+",
  },
  redeem: {
    label: "Redeemed",
    cls: "bg-rose-100 text-rose-600",
    icon: TrendingDown,
    sign: "-",
  },
  bonus: {
    label: "Bonus",
    cls: "bg-violet-100 text-violet-700",
    icon: Gift,
    sign: "+",
  },
  expire: {
    label: "Expired",
    cls: "bg-slate-100 text-slate-500",
    icon: TrendingDown,
    sign: "-",
  },
};

export default function TransactionsTable({ transactions }: TransactionsTableProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  const types = useMemo(
    () => ["all", ...Array.from(new Set(transactions.map((t) => t.transaction_type)))],
    [transactions]
  );

  const filtered = useMemo(() => {
    let list = [...transactions];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          `${t.first_name} ${t.last_name}`.toLowerCase().includes(q) ||
          t.email.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }
    if (typeFilter !== "all") {
      list = list.filter((t) => t.transaction_type === typeFilter);
    }
    return list;
  }, [transactions, search, typeFilter]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.5 }}
      className="bg-white rounded-2xl shadow-premium border border-slate-100"
    >
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-800 font-display">
              Points Transactions
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search transactions..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-azure-300 focus:border-azure-400 transition-all"
            />
          </div>
        </div>

        {/* Type pills */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => { setTypeFilter(t); setPage(1); }}
              className={`text-xs px-3 py-1 rounded-full font-medium capitalize transition-all ${
                typeFilter === t
                  ? "gradient-azure text-white shadow-azure"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {t === "all" ? "All Types" : t}
            </button>
          ))}
        </div>
      </div>

      {/* Table — desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60">
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                Member
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                Type
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                Description
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                Points
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                Balance After
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {paged.map((t, i) => {
                const cfg = TYPE_CONFIG[t.transaction_type] ?? TYPE_CONFIG["earn"];
                const Icon = cfg.icon;
                const isPositive = cfg.sign === "+";
                return (
                  <motion.tr
                    key={t.transaction_id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-6 py-3.5">
                      <p className="font-medium text-slate-800 text-sm">
                        {t.first_name} {t.last_name}
                      </p>
                      <p className="text-xs text-slate-400">{t.email}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.cls}`}>
                        <Icon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 max-w-[200px]">
                      <span className="line-clamp-2">{t.description}</span>
                      {t.booking_id && (
                        <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 mt-0.5 inline-block">
                          #{t.booking_id}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span
                        className={`font-bold text-sm ${
                          isPositive ? "text-emerald-600" : "text-rose-500"
                        }`}
                      >
                        {cfg.sign}{t.points.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right text-xs text-slate-500 font-medium">
                      {t.balance_after.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">
                      {formatDateTime(t.created_at)}
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>

            {paged.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400 text-sm">
                  No transactions match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cards — mobile */}
      <div className="md:hidden divide-y divide-slate-100">
        <AnimatePresence mode="popLayout">
          {paged.map((t, i) => {
            const cfg = TYPE_CONFIG[t.transaction_type] ?? TYPE_CONFIG["earn"];
            const Icon = cfg.icon;
            const isPositive = cfg.sign === "+";
            return (
              <motion.div
                key={t.transaction_id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.04 }}
                className="p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">
                      {t.first_name} {t.last_name}
                    </p>
                    <p className="text-xs text-slate-400">{t.email}</p>
                  </div>
                  <span
                    className={`font-bold text-sm shrink-0 ${
                      isPositive ? "text-emerald-600" : "text-rose-500"
                    }`}
                  >
                    {cfg.sign}{t.points.toLocaleString()} pts
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                  <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full ${cfg.cls}`}>
                    <Icon className="w-3 h-3" />
                    {cfg.label}
                  </span>
                  <span>Balance: <span className="font-medium text-slate-700">{t.balance_after.toLocaleString()}</span></span>
                  {t.booking_id && (
                    <span className="font-mono bg-slate-100 px-1.5 rounded">#{t.booking_id}</span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">{t.description}</p>
                <p className="text-xs text-slate-400 mt-0.5">{formatDateTime(t.created_at)}</p>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {paged.length === 0 && (
          <p className="text-center py-10 text-slate-400 text-sm">
            No transactions match your filters.
          </p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 sm:px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-2">
          <span className="text-xs text-slate-400">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                  page === p
                    ? "gradient-azure text-white border-azure-500 shadow-azure"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}