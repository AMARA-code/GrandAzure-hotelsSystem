"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";

interface GuestFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  vipFilter: string;
  onVipFilterChange: (v: string) => void;
  nationalityFilter: string;
  onNationalityFilterChange: (v: string) => void;
  nationalities: string[];
  onReset: () => void;
  hasFilters: boolean;
}

export function GuestFilters({
  search, onSearchChange, vipFilter, onVipFilterChange,
  nationalityFilter, onNationalityFilterChange, nationalities, onReset, hasFilters,
}: GuestFiltersProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl sm:rounded-2xl border border-slate-100 shadow-premium p-3 sm:p-4"
    >
      <div className="flex flex-col gap-2 sm:gap-3">
        {/* Search - full width always */}
        <div className="relative w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by name, email, phone, city..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
            className="pl-8 h-9 sm:h-10 border-slate-200 rounded-xl bg-slate-50 focus:bg-white transition-colors text-sm w-full"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Selects row */}
        <div className="flex flex-wrap gap-2">
          <Select value={vipFilter} onValueChange={onVipFilterChange}>
            <SelectTrigger className="h-9 sm:h-10 w-full sm:w-40 border-slate-200 rounded-xl bg-slate-50 text-sm flex-1 sm:flex-none min-w-[120px]">
              <SelectValue placeholder="VIP Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="diamond">💎 Diamond</SelectItem>
              <SelectItem value="platinum">👑 Platinum</SelectItem>
              <SelectItem value="gold">🥇 Gold</SelectItem>
              <SelectItem value="silver">🥈 Silver</SelectItem>
              <SelectItem value="none">Standard</SelectItem>
            </SelectContent>
          </Select>

          <Select value={nationalityFilter} onValueChange={onNationalityFilterChange}>
            <SelectTrigger className="h-9 sm:h-10 w-full sm:w-40 border-slate-200 rounded-xl bg-slate-50 text-sm flex-1 sm:flex-none min-w-[120px]">
              <SelectValue placeholder="Nationality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {nationalities.map((n) => (
                <SelectItem key={n} value={n}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="h-9 sm:h-10 px-3 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 text-sm flex-shrink-0"
            >
              <X size={13} className="mr-1" />
              Reset
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}