"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Users, Wifi, Monitor, Calendar, Clock,
  ChevronDown, Search, Filter, RefreshCw, X, Plus,
  MapPin, DollarSign, CheckCircle2, Circle, Layers,
  LayoutGrid, List, TrendingUp, Star, ChevronRight,
  Theater, Table2, Presentation, AlertCircle,
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

interface NewBookingForm {
  hall_id: string;
  contact_email: string;
  contact_name: string;
  event_name: string;
  event_type: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  attendees: string;
  setup_type: string;
  status: string;
  total_amount: string;
  deposit_paid: string;
  notes: string;
}

const EMPTY_FORM: NewBookingForm = {
  hall_id: "",
  contact_email: "",
  contact_name: "",
  event_name: "",
  event_type: "conference",
  start_date: "",
  start_time: "09:00",
  end_date: "",
  end_time: "17:00",
  attendees: "",
  setup_type: "theatre",
  status: "confirmed",
  total_amount: "",
  deposit_paid: "",
  notes: "",
};

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

// ── Cross-midnight safe duration helper ────────────────────────────────────
/**
 * Returns the number of hours between start and end datetimes.
 * If end <= start (cross-midnight scenario), adds 24h to end before diffing.
 */
function safeDurationHours(
  startDate: string, startTime: string,
  endDate: string,   endTime: string
): number {
  const start = new Date(`${startDate}T${startTime}`);
  let   end   = new Date(`${endDate}T${endTime}`);
  // Cross-midnight: end is earlier than or equal to start on the same wall-clock
  if (end <= start) end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
  return differenceInHours(end, start);
}

/**
 * Same helper but accepts full ISO datetime strings (as stored in DB).
 */
function safeDurationHoursFromISO(startISO: string, endISO: string): number {
  const start = new Date(startISO);
  let   end   = new Date(endISO);
  if (end <= start) end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
  return differenceInHours(end, start);
}

