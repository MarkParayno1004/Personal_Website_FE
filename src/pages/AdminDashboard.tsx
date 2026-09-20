import { useState, useEffect, useCallback, type ComponentType } from "react";
import client from "../api/client";
import toast from "react-hot-toast";
import {
  LayoutDashboard,
  Palette,
  Receipt,
  Pill,
  Users,
  DollarSign,
  Loader2,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  ArrowRight,
  ShieldCheck,
  ShieldOff,
  RefreshCw,
} from "lucide-react";
import type {
  DashboardStats,
  ExpenseSheet,
  Medication,
  AdminUser,
} from "../types";

interface TabItem {
  id: string;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
}

/* ─── Tab definitions ─── */
const TABS: TabItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "portfolio", label: "Portfolio Config", icon: Palette },
  { id: "expenses", label: "Expenses", icon: Receipt },
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
    blue: "bg-blue-900/20 text-blue-400",
    green: "bg-emerald-900/20 text-emerald-400",
    purple: "bg-purple-900/20 text-purple-400",
    amber: "bg-amber-900/20 text-amber-400",
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Dashboard Overview</h2>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="h-10 w-10 bg-slate-700 rounded-xl mb-3" />
              <div className="h-4 bg-slate-700 rounded w-20 mb-2" />
              <div className="h-6 bg-slate-700 rounded w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="glass-card p-6">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${colorClasses[card.color] || colorClasses.blue}`}
                >
                  <Icon size={24} />
                </div>
                <p className="text-sm text-slate-400">{card.label}</p>
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Portfolio Configurator",
              desc: "Edit your portfolio content",
              tab: "portfolio",
              icon: Palette,
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
                <Icon size={24} className="text-blue-400 mb-3" />
                <h4 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                  {action.label}
                </h4>
                <p className="text-sm text-slate-400 mt-1">{action.desc}</p>
                <ArrowRight
                  size={16}
                  className="mt-3 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all"
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface PortfolioConfigForm {
  full_name: string;
  headline: string;
  location: string;
  email: string;
  phone: string;
  linkedin_url: string;
  github_username: string;
  summary: string;
}

/* ═══════════════════════════════════════════════
   PORTFOLIO CONFIG TAB
   ═══════════════════════════════════════════════ */
function PortfolioConfigTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PortfolioConfigForm>({
    full_name: "",
    headline: "",
    location: "",
    email: "",
    phone: "",
    linkedin_url: "",
    github_username: "",
    summary: "",
  });

  const fetchConfig = useCallback(() => {
    client
      .get("/portfolio/config")
      .then((res) => {
        setForm({
          full_name: res.data.full_name || res.data.name || "",
          headline: res.data.headline || "",
          location: res.data.location || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          linkedin_url: res.data.linkedin_url || res.data.linkedin || "",
          github_username: res.data.github_username || "",
          summary: res.data.summary || "",
        });
      })
      .catch(() => toast.error("Failed to load portfolio config"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await client.put("/portfolio/config", form);
      toast.success("Portfolio updated successfully!");
      fetchConfig();
    } catch {
      toast.error("Failed to update portfolio");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-blue-500" />
      </div>
    );
  }

  const formFields: Array<{
    key: keyof PortfolioConfigForm;
    label: string;
    type: string;
  }> = [
    { key: "full_name", label: "Full Name", type: "text" },
    { key: "headline", label: "Headline", type: "text" },
    { key: "location", label: "Location", type: "text" },
    { key: "email", label: "Email", type: "email" },
    { key: "phone", label: "Phone", type: "tel" },
    { key: "linkedin_url", label: "LinkedIn URL", type: "url" },
    { key: "github_username", label: "GitHub Username", type: "text" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">
          Portfolio Configuration
        </h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/25 disabled:opacity-60"
        >
          {saving ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Save size={18} />
          )}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-5">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Basic Information
            </h3>
            <div className="space-y-4">
              {formFields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    value={form[field.key]}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [field.key]: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-white placeholder:text-slate-500"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Bio Summary
                </label>
                <textarea
                  value={form.summary}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, summary: e.target.value }))
                  }
                  rows={4}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-white placeholder:text-slate-500 resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Live Preview
          </h3>
          <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                {(form.full_name || "MP")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <h4 className="text-xl font-bold text-white">
                {form.full_name || "Your Name"}
              </h4>
              <p className="text-blue-400 font-medium mt-1">
                {form.headline || "Your Headline"}
              </p>
              <p className="text-sm text-slate-400 mt-2">{form.location}</p>
              <p className="text-sm text-slate-400">{form.email}</p>
              <p className="text-sm text-slate-300 mt-4 text-left">
                {form.summary || "Your bio summary will appear here..."}
              </p>
            </div>
          </div>
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
  items: ExpenseFormItem[];
  tax_deductions: ExpenseFormItem[];
}

/* ═══════════════════════════════════════════════
   EXPENSES TAB
   ═══════════════════════════════════════════════ */
