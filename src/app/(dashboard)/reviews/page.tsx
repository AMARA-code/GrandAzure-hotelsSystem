"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, Search, MessageSquare, Reply, Award, Building2,
  BarChart3, Smile, Meh, Frown, TrendingUp, Filter,
  CheckCircle2, Clock, RefreshCw, ChevronDown, Send, X,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils/cn";
import { createBrowserClient } from "@supabase/ssr";
import { PagePurposeAvatar } from "@/components/layout/PagePurposeAvatar";

// ── Types ──────────────────────────────────────────────────────────────────
interface Review {
  review_id: number;
  hotel_id: number;
  guest_id: number;
  overall_rating: number;
  cleanliness_rating: number;
  service_rating: number;
  location_rating: number;
  value_rating: number;
  title: string;
  review_text: string;
  response_text: string | null;
  responded_at: string | null;
  platform: string;
  is_verified: boolean;
  is_published: boolean;
  created_at: string;
  first_name: string;
  last_name: string;
  hotel_name: string;
}

// One card groups all reviews from the same guest
interface GuestReviewGroup {
  guest_id: number;
  first_name: string;
  last_name: string;
  is_verified: boolean;
  reviews: Review[];
}

// ── Helpers ────────────────────────────────────────────────────────────────
const hotelColor = (name: string): "azure" | "emerald" | "violet" =>
  name.includes("Karachi") ? "azure" : name.includes("Lahore") ? "emerald" : "violet";

const hotelShort = (name: string): string =>
  name.includes("Karachi") ? "Karachi" : name.includes("Lahore") ? "Lahore" : "Islamabad";

const getSentiment = (r: number): "positive" | "neutral" | "negative" =>
  r >= 8 ? "positive" : r >= 6 ? "neutral" : "negative";

const PLATFORM_LABEL: Record<string, string> = {
  direct: "Direct", google: "Google", tripadvisor: "TripAdvisor",
  booking_com: "Booking.com", expedia: "Expedia",
};

const PLATFORM_COLORS: Record<string, string> = {
  direct:       "bg-amber-50 text-amber-700 border-amber-200",
  google:       "bg-blue-50 text-blue-700 border-blue-200",
  tripadvisor:  "bg-emerald-50 text-emerald-700 border-emerald-200",
  booking_com:  "bg-indigo-50 text-indigo-700 border-indigo-200",
  expedia:      "bg-yellow-50 text-yellow-700 border-yellow-200",
};

/** Group flat review array by guest_id, preserving sort order of first review */
function groupByGuest(reviews: Review[]): GuestReviewGroup[] {
  const map = new Map<number, GuestReviewGroup>();
  for (const r of reviews) {
    if (!map.has(r.guest_id)) {
      map.set(r.guest_id, {
        guest_id: r.guest_id,
        first_name: r.first_name,
        last_name: r.last_name,
        is_verified: r.is_verified,
        reviews: [],
      });
    }
    map.get(r.guest_id)!.reviews.push(r);
  }
  return Array.from(map.values());
}

// ── StarRating ─────────────────────────────────────────────────────────────
function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const sz = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  const starValue = Math.round(rating / 2);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(sz, s <= starValue
            ? "text-gold-500 fill-gold-500"
            : "text-slate-200 fill-slate-200"
          )}
        />
      ))}
    </div>
  );
}

// ── RatingBar ──────────────────────────────────────────────────────────────
function RatingBar({ label, value }: { label: string; value: number }) {
  const pct = (value / 10) * 100;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-400 w-20 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-azure-400 to-azure-600"
        />
      </div>
      <span className="text-xs font-semibold text-slate-700 w-8 shrink-0 text-right">{value}/10</span>
    </div>
  );
}

