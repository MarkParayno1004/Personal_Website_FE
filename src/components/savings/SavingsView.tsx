import { useState, useEffect, useCallback, useMemo } from "react";
import {
  PiggyBank,
  Plus,
  RefreshCw,
  FolderTree,
  Receipt,
  LayoutGrid,
  Search,
  X,
  Link2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
  Table as TableIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { getSavings, unlinkSaving } from "../../api/savings";
import { getExpenses } from "../../api/expenses";
import SavingCard from "./SavingCard";
import SavingFormDialog from "./SavingFormDialog";
import LinkExpenseDialog from "./LinkExpenseDialog";
import type { Saving, Expense, SavingsFilterMode } from "../../types";

export interface SavingsViewProps {
  embedded?: boolean;
}

export default function SavingsView({ embedded = false }: SavingsViewProps) {
  // Data states
  const [savings, setSavings] = useState<Saving[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Presentation View Mode: "categorized" (Expense-Nested + Standalone) | "all" (All Savings List/Table)
  const [viewMode, setViewMode] = useState<"categorized" | "all">("categorized");

  // All Savings List Filters
  const [filterMode, setFilterMode] = useState<SavingsFilterMode>("all");
  const [selectedExpenseFilter, setSelectedExpenseFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [displayStyle, setDisplayStyle] = useState<"cards" | "table">("cards");

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingSaving, setEditingSaving] = useState<Saving | null>(null);
  const [formInitialExpenseId, setFormInitialExpenseId] = useState<number | null>(null);

  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkTargetSaving, setLinkTargetSaving] = useState<Saving | null>(null);

  // Unlink confirmation modal
  const [unlinkingSaving, setUnlinkingSaving] = useState<Saving | null>(null);
  const [isConfirmingUnlink, setIsConfirmingUnlink] = useState(false);

  // Collapsed expense sections in categorized view
  const [collapsedExpenses, setCollapsedExpenses] = useState<Record<number, boolean>>({});

  // Fetch all data
  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const [savingsData, expensesData] = await Promise.all([
        getSavings(),
        getExpenses(),
      ]);
      setSavings(savingsData);
      setExpenses(expensesData);
    } catch {
      toast.error("Failed to load savings or expenses");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Aggregate computations
  const totalSavingsAmount = useMemo(() => {
    return savings.reduce((sum, s) => {
      const amount =
        s.total_amount !== undefined
          ? s.total_amount
          : (s.items || []).reduce((iSum, i) => iSum + (Number(i.amount) || 0), 0);
      return sum + amount;
    }, 0);
  }, [savings]);

  const standaloneSavings = useMemo(() => {
    return savings.filter(
      (s) => s.expense_id === null || s.expense_id === undefined
    );
  }, [savings]);

  const standaloneAmount = useMemo(() => {
    return standaloneSavings.reduce((sum, s) => {
      const amount =
        s.total_amount !== undefined
          ? s.total_amount
          : (s.items || []).reduce((iSum, i) => iSum + (Number(i.amount) || 0), 0);
      return sum + amount;
    }, 0);
  }, [standaloneSavings]);

  const linkedSavings = useMemo(() => {
    return savings.filter(
      (s) => s.expense_id !== null && s.expense_id !== undefined
    );
  }, [savings]);

  const linkedAmount = useMemo(() => {
    return linkedSavings.reduce((sum, s) => {
      const amount =
        s.total_amount !== undefined
          ? s.total_amount
          : (s.items || []).reduce((iSum, i) => iSum + (Number(i.amount) || 0), 0);
      return sum + amount;
    }, 0);
  }, [linkedSavings]);

  const activeExpensesWithSavingsCount = useMemo(() => {
    const expenseIds = new Set(linkedSavings.map((s) => s.expense_id));
    return expenseIds.size;
  }, [linkedSavings]);

  // Map expenses with their nested savings
  const expensesWithNestedSavings = useMemo(() => {
    return expenses.map((exp) => {
      const nested = savings.filter((s) => s.expense_id === exp.id);
      const subtotalSavings = nested.reduce((sum, s) => {
        const amount =
          s.total_amount !== undefined
            ? s.total_amount
            : (s.items || []).reduce((iSum, i) => iSum + (Number(i.amount) || 0), 0);
        return sum + amount;
      }, 0);
      return {
        expense: exp,
        savings: nested,
        subtotalSavings,
      };
    });
  }, [expenses, savings]);

  // Filtered savings for "All Savings" view
  const filteredSavings = useMemo(() => {
    let list = savings;

    if (filterMode === "standalone") {
      list = list.filter(
        (s) => s.expense_id === null || s.expense_id === undefined
      );
    } else if (filterMode === "linked") {
      list = list.filter(
        (s) => s.expense_id !== null && s.expense_id !== undefined
      );
    }

    if (selectedExpenseFilter !== "all") {
      const expId = parseInt(selectedExpenseFilter, 10);
      list = list.filter((s) => s.expense_id === expId);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.items?.some((i) => i.description.toLowerCase().includes(q))
      );
    }

    return list;
  }, [savings, filterMode, selectedExpenseFilter, searchQuery]);

  // Handlers
  const handleOpenCreateModal = (initialExpId: number | null = null) => {
    setEditingSaving(null);
    setFormInitialExpenseId(initialExpId);
    setShowFormModal(true);
  };

  const handleOpenEditModal = (saving: Saving) => {
    setEditingSaving(saving);
    setFormInitialExpenseId(null);
    setShowFormModal(true);
  };

  const handleOpenLinkModal = (saving: Saving) => {
    setLinkTargetSaving(saving);
    setShowLinkModal(true);
  };

  const handleFormSuccess = () => {
    fetchData(true);
  };

  const handleDeleteSuccess = (deletedId: number) => {
    setSavings((prev) => prev.filter((s) => s.id !== deletedId));
  };

  const handleLinkUpdated = (updated: Saving) => {
    setSavings((prev) =>
      prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s))
    );
  };

  const toggleExpenseCollapse = (expId: number) => {
    setCollapsedExpenses((prev) => ({
      ...prev,
      [expId]: !prev[expId],
    }));
  };

  const handlePromptUnlink = (saving: Saving) => {
    setUnlinkingSaving(saving);
  };

  const handleConfirmUnlink = async () => {
    if (!unlinkingSaving) return;
    setIsConfirmingUnlink(true);
    const toastId = toast.loading(`Unlinking "${unlinkingSaving.title}"...`);
    try {
      const updated = await unlinkSaving(unlinkingSaving.id);
      toast.success(`"${unlinkingSaving.title}" is now Standalone`, {
        id: toastId,
      });
      handleLinkUpdated(updated);
      setUnlinkingSaving(null);
    } catch {
      toast.error("Failed to unlink saving", { id: toastId });
    } finally {
      setIsConfirmingUnlink(false);
    }
  };

  return (
    <div className={embedded ? "space-y-6" : "min-h-screen bg-[#15121c] text-[#ece8f4] pb-12"}>
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <PiggyBank size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                Savings & Piggy Bank
              </h2>
              <p className="text-xs text-slate-400">
                Manage standalone savings goals or nested expense-linked funds.
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Switcher & Global Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-slate-900/90 border border-slate-700/80 rounded-xl">
            <button
              onClick={() => setViewMode("categorized")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "categorized"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FolderTree size={13} />
              Categorized View
            </button>
            <button
              onClick={() => setViewMode("all")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "all"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <LayoutGrid size={13} />
              All Savings ({savings.length})
            </button>
          </div>

          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="p-2 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Refresh data"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin text-emerald-400" : ""}
            />
          </button>

          <button
            onClick={() => handleOpenCreateModal(null)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
          >
            <Plus size={16} />
            New Saving
          </button>
        </div>
      </div>

      {/* KPI Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Savings */}
        <div className="glass-card p-5 border-emerald-500/20 bg-emerald-950/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              Total Accumulated Savings
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <PiggyBank size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2">
            ₱{totalSavingsAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Across {savings.length} total saving {savings.length === 1 ? "fund" : "funds"}
          </p>
        </div>

        {/* Standalone Savings */}
        <div className="glass-card p-5 border-amber-500/20 bg-amber-950/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              Standalone (Unlinked) Savings
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Sparkles size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-300 mt-2">
            ₱{standaloneAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {standaloneSavings.length} unlinked {standaloneSavings.length === 1 ? "goal" : "goals"}
          </p>
        </div>

        {/* Attached Savings */}
        <div className="glass-card p-5 border-blue-500/20 bg-blue-950/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              Attached to Expenses
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Link2 size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-blue-300 mt-2">
            ₱{linkedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {linkedSavings.length} linked {linkedSavings.length === 1 ? "fund" : "funds"}
          </p>
        </div>

        {/* Linked Expense Sheets */}
        <div className="glass-card p-5 border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              Active Expense Sheets
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center">
              <Receipt size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2">
            {activeExpensesWithSavingsCount} / {expenses.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Sheets with attached savings
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 size={32} className="animate-spin text-emerald-400" />
          <p className="text-xs text-slate-400">Loading savings and expense structures...</p>
        </div>
      ) : (
        <>
          {/* ═══════════════════════════════════════════════
             MODE 1: CATEGORIZED VIEW (Nested in Expenses + Standalone Section)
             ═══════════════════════════════════════════════ */}
          {viewMode === "categorized" && (
            <div className="space-y-8">
              {/* Section 1: Dedicated Standalone / Unlinked Savings Section */}
              <div className="glass-card p-6 border-amber-500/30 bg-slate-900/90 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        Standalone / Unlinked Savings
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {standaloneSavings.length}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        Savings not associated with any specific parent expense sheet.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenCreateModal(null)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all self-start sm:self-auto"
                  >
                    <Plus size={14} />
                    New Standalone Saving
                  </button>
                </div>

                {/* Standalone Cards Grid */}
                {standaloneSavings.length === 0 ? (
                  <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-dashed border-slate-800 my-4">
                    <PiggyBank size={36} className="mx-auto text-slate-600 mb-2" />
                    <p className="text-xs text-slate-400 font-medium">
                      No standalone savings found. All savings are currently linked to expense sheets!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
                    {standaloneSavings.map((saving) => (
                      <SavingCard
                        key={saving.id}
                        saving={saving}
                        expenses={expenses}
                        onEdit={handleOpenEditModal}
                        onDeleteSuccess={handleDeleteSuccess}
                        onLinkUpdated={handleLinkUpdated}
                        onOpenLinkModal={handleOpenLinkModal}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Section 2: Expenses with Nested Savings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Receipt size={18} className="text-blue-400" />
                      Expense Sheets & Nested Savings
                    </h3>
                    <p className="text-xs text-slate-400">
                      Savings organized directly under their parent expense sheets.
                    </p>
                  </div>
                </div>

                {expenses.length === 0 ? (
                  <div className="glass-card p-10 text-center border-dashed border-slate-800">
                    <Receipt size={40} className="mx-auto text-slate-600 mb-3" />
                    <p className="text-sm font-semibold text-white">No expense sheets found</p>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                      Create expense sheets from the Expenses tab to nest and organize savings.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {expensesWithNestedSavings.map(({ expense, savings: nestedSavings, subtotalSavings }) => {
                      const isCollapsed = Boolean(collapsedExpenses[expense.id]);
                      const expTotal = expense.total_expenses ?? expense.total_amount ?? 0;

                      return (
                        <div
                          key={expense.id}
                          className="glass-card border-slate-800 hover:border-slate-700 transition-all overflow-hidden"
                        >
                          {/* Expense Header Bar */}
                          <div
                            onClick={() => toggleExpenseCollapse(expense.id)}
                            className="p-5 bg-slate-900/90 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-900 transition-colors"
                          >
                            <div className="flex items-start sm:items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
                                <Receipt size={20} />
                              </div>
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="text-base font-bold text-white">
                                    {expense.title}
                                  </h4>
                                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                                    <PiggyBank size={11} className="inline mr-1" />
                                    {nestedSavings.length} {nestedSavings.length === 1 ? "saving" : "savings"} attached
                                  </span>
                                </div>
                                <p className="text-xs text-slate-400 mt-0.5">
                                  Gross: ₱{(expense.gross_income || 0).toLocaleString()} • Total Expenses: ₱{expTotal.toLocaleString()}
                                </p>
                              </div>
                            </div>

                            {/* Right side summary & toggle */}
                            <div className="flex items-center gap-4 self-end sm:self-auto">
                              <div className="text-right">
                                <p className="text-[11px] text-slate-400">Attached Savings</p>
                                <p className="text-sm font-bold text-emerald-400">
                                  ₱{subtotalSavings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenCreateModal(expense.id);
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600/90 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-600/20"
                                title="Add saving directly to this expense"
                              >
                                <Plus size={13} />
                                Add Saving
                              </button>

                              <div className="text-slate-400 p-1">
                                {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                              </div>
                            </div>
                          </div>

                          {/* Nested Savings Body */}
                          {!isCollapsed && (
                            <div className="p-5 bg-slate-950/40">
                              {nestedSavings.length === 0 ? (
                                <div className="p-6 text-center rounded-xl bg-slate-900/30 border border-dashed border-slate-800/80">
                                  <PiggyBank size={28} className="mx-auto text-slate-600 mb-1.5" />
                                  <p className="text-xs text-slate-400">
                                    No savings currently nested under <strong>{expense.title}</strong>.
                                  </p>
                                  <button
                                    onClick={() => handleOpenCreateModal(expense.id)}
                                    className="mt-2 text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                                  >
                                    + Attach a new saving to this sheet
                                  </button>
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {nestedSavings.map((saving) => (
                                    <SavingCard
                                      key={saving.id}
                                      saving={saving}
                                      expenses={expenses}
                                      onEdit={handleOpenEditModal}
                                      onDeleteSuccess={handleDeleteSuccess}
                                      onLinkUpdated={handleLinkUpdated}
                                      onOpenLinkModal={handleOpenLinkModal}
                                      showParentBadge={false}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════
             MODE 2: ALL SAVINGS TABLE / LIST VIEW
             ═══════════════════════════════════════════════ */}
          {viewMode === "all" && (
            <div className="space-y-5">
              {/* Filter Bar */}
              <div className="glass-card p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                {/* Filter Tabs */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => setFilterMode("all")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      filterMode === "all"
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                        : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                    }`}
                  >
                    All ({savings.length})
                  </button>
                  <button
                    onClick={() => setFilterMode("standalone")}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      filterMode === "standalone"
                        ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                        : "bg-slate-900 text-amber-300 hover:bg-amber-500/10 border border-amber-500/30"
                    }`}
                  >
                    <Sparkles size={12} />
                    Standalone Only ({standaloneSavings.length})
                  </button>
                  <button
                    onClick={() => setFilterMode("linked")}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      filterMode === "linked"
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                        : "bg-slate-900 text-blue-300 hover:bg-blue-500/10 border border-blue-500/30"
                    }`}
                  >
                    <Link2 size={12} />
                    Linked Only ({linkedSavings.length})
                  </button>
                </div>

                {/* Specific Expense Dropdown, Search & Display Style */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Expense Dropdown Filter */}
                  <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs">
                    <span className="text-slate-400 font-medium">Expense:</span>
                    <select
                      value={selectedExpenseFilter}
                      onChange={(e) => setSelectedExpenseFilter(e.target.value)}
                      className="bg-transparent text-white focus:outline-none cursor-pointer max-w-[140px] truncate text-xs font-medium"
                    >
                      <option value="all" className="bg-slate-900 text-white">
                        All Expenses
                      </option>
                      {expenses.map((e) => (
                        <option key={e.id} value={e.id} className="bg-slate-900 text-white">
                          {e.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Search Box */}
                  <div className="relative flex-1 sm:w-56">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search savings..."
                      className="w-full pl-8 pr-7 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  {/* Cards vs Table View Toggle */}
                  <div className="flex items-center p-1 bg-slate-900 border border-slate-700/80 rounded-xl">
                    <button
                      onClick={() => setDisplayStyle("cards")}
                      className={`p-1 rounded-lg transition-colors ${
                        displayStyle === "cards"
                          ? "bg-slate-800 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                      title="Cards View"
                    >
                      <LayoutGrid size={14} />
                    </button>
                    <button
                      onClick={() => setDisplayStyle("table")}
                      className={`p-1 rounded-lg transition-colors ${
                        displayStyle === "table"
                          ? "bg-slate-800 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                      title="Table View"
                    >
                      <TableIcon size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Savings Results */}
              {filteredSavings.length === 0 ? (
                <div className="glass-card p-12 text-center border-dashed border-slate-800">
                  <PiggyBank size={40} className="mx-auto text-slate-600 mb-3" />
                  <h4 className="text-base font-bold text-white mb-1">No savings match your criteria</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    {searchQuery
                      ? `No savings found matching "${searchQuery}".`
                      : filterMode === "standalone"
                      ? "No standalone savings available."
                      : filterMode === "linked"
                      ? "No linked savings found for this filter."
                      : "No savings tracked yet. Click 'New Saving' to create one!"}
                  </p>
                </div>
              ) : displayStyle === "cards" ? (
                /* Cards Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSavings.map((saving) => (
                    <SavingCard
                      key={saving.id}
                      saving={saving}
                      expenses={expenses}
                      onEdit={handleOpenEditModal}
                      onDeleteSuccess={handleDeleteSuccess}
                      onLinkUpdated={handleLinkUpdated}
                      onOpenLinkModal={handleOpenLinkModal}
                    />
                  ))}
                </div>
              ) : (
                /* Rich Table View */
                <div className="glass-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-700 bg-slate-900/80 text-slate-300">
                          <th className="px-5 py-3.5 font-semibold">Saving Title</th>
                          <th className="px-5 py-3.5 font-semibold">Parent Expense</th>
                          <th className="px-5 py-3.5 font-semibold text-right">Total Amount</th>
                          <th className="px-5 py-3.5 font-semibold">Items Breakdown</th>
                          <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {filteredSavings.map((saving) => {
                          const isLinked = saving.expense_id !== null && saving.expense_id !== undefined;
                          const exp = expenses.find((e) => e.id === saving.expense_id);
                          const total =
                            saving.total_amount !== undefined
                              ? saving.total_amount
                              : (saving.items || []).reduce(
                                  (sum, i) => sum + (Number(i.amount) || 0),
                                  0
                                );

                          return (
                            <tr
                              key={saving.id}
                              className="hover:bg-slate-800/40 transition-colors"
                            >
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                                    <PiggyBank size={14} />
                                  </div>
                                  <span className="font-bold text-white">
                                    {saving.title}
                                  </span>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                {isLinked ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-900/30 text-blue-300 border border-blue-800/40">
                                    <Link2 size={10} />
                                    {exp?.title || `Exp #${saving.expense_id}`}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                                    <Sparkles size={10} /> Standalone
                                  </span>
                                )}
                              </td>

                              <td className="px-5 py-4 text-right">
                                <span className="font-bold text-emerald-400 text-sm">
                                  ₱{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                              </td>

                              <td className="px-5 py-4 text-slate-400">
                                {saving.items && saving.items.length > 0 ? (
                                  <span className="truncate max-w-xs block">
                                    {saving.items.map((i) => i.description).filter(Boolean).join(", ") || `${saving.items.length} items`}
                                  </span>
                                ) : (
                                  <span className="text-slate-600">No item rows</span>
                                )}
                              </td>

                              <td className="px-5 py-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {isLinked ? (
                                    <button
                                      onClick={() => handlePromptUnlink(saving)}
                                      className="px-2 py-1 rounded text-[11px] font-medium bg-red-500/10 text-red-300 hover:bg-red-500/20 border border-red-500/20"
                                      title="Unlink from Expense"
                                    >
                                      Unlink
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleOpenLinkModal(saving)}
                                      className="px-2 py-1 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/30"
                                      title="Attach to Expense"
                                    >
                                      Attach
                                    </button>
                                  )}

                                  <button
                                    onClick={() => handleOpenEditModal(saving)}
                                    className="p-1 rounded text-slate-400 hover:text-emerald-300 hover:bg-slate-800"
                                    title="Edit"
                                  >
                                    <Plus size={14} className="rotate-45" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Saving Form Modal (Create & Edit) */}
      <SavingFormDialog
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSuccess={handleFormSuccess}
        saving={editingSaving}
        initialExpenseId={formInitialExpenseId}
        availableExpenses={expenses}
      />

      {/* Link Expense Dialog */}
      <LinkExpenseDialog
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        saving={linkTargetSaving}
        expenses={expenses}
        onSuccess={handleLinkUpdated}
      />

      {/* Unlink Confirmation Dialog */}
      {unlinkingSaving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-[fadeIn_0.15s_ease-out]">
          <div className="glass-card max-w-md w-full p-6 border-amber-500/40 bg-slate-900 shadow-2xl rounded-2xl animate-[scaleIn_0.15s_ease-out]">
            <div className="flex items-center gap-3 text-amber-400 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <AlertCircle size={20} />
              </div>
              <h4 className="text-lg font-bold text-white">Unlink from Expense?</h4>
            </div>

            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              Are you sure you want to unlink saving <strong className="text-white">"{unlinkingSaving.title}"</strong> from its parent expense sheet? It will become a Standalone saving.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setUnlinkingSaving(null)}
                disabled={isConfirmingUnlink}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmUnlink}
                disabled={isConfirmingUnlink}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20"
              >
                {isConfirmingUnlink ? (
                  <>
                    <Loader2 size={13} className="animate-spin" /> Unlinking...
                  </>
                ) : (
                  "Confirm Unlink"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