function ExpensesTab() {
  const [sheets, setSheets] = useState<ExpenseSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editSheet, setEditSheet] = useState<ExpenseSheet | null>(null);
  const [formData, setFormData] = useState<ExpenseFormData>({
    title: "",
    gross_income: "",
    items: [{ description: "", amount: "" }],
    tax_deductions: [{ description: "", amount: "" }],
  });

  const fetchSheets = useCallback(() => {
    client
      .get("/expenses/")
      .then((res) => setSheets(res.data))
      .catch(() => toast.error("Failed to load expenses"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchSheets();
  }, [fetchSheets]);

  const openCreate = () => {
    setEditSheet(null);
    setFormData({
      title: "",
      gross_income: "",
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

  const handleSave = async () => {
    try {
      if (editSheet) {
        await client.put(`/expenses/${editSheet.id}`, {
          title: formData.title,
          gross_income: parseFloat(formData.gross_income) || 0,
        });
      } else {
        await client.post("/expenses/", {
          title: formData.title,
          gross_income: parseFloat(formData.gross_income) || 0,
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
        });
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Expense Tracker</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/25"
        >
          <Plus size={18} />
          New Sheet
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="animate-spin text-blue-500" />
        </div>
      ) : sheets.length === 0 ? (
        <div className="text-center py-20">
          <Receipt size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400">
            No expense sheets yet. Create your first one!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sheets.map((sheet) => (
            <div key={sheet.id} className="glass-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {sheet.title || `Sheet #${sheet.id}`}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(sheet)}
                    className="p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-all"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(sheet.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { label: "Gross Income", value: sheet.gross_income },
                  {
                    label: "Tax Deductions",
                    value: sheet.total_tax_deductions,
                  },
                  { label: "Net Income", value: sheet.net_income },
                  { label: "Total Expenses", value: sheet.total_expenses },
                  { label: "Remaining", value: sheet.remaining_income },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3"
                  >
                    <p className="text-xs text-slate-400">{item.label}</p>
                    <p className="text-lg font-bold text-white">
                      ₱{(item.value || 0).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
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
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white placeholder:text-slate-500"
                  placeholder="Monthly Budget - September"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Gross Income
                </label>
                <input
                  type="number"
                  value={formData.gross_income}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, gross_income: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white placeholder:text-slate-500"
                  placeholder="0.00"
                />
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
                    className="text-sm text-blue-400 hover:underline flex items-center gap-1"
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
                      className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder:text-slate-500"
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
                      className="w-28 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder:text-slate-500"
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
              {!editSheet && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-300">
                      Expense Items
                    </label>
                    <button
                      type="button"
                      onClick={() => addItem("items")}
                      className="text-sm text-blue-400 hover:underline flex items-center gap-1"
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
                        className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder:text-slate-500"
                      />
                      <input
                        type="number"
                        placeholder="Amount"
                        value={item.amount}
                        onChange={(e) =>
                          updateItem("items", idx, "amount", e.target.value)
                        }
                        className="w-28 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder:text-slate-500"
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
              )}

              <button
                onClick={handleSave}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/25"
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
function MedicationsTab() {
  const [meds, setMeds] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMed, setEditMed] = useState<Medication | null>(null);
  const [form, setForm] = useState({ name: "", cost: "", doses_taken: "0" });

  const fetchMeds = useCallback(() => {
    client
      .get("/medications/")
      .then((res) => setMeds(res.data))
      .catch(() => toast.error("Failed to load medications"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchMeds();
  }, [fetchMeds]);

  const openCreate = () => {
    setEditMed(null);
    setForm({ name: "", cost: "", doses_taken: "0" });
    setShowModal(true);
  };

  const openEdit = (med: Medication) => {
    setEditMed(med);
    setForm({
      name: med.name,
      cost: String(med.cost),
      doses_taken: String(med.doses_taken),
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        name: form.name,
        cost: parseFloat(form.cost) || 0,
        doses_taken: parseInt(form.doses_taken) || 0,
      };
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Medication Tracker</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/25"
        >
          <Plus size={18} />
          Add Medication
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="animate-spin text-blue-500" />
        </div>
      ) : meds.length === 0 ? (
        <div className="text-center py-20">
          <Pill size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400">No medications tracked yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {meds.map((med) => (
            <div key={med.id} className="glass-card p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {med.name}
                  </h3>
                  <p className="text-sm text-slate-400">
                    ₱{(med.cost || 0).toFixed(2)} per dose
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(med)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-all"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(med.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
                  <p className="text-xs text-slate-400">Doses Taken</p>
                  <p className="text-2xl font-bold text-white">
                    {med.doses_taken}
                  </p>
                </div>
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
                  <p className="text-xs text-slate-400">Total Spent</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    ₱
                    {(
                      med.total_spent ||
                      med.cost * med.doses_taken ||
                      0
                    ).toFixed(2)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleTakeDose(med.id)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-900/20 text-emerald-300 hover:bg-emerald-900/30 border border-emerald-800/40 font-medium rounded-xl transition-all"
              >
                <Plus size={16} />
                +1 Take Dose
              </button>
            </div>
          ))}
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
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder:text-slate-500"
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
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder:text-slate-500"
                  placeholder="0.00"
                />
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
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder:text-slate-500"
                  placeholder="0"
                />
              </div>
              <button
                onClick={handleSave}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/25"
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
   USERS TAB
   ═══════════════════════════════════════════════ */
function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(() => {
    client
      .get("/admin/users")
      .then((res) => setUsers(res.data))
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

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
      case "portfolio":
        return <PortfolioConfigTab />;
      case "expenses":
        return <ExpensesTab />;
      case "medications":
        return <MedicationsTab />;
      case "users":
        return <UsersTab />;
      default:
        return <OverviewTab onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex overflow-x-auto gap-1 mb-8 pb-1 scrollbar-none">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
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
