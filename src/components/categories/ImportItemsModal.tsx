import { useState, useEffect, useMemo } from "react";
import {
  X,
  Link2,
  Receipt,
  Pill,
  Search,
  CheckSquare,
  Square,
  Loader2,
  DollarSign,
  AlertCircle,
  FolderTree,
} from "lucide-react";
import toast from "react-hot-toast";
import { getExpenses } from "../../api/expenses";
import { getMedications } from "../../api/medications";
import { linkCategoryItems } from "../../api/categories";
import type { Expense, Medication, Category } from "../../types";

interface ImportItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: number;
  categoryTitle: string;
  onSuccess?: (updatedCategory?: Category) => void;
}

export default function ImportItemsModal({
  isOpen,
  onClose,
  categoryId,
  categoryTitle,
  onSuccess,
}: ImportItemsModalProps) {
  const [loadingItems, setLoadingItems] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [uncategorizedExpenses, setUncategorizedExpenses] = useState<Expense[]>([]);
  const [uncategorizedMedications, setUncategorizedMedications] = useState<Medication[]>([]);

  const [selectedExpenseIds, setSelectedExpenseIds] = useState<Set<number>>(new Set());
  const [selectedMedicationIds, setSelectedMedicationIds] = useState<Set<number>>(new Set());

  const [activeTab, setActiveTab] = useState<"all" | "expenses" | "medications">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const resetSelection = () => {
    setSelectedExpenseIds(new Set());
    setSelectedMedicationIds(new Set());
    setSearchQuery("");
  };

  const handleModalClose = () => {
    resetSelection();
    onClose();
  };

  // Load uncategorized items when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    Promise.all([
      getExpenses(true).catch(() => [] as Expense[]),
      getMedications(true).catch(() => [] as Medication[]),
    ])
      .then(([expenses, medications]) => {
        if (isMounted) {
          // Double ensure only uncategorized items (category_id === null or undefined)
          const filteredExpenses = expenses.filter(
            (e) => e.category_id === null || e.category_id === undefined
          );
          const filteredMedications = medications.filter(
            (m) => m.category_id === null || m.category_id === undefined
          );
          setUncategorizedExpenses(filteredExpenses);
          setUncategorizedMedications(filteredMedications);
        }
      })
      .catch(() => {
        if (isMounted) {
          toast.error("Failed to load uncategorized items");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoadingItems(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Filtered lists based on search query
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

  // Calculations for selection totals
  const selectedExpensesList = useMemo(
    () => uncategorizedExpenses.filter((e) => selectedExpenseIds.has(e.id)),
    [uncategorizedExpenses, selectedExpenseIds]
  );

  const selectedMedicationsList = useMemo(
    () => uncategorizedMedications.filter((m) => selectedMedicationIds.has(m.id)),
    [uncategorizedMedications, selectedMedicationIds]
  );

  const selectedExpensesAmount = useMemo(
    () =>
      selectedExpensesList.reduce(
        (sum, e) => sum + (e.total_expenses ?? e.total_amount ?? 0),
        0
      ),
    [selectedExpensesList]
  );

  const selectedMedicationsAmount = useMemo(
    () =>
      selectedMedicationsList.reduce((sum, m) => {
        const spent =
          m.total_spent !== undefined ? m.total_spent : (m.cost || 0) * (m.doses_taken || 0);
        return sum + spent;
      }, 0),
    [selectedMedicationsList]
  );

  const totalSelectedCount = selectedExpenseIds.size + selectedMedicationIds.size;
  const grandSelectedAmount = selectedExpensesAmount + selectedMedicationsAmount;

  // Toggle helpers
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
    const allFilteredSelected = filteredExpenses.every((e) => selectedExpenseIds.has(e.id));
    setSelectedExpenseIds((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        filteredExpenses.forEach((e) => next.delete(e.id));
      } else {
        filteredExpenses.forEach((e) => next.add(e.id));
      }
      return next;
    });
  };

  const toggleAllMedications = () => {
    const allFilteredSelected = filteredMedications.every((m) =>
      selectedMedicationIds.has(m.id)
    );
    setSelectedMedicationIds((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        filteredMedications.forEach((m) => next.delete(m.id));
      } else {
        filteredMedications.forEach((m) => next.add(m.id));
      }
      return next;
    });
  };

  const handleLinkSubmit = async () => {
    if (totalSelectedCount === 0) {
      toast.error("Please select at least one item to import");
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading(`Importing ${totalSelectedCount} item(s)...`);

    try {
      const payload = {
        expense_ids: Array.from(selectedExpenseIds),
        medication_ids: Array.from(selectedMedicationIds),
      };

      const updatedCategory = await linkCategoryItems(categoryId, payload);
      toast.success(
        `Successfully linked ${totalSelectedCount} item(s) to "${categoryTitle}"!`,
        { id: toastId }
      );
      onClose();
      if (onSuccess) {
        onSuccess(updatedCategory);
      }
    } catch {
      toast.error("Failed to link items to category", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const hasNoUncategorizedItems =
    !loadingItems &&
    uncategorizedExpenses.length === 0 &&
    uncategorizedMedications.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="glass-card max-w-3xl w-full my-6 max-h-[92vh] flex flex-col border-slate-700 bg-slate-900/95 shadow-2xl animate-[scaleIn_0.2s_ease-out] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-900/80 shrink-0">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
              <FolderTree size={14} />
              <span>Target Category: {categoryTitle}</span>
            </div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Link2 size={22} className="text-amber-400" />
              Import & Link Uncategorized Items
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Select existing standalone expenses or medications to associate them with this category without duplicating data.
            </p>
          </div>
          <button
            onClick={handleModalClose}
            disabled={submitting}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search & Tabs Toolbar */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/40 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items by name or description..."
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* View Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 self-stretch sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "all"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                All ({uncategorizedExpenses.length + uncategorizedMedications.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("expenses")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "expenses"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Receipt size={13} />
                Expenses ({uncategorizedExpenses.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("medications")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "medications"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Pill size={13} />
                Meds ({uncategorizedMedications.length})
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loadingItems ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
              <Loader2 size={32} className="animate-spin text-blue-500" />
              <span className="text-sm">Scanning for uncategorized items...</span>
            </div>
          ) : hasNoUncategorizedItems ? (
            <div className="py-16 text-center max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <AlertCircle size={28} />
              </div>
              <h4 className="text-base font-bold text-white mb-1">
                No Uncategorized Items Available
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                All existing expenses and medications are currently assigned to a category. You can create new ones or unlink existing items from other categories.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* EXPENSES SECTION */}
              {(activeTab === "all" || activeTab === "expenses") && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-900/30 text-emerald-400 border border-emerald-800/40 flex items-center justify-center">
                        <Receipt size={13} />
                      </div>
                      <h4 className="text-sm font-bold text-white">
                        Uncategorized Expenses ({filteredExpenses.length})
                      </h4>
                    </div>

                    {filteredExpenses.length > 0 && (
                      <button
                        type="button"
                        onClick={toggleAllExpenses}
                        className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1.5 transition-colors"
                      >
                        {filteredExpenses.every((e) => selectedExpenseIds.has(e.id)) ? (
                          <>
                            <CheckSquare size={14} /> Deselect All
                          </>
                        ) : (
                          <>
                            <Square size={14} /> Select All
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {filteredExpenses.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-500">
                      {searchQuery
                        ? "No uncategorized expenses match your search query."
                        : "No uncategorized expenses found."}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {filteredExpenses.map((expense) => {
                        const isSelected = selectedExpenseIds.has(expense.id);
                        const expenseAmount =
                          expense.total_expenses ?? expense.total_amount ?? 0;
                        const itemsCount = expense.items?.length || 0;

                        return (
                          <div
                            key={expense.id}
                            onClick={() => toggleExpense(expense.id)}
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                              isSelected
                                ? "bg-emerald-950/25 border-emerald-500/60 shadow-md shadow-emerald-900/10"
                                : "bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
                            }`}
                          >
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className="mt-0.5 shrink-0 text-emerald-400">
                                {isSelected ? (
                                  <CheckSquare size={18} className="text-emerald-400" />
                                ) : (
                                  <Square size={18} className="text-slate-600" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-white truncate">
                                  {expense.title}
                                </p>
                                <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                                  <span>{itemsCount} item{itemsCount === 1 ? "" : "s"}</span>
                                  <span>•</span>
                                  <span className="text-slate-300">
                                    Gross: ₱{(expense.gross_income || 0).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-xs text-slate-400 block">Spent</span>
                              <span className="text-sm font-bold text-red-400">
                                ₱{expenseAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* MEDICATIONS SECTION */}
              {(activeTab === "all" || activeTab === "medications") && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-purple-900/30 text-purple-400 border border-purple-800/40 flex items-center justify-center">
                        <Pill size={13} />
                      </div>
                      <h4 className="text-sm font-bold text-white">
                        Uncategorized Medications ({filteredMedications.length})
                      </h4>
                    </div>

                    {filteredMedications.length > 0 && (
                      <button
                        type="button"
                        onClick={toggleAllMedications}
                        className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1.5 transition-colors"
                      >
                        {filteredMedications.every((m) => selectedMedicationIds.has(m.id)) ? (
                          <>
                            <CheckSquare size={14} /> Deselect All
                          </>
                        ) : (
                          <>
                            <Square size={14} /> Select All
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {filteredMedications.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-500">
                      {searchQuery
                        ? "No uncategorized medications match your search query."
                        : "No uncategorized medications found."}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                              isSelected
                                ? "bg-purple-950/25 border-purple-500/60 shadow-md shadow-purple-900/10"
                                : "bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
                            }`}
                          >
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className="mt-0.5 shrink-0 text-purple-400">
                                {isSelected ? (
                                  <CheckSquare size={18} className="text-purple-400" />
                                ) : (
                                  <Square size={18} className="text-slate-600" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-white truncate">
                                  {med.name}
                                </p>
                                <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                                  <span>{med.doses_taken || 0} doses</span>
                                  <span>•</span>
                                  <span>₱{(med.cost || 0).toLocaleString()}/dose</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-xs text-slate-400 block">Total Spent</span>
                              <span className="text-sm font-bold text-purple-300">
                                ₱{spent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer with Summary & Submit Button */}
        <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          {/* Summary Badges */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <span className="text-slate-400">Selected Items: </span>
              <strong className="text-white font-bold">{totalSelectedCount}</strong>
              <span className="text-slate-500 ml-1">
                ({selectedExpenseIds.size} exp, {selectedMedicationIds.size} med)
              </span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-blue-950/30 border border-blue-800/40 text-xs flex items-center gap-1.5">
              <DollarSign size={13} className="text-amber-400" />
              <span className="text-blue-300">Subtotal: </span>
              <strong className="text-amber-300 font-bold">
                ₱{grandSelectedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </strong>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleModalClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleLinkSubmit}
              disabled={submitting || totalSelectedCount === 0}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/25 active:scale-95"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Linking...
                </>
              ) : (
                <>
                  <Link2 size={16} />
                  Link Selected ({totalSelectedCount})
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
