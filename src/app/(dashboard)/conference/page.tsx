"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Users, Wifi, Monitor, Calendar, Clock,
  ChevronDown, Search, Filter, RefreshCw, X, Plus,
  MapPin, DollarSign, CheckCircle2, Circle, Layers,
  LayoutGrid, List, TrendingUp, Star, ChevronRight,
  Theater, Table2, Presentation,
} from "lucide-react";
import { format, differenceInHours } from "date-fns";
import { cn } from "@/lib/utils/cn";
import { createBrowserClient } from "@supabase/ssr";
import { PagePurposeAvatar } from "@/components/layout/PagePurposeAvatar";

// ── Types ──────────────────────────────────────────────────────────────────
interface ConferenceHall {
  hall_id: number;
  hotel_id: number;
  hall_name: string;
  capacity_theatre: number | null;
  capacity_boardroom: number | null;
  capacity_banquet: number | null;
  area_sqft: string;
  hourly_rate: string;
  full_day_rate: string;
  has_av: boolean;
  has_wifi: boolean;
  is_active: boolean;
  hotel_name: string;
}

interface ConferenceBooking {
  conf_booking_id: number;
  hall_id: number;
  guest_id: number;
  contact_name: string;
  event_name: string;
  event_type: string;
  start_datetime: string;
  end_datetime: string;
  attendees: number;
  setup_type: string;
  status: string;
  total_amount: string;
  deposit_paid: string;
  notes: string | null;
  created_at: string;
  hall_name: string;
  hotel_id: number;
  hotel_name: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────
const hotelColor = (name: string) =>
  name.includes("Karachi") ? "azure" : name.includes("Lahore") ? "emerald" : "violet";

const hotelShort = (name: string) =>
  name.includes("Karachi") ? "Karachi" : name.includes("Lahore") ? "Lahore" : "Islamabad";

const formatPKR = (val: string | number) =>
  `PKR ${Number(val).toLocaleString("en-PK")}`;

const EVENT_TYPE_LABELS: Record<string, string> = {
  conference: "Conference", meeting: "Meeting",
  wedding: "Wedding", seminar: "Seminar",
  workshop: "Workshop", gala: "Gala",
};

const STATUS_CONFIG: Record<string, { label: string; cls: string; dot: string }> = {
  confirmed:  { label: "Confirmed",  cls: "bg-azure-50 text-azure-700 border-azure-200",     dot: "bg-azure-500"   },
  completed:  { label: "Completed",  cls: "bg-slate-50 text-slate-600 border-slate-200",     dot: "bg-slate-400"   },
  pending:    { label: "Pending",    cls: "bg-amber-50 text-amber-700 border-amber-200",     dot: "bg-amber-400"   },
  cancelled:  { label: "Cancelled",  cls: "bg-rose-50 text-rose-700 border-rose-200",        dot: "bg-rose-500"    },
  tentative:  { label: "Tentative",  cls: "bg-violet-50 text-violet-700 border-violet-200",  dot: "bg-violet-400"  },
};

const SETUP_ICONS: Record<string, React.ReactNode> = {
  theatre:   <Theater       className="w-3.5 h-3.5" />,
  boardroom: <Table2        className="w-3.5 h-3.5" />,
  banquet:   <Layers        className="w-3.5 h-3.5" />,
  classroom: <Presentation  className="w-3.5 h-3.5" />,
};

// ── HallCard ───────────────────────────────────────────────────────────────
function HallCard({
  hall, bookings, index, onSelect, selected,
}: {
  hall: ConferenceHall;
  bookings: ConferenceBooking[];
  index: number;
  onSelect: (h: ConferenceHall) => void;
  selected: boolean;
}) {
  const color = hotelColor(hall.hotel_name);
  const gradCls =
    color === "azure"   ? "gradient-azure"
    : color === "emerald" ? "bg-gradient-to-br from-emerald-400 to-emerald-600"
    : "bg-gradient-to-br from-violet-400 to-violet-600";

  const accentBar =
    color === "azure"   ? "gradient-azure"
    : color === "emerald" ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
    : "bg-gradient-to-r from-violet-400 to-violet-600";

  const hotelBadgeCls =
    color === "azure"   ? "bg-azure-50 text-azure-700 border-azure-200"
    : color === "emerald" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : "bg-violet-50 text-violet-700 border-violet-200";

  const hallBookings = bookings.filter((b) => b.hall_id === hall.hall_id);
  const revenue = hallBookings.reduce((s, b) => s + Number(b.total_amount), 0);

  const capacities = [
    { label: "Theatre",   val: hall.capacity_theatre,   icon: <Theater className="w-3 h-3" /> },
    { label: "Boardroom", val: hall.capacity_boardroom,  icon: <Table2  className="w-3 h-3" /> },
    { label: "Banquet",   val: hall.capacity_banquet,    icon: <Layers  className="w-3 h-3" /> },
  ].filter((c) => c.val !== null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      onClick={() => onSelect(hall)}
      className={cn(
        "bg-white rounded-2xl border shadow-premium hover:shadow-premium-lg transition-all duration-300 overflow-hidden cursor-pointer",
        selected ? "border-azure-300 ring-2 ring-azure-200" : "border-slate-100"
      )}
    >
      {/* Accent */}
      <div className={cn("h-[3px] w-full", accentBar)} />

      <div className="p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-800 text-base sm:text-lg leading-tight truncate">
              {hall.hall_name}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full border", hotelBadgeCls)}>
                {hotelShort(hall.hotel_name)}
              </span>
              <span className={cn(
                "text-[10px] font-medium px-2 py-0.5 rounded-full border",
                hall.is_active
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-slate-50 text-slate-500 border-slate-200"
              )}>
                {hall.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", gradCls)}>
            <Building2 className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Capacity pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {capacities.map((c) => (
            <div key={c.label} className="flex items-center gap-1.5 bg-slate-50 rounded-xl px-3 py-1.5">
              <span className="text-slate-400">{c.icon}</span>
              <span className="text-xs text-slate-500">{c.label}</span>
              <span className="text-xs font-bold text-slate-700">{c.val}</span>
            </div>
          ))}
        </div>

        {/* Area + Amenities */}
        <div className="flex flex-wrap items-center gap-3 mb-4 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <LayoutGrid className="w-3.5 h-3.5 text-slate-400" />
            {Number(hall.area_sqft).toLocaleString()} sq ft
          </div>
          {hall.has_wifi && (
            <div className="flex items-center gap-1 text-azure-600">
              <Wifi className="w-3.5 h-3.5" /> WiFi
            </div>
          )}
          {hall.has_av && (
            <div className="flex items-center gap-1 text-azure-600">
              <Monitor className="w-3.5 h-3.5" /> AV Equipment
            </div>
          )}
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-[10px] text-slate-400 mb-0.5">Hourly Rate</p>
            <p className="text-xs font-bold text-slate-700">{formatPKR(hall.hourly_rate)}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-[10px] text-slate-400 mb-0.5">Full Day Rate</p>
            <p className="text-xs font-bold text-slate-700">{formatPKR(hall.full_day_rate)}</p>
          </div>
        </div>

        {/* Footer stats */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-50 text-xs">
          <span className="text-slate-400">
            <span className="font-semibold text-slate-600">{hallBookings.length}</span> booking{hallBookings.length !== 1 ? "s" : ""}
          </span>
          <span className="text-emerald-600 font-semibold">{formatPKR(revenue)}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ── BookingRow ─────────────────────────────────────────────────────────────
function BookingRow({ booking, index }: { booking: ConferenceBooking; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending;
  const color = hotelColor(booking.hotel_name);
  const hotelBadgeCls =
    color === "azure"   ? "bg-azure-50 text-azure-700 border-azure-200"
    : color === "emerald" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : "bg-violet-50 text-violet-700 border-violet-200";

  const hours = differenceInHours(
    new Date(booking.end_datetime), new Date(booking.start_datetime)
  );
  const depositPct = Math.round((Number(booking.deposit_paid) / Number(booking.total_amount)) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-premium overflow-hidden"
    >
      {/* Main row */}
      <div
        className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 sm:p-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Event info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h4 className="font-semibold text-slate-800 text-sm truncate">{booking.event_name}</h4>
            <span className={cn("flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border", status.cls)}>
              <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
              {status.label}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Building2 className="w-3 h-3" /> {booking.hall_name}
            </span>
            <span className="text-slate-200">·</span>
            <span className={cn("px-1.5 py-0.5 rounded-full border text-[10px] font-medium", hotelBadgeCls)}>
              {hotelShort(booking.hotel_name)}
            </span>
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-6 shrink-0">
          <div className="text-xs">
            <p className="text-slate-400 mb-0.5">Date</p>
            <p className="font-semibold text-slate-700">
              {format(new Date(booking.start_datetime), "dd MMM yyyy")}
            </p>
          </div>
          <div className="text-xs">
            <p className="text-slate-400 mb-0.5">Attendees</p>
            <p className="font-semibold text-slate-700 flex items-center gap-1">
              <Users className="w-3 h-3 text-slate-400" /> {booking.attendees}
            </p>
          </div>
          <div className="text-xs">
            <p className="text-slate-400 mb-0.5">Total</p>
            <p className="font-semibold text-slate-700">{formatPKR(booking.total_amount)}</p>
          </div>
          <ChevronRight className={cn("w-4 h-4 text-slate-300 transition-transform shrink-0", expanded && "rotate-90")} />
        </div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 border-t border-slate-50">
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[10px] text-slate-400 mb-1">Contact</p>
                  <p className="text-xs font-semibold text-slate-700">{booking.contact_name}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[10px] text-slate-400 mb-1">Event Type</p>
                  <p className="text-xs font-semibold text-slate-700 capitalize">
                    {EVENT_TYPE_LABELS[booking.event_type] ?? booking.event_type}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[10px] text-slate-400 mb-1">Setup</p>
                  <p className="text-xs font-semibold text-slate-700 capitalize flex items-center gap-1">
                    {SETUP_ICONS[booking.setup_type] ?? null}
                    {booking.setup_type}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[10px] text-slate-400 mb-1">Duration</p>
                  <p className="text-xs font-semibold text-slate-700">{hours}h</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[10px] text-slate-400 mb-1">Time</p>
                  <p className="text-xs font-semibold text-slate-700">
                    {format(new Date(booking.start_datetime), "HH:mm")} – {format(new Date(booking.end_datetime), "HH:mm")}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[10px] text-slate-400 mb-1">Deposit Paid</p>
                  <p className="text-xs font-semibold text-slate-700">{formatPKR(booking.deposit_paid)}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 col-span-2">
                  <p className="text-[10px] text-slate-400 mb-1.5">Deposit Coverage</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${depositPct}%` }}
                        transition={{ duration: 0.8 }}
                        className="h-full bg-emerald-500 rounded-full"
                      />
                    </div>
                    <span className="text-xs font-bold text-emerald-600 shrink-0">{depositPct}%</span>
                  </div>
                </div>
              </div>
              {booking.notes && (
                <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl p-3">
                  <p className="text-xs text-amber-700">{booking.notes}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function ConferencePage() {
  const [halls, setHalls]         = useState<ConferenceHall[]>([]);
  const [bookings, setBookings]   = useState<ConferenceBooking[]>([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState<"halls" | "bookings">("halls");
  const [search, setSearch]       = useState("");
  const [hotelFilter, setHotelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedHall, setSelectedHall] = useState<ConferenceHall | null>(null);
  const [showFilters, setShowFilters]   = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchData = async () => {
    setLoading(true);
    const [hallsRes, bookingsRes] = await Promise.all([
      supabase
        .from("conference_halls")
        .select("*, hotels(hotel_name)")
        .order("hotel_id"),
      supabase
        .from("conference_bookings")
        .select("*, conference_halls(hall_name, hotel_id, hotels(hotel_name))")
        .order("start_datetime", { ascending: false }),
    ]);

    if (!hallsRes.error && hallsRes.data) {
      setHalls(hallsRes.data.map((h: any) => ({
        ...h, hotel_name: h.hotels?.hotel_name ?? "Unknown",
      })));
    }
    if (!bookingsRes.error && bookingsRes.data) {
      setBookings(bookingsRes.data.map((b: any) => ({
        ...b,
        hall_name:  b.conference_halls?.hall_name ?? "Unknown Hall",
        hotel_id:   b.conference_halls?.hotel_id  ?? 0,
        hotel_name: b.conference_halls?.hotels?.hotel_name ?? "Unknown Hotel",
      })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // ── Derived ──
  const totalRevenue  = bookings.reduce((s, b) => s + Number(b.total_amount), 0);
  const totalDeposit  = bookings.reduce((s, b) => s + Number(b.deposit_paid), 0);
  const totalCapacity = halls.reduce((s, h) => s + (h.capacity_theatre ?? h.capacity_banquet ?? 0), 0);
  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;

  const filteredHalls = halls.filter((h) => {
    if (hotelFilter !== "all" && h.hotel_id !== parseInt(hotelFilter)) return false;
    if (search && !h.hall_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const filteredBookings = bookings.filter((b) => {
    if (hotelFilter !== "all" && b.hotel_id !== parseInt(hotelFilter)) return false;
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !b.event_name.toLowerCase().includes(q) &&
        !b.contact_name.toLowerCase().includes(q) &&
        !b.hall_name.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  const statuses = [...new Set(bookings.map((b) => b.status))];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-5 sm:space-y-6">

        {/* PAGE HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3"
        >
          <div className="flex items-start gap-3 min-w-0">
            <PagePurposeAvatar variant="conference" size={44} className="shrink-0 mt-0.5" />
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-gradient-azure leading-tight">
                Conference &amp; Events
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                Manage halls, bookings, and events across all properties
              </p>
            </div>
          </div>
          <button className="flex items-center gap-2 gradient-azure text-white px-4 py-2.5 rounded-xl font-medium text-sm shadow-azure hover:shadow-azure-lg transition-all self-start xs:self-auto shrink-0">
            <Plus className="w-4 h-4" />
            <span>New Booking</span>
          </button>
        </motion.div>

        {/* SUMMARY STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            {
              label: "Conference Halls", value: halls.length, sub: `${halls.filter(h=>h.is_active).length} active`,
              subColor: "text-azure-500", icon: <Building2 className="w-4 h-4 text-white" />,
              bg: "gradient-azure", delay: 0.05,
            },
            {
              label: "Total Bookings", value: bookings.length, sub: `${confirmedCount} confirmed`,
              subColor: "text-emerald-600", icon: <Calendar className="w-4 h-4 text-white" />,
              bg: "bg-emerald-500", delay: 0.1,
            },
            {
              label: "Total Revenue", value: formatPKR(totalRevenue), sub: `${formatPKR(totalDeposit)} deposited`,
              subColor: "text-violet-600", icon: <TrendingUp className="w-4 h-4 text-white" />,
              bg: "bg-violet-500", delay: 0.15,
            },
            {
              label: "Max Capacity", value: totalCapacity.toLocaleString(), sub: "combined seats",
              subColor: "text-amber-600", icon: <Users className="w-4 h-4 text-white" />,
              bg: "bg-amber-400", delay: 0.2,
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: stat.delay }}
              className={cn(
                "bg-white rounded-2xl p-4 sm:p-5 shadow-premium border border-slate-100",
                i === 2 ? "col-span-2 lg:col-span-1" : ""
              )}
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0", stat.bg)}>
                  {stat.icon}
                </div>
              </div>
              <p className={cn(
                "font-bold text-slate-800",
                typeof stat.value === "string" && stat.value.length > 10
                  ? "text-lg sm:text-xl"
                  : "text-2xl sm:text-3xl"
              )}>
                {stat.value}
              </p>
              <p className={cn("text-xs mt-1", stat.subColor)}>{stat.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* TABS */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex bg-white rounded-2xl border border-slate-100 shadow-premium p-1 gap-1 w-full sm:w-fit"
        >
          {(["halls", "bookings"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2 rounded-xl text-sm font-medium capitalize transition-all",
                activeTab === tab
                  ? "gradient-azure text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {tab === "halls" ? <Building2 className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
              {tab === "halls" ? `Halls (${halls.length})` : `Bookings (${bookings.length})`}
            </button>
          ))}
        </motion.div>

        {/* SEARCH + FILTERS */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
          <div className="flex gap-2 sm:gap-3 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={activeTab === "halls" ? "Search halls..." : "Search events, contacts..."}
                className="w-full pl-9 pr-8 py-2.5 bg-white rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-azure-200 shadow-sm"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-xl border text-sm font-medium transition-all shrink-0",
                showFilters
                  ? "gradient-azure text-white border-transparent"
                  : "bg-white border-slate-200 text-slate-600 hover:border-azure-300"
              )}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showFilters && "rotate-180")} />
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-2 mb-3 overflow-hidden"
              >
                <select value={hotelFilter} onChange={(e) => setHotelFilter(e.target.value)}
                  className="text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-600 focus:outline-none focus:ring-2 focus:ring-azure-200 flex-1 min-w-[140px]">
                  <option value="all">All Hotels</option>
                  <option value="1">Karachi</option>
                  <option value="2">Lahore</option>
                  <option value="3">Islamabad</option>
                </select>
                {activeTab === "bookings" && (
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                    className="text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-600 focus:outline-none focus:ring-2 focus:ring-azure-200 flex-1 min-w-[130px]">
                    <option value="all">All Statuses</option>
                    {statuses.map((s) => (
                      <option key={s} value={s}>{STATUS_CONFIG[s]?.label ?? s}</option>
                    ))}
                  </select>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-xs text-slate-400">
            Showing{" "}
            <span className="font-semibold text-slate-600">
              {activeTab === "halls" ? filteredHalls.length : filteredBookings.length}
            </span>{" "}
            {activeTab === "halls" ? "halls" : "bookings"}
          </p>
        </motion.div>

        {/* CONTENT */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <RefreshCw className="w-6 h-6 text-azure-400 animate-spin" />
            <span className="text-slate-400 text-sm">Loading conference data...</span>
          </div>
        ) : (
          <AnimatePresence mode="wait">

            {/* HALLS TAB */}
            {activeTab === "halls" && (
              <motion.div
                key="halls"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                {filteredHalls.length === 0 ? (
                  <div className="text-center py-16">
                    <Building2 className="w-12 h-12 mx-auto mb-3 text-slate-200" />
                    <p className="text-slate-400">No halls found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
                    {filteredHalls.map((hall, i) => (
                      <HallCard
                        key={hall.hall_id}
                        hall={hall}
                        bookings={bookings}
                        index={i}
                        onSelect={setSelectedHall}
                        selected={selectedHall?.hall_id === hall.hall_id}
                      />
                    ))}
                  </div>
                )}

                {/* Hall detail panel */}
                <AnimatePresence>
                  {selectedHall && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="mt-6 bg-white rounded-2xl border border-slate-100 shadow-premium-lg overflow-hidden"
                    >
                      <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-50">
                        <h3 className="font-bold text-slate-800">
                          Bookings for {selectedHall.hall_name}
                        </h3>
                        <button
                          onClick={() => setSelectedHall(null)}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                        >
                          <X className="w-3.5 h-3.5 text-slate-500" />
                        </button>
                      </div>
                      <div className="p-4 sm:p-5 space-y-3">
                        {bookings.filter((b) => b.hall_id === selectedHall.hall_id).length === 0 ? (
                          <p className="text-sm text-slate-400 text-center py-8">
                            No bookings for this hall yet.
                          </p>
                        ) : (
                          bookings
                            .filter((b) => b.hall_id === selectedHall.hall_id)
                            .map((b, i) => <BookingRow key={b.conf_booking_id} booking={b} index={i} />)
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* BOOKINGS TAB */}
            {activeTab === "bookings" && (
              <motion.div
                key="bookings"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-3"
              >
                {filteredBookings.length === 0 ? (
                  <div className="text-center py-16">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-200" />
                    <p className="text-slate-400">No bookings found</p>
                  </div>
                ) : (
                  filteredBookings.map((booking, i) => (
                    <BookingRow key={booking.conf_booking_id} booking={booking} index={i} />
                  ))
                )}
              </motion.div>
            )}

          </AnimatePresence>
        )}

      </div>
    </div>
  );
}