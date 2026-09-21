import { useState, useEffect, useCallback, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  FolderTree,
  Plus,
  Trash2,
  Edit3,
  Receipt,
  Pill,
  DollarSign,
  Loader2,
  Calendar,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  X,
  Layers,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../api/categories";
import type { Category, CreateCategoryPayload } from "../../types";

interface CategoriesOverviewProps {
  embedded?: boolean;
}

export default function CategoriesOverview({ embedded: _embedded = false }: CategoriesOverviewProps) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Create form state
  const [newTitle, setNewTitle] = useState("");
  const [includeExpense, setIncludeExpense] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    title: "",
    gross_income: "",
    items: [{ description: "", amount: "" }],
    tax_deductions: [{ description: "", amount: "" }],
  });
  const [includeMedication, setIncludeMedication] = useState(false);
  const [medicationForm, setMedicationForm] = useState({
    name: "",
    cost: "",
    doses_taken: "0",
  });

  const refreshCategoryData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const data = await getCategories();
      setCategories(data);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    getCategories()
      .then((data) => {
        if (!ignore) {
          setCategories(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          toast.error("Failed to load categories");
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Aggregated calculations
  const totalCategories = categories.length;
  const totalExpensesCount = categories.reduce(
    (sum, c) => sum + (c.expenses?.length || 0),
    0
  );
  const totalExpensesAmount = categories.reduce(
    (sum, c) => sum + (c.total_expenses_amount || 0),
    0
  );
  const totalMedsCount = categories.reduce(
    (sum, c) => sum + (c.medications?.length || 0),
    0
  );
  const totalMedsAmount = categories.reduce(
    (sum, c) => sum + (c.total_medications_amount || 0),
    0
  );
  const totalCombinedAmount = categories.reduce(
    (sum, c) => sum + (c.total_amount || 0),
    0
  );

  const resetCreateForm = () => {
    setNewTitle("");
    setIncludeExpense(false);
    setExpenseForm({
      title: "",
      gross_income: "",
      items: [{ description: "", amount: "" }],
      tax_deductions: [{ description: "", amount: "" }],
    });
    setIncludeMedication(false);
    setMedicationForm({
      name: "",
      cost: "",
      doses_taken: "0",
    });
  };

  const handleOpenCreate = () => {
    resetCreateForm();
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle) {
      toast.error("Category title is required");
      return;
    }

    setIsSaving(true);
    try {
      const payload: CreateCategoryPayload = {
        title: trimmedTitle,
      };

      if (includeExpense && expenseForm.title.trim()) {
        payload.expenses = [
          {
            title: expenseForm.title.trim(),
            gross_income: parseFloat(expenseForm.gross_income) || 0,
            items: expenseForm.items
              .filter((i) => i.description.trim())
              .map((i) => ({
                description: i.description.trim(),
                amount: parseFloat(i.amount) || 0,
              })),
            tax_deductions: expenseForm.tax_deductions
              .filter((d) => d.description.trim())
              .map((d) => ({
                description: d.description.trim(),
                amount: parseFloat(d.amount) || 0,
              })),
          },
        ];
      }

      if (includeMedication && medicationForm.name.trim()) {
        payload.medications = [
          {
            name: medicationForm.name.trim(),
            cost: parseFloat(medicationForm.cost) || 0,
            doses_taken: parseInt(medicationForm.doses_taken) || 0,
          },
        ];
      }

      await createCategory(payload);
      toast.success("Category created successfully!");
      setShowCreateModal(false);
      resetCreateForm();
      refreshCategoryData(true);
    } catch {
      toast.error("Failed to create category");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenEdit = (category: Category, e: React.MouseEvent) => {
    e.stopPropagation();
    setCategoryToEdit(category);
    setEditTitle(category.title);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!categoryToEdit) return;
    const trimmed = editTitle.trim();
    if (!trimmed) {
      toast.error("Category title cannot be empty");
      return;
    }

    setIsSaving(true);
    try {
      await updateCategory(categoryToEdit.id, { title: trimmed });
      toast.success("Category title updated");
      setShowEditModal(false);
      setCategoryToEdit(null);
      refreshCategoryData(true);
    } catch {
      toast.error("Failed to update category title");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDelete = (category: Category, e: React.MouseEvent) => {
    e.stopPropagation();
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    try {
      await deleteCategory(categoryToDelete.id);
      toast.success("Category and nested items deleted");
      setShowDeleteModal(false);
      setCategoryToDelete(null);
      refreshCategoryData(true);
    } catch {
      toast.error("Failed to delete category");
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper for dynamic expense rows
  const addExpenseRow = (type: "items" | "tax_deductions") => {
    setExpenseForm((prev) => ({
      ...prev,
      [type]: [...prev[type], { description: "", amount: "" }],
    }));
  };

  const removeExpenseRow = (
    type: "items" | "tax_deductions",
    index: number
  ) => {
    setExpenseForm((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const updateExpenseRow = (
    type: "items" | "tax_deductions",
    index: number,
    field: "description" | "amount",
    value: string
  ) => {
    setExpenseForm((prev) => ({
      ...prev,
      [type]: prev[type].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  return (
    <div className="space-y-8">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <FolderTree className="text-blue-400" size={28} />
            Categories Management
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Organize expenses and medications under unified categories with aggregated financials.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => refreshCategoryData(true)}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60 transition-all"
            title="Refresh categories"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin text-blue-400" : ""}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/25 active:scale-95"
          >
            <Plus size={18} />
            Create Category
          </button>
        </div>
      </div>

      {/* Summary Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="h-10 w-10 bg-slate-700 rounded-xl mb-3" />
              <div className="h-4 bg-slate-700 rounded w-24 mb-2" />
              <div className="h-6 bg-slate-700 rounded w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Total Categories */}
          <div className="glass-card p-6 relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 bg-blue-900/25 text-blue-400 border border-blue-800/40">
              <Layers size={22} />
            </div>
            <p className="text-sm font-medium text-slate-400">Total Categories</p>
            <p className="text-2xl font-bold text-white mt-1">{totalCategories}</p>
          </div>

          {/* Card 2: Categorized Expenses */}
          <div className="glass-card p-6 relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 bg-emerald-900/25 text-emerald-400 border border-emerald-800/40">
              <Receipt size={22} />
            </div>
            <p className="text-sm font-medium text-slate-400">
              Categorized Expenses ({totalExpensesCount})
            </p>
            <p className="text-2xl font-bold text-white mt-1">
              ₱{totalExpensesAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          {/* Card 3: Categorized Medications */}
          <div className="glass-card p-6 relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 bg-purple-900/25 text-purple-400 border border-purple-800/40">
              <Pill size={22} />
            </div>
            <p className="text-sm font-medium text-slate-400">
              Categorized Meds ({totalMedsCount})
            </p>
            <p className="text-2xl font-bold text-white mt-1">
              ₱{totalMedsAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          {/* Card 4: Overall Spend */}
          <div className="glass-card p-6 relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 bg-amber-900/25 text-amber-400 border border-amber-800/40">
              <DollarSign size={22} />
            </div>
            <p className="text-sm font-medium text-slate-400">Overall Spend</p>
            <p className="text-2xl font-bold text-white mt-1">
              ₱{totalCombinedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      )}

      {/* Category Cards Grid */}
      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 size={36} className="animate-spin text-blue-500" />
        </div>
      ) : categories.length === 0 ? (
        <div className="glass-card p-12 text-center max-w-xl mx-auto my-6 border border-dashed border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-blue-900/20 text-blue-400 border border-blue-800/40 flex items-center justify-center mx-auto mb-4 shadow-inner">
            <FolderTree size={32} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No categories yet</h3>
          <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
            Create your first category to group and organize expenses and medications in one place.
          </p>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/25"
          >
            <Plus size={18} />
            Create Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const expCount = category.expenses?.length || 0;
            const medCount = category.medications?.length || 0;
            const formattedDate = category.created_at
              ? new Date(category.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "Recently";

            return (
              <div
                key={category.id}
                onClick={() => navigate(`/categories/${category.id}`)}
                className="glass-card p-6 flex flex-col justify-between hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 cursor-pointer group relative overflow-hidden"
              >
                {/* Subtle top indicator */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-60 group-hover:opacity-100 transition-opacity" />

                <div>
                  {/* Title & Quick Actions */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                        {category.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <Calendar size={13} />
                        <span>Created {formattedDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleOpenEdit(category, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800/80 transition-colors"
                        title="Edit title"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={(e) => handleOpenDelete(category, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                        title="Delete category"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Badges / Aggregate Pills */}
                  <div className="grid grid-cols-2 gap-2 my-4">
                    <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-2.5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                        <Receipt size={13} className="text-emerald-400" />
                        <span>Expenses</span>
                      </div>
                      <p className="text-sm font-semibold text-white">
                        ₱{(category.total_expenses_amount || 0).toLocaleString()}
                      </p>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-2.5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                        <Pill size={13} className="text-purple-400" />
                        <span>Medications</span>
                      </div>
                      <p className="text-sm font-semibold text-white">
                        ₱{(category.total_medications_amount || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Combined Total Spend Highlight */}
                  <div className="bg-blue-950/30 border border-blue-900/40 rounded-xl p-3 flex items-center justify-between mb-4">
                    <span className="text-xs font-medium text-blue-300">Combined Total</span>
                    <span className="text-base font-bold text-blue-200">
                      ₱{(category.total_amount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Footer preview & navigation cue */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>
                    {expCount} {expCount === 1 ? "Expense" : "Expenses"} • {medCount}{" "}
                    {medCount === 1 ? "Medication" : "Medications"}
                  </span>
                  <span className="flex items-center gap-1 text-blue-400 group-hover:translate-x-1 transition-transform font-medium">
                    View details <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═════════════════════════════════════════════════════
          CREATE CATEGORY MODAL
          ═════════════════════════════════════════════════════ */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="glass-card p-6 max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto border-slate-700 animate-[scaleIn_0.2s_ease-out]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Plus size={20} className="text-blue-400" />
                Create New Category
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-6">
              {/* Category Title */}
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Category Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Living & Healthcare, Freelance & Wellness"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Optional Inline Expense */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeExpense}
                      onChange={(e) => setIncludeExpense(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Add initial Expense Sheet (Optional)</span>
                  </label>
                  {includeExpense && (
                    <Receipt size={16} className="text-emerald-400" />
                  )}
                </div>

                {includeExpense && (
                  <div className="space-y-4 pt-3 border-t border-slate-800/80">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">
                          Sheet Title
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. September Salary & Expenses"
                          value={expenseForm.title}
                          onChange={(e) =>
                            setExpenseForm((f) => ({ ...f, title: e.target.value }))
                          }
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">
                          Gross Income (₱)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={expenseForm.gross_income}
                          onChange={(e) =>
                            setExpenseForm((f) => ({
                              ...f,
                              gross_income: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Expense Items */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-slate-400">Expense Items</span>
                        <button
                          type="button"
                          onClick={() => addExpenseRow("items")}
                          className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                        >
                          + Add Row
                        </button>
                      </div>
                      {expenseForm.items.map((item, idx) => (
                        <div key={idx} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            placeholder="Description"
                            value={item.description}
                            onChange={(e) =>
                              updateExpenseRow("items", idx, "description", e.target.value)
                            }
                            className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                          />
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Amount"
                            value={item.amount}
                            onChange={(e) =>
                              updateExpenseRow("items", idx, "amount", e.target.value)
                            }
                            className="w-24 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                          />
                          {expenseForm.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeExpenseRow("items", idx)}
                              className="p-1 text-slate-400 hover:text-red-400"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Optional Inline Medication */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeMedication}
                      onChange={(e) => setIncludeMedication(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Add initial Medication (Optional)</span>
                  </label>
                  {includeMedication && <Pill size={16} className="text-purple-400" />}
                </div>

                {includeMedication && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800/80">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Medication Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Multivitamins"
                        value={medicationForm.name}
                        onChange={(e) =>
                          setMedicationForm((f) => ({ ...f, name: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Cost per Dose (₱)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={medicationForm.cost}
                        onChange={(e) =>
                          setMedicationForm((f) => ({ ...f, cost: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Doses Taken
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={medicationForm.doses_taken}
                        onChange={(e) =>
                          setMedicationForm((f) => ({
                            ...f,
                            doses_taken: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={isSaving}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all"
                >
                  {isSaving && <Loader2 size={16} className="animate-spin" />}
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════
          EDIT TITLE MODAL
          ═════════════════════════════════════════════════════ */}
      {showEditModal && categoryToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-card p-6 max-w-md w-full border-slate-700 animate-[scaleIn_0.2s_ease-out]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit3 size={18} className="text-blue-400" />
                Edit Category Title
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Category Title
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl text-sm text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-lg shadow-blue-500/25"
                >
                  {isSaving && <Loader2 size={15} className="animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════
          CASCADE DELETE WARNING MODAL
          ═════════════════════════════════════════════════════ */}
      {showDeleteModal && categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-card p-6 max-w-md w-full border-red-900/50 bg-slate-900/95 animate-[scaleIn_0.2s_ease-out]">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-red-900/30 border border-red-800/40 text-red-400 flex items-center justify-center shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Delete Category?</h3>
                <p className="text-sm text-slate-300 mt-1">
                  Are you sure you want to delete <strong className="text-white">"{categoryToDelete.title}"</strong>?
                </p>
              </div>
            </div>

            <div className="bg-red-950/40 border border-red-900/40 rounded-xl p-3.5 mb-6 text-xs text-red-200">
              <strong className="block font-semibold mb-1">Cascade Delete Warning:</strong>
              This action is permanent and will cascade-delete all associated expenses ({categoryToDelete.expenses?.length || 0}) and medications ({categoryToDelete.medications?.length || 0}) under this category.
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25 transition-all"
              >
                {isDeleting && <Loader2 size={16} className="animate-spin" />}
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
