"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Search,
  Plus,
  AlertTriangle,
  TrendingUp,
  Building2,
  LayoutGrid,
  List,
  ChevronDown,
  Pencil,
  Trash2,
  Eye,
  RefreshCw,
  Download,
  BarChart3,
  X,
  Archive,
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { formatCurrency } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import { PagePurposeAvatar } from "@/components/layout/PagePurposeAvatar";
import { toast } from "sonner";
import {
  AddItemModal,
  EditItemModal,
  ViewItemModal,
  RestockModal,
} from "@/components/inventory/InventoryModals";

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

interface HotelStat {
  hotel_name: string;
  city: string;
  total_items: number;
  total_value: number;
  low_stock_count: number;
}

function getStockStatus(item: InventoryItem) {
  const pct = (item.current_stock / item.max_stock) * 100;
  if (item.current_stock <= item.reorder_level) return { label: "Low Stock", color: "rose", pct };
  if (pct >= 80) return { label: "Well Stocked", color: "emerald", pct };
  return { label: "Normal", color: "azure", pct };
}

const categoryColors: Record<string, string> = {
  "Toiletries": "violet",
  "Bed Linen": "azure",
  "F&B Supplies": "gold",
  "Cleaning Supplies": "emerald",
  "Minibar Items": "rose",
};

const categoryIcons: Record<string, string> = {
  "Toiletries": "🧴",
  "Bed Linen": "🛏️",
  "F&B Supplies": "🍽️",
  "Cleaning Supplies": "🧹",
  "Minibar Items": "🍷",
};

function StatCard({ title, value, subtitle, icon: Icon, gradient, delay = 0 }: {
  title: string; value: string; subtitle?: string; icon: React.ElementType; gradient: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white rounded-2xl shadow-premium p-4 sm:p-5 flex items-center gap-3 sm:gap-4 border border-slate-100"
    >
      <div className={cn("w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0", gradient)}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
        <p className="text-lg sm:text-xl font-bold text-slate-800 truncate">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </motion.div>
  );
}

function StockBar({ item }: { item: InventoryItem }) {
  const { pct, color } = getStockStatus(item);
  const barColor = color === "rose" ? "bg-rose-500" : color === "emerald" ? "bg-emerald-500" : "bg-blue-500";
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>{item.current_stock} {item.unit}s</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(pct, 100)}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn("h-full rounded-full", barColor)}
        />
      </div>
    </div>
  );
}

