import { useState, useEffect } from "react";
import {
  X,
  Link2,
  Unlink,
  Receipt,
  Check,
  Loader2,
  Search,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { linkSaving, unlinkSaving } from "../../api/savings";
import { getExpenses } from "../../api/expenses";
import type { Saving, Expense } from "../../types";

export interface LinkExpenseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  saving: Saving | null;
  expenses?: Expense[];
  onSuccess?: (updatedSaving: Saving) => void;
}

export default function LinkExpenseDialog({
  isOpen,
  onClose,
  saving,
  expenses: passedExpenses,
  onSuccess,
}: LinkExpenseDialogProps) {
  const hasPassedExpenses = Boolean(passedExpenses?.length);
  const [fetchedExpenses, setFetchedExpenses] = useState<Expense[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(isOpen && !hasPassedExpenses);
  const expenses = passedExpenses?.length ? passedExpenses : fetchedExpenses;
  // Parent remounts this dialog via `key` on open / saving change
  const [selectedExpenseId, setSelectedExpenseId] = useState<number | null>(
    saving?.expense_id ?? null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load expenses if not passed in
  useEffect(() => {
    if (!isOpen || hasPassedExpenses) return;

    getExpenses()
      .then((data) => setFetchedExpenses(data))
      .catch(() => toast.error("Failed to load expenses"))
      .finally(() => setLoadingExpenses(false));
  }, [isOpen, hasPassedExpenses]);

  if (!isOpen || !saving) return null;

  const currentLinkedExpense = expenses.find((e) => e.id === saving.expense_id);
  const isCurrentlyLinked = Boolean(saving.expense_id);

  const filteredExpenses = expenses.filter((e) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      e.title.toLowerCase().includes(q) ||
      e.items?.some((i) => i.description.toLowerCase().includes(q))
    );
  });

  const handleLink = async (targetExpenseId: number | null) => {
    if (!saving) return;

    setIsSubmitting(true);
    const toastId = toast.loading(
      targetExpenseId === null
        ? "Unlinking saving..."
        : "Attaching saving to expense..."
    );

    try {
      let updated: Saving;
      if (targetExpenseId === null) {
        updated = await unlinkSaving(saving.id);
        toast.success(`"${saving.title}" is now Standalone`, { id: toastId });
      } else {
        updated = await linkSaving(saving.id, targetExpenseId);
        const expName =
          expenses.find((e) => e.id === targetExpenseId)?.title ||
          `Expense #${targetExpenseId}`;
        toast.success(`"${saving.title}" linked to "${expName}"`, {
          id: toastId,
        });
      }

      onSuccess?.(updated);
      onClose();
    } catch {
      toast.error("Failed to update parent expense assignment", {
        id: toastId,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-[fadeIn_0.2s_ease-out]">
      <div className="glass-card max-w-lg w-full my-6 flex flex-col border-slate-700 bg-slate-900/95 shadow-2xl rounded-2xl overflow-hidden animate-[scaleIn_0.2s_ease-out]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-900/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <Link2 size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Assign Parent Expense
              </h3>
              <p className="text-xs text-slate-400 truncate max-w-xs">
                Saving: <strong className="text-emerald-400">{saving.title}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Current status banner */}
        <div className="px-5 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">Current Status:</span>
          {isCurrentlyLinked ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium bg-blue-900/40 text-blue-300 border border-blue-700/50">
              <Link2 size={12} /> Linked to:{" "}
              <strong className="text-white">
                {currentLinkedExpense?.title || `Expense #${saving.expense_id}`}
              </strong>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30">
              <Sparkles size={12} /> Standalone Saving
            </span>
          )}
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Search bar */}
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Option: Standalone (None) */}
          <div
            onClick={() => setSelectedExpenseId(null)}
            className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-3 ${
              selectedExpenseId === null
                ? "bg-amber-950/30 border-amber-500/60 text-white"
                : "bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                  selectedExpenseId === null
                    ? "bg-amber-500 text-slate-950"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                Ø
              </div>
              <div>
                <p className="font-semibold text-white">None (Standalone)</p>
                <p className="text-[11px] text-slate-400">
                  Keep saving independent without linking to an expense sheet.
                </p>
              </div>
            </div>
            {selectedExpenseId === null && (
              <Check size={16} className="text-amber-400 shrink-0" />
            )}
          </div>

          {/* Expense Options List */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Receipt size={13} className="text-blue-400" />
              Available Expenses ({filteredExpenses.length})
            </div>

            {loadingExpenses ? (
              <div className="py-8 flex items-center justify-center gap-2 text-xs text-slate-400">
                <Loader2 size={16} className="animate-spin text-blue-400" />
                Loading expenses...
              </div>
            ) : filteredExpenses.length === 0 ? (
              <div className="p-4 rounded-xl text-center text-xs text-slate-500 bg-slate-950/30 border border-dashed border-slate-800">
                No matching expenses found.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {filteredExpenses.map((exp) => {
                  const isSelected = selectedExpenseId === exp.id;
                  const isCurrent = saving.expense_id === exp.id;
                  const total = exp.total_expenses ?? exp.total_amount ?? 0;

                  return (
                    <div
                      key={exp.id}
                      onClick={() => setSelectedExpenseId(exp.id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-blue-950/40 border-blue-500/70 text-white"
                          : "bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white truncate">
                            {exp.title}
                          </span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Gross: ₱{(exp.gross_income || 0).toLocaleString()} •
                          Total: ₱{total.toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isSelected && (
                          <Check size={16} className="text-blue-400" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3 shrink-0">
          <div>
            {isCurrentlyLinked && (
              <button
                type="button"
                onClick={() => handleLink(null)}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 transition-colors"
              >
                <Unlink size={13} />
                Unlink from Expense
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleLink(selectedExpenseId)}
              disabled={isSubmitting || selectedExpenseId === saving.expense_id}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Assignment"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
