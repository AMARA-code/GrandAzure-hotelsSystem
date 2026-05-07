"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Package,
  Save,
  RefreshCw,
  Building2,
  Tag,
  Hash,
  Layers,
  AlertTriangle,
  Check,
  Truck,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/formatters";

interface InventoryItem {
  item_id: number;
  hotel_id: number;
  category_id: number;
  item_name: string;
  sku: string;
  unit: string;
  unit_cost: number;
  current_stock: number;
  reorder_level: number;
  max_stock: number;
  supplier: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  category_name?: string;
  hotel_name?: string;
  city?: string;
}

interface Category {
  category_id: number;
  category_name: string;
  description: string | null;
}

interface Hotel {
  hotel_id: number;
  hotel_name: string;
  city: string;
}

function ModalWrapper({ open, onClose, children, title, subtitle, icon: Icon, iconColor = "gradient-azure", maxWidth = "max-w-lg" }: {
  open: boolean; onClose: () => void; children: React.ReactNode; title: string; subtitle?: string; icon: React.ElementType; iconColor?: string; maxWidth?: string;
}) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn("relative bg-white w-full rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col", maxWidth, "max-h-[92vh] sm:max-h-[90vh]")}
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 flex-shrink-0">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", iconColor)}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-slate-800 text-base leading-tight">{title}</h2>
                {subtitle && <p className="text-xs text-slate-400 mt-0.5 truncate">{subtitle}</p>}
              </div>
              <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 overscroll-contain">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, required, children, error }: { label: string; required?: boolean; children: React.ReactNode; error?: string; }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-1">
        {label}{required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
}

function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input className={cn("w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-slate-50 placeholder:text-slate-300 transition-all", className)} {...props} />
  );
}

function SelectField({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn("w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-slate-50 text-slate-700 cursor-pointer transition-all", className)} {...props}>
      {children}
    </select>
  );
}

const UNITS = ["piece", "bottle", "box", "kg", "liter", "pack", "roll", "set", "pair", "dozen"];

// ─── ADD ITEM MODAL ─────────────────────────────────────────────────────────────
export function AddItemModal({ open, onClose, categories, onSuccess }: {
  open: boolean; onClose: () => void; categories: Category[]; onSuccess: () => void;
}) {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ hotel_id: "", category_id: "", item_name: "", sku: "", unit: "piece", unit_cost: "", current_stock: "", reorder_level: "", max_stock: "", supplier: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  useEffect(() => {
    if (open) {
      supabase.from("hotels").select("hotel_id, hotel_name, city").eq("is_deleted", false).then(({ data }) => { if (data) setHotels(data); });
    }
  }, [open]);

  const set = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: "" })); };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.hotel_id) e.hotel_id = "Required";
    if (!form.category_id) e.category_id = "Required";
    if (!form.item_name.trim()) e.item_name = "Required";
    if (!form.sku.trim()) e.sku = "Required";
    if (!form.unit_cost || isNaN(Number(form.unit_cost))) e.unit_cost = "Valid number required";
    if (!form.current_stock || isNaN(Number(form.current_stock))) e.current_stock = "Valid number required";
    if (!form.reorder_level || isNaN(Number(form.reorder_level))) e.reorder_level = "Valid number required";
    if (!form.max_stock || isNaN(Number(form.max_stock))) e.max_stock = "Valid number required";
    if (!form.supplier.trim()) e.supplier = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("inventory_items").insert({
        hotel_id: parseInt(form.hotel_id), category_id: parseInt(form.category_id),
        item_name: form.item_name.trim(), sku: form.sku.trim().toUpperCase(),
        unit: form.unit, unit_cost: parseFloat(form.unit_cost),
        current_stock: parseFloat(form.current_stock), reorder_level: parseFloat(form.reorder_level),
        max_stock: parseFloat(form.max_stock), supplier: form.supplier.trim(), is_deleted: false,
      });
      if (error) throw error;
      toast.success("Item added successfully!");
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to add item");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalWrapper open={open} onClose={onClose} title="Add Inventory Item" subtitle="Add a new item to hotel inventory" icon={Package} maxWidth="max-w-xl">
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Hotel" required error={errors.hotel_id}>
            <SelectField value={form.hotel_id} onChange={e => set("hotel_id", e.target.value)}>
              <option value="">Select hotel...</option>
              {hotels.map(h => <option key={h.hotel_id} value={h.hotel_id}>{h.hotel_name}</option>)}
            </SelectField>
          </Field>
          <Field label="Category" required error={errors.category_id}>
            <SelectField value={form.category_id} onChange={e => set("category_id", e.target.value)}>
              <option value="">Select category...</option>
              {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
            </SelectField>
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Item Name" required error={errors.item_name}><Input placeholder="e.g. Shampoo 50ml" value={form.item_name} onChange={e => set("item_name", e.target.value)} /></Field>
          <Field label="SKU" required error={errors.sku}><Input placeholder="e.g. TOI-SHA-001" value={form.sku} onChange={e => set("sku", e.target.value)} className="font-mono" /></Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Unit" required>
            <SelectField value={form.unit} onChange={e => set("unit", e.target.value)}>
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </SelectField>
          </Field>
          <Field label="Unit Cost (PKR)" required error={errors.unit_cost}><Input type="number" placeholder="0.00" value={form.unit_cost} onChange={e => set("unit_cost", e.target.value)} min="0" step="0.01" /></Field>
        </div>
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5" /> Stock Levels</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Current Stock" required error={errors.current_stock}><Input type="number" placeholder="0" value={form.current_stock} onChange={e => set("current_stock", e.target.value)} min="0" /></Field>
            <Field label="Reorder Level" required error={errors.reorder_level}><Input type="number" placeholder="0" value={form.reorder_level} onChange={e => set("reorder_level", e.target.value)} min="0" /></Field>
            <Field label="Max Stock" required error={errors.max_stock}><Input type="number" placeholder="0" value={form.max_stock} onChange={e => set("max_stock", e.target.value)} min="0" /></Field>
          </div>
        </div>
        <Field label="Supplier" required error={errors.supplier}><Input placeholder="e.g. Al-Habib Supplies" value={form.supplier} onChange={e => set("supplier", e.target.value)} /></Field>
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="flex-1 py-2.5 rounded-xl gradient-azure text-white text-sm font-medium shadow-azure hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
            {saving ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> : <><Save className="w-4 h-4" /> Add Item</>}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}

