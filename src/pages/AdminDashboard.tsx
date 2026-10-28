import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ComponentType,
} from "react";
import client, { getAllPages, getPage } from "../api/client";
import { getCategories } from "../api/categories";
import { updateExpense } from "../api/expenses";
import { updateMedication } from "../api/medications";
import CategoriesOverview from "../components/categories/CategoriesOverview";
import SavingsView from "../components/savings/SavingsView";
import toast from "react-hot-toast";
import {
  LayoutDashboard,
  FolderTree,
  Receipt,
  PiggyBank,
  Pill,
  Users,
  DollarSign,
  Loader2,
  Plus,
  Trash2,
  Edit3,
  X,
  ArrowRight,
  ShieldCheck,
  ShieldOff,
  RefreshCw,
  Search,
  Tag,
} from "lucide-react";
import type {
  DashboardStats,
  ExpenseSheet,
  Medication,
  AdminUser,
  Category,
} from "../types";

interface TabItem {
  id: string;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
}

/* ─── Tab definitions ─── */
const TABS: TabItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "categories", label: "Categories", icon: FolderTree },
  { id: "expenses", label: "Expenses", icon: Receipt },
  { id: "savings", label: "Savings", icon: PiggyBank },
  { id: "medications", label: "Medications", icon: Pill },
  { id: "users", label: "Users", icon: Users },
];

/* ═══════════════════════════════════════════════
   OVERVIEW TAB
   ═══════════════════════════════════════════════ */
