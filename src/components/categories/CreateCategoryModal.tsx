import { useState, useEffect, useMemo, type FormEvent } from "react";
import {
  X,
  Plus,
  Receipt,
  Pill,
  Loader2,
  ChevronDown,
  ChevronUp,
  Search,
  CheckSquare,
  Square,
  DollarSign,
  Link2,
  Layers,
} from "lucide-react";
import toast from "react-hot-toast";
import { createCategory } from "../../api/categories";
import { getExpenses } from "../../api/expenses";
import { getMedications } from "../../api/medications";
import type { Expense, Medication, CreateCategoryPayload } from "../../types";

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateCategoryModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateCategoryModalProps) {
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [loadingUncategorized, setLoadingUncategorized] = useState(false);

  // Uncategorized items
  const [uncategorizedExpenses, setUncategorizedExpenses] = useState<Expense[]>([]);
  const [uncategorizedMedications, setUncategorizedMedications] = useState<Medication[]>([]);

  // Selection states
  const [selectedExpenseIds, setSelectedExpenseIds] = useState<Set<number>>(new Set());
  const [selectedMedicationIds, setSelectedMedicationIds] = useState<Set<number>>(new Set());

  // Collapsible section toggles
  const [isAttachOpen, setIsAttachOpen] = useState(true);
  const [isNewItemsOpen, setIsNewItemsOpen] = useState(false);

  // Search filter inside attach section
  const [searchQuery, setSearchQuery] = useState("");
  const [attachTab, setAttachTab] = useState<"all" | "expenses" | "medications">("all");

  // Optional new inline expense form
  const [includeNewExpense, setIncludeNewExpense] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    title: "",
    gross_income: "",
    items: [{ description: "", amount: "" }],
    tax_deductions: [{ description: "", amount: "" }],
  });

  // Optional new inline medication form
  const [includeNewMedication, setIncludeNewMedication] = useState(false);
  const [medicationForm, setMedicationForm] = useState({
    name: "",
    cost: "",
    doses_taken: "0",
  });

  const resetForm = () => {
    setTitle("");
    setSelectedExpenseIds(new Set());
    setSelectedMedicationIds(new Set());
    setSearchQuery("");
    setIncludeNewExpense(false);
    setIncludeNewMedication(false);
    setExpenseForm({
      title: "",
      gross_income: "",
      items: [{ description: "", amount: "" }],
      tax_deductions: [{ description: "", amount: "" }],
    });
    setMedicationForm({
      name: "",
      cost: "",
      doses_taken: "0",
    });
  };

  const handleModalClose = () => {
    resetForm();
    onClose();
  };

  // Fetch uncategorized items whenever modal opens
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    Promise.all([
      getExpenses(true).catch(() => [] as Expense[]),
      getMedications(true).catch(() => [] as Medication[]),
    ])
      .then(([expenses, medications]) => {
        if (isMounted) {
          setUncategorizedExpenses(
            expenses.filter((e) => e.category_id === null || e.category_id === undefined)
          );
          setUncategorizedMedications(
            medications.filter((m) => m.category_id === null || m.category_id === undefined)
          );
        }
      })
      .catch(() => {
        if (isMounted) {
          toast.error("Failed to load uncategorized items");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoadingUncategorized(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Filtered lists
  const filteredExpenses = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return uncategorizedExpenses;
    return uncategorizedExpenses.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.items?.some((i) => i.description.toLowerCase().includes(q))
    );
  }, [uncategorizedExpenses, searchQuery]);

  const filteredMedications = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return uncategorizedMedications;
    return uncategorizedMedications.filter((m) =>
      m.name.toLowerCase().includes(q)
    );
  }, [uncategorizedMedications, searchQuery]);

  // Selected totals
  const selectedExpensesList = useMemo(
    () => uncategorizedExpenses.filter((e) => selectedExpenseIds.has(e.id)),
    [uncategorizedExpenses, selectedExpenseIds]
  );

  const selectedMedicationsList = useMemo(
    () => uncategorizedMedications.filter((m) => selectedMedicationIds.has(m.id)),
    [uncategorizedMedications, selectedMedicationIds]
  );

  const selectedExpensesSubtotal = useMemo(
    () =>
      selectedExpensesList.reduce(
        (sum, e) => sum + (e.total_expenses ?? e.total_amount ?? 0),
        0
      ),
    [selectedExpensesList]
  );

  const selectedMedicationsSubtotal = useMemo(
    () =>
      selectedMedicationsList.reduce((sum, m) => {
        const spent =
          m.total_spent !== undefined ? m.total_spent : (m.cost || 0) * (m.doses_taken || 0);
        return sum + spent;
      }, 0),
    [selectedMedicationsList]
  );

  const totalSelectedCount = selectedExpenseIds.size + selectedMedicationIds.size;
  const grandSelectedSubtotal = selectedExpensesSubtotal + selectedMedicationsSubtotal;

  // Selection handlers
  const toggleExpense = (id: number) => {
    setSelectedExpenseIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleMedication = (id: number) => {
    setSelectedMedicationIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllExpenses = () => {
    const allSelected = filteredExpenses.every((e) => selectedExpenseIds.has(e.id));
    setSelectedExpenseIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        filteredExpenses.forEach((e) => next.delete(e.id));
      } else {
        filteredExpenses.forEach((e) => next.add(e.id));
      }
      return next;
    });
  };

  const toggleAllMedications = () => {
    const allSelected = filteredMedications.every((m) => selectedMedicationIds.has(m.id));
    setSelectedMedicationIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        filteredMedications.forEach((m) => next.delete(m.id));
      } else {
        filteredMedications.forEach((m) => next.add(m.id));
      }
      return next;
    });
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      toast.error("Category title is required");
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Creating category...");

    try {
      const payload: CreateCategoryPayload = {
        title: trimmedTitle,
      };

      if (selectedExpenseIds.size > 0) {
        payload.expense_ids = Array.from(selectedExpenseIds);
      }

      if (selectedMedicationIds.size > 0) {
        payload.medication_ids = Array.from(selectedMedicationIds);
      }

      if (includeNewExpense && expenseForm.title.trim()) {
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

      if (includeNewMedication && medicationForm.name.trim()) {
        payload.medications = [
          {
            name: medicationForm.name.trim(),
            cost: parseFloat(medicationForm.cost) || 0,
            doses_taken: parseInt(medicationForm.doses_taken) || 0,
          },
        ];
      }

      await createCategory(payload);
      toast.success(
        `Category "${trimmedTitle}" created with ${totalSelectedCount} attached items!`,
        { id: toastId }
      );
      onClose();
      onSuccess();
    } catch {
      toast.error("Failed to create category", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const totalAvailableUncategorized =
    uncategorizedExpenses.length + uncategorizedMedications.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="glass-card max-w-3xl w-full my-6 max-h-[92vh] flex flex-col border-slate-700 bg-slate-900/95 shadow-2xl animate-[scaleIn_0.2s_ease-out] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-900/80 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Plus size={22} className="text-blue-400" />
              Create New Category
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Give your category a title and optionally attach existing uncategorized items.
            </p>
          </div>
          <button
            onClick={handleModalClose}
            disabled={isSaving}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Category Title <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Layers size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. Monthly Living, Medical & Healthcare, Side Projects"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm font-medium"
              />
            </div>
          </div>

          {/* Collapsible Section 1: Attach Existing Uncategorized Items */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/50 overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => setIsAttachOpen(!isAttachOpen)}
              className="w-full p-4 flex items-center justify-between gap-3 bg-slate-900/80 hover:bg-slate-900 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                  <Link2 size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    Attach Existing Uncategorized Items
                    {totalSelectedCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-xs font-semibold">
                        {totalSelectedCount} selected
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-slate-400">
                    Import existing items into this category ({totalAvailableUncategorized} available)
                  </p>
                </div>
              </div>
              <div className="text-slate-400 p-1">
                {isAttachOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </button>

            {isAttachOpen && (
              <div className="p-4 border-t border-slate-800 space-y-4">
                {loadingUncategorized ? (
                  <div className="py-8 flex items-center justify-center text-slate-400 gap-2">
                    <Loader2 size={20} className="animate-spin text-blue-500" />
                    <span className="text-xs">Loading uncategorized items...</span>
                  </div>
                ) : totalAvailableUncategorized === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
                    No uncategorized items currently available. You can add new items below or later.
                  </div>
                ) : (
                  <>
                    {/* Search & Sub-tabs */}
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <div className="relative flex-1 w-full">
                        <Search
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                        />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search uncategorized..."
                          className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 shrink-0">
                        <button
                          type="button"
                          onClick={() => setAttachTab("all")}
                          className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                            attachTab === "all"
                              ? "bg-blue-600 text-white"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          All ({totalAvailableUncategorized})
                        </button>
                        <button
                          type="button"
                          onClick={() => setAttachTab("expenses")}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                            attachTab === "expenses"
                              ? "bg-emerald-600 text-white"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          <Receipt size={12} />
                          Exp ({uncategorizedExpenses.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setAttachTab("medications")}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                            attachTab === "medications"
                              ? "bg-purple-600 text-white"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          <Pill size={12} />
                          Meds ({uncategorizedMedications.length})
                        </button>
                      </div>
                    </div>

                    {/* Uncategorized Expenses */}
                    {(attachTab === "all" || attachTab === "expenses") && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                            <Receipt size={13} /> Expenses ({filteredExpenses.length})
                          </span>
                          {filteredExpenses.length > 0 && (
                            <button
                              type="button"
                              onClick={toggleAllExpenses}
                              className="text-slate-400 hover:text-emerald-300 flex items-center gap-1"
                            >
                              {filteredExpenses.every((e) => selectedExpenseIds.has(e.id)) ? (
                                <>
                                  <CheckSquare size={13} /> Deselect All
                                </>
                              ) : (
                                <>
                                  <Square size={13} /> Select All
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                          {filteredExpenses.map((exp) => {
                            const isSelected = selectedExpenseIds.has(exp.id);
                            const amount = exp.total_expenses ?? exp.total_amount ?? 0;
                            return (
                              <div
                                key={exp.id}
                                onClick={() => toggleExpense(exp.id)}
                                className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 cursor-pointer transition-all ${
                                  isSelected
                                    ? "bg-emerald-950/30 border-emerald-500/50"
                                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  {isSelected ? (
                                    <CheckSquare size={15} className="text-emerald-400 shrink-0" />
                                  ) : (
                                    <Square size={15} className="text-slate-600 shrink-0" />
                                  )}
                                  <span className="font-medium text-white truncate">{exp.title}</span>
                                </div>
                                <span className="font-bold text-red-400 shrink-0">
                                  ₱{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Uncategorized Medications */}
                    {(attachTab === "all" || attachTab === "medications") && (
                      <div className="space-y-2 pt-2 border-t border-slate-800/60">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-purple-400 flex items-center gap-1.5">
                            <Pill size={13} /> Medications ({filteredMedications.length})
                          </span>
                          {filteredMedications.length > 0 && (
                            <button
                              type="button"
                              onClick={toggleAllMedications}
                              className="text-slate-400 hover:text-purple-300 flex items-center gap-1"
                            >
                              {filteredMedications.every((m) => selectedMedicationIds.has(m.id)) ? (
                                <>
                                  <CheckSquare size={13} /> Deselect All
                                </>
                              ) : (
                                <>
                                  <Square size={13} /> Select All
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                          {filteredMedications.map((med) => {
                            const isSelected = selectedMedicationIds.has(med.id);
                            const spent =
                              med.total_spent !== undefined
                                ? med.total_spent
                                : (med.cost || 0) * (med.doses_taken || 0);
                            return (
                              <div
                                key={med.id}
                                onClick={() => toggleMedication(med.id)}
                                className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 cursor-pointer transition-all ${
                                  isSelected
                                    ? "bg-purple-950/30 border-purple-500/50"
                                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  {isSelected ? (
                                    <CheckSquare size={15} className="text-purple-400 shrink-0" />
                                  ) : (
                                    <Square size={15} className="text-slate-600 shrink-0" />
                                  )}
                                  <span className="font-medium text-white truncate">{med.name}</span>
                                </div>
                                <span className="font-bold text-purple-300 shrink-0">
                                  ₱{spent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Attachment Selection Summary Bar */}
                    {totalSelectedCount > 0 && (
                      <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-900/40 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="text-blue-300">
                          {totalSelectedCount} items selected ({selectedExpenseIds.size} expenses,{" "}
                          {selectedMedicationIds.size} meds)
                        </span>
                        <span className="text-amber-300 font-bold">
                          Subtotal: ₱{grandSelectedSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Collapsible Section 2: Optional Create New Inline Items */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/50 overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => setIsNewItemsOpen(!isNewItemsOpen)}
              className="w-full p-4 flex items-center justify-between gap-3 bg-slate-900/80 hover:bg-slate-900 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                  <Plus size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Create New Items Simultaneously (Optional)</h4>
                  <p className="text-xs text-slate-400">Add a brand new expense sheet or medication directly</p>
                </div>
              </div>
              <div className="text-slate-400 p-1">
                {isNewItemsOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </button>

            {isNewItemsOpen && (
              <div className="p-4 border-t border-slate-800 space-y-4">
                {/* Optional Inline Expense */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeNewExpense}
                        onChange={(e) => setIncludeNewExpense(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Add New Expense Sheet</span>
                    </label>
                    {includeNewExpense && <Receipt size={16} className="text-emerald-400" />}
                  </div>

                  {includeNewExpense && (
                    <div className="space-y-3 pt-3 border-t border-slate-800/80">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Sheet Title</label>
                          <input
                            type="text"
                            placeholder="e.g. Initial Monthly Budget"
                            value={expenseForm.title}
                            onChange={(e) => setExpenseForm((f) => ({ ...f, title: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Gross Income (₱)</label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={expenseForm.gross_income}
                            onChange={(e) => setExpenseForm((f) => ({ ...f, gross_income: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      {/* Items */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-slate-400">Expense Items</span>
                          <button
                            type="button"
                            onClick={() => addExpenseRow("items")}
                            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
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
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeNewMedication}
                        onChange={(e) => setIncludeNewMedication(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-purple-600 focus:ring-purple-500"
                      />
                      <span>Add New Medication</span>
                    </label>
                    {includeNewMedication && <Pill size={16} className="text-purple-400" />}
                  </div>

                  {includeNewMedication && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800/80">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Medication Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Vitamin C"
                          value={medicationForm.name}
                          onChange={(e) => setMedicationForm((f) => ({ ...f, name: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Cost per Dose (₱)</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={medicationForm.cost}
                          onChange={(e) => setMedicationForm((f) => ({ ...f, cost: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Initial Doses</label>
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={medicationForm.doses_taken}
                          onChange={(e) => setMedicationForm((f) => ({ ...f, doses_taken: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="text-xs text-slate-400">
            {totalSelectedCount > 0 ? (
              <span className="text-blue-300 font-medium flex items-center gap-1.5">
                <DollarSign size={14} className="text-amber-400" />
                Will attach {totalSelectedCount} existing items (₱{grandSelectedSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })})
              </span>
            ) : (
              <span>Empty category ready to be created</span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleModalClose}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving || !title.trim()}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/25 active:scale-95"
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Create Category
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