// ─── EDIT ITEM MODAL ────────────────────────────────────────────────────────────
export function EditItemModal({ open, item, categories, onClose, onSuccess }: {
  open: boolean; item: InventoryItem; categories: Category[]; onClose: () => void; onSuccess: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    item_name: item.item_name, sku: item.sku, unit: item.unit,
    unit_cost: item.unit_cost.toString(), current_stock: item.current_stock.toString(),
    reorder_level: item.reorder_level.toString(), max_stock: item.max_stock.toString(),
    supplier: item.supplier, category_id: item.category_id.toString(),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const set = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: "" })); };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.item_name.trim()) e.item_name = "Required";
    if (!form.sku.trim()) e.sku = "Required";
    if (!form.unit_cost || isNaN(Number(form.unit_cost))) e.unit_cost = "Valid number required";
    if (!form.current_stock || isNaN(Number(form.current_stock))) e.current_stock = "Valid number required";
    if (!form.reorder_level || isNaN(Number(form.reorder_level))) e.reorder_level = "Valid number required";
    if (!form.max_stock || isNaN(Number(form.max_stock))) e.max_stock = "Valid number required";
    if (!form.supplier.trim()) e.supplier = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("inventory_items").update({
        item_name: form.item_name.trim(), sku: form.sku.trim().toUpperCase(),
        unit: form.unit, unit_cost: parseFloat(form.unit_cost),
        current_stock: parseFloat(form.current_stock), reorder_level: parseFloat(form.reorder_level),
        max_stock: parseFloat(form.max_stock), supplier: form.supplier.trim(),
        category_id: parseInt(form.category_id), updated_at: new Date().toISOString(),
      }).eq("item_id", item.item_id);
      if (error) throw error;
      toast.success("Item updated successfully!");
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to update item");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalWrapper open={open} onClose={onClose} title="Edit Item" subtitle={`${item.item_name} · ${item.sku}`} icon={Package} iconColor="bg-gradient-to-br from-amber-400 to-amber-600" maxWidth="max-w-xl">
      <div className="p-5 space-y-4">
        <Field label="Category" required>
          <SelectField value={form.category_id} onChange={e => set("category_id", e.target.value)}>
            {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
          </SelectField>
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Item Name" required error={errors.item_name}><Input value={form.item_name} onChange={e => set("item_name", e.target.value)} /></Field>
          <Field label="SKU" required error={errors.sku}><Input value={form.sku} onChange={e => set("sku", e.target.value)} className="font-mono" /></Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Unit">
            <SelectField value={form.unit} onChange={e => set("unit", e.target.value)}>
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </SelectField>
          </Field>
          <Field label="Unit Cost (PKR)" required error={errors.unit_cost}><Input type="number" value={form.unit_cost} onChange={e => set("unit_cost", e.target.value)} min="0" step="0.01" /></Field>
        </div>
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5" /> Stock Levels</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Current Stock" required error={errors.current_stock}><Input type="number" value={form.current_stock} onChange={e => set("current_stock", e.target.value)} min="0" /></Field>
            <Field label="Reorder Level" required error={errors.reorder_level}><Input type="number" value={form.reorder_level} onChange={e => set("reorder_level", e.target.value)} min="0" /></Field>
            <Field label="Max Stock" required error={errors.max_stock}><Input type="number" value={form.max_stock} onChange={e => set("max_stock", e.target.value)} min="0" /></Field>
          </div>
        </div>
        <Field label="Supplier" required error={errors.supplier}><Input value={form.supplier} onChange={e => set("supplier", e.target.value)} /></Field>
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-white text-sm font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
            {saving ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> : <><Save className="w-4 h-4" /> Save Changes</>}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}