function OverviewTab({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client
      .get("/admin/stats")
      .then((res) => setStats(res.data))
      .catch(() => toast.error("Failed to load stats"))
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats
    ? [
        {
          label: "Total Users",
          value: stats.total_users,
          icon: Users,
          color: "blue",
        },
        {
          label: "Expense Sheets",
          value: stats.total_expenses,
          icon: Receipt,
          color: "green",
        },
        {
          label: "Tracked Medications",
          value: stats.total_medications,
          icon: Pill,
          color: "purple",
        },
        {
          label: "Total Expenditure",
          value: `₱${(stats.total_expense_amount || 0).toLocaleString()}`,
          icon: DollarSign,
          color: "amber",
        },
      ]
    : [];

  const colorClasses: Record<string, string> = {
    blue: "bg-teal-500/10 text-teal-400 border border-teal-500/20",
    green: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    purple: "bg-violet-500/10 text-violet-400 border border-violet-500/20",
    amber: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Dashboard Overview</h2>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="h-10 w-10 bg-[#342c45] rounded-xl mb-3" />
              <div className="h-4 bg-[#342c45] rounded w-20 mb-2" />
              <div className="h-6 bg-[#342c45] rounded w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="glass-card p-6 accent-left">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${colorClasses[card.color] || colorClasses.blue}`}
                >
                  <Icon size={24} />
                </div>
                <p className="text-sm text-[#a59cb8]">{card.label}</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {card.value}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              label: "Category Manager",
              desc: "Organize expenses & medications",
              tab: "categories",
              icon: FolderTree,
            },
            {
              label: "Expense Tracker",
              desc: "Manage income & expenses",
              tab: "expenses",
              icon: Receipt,
            },
            {
              label: "Medication Tracker",
              desc: "Track dosages & costs",
              tab: "medications",
              icon: Pill,
            },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.tab}
                onClick={() => onNavigate(action.tab)}
                className="glass-card p-5 text-left group"
              >
                <Icon size={24} className="text-amber-400 mb-3" />
                <h4 className="font-semibold text-white group-hover:text-amber-400 transition-colors">
                  {action.label}
                </h4>
                <p className="text-sm text-[#a59cb8] mt-1">{action.desc}</p>
                <ArrowRight
                  size={16}
                  className="mt-3 text-[#a59cb8] group-hover:text-amber-400 group-hover:translate-x-1 transition-all"
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface ExpenseFormItem {
  description: string;
  amount: string;
}

interface ExpenseFormData {
  title: string;
  gross_income: string;
  category_id?: string;
  items: ExpenseFormItem[];
  tax_deductions: ExpenseFormItem[];
}

/* ═══════════════════════════════════════════════
   EXPENSES TAB
   ═══════════════════════════════════════════════ */
function ExpensesTab() {
  const [sheets, setSheets] = useState<ExpenseSheet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editSheet, setEditSheet] = useState<ExpenseSheet | null>(null);
  const [filterMode, setFilterMode] = useState<"all" | "uncategorized" | "categorized">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingCategoryId, setUpdatingCategoryId] = useState<number | null>(null);

  const [formData, setFormData] = useState<ExpenseFormData>({
    title: "",
    gross_income: "",
    category_id: "",
    items: [{ description: "", amount: "" }],
    tax_deductions: [{ description: "", amount: "" }],
  });

  const fetchSheets = useCallback(() => {
    getAllPages<ExpenseSheet>("/expenses/")
      .then(setSheets)
      .catch(() => toast.error("Failed to load expenses"))
      .finally(() => setLoading(false));
  }, []);

  const fetchCategoryList = useCallback(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchSheets();
    fetchCategoryList();
  }, [fetchSheets, fetchCategoryList]);

  // Calculations
  const uncategorizedCount = useMemo(
    () => sheets.filter((s) => s.category_id === null || s.category_id === undefined).length,
    [sheets]
  );
  const categorizedCount = sheets.length - uncategorizedCount;

  // Filtered sheets
  const filteredSheets = useMemo(() => {
    return sheets.filter((s) => {
      const isUncat = s.category_id === null || s.category_id === undefined;
      if (filterMode === "uncategorized" && !isUncat) return false;
      if (filterMode === "categorized" && isUncat) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = s.title?.toLowerCase().includes(q);
        const matchesItem = s.items?.some((i) => i.description.toLowerCase().includes(q));
        if (!matchesTitle && !matchesItem) return false;
      }

      return true;
    });
  }, [sheets, filterMode, searchQuery]);

  const openCreate = () => {
    setEditSheet(null);
    setFormData({
      title: "",
      gross_income: "",
      category_id: "",
      items: [{ description: "", amount: "" }],
      tax_deductions: [{ description: "", amount: "" }],
    });
    setShowModal(true);
  };

  const openEdit = (sheet: ExpenseSheet) => {
    setEditSheet(sheet);
    setFormData({
      title: sheet.title || "",
      gross_income: String(sheet.gross_income || ""),
      category_id: sheet.category_id ? String(sheet.category_id) : "",
      items: sheet.items?.length
        ? sheet.items.map((i) => ({
            description: i.description,
            amount: String(i.amount),
          }))
        : [{ description: "", amount: "" }],
      tax_deductions: sheet.tax_deductions?.length
        ? sheet.tax_deductions.map((d) => ({
            description: d.description,
            amount: String(d.amount),
          }))
        : [{ description: "", amount: "" }],
    });
    setShowModal(true);
  };

  const handleInlineAssignCategory = async (sheetId: number, targetCatId: string) => {
    setUpdatingCategoryId(sheetId);
    const newCatId = targetCatId ? parseInt(targetCatId, 10) : null;
    const catName = categories.find((c) => c.id === newCatId)?.title;

    try {
      await updateExpense(sheetId, { category_id: newCatId });
      setSheets((prev) =>
        prev.map((s) => (s.id === sheetId ? { ...s, category_id: newCatId } : s))
      );
      if (newCatId) {
        toast.success(`Expense assigned to "${catName || 'Category'}"`);
      } else {
        toast.success("Expense moved to Uncategorized");
      }
    } catch {
      toast.error("Failed to update category assignment");
    } finally {
      setUpdatingCategoryId(null);
    }
  };

  const handleSave = async () => {
    try {
      const category_id = formData.category_id
        ? parseInt(formData.category_id, 10)
        : null;

      const payload = {
        title: formData.title,
        gross_income: parseFloat(formData.gross_income) || 0,
        category_id,
        items: formData.items
          .filter((i) => i.description)
          .map((i) => ({
            description: i.description,
            amount: parseFloat(i.amount) || 0,
          })),
        tax_deductions: formData.tax_deductions
          .filter((d) => d.description)
          .map((d) => ({
            description: d.description,
            amount: parseFloat(d.amount) || 0,
          })),
      };

      if (editSheet) {
        // Sends the full items/tax_deductions lists; the backend replaces the sheet's rows with them
        await client.put(`/expenses/${editSheet.id}`, payload);
      } else {
        await client.post("/expenses/", payload);
      }
      toast.success(
        editSheet ? "Expense sheet updated!" : "Expense sheet created!",
      );
      setShowModal(false);
      fetchSheets();
    } catch {
      toast.error("Failed to save expense sheet");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this expense sheet?")) return;
    try {
      await client.delete(`/expenses/${id}`);
      toast.success("Expense sheet deleted");
      fetchSheets();
    } catch {
      toast.error("Failed to delete expense sheet");
    }
  };

  const addItem = (type: "items" | "tax_deductions") => {
    setFormData((f) => ({
      ...f,
      [type]: [...f[type], { description: "", amount: "" }],
    }));
  };

  const removeItem = (type: "items" | "tax_deductions", idx: number) => {
    setFormData((f) => ({
      ...f,
      [type]: f[type].filter((_, i) => i !== idx),
    }));
  };

  const updateItem = (
    type: "items" | "tax_deductions",
    idx: number,
    field: "description" | "amount",
    value: string,
  ) => {
    setFormData((f) => ({
      ...f,
      [type]: f[type].map((item, i) =>
        i === idx ? { ...item, [field]: value } : item,
      ),
    }));
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Receipt className="text-emerald-400" size={26} />
            Expense Tracker
          </h2>
          <p className="text-sm text-[#a59cb8] mt-0.5">
            Manage your income and expense sheets. Uncategorized sheets can be assigned to categories below.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus size={18} />
          New Sheet
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="glass-card p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Quick Filter Tabs */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setFilterMode("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterMode === "all"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                : "bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            All Sheets ({sheets.length})
          </button>
          <button
            onClick={() => setFilterMode("uncategorized")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterMode === "uncategorized"
                ? "bg-amber-500 text-[#15121c] font-bold shadow-md shadow-amber-500/20"
                : "bg-slate-900/60 text-amber-300 hover:bg-amber-500/10 border border-amber-500/30"
            }`}
          >
            <Tag size={13} />
            Uncategorized ({uncategorizedCount})
          </button>
          <button
            onClick={() => setFilterMode("categorized")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterMode === "categorized"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            Categorized ({categorizedCount})
          </button>
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-64">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sheets..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="animate-spin text-emerald-500" />
        </div>
      ) : filteredSheets.length === 0 ? (
        <div className="text-center py-16 glass-card border border-dashed border-slate-800">
          <Receipt size={44} className="mx-auto text-slate-600 mb-3" />
          <h4 className="text-base font-bold text-white mb-1">No expense sheets found</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? "No sheets match your search query."
              : filterMode === "uncategorized"
              ? "All expense sheets are currently categorized!"
              : "No expense sheets yet. Create your first one!"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSheets.map((sheet) => {
            const isUncategorized = sheet.category_id === null || sheet.category_id === undefined;
            const matchedCategory = categories.find((c) => c.id === sheet.category_id);
            const isUpdating = updatingCategoryId === sheet.id;

            return (
              <div
                key={sheet.id}
                onClick={() => openEdit(sheet)}
                className="glass-card p-6 border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      {/* Button gives keyboard access; its click bubbles to the card */}
                      <button type="button" className="text-lg font-bold text-white text-left hover:text-emerald-300">
                        {sheet.title || `Sheet #${sheet.id}`}
                      </button>
                      <span className="text-xs text-slate-400">
                        {sheet.items?.length || 0} items
                      </span>

                      {/* Category Status Badge */}
                      {isUncategorized ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                          <Tag size={11} /> Uncategorized
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-900/30 text-blue-300 border border-blue-800/40">
                          <FolderTree size={11} /> {matchedCategory?.title || `Category #${sheet.category_id}`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Actions: Category Dropdown & Edit/Delete */}
                  <div className="flex flex-wrap items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    {/* "Assign Category" Dropdown */}
                    <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 rounded-xl px-2.5 py-1 text-xs">
                      <span className="text-slate-400 shrink-0 font-medium">Category:</span>
                      <select
                        value={sheet.category_id || ""}
                        disabled={isUpdating}
                        onChange={(e) => handleInlineAssignCategory(sheet.id, e.target.value)}
                        className="bg-transparent text-white focus:outline-none cursor-pointer max-w-[150px] truncate text-xs font-medium"
                      >
                        <option value="" className="bg-slate-900 text-amber-400">
                          Uncategorized
                        </option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                            {c.title}
                          </option>
                        ))}
                      </select>
                      {isUpdating && <Loader2 size={12} className="animate-spin text-amber-400 shrink-0" />}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(sheet)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-all"
                        title="Edit sheet"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(sheet.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-all"
                        title="Delete sheet"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Amount metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { label: "Gross Income", value: sheet.gross_income, color: "text-white" },
                    {
                      label: "Tax Deductions",
                      value: sheet.total_tax_deductions,
                      color: "text-amber-400",
                    },
                    { label: "Net Income", value: sheet.net_income, color: "text-white" },
                    { label: "Total Expenses", value: sheet.total_expenses, color: "text-red-400" },
                    { label: "Remaining", value: sheet.remaining_income, color: "text-emerald-400" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3"
                    >
                      <p className="text-xs text-slate-400">{item.label}</p>
                      <p className={`text-base sm:text-lg font-bold ${item.color}`}>
                        ₱{(item.value || 0).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-lg font-bold text-white">
                {editSheet ? "Edit Expense Sheet" : "New Expense Sheet"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-slate-700 transition-all text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, title: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-white placeholder:text-slate-500"
                  placeholder="Monthly Budget - September"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Gross Income (₱)
                  </label>
                  <input
                    type="number"
                    value={formData.gross_income}
                    onChange={(e) =>
                      setFormData((f) => ({
                        ...f,
                        gross_income: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-white placeholder:text-slate-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Category (Optional)
                  </label>
                  <select
                    value={formData.category_id || ""}
                    onChange={(e) =>
                      setFormData((f) => ({
                        ...f,
                        category_id: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-white"
                  >
                    <option value="">None / Uncategorized</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tax Deductions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-300">
                    Tax Deductions
                  </label>
                  <button
                    type="button"
                    onClick={() => addItem("tax_deductions")}
                    className="text-sm text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>
                {formData.tax_deductions.map((d, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Description"
                      value={d.description}
                      onChange={(e) =>
                        updateItem(
                          "tax_deductions",
                          idx,
                          "description",
                          e.target.value,
                        )
                      }
                      className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder:text-slate-500"
                    />
                    <input
                      type="number"
                      placeholder="Amount"
                      value={d.amount}
                      onChange={(e) =>
                        updateItem(
                          "tax_deductions",
                          idx,
                          "amount",
                          e.target.value,
                        )
                      }
                      className="w-28 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder:text-slate-500"
                    />
                    {formData.tax_deductions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem("tax_deductions", idx)}
                        className="p-2 text-red-400 hover:bg-slate-700 rounded-lg"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-300">
                    Expense Items
                  </label>
                  <button
                    type="button"
                    onClick={() => addItem("items")}
                    className="text-sm text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>
                {formData.items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) =>
                        updateItem(
                          "items",
                          idx,
                          "description",
                          e.target.value,
                        )
                      }
                      className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder:text-slate-500"
                    />
                    <input
                      type="number"
                      placeholder="Amount"
                      value={item.amount}
                      onChange={(e) =>
                        updateItem("items", idx, "amount", e.target.value)
                      }
                      className="w-28 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder:text-slate-500"
                    />
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem("items", idx)}
                        className="p-2 text-red-400 hover:bg-slate-700 rounded-lg"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={handleSave}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/25"
              >
                {editSheet ? "Update Sheet" : "Create Sheet"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MEDICATIONS TAB
   ═══════════════════════════════════════════════ */
const medSpent = (med: Medication) => med.total_spent ?? (med.cost || 0) * (med.doses_taken || 0);

function MedicationsTab() {
  const [meds, setMeds] = useState<Medication[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMed, setEditMed] = useState<Medication | null>(null);
  const [filterMode, setFilterMode] = useState<"all" | "uncategorized" | "categorized">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingCategoryId, setUpdatingCategoryId] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: "",
    cost: "",
    doses_taken: "0",
    category_id: "",
    total_spent: "",
  });

  const fetchMeds = useCallback(() => {
    getAllPages<Medication>("/medications/")
      .then(setMeds)
      .catch(() => toast.error("Failed to load medications"))
      .finally(() => setLoading(false));
  }, []);

  const fetchCategoryList = useCallback(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchMeds();
    fetchCategoryList();
  }, [fetchMeds, fetchCategoryList]);

  // Counts
  const uncategorizedCount = useMemo(
    () => meds.filter((m) => m.category_id === null || m.category_id === undefined).length,
    [meds]
  );
  const categorizedCount = meds.length - uncategorizedCount;

  // Filtered meds
  const filteredMeds = useMemo(() => {
    return meds.filter((m) => {
      const isUncat = m.category_id === null || m.category_id === undefined;
      if (filterMode === "uncategorized" && !isUncat) return false;
      if (filterMode === "categorized" && isUncat) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        if (!m.name.toLowerCase().includes(q)) return false;
      }

      return true;
    });
  }, [meds, filterMode, searchQuery]);

  const openCreate = () => {
    setEditMed(null);
    setForm({ name: "", cost: "", doses_taken: "0", category_id: "", total_spent: "" });
    setShowModal(true);
  };

  const openEdit = (med: Medication) => {
    setEditMed(med);
    setForm({
      name: med.name,
      cost: String(med.cost),
      doses_taken: String(med.doses_taken),
      category_id: med.category_id ? String(med.category_id) : "",
      total_spent: String(medSpent(med)),
    });
    setShowModal(true);
  };

  const handleInlineAssignCategory = async (medId: number, targetCatId: string) => {
    setUpdatingCategoryId(medId);
    const newCatId = targetCatId ? parseInt(targetCatId, 10) : null;
    const catName = categories.find((c) => c.id === newCatId)?.title;

    try {
      await updateMedication(medId, { category_id: newCatId });
      setMeds((prev) =>
        prev.map((m) => (m.id === medId ? { ...m, category_id: newCatId } : m))
      );
      if (newCatId) {
        toast.success(`Medication assigned to "${catName || 'Category'}"`);
      } else {
        toast.success("Medication moved to Uncategorized");
      }
    } catch {
      toast.error("Failed to update medication category");
    } finally {
      setUpdatingCategoryId(null);
    }
  };

  const handleSave = async () => {
    try {
      const category_id = form.category_id
        ? parseInt(form.category_id, 10)
        : null;

      const payload: Partial<Medication> = {
        name: form.name,
        cost: parseFloat(form.cost) || 0,
        doses_taken: parseInt(form.doses_taken) || 0,
        category_id,
      };
      // Only send total_spent when the user changed it, so a stale value never overrides a cost/dose recalculation
      if (editMed && form.total_spent !== String(medSpent(editMed))) {
        const spent = parseFloat(form.total_spent);
        if (isNaN(spent) || spent < 0) {
          toast.error("Total spent must be a positive number");
          return;
        }
        payload.total_spent = spent;
      }
      if (editMed) {
        await client.put(`/medications/${editMed.id}`, payload);
        toast.success("Medication updated!");
      } else {
        await client.post("/medications/", payload);
        toast.success("Medication added!");
      }
      setShowModal(false);
      fetchMeds();
    } catch {
      toast.error("Failed to save medication");
    }
  };

  const handleTakeDose = async (id: number) => {
    try {
      await client.post(`/medications/${id}/take`, { doses: 1 });
      toast.success("+1 dose logged!");
      fetchMeds();
    } catch {
      toast.error("Failed to log dose");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this medication?")) return;
    try {
      await client.delete(`/medications/${id}`);
      toast.success("Medication deleted");
      fetchMeds();
    } catch {
      toast.error("Failed to delete medication");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Pill className="text-purple-400" size={26} />
            Medication Tracker
          </h2>
          <p className="text-sm text-[#a59cb8] mt-0.5">
            Track daily medications, dosage logs, and costs. Uncategorized items can be assigned directly to categories below.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-purple-500/25"
        >
          <Plus size={18} />
          Add Medication
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="glass-card p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Quick Filter Tabs */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setFilterMode("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterMode === "all"
                ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                : "bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            All Meds ({meds.length})
          </button>
          <button
            onClick={() => setFilterMode("uncategorized")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterMode === "uncategorized"
                ? "bg-amber-500 text-[#15121c] font-bold shadow-md shadow-amber-500/20"
                : "bg-slate-900/60 text-amber-300 hover:bg-amber-500/10 border border-amber-500/30"
            }`}
          >
            <Tag size={13} />
            Uncategorized ({uncategorizedCount})
          </button>
          <button
            onClick={() => setFilterMode("categorized")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterMode === "categorized"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            Categorized ({categorizedCount})
          </button>
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-64">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search medications..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="animate-spin text-purple-500" />
        </div>
      ) : filteredMeds.length === 0 ? (
        <div className="text-center py-16 glass-card border border-dashed border-slate-800">
          <Pill size={44} className="mx-auto text-slate-600 mb-3" />
          <h4 className="text-base font-bold text-white mb-1">No medications found</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? "No medications match your search query."
              : filterMode === "uncategorized"
              ? "All tracked medications are currently categorized!"
              : "No medications tracked yet. Add your first one!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeds.map((med) => {
            const isUncategorized = med.category_id === null || med.category_id === undefined;
            const matchedCat = categories.find((c) => c.id === med.category_id);
            const isUpdating = updatingCategoryId === med.id;

            return (
              <div key={med.id} className="glass-card p-6 border-slate-800 hover:border-purple-500/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-white">
                          {med.name}
                        </h3>
                        {isUncategorized ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                            <Tag size={11} /> Uncategorized
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-900/30 text-purple-300 border border-purple-800/40">
                            <FolderTree size={11} />
                            {matchedCat?.title || `Category #${med.category_id}`}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">
                        ₱{(med.cost || 0).toFixed(2)} per dose
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEdit(med)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-all"
                        title="Edit medication"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(med.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-all"
                        title="Delete medication"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Inline Category Assignment Dropdown */}
                  <div className="my-3 flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                    <span className="text-slate-400 shrink-0 font-medium">Category:</span>
                    <div className="flex items-center gap-1 min-w-0">
                      <select
                        value={med.category_id || ""}
                        disabled={isUpdating}
                        onChange={(e) => handleInlineAssignCategory(med.id, e.target.value)}
                        className="bg-transparent text-white focus:outline-none cursor-pointer max-w-[170px] truncate text-xs font-medium"
                      >
                        <option value="" className="bg-slate-900 text-amber-400">
                          Uncategorized
                        </option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                            {c.title}
                          </option>
                        ))}
                      </select>
                      {isUpdating && <Loader2 size={12} className="animate-spin text-amber-400 shrink-0" />}
                    </div>
                  </div>

                  {/* Metric stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3 text-center">
                      <p className="text-xs text-slate-400">Doses Taken</p>
                      <p className="text-xl font-bold text-white mt-0.5">
                        {med.doses_taken}
                      </p>
                    </div>
                    <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3 text-center">
                      <p className="text-xs text-slate-400">Total Spent</p>
                      <p className="text-xl font-bold text-purple-300 mt-0.5">
                        ₱{medSpent(med).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleTakeDose(med.id)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-600/20 text-purple-300 hover:bg-purple-600 hover:text-white border border-purple-500/30 font-medium rounded-xl transition-all active:scale-95 text-xs sm:text-sm"
                >
                  <Plus size={16} />
                  +1 Take Dose
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="border-b border-slate-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                {editMed ? "Edit Medication" : "Add Medication"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-white placeholder:text-slate-500"
                  placeholder="Medication name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Cost per dose (₱)
                </label>
                <input
                  type="number"
                  value={form.cost}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, cost: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-white placeholder:text-slate-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Category (Optional)
                </label>
                <select
                  value={form.category_id || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category_id: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-white"
                >
                  <option value="">None / Uncategorized</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Initial Doses Taken
                </label>
                <input
                  type="number"
                  value={form.doses_taken}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, doses_taken: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-white placeholder:text-slate-500"
                  placeholder="0"
                />
              </div>
              {editMed && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Total Spent (₱)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.total_spent}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, total_spent: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-white placeholder:text-slate-500"
                    placeholder="0.00"
                  />
                </div>
              )}
              <button
                onClick={handleSave}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-purple-500/25"
              >
                {editMed ? "Update" : "Add Medication"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   USER MANAGEMENT TAB
   ═══════════════════════════════════════════════ */
const USERS_PAGE_SIZE = 20;

function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  const fetchUsers = useCallback(() => {
    getPage<AdminUser>("/admin/users", USERS_PAGE_SIZE, offset)
      .then(({ items, total }) => {
        setUsers(items);
        setTotal(total);
      })
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoading(false));
  }, [offset]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleRole = async (userId: number | string, currentAdmin: boolean) => {
    try {
      await client.patch(`/admin/users/${userId}/role`, {
        admin: !currentAdmin,
      });
      toast.success(`User role updated`);
      fetchUsers();
    } catch {
      toast.error("Failed to update user role");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">User Management</h2>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-xl transition-all"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-sm font-semibold text-slate-300 px-6 py-4">
                    User
                  </th>
                  <th className="text-left text-sm font-semibold text-slate-300 px-6 py-4">
                    Email
                  </th>
                  <th className="text-left text-sm font-semibold text-slate-300 px-6 py-4">
                    Role
                  </th>
                  <th className="text-right text-sm font-semibold text-slate-300 px-6 py-4">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-slate-800 last:border-0 hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                          {(u.first_name?.[0] || "") + (u.last_name?.[0] || "")}
                        </div>
                        <span className="font-medium text-white">
                          {u.first_name} {u.last_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {u.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          u.admin
                            ? "bg-blue-900/30 text-blue-300 border border-blue-800/40"
                            : "bg-slate-800 text-slate-400 border border-slate-700/50"
                        }`}
                      >
                        {u.admin ? (
                          <>
                            <ShieldCheck size={12} /> Admin
                          </>
                        ) : (
                          "User"
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => toggleRole(u.id, u.admin)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          u.admin
                            ? "text-red-400 hover:bg-red-900/20"
                            : "text-blue-400 hover:bg-blue-900/20"
                        }`}
                      >
                        {u.admin ? (
                          <>
                            <ShieldOff size={14} /> Revoke Admin
                          </>
                        ) : (
                          <>
                            <ShieldCheck size={14} /> Grant Admin
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {total > USERS_PAGE_SIZE && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-[#342c45] text-sm text-[#a59cb8]">
              <span>
                Showing {offset + 1}–{Math.min(offset + USERS_PAGE_SIZE, total)} of {total}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setOffset((o) => Math.max(0, o - USERS_PAGE_SIZE))}
                  disabled={offset === 0}
                  className="px-3 py-1.5 rounded-lg border border-[#342c45] hover:text-amber-300 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setOffset((o) => o + USERS_PAGE_SIZE)}
                  disabled={offset + USERS_PAGE_SIZE >= total}
                  className="px-3 py-1.5 rounded-lg border border-[#342c45] hover:text-amber-300 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN ADMIN DASHBOARD
   ═══════════════════════════════════════════════ */
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const renderTab = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab onNavigate={setActiveTab} />;
      case "categories":
        return <CategoriesOverview embedded />;
      case "expenses":
        return <ExpensesTab />;
      case "savings":
        return <SavingsView embedded />;
      case "medications":
        return <MedicationsTab />;
      case "users":
        return <UsersTab />;
      default:
        return <OverviewTab onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#15121c] pt-20 text-[#ece8f4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex overflow-x-auto gap-2 mb-8 pb-1 scrollbar-none">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "bg-amber-500 text-[#15121c] font-semibold shadow-lg shadow-amber-500/20"
                    : "text-[#a59cb8] hover:bg-[#1f1a2b] hover:text-amber-300 border border-transparent hover:border-[#342c45]"
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="animate-[fadeIn_0.3s_ease-out]">{renderTab()}</div>
      </div>
    </div>
  );
}
