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
  Link2,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getCategories,
  updateCategory,
  deleteCategory,
} from "../../api/categories";
import CreateCategoryModal from "./CreateCategoryModal";
import ImportItemsModal from "./ImportItemsModal";
import type { Category } from "../../types";

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

  // Import items modal state for specific category card action
  const [importModalCategory, setImportModalCategory] = useState<Category | null>(null);

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
      toast.success("Category deleted");
      setShowDeleteModal(false);
      setCategoryToDelete(null);
      refreshCategoryData(true);
    } catch {
      toast.error("Failed to delete category");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenImport = (category: Category, e: React.MouseEvent) => {
    e.stopPropagation();
    setImportModalCategory(category);
  };

  return (
    <div className="space-y-8">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <FolderTree className="text-amber-400" size={28} />
            Categories Management
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Organize expenses and medications under unified categories with aggregated financials and item linking.
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
              className={refreshing ? "animate-spin text-amber-400" : ""}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-[#15121c] font-semibold rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95 text-sm"
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
          <Loader2 size={36} className="animate-spin text-amber-500" />
        </div>
      ) : categories.length === 0 ? (
        <div className="glass-card p-12 text-center max-w-xl mx-auto my-6 border border-dashed border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto mb-4 shadow-inner">
            <FolderTree size={32} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No categories yet</h3>
          <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
            Create your first category to group and organize expenses and medications in one place.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-[#15121c] font-semibold rounded-xl transition-all shadow-lg shadow-amber-500/20 text-sm"
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
                className="glass-card p-6 flex flex-col justify-between hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300 cursor-pointer group relative overflow-hidden"
              >
                {/* Subtle top indicator */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-teal-500 to-emerald-500 opacity-60 group-hover:opacity-100 transition-opacity" />

                <div>
                  {/* Title & Card Actions */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white truncate group-hover:text-amber-400 transition-colors">
                        {category.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <Calendar size={13} />
                        <span>Created {formattedDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {/* Direct Import Items button */}
                      <button
                        onClick={(e) => handleOpenImport(category, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800/80 transition-colors"
                        title="Import / Link items"
                      >
                        <Link2 size={15} />
                      </button>
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

                  {/* Badges / Aggregate Breakdown */}
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
                  <div className="bg-amber-950/20 border border-amber-900/30 rounded-xl p-3 flex items-center justify-between mb-4">
                    <span className="text-xs font-medium text-amber-300">Combined Total</span>
                    <span className="text-base font-bold text-amber-200">
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
                  <span className="flex items-center gap-1 text-amber-400 group-hover:translate-x-1 transition-transform font-medium">
                    View details <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE CATEGORY MODAL */}
      <CreateCategoryModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          refreshCategoryData(true);
        }}
      />

      {/* IMPORT / LINK ITEMS MODAL FOR CATEGORY CARD */}
      {importModalCategory && (
        <ImportItemsModal
          isOpen={!!importModalCategory}
          onClose={() => setImportModalCategory(null)}
          categoryId={importModalCategory.id}
          categoryTitle={importModalCategory.title}
          onSuccess={() => {
            refreshCategoryData(true);
          }}
        />
      )}

      {/* EDIT TITLE MODAL */}
      {showEditModal && categoryToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-card p-6 max-w-md w-full border-slate-700 animate-[scaleIn_0.2s_ease-out]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit3 size={18} className="text-amber-400" />
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
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
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-[#15121c] transition-all shadow-lg shadow-amber-500/20"
                >
                  {isSaving && <Loader2 size={15} className="animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CASCADE DELETE WARNING MODAL */}
      {showDeleteModal && categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-card p-6 max-w-md w-full border-red-900/50 bg-slate-900/95 animate-[scaleIn_0.2s_ease-out]">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-red-900/30 text-red-400 border border-red-800/40 shrink-0">
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Delete Category</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Are you sure you want to delete "{categoryToDelete.title}"?
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-900/30 text-xs text-red-300 leading-relaxed mb-6">
              ⚠️ <strong>Warning:</strong> Deleting this category will cascade and remove all associated expenses and medications inside it.
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-sm text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25 transition-all"
              >
                {isDeleting && <Loader2 size={15} className="animate-spin" />}
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