// ── Form Field ─────────────────────────────────────────────────────────────
function Field({
  label, required, children, error,
}: { label: string; required?: boolean; children: React.ReactNode; error?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-600">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-[10px] text-rose-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-azure-200 focus:border-azure-300 transition-all placeholder:text-slate-300";

// ── New Booking Modal ──────────────────────────────────────────────────────
function NewBookingModal({
  halls,
  onClose,
  onSuccess,
}: {
  halls: ConferenceHall[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState<NewBookingForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof NewBookingForm, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [step, setStep] = useState<1 | 2>(1);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const set = (key: keyof NewBookingForm, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  // Auto-fill total amount based on hall rates when hall / dates change
  // FIX: uses safeDurationHours to handle cross-midnight events correctly
  useEffect(() => {
    if (!form.hall_id || !form.start_date || !form.start_time || !form.end_date || !form.end_time) return;
    const hall = halls.find((h) => h.hall_id === parseInt(form.hall_id));
    if (!hall) return;

    const hours = safeDurationHours(form.start_date, form.start_time, form.end_date, form.end_time);
    if (hours <= 0) return;

    const amount = hours >= 8
      ? Number(hall.full_day_rate)
      : hours * Number(hall.hourly_rate);

    setForm((f) => ({
      ...f,
      total_amount: Math.round(amount).toString(),
      deposit_paid: f.deposit_paid || Math.round(amount * 0.25).toString(),
    }));
  }, [form.hall_id, form.start_date, form.start_time, form.end_date, form.end_time]);

  const validateStep1 = () => {
    const e: typeof errors = {};
    if (!form.hall_id)       e.hall_id = "Please select a hall";
    if (!form.contact_name.trim()) e.contact_name = "Contact name is required";
    if (!form.event_name.trim())   e.event_name = "Event name is required";
    if (!form.contact_email.trim()) e.contact_email = "Contact email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email.trim())) {
      e.contact_email = "Enter a valid email";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: typeof errors = {};
    if (!form.start_date) e.start_date = "Required";
    if (!form.end_date)   e.end_date = "Required";
    if (form.start_date && form.end_date) {
      // FIX: use safeDurationHours so cross-midnight is valid
      const hours = safeDurationHours(form.start_date, form.start_time, form.end_date, form.end_time);
      if (hours <= 0) e.end_date = "End must be after start";
    }
    if (!form.attendees || parseInt(form.attendees) < 1) e.attendees = "Enter number of attendees";
    if (!form.total_amount || Number(form.total_amount) <= 0) e.total_amount = "Enter total amount";
    if (!form.deposit_paid) e.deposit_paid = "Enter deposit amount";
    if (Number(form.deposit_paid) > Number(form.total_amount)) {
      e.deposit_paid = "Deposit cannot exceed total";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const nameParts = form.contact_name.trim().split(/\s+/).filter(Boolean);
      const firstName = nameParts[0] ?? "Guest";
      const lastName = nameParts.slice(1).join(" ") || firstName;
      const emailNorm = form.contact_email.trim().toLowerCase();

      const { data: existingGuest, error: lookErr } = await supabase
        .from("guests")
        .select("guest_id")
        .eq("email", emailNorm)
        .maybeSingle();

      if (lookErr) throw lookErr;

      let guestIdNum: number;
      if (existingGuest?.guest_id != null) {
        guestIdNum = existingGuest.guest_id;
        const { error: updErr } = await supabase
          .from("guests")
          .update({ first_name: firstName, last_name: lastName })
          .eq("guest_id", guestIdNum);
        if (updErr) throw updErr;
      } else {
        const { data: inserted, error: insErr } = await supabase
          .from("guests")
          .insert({
            first_name: firstName,
            last_name: lastName,
            email: emailNorm,
            phone: "+92-000-0000000",
            vip_status: "none",
            marketing_opt_in: false,
          })
          .select("guest_id")
          .single();
        if (insErr || !inserted) {
          setSubmitError(insErr?.message ?? "Could not create guest profile.");
          return;
        }
        guestIdNum = inserted.guest_id;
      }

      const start_datetime = `${form.start_date}T${form.start_time}:00`;
      const end_datetime   = `${form.end_date}T${form.end_time}:00`;

      const { error } = await supabase.from("conference_bookings").insert({
        hall_id:        parseInt(form.hall_id),
        guest_id:       guestIdNum,
        contact_name:   form.contact_name.trim(),
        event_name:     form.event_name.trim(),
        event_type:     form.event_type,
        start_datetime,
        end_datetime,
        attendees:      parseInt(form.attendees),
        setup_type:     form.setup_type,
        status:         form.status,
        total_amount:   parseFloat(form.total_amount),
        deposit_paid:   parseFloat(form.deposit_paid),
        notes:          form.notes.trim() || null,
      });

      if (error) throw error;
      onSuccess();
    } catch (err: any) {
      setSubmitError(err?.message ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedHall = halls.find((h) => h.hall_id === parseInt(form.hall_id));

  // FIX: compute preview hours safely for display in step 2
  const previewHours =
    form.start_date && form.end_date && form.start_time && form.end_time
      ? safeDurationHours(form.start_date, form.start_time, form.end_date, form.end_time)
      : 0;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
      />

      {/* Modal */}
      <motion.div
        key="modal"
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-xl max-h-[90vh] flex flex-col pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl gradient-azure flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800 text-sm">New Conference Booking</h2>
                <p className="text-[11px] text-slate-400">
                  Step {step} of 2 — {step === 1 ? "Event Details" : "Schedule & Pricing"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
            >
              <X className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex gap-1 px-5 pt-4 shrink-0">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={cn(
                  "h-1 flex-1 rounded-full transition-all duration-500",
                  s <= step ? "gradient-azure" : "bg-slate-100"
                )}
              />
            ))}
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1 px-5 py-5">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {/* Hall Selection */}
                  <Field label="Conference Hall" required error={errors.hall_id}>
                    <select
                      value={form.hall_id}
                      onChange={(e) => set("hall_id", e.target.value)}
                      className={cn(inputCls, !form.hall_id && "text-slate-400")}
                    >
                      <option value="">Select a hall...</option>
                      {halls.filter((h) => h.is_active).map((h) => (
                        <option key={h.hall_id} value={h.hall_id}>
                          {h.hall_name} — {hotelShort(h.hotel_name)}
                        </option>
                      ))}
                    </select>
                  </Field>

                  {/* Hall preview */}
                  {selectedHall && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="bg-azure-50 border border-azure-100 rounded-xl p-3 overflow-hidden"
                    >
                      <div className="flex flex-wrap gap-3 text-xs text-azure-700">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          Theatre: {selectedHall.capacity_theatre ?? "–"}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {formatPKR(selectedHall.hourly_rate)}/hr
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {formatPKR(selectedHall.full_day_rate)}/day
                        </span>
                        {selectedHall.has_wifi && <span className="flex items-center gap-1"><Wifi className="w-3 h-3" /> WiFi</span>}
                        {selectedHall.has_av   && <span className="flex items-center gap-1"><Monitor className="w-3 h-3" /> AV</span>}
                      </div>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Event Name" required error={errors.event_name}>
                      <input
                        type="text"
                        value={form.event_name}
                        onChange={(e) => set("event_name", e.target.value)}
                        placeholder="Annual Summit 2025"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Event Type" required>
                      <select
                        value={form.event_type}
                        onChange={(e) => set("event_type", e.target.value)}
                        className={inputCls}
                      >
                        {Object.entries(EVENT_TYPE_LABELS).map(([v, l]) => (
                          <option key={v} value={v}>{l}</option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Contact Name" required error={errors.contact_name}>
                      <input
                        type="text"
                        value={form.contact_name}
                        onChange={(e) => set("contact_name", e.target.value)}
                        placeholder="Ali Raza"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Contact email" required error={errors.contact_email}>
                      <input
                        type="email"
                        value={form.contact_email}
                        onChange={(e) => set("contact_email", e.target.value)}
                        placeholder="organizer@company.com"
                        className={inputCls}
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Setup Type" required>
                      <select
                        value={form.setup_type}
                        onChange={(e) => set("setup_type", e.target.value)}
                        className={inputCls}
                      >
                        <option value="theatre">Theatre</option>
                        <option value="boardroom">Boardroom</option>
                        <option value="banquet">Banquet</option>
                        <option value="classroom">Classroom</option>
                      </select>
                    </Field>
                    <Field label="Status" required>
                      <select
                        value={form.status}
                        onChange={(e) => set("status", e.target.value)}
                        className={inputCls}
                      >
                        {Object.entries(STATUS_CONFIG).map(([v, c]) => (
                          <option key={v} value={v}>{c.label}</option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {/* Dates & Times */}
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Start Date" required error={errors.start_date}>
                      <input
                        type="date"
                        value={form.start_date}
                        onChange={(e) => {
                          set("start_date", e.target.value);
                          if (!form.end_date) set("end_date", e.target.value);
                        }}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Start Time" required>
                      <input
                        type="time"
                        value={form.start_time}
                        onChange={(e) => set("start_time", e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="End Date" required error={errors.end_date}>
                      <input
                        type="date"
                        value={form.end_date}
                        onChange={(e) => set("end_date", e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="End Time" required>
                      <input
                        type="time"
                        value={form.end_time}
                        onChange={(e) => set("end_time", e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                  </div>

                  {/* Duration preview — FIX: uses previewHours (cross-midnight safe) */}
                  {previewHours > 0 && (
                    <div className="flex items-center gap-2 text-xs text-azure-700 bg-azure-50 border border-azure-100 rounded-xl px-3 py-2">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      Duration: <strong>{previewHours}h</strong>
                      {selectedHall && (
                        <span className="ml-auto text-azure-500">
                          Auto-priced: {formatPKR(
                            previewHours >= 8
                              ? selectedHall.full_day_rate
                              : previewHours * Number(selectedHall.hourly_rate)
                          )}
                        </span>
                      )}
                    </div>
                  )}

                  <Field label="Number of Attendees" required error={errors.attendees}>
                    <input
                      type="number"
                      min="1"
                      value={form.attendees}
                      onChange={(e) => set("attendees", e.target.value)}
                      placeholder="e.g. 150"
                      className={inputCls}
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Total Amount (PKR)" required error={errors.total_amount}>
                      <input
                        type="number"
                        min="0"
                        value={form.total_amount}
                        onChange={(e) => set("total_amount", e.target.value)}
                        placeholder="e.g. 120000"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Deposit Paid (PKR)" required error={errors.deposit_paid}>
                      <input
                        type="number"
                        min="0"
                        max={form.total_amount || undefined}
                        value={form.deposit_paid}
                        onChange={(e) => set("deposit_paid", e.target.value)}
                        placeholder="e.g. 30000"
                        className={inputCls}
                      />
                    </Field>
                  </div>

                  {/* Deposit progress */}
                  {form.total_amount && form.deposit_paid && Number(form.total_amount) > 0 && (
                    <div className="bg-slate-50 rounded-xl p-3">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                        <span>Deposit Coverage</span>
                        <span className="font-bold text-emerald-600">
                          {Math.min(100, Math.round((Number(form.deposit_paid) / Number(form.total_amount)) * 100))}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div
                          animate={{
                            width: `${Math.min(100, (Number(form.deposit_paid) / Number(form.total_amount)) * 100)}%`
                          }}
                          className="h-full bg-emerald-500 rounded-full"
                          transition={{ duration: 0.4 }}
                        />
                      </div>
                    </div>
                  )}

                  <Field label="Notes (optional)">
                    <textarea
                      value={form.notes}
                      onChange={(e) => set("notes", e.target.value)}
                      placeholder="Any special requirements, dietary notes, AV setup preferences..."
                      rows={3}
                      className={cn(inputCls, "resize-none")}
                    />
                  </Field>

                  {submitError && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-xl p-3"
                    >
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-rose-600">{submitError}</p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 shrink-0 gap-3">
            {step === 2 ? (
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-all font-medium"
              >
                ← Back
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-all font-medium"
              >
                Cancel
              </button>
            )}

            {step === 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 gradient-azure text-white px-5 py-2.5 rounded-xl font-medium text-sm shadow-azure hover:shadow-azure-lg transition-all"
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className={cn(
                  "flex items-center gap-2 gradient-azure text-white px-5 py-2.5 rounded-xl font-medium text-sm shadow-azure transition-all",
                  submitting ? "opacity-70 cursor-not-allowed" : "hover:shadow-azure-lg"
                )}
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Create Booking
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Success Toast ──────────────────────────────────────────────────────────
function SuccessToast({ onDismiss }: { onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 60, scale: 0.9 }}
      className="fixed bottom-6 right-6 z-[60] bg-white border border-emerald-200 rounded-2xl shadow-2xl px-4 py-3.5 flex items-center gap-3 max-w-xs"
    >
      <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0">
        <CheckCircle2 className="w-4 h-4 text-white" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-800">Booking Created!</p>
        <p className="text-xs text-slate-400">The event has been scheduled.</p>
      </div>
      <button onClick={onDismiss} className="ml-auto text-slate-300 hover:text-slate-500">
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

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
      <div className={cn("h-[3px] w-full", accentBar)} />
      <div className="p-4 sm:p-5">
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

        <div className="flex flex-wrap gap-2 mb-4">
          {capacities.map((c) => (
            <div key={c.label} className="flex items-center gap-1.5 bg-slate-50 rounded-xl px-3 py-1.5">
              <span className="text-slate-400">{c.icon}</span>
              <span className="text-xs text-slate-500">{c.label}</span>
              <span className="text-xs font-bold text-slate-700">{c.val}</span>
            </div>
          ))}
        </div>

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

  // FIX: use safeDurationHoursFromISO so cross-midnight bookings show correct duration
  const hours = safeDurationHoursFromISO(booking.start_datetime, booking.end_datetime);
  const depositPct = Math.min(
    100,
    Math.round((Number(booking.deposit_paid) / Number(booking.total_amount)) * 100)
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-premium overflow-hidden"
    >
      <div
        className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 sm:p-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
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
  const [hotelFilter, setHotelFilter]   = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedHall, setSelectedHall] = useState<ConferenceHall | null>(null);
  const [showFilters, setShowFilters]   = useState(false);

  // Modal state
  const [showNewBooking, setShowNewBooking] = useState(false);
  const [showSuccess, setShowSuccess]       = useState(false);

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

  const handleBookingSuccess = () => {
    setShowNewBooking(false);
    setShowSuccess(true);
    fetchData();           // refresh list
    setActiveTab("bookings"); // jump to bookings tab
  };

  // ── Derived ──
  const totalRevenue   = bookings.reduce((s, b) => s + Number(b.total_amount), 0);
  const totalDeposit   = bookings.reduce((s, b) => s + Number(b.deposit_paid), 0);
  const totalCapacity  = halls.reduce((s, h) => s + (h.capacity_theatre ?? h.capacity_banquet ?? 0), 0);
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
          <button
            onClick={() => setShowNewBooking(true)}
            className="flex items-center gap-2 gradient-azure text-white px-4 py-2.5 rounded-xl font-medium text-sm shadow-azure hover:shadow-azure-lg transition-all self-start xs:self-auto shrink-0"
          >
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

      {/* NEW BOOKING MODAL */}
      <AnimatePresence>
        {showNewBooking && (
          <NewBookingModal
            halls={halls}
            onClose={() => setShowNewBooking(false)}
            onSuccess={handleBookingSuccess}
          />
        )}
      </AnimatePresence>

      {/* SUCCESS TOAST */}
      <AnimatePresence>
        {showSuccess && <SuccessToast onDismiss={() => setShowSuccess(false)} />}
      </AnimatePresence>
    </div>
  );
}