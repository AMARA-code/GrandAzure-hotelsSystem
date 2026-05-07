"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { formatDate } from "@/lib/utils/formatters";

interface Member {
  loyalty_id: number;
  guest_id: number;
  tier_id: number;
  card_number: string;
  total_points: number;
  lifetime_points: number;
  expiry_date: string | null;
  enrolled_at: string;
  last_activity: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  nationality: string;
  vip_status: string;
}

interface MembersTableProps {
  members: Member[];
}

const TIER_STYLE: Record<string, { label: string; cls: string }> = {
  classic: { label: "Classic", cls: "bg-slate-100 text-slate-600" },
  silver: { label: "Silver", cls: "bg-slate-200 text-slate-700" },
  gold: { label: "Gold", cls: "bg-amber-100 text-amber-700" },
  platinum: { label: "Platinum", cls: "bg-azure-100 text-azure-700" },
  diamond: { label: "Diamond", cls: "bg-violet-100 text-violet-700" },
};

type SortKey = "total_points" | "lifetime_points" | "enrolled_at" | "last_activity";
type SortDir = "asc" | "desc";

export default function MembersTable({ members }: MembersTableProps) {
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("total_points");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
    setPage(1);
  };

  const filtered = useMemo(() => {
    let list = [...members];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          `${m.first_name} ${m.last_name}`.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.card_number.toLowerCase().includes(q) ||
          m.nationality.toLowerCase().includes(q)
      );
    }
    if (tierFilter !== "all") {
      list = list.filter((m) => m.vip_status === tierFilter);
    }
    list.sort((a, b) => {
      let av: number | string = a[sortKey] ?? "";
      let bv: number | string = b[sortKey] ?? "";
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return list;
  }, [members, search, tierFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ChevronsUpDown className="w-3 h-3 text-slate-300" />;
    return sortDir === "asc"
      ? <ChevronUp className="w-3 h-3 text-azure-500" />
      : <ChevronDown className="w-3 h-3 text-azure-500" />;
  };

  const tiers = ["all", "classic", "silver", "gold", "platinum", "diamond"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="bg-white rounded-2xl shadow-premium border border-slate-100"
    >
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-800 font-display">
              Loyalty Members
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {filtered.length} member{filtered.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search members..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-azure-300 focus:border-azure-400 transition-all"
            />
          </div>
        </div>

        {/* Tier filter pills */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {tiers.map((t) => (
            <button
              key={t}
              onClick={() => { setTierFilter(t); setPage(1); }}
              className={`text-xs px-3 py-1 rounded-full font-medium capitalize transition-all ${
                tierFilter === t
                  ? "gradient-azure text-white shadow-azure"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {t === "all" ? "All Tiers" : t}
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
                Card
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                Tier
              </th>
              <th
                className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide cursor-pointer select-none"
                onClick={() => handleSort("total_points")}
              >
                <span className="flex items-center justify-end gap-1">
                  Points <SortIcon k="total_points" />
                </span>
              </th>
              <th
                className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide cursor-pointer select-none"
                onClick={() => handleSort("lifetime_points")}
              >
                <span className="flex items-center justify-end gap-1">
                  Lifetime <SortIcon k="lifetime_points" />
                </span>
              </th>
              <th
                className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide cursor-pointer select-none"
                onClick={() => handleSort("enrolled_at")}
              >
                <span className="flex items-center gap-1">
                  Enrolled <SortIcon k="enrolled_at" />
                </span>
              </th>
              <th
                className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide cursor-pointer select-none"
                onClick={() => handleSort("last_activity")}
              >
                <span className="flex items-center gap-1">
                  Last Active <SortIcon k="last_activity" />
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {paged.map((m, i) => {
                const tier = TIER_STYLE[m.vip_status] ?? TIER_STYLE["classic"];
                return (
                  <motion.tr
                    key={m.loyalty_id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-6 py-3.5">
                      <p className="font-medium text-slate-800 text-sm">
                        {m.first_name} {m.last_name}
                      </p>
                      <p className="text-xs text-slate-400">{m.email}</p>
                      <p className="text-xs text-slate-400">{m.nationality}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                        {m.card_number}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${tier.cls}`}>
                        {tier.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="font-semibold text-slate-800">
                        {m.total_points.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-slate-500 text-xs">
                        {m.lifetime_points.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">
                      {formatDate(m.enrolled_at)}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">
                      {formatDate(m.last_activity)}
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>

            {paged.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-400 text-sm">
                  No members match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cards — mobile */}
      <div className="md:hidden divide-y divide-slate-100">
        <AnimatePresence mode="popLayout">
          {paged.map((m, i) => {
            const tier = TIER_STYLE[m.vip_status] ?? TIER_STYLE["classic"];
            return (
              <motion.div
                key={m.loyalty_id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.04 }}
                className="p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">
                      {m.first_name} {m.last_name}
                    </p>
                    <p className="text-xs text-slate-400">{m.email}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize shrink-0 ${tier.cls}`}>
                    {tier.label}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span>
                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                      {m.card_number}
                    </span>
                  </span>
                  <span>
                    <span className="font-semibold text-slate-700">
                      {m.total_points.toLocaleString()}
                    </span>{" "}
                    pts
                  </span>
                  <span>
                    Lifetime:{" "}
                    <span className="font-medium">{m.lifetime_points.toLocaleString()}</span>
                  </span>
                  <span>Enrolled: {formatDate(m.enrolled_at)}</span>
                  <span>Active: {formatDate(m.last_activity)}</span>
                  <span>{m.nationality}</span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {paged.length === 0 && (
          <p className="text-center py-10 text-slate-400 text-sm">
            No members match your filters.
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