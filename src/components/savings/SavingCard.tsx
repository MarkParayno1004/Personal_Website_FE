import { useState } from "react";
import {
  PiggyBank,
  Edit3,
  Trash2,
  Link2,
  Unlink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
  DollarSign,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { unlinkSaving, deleteSaving } from "../../api/savings";
import AttachExpensePopover from "./AttachExpensePopover";
import type { Saving, Expense } from "../../types";

export interface SavingCardProps {
  saving: Saving;
  expenses: Expense[];
  onEdit: (saving: Saving) => void;
  onDeleteSuccess: (savingId: number) => void;
  onLinkUpdated: (updatedSaving: Saving) => void;
  onOpenLinkModal?: (saving: Saving) => void;
  variant?: "card" | "row" | "compact";
  showParentBadge?: boolean;
}

export default function SavingCard({
  saving,
  expenses,
  onEdit,
  onDeleteSuccess,
  onLinkUpdated,
  onOpenLinkModal,
  variant = "card",
  showParentBadge = true,
}: SavingCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isLinked = saving.expense_id !== null && saving.expense_id !== undefined;
  const parentExpense = expenses.find((e) => e.id === saving.expense_id);
  const parentTitle =
    parentExpense?.title ||
    saving.expense_title ||
    (saving.expense && saving.expense.title) ||
    (saving.expense_id ? `Expense #${saving.expense_id}` : "");

  const totalAmount =
    saving.total_amount !== undefined
      ? saving.total_amount
      : (saving.items || []).reduce(
          (sum, item) => sum + (Number(item.amount) || 0),
          0
        );

  const itemsCount = saving.items?.length || 0;

  // Unlink quick action handler
  const handleQuickUnlink = async () => {
    setIsUnlinking(true);
    const toastId = toast.loading(`Unlinking "${saving.title}"...`);
    try {
      const updated = await unlinkSaving(saving.id);
      toast.success(`"${saving.title}" unlinked to Standalone`, {
        id: toastId,
      });
      onLinkUpdated(updated);
    } catch {
      toast.error("Failed to unlink saving from expense", { id: toastId });
    } finally {
      setIsUnlinking(false);
    }
  };

  // Delete action handler
  const handleDelete = async () => {
    setIsDeleting(true);
    const toastId = toast.loading(`Deleting saving "${saving.title}"...`);
    try {
      await deleteSaving(saving.id);
      toast.success(`Saving "${saving.title}" deleted`, { id: toastId });
      setShowDeleteConfirm(false);
      onDeleteSuccess(saving.id);
    } catch {
      toast.error("Failed to delete saving", { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  /* Compact variant (e.g. inside an expense list) */
  if (variant === "compact") {
    return (
      <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 hover:border-emerald-500/50 transition-all">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <PiggyBank size={15} />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-white text-xs truncate">
                {saving.title}
              </p>
              <p className="text-[11px] text-slate-400">
                {itemsCount} {itemsCount === 1 ? "item" : "items"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-emerald-400">
              ₱{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <button
              onClick={() => onEdit(saving)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Edit saving"
            >
              <Edit3 size={13} />
            </button>
            <button
              onClick={handleQuickUnlink}
              disabled={isUnlinking}
              className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Unlink from this expense"
            >
              {isUnlinking ? (
                <Loader2 size={13} className="animate-spin text-amber-400" />
              ) : (
                <Unlink size={13} />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* Full Card Variant */
  return (
    <div className="glass-card p-5 border-slate-800 hover:border-emerald-500/30 transition-all relative overflow-hidden group">
      {/* Subtle emerald highlight gradient on hover */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/40 via-teal-500/40 to-transparent" />

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
        {/* Left: Title & Badge */}
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <PiggyBank size={18} />
            </div>
            <h4 className="text-base font-bold text-white truncate">
              {saving.title}
            </h4>

            {/* Parent Expense Badge */}
            {showParentBadge && (
              <>
                {isLinked ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-900/30 text-blue-300 border border-blue-800/40">
                    <Link2 size={11} className="text-blue-400" />
                    Linked to: {parentTitle}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    <Sparkles size={11} className="text-amber-400" />
                    Standalone
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Add / Remove Parent quick action */}
          {isLinked ? (
            <button
              type="button"
              onClick={handleQuickUnlink}
              disabled={isUnlinking}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 transition-all"
              title="Unlink from Expense"
            >
              {isUnlinking ? (
                <Loader2 size={12} className="animate-spin text-red-400" />
              ) : (
                <Unlink size={12} />
              )}
              <span>Unlink</span>
            </button>
          ) : onOpenLinkModal ? (
            <button
              type="button"
              onClick={() => onOpenLinkModal(saving)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all"
              title="Attach to an Expense Sheet"
            >
              <Link2 size={12} />
              <span>Attach to Expense</span>
            </button>
          ) : (
            <AttachExpensePopover
              saving={saving}
              expenses={expenses}
              onUpdated={onLinkUpdated}
            />
          )}

          {/* Edit Button */}
          <button
            type="button"
            onClick={() => onEdit(saving)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-300 hover:bg-slate-800 transition-colors"
            title="Edit saving"
          >
            <Edit3 size={15} />
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
            title="Delete saving"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-3">
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <p className="text-[11px] text-slate-400">Total Savings</p>
          <p className="text-sm sm:text-base font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
            <DollarSign size={14} className="text-emerald-500/70" />
            ₱{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <p className="text-[11px] text-slate-400">Items Count</p>
          <p className="text-sm sm:text-base font-bold text-white flex items-center gap-1 mt-0.5">
            <Layers size={14} className="text-slate-400" />
            {itemsCount} {itemsCount === 1 ? "entry" : "entries"}
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 col-span-2 sm:col-span-1">
          <p className="text-[11px] text-slate-400">Parent Expense</p>
          <p className="text-xs sm:text-sm font-semibold text-slate-200 truncate mt-0.5">
            {isLinked ? parentTitle : "None (Standalone)"}
          </p>
        </div>
      </div>

      {/* Dynamic Item List Accordion */}
      {itemsCount > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-800/70">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-between w-full text-xs text-slate-400 hover:text-slate-200 font-medium transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Layers size={13} className="text-emerald-400" />
              {isExpanded ? "Hide item breakdown" : `View ${itemsCount} items breakdown`}
            </span>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {isExpanded && (
            <div className="mt-2.5 space-y-1.5 animate-[fadeIn_0.15s_ease-out]">
              {saving.items?.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 border border-slate-800/70 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-slate-500 font-mono text-[10px]">
                      {idx + 1}.
                    </span>
                    <span className="text-slate-200 truncate">
                      {item.description || "Unlabeled item"}
                    </span>
                  </div>
                  <span className="font-semibold text-emerald-400 shrink-0">
                    ₱{(Number(item.amount) || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-[fadeIn_0.15s_ease-out]">
          <div className="glass-card max-w-md w-full p-6 border-red-500/40 bg-slate-900 shadow-2xl rounded-2xl animate-[scaleIn_0.15s_ease-out]">
            <div className="flex items-center gap-3 text-red-400 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>
              <h4 className="text-lg font-bold text-white">Delete Saving?</h4>
            </div>

            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <strong className="text-white">"{saving.title}"</strong> (₱
              {totalAmount.toLocaleString()})? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" /> Deleting...
                  </>
                ) : (
                  "Confirm Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