function ItemCard({ item, onView, onEdit, onRestock, onDelete }: {
  item: InventoryItem; onView: () => void; onEdit: () => void; onRestock: () => void; onDelete: () => void;
}) {
  const { label, color } = getStockStatus(item);
  const catColor = categoryColors[item.category_name || ""] || "azure";
  const badgeClass = color === "rose" ? "bg-rose-50 text-rose-700 border-rose-200" : color === "emerald" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-blue-50 text-blue-700 border-blue-200";
  const catBadge = catColor === "violet" ? "bg-violet-50 text-violet-700" : catColor === "gold" ? "bg-amber-50 text-amber-700" : catColor === "emerald" ? "bg-emerald-50 text-emerald-700" : catColor === "rose" ? "bg-rose-50 text-rose-700" : "bg-blue-50 text-blue-700";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-2xl shadow-premium border border-slate-100 p-4 sm:p-5 flex flex-col gap-3 group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl leading-none flex-shrink-0">{categoryIcons[item.category_name || ""] || "📦"}</span>
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 text-sm leading-tight truncate">{item.item_name}</p>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{item.sku}</p>
          </div>
        </div>
        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border flex-shrink-0", badgeClass)}>{label}</span>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", catBadge)}>{item.category_name}</span>
        <span className="text-xs text-slate-400 flex items-center gap-1"><Building2 className="w-3 h-3" />{item.city}</span>
      </div>
      <StockBar item={item} />
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="font-medium text-slate-700">{formatCurrency(item.unit_cost)}/{item.unit}</span>
        <span className="truncate max-w-[120px]" title={item.supplier}>{item.supplier}</span>
      </div>
      <div className="flex items-center gap-1.5 pt-1 border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onView} className="flex-1 flex items-center justify-center gap-1 text-xs text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg py-1.5 transition-colors"><Eye className="w-3.5 h-3.5" /> View</button>
        <button onClick={onEdit} className="flex-1 flex items-center justify-center gap-1 text-xs text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg py-1.5 transition-colors"><Pencil className="w-3.5 h-3.5" /> Edit</button>
        <button onClick={onRestock} className="flex-1 flex items-center justify-center gap-1 text-xs text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg py-1.5 transition-colors"><RefreshCw className="w-3.5 h-3.5" /> Restock</button>
        <button onClick={onDelete} className="flex items-center justify-center text-xs text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg p-1.5 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
    </motion.div>
  );
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [hotelStats, setHotelStats] = useState<HotelStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedHotel, setSelectedHotel] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("item_name");
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [viewItem, setViewItem] = useState<InventoryItem | null>(null);
  const [restockItem, setRestockItem] = useState<InventoryItem | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const [itemsRes, catsRes] = await Promise.all([
        supabase.from("inventory_items").select(`*, inventory_categories(category_name), hotels(hotel_name, city)`).eq("is_deleted", false).order("item_name"),
        supabase.from("inventory_categories").select("*").order("category_name"),
      ]);
      if (itemsRes.data) {
        const mapped = itemsRes.data.map((i: any) => ({
          ...i,
          unit_cost: parseFloat(i.unit_cost),
          current_stock: parseFloat(i.current_stock),
          reorder_level: parseFloat(i.reorder_level),
          max_stock: parseFloat(i.max_stock),
          category_name: i.inventory_categories?.category_name,
          hotel_name: i.hotels?.hotel_name,
          city: i.hotels?.city,
        }));
        setItems(mapped);
        const hotelMap: Record<string, HotelStat> = {};
        mapped.forEach((item: InventoryItem) => {
          const key = item.hotel_name || "Unknown";
          if (!hotelMap[key]) hotelMap[key] = { hotel_name: item.hotel_name || "Unknown", city: item.city || "", total_items: 0, total_value: 0, low_stock_count: 0 };
          hotelMap[key].total_items += 1;
          hotelMap[key].total_value += item.current_stock * item.unit_cost;
          if (item.current_stock <= item.reorder_level) hotelMap[key].low_stock_count += 1;
        });
        setHotelStats(Object.values(hotelMap));
      }
      if (catsRes.data) setCategories(catsRes.data);
    } catch {
      toast.error("Failed to load inventory data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => {
    let result = [...items];
    if (search) result = result.filter(i => i.item_name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase()) || i.supplier.toLowerCase().includes(search.toLowerCase()));
    if (selectedCategory !== "all") result = result.filter(i => i.category_id === parseInt(selectedCategory));
    if (selectedHotel !== "all") result = result.filter(i => i.hotel_name === selectedHotel);
    if (stockFilter === "low") result = result.filter(i => i.current_stock <= i.reorder_level);
    else if (stockFilter === "good") result = result.filter(i => i.current_stock > i.reorder_level);
    result.sort((a, b) => {
      if (sortBy === "item_name") return a.item_name.localeCompare(b.item_name);
      if (sortBy === "stock") return b.current_stock - a.current_stock;
      if (sortBy === "value") return (b.current_stock * b.unit_cost) - (a.current_stock * a.unit_cost);
      if (sortBy === "cost") return b.unit_cost - a.unit_cost;
      return 0;
    });
    return result;
  }, [items, search, selectedCategory, selectedHotel, stockFilter, sortBy]);

  const totalValue = items.reduce((sum, i) => sum + i.current_stock * i.unit_cost, 0);
  const lowStockCount = items.filter(i => i.current_stock <= i.reorder_level).length;
  const uniqueSuppliers = new Set(items.map(i => i.supplier)).size;

  const categoryStats = useMemo(() => {
    const map: Record<string, { count: number; value: number }> = {};
    items.forEach(i => {
      const cat = i.category_name || "Other";
      if (!map[cat]) map[cat] = { count: 0, value: 0 };
      map[cat].count += 1;
      map[cat].value += i.current_stock * i.unit_cost;
    });
    return Object.entries(map).sort((a, b) => b[1].value - a[1].value);
  }, [items]);

  const handleDelete = async (item: InventoryItem) => {
    if (!confirm(`Delete "${item.item_name}"?`)) return;
    const { error } = await supabase.from("inventory_items").update({ is_deleted: true }).eq("item_id", item.item_id);
    if (error) toast.error("Failed to delete");
    else { toast.success("Item deleted"); fetchData(); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-10 h-10 border-[3px] border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-[1600px] mx-auto space-y-5 sm:space-y-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <PagePurposeAvatar variant="inventory" size={44} className="shrink-0 mt-0.5" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-800">Inventory Management</h1>
              <p className="text-slate-500 text-sm mt-1">Track stock levels, suppliers and reorder alerts across all properties</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={fetchData} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-all text-sm shadow-sm">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-slate-300 transition-all text-sm shadow-sm">
              <Download className="w-4 h-4" /> Export
            </button>
            <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-azure text-white font-medium text-sm shadow-azure hover:opacity-90 transition-all">
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>
        </motion.div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard title="Total Items" value={items.length.toString()} subtitle={`${uniqueSuppliers} suppliers`} icon={Archive} gradient="gradient-azure" delay={0} />
          <StatCard title="Total Value" value={formatCurrency(totalValue)} subtitle="Current stock value" icon={TrendingUp} gradient="gradient-gold" delay={0.05} />
          <StatCard title="Low Stock" value={lowStockCount.toString()} subtitle={lowStockCount === 0 ? "All good!" : "Need reorder"} icon={AlertTriangle} gradient="bg-gradient-to-br from-rose-500 to-rose-600" delay={0.1} />
          <StatCard title="Categories" value={categories.length.toString()} subtitle={`${items.length} total items`} icon={LayoutGrid} gradient="bg-gradient-to-br from-violet-500 to-violet-600" delay={0.15} />
        </div>

        {/* Hotel Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {hotelStats.map((h, i) => (
            <motion.div key={h.hotel_name} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }} className="bg-white rounded-2xl shadow-premium border border-slate-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg gradient-azure flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 text-sm truncate">{h.hotel_name}</p>
                  <p className="text-xs text-slate-400">{h.city}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div><p className="text-lg font-bold text-slate-800">{h.total_items}</p><p className="text-xs text-slate-400">Items</p></div>
                <div><p className="text-sm font-bold text-slate-800 truncate">{formatCurrency(h.total_value)}</p><p className="text-xs text-slate-400">Value</p></div>
                <div><p className={cn("text-lg font-bold", h.low_stock_count > 0 ? "text-rose-500" : "text-emerald-500")}>{h.low_stock_count}</p><p className="text-xs text-slate-400">Low</p></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Category Breakdown */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl shadow-premium border border-slate-100 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <h2 className="font-semibold text-slate-800">Category Breakdown</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {categoryStats.map(([cat, stats]) => {
              const color = categoryColors[cat] || "azure";
              const icon = categoryIcons[cat] || "📦";
              const pct = totalValue > 0 ? (stats.value / totalValue) * 100 : 0;
              const barColor = color === "violet" ? "bg-violet-500" : color === "gold" ? "bg-amber-500" : color === "emerald" ? "bg-emerald-500" : color === "rose" ? "bg-rose-500" : "bg-blue-500";
              return (
                <button key={cat} onClick={() => setSelectedCategory(categories.find(c => c.category_name === cat)?.category_id.toString() || "all")} className="rounded-xl border border-slate-100 p-3 hover:border-slate-200 hover:shadow-sm transition-all text-left">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-base">{icon}</span>
                    <p className="text-xs font-medium text-slate-700 leading-tight">{cat}</p>
                  </div>
                  <p className="text-base font-bold text-slate-800">{stats.count}</p>
                  <p className="text-xs text-slate-400 mb-2">{formatCurrency(stats.value)}</p>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.5 }} className={cn("h-full rounded-full", barColor)} />
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-white rounded-2xl shadow-premium border border-slate-100 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search items, SKU, supplier..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-slate-50" />
              {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>}
            </div>
            <div className="flex gap-2 flex-wrap">
              <div className="relative">
                <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none bg-slate-50 text-slate-700 cursor-pointer">
                  <option value="all">All Categories</option>
                  {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
              <div className="relative">
                <select value={selectedHotel} onChange={e => setSelectedHotel(e.target.value)} className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none bg-slate-50 text-slate-700 cursor-pointer">
                  <option value="all">All Hotels</option>
                  {hotelStats.map(h => <option key={h.hotel_name} value={h.hotel_name}>{h.city}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
              <div className="relative">
                <select value={stockFilter} onChange={e => setStockFilter(e.target.value)} className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none bg-slate-50 text-slate-700 cursor-pointer">
                  <option value="all">All Stock</option>
                  <option value="low">Low Stock</option>
                  <option value="good">Well Stocked</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
              <div className="relative">
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none bg-slate-50 text-slate-700 cursor-pointer">
                  <option value="item_name">Sort: Name</option>
                  <option value="stock">Sort: Stock</option>
                  <option value="value">Sort: Value</option>
                  <option value="cost">Sort: Cost</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
              <div className="flex rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                <button onClick={() => setViewMode("grid")} className={cn("p-2.5 transition-colors", viewMode === "grid" ? "bg-blue-500 text-white" : "text-slate-400 hover:text-slate-600")}><LayoutGrid className="w-4 h-4" /></button>
                <button onClick={() => setViewMode("list")} className={cn("p-2.5 transition-colors", viewMode === "list" ? "bg-blue-500 text-white" : "text-slate-400 hover:text-slate-600")}><List className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
          {(selectedCategory !== "all" || selectedHotel !== "all" || stockFilter !== "all" || search) && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-xs text-slate-400">Active filters:</span>
              {search && <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">&ldquo;{search}&rdquo;<button onClick={() => setSearch("")}><X className="w-3 h-3" /></button></span>}
              {selectedCategory !== "all" && <span className="flex items-center gap-1 text-xs bg-violet-50 text-violet-700 px-2 py-1 rounded-full">{categories.find(c => c.category_id === parseInt(selectedCategory))?.category_name}<button onClick={() => setSelectedCategory("all")}><X className="w-3 h-3" /></button></span>}
              {selectedHotel !== "all" && <span className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full">{selectedHotel}<button onClick={() => setSelectedHotel("all")}><X className="w-3 h-3" /></button></span>}
              {stockFilter !== "all" && <span className="flex items-center gap-1 text-xs bg-rose-50 text-rose-700 px-2 py-1 rounded-full">{stockFilter === "low" ? "Low Stock" : "Well Stocked"}<button onClick={() => setStockFilter("all")}><X className="w-3 h-3" /></button></span>}
              <button onClick={() => { setSearch(""); setSelectedCategory("all"); setSelectedHotel("all"); setStockFilter("all"); }} className="text-xs text-slate-400 hover:text-slate-600 underline ml-1">Clear all</button>
            </div>
          )}
        </motion.div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">Showing <span className="font-semibold text-slate-700">{filtered.length}</span> of {items.length} items</p>
          {lowStockCount > 0 && (
            <button onClick={() => setStockFilter("low")} className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-full hover:bg-rose-100 transition-colors">
              <AlertTriangle className="w-3.5 h-3.5" />{lowStockCount} low stock {lowStockCount === 1 ? "item" : "items"}
            </button>
          )}
        </div>

        {/* Grid View */}
        {viewMode === "grid" && (
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
                <Package className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">No items found</p>
                <p className="text-slate-400 text-sm mt-1">Try adjusting your filters</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {filtered.map(item => (
                  <ItemCard key={item.item_id} item={item} onView={() => setViewItem(item)} onEdit={() => setEditItem(item)} onRestock={() => setRestockItem(item)} onDelete={() => handleDelete(item)} />
                ))}
              </div>
            )}
          </AnimatePresence>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-premium border border-slate-100 overflow-hidden">
            <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <span>Item</span><span>Category</span><span>Hotel</span><span>Stock</span><span>Unit Cost</span><span>Status</span><span>Actions</span>
            </div>
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Package className="w-10 h-10 text-slate-300 mb-3" />
                <p className="text-slate-500">No items found</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {filtered.map((item, idx) => {
                  const { label, color } = getStockStatus(item);
                  const badgeClass = color === "rose" ? "bg-rose-50 text-rose-700" : color === "emerald" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700";
                  return (
                    <motion.div key={item.item_id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.02 }} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-2 md:gap-4 px-4 md:px-5 py-3 md:py-4 hover:bg-slate-50/60 transition-colors items-center">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-lg flex-shrink-0">{categoryIcons[item.category_name || ""] || "📦"}</span>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 text-sm truncate">{item.item_name}</p>
                          <p className="text-xs text-slate-400 font-mono">{item.sku}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1"><span className="md:hidden text-xs text-slate-400 w-20">Category:</span><span className="text-xs text-slate-600">{item.category_name}</span></div>
                      <div className="flex items-center gap-1"><span className="md:hidden text-xs text-slate-400 w-20">Hotel:</span><span className="text-xs text-slate-600">{item.city}</span></div>
                      <div className="flex items-center gap-1"><span className="md:hidden text-xs text-slate-400 w-20">Stock:</span><div className="w-full max-w-[120px]"><StockBar item={item} /></div></div>
                      <div className="flex items-center gap-1"><span className="md:hidden text-xs text-slate-400 w-20">Cost:</span><span className="text-sm font-medium text-slate-700">{formatCurrency(item.unit_cost)}</span></div>
                      <div className="flex items-center gap-1"><span className="md:hidden text-xs text-slate-400 w-20">Status:</span><span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", badgeClass)}>{label}</span></div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setViewItem(item)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => setEditItem(item)} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => setRestockItem(item)} className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"><RefreshCw className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(item)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </div>

      <AddItemModal open={addOpen} onClose={() => setAddOpen(false)} categories={categories} onSuccess={() => { setAddOpen(false); fetchData(); }} />
      {editItem && <EditItemModal open={!!editItem} item={editItem} categories={categories} onClose={() => setEditItem(null)} onSuccess={() => { setEditItem(null); fetchData(); }} />}
      {viewItem && <ViewItemModal open={!!viewItem} item={viewItem} onClose={() => setViewItem(null)} />}
      {restockItem && <RestockModal open={!!restockItem} item={restockItem} onClose={() => setRestockItem(null)} onSuccess={() => { setRestockItem(null); fetchData(); }} />}
    </div>
  );
}