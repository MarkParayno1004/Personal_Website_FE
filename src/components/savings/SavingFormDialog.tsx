import { useState, useEffect, useMemo, type FormEvent } from "react";
import {
  X,
  Plus,
  Trash2,
  Receipt,
  PiggyBank,
  Loader2,
  DollarSign,
  Layers,
  Sparkles,
  Link2,
} from "lucide-react";
import toast from "react-hot-toast";
import { createSaving, updateSaving } from "../../api/savings";
import { getExpenses } from "../../api/expenses";
import type { Saving, Expense, CreateSavingPayload, UpdateSavingPayload } from "../../types";

export interface SavingFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (saving: Saving) => void;
  saving?: Saving | null;
  initialExpenseId?: number | null;
  availableExpenses?: Expense[];
}

interface ItemRow {
  id?: number;
  description: string;
  amount: string;
}

export default function SavingFormDialog({
  isOpen,
  onClose,
  onSuccess,
  saving = null,
  initialExpenseId = null,
  availableExpenses,
}: SavingFormDialogProps) {
  const isEditing = Boolean(saving);

  // Form states (parent remounts this dialog via `key` on open / saving change)
  const [title, setTitle] = useState(saving?.title || "");
  const [expenseId, setExpenseId] = useState<string>(() => {
    const id = saving ? saving.expense_id : initialExpenseId;
    return id !== null && id !== undefined ? String(id) : "";
  });
  const [items, setItems] = useState<ItemRow[]>(() =>
    saving?.items && saving.items.length > 0
      ? saving.items.map((item) => ({
          id: item.id,
          description: item.description,
          amount: String(item.amount ?? ""),
        }))
      : [{ description: "", amount: "" }]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Expenses list: use props when provided, otherwise fetch
  const hasPassedExpenses = Boolean(availableExpenses?.length);
  const [fetchedExpenses, setFetchedExpenses] = useState<Expense[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(isOpen && !hasPassedExpenses);
  const expenses = availableExpenses?.length ? availableExpenses : fetchedExpenses;

  // Load available expenses if not passed in props
  useEffect(() => {
    if (!isOpen || hasPassedExpenses) return;

    let isMounted = true;

    getExpenses()
      .then((data) => {
        if (isMounted) {
          setFetchedExpenses(data);
        }
      })
      .catch(() => {
        if (isMounted) {
          toast.error("Failed to load expenses list");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoadingExpenses(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, hasPassedExpenses]);

  // Calculate live subtotal
  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => {
      const parsed = parseFloat(item.amount);
      return sum + (isNaN(parsed) ? 0 : parsed);
    }, 0);
  }, [items]);

  // Handlers for dynamic item list
  const handleAddItem = () => {
    setItems((prev) => [...prev, { description: "", amount: "" }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => {
      if (prev.length <= 1) {
        return [{ description: "", amount: "" }];
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleItemChange = (
    index: number,
    field: "description" | "amount",
    value: string
  ) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleClearParentExpense = () => {
    setExpenseId("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      toast.error("Saving title is required");
      return;
    }

    // Filter valid items (having non-empty description or non-zero amount)
    const validItems = items
      .filter((item) => item.description.trim() !== "" || item.amount.trim() !== "")
      .map((item) => ({
        ...(item.id ? { id: item.id } : {}),
        description: item.description.trim() || "Item",
        amount: parseFloat(item.amount) || 0,
      }));

    const parsedExpenseId = expenseId !== "" ? parseInt(expenseId, 10) : null;

    setIsSubmitting(true);
    const toastId = toast.loading(
      isEditing ? "Updating saving..." : "Creating saving..."
    );

    try {
      let result: Saving;
      if (isEditing && saving) {
        const payload: UpdateSavingPayload = {
          title: trimmedTitle,
          expense_id: parsedExpenseId,
          items: validItems,
        };
        result = await updateSaving(saving.id, payload);
        toast.success(`Saving "${trimmedTitle}" updated successfully!`, {
          id: toastId,
        });
      } else {
        const payload: CreateSavingPayload = {
          title: trimmedTitle,
          expense_id: parsedExpenseId,
          items: validItems,
        };
        result = await createSaving(payload);
        toast.success(`Saving "${trimmedTitle}" created successfully!`, {
          id: toastId,
        });
      }

      onSuccess?.(result);
      onClose();
    } catch {
      toast.error(
        isEditing ? "Failed to update saving" : "Failed to create saving",
        { id: toastId }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const selectedExpense = expenses.find((e) => String(e.id) === expenseId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-[fadeIn_0.2s_ease-out]">
      <div className="glass-card max-w-2xl w-full my-6 max-h-[92vh] flex flex-col border-slate-700 bg-slate-900/95 shadow-2xl rounded-2xl overflow-hidden animate-[scaleIn_0.2s_ease-out]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-900/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shadow-md shadow-emerald-500/10">
              <PiggyBank size={22} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                {isEditing ? "Edit Saving" : "Create New Saving"}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isEditing
                  ? "Update saving details, dynamic items, or parent assignment."
                  : "Track your savings goal, breakdown items, and optional parent expense sheet."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Saving Title (Required) */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Saving Title <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Sparkles
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400/70"
              />
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. Emergency Fund, Travel Savings, Chase Cashback"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm font-medium transition-all"
              />
            </div>
          </div>

          {/* Parent Expense Selector (Optional) */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/90 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Receipt size={14} className="text-amber-400" />
                Parent Expense Selector (Optional)
              </label>
              {expenseId !== "" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  <Link2 size={11} /> Linked
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <select
                  value={expenseId}
                  onChange={(e) => setExpenseId(e.target.value)}
                  disabled={(loadingExpenses && !hasPassedExpenses) || isSubmitting}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer appearance-none pr-8 font-medium transition-all"
                >
                  <option value="" className="bg-slate-900 text-amber-300 font-semibold">
                    None / Standalone Saving
                  </option>
                  {expenses.map((expense) => {
                    const expAmount =
                      expense.total_expenses ?? expense.total_amount ?? 0;
                    return (
                      <option
                        key={expense.id}
                        value={expense.id}
                        className="bg-slate-900 text-white"
                      >
                        {expense.title || `Expense #${expense.id}`}{" "}
                        {expAmount > 0
                          ? `(₱${expAmount.toLocaleString()})`
                          : ""}
                      </option>
                    );
                  })}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                  ▼
                </div>
              </div>

              {/* Quick "Clear / Remove Parent" button next to dropdown */}
              {expenseId !== "" && (
                <button
                  type="button"
                  onClick={handleClearParentExpense}
                  disabled={isSubmitting}
                  className="px-3 py-2.5 rounded-xl text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 transition-all shrink-0 flex items-center gap-1.5"
                  title="Clear Parent Expense (Set to Standalone)"
                >
                  <X size={14} />
                  Clear Parent
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-400">
              {expenseId !== "" && selectedExpense ? (
                <span className="text-emerald-400">
                  Linked to: <strong>{selectedExpense.title}</strong>. This saving will be nested inside the expense sheet.
                </span>
              ) : (
                "Standalone savings appear in their own dedicated section and are not deducted from any specific expense sheet."
              )}
            </p>
          </div>

          {/* Dynamic Item List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Layers size={16} className="text-emerald-400" />
                  Dynamic Item List
                </label>
                <p className="text-xs text-slate-400 mt-0.5">
                  Add itemized contributions, funds, or sub-savings.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-colors"
              >
                <Plus size={14} />
                Add Item Row
              </button>
            </div>

            <div className="space-y-2.5">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 group hover:border-slate-700 transition-all"
                >
                  <div className="text-xs font-mono text-slate-500 w-5 text-center shrink-0">
                    {idx + 1}.
                  </div>

                  {/* Description input */}
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      placeholder="Item description (e.g. Weekly deposit, Bonus)"
                      value={item.description}
                      onChange={(e) =>
                        handleItemChange(idx, "description", e.target.value)
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>

                  {/* Amount input */}
                  <div className="w-32 relative shrink-0">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                      ₱
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={item.amount}
                      onChange={(e) =>
                        handleItemChange(idx, "amount", e.target.value)
                      }
                      className="w-full pl-6 pr-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium transition-all"
                    />
                  </div>

                  {/* Remove Row Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                    title="Remove this row"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Subtotal Pill */}
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <DollarSign size={14} className="text-emerald-400" />
                Calculated Total Savings:
              </span>
              <span className="text-emerald-400 font-bold text-sm">
                ₱{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-4 shrink-0">
          <div className="text-xs text-slate-400">
            {expenseId !== "" ? (
              <span className="text-emerald-300 font-medium">
                Parent: {selectedExpense?.title || `Expense #${expenseId}`}
              </span>
            ) : (
              <span className="text-amber-300 font-medium">
                Mode: Standalone Saving
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Create Saving"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