// ── SingleReviewPanel ──────────────────────────────────────────────────────
// Renders one review's details inside the grouped card
function SingleReviewPanel({
  review,
  onReplySubmit,
}: {
  review: Review;
  onReplySubmit: (id: number, text: string) => Promise<void>;
}) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText]           = useState("");
  const [submitting, setSubmitting]         = useState(false);
  const [expanded, setExpanded]             = useState(false);

  const color     = hotelColor(review.hotel_name);
  const sentiment = getSentiment(review.overall_rating);
  const isLong    = review.review_text.length > 110;

  const hotelBadgeCls =
    color === "azure"   ? "bg-azure-50 text-azure-700 border-azure-200"
    : color === "emerald" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : "bg-violet-50 text-violet-700 border-violet-200";

  const sentimentConfig: Record<
    "positive" | "neutral" | "negative",
    { icon: React.ReactNode; cls: string }
  > = {
    positive: { icon: <Smile className="w-3.5 h-3.5" />, cls: "text-emerald-600 bg-emerald-50 border border-emerald-100" },
    neutral:  { icon: <Meh   className="w-3.5 h-3.5" />, cls: "text-amber-600  bg-amber-50  border border-amber-100"  },
    negative: { icon: <Frown className="w-3.5 h-3.5" />, cls: "text-rose-600   bg-rose-50   border border-rose-100"   },
  };

  const handleSubmit = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    await onReplySubmit(review.review_id, replyText);
    setReplyText("");
    setShowReplyInput(false);
    setSubmitting(false);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Branch + platform + rating + date */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1">
          <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full border", hotelBadgeCls)}>
            {hotelShort(review.hotel_name)}
          </span>
          <span className={cn(
            "text-[10px] font-medium px-2 py-0.5 rounded-full border",
            PLATFORM_COLORS[review.platform] ?? "bg-slate-50 text-slate-600 border-slate-200"
          )}>
            {PLATFORM_LABEL[review.platform] ?? review.platform}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <StarRating rating={review.overall_rating} size="sm" />
          <span className="text-xs font-bold text-slate-700">{review.overall_rating}/10</span>
          <span className="text-[10px] text-slate-400">
            · {format(new Date(review.created_at), "dd MMM yyyy")}
          </span>
        </div>
      </div>

      {/* Review text */}
      <div>
        <h4 className="font-semibold text-slate-800 text-sm mb-1">{review.title}</h4>
        <p className={cn("text-sm text-slate-500 leading-relaxed", !expanded && "line-clamp-2")}>
          {review.review_text}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-azure-500 hover:text-azure-700 mt-0.5 font-medium"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </div>

      {/* Sub-ratings */}
      <div className="bg-slate-50/70 rounded-xl p-3 space-y-2">
        <RatingBar label="Cleanliness" value={review.cleanliness_rating} />
        <RatingBar label="Service"     value={review.service_rating} />
        <RatingBar label="Location"    value={review.location_rating} />
        <RatingBar label="Value"       value={review.value_rating} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className={cn(
          "flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full capitalize",
          sentimentConfig[sentiment].cls
        )}>
          {sentimentConfig[sentiment].icon} {sentiment}
        </span>
        <button
          onClick={() => setShowReplyInput(!showReplyInput)}
          className="flex items-center gap-1.5 text-xs font-medium text-azure-600 hover:text-azure-800 transition-colors"
        >
          <Reply className="w-3.5 h-3.5" />
          {review.response_text ? "View Reply" : "Reply"}
        </button>
      </div>

      {/* Existing reply */}
      <AnimatePresence>
        {review.response_text && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-azure-50 border border-azure-100 rounded-xl p-3"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 gradient-azure rounded-full flex items-center justify-center shrink-0">
                <Building2 className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs font-semibold text-azure-700">Management Response</span>
              {review.responded_at && (
                <span className="text-[10px] text-slate-400 ml-auto">
                  {format(new Date(review.responded_at), "dd MMM yyyy")}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{review.response_text}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reply input */}
      <AnimatePresence>
        {showReplyInput && !review.response_text && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <textarea
              value={replyText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReplyText(e.target.value)}
              placeholder="Write a management response..."
              rows={3}
              className="w-full text-sm border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-azure-200 resize-none"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setShowReplyInput(false)}
                className="text-xs px-3 py-1.5 text-slate-500 hover:text-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !replyText.trim()}
                className="flex items-center gap-1.5 text-xs px-4 py-1.5 gradient-azure text-white rounded-lg font-medium disabled:opacity-50"
              >
                {submitting
                  ? <RefreshCw className="w-3 h-3 animate-spin" />
                  : <Send className="w-3 h-3" />
                }
                Post Reply
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── GuestReviewCard ────────────────────────────────────────────────────────
// One card per guest; if they reviewed multiple branches, tabs appear at the top
function GuestReviewCard({
  group,
  index,
  onReplySubmit,
}: {
  group: GuestReviewGroup;
  index: number;
  onReplySubmit: (id: number, text: string) => Promise<void>;
}) {
  const [activeTab, setActiveTab] = useState(0);

  const { reviews } = group;
  const activeReview = reviews[activeTab];

  // Accent color driven by the currently-visible review's hotel
  const color = hotelColor(activeReview.hotel_name);

  const avatarGrad =
    color === "azure"   ? "from-azure-400 to-azure-600"
    : color === "emerald" ? "from-emerald-400 to-emerald-600"
    : "from-violet-400 to-violet-600";

  const accentBar =
    color === "azure"   ? "gradient-azure"
    : color === "emerald" ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
    : "bg-gradient-to-r from-violet-400 to-violet-600";

  const tabActiveCls = (r: Review) => {
    const c = hotelColor(r.hotel_name);
    return c === "azure"
      ? "bg-azure-50 text-azure-700 border-azure-300"
      : c === "emerald"
      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
      : "bg-violet-50 text-violet-700 border-violet-300";
  };

  const initials = `${group.first_name[0]}${group.last_name[0]}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.055, duration: 0.4 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-premium hover:shadow-premium-lg transition-shadow duration-300 overflow-hidden flex flex-col"
    >
      {/* Accent strip — reacts to active tab's hotel */}
      <div className={cn("h-[3px] w-full shrink-0", accentBar)} />

      <div className="p-4 sm:p-5 flex flex-col flex-1 gap-3">

        {/* ── Guest header ── */}
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-9 h-9 rounded-full shrink-0 flex items-center justify-center",
            "text-white text-sm font-bold bg-gradient-to-br", avatarGrad
          )}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
              <span className="font-semibold text-slate-800 text-sm leading-none">
                {group.first_name} {group.last_name}
              </span>
              {group.is_verified && (
                <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full shrink-0">
                  <Award className="w-2.5 h-2.5" /> Verified
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400">
              {reviews.length} review{reviews.length > 1 ? "s" : ""} · {reviews.length > 1 ? "multiple branches" : hotelShort(reviews[0].hotel_name)}
            </p>
          </div>
        </div>

        {/* ── Branch tabs (only shown when guest reviewed multiple hotels) ── */}
        {reviews.length > 1 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {reviews.map((r, i) => (
              <button
                key={r.review_id}
                onClick={() => setActiveTab(i)}
                className={cn(
                  "text-[10px] font-medium px-2.5 py-1 rounded-full border transition-all",
                  activeTab === i
                    ? tabActiveCls(r)
                    : "bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300"
                )}
              >
                {hotelShort(r.hotel_name)}
                {r.response_text && (
                  <span className="ml-1 inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full align-middle" title="Replied" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* ── Divider between tabs and review ── */}
        {reviews.length > 1 && (
          <div className="border-t border-slate-50" />
        )}

        {/* ── Active review panel ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeReview.review_id}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.2 }}
          >
            <SingleReviewPanel
              review={activeReview}
              onReplySubmit={onReplySubmit}
            />
          </motion.div>
        </AnimatePresence>

        {/* ── Tab navigation arrows (optional, for many branches) ── */}
        {reviews.length > 2 && (
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => setActiveTab((t) => Math.max(0, t - 1))}
              disabled={activeTab === 0}
              className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>
            <span className="text-[10px] text-slate-300">
              {activeTab + 1} / {reviews.length}
            </span>
            <button
              onClick={() => setActiveTab((t) => Math.min(reviews.length - 1, t + 1))}
              disabled={activeTab === reviews.length - 1}
              className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-colors"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function ReviewsPage() {
  const [reviews, setReviews]                 = useState<Review[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [search, setSearch]                   = useState("");
  const [hotelFilter, setHotelFilter]         = useState("all");
  const [platformFilter, setPlatformFilter]   = useState("all");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [sortBy, setSortBy]                   = useState<"date" | "rating">("date");
  const [showFilters, setShowFilters]         = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reviews")
      .select(`
        review_id, hotel_id, guest_id,
        overall_rating, cleanliness_rating, service_rating,
        location_rating, value_rating, title, review_text,
        response_text, responded_at, platform,
        is_verified, is_published, created_at,
        guests(first_name, last_name),
        hotels(hotel_name)
      `)
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setReviews(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.map((r: any) => ({
          ...r,
          first_name: r.guests?.first_name ?? "Guest",
          last_name:  r.guests?.last_name  ?? "",
          hotel_name: r.hotels?.hotel_name ?? "Unknown",
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => { fetchReviews(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleReplySubmit = async (reviewId: number, text: string): Promise<void> => {
    const { error } = await supabase
      .from("reviews")
      .update({ response_text: text, responded_at: new Date().toISOString() })
      .eq("review_id", reviewId);
    if (!error) {
      setReviews((prev: Review[]) =>
        prev.map((r: Review) =>
          r.review_id === reviewId
            ? { ...r, response_text: text, responded_at: new Date().toISOString() }
            : r
        )
      );
    }
  };

  // ── Derived stats ──
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.overall_rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  const sentimentCounts = {
    positive: reviews.filter((r) => getSentiment(r.overall_rating) === "positive").length,
    neutral:  reviews.filter((r) => getSentiment(r.overall_rating) === "neutral").length,
    negative: reviews.filter((r) => getSentiment(r.overall_rating) === "negative").length,
  };

  const repliedCount  = reviews.filter((r) => r.response_text).length;
  const responseRate  = reviews.length ? Math.round((repliedCount / reviews.length) * 100) : 0;
  const pendingCount  = reviews.length - repliedCount;
  const positiveRate  = reviews.length
    ? Math.round((sentimentCounts.positive / reviews.length) * 100)
    : 0;

  const hotelStats = [
    { hotel_id: 1, hotel_name: "Grand Azure Karachi",      color: "azure"   },
    { hotel_id: 2, hotel_name: "Grand Azure Lahore",       color: "emerald" },
    { hotel_id: 3, hotel_name: "Azure Boutique Islamabad", color: "violet"  },
  ].map((h) => {
    const hr = reviews.filter((r) => r.hotel_id === h.hotel_id);
    return {
      ...h,
      total: hr.length,
      avg_rating: hr.length
        ? parseFloat((hr.reduce((s, r) => s + r.overall_rating, 0) / hr.length).toFixed(1))
        : 0,
    };
  });

  const platforms = [...new Set(reviews.map((r) => r.platform))];

  // ── Filter individual reviews first, then group ──
  const filteredReviews = reviews.filter((r) => {
    if (hotelFilter !== "all" && r.hotel_id !== parseInt(hotelFilter)) return false;
    if (platformFilter !== "all" && r.platform !== platformFilter) return false;
    if (sentimentFilter !== "all" && getSentiment(r.overall_rating) !== sentimentFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !r.review_text.toLowerCase().includes(q) &&
        !r.title.toLowerCase().includes(q) &&
        !`${r.first_name} ${r.last_name}`.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  // Sort individual reviews before grouping so tabs are ordered correctly
  const sortedReviews = [...filteredReviews].sort((a, b) =>
    sortBy === "rating"
      ? b.overall_rating - a.overall_rating
      : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Group by guest — preserves outer sort order (first review of each guest determines card position)
  const guestGroups = groupByGuest(sortedReviews);

  const hasFilters =
    hotelFilter !== "all" || platformFilter !== "all" ||
    sentimentFilter !== "all" || search !== "";

  // ── Render ──
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
            <PagePurposeAvatar variant="reviews" size={44} className="shrink-0 mt-0.5" />
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-gradient-azure leading-tight">
                Guest Reviews
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                Monitor and respond to guest feedback across all properties
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl shadow-premium border border-slate-100 self-start xs:self-auto shrink-0">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-gold-500 fill-gold-500" />
            <span className="text-xl sm:text-2xl font-bold text-slate-800">{avgRating}</span>
            <span className="text-xs text-slate-400">/10 avg</span>
          </div>
        </motion.div>

        {/* SUMMARY STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            {
              label: "Total Reviews", value: reviews.length, sub: "Across 3 properties",
              subColor: "text-azure-500", icon: <MessageSquare className="w-4 h-4 text-white" />,
              bg: "gradient-azure", delay: 0.05,
            },
            {
              label: "Response Rate", value: `${responseRate}%`, sub: `${repliedCount} replied`,
              subColor: "text-emerald-600", icon: <CheckCircle2 className="w-4 h-4 text-white" />,
              bg: "bg-emerald-500", delay: 0.1, progress: responseRate,
            },
            {
              label: "Awaiting Reply", value: pendingCount, sub: "Needs attention",
              subColor: "text-amber-600", icon: <Clock className="w-4 h-4 text-white" />,
              bg: "bg-amber-400", delay: 0.15,
            },
            {
              label: "Positive Rate", value: `${positiveRate}%`, sub: `${sentimentCounts.positive} positive`,
              subColor: "text-violet-600", icon: <Smile className="w-4 h-4 text-white" />,
              bg: "bg-violet-500", delay: 0.2,
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: stat.delay }}
              className={cn(
                "bg-white rounded-2xl p-4 sm:p-5 shadow-premium border border-slate-100",
                i === 0 ? "col-span-2 lg:col-span-1" : ""
              )}
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0", stat.bg)}>
                  {stat.icon}
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-800">{stat.value}</p>
              {"progress" in stat && (
                <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.progress}%` }}
                    transition={{ delay: 0.7, duration: 0.9 }}
                    className="h-full bg-emerald-500 rounded-full"
                  />
                </div>
              )}
              <p className={cn("text-xs mt-1", stat.subColor)}>{stat.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* HOTEL SCORE CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {hotelStats.map((hotel, i) => {
            const gradCls =
              hotel.color === "azure"   ? "gradient-azure"
              : hotel.color === "emerald" ? "bg-gradient-to-br from-emerald-400 to-emerald-600"
              : "bg-gradient-to-br from-violet-400 to-violet-600";
            return (
              <motion.div
                key={hotel.hotel_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.07 }}
                className="bg-white rounded-2xl p-4 sm:p-5 shadow-premium border border-slate-100"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-slate-400 truncate pr-2">{hotel.hotel_name}</p>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-2xl sm:text-3xl font-bold text-slate-800">{hotel.avg_rating}</span>
                      <span className="text-xs text-slate-400">/10</span>
                    </div>
                  </div>
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", gradCls)}>
                    <Star className="w-4 h-4 text-white fill-white" />
                  </div>
                </div>
                <StarRating rating={hotel.avg_rating} size="sm" />
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                  <span className="text-xs text-slate-400">{hotel.total} review{hotel.total !== 1 ? "s" : ""}</span>
                  <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Active
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* SENTIMENT BREAKDOWN */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-4 sm:p-5 shadow-premium border border-slate-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-azure-500" />
            <h3 className="font-semibold text-slate-700 text-sm">Sentiment Breakdown</h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            {[
              { label: "Positive", count: sentimentCounts.positive, bar: "bg-emerald-500", text: "text-emerald-600", icon: <Smile className="w-3.5 h-3.5" /> },
              { label: "Neutral",  count: sentimentCounts.neutral,  bar: "bg-amber-400",   text: "text-amber-600",  icon: <Meh   className="w-3.5 h-3.5" /> },
              { label: "Negative", count: sentimentCounts.negative, bar: "bg-rose-500",    text: "text-rose-600",   icon: <Frown className="w-3.5 h-3.5" /> },
            ].map((s) => {
              const pct = reviews.length ? Math.round((s.count / reviews.length) * 100) : 0;
              return (
                <div key={s.label} className="flex-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={cn("flex items-center gap-1 text-xs font-medium", s.text)}>
                      {s.icon} {s.label}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {s.count} <span className="text-slate-400 font-normal">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.6, duration: 0.9, ease: "easeOut" }}
                      className={cn("h-full rounded-full", s.bar)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* FILTERS */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
          <div className="flex gap-2 sm:gap-3 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                placeholder="Search reviews..."
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
                  ? "gradient-azure text-white border-transparent shadow-azure"
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
                <select
                  value={hotelFilter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setHotelFilter(e.target.value)}
                  className="text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-600 focus:outline-none focus:ring-2 focus:ring-azure-200 flex-1 min-w-[140px]"
                >
                  <option value="all">All Hotels</option>
                  <option value="1">Karachi</option>
                  <option value="2">Lahore</option>
                  <option value="3">Islamabad</option>
                </select>
                <select
                  value={platformFilter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPlatformFilter(e.target.value)}
                  className="text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-600 focus:outline-none focus:ring-2 focus:ring-azure-200 flex-1 min-w-[130px]"
                >
                  <option value="all">All Platforms</option>
                  {platforms.map((p: string) => (
                    <option key={p} value={p}>{PLATFORM_LABEL[p] ?? p}</option>
                  ))}
                </select>
                <select
                  value={sentimentFilter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSentimentFilter(e.target.value)}
                  className="text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-600 focus:outline-none focus:ring-2 focus:ring-azure-200 flex-1 min-w-[130px]"
                >
                  <option value="all">All Sentiments</option>
                  <option value="positive">Positive (8–10)</option>
                  <option value="neutral">Neutral (6–7)</option>
                  <option value="negative">Negative (1–5)</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value as "date" | "rating")}
                  className="text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-600 focus:outline-none focus:ring-2 focus:ring-azure-200 flex-1 min-w-[130px]"
                >
                  <option value="date">Latest First</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Showing <span className="font-semibold text-slate-600">{guestGroups.length}</span> guest
              {guestGroups.length !== 1 ? "s" : ""}{" "}
              <span className="text-slate-300">·</span>{" "}
              <span className="font-semibold text-slate-600">{filteredReviews.length}</span> review
              {filteredReviews.length !== 1 ? "s" : ""}
            </p>
            {hasFilters && (
              <button
                onClick={() => {
                  setHotelFilter("all");
                  setPlatformFilter("all");
                  setSentimentFilter("all");
                  setSearch("");
                }}
                className="text-xs text-rose-500 hover:text-rose-700 font-medium transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        </motion.div>

        {/* REVIEWS GRID — grouped by guest */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <RefreshCw className="w-6 h-6 text-azure-400 animate-spin" />
            <span className="text-slate-400 text-sm">Loading reviews...</span>
          </div>
        ) : guestGroups.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-200" />
            <p className="text-slate-500 font-medium">No reviews match your filters</p>
            <p className="text-slate-300 text-sm mt-1">Try adjusting or clearing your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {guestGroups.map((group, i) => (
                <GuestReviewCard
                  key={group.guest_id}
                  group={group}
                  index={i}
                  onReplySubmit={handleReplySubmit}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

      </div>
    </div>
  );
}