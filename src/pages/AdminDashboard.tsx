import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  type ComponentType,
} from "react";
import client, { getAllPages, getPage } from "../api/client";
import { getCategories } from "../api/categories";
import { updateExpense } from "../api/expenses";
import { updateMedication } from "../api/medications";
import CategoriesOverview from "../components/categories/CategoriesOverview";
import SavingsView from "../components/savings/SavingsView";
import toast from "react-hot-toast";
import {
  LayoutDashboard,
  Palette,
  FolderTree,
  Receipt,
  PiggyBank,
  Pill,
  Users,
  DollarSign,
  Loader2,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  ArrowRight,
  ShieldCheck,
  ShieldOff,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Camera,
  FileText,
  FileCheck,
  Search,
  Tag,
} from "lucide-react";
import type {
  DashboardStats,
  ExpenseSheet,
  Medication,
  AdminUser,
  Category,
} from "../types";

interface TabItem {
  id: string;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
}

/* ─── Tab definitions ─── */
const TABS: TabItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "portfolio", label: "Portfolio Config", icon: Palette },
  { id: "categories", label: "Categories", icon: FolderTree },
  { id: "expenses", label: "Expenses", icon: Receipt },
  { id: "savings", label: "Savings", icon: PiggyBank },
  { id: "medications", label: "Medications", icon: Pill },
  { id: "users", label: "Users", icon: Users },
];

/* ═══════════════════════════════════════════════
   OVERVIEW TAB
   ═══════════════════════════════════════════════ */
