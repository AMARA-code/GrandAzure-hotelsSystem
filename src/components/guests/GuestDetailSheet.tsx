"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X, User, Mail, Phone, MapPin, Globe, Calendar, CreditCard,
  Star, Crown, BookOpen, MessageSquare, AlertTriangle, CheckCircle,
  Gem, TrendingUp, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoyaltyBadge, VipStatusBadge } from "./LoyaltyBadge";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import { GuestRow } from "./GuestTable";

interface BookingRecord {
  booking_id: number;
  hotel_id: number;
  check_in_date: string;
  check_out_date: string;
  total_amount: string;
  booking_source: string;
}

interface ReviewRecord {
  review_id: number;
  hotel_id: number;
  overall_rating: number;
  title: string;
  review_text: string;
  platform: string;
  created_at: string;
}

interface LoyaltyRecord {
  card_number: string;
  total_points: number;
  lifetime_points: number;
  enrolled_at: string;
  last_activity: string;
}

interface GuestDetailSheetProps {
  guest: GuestRow | null;
  bookings: BookingRecord[];
  reviews: ReviewRecord[];
  loyalty: LoyaltyRecord | null;
  onClose: () => void;
  onEdit: () => void;
}

const hotelNames: Record<number, string> = {
  1: "Grand Azure Karachi",
  2: "Grand Azure Lahore",
  3: "Azure Boutique Islamabad",
};

const vipGradients: Record<string, string> = {
  diamond: "from-blue-500 to-blue-700",
  platinum: "from-violet-500 to-violet-700",
  gold: "from-amber-500 to-amber-600",
  silver: "from-slate-400 to-slate-600",
  none: "from-slate-300 to-slate-500",
};

export function GuestDetailSheet({ guest, bookings, reviews, loyalty, onClose, onEdit }: GuestDetailSheetProps) {
  if (!guest) return null;

  const gradient = vipGradients[guest.vip_status] ?? vipGradients.none;

  return (
    <AnimatePresence>
      {guest && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />

          {/* Sheet */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className={cn("bg-gradient-to-r p-6 text-white relative overflow-hidden", gradient)}>
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white" />
                <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-white" />
              </div>

              <div className="relative flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold font-display">
                    {guest.first_name} {guest.last_name}
                  </h2>
                  <p className="text-white/80 text-sm mt-0.5">{guest.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <VipStatusBadge status={guest.vip_status} />
                    {guest.loyalty_tier && <LoyaltyBadge tier={guest.loyalty_tier} size="sm" />}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/20">
                <div className="text-center">
                  <div className="text-xl font-bold">{guest.booking_count}</div>
                  <div className="text-white/70 text-xs">Bookings</div>
                </div>
                <div className="text-center border-x border-white/20">
                  <div className="text-xl font-bold">{formatCurrency(guest.total_spend)}</div>
                  <div className="text-white/70 text-xs">Total Spend</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">{loyalty?.total_points?.toLocaleString() ?? "—"}</div>
                  <div className="text-white/70 text-xs">Points</div>
                </div>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">

              {/* Blacklist warning */}
              {guest.is_blacklisted && (
                <div className="flex items-center gap-3 p-3 bg-rose-50 border border-rose-200 rounded-xl">
                  <AlertTriangle size={16} className="text-rose-500 flex-shrink-0" />
                  <p className="text-sm text-rose-700 font-medium">This guest is blacklisted</p>
                </div>
              )}

              {/* Personal Info */}
              <div className="bg-slate-50 rounded-2xl p-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <User size={14} className="text-blue-500" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Phone, label: "Phone", value: guest.phone },
                    { icon: Globe, label: "Nationality", value: guest.nationality },
                    { icon: MapPin, label: "City", value: guest.city },
                    { icon: Globe, label: "Country", value: guest.country },
                    { icon: Calendar, label: "Marketing", value: guest.marketing_opt_in ? "Opted In ✓" : "Opted Out" },
                    { icon: CheckCircle, label: "Status", value: guest.is_blacklisted ? "Blacklisted" : "Active" },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label}>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mb-0.5">
                        <Icon size={10} />
                        {label}
                      </div>
                      <div className="text-sm font-medium text-slate-800">{value ?? "—"}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Loyalty Info */}
              {loyalty && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <Crown size={14} className="text-amber-500" />
                    Loyalty Program
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-slate-500 mb-0.5">Card Number</div>
                      <div className="text-sm font-mono font-semibold text-slate-800">{loyalty.card_number}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-0.5">Current Tier</div>
                      <LoyaltyBadge tier={guest.loyalty_tier} size="sm" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-0.5">Current Points</div>
                      <div className="text-lg font-bold text-amber-600">{loyalty.total_points.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-0.5">Lifetime Points</div>
                      <div className="text-sm font-semibold text-slate-700">{loyalty.lifetime_points.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mb-0.5">
                        <Clock size={10} />
                        Enrolled
                      </div>
                      <div className="text-sm text-slate-700">{formatDate(loyalty.enrolled_at)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mb-0.5">
                        <TrendingUp size={10} />
                        Last Activity
                      </div>
                      <div className="text-sm text-slate-700">{formatDate(loyalty.last_activity)}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Booking History */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <BookOpen size={14} className="text-blue-500" />
                  Booking History ({bookings.length})
                </h3>
                <div className="space-y-2">
                  {bookings.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">No bookings found</p>
                  ) : (
                    bookings.map((b) => (
                      <div
                        key={b.booking_id}
                        className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 hover:border-blue-100 transition-colors"
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-700">
                            {hotelNames[b.hotel_id] ?? `Hotel ${b.hotel_id}`}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {formatDate(b.check_in_date)} → {formatDate(b.check_out_date)}
                          </div>
                          <div className="text-xs text-slate-400 capitalize mt-0.5">{b.booking_source}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-slate-800">
                            {parseFloat(b.total_amount) > 0 ? formatCurrency(parseFloat(b.total_amount)) : "—"}
                          </div>
                          <div className="text-xs text-slate-400">#{b.booking_id}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Reviews */}
              {reviews.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <MessageSquare size={14} className="text-blue-500" />
                    Reviews ({reviews.length})
                  </h3>
                  <div className="space-y-2">
                    {reviews.map((r) => (
                      <div key={r.review_id} className="p-3 bg-white rounded-xl border border-slate-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-slate-700">{r.title}</span>
                          <div className="flex items-center gap-1">
                            <Star size={11} className="text-amber-500 fill-amber-500" />
                            <span className="text-xs font-bold text-amber-600">{r.overall_rating}/10</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2">{r.review_text}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-slate-400 capitalize">{r.platform.replace("_", ".")}</span>
                          <span className="text-xs text-slate-400">{hotelNames[r.hotel_id]}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl h-10">
                Close
              </Button>
              <Button onClick={onEdit} className="flex-1 rounded-xl h-10 gradient-azure text-white border-0 shadow-azure">
                Edit Guest
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}