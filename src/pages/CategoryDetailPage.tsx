import { useState, useEffect, useCallback, type FormEvent } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Receipt,
  Pill,
  DollarSign,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Loader2,
  Calendar,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Link2,
  Unlink,
  AlertTriangle,
  FolderTree,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getCategory,
  updateCategory,
  createCategoryExpense,
  createCategoryMedication,
  unlinkCategoryItems,
  linkCategoryItems,
} from "../api/categories";
import { getExpenses, deleteExpense } from "../api/expenses";
import { getMedications, deleteMedication, takeMedicationDose } from "../api/medications";
import ImportItemsModal from "../components/categories/ImportItemsModal";
import type {
  Category,
  Expense,
  Medication,
  CategoryExpenseCreatePayload,
  CategoryMedicationCreatePayload,
} from "../types";

interface UnlinkTarget {
  type: "expense" | "medication";
  id: number;
  title: string;
}

interface DeleteTarget {
  type: "expense" | "medication";
  id: number;
  title: string;
}

export default function CategoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const categoryId = id ? parseInt(id, 10) : null;

  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState<boolean>(() => !!categoryId && !isNaN(categoryId));
  const [activeTab, setActiveTab] = useState<"expenses" | "medications">("expenses");

  // Inline title edit
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState("");
  const [isSavingTitle, setIsSavingTitle] = useState(false);

  // Modals
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Unlink Modal State
  const [unlinkTarget, setUnlinkTarget] = useState<UnlinkTarget | null>(null);
  const [isUnlinking, setIsUnlinking] = useState(false);

  // Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Quick Link Dropdown State
  const [uncategorizedExpenses, setUncategorizedExpenses] = useState<Expense[]>([]);
  const [uncategorizedMeds, setUncategorizedMeds] = useState<Medication[]>([]);
  const [selectedQuickExpenseId, setSelectedQuickExpenseId] = useState<string>("");
  const [selectedQuickMedId, setSelectedQuickMedId] = useState<string>("");
  const [isQuickLinking, setIsQuickLinking] = useState(false);

  // Expandable expense accordion states
  const [expandedExpenses, setExpandedExpenses] = useState<Record<number, boolean>>({});

  // Expense form
  const [expenseForm, setExpenseForm] = useState({
    title: "",
    gross_income: "",
    items: [{ description: "", amount: "" }],
    tax_deductions: [{ description: "", amount: "" }],
  });

  // Medication form
  const [medForm, setMedForm] = useState({
    name: "",
    cost: "",
    doses_taken: "0",
  });

  const fetchUncategorized = useCallback(async () => {
    try {
      const [exp, med] = await Promise.all([
        getExpenses(true).catch(() => [] as Expense[]),
        getMedications(true).catch(() => [] as Medication[]),
      ]);
      setUncategorizedExpenses(exp.filter((e) => e.category_id === null || e.category_id === undefined));
      setUncategorizedMeds(med.filter((m) => m.category_id === null || m.category_id === undefined));
    } catch {
      // silent
    }
  }, []);

  const refreshCategory = useCallback(
    async (isSilent = false) => {
      if (!categoryId || isNaN(categoryId)) return;
      if (!isSilent) setLoading(true);

      try {
        const data = await getCategory(categoryId);
        setCategory(data);
        setEditTitleValue(data.title);
        fetchUncategorized();
      } catch {
        toast.error("Failed to load category details");
      } finally {
        setLoading(false);
      }
    },
    [categoryId, fetchUncategorized]
  );

  useEffect(() => {
    if (!categoryId || isNaN(categoryId)) {
      return;
    }

    let ignore = false;
    getCategory(categoryId)
      .then((data) => {
        if (!ignore) {
          setCategory(data);
          setEditTitleValue(data.title);
          setLoading(false);
          fetchUncategorized();
        }
      })
      .catch(() => {
        if (!ignore) {
          toast.error("Failed to load category details");
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [categoryId, fetchUncategorized]);

  const handleSaveTitle = async () => {
    if (!category || !categoryId) return;
    const trimmed = editTitleValue.trim();
    if (!trimmed) {
      toast.error("Category title cannot be empty");
      return;
    }

    setIsSavingTitle(true);
    try {
      await updateCategory(categoryId, { title: trimmed });
      setCategory((prev) => (prev ? { ...prev, title: trimmed } : null));
      setIsEditingTitle(false);
      toast.success("Category title updated");
    } catch {
      toast.error("Failed to update title");
    } finally {
      setIsSavingTitle(false);
    }
  };

  // ─── ADD EXPENSE ───
  const handleOpenAddExpense = () => {
    setExpenseForm({
      title: "",
      gross_income: "",
      items: [{ description: "", amount: "" }],
      tax_deductions: [{ description: "", amount: "" }],
    });
    setShowAddExpenseModal(true);
  };

  const handleAddExpenseSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!categoryId) return;
    const trimmedTitle = expenseForm.title.trim();
    if (!trimmedTitle) {
      toast.error("Expense title is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CategoryExpenseCreatePayload = {
        title: trimmedTitle,
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
      };

      await createCategoryExpense(categoryId, payload);
      toast.success("Expense added to category!");
      setShowAddExpenseModal(false);
      refreshCategory(true);
    } catch {
      toast.error("Failed to add expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── ADD MEDICATION ───
  const handleOpenAddMed = () => {
    setMedForm({
      name: "",
      cost: "",
      doses_taken: "0",
    });
    setShowAddMedModal(true);
  };

  const handleAddMedSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!categoryId) return;
    const trimmedName = medForm.name.trim();
    if (!trimmedName) {
      toast.error("Medication name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CategoryMedicationCreatePayload = {
        name: trimmedName,
        cost: parseFloat(medForm.cost) || 0,
        doses_taken: parseInt(medForm.doses_taken) || 0,
      };

      await createCategoryMedication(categoryId, payload);
      toast.success("Medication added to category!");
      setShowAddMedModal(false);
      refreshCategory(true);
    } catch {
      toast.error("Failed to add medication");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── QUICK LINK DROPDOWN ACTION ───
  const handleQuickLinkExpense = async () => {
    if (!categoryId || !selectedQuickExpenseId) return;
    const expId = parseInt(selectedQuickExpenseId, 10);
    if (isNaN(expId)) return;

    setIsQuickLinking(true);
    const toastId = toast.loading("Linking expense...");
    try {
      await linkCategoryItems(categoryId, { expense_ids: [expId] });
      toast.success("Expense linked to category!", { id: toastId });
      setSelectedQuickExpenseId("");
      refreshCategory(true);
    } catch {
      toast.error("Failed to link expense", { id: toastId });
    } finally {
      setIsQuickLinking(false);
    }
  };

  const handleQuickLinkMed = async () => {
    if (!categoryId || !selectedQuickMedId) return;
    const medId = parseInt(selectedQuickMedId, 10);
    if (isNaN(medId)) return;

    setIsQuickLinking(true);
    const toastId = toast.loading("Linking medication...");
    try {
      await linkCategoryItems(categoryId, { medication_ids: [medId] });
      toast.success("Medication linked to category!", { id: toastId });
      setSelectedQuickMedId("");
      refreshCategory(true);
    } catch {
      toast.error("Failed to link medication", { id: toastId });
    } finally {
      setIsQuickLinking(false);
    }
  };

  // ─── UNLINK ITEM ACTION ───
  const handleOpenUnlink = (type: "expense" | "medication", id: number, title: string) => {
    setUnlinkTarget({ type, id, title });
  };

  const handleConfirmUnlink = async () => {
    if (!categoryId || !unlinkTarget) return;

    setIsUnlinking(true);
    const toastId = toast.loading(`Detaching "${unlinkTarget.title}"...`);

    try {
      const payload =
        unlinkTarget.type === "expense"
          ? { expense_ids: [unlinkTarget.id] }
          : { medication_ids: [unlinkTarget.id] };

      await unlinkCategoryItems(categoryId, payload);
      toast.success(
        `"${unlinkTarget.title}" detached and moved to uncategorized!`,
        { id: toastId }
      );
      setUnlinkTarget(null);
      refreshCategory(true);
    } catch {
      toast.error("Failed to unlink item from category", { id: toastId });
    } finally {
      setIsUnlinking(false);
    }
  };

  // ─── DELETE ITEM ACTION ───
  const handleOpenDelete = (type: "expense" | "medication", id: number, title: string) => {
    setDeleteTarget({ type, id, title });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    const toastId = toast.loading(`Deleting "${deleteTarget.title}" permanently...`);

    try {
      if (deleteTarget.type === "expense") {
        await deleteExpense(deleteTarget.id);
      } else {
        await deleteMedication(deleteTarget.id);
      }
      toast.success(`"${deleteTarget.title}" deleted permanently!`, { id: toastId });
      setDeleteTarget(null);
      refreshCategory(true);
    } catch {
      toast.error("Failed to delete item", { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── TAKE DOSE ───
  const handleTakeDose = async (medId: number) => {
    try {
      await takeMedicationDose(medId, 1);
      toast.success("+1 dose logged!");
      refreshCategory(true);
    } catch {
      toast.error("Failed to log dose");
    }
  };

  const toggleExpenseExpand = (id: number) => {
    setExpandedExpenses((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Helper for dynamic expense rows
  const addExpenseRow = (type: "items" | "tax_deductions") => {
    setExpenseForm((prev) => ({
      ...prev,
      [type]: [...prev[type], { description: "", amount: "" }],
    }));
  };

  const removeExpenseRow = (type: "items" | "tax_deductions", index: number) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#15121c] pt-24 pb-16 flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-amber-500" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-[#15121c] pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="glass-card p-12">
            <h2 className="text-2xl font-bold text-white mb-2">Category Not Found</h2>
            <p className="text-slate-400 mb-6">The category you are looking for does not exist or has been deleted.</p>
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all"
            >
              <ArrowLeft size={16} /> Back to Categories
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formattedDate = category.created_at
    ? new Date(category.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const totalExpensesCount = category.expenses?.length || 0;
  const totalMedsCount = category.medications?.length || 0;

  return (
    <div className="min-h-screen bg-[#15121c] text-[#ece8f4] pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation & Header */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate("/categories")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft size={15} /> Back to Categories
            </button>
            <button
              onClick={() => refreshCategory(true)}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Refresh data"
            >
              <RefreshCw size={15} />
            </button>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Inline Editable Title */}
            <div className="flex-1">
              {isEditingTitle ? (
                <div className="flex items-center gap-2 max-w-lg">
                  <input
                    type="text"
                    value={editTitleValue}
                    onChange={(e) => setEditTitleValue(e.target.value)}
                    className="flex-1 px-4 py-2 bg-slate-900 border border-amber-500 rounded-xl text-xl sm:text-2xl font-bold text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveTitle}
                    disabled={isSavingTitle}
                    className="p-2.5 bg-amber-500 hover:bg-amber-600 text-[#15121c] font-bold rounded-xl shadow-md transition-colors"
                  >
                    {isSavingTitle ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                  </button>
                  <button
                    onClick={() => {
                      setEditTitleValue(category.title);
                      setIsEditingTitle(false);
                    }}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 group">
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
                    <FolderTree className="text-amber-400" size={32} />
                    {category.title}
                  </h1>
                  <button
                    onClick={() => setIsEditingTitle(true)}
                    className="p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-900 transition-colors opacity-80 group-hover:opacity-100"
                    title="Edit title"
                  >
                    <Edit3 size={18} />
                  </button>
                </div>
              )}
              {formattedDate && (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mt-1">
                  <Calendar size={14} />
                  <span>Created on {formattedDate}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Import / Link Uncategorized Items Button */}
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-[#15121c] font-semibold rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95 text-sm"
              >
                <Link2 size={17} />
                Import / Link Items
              </button>

              <button
                onClick={handleOpenAddExpense}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 text-sm"
              >
                <Receipt size={17} />
                + Add Expense
              </button>

              <button
                onClick={handleOpenAddMed}
                className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-purple-500/20 active:scale-95 text-sm"
              >
                <Pill size={17} />
                + Add Medication
              </button>
            </div>
          </div>
        </div>

        {/* Total Spending Breakdown Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {/* Expenses Total */}
          <div className="glass-card p-6 bg-gradient-to-br from-slate-900/90 to-emerald-950/20 border-emerald-900/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-emerald-400 flex items-center gap-1.5">
                <Receipt size={16} /> Total Expenses
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-900/40 text-emerald-300 border border-emerald-800/40">
                {totalExpensesCount} sheets
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              ₱{(category.total_expenses_amount || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          {/* Medications Total */}
          <div className="glass-card p-6 bg-gradient-to-br from-slate-900/90 to-purple-950/20 border-purple-900/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-400 flex items-center gap-1.5">
                <Pill size={16} /> Total Medications
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-900/40 text-purple-300 border border-purple-800/40">
                {totalMedsCount} meds
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              ₱{(category.total_medications_amount || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          {/* Combined Total */}
          <div className="glass-card p-6 bg-gradient-to-br from-slate-900/90 to-amber-950/20 border-amber-900/30 shadow-lg shadow-amber-500/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-amber-400 flex items-center gap-1.5">
                <DollarSign size={16} /> Combined Total
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-900/40 text-amber-300 border border-amber-700/40">
                Grand Total
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-200 mt-1">
              ₱{(category.total_amount || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>

        {/* Section Tabs & Quick Link Dropdowns */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("expenses")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "expenses"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Receipt size={17} />
              Expenses ({totalExpensesCount})
            </button>
            <button
              onClick={() => setActiveTab("medications")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "medications"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Pill size={17} />
              Medications ({totalMedsCount})
            </button>
          </div>

          {/* Quick Import Dropdown for Active Tab */}
          <div className="flex items-center gap-2">
            {activeTab === "expenses" ? (
              uncategorizedExpenses.length > 0 && (
                <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
                  <select
                    value={selectedQuickExpenseId}
                    onChange={(e) => setSelectedQuickExpenseId(e.target.value)}
                    className="bg-transparent text-xs text-slate-300 focus:outline-none px-2 py-1 max-w-[200px] truncate"
                  >
                    <option value="" className="bg-slate-900 text-slate-400">
                      Link uncategorized expense...
                    </option>
                    {uncategorizedExpenses.map((e) => (
                      <option key={e.id} value={e.id} className="bg-slate-900 text-white">
                        {e.title} (₱{(e.total_expenses ?? e.total_amount ?? 0).toLocaleString()})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleQuickLinkExpense}
                    disabled={!selectedQuickExpenseId || isQuickLinking}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-all"
                  >
                    Link
                  </button>
                </div>
              )
            ) : (
              uncategorizedMeds.length > 0 && (
                <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
                  <select
                    value={selectedQuickMedId}
                    onChange={(e) => setSelectedQuickMedId(e.target.value)}
                    className="bg-transparent text-xs text-slate-300 focus:outline-none px-2 py-1 max-w-[200px] truncate"
                  >
                    <option value="" className="bg-slate-900 text-slate-400">
                      Link uncategorized med...
                    </option>
                    {uncategorizedMeds.map((m) => (
                      <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                        {m.name} (₱{(m.cost || 0).toLocaleString()}/dose)
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleQuickLinkMed}
                    disabled={!selectedQuickMedId || isQuickLinking}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-all"
                  >
                    Link
                  </button>
                </div>
              )
            )}
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════
            EXPENSES TAB CONTENT
            ═════════════════════════════════════════════════════ */}
        {activeTab === "expenses" && (
          <div className="space-y-4">
            {!category.expenses || category.expenses.length === 0 ? (
              <div className="glass-card p-12 text-center border-dashed border-slate-800">
                <Receipt size={36} className="mx-auto text-slate-600 mb-3" />
                <h4 className="text-lg font-bold text-white mb-1">No expenses in this category</h4>
                <p className="text-sm text-slate-400 mb-5">
                  Link existing uncategorized expense sheets or create a brand new one.
                </p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <button
                    onClick={() => setShowImportModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-[#15121c] text-sm font-semibold rounded-xl transition-all shadow-md shadow-amber-500/20"
                  >
                    <Link2 size={16} /> Import Uncategorized
                  </button>
                  <button
                    onClick={handleOpenAddExpense}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-all"
                  >
                    <Plus size={16} /> Add First Expense
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {category.expenses.map((expense: Expense) => {
                  const isExpanded = !!expandedExpenses[expense.id];
                  const itemCount = expense.items?.length || 0;
                  const taxCount = expense.tax_deductions?.length || 0;

                  return (
                    <div
                      key={expense.id}
                      className="glass-card overflow-hidden border border-slate-800 hover:border-slate-700 transition-all"
                    >
                      {/* Expense Card Header */}
                      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-lg font-bold text-white">{expense.title}</h4>
                            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                              Linked
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                            <span>
                              Gross:{" "}
                              <strong className="text-slate-200">
                                ₱{(expense.gross_income || 0).toLocaleString()}
                              </strong>
                            </span>
                            <span>•</span>
                            <span>
                              Expenses:{" "}
                              <strong className="text-red-400">
                                ₱{(expense.total_expenses || expense.total_amount || 0).toLocaleString()}
                              </strong>
                            </span>
                            <span>•</span>
                            <span>
                              Remaining:{" "}
                              <strong className="text-emerald-400">
                                ₱{(expense.remaining_income || 0).toLocaleString()}
                              </strong>
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons: Breakdown, Unlink, Delete */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            onClick={() => toggleExpenseExpand(expense.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white transition-colors"
                          >
                            <span>{itemCount + taxCount} Breakdown</span>
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>

                          {/* Unlink button */}
                          <button
                            onClick={() => handleOpenUnlink("expense", expense.id, expense.title)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-amber-300 hover:bg-amber-500/20 transition-colors"
                            title="Unlink from category (move to uncategorized)"
                          >
                            <Unlink size={13} />
                            <span>Unlink</span>
                          </button>

                          {/* Permanent delete button */}
                          <button
                            onClick={() => handleOpenDelete("expense", expense.id, expense.title)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                            title="Permanently delete expense sheet"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Expandable Breakdown Drawer */}
                      {isExpanded && (
                        <div className="bg-slate-950/70 border-t border-slate-800/80 p-5 space-y-4 animate-[fadeIn_0.2s_ease-out]">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Expense Items */}
                            <div>
                              <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Receipt size={13} className="text-red-400" />
                                Expense Items ({itemCount})
                              </h5>
                              {itemCount === 0 ? (
                                <p className="text-xs text-slate-500 italic">No specific items listed.</p>
                              ) : (
                                <div className="space-y-1.5">
                                  {expense.items?.map((item, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-slate-900/90 border border-slate-800/60"
                                    >
                                      <span className="text-slate-300">{item.description}</span>
                                      <span className="font-semibold text-red-400">
                                        ₱{(item.amount || 0).toLocaleString()}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Tax Deductions */}
                            <div>
                              <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <DollarSign size={13} className="text-amber-400" />
                                Tax Deductions ({taxCount})
                              </h5>
                              {taxCount === 0 ? (
                                <p className="text-xs text-slate-500 italic">No tax deductions listed.</p>
                              ) : (
                                <div className="space-y-1.5">
                                  {expense.tax_deductions?.map((ded, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-slate-900/90 border border-slate-800/60"
                                    >
                                      <span className="text-slate-300">{ded.description}</span>
                                      <span className="font-semibold text-amber-400">
                                        ₱{(ded.amount || 0).toLocaleString()}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═════════════════════════════════════════════════════
            MEDICATIONS TAB CONTENT
            ═════════════════════════════════════════════════════ */}
        {activeTab === "medications" && (
          <div className="space-y-4">
            {!category.medications || category.medications.length === 0 ? (
              <div className="glass-card p-12 text-center border-dashed border-slate-800">
                <Pill size={36} className="mx-auto text-slate-600 mb-3" />
                <h4 className="text-lg font-bold text-white mb-1">No medications in this category</h4>
                <p className="text-sm text-slate-400 mb-5">
                  Import existing uncategorized medications or track a new one.
                </p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <button
                    onClick={() => setShowImportModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-[#15121c] text-sm font-semibold rounded-xl transition-all shadow-md shadow-amber-500/20"
                  >
                    <Link2 size={16} /> Import Uncategorized
                  </button>
                  <button
                    onClick={handleOpenAddMed}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl transition-all"
                  >
                    <Plus size={16} /> Add First Medication
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.medications.map((med: Medication) => {
                  const spent =
                    med.total_spent !== undefined
                      ? med.total_spent
                      : (med.cost || 0) * (med.doses_taken || 0);

                  return (
                    <div
                      key={med.id}
                      className="glass-card p-6 flex flex-col justify-between border border-slate-800 hover:border-purple-500/40 transition-all duration-200"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-purple-900/30 text-purple-400 border border-purple-800/40 flex items-center justify-center shrink-0">
                            <Pill size={20} />
                          </div>
                          <div className="flex items-center gap-1">
                            {/* Unlink button */}
                            <button
                              onClick={() => handleOpenUnlink("medication", med.id, med.name)}
                              className="p-1.5 rounded-lg text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10 transition-colors"
                              title="Unlink medication (move to uncategorized)"
                            >
                              <Unlink size={16} />
                            </button>
                            {/* Permanent delete button */}
                            <button
                              onClick={() => handleOpenDelete("medication", med.id, med.name)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                              title="Permanently delete medication"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <h4 className="text-lg font-bold text-white mb-2">{med.name}</h4>

                        <div className="space-y-2 py-3 border-y border-slate-800/80 text-xs">
                          <div className="flex justify-between text-slate-400">
                            <span>Cost per Dose:</span>
                            <strong className="text-slate-200">₱{(med.cost || 0).toLocaleString()}</strong>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Doses Logged:</span>
                            <strong className="text-purple-300 font-semibold">{med.doses_taken || 0}</strong>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Total Spent:</span>
                            <strong className="text-white font-bold">₱{spent.toLocaleString()}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 mt-2">
                        <button
                          onClick={() => handleTakeDose(med.id)}
                          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 font-medium rounded-xl transition-all duration-200 shadow-sm active:scale-95 text-xs sm:text-sm"
                        >
                          <Plus size={15} /> Take Dose (+1)
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═════════════════════════════════════════════════════
            IMPORT / LINK ITEMS MODAL
            ═════════════════════════════════════════════════════ */}
        {categoryId && (
          <ImportItemsModal
            isOpen={showImportModal}
            onClose={() => setShowImportModal(false)}
            categoryId={categoryId}
            categoryTitle={category.title}
            onSuccess={() => {
              refreshCategory(true);
            }}
          />
        )}

        {/* ═════════════════════════════════════════════════════
            UNLINK CONFIRMATION MODAL
            ═════════════════════════════════════════════════════ */}
        {unlinkTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="glass-card p-6 max-w-md w-full border-amber-500/40 bg-slate-900/95 shadow-2xl animate-[scaleIn_0.2s_ease-out]">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                  <Unlink size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Unlink Item</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Move "{unlinkTarget.title}" to Uncategorized
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed mb-6 space-y-1">
                <p>
                  This action will detach <strong className="text-white">"{unlinkTarget.title}"</strong> from category{" "}
                  <strong className="text-amber-300">"{category.title}"</strong>.
                </p>
                <p className="text-slate-400 pt-1">
                  💡 <em>The item and its financial records will NOT be deleted.</em> It will remain accessible under Uncategorized items.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setUnlinkTarget(null)}
                  disabled={isUnlinking}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmUnlink}
                  disabled={isUnlinking}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-[#15121c] shadow-lg shadow-amber-500/20 transition-all"
                >
                  {isUnlinking ? <Loader2 size={16} className="animate-spin" /> : <Unlink size={16} />}
                  Detach & Unlink
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════
            PERMANENT DELETE CONFIRMATION MODAL
            ═════════════════════════════════════════════════════ */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="glass-card p-6 max-w-md w-full border-red-500/40 bg-slate-900/95 shadow-2xl animate-[scaleIn_0.2s_ease-out]">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 shrink-0">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Permanently Delete Item</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Delete "{deleteTarget.title}"
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-900/40 text-xs text-red-200 leading-relaxed mb-6">
                Are you sure you want to permanently delete <strong className="text-white">"{deleteTarget.title}"</strong>? This will permanently remove it and all of its associated records from the database.
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25 transition-all"
                >
                  {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════
            ADD EXPENSE MODAL
            ═════════════════════════════════════════════════════ */}
        {showAddExpenseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
            <div className="glass-card p-6 max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto border-slate-700 animate-[scaleIn_0.2s_ease-out]">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Receipt size={20} className="text-emerald-400" />
                  Add Expense to "{category.title}"
                </h3>
                <button
                  onClick={() => setShowAddExpenseModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddExpenseSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Expense Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. October Budget Sheet"
                      value={expenseForm.title}
                      onChange={(e) =>
                        setExpenseForm((f) => ({ ...f, title: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
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
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3 p-4 bg-slate-900/60 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">Expense Items</span>
                    <button
                      type="button"
                      onClick={() => addExpenseRow("items")}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                    >
                      + Add Item
                    </button>
                  </div>
                  {expenseForm.items.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Description (e.g. Rent, Groceries)"
                        value={item.description}
                        onChange={(e) =>
                          updateExpenseRow("items", idx, "description", e.target.value)
                        }
                        className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Amount"
                        value={item.amount}
                        onChange={(e) =>
                          updateExpenseRow("items", idx, "amount", e.target.value)
                        }
                        className="w-28 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                      />
                      {expenseForm.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeExpenseRow("items", idx)}
                          className="p-1.5 text-slate-400 hover:text-red-400"
                        >
                          <X size={15} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Tax Deductions */}
                <div className="space-y-3 p-4 bg-slate-900/60 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">Tax Deductions</span>
                    <button
                      type="button"
                      onClick={() => addExpenseRow("tax_deductions")}
                      className="text-xs text-amber-400 hover:text-amber-300 font-medium"
                    >
                      + Add Deduction
                    </button>
                  </div>
                  {expenseForm.tax_deductions.map((ded, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Description (e.g. SSS, PhilHealth)"
                        value={ded.description}
                        onChange={(e) =>
                          updateExpenseRow("tax_deductions", idx, "description", e.target.value)
                        }
                        className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Amount"
                        value={ded.amount}
                        onChange={(e) =>
                          updateExpenseRow("tax_deductions", idx, "amount", e.target.value)
                        }
                        className="w-28 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                      />
                      {expenseForm.tax_deductions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeExpenseRow("tax_deductions", idx)}
                          className="p-1.5 text-slate-400 hover:text-red-400"
                        >
                          <X size={15} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddExpenseModal(false)}
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl text-sm text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25 transition-all"
                  >
                    {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                    Add Expense
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════
            ADD MEDICATION MODAL
            ═════════════════════════════════════════════════════ */}
        {showAddMedModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="glass-card p-6 max-w-md w-full border-slate-700 animate-[scaleIn_0.2s_ease-out]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Pill size={18} className="text-purple-400" />
                  Add Medication to "{category.title}"
                </h3>
                <button
                  onClick={() => setShowAddMedModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddMedSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Medication Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amoxicillin 500mg"
                    value={medForm.name}
                    onChange={(e) => setMedForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Cost per Dose (₱) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={medForm.cost}
                    onChange={(e) => setMedForm((f) => ({ ...f, cost: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Initial Doses Taken
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={medForm.doses_taken}
                    onChange={(e) =>
                      setMedForm((f) => ({ ...f, doses_taken: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddMedModal(false)}
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl text-sm text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/25 transition-all"
                  >
                    {isSubmitting && <Loader2 size={15} className="animate-spin" />}
                    Add Medication
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