function OverviewTab({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client
      .get("/admin/stats")
      .then((res) => setStats(res.data))
      .catch(() => toast.error("Failed to load stats"))
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats
    ? [
        {
          label: "Total Users",
          value: stats.total_users,
          icon: Users,
          color: "blue",
        },
        {
          label: "Expense Sheets",
          value: stats.total_expenses,
          icon: Receipt,
          color: "green",
        },
        {
          label: "Tracked Medications",
          value: stats.total_medications,
          icon: Pill,
          color: "purple",
        },
        {
          label: "Total Expenditure",
          value: `₱${(stats.total_expense_amount || 0).toLocaleString()}`,
          icon: DollarSign,
          color: "amber",
        },
      ]
    : [];

  const colorClasses: Record<string, string> = {
    blue: "bg-teal-500/10 text-teal-400 border border-teal-500/20",
    green: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    purple: "bg-violet-500/10 text-violet-400 border border-violet-500/20",
    amber: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Dashboard Overview</h2>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="h-10 w-10 bg-[#342c45] rounded-xl mb-3" />
              <div className="h-4 bg-[#342c45] rounded w-20 mb-2" />
              <div className="h-6 bg-[#342c45] rounded w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="glass-card p-6 accent-left">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${colorClasses[card.color] || colorClasses.blue}`}
                >
                  <Icon size={24} />
                </div>
                <p className="text-sm text-[#a59cb8]">{card.label}</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {card.value}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Portfolio Configurator",
              desc: "Edit your portfolio content",
              tab: "portfolio",
              icon: Palette,
            },
            {
              label: "Category Manager",
              desc: "Organize expenses & medications",
              tab: "categories",
              icon: FolderTree,
            },
            {
              label: "Expense Tracker",
              desc: "Manage income & expenses",
              tab: "expenses",
              icon: Receipt,
            },
            {
              label: "Medication Tracker",
              desc: "Track dosages & costs",
              tab: "medications",
              icon: Pill,
            },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.tab}
                onClick={() => onNavigate(action.tab)}
                className="glass-card p-5 text-left group"
              >
                <Icon size={24} className="text-amber-400 mb-3" />
                <h4 className="font-semibold text-white group-hover:text-amber-400 transition-colors">
                  {action.label}
                </h4>
                <p className="text-sm text-[#a59cb8] mt-1">{action.desc}</p>
                <ArrowRight
                  size={16}
                  className="mt-3 text-[#a59cb8] group-hover:text-amber-400 group-hover:translate-x-1 transition-all"
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const DEFAULT_PROFILE = {
  full_name: "Mark Philip V. Parayno",
  headline: "Software Engineer | Full Stack & Mobile Developer (Flutter)",
  location: "San Juan City, Philippines",
  email: "paraynomarkphilip@gmail.com",
  phone: "+63 961 312 8973",
  linkedin_url: "https://www.linkedin.com/in/mark-philip-parayno/",
  github_username: "MarkParayno1004",
  summary:
    "Results-driven Software Engineer, Full Stack and Mobile Developer with hands-on production experience building cross-platform mobile apps (Flutter) and web applications (React, TypeScript, Svelte, Django, Laravel). Skilled in clean architecture, API optimization, and scalable cloud solutions.",
};

interface PortfolioConfigForm {
  full_name: string;
  headline: string;
  location: string;
  email: string;
  phone: string;
  linkedin_url: string;
  github_username: string;
  summary: string;
  avatar_url: string;
}

function compressImage(
  file: File,
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.85,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let { width, height } = img;

        // Resize proportionally if dimensions exceed max
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        // Draw image smoothly
        ctx.drawImage(img, 0, 0, width, height);

        // Determine format: use webp/jpeg for high compression
        const outputFormat =
          file.type === "image/png" || file.type === "image/webp"
            ? "image/webp"
            : "image/jpeg";

        let compressed = canvas.toDataURL(outputFormat, quality);

        // Progressive reduction if image is still over ~1.2MB (well below 2MB limit)
        let currentQuality = quality;
        while (compressed.length > 1.2 * 1024 * 1024 && currentQuality > 0.4) {
          currentQuality -= 0.15;
          compressed = canvas.toDataURL("image/jpeg", currentQuality);
        }

        resolve(compressed);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

/* ═══════════════════════════════════════════════
   PORTFOLIO CONFIG TAB
   ═══════════════════════════════════════════════ */
function PortfolioConfigTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cvFileInputRef = useRef<HTMLInputElement>(null);
  // The CV is private on the backend: we only know whether one exists.
  const [hasCv, setHasCv] = useState(false);
  const [cvBusy, setCvBusy] = useState(false);
  const [form, setForm] = useState<PortfolioConfigForm>({
    full_name: DEFAULT_PROFILE.full_name,
    headline: DEFAULT_PROFILE.headline,
    location: DEFAULT_PROFILE.location,
    email: DEFAULT_PROFILE.email,
    phone: DEFAULT_PROFILE.phone,
    linkedin_url: DEFAULT_PROFILE.linkedin_url,
    github_username: DEFAULT_PROFILE.github_username,
    summary: DEFAULT_PROFILE.summary,
    avatar_url: "",
  });

  const fetchConfig = useCallback(() => {
    client
      .get("/portfolio/config")
      .then((res) => {
        const raw = res.data || {};
        const bioSummary =
          raw.about_summary ??
          raw.summary ??
          raw.about ??
          raw.bio ??
          DEFAULT_PROFILE.summary;

        const avatar =
          raw.avatar_url ||
          raw.avatar ||
          raw.image ||
          raw.image_url ||
          raw.profile_image ||
          localStorage.getItem("portfolio_avatar") ||
          "";

        setHasCv(Boolean(raw.has_cv));

        setForm({
          full_name: raw.full_name || raw.name || DEFAULT_PROFILE.full_name,
          headline: raw.headline || DEFAULT_PROFILE.headline,
          location: raw.location || DEFAULT_PROFILE.location,
          email: raw.email || DEFAULT_PROFILE.email,
          phone: raw.phone || DEFAULT_PROFILE.phone,
          linkedin_url:
            raw.linkedin_url || raw.linkedin || DEFAULT_PROFILE.linkedin_url,
          github_username:
            raw.github_username ||
            raw.github ||
            DEFAULT_PROFILE.github_username,
          summary: bioSummary || DEFAULT_PROFILE.summary,
          avatar_url: avatar,
        });
      })
      .catch(() => {
        toast.error(
          "Failed to load portfolio config from server, loaded defaults",
        );
        setForm((prev) => ({
          ...prev,
          avatar_url: localStorage.getItem("portfolio_avatar") || "",
        }));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WEBP, SVG)");
      return;
    }

    const toastId = toast.loading("Compressing and optimizing image...");
    try {
      const compressedDataUrl = await compressImage(file, 1000, 1000, 0.85);
      const sizeKB = Math.round((compressedDataUrl.length * 3) / 4 / 1024);

      setForm((f) => ({ ...f, avatar_url: compressedDataUrl }));
      toast.success(
        `Image optimized to ${sizeKB} KB! Click 'Save Changes' to apply.`,
        { id: toastId },
      );
    } catch {
      toast.error("Failed to process and compress image", { id: toastId });
    }
  };

  const handleRemoveImage = () => {
    setForm((f) => ({ ...f, avatar_url: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    try {
      localStorage.removeItem("portfolio_avatar");
    } catch {
      // ignore
    }
    toast.success("Image removed. Switched to initials avatar.");
  };

  const handleCvFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (cvFileInputRef.current) cvFileInputRef.current.value = "";
    if (!file) return;

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      toast.error("Choose a PDF file (.pdf)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("The PDF is larger than 10 MB");
      return;
    }

    setCvBusy(true);
    const toastId = toast.loading("Uploading CV...");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await client.put("/portfolio/cv", body, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setHasCv(Boolean(res.data?.has_cv));
      toast.success("CV uploaded", { id: toastId });
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })
        .response?.data?.detail;
      toast.error(detail || "CV upload failed", { id: toastId });
    } finally {
      setCvBusy(false);
    }
  };

  const handleRemoveCv = async () => {
    setCvBusy(true);
    try {
      await client.delete("/portfolio/cv");
      setHasCv(false);
      toast.success("CV removed");
    } catch {
      toast.error("Could not remove the CV");
    } finally {
      setCvBusy(false);
    }
  };

  const handleDownloadCv = async () => {
    try {
      const res = await client.get("/portfolio/cv", { responseType: "blob" });
      const url = URL.createObjectURL(res.data as Blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "cv.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Could not download the CV");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Safe localStorage caching
      try {
        if (form.avatar_url) {
          localStorage.setItem("portfolio_avatar", form.avatar_url);
        } else {
          localStorage.removeItem("portfolio_avatar");
        }
      } catch (storageErr) {
        console.warn("LocalStorage warning:", storageErr);
      }

      // 2. Submit to backend API
      const payload = {
        ...form,
        name: form.full_name,
        about_summary: form.summary,
        about: form.summary,
        bio: form.summary,
        linkedin: form.linkedin_url,
        github: form.github_username,
        avatar: form.avatar_url,
        avatar_url: form.avatar_url,
        image: form.avatar_url,
        image_url: form.avatar_url,
        profile_image: form.avatar_url,
      };

      await client.put("/portfolio/config", payload);
      toast.success("Portfolio config updated successfully!");
      fetchConfig();
    } catch {
      toast.success("Portfolio config saved locally!");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-amber-500" />
      </div>
    );
  }

  const formFields: Array<{
    key: keyof Omit<
      PortfolioConfigForm,
      "summary" | "avatar_url"
    >;
    label: string;
    type: string;
  }> = [
    { key: "full_name", label: "Full Name", type: "text" },
    { key: "headline", label: "Headline", type: "text" },
    { key: "location", label: "Location", type: "text" },
    { key: "email", label: "Email", type: "email" },
    { key: "phone", label: "Phone", type: "tel" },
    { key: "linkedin_url", label: "LinkedIn URL", type: "url" },
    { key: "github_username", label: "GitHub Username", type: "text" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Portfolio Configuration
          </h2>
          <p className="text-sm text-[#a59cb8] mt-1">
            Customize your public portfolio information, hero image, and bio
            summary.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-[#15121c] font-semibold rounded-xl transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 active:scale-[0.98] disabled:opacity-60"
        >
          {saving ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Save size={18} />
          )}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Column */}
        <div className="space-y-6">
          {/* Avatar / Image Upload Card */}
          <div className="glass-card p-6 accent-left">
            <div className="flex items-center gap-2 mb-4">
              <Camera size={20} className="text-amber-400" />
              <h3 className="text-lg font-semibold text-white">
                Hero Profile Image
              </h3>
            </div>
            <p className="text-sm text-[#a59cb8] mb-4">
              Upload a photo to be showcased in the Hero section of your
              portfolio. If no image is provided, a stylized initials avatar
              ("MP") will be shown.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-[#15121c]/60 border border-[#342c45]">
              {/* Thumbnail preview */}
              <div className="w-24 h-24 rounded-xl bg-[#1f1a2b] border border-[#342c45] flex items-center justify-center overflow-hidden shrink-0 relative group">
                {form.avatar_url ? (
                  <img
                    src={form.avatar_url}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <span className="text-2xl font-bold text-amber-400/40 select-none">
                    {(form.full_name || "MP")
                      .split(" ")
                      .map((n) => n[0])
                      .filter(Boolean)
                      .slice(0, 2)
                      .join("")}
                  </span>
                )}
              </div>

              {/* Upload actions */}
              <div className="flex-1 space-y-3 w-full">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                  onChange={handleImageFileChange}
                  className="hidden"
                  id="avatar-file-input"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <label
                    htmlFor="avatar-file-input"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-sm font-medium cursor-pointer transition-colors"
                  >
                    <Upload size={16} />
                    Upload Image
                  </label>
                  {form.avatar_url && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  )}
                </div>
                <div className="text-xs text-[#a59cb8]">
                  Supports PNG, JPG, WEBP, SVG (max 5MB)
                </div>
              </div>
            </div>

            {/* Direct Image URL input */}
            <div className="mt-4">
              <label className="block text-xs font-medium text-[#a59cb8] mb-1.5">
                Or enter image URL:
              </label>
              <div className="relative">
                <ImageIcon
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a59cb8]"
                />
                <input
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  value={
                    form.avatar_url.startsWith("data:") ? "" : form.avatar_url
                  }
                  onChange={(e) =>
                    setForm((f) => ({ ...f, avatar_url: e.target.value }))
                  }
                  className="w-full pl-10 pr-4 py-2 bg-[#15121c] border border-[#342c45] rounded-lg focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50 outline-none transition-all text-sm text-white placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>

          {/* CV / Resume PDF Upload Card */}
          <div className="glass-card p-6 accent-left">
            <div className="flex items-center gap-2 mb-4">
              <FileText size={20} className="text-amber-400" />
              <h3 className="text-lg font-semibold text-white">
                Curriculum Vitae (PDF Document)
              </h3>
            </div>
            <p className="text-sm text-[#a59cb8] mb-4">
              Your CV stays private: visitors are asked to email you instead,
              and only admins can download it from here. Uploading replaces
              the previous file right away.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-[#15121c]/60 border border-[#342c45]">
              {/* PDF icon badge */}
              <div className="w-16 h-16 rounded-xl bg-[#1f1a2b] border border-[#342c45] flex items-center justify-center shrink-0">
                <FileText
                  size={32}
                  className={
                    hasCv ? "text-amber-400" : "text-[#a59cb8]/40"
                  }
                />
              </div>

              {/* Upload actions & file details */}
              <div className="flex-1 space-y-2 w-full">
                <input
                  ref={cvFileInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handleCvFileChange}
                  disabled={cvBusy}
                  className="hidden"
                  id="cv-file-input"
                />

                {hasCv ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-emerald-400">
                      <FileCheck size={16} />
                      <span className="truncate">CV on file (private)</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleDownloadCv}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1f1a2b] hover:text-amber-300 text-[#ece8f4] border border-[#342c45] rounded-lg text-xs font-medium transition-colors"
                      >
                        <FileText size={14} />
                        Download
                      </button>
                      <label
                        htmlFor="cv-file-input"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-medium cursor-pointer transition-colors"
                      >
                        <Upload size={14} />
                        Replace PDF
                      </label>
                      <button
                        type="button"
                        onClick={handleRemoveCv}
                        disabled={cvBusy}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-xs font-medium transition-colors"
                      >
                        <Trash2 size={14} />
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label
                      htmlFor="cv-file-input"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-sm font-medium cursor-pointer transition-colors"
                    >
                      <Upload size={16} />
                      Upload PDF Resume / CV
                    </label>
                    <div className="text-xs text-[#a59cb8]">
                      Accepts .PDF files only (max 10MB)
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Basic Information Card */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Basic Information
            </h3>
            <div className="space-y-4">
              {formFields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    value={form[field.key]}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [field.key]: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 bg-[#15121c] border border-[#342c45] rounded-xl focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50 outline-none transition-all text-white placeholder:text-slate-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Bio Summary Card */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-white">
                Bio & About Summary
              </h3>
              <span className="text-xs text-[#a59cb8]">
                {form.summary.length} characters
              </span>
            </div>
            <p className="text-xs text-[#a59cb8] mb-3">
              This summary is displayed in the "01. About Me" section on your
              public portfolio.
            </p>
            <textarea
              value={form.summary}
              onChange={(e) =>
                setForm((f) => ({ ...f, summary: e.target.value }))
              }
              rows={5}
              placeholder="Write your professional bio summary..."
              className="w-full px-4 py-3 bg-[#15121c] border border-[#342c45] rounded-xl focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50 outline-none transition-all text-white placeholder:text-slate-500 resize-y leading-relaxed text-sm"
            />
          </div>
        </div>

        {/* Live Preview Column */}
        <div className="space-y-6">
          <div className="glass-card p-6 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Live Preview</h3>
              <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                Hero & About
              </span>
            </div>

            <div className="bg-[#15121c] border border-[#342c45] rounded-2xl p-6 text-center overflow-hidden relative">
              {/* Background ambient glow */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

              {/* Hero Avatar Box Preview */}
              <div className="relative inline-block my-2">
                <div className="w-48 h-48 rounded-2xl bg-[#1f1a2b] border border-[#342c45] flex items-center justify-center relative overflow-hidden group shadow-xl shadow-black/40">
                  {form.avatar_url ? (
                    <>
                      <img
                        src={form.avatar_url}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <span className="text-6xl font-bold text-amber-400/20 group-hover:text-amber-400/30 transition-colors duration-500 select-none">
                        {(form.full_name || "Mark Philip")
                          .split(" ")
                          .map((n) => n[0])
                          .filter(Boolean)
                          .slice(0, 2)
                          .join("")}
                      </span>
                    </>
                  )}
                </div>
                {/* Decorative offset border */}
                <div className="absolute -top-3 -right-3 w-48 h-48 rounded-2xl border-2 border-amber-500/20 -z-10" />
                {/* Corner sparkle */}
                <div className="absolute -top-1 -right-1 text-amber-400/50">
                  <Sparkles size={14} />
                </div>
              </div>

              {/* Name & Headline */}
              <h4 className="text-2xl font-bold mt-4 tracking-tight">
                <span className="text-white">
                  {(form.full_name || DEFAULT_PROFILE.full_name)
                    .split(" ")
                    .slice(0, -1)
                    .join(" ")}{" "}
                </span>
                <span className="text-amber-400">
                  {
                    (form.full_name || DEFAULT_PROFILE.full_name)
                      .split(" ")
                      .slice(-1)[0]
                  }
                  .
                </span>
              </h4>
              <p className="text-amber-400/90 font-medium text-sm mt-1">
                {form.headline || DEFAULT_PROFILE.headline}
              </p>

              {/* Meta pills */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-[#a59cb8]">
                {form.location && (
                  <span className="px-2.5 py-1 rounded-full bg-[#1f1a2b] border border-[#342c45]">
                    📍 {form.location}
                  </span>
                )}
                {form.email && (
                  <span className="px-2.5 py-1 rounded-full bg-[#1f1a2b] border border-[#342c45]">
                    ✉️ {form.email}
                  </span>
                )}
                {form.phone && (
                  <span className="px-2.5 py-1 rounded-full bg-[#1f1a2b] border border-[#342c45]">
                    📞 {form.phone}
                  </span>
                )}
              </div>

              {/* CV Status Badge Preview */}
              <div className="mt-3 flex items-center justify-center">
                {hasCv ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                    <FileCheck size={13} />
                    CV on file (private)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1f1a2b] border border-[#342c45] text-[#a59cb8] text-xs">
                    <FileText size={13} />
                    No CV uploaded
                  </span>
                )}
              </div>

              {/* About Summary Box Preview */}
              <div className="mt-6 pt-5 border-t border-[#342c45]/60 text-left">
                <p className="text-xs font-mono text-amber-400 mb-2">
                  01. About Me Preview:
                </p>
                <div className="p-4 rounded-xl bg-[#1f1a2b]/60 border border-[#342c45] text-xs text-[#a59cb8] leading-relaxed">
                  {form.summary || DEFAULT_PROFILE.summary}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ExpenseFormItem {
  description: string;
  amount: string;
}

interface ExpenseFormData {
  title: string;
  gross_income: string;
  category_id?: string;
  items: ExpenseFormItem[];
  tax_deductions: ExpenseFormItem[];
}

/* ═══════════════════════════════════════════════
   EXPENSES TAB
   ═══════════════════════════════════════════════ */
function ExpensesTab() {
  const [sheets, setSheets] = useState<ExpenseSheet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editSheet, setEditSheet] = useState<ExpenseSheet | null>(null);
  const [filterMode, setFilterMode] = useState<"all" | "uncategorized" | "categorized">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingCategoryId, setUpdatingCategoryId] = useState<number | null>(null);

  const [formData, setFormData] = useState<ExpenseFormData>({
    title: "",
    gross_income: "",
    category_id: "",
    items: [{ description: "", amount: "" }],
    tax_deductions: [{ description: "", amount: "" }],
  });

  const fetchSheets = useCallback(() => {
    getAllPages<ExpenseSheet>("/expenses/")
      .then(setSheets)
      .catch(() => toast.error("Failed to load expenses"))
      .finally(() => setLoading(false));
  }, []);

  const fetchCategoryList = useCallback(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchSheets();
    fetchCategoryList();
  }, [fetchSheets, fetchCategoryList]);

  // Calculations
  const uncategorizedCount = useMemo(
    () => sheets.filter((s) => s.category_id === null || s.category_id === undefined).length,
    [sheets]
  );
  const categorizedCount = sheets.length - uncategorizedCount;

  // Filtered sheets
  const filteredSheets = useMemo(() => {
    return sheets.filter((s) => {
      const isUncat = s.category_id === null || s.category_id === undefined;
      if (filterMode === "uncategorized" && !isUncat) return false;
      if (filterMode === "categorized" && isUncat) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = s.title?.toLowerCase().includes(q);
        const matchesItem = s.items?.some((i) => i.description.toLowerCase().includes(q));
        if (!matchesTitle && !matchesItem) return false;
      }

      return true;
    });
  }, [sheets, filterMode, searchQuery]);

  const openCreate = () => {
    setEditSheet(null);
    setFormData({
      title: "",
      gross_income: "",
      category_id: "",
      items: [{ description: "", amount: "" }],
      tax_deductions: [{ description: "", amount: "" }],
    });
    setShowModal(true);
  };

  const openEdit = (sheet: ExpenseSheet) => {
    setEditSheet(sheet);
    setFormData({
      title: sheet.title || "",
      gross_income: String(sheet.gross_income || ""),
      category_id: sheet.category_id ? String(sheet.category_id) : "",
      items: sheet.items?.length
        ? sheet.items.map((i) => ({
            description: i.description,
            amount: String(i.amount),
          }))
        : [{ description: "", amount: "" }],
      tax_deductions: sheet.tax_deductions?.length
        ? sheet.tax_deductions.map((d) => ({
            description: d.description,
            amount: String(d.amount),
          }))
        : [{ description: "", amount: "" }],
    });
    setShowModal(true);
  };

  const handleInlineAssignCategory = async (sheetId: number, targetCatId: string) => {
    setUpdatingCategoryId(sheetId);
    const newCatId = targetCatId ? parseInt(targetCatId, 10) : null;
    const catName = categories.find((c) => c.id === newCatId)?.title;

    try {
      await updateExpense(sheetId, { category_id: newCatId });
      setSheets((prev) =>
        prev.map((s) => (s.id === sheetId ? { ...s, category_id: newCatId } : s))
      );
      if (newCatId) {
        toast.success(`Expense assigned to "${catName || 'Category'}"`);
      } else {
        toast.success("Expense moved to Uncategorized");
      }
    } catch {
      toast.error("Failed to update category assignment");
    } finally {
      setUpdatingCategoryId(null);
    }
  };

  const handleSave = async () => {
    try {
      const category_id = formData.category_id
        ? parseInt(formData.category_id, 10)
        : null;

      if (editSheet) {
        await client.put(`/expenses/${editSheet.id}`, {
          title: formData.title,
          gross_income: parseFloat(formData.gross_income) || 0,
          category_id,
        });
      } else {
        await client.post("/expenses/", {
          title: formData.title,
          gross_income: parseFloat(formData.gross_income) || 0,
          category_id,
          items: formData.items
            .filter((i) => i.description)
            .map((i) => ({
              description: i.description,
              amount: parseFloat(i.amount) || 0,
            })),
          tax_deductions: formData.tax_deductions
            .filter((d) => d.description)
            .map((d) => ({
              description: d.description,
              amount: parseFloat(d.amount) || 0,
            })),
        });
      }
      toast.success(
        editSheet ? "Expense sheet updated!" : "Expense sheet created!",
      );
      setShowModal(false);
      fetchSheets();
    } catch {
      toast.error("Failed to save expense sheet");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this expense sheet?")) return;
    try {
      await client.delete(`/expenses/${id}`);
      toast.success("Expense sheet deleted");
      fetchSheets();
    } catch {
      toast.error("Failed to delete expense sheet");
    }
  };

  const addItem = (type: "items" | "tax_deductions") => {
    setFormData((f) => ({
      ...f,
      [type]: [...f[type], { description: "", amount: "" }],
    }));
  };

  const removeItem = (type: "items" | "tax_deductions", idx: number) => {
    setFormData((f) => ({
      ...f,
      [type]: f[type].filter((_, i) => i !== idx),
    }));
  };

  const updateItem = (
    type: "items" | "tax_deductions",
    idx: number,
    field: "description" | "amount",
    value: string,
  ) => {
    setFormData((f) => ({
      ...f,
      [type]: f[type].map((item, i) =>
        i === idx ? { ...item, [field]: value } : item,
      ),
    }));
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Receipt className="text-emerald-400" size={26} />
            Expense Tracker
          </h2>
          <p className="text-sm text-[#a59cb8] mt-0.5">
            Manage your income and expense sheets. Uncategorized sheets can be assigned to categories below.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus size={18} />
          New Sheet
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="glass-card p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Quick Filter Tabs */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setFilterMode("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterMode === "all"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                : "bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            All Sheets ({sheets.length})
          </button>
          <button
            onClick={() => setFilterMode("uncategorized")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterMode === "uncategorized"
                ? "bg-amber-500 text-[#15121c] font-bold shadow-md shadow-amber-500/20"
                : "bg-slate-900/60 text-amber-300 hover:bg-amber-500/10 border border-amber-500/30"
            }`}
          >
            <Tag size={13} />
            Uncategorized ({uncategorizedCount})
          </button>
          <button
            onClick={() => setFilterMode("categorized")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterMode === "categorized"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            Categorized ({categorizedCount})
          </button>
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-64">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sheets..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="animate-spin text-emerald-500" />
        </div>
      ) : filteredSheets.length === 0 ? (
        <div className="text-center py-16 glass-card border border-dashed border-slate-800">
          <Receipt size={44} className="mx-auto text-slate-600 mb-3" />
          <h4 className="text-base font-bold text-white mb-1">No expense sheets found</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? "No sheets match your search query."
              : filterMode === "uncategorized"
              ? "All expense sheets are currently categorized!"
              : "No expense sheets yet. Create your first one!"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSheets.map((sheet) => {
            const isUncategorized = sheet.category_id === null || sheet.category_id === undefined;
            const matchedCategory = categories.find((c) => c.id === sheet.category_id);
            const isUpdating = updatingCategoryId === sheet.id;

            return (
              <div key={sheet.id} className="glass-card p-6 border-slate-800 hover:border-slate-700 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <h3 className="text-lg font-bold text-white">
                        {sheet.title || `Sheet #${sheet.id}`}
                      </h3>

                      {/* Category Status Badge */}
                      {isUncategorized ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                          <Tag size={11} /> Uncategorized
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-900/30 text-blue-300 border border-blue-800/40">
                          <FolderTree size={11} /> {matchedCategory?.title || `Category #${sheet.category_id}`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Actions: Category Dropdown & Edit/Delete */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* "Assign Category" Dropdown */}
                    <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 rounded-xl px-2.5 py-1 text-xs">
                      <span className="text-slate-400 shrink-0 font-medium">Category:</span>
                      <select
                        value={sheet.category_id || ""}
                        disabled={isUpdating}
                        onChange={(e) => handleInlineAssignCategory(sheet.id, e.target.value)}
                        className="bg-transparent text-white focus:outline-none cursor-pointer max-w-[150px] truncate text-xs font-medium"
                      >
                        <option value="" className="bg-slate-900 text-amber-400">
                          Uncategorized
                        </option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                            {c.title}
                          </option>
                        ))}
                      </select>
                      {isUpdating && <Loader2 size={12} className="animate-spin text-amber-400 shrink-0" />}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(sheet)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-all"
                        title="Edit sheet"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(sheet.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-all"
                        title="Delete sheet"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Amount metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { label: "Gross Income", value: sheet.gross_income, color: "text-white" },
                    {
                      label: "Tax Deductions",
                      value: sheet.total_tax_deductions,
                      color: "text-amber-400",
                    },
                    { label: "Net Income", value: sheet.net_income, color: "text-white" },
                    { label: "Total Expenses", value: sheet.total_expenses, color: "text-red-400" },
                    { label: "Remaining", value: sheet.remaining_income, color: "text-emerald-400" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3"
                    >
                      <p className="text-xs text-slate-400">{item.label}</p>
                      <p className={`text-base sm:text-lg font-bold ${item.color}`}>
                        ₱{(item.value || 0).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-lg font-bold text-white">
                {editSheet ? "Edit Expense Sheet" : "New Expense Sheet"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-slate-700 transition-all text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, title: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-white placeholder:text-slate-500"
                  placeholder="Monthly Budget - September"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Gross Income (₱)
                  </label>
                  <input
                    type="number"
                    value={formData.gross_income}
                    onChange={(e) =>
                      setFormData((f) => ({
                        ...f,
                        gross_income: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-white placeholder:text-slate-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Category (Optional)
                  </label>
                  <select
                    value={formData.category_id || ""}
                    onChange={(e) =>
                      setFormData((f) => ({
                        ...f,
                        category_id: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-white"
                  >
                    <option value="">None / Uncategorized</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tax Deductions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-300">
                    Tax Deductions
                  </label>
                  <button
                    type="button"
                    onClick={() => addItem("tax_deductions")}
                    className="text-sm text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>
                {formData.tax_deductions.map((d, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Description"
                      value={d.description}
                      onChange={(e) =>
                        updateItem(
                          "tax_deductions",
                          idx,
                          "description",
                          e.target.value,
                        )
                      }
                      className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder:text-slate-500"
                    />
                    <input
                      type="number"
                      placeholder="Amount"
                      value={d.amount}
                      onChange={(e) =>
                        updateItem(
                          "tax_deductions",
                          idx,
                          "amount",
                          e.target.value,
                        )
                      }
                      className="w-28 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder:text-slate-500"
                    />
                    {formData.tax_deductions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem("tax_deductions", idx)}
                        className="p-2 text-red-400 hover:bg-slate-700 rounded-lg"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Line Items */}
              {!editSheet && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-300">
                      Expense Items
                    </label>
                    <button
                      type="button"
                      onClick={() => addItem("items")}
                      className="text-sm text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <Plus size={14} /> Add
                    </button>
                  </div>
                  {formData.items.map((item, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) =>
                          updateItem(
                            "items",
                            idx,
                            "description",
                            e.target.value,
                          )
                        }
                        className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder:text-slate-500"
                      />
                      <input
                        type="number"
                        placeholder="Amount"
                        value={item.amount}
                        onChange={(e) =>
                          updateItem("items", idx, "amount", e.target.value)
                        }
                        className="w-28 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder:text-slate-500"
                      />
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem("items", idx)}
                          className="p-2 text-red-400 hover:bg-slate-700 rounded-lg"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={handleSave}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/25"
              >
                {editSheet ? "Update Sheet" : "Create Sheet"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MEDICATIONS TAB
   ═══════════════════════════════════════════════ */
function MedicationsTab() {
  const [meds, setMeds] = useState<Medication[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMed, setEditMed] = useState<Medication | null>(null);
  const [filterMode, setFilterMode] = useState<"all" | "uncategorized" | "categorized">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingCategoryId, setUpdatingCategoryId] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: "",
    cost: "",
    doses_taken: "0",
    category_id: "",
  });

  const fetchMeds = useCallback(() => {
    getAllPages<Medication>("/medications/")
      .then(setMeds)
      .catch(() => toast.error("Failed to load medications"))
      .finally(() => setLoading(false));
  }, []);

  const fetchCategoryList = useCallback(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchMeds();
    fetchCategoryList();
  }, [fetchMeds, fetchCategoryList]);

  // Counts
  const uncategorizedCount = useMemo(
    () => meds.filter((m) => m.category_id === null || m.category_id === undefined).length,
    [meds]
  );
  const categorizedCount = meds.length - uncategorizedCount;

  // Filtered meds
  const filteredMeds = useMemo(() => {
    return meds.filter((m) => {
      const isUncat = m.category_id === null || m.category_id === undefined;
      if (filterMode === "uncategorized" && !isUncat) return false;
      if (filterMode === "categorized" && isUncat) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        if (!m.name.toLowerCase().includes(q)) return false;
      }

      return true;
    });
  }, [meds, filterMode, searchQuery]);

  const openCreate = () => {
    setEditMed(null);
    setForm({ name: "", cost: "", doses_taken: "0", category_id: "" });
    setShowModal(true);
  };

  const openEdit = (med: Medication) => {
    setEditMed(med);
    setForm({
      name: med.name,
      cost: String(med.cost),
      doses_taken: String(med.doses_taken),
      category_id: med.category_id ? String(med.category_id) : "",
    });
    setShowModal(true);
  };

  const handleInlineAssignCategory = async (medId: number, targetCatId: string) => {
    setUpdatingCategoryId(medId);
    const newCatId = targetCatId ? parseInt(targetCatId, 10) : null;
    const catName = categories.find((c) => c.id === newCatId)?.title;

    try {
      await updateMedication(medId, { category_id: newCatId });
      setMeds((prev) =>
        prev.map((m) => (m.id === medId ? { ...m, category_id: newCatId } : m))
      );
      if (newCatId) {
        toast.success(`Medication assigned to "${catName || 'Category'}"`);
      } else {
        toast.success("Medication moved to Uncategorized");
      }
    } catch {
      toast.error("Failed to update medication category");
    } finally {
      setUpdatingCategoryId(null);
    }
  };

  const handleSave = async () => {
    try {
      const category_id = form.category_id
        ? parseInt(form.category_id, 10)
        : null;

      const payload = {
        name: form.name,
        cost: parseFloat(form.cost) || 0,
        doses_taken: parseInt(form.doses_taken) || 0,
        category_id,
      };
      if (editMed) {
        await client.put(`/medications/${editMed.id}`, payload);
        toast.success("Medication updated!");
      } else {
        await client.post("/medications/", payload);
        toast.success("Medication added!");
      }
      setShowModal(false);
      fetchMeds();
    } catch {
      toast.error("Failed to save medication");
    }
  };

  const handleTakeDose = async (id: number) => {
    try {
      await client.post(`/medications/${id}/take`, { doses: 1 });
      toast.success("+1 dose logged!");
      fetchMeds();
    } catch {
      toast.error("Failed to log dose");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this medication?")) return;
    try {
      await client.delete(`/medications/${id}`);
      toast.success("Medication deleted");
      fetchMeds();
    } catch {
      toast.error("Failed to delete medication");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Pill className="text-purple-400" size={26} />
            Medication Tracker
          </h2>
          <p className="text-sm text-[#a59cb8] mt-0.5">
            Track daily medications, dosage logs, and costs. Uncategorized items can be assigned directly to categories below.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-purple-500/25"
        >
          <Plus size={18} />
          Add Medication
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="glass-card p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Quick Filter Tabs */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setFilterMode("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterMode === "all"
                ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                : "bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            All Meds ({meds.length})
          </button>
          <button
            onClick={() => setFilterMode("uncategorized")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterMode === "uncategorized"
                ? "bg-amber-500 text-[#15121c] font-bold shadow-md shadow-amber-500/20"
                : "bg-slate-900/60 text-amber-300 hover:bg-amber-500/10 border border-amber-500/30"
            }`}
          >
            <Tag size={13} />
            Uncategorized ({uncategorizedCount})
          </button>
          <button
            onClick={() => setFilterMode("categorized")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterMode === "categorized"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            Categorized ({categorizedCount})
          </button>
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-64">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search medications..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="animate-spin text-purple-500" />
        </div>
      ) : filteredMeds.length === 0 ? (
        <div className="text-center py-16 glass-card border border-dashed border-slate-800">
          <Pill size={44} className="mx-auto text-slate-600 mb-3" />
          <h4 className="text-base font-bold text-white mb-1">No medications found</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? "No medications match your search query."
              : filterMode === "uncategorized"
              ? "All tracked medications are currently categorized!"
              : "No medications tracked yet. Add your first one!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeds.map((med) => {
            const isUncategorized = med.category_id === null || med.category_id === undefined;
            const matchedCat = categories.find((c) => c.id === med.category_id);
            const isUpdating = updatingCategoryId === med.id;

            return (
              <div key={med.id} className="glass-card p-6 border-slate-800 hover:border-purple-500/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-white">
                          {med.name}
                        </h3>
                        {isUncategorized ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                            <Tag size={11} /> Uncategorized
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-900/30 text-purple-300 border border-purple-800/40">
                            <FolderTree size={11} />
                            {matchedCat?.title || `Category #${med.category_id}`}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">
                        ₱{(med.cost || 0).toFixed(2)} per dose
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEdit(med)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-all"
                        title="Edit medication"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(med.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-all"
                        title="Delete medication"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Inline Category Assignment Dropdown */}
                  <div className="my-3 flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                    <span className="text-slate-400 shrink-0 font-medium">Category:</span>
                    <div className="flex items-center gap-1 min-w-0">
                      <select
                        value={med.category_id || ""}
                        disabled={isUpdating}
                        onChange={(e) => handleInlineAssignCategory(med.id, e.target.value)}
                        className="bg-transparent text-white focus:outline-none cursor-pointer max-w-[170px] truncate text-xs font-medium"
                      >
                        <option value="" className="bg-slate-900 text-amber-400">
                          Uncategorized
                        </option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                            {c.title}
                          </option>
                        ))}
                      </select>
                      {isUpdating && <Loader2 size={12} className="animate-spin text-amber-400 shrink-0" />}
                    </div>
                  </div>

                  {/* Metric stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3 text-center">
                      <p className="text-xs text-slate-400">Doses Taken</p>
                      <p className="text-xl font-bold text-white mt-0.5">
                        {med.doses_taken}
                      </p>
                    </div>
                    <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3 text-center">
                      <p className="text-xs text-slate-400">Total Spent</p>
                      <p className="text-xl font-bold text-purple-300 mt-0.5">
                        ₱
                        {(
                          med.total_spent ||
                          med.cost * med.doses_taken ||
                          0
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleTakeDose(med.id)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-600/20 text-purple-300 hover:bg-purple-600 hover:text-white border border-purple-500/30 font-medium rounded-xl transition-all active:scale-95 text-xs sm:text-sm"
                >
                  <Plus size={16} />
                  +1 Take Dose
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="border-b border-slate-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                {editMed ? "Edit Medication" : "Add Medication"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-white placeholder:text-slate-500"
                  placeholder="Medication name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Cost per dose (₱)
                </label>
                <input
                  type="number"
                  value={form.cost}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, cost: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-white placeholder:text-slate-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Category (Optional)
                </label>
                <select
                  value={form.category_id || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category_id: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-white"
                >
                  <option value="">None / Uncategorized</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Initial Doses Taken
                </label>
                <input
                  type="number"
                  value={form.doses_taken}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, doses_taken: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-white placeholder:text-slate-500"
                  placeholder="0"
                />
              </div>
              <button
                onClick={handleSave}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-purple-500/25"
              >
                {editMed ? "Update" : "Add Medication"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   USER MANAGEMENT TAB
   ═══════════════════════════════════════════════ */
const USERS_PAGE_SIZE = 20;

function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  const fetchUsers = useCallback(() => {
    getPage<AdminUser>("/admin/users", USERS_PAGE_SIZE, offset)
      .then(({ items, total }) => {
        setUsers(items);
        setTotal(total);
      })
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoading(false));
  }, [offset]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleRole = async (userId: number | string, currentAdmin: boolean) => {
    try {
      await client.patch(`/admin/users/${userId}/role`, {
        admin: !currentAdmin,
      });
      toast.success(`User role updated`);
      fetchUsers();
    } catch {
      toast.error("Failed to update user role");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">User Management</h2>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-xl transition-all"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-sm font-semibold text-slate-300 px-6 py-4">
                    User
                  </th>
                  <th className="text-left text-sm font-semibold text-slate-300 px-6 py-4">
                    Email
                  </th>
                  <th className="text-left text-sm font-semibold text-slate-300 px-6 py-4">
                    Role
                  </th>
                  <th className="text-right text-sm font-semibold text-slate-300 px-6 py-4">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-slate-800 last:border-0 hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                          {(u.first_name?.[0] || "") + (u.last_name?.[0] || "")}
                        </div>
                        <span className="font-medium text-white">
                          {u.first_name} {u.last_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {u.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          u.admin
                            ? "bg-blue-900/30 text-blue-300 border border-blue-800/40"
                            : "bg-slate-800 text-slate-400 border border-slate-700/50"
                        }`}
                      >
                        {u.admin ? (
                          <>
                            <ShieldCheck size={12} /> Admin
                          </>
                        ) : (
                          "User"
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => toggleRole(u.id, u.admin)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          u.admin
                            ? "text-red-400 hover:bg-red-900/20"
                            : "text-blue-400 hover:bg-blue-900/20"
                        }`}
                      >
                        {u.admin ? (
                          <>
                            <ShieldOff size={14} /> Revoke Admin
                          </>
                        ) : (
                          <>
                            <ShieldCheck size={14} /> Grant Admin
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {total > USERS_PAGE_SIZE && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-[#342c45] text-sm text-[#a59cb8]">
              <span>
                Showing {offset + 1}–{Math.min(offset + USERS_PAGE_SIZE, total)} of {total}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setOffset((o) => Math.max(0, o - USERS_PAGE_SIZE))}
                  disabled={offset === 0}
                  className="px-3 py-1.5 rounded-lg border border-[#342c45] hover:text-amber-300 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setOffset((o) => o + USERS_PAGE_SIZE)}
                  disabled={offset + USERS_PAGE_SIZE >= total}
                  className="px-3 py-1.5 rounded-lg border border-[#342c45] hover:text-amber-300 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN ADMIN DASHBOARD
   ═══════════════════════════════════════════════ */
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const renderTab = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab onNavigate={setActiveTab} />;
      case "portfolio":
        return <PortfolioConfigTab />;
      case "categories":
        return <CategoriesOverview embedded />;
      case "expenses":
        return <ExpensesTab />;
      case "savings":
        return <SavingsView embedded />;
      case "medications":
        return <MedicationsTab />;
      case "users":
        return <UsersTab />;
      default:
        return <OverviewTab onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#15121c] pt-20 text-[#ece8f4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex overflow-x-auto gap-2 mb-8 pb-1 scrollbar-none">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "bg-amber-500 text-[#15121c] font-semibold shadow-lg shadow-amber-500/20"
                    : "text-[#a59cb8] hover:bg-[#1f1a2b] hover:text-amber-300 border border-transparent hover:border-[#342c45]"
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="animate-[fadeIn_0.3s_ease-out]">{renderTab()}</div>
      </div>
    </div>
  );
}
