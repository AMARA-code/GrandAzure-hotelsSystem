"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type Row,
  type HeaderGroup,
  type Header,
  type Cell,
} from "@tanstack/react-table";
import { ChevronUp, ChevronDown, Eye, Edit, AlertTriangle, MapPin, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VipStatusBadge, LoyaltyBadge } from "./LoyaltyBadge";
import { formatCurrency } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";

export interface GuestRow {
  guest_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string | null;
  country: string | null;
  nationality: string | null;
  vip_status: string;
  is_blacklisted: boolean;
  marketing_opt_in: boolean;
  created_at: string;
  loyalty_tier: string | null;
  total_points: number | null;
  booking_count: number;
  total_spend: number;
}

interface GuestTableProps {
  guests: GuestRow[];
  onView: (guest: GuestRow) => void;
  onEdit: (guest: GuestRow) => void;
  isLoading: boolean;
}

export function GuestTable({ guests, onView, onEdit, isLoading }: GuestTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<GuestRow>[] = [
    {
      accessorKey: "name",
      header: "Guest",
      cell: ({ row }: { row: Row<GuestRow> }) => {
        const g = row.original;
        return (
          <div className="min-w-0">
            <div className="font-semibold text-slate-800 text-xs sm:text-sm truncate">
              {g.first_name} {g.last_name}
              {g.is_blacklisted && <AlertTriangle size={11} className="inline ml-1 text-rose-500" />}
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1 truncate">
              <Mail size={9} className="flex-shrink-0" />
              <span className="truncate">{g.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "phone",
      header: "Contact",
      cell: ({ row }: { row: Row<GuestRow> }) => (
        <div className="text-xs sm:text-sm hidden sm:block">
          <div className="flex items-center gap-1 text-slate-700">
            <Phone size={10} className="text-slate-400 flex-shrink-0" />
            <span className="truncate">{row.original.phone}</span>
          </div>
          {row.original.city && (
            <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
              <MapPin size={9} className="flex-shrink-0" />
              <span className="truncate">{row.original.city}, {row.original.country}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "vip_status",
      header: "VIP",
      cell: ({ row }: { row: Row<GuestRow> }) => <VipStatusBadge status={row.original.vip_status} />,
    },
    {
      accessorKey: "loyalty_tier",
      header: "Loyalty",
      cell: ({ row }: { row: Row<GuestRow> }) =>
        row.original.loyalty_tier ? (
          <div>
            <LoyaltyBadge tier={row.original.loyalty_tier} size="sm" />
            {row.original.total_points !== null && (
              <div className="text-xs text-slate-500 mt-0.5 hidden sm:block">
                {row.original.total_points.toLocaleString()} pts
              </div>
            )}
          </div>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
    {
      accessorKey: "booking_count",
      header: "Stays",
      cell: ({ row }: { row: Row<GuestRow> }) => (
        <div className="text-center">
          <span className="text-xs sm:text-sm font-semibold text-slate-700">{row.original.booking_count}</span>
        </div>
      ),
    },
    {
      accessorKey: "total_spend",
      header: "Spend",
      cell: ({ row }: { row: Row<GuestRow> }) => (
        <div className="text-xs sm:text-sm font-semibold text-slate-800 whitespace-nowrap">
          {formatCurrency(row.original.total_spend)}
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }: { row: Row<GuestRow> }) => (
        <div className="flex items-center gap-0.5 sm:gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(row.original)}
            className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-lg hover:bg-blue-50 hover:text-blue-600"
          >
            <Eye size={13} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(row.original)}
            className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-lg hover:bg-slate-100"
          >
            <Edit size={13} />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: guests,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-100 shadow-premium p-4 sm:p-8">
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 sm:h-14 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-100 shadow-premium overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              {table.getHeaderGroups().map((hg: HeaderGroup<GuestRow>) =>
                hg.headers.map((header: Header<GuestRow, unknown>) => (
                  <th
                    key={header.id}
                    className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-3 sm:px-4 py-2.5 sm:py-3 whitespace-nowrap cursor-pointer select-none hover:text-slate-700 transition-colors"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === "asc" && <ChevronUp size={11} />}
                      {header.column.getIsSorted() === "desc" && <ChevronDown size={11} />}
                    </div>
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-12 text-slate-400 text-sm">
                    No guests found
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row: Row<GuestRow>, i: number) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className={cn(
                      "border-b border-slate-50 hover:bg-slate-50/70 transition-colors",
                      row.original.is_blacklisted && "bg-rose-50/30 hover:bg-rose-50/50"
                    )}
                  >
                    {row.getVisibleCells().map((cell: Cell<GuestRow, unknown>) => (
                      <td key={cell.id} className="px-3 sm:px-4 py-2.5 sm:py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-t border-slate-100 bg-slate-50/30">
        <span className="text-xs text-slate-500">
          Showing {table.getRowModel().rows.length} of {guests.length} guests
        </span>
      </div>
    </div>
  );
}