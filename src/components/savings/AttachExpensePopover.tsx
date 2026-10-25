import { useState, useRef, useEffect } from "react";
import { Link2, Unlink, Check, Loader2, X, Receipt, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { linkSaving, unlinkSaving } from "../../api/savings";
import type { Saving, Expense } from "../../types";

export interface AttachExpensePopoverProps {
  saving: Saving;
  expenses: Expense[];
  onUpdated?: (updatedSaving: Saving) => void;
  className?: string;
  triggerButtonClassName?: string;
  compact?: boolean;
}

export default function AttachExpensePopover({
  saving,
  expenses,
  onUpdated,
  className = "",
  triggerButtonClassName = "",
  compact = false,
}: AttachExpensePopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);

  const isLinked = saving.expense_id !== null && saving.expense_id !== undefined;
  const currentExpense = expenses.find((e) => e.id === saving.expense_id);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectExpense = async (expenseId: number | null) => {
    setLoading(true);
    const toastId = toast.loading(
      expenseId === null ? "Unlinking..." : "Attaching expense..."
    );

    try {
      let result: Saving;
      if (expenseId === null) {
        result = await unlinkSaving(saving.id);
        toast.success(`"${saving.title}" is now standalone`, { id: toastId });
      } else {
        result = await linkSaving(saving.id, expenseId);
        const exp = expenses.find((e) => e.id === expenseId);
        toast.success(`Linked to "${exp?.title || `Expense #${expenseId}`}"`, {
          id: toastId,
        });
      }
      onUpdated?.(result);
      setIsOpen(false);
    } catch {
      toast.error("Failed to update parent expense", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const filteredExpenses = expenses.filter((e) => {
    if (!search.trim()) return true;
    return e.title.toLowerCase().includes(search.toLowerCase().trim());
  });

  return (
    <div className={`relative inline-block ${className}`} ref={popoverRef}>
      {/* Trigger Button */}
      {isLinked ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={loading}
          className={
            triggerButtonClassName ||
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 border border-blue-700/40 transition-all cursor-pointer"
          }
          title="Click to change or unlink parent expense"
        >
          <Link2 size={12} className="text-blue-400" />
          <span className="truncate max-w-[140px]">
            {compact
              ? currentExpense?.title || `Exp #${saving.expense_id}`
              : `Linked: ${currentExpense?.title || `Exp #${saving.expense_id}`}`}
          </span>
          {loading && <Loader2 size={11} className="animate-spin text-blue-400" />}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={loading}
          className={
            triggerButtonClassName ||
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer"
          }
          title="Click to attach to an expense sheet"
        >
          <Link2 size={12} className="text-emerald-400" />
          <span>Attach to Expense</span>
          {loading && <Loader2 size={11} className="animate-spin text-emerald-400" />}
        </button>
      )}

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-3 space-y-2.5 animate-[fadeIn_0.15s_ease-out]">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Receipt size={13} className="text-amber-400" />
              Assign Expense Sheet
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X size={13} />
            </button>
          </div>

          {/* Quick Search */}
          {expenses.length > 5 && (
            <input
              type="text"
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          )}

          {/* Standalone Option */}
          <button
            type="button"
            onClick={() => handleSelectExpense(null)}
            className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
              !isLinked
                ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold"
                : "text-slate-300 hover:bg-slate-800/80"
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles size={13} className="text-amber-400" />
              <span>Standalone (No Parent)</span>
            </div>
            {!isLinked && <Check size={14} className="text-amber-400" />}
          </button>

          {/* List of Available Expenses */}
          <div className="max-h-48 overflow-y-auto space-y-1 pr-0.5">
            {filteredExpenses.map((expense) => {
              const isSelected = saving.expense_id === expense.id;
              const expTotal =
                expense.total_expenses ?? expense.total_amount ?? 0;
              return (
                <button
                  key={expense.id}
                  type="button"
                  onClick={() => handleSelectExpense(expense.id)}
                  className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                    isSelected
                      ? "bg-blue-900/40 text-blue-200 border border-blue-600/50 font-semibold"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className="truncate font-medium text-white">
                      {expense.title}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      ₱{expTotal.toLocaleString()}
                    </p>
                  </div>
                  {isSelected && (
                    <Check size={14} className="text-blue-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* If linked, show explicit Unlink button at bottom */}
          {isLinked && (
            <div className="pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => handleSelectExpense(null)}
                className="w-full py-1.5 px-2 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/10 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Unlink size={12} />
                Unlink from Expense
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