// ─── VIEW ITEM MODAL ────────────────────────────────────────────────────────────
export function ViewItemModal({ open, item, onClose }: { open: boolean; item: InventoryItem; onClose: () => void; }) {
  const stockPct = Math.min((item.current_stock / item.max_stock) * 100, 100);
  const isLow = item.current_stock <= item.reorder_level;
  const isGood = stockPct >= 80;
  const statusColor = isLow ? "rose" : isGood ? "emerald" : "azure";
  const statusLabel = isLow ? "Low Stock" : isGood ? "Well Stocked" : "Normal";
  const totalValue = item.current_stock * item.unit_cost;
  const barColor = statusColor === "rose" ? "from-rose-400 to-rose-600" : statusColor === "emerald" ? "from-emerald-400 to-emerald-600" : "from-blue-400 to-blue-600";

  const rows = [
    { label: "Item Name", value: item.item_name, icon: Package },
    { label: "SKU", value: item.sku, icon: Hash, mono: true },
    { label: "Category", value: item.category_name || "—", icon: Tag },
    { label: "Hotel", value: item.hotel_name || "—", icon: Building2 },
    { label: "Supplier", value: item.supplier, icon: Truck },
    { label: "Unit", value: item.unit, icon: Layers },
    { label: "Unit Cost", value: formatCurrency(item.unit_cost), icon: TrendingUp },
    { label: "Total Value", value: formatCurrency(totalValue), icon: TrendingUp, highlight: true },
  ];

  return (
    <ModalWrapper open={open} onClose={onClose} title="Item Details" subtitle={item.sku} icon={Package} iconColor="bg-gradient-to-br from-violet-500 to-violet-600" maxWidth="max-w-lg">
      <div className="p-5 space-y-5">
        <div className={cn("flex items-center gap-3 p-3 rounded-xl border", isLow ? "bg-rose-50 border-rose-200" : "bg-emerald-50 border-emerald-200")}>
          {isLow ? <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0" /> : <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />}
          <div>
            <p className={cn("text-sm font-semibold", isLow ? "text-rose-700" : "text-emerald-700")}>{statusLabel}</p>
            <p className={cn("text-xs", isLow ? "text-rose-500" : "text-emerald-500")}>{item.current_stock} {item.unit}s in stock · Reorder at {item.reorder_level}</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 font-medium">Stock Level</span>
            <span className="font-bold text-slate-800">{Math.round(stockPct)}%</span>
          </div>
          <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${stockPct}%` }} transition={{ duration: 0.9, ease: "easeOut" }} className={cn("h-full rounded-full bg-gradient-to-r", barColor)} />
          </div>
          <div className="grid grid-cols-3 text-center text-xs text-slate-500">
            <div><p className="font-bold text-slate-800 text-base">{item.current_stock}</p><p>Current</p></div>
            <div><p className="font-bold text-amber-600 text-base">{item.reorder_level}</p><p>Reorder At</p></div>
            <div><p className="font-bold text-slate-800 text-base">{item.max_stock}</p><p>Maximum</p></div>
          </div>
        </div>
        <div className="space-y-2">
          {rows.map(({ label, value, icon: Icon, mono, highlight }) => (
            <div key={label} className={cn("flex items-center justify-between py-2.5 px-3 rounded-xl", highlight ? "bg-blue-50 border border-blue-100" : "bg-slate-50")}>
              <div className="flex items-center gap-2 text-slate-500 text-xs"><Icon className={cn("w-3.5 h-3.5", highlight ? "text-blue-500" : "")} />{label}</div>
              <span className={cn("text-sm font-semibold", mono && "font-mono", highlight ? "text-blue-700" : "text-slate-800")}>{value}</span>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">Close</button>
      </div>
    </ModalWrapper>
  );
}

// ─── RESTOCK MODAL ──────────────────────────────────────────────────────────────
export function RestockModal({ open, item, onClose, onSuccess }: {
  open: boolean; item: InventoryItem; onClose: () => void; onSuccess: () => void;
}) {
  const [quantity, setQuantity] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const qty = parseFloat(quantity) || 0;
  const newStock = item.current_stock + qty;
  const exceedsMax = newStock > item.max_stock;
  const needed = item.max_stock - item.current_stock;
  const cost = qty * item.unit_cost;
  const presets = [Math.round(needed * 0.25), Math.round(needed * 0.5), Math.round(needed * 0.75), needed].filter(v => v > 0);

  const handleSubmit = async () => {
    const n = parseFloat(quantity);
    if (!quantity || isNaN(n) || n <= 0) { setError("Please enter a valid quantity"); return; }
    if (exceedsMax) { setError(`Cannot exceed max stock of ${item.max_stock}`); return; }
    setSaving(true);
    try {
      const { error: err } = await supabase.from("inventory_items").update({ current_stock: newStock, updated_at: new Date().toISOString() }).eq("item_id", item.item_id);
      if (err) throw err;
      toast.success(`Restocked ${item.item_name} by ${n} ${item.unit}s`);
      onSuccess();
    } catch (e: any) {
      toast.error(e.message || "Failed to restock");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalWrapper open={open} onClose={onClose} title="Restock Item" subtitle={`${item.item_name} · Current: ${item.current_stock} ${item.unit}s`} icon={RefreshCw} iconColor="bg-gradient-to-br from-emerald-500 to-emerald-600" maxWidth="max-w-md">
      <div className="p-5 space-y-5">
        <div className="grid grid-cols-3 gap-3 text-center">
          {[{ label: "Current", value: item.current_stock, color: "text-slate-800" }, { label: "Reorder At", value: item.reorder_level, color: "text-amber-600" }, { label: "Maximum", value: item.max_stock, color: "text-emerald-600" }].map(({ label, value, color }) => (
            <div key={label} className="bg-slate-50 rounded-xl p-3">
              <p className={cn("text-xl font-bold", color)}>{value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {needed > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Quick Fill</p>
            <div className="grid grid-cols-4 gap-2">
              {presets.map(p => (
                <button key={p} onClick={() => { setQuantity(p.toString()); setError(""); }} className={cn("py-2 rounded-xl text-xs font-semibold border transition-all", quantity === p.toString() ? "gradient-azure text-white border-transparent shadow-azure" : "bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300")}>+{p}</button>
              ))}
            </div>
          </div>
        )}

        <Field label="Quantity to Add" required error={error}>
          <div className="flex gap-2">
            <input type="number" placeholder="Enter quantity..." value={quantity} onChange={e => { setQuantity(e.target.value); setError(""); }} min="1" className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-slate-50" />
            <span className="flex items-center px-3 bg-slate-100 rounded-xl text-sm text-slate-500 border border-slate-200 flex-shrink-0">{item.unit}s</span>
          </div>
        </Field>

        {qty > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cn("p-4 rounded-xl border space-y-2", exceedsMax ? "bg-rose-50 border-rose-200" : "bg-emerald-50 border-emerald-200")}>
            <p className={cn("text-xs font-semibold uppercase tracking-wide", exceedsMax ? "text-rose-600" : "text-emerald-600")}>{exceedsMax ? "⚠️ Exceeds Maximum" : "✅ Restock Preview"}</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><p className="text-slate-500 text-xs">New Stock Level</p><p className={cn("font-bold", exceedsMax ? "text-rose-700" : "text-emerald-700")}>{newStock} {item.unit}s</p></div>
              <div><p className="text-slate-500 text-xs">Restock Cost</p><p className="font-bold text-slate-800">{formatCurrency(cost)}</p></div>
            </div>
            <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
              <motion.div initial={{ width: `${(item.current_stock / item.max_stock) * 100}%` }} animate={{ width: `${Math.min((newStock / item.max_stock) * 100, 100)}%` }} transition={{ duration: 0.5 }} className={cn("h-full rounded-full", exceedsMax ? "bg-rose-500" : "bg-emerald-500")} />
            </div>
          </motion.div>
        )}

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-xl p-3">
          <Truck className="w-4 h-4 flex-shrink-0" />
          <span>Supplier: <span className="font-medium text-slate-700">{item.supplier}</span></span>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={saving || exceedsMax || qty <= 0} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm">
            {saving ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> : <><RefreshCw className="w-4 h-4" /> Confirm Restock</>}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}