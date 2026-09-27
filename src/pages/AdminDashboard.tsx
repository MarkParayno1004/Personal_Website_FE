import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ComponentType,
} from "react";
import client from "../api/client";
import { getCategories } from "../api/categories";
import CategoriesOverview from "../components/categories/CategoriesOverview";
import toast from "react-hot-toast";
import {
  LayoutDashboard,
  Palette,
  FolderTree,
  Receipt,
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
  ExternalLink,
  FileCheck,
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
              <div className="h-10 w-10 bg-[#233554] rounded-xl mb-3" />
              <div className="h-4 bg-[#233554] rounded w-20 mb-2" />
              <div className="h-6 bg-[#233554] rounded w-16" />
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
                <p className="text-sm text-[#8892b0]">{card.label}</p>
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
                <p className="text-sm text-[#8892b0] mt-1">{action.desc}</p>
                <ArrowRight
                  size={16}
                  className="mt-3 text-[#8892b0] group-hover:text-amber-400 group-hover:translate-x-1 transition-all"
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
  cv_url: string;
  cv_name: string;
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
    cv_url: "",
    cv_name: "",
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

        const cv =
          raw.cv_url ||
          raw.cv_file ||
          raw.cv ||
          raw.resume_url ||
          raw.resume_file ||
          raw.resume ||
          raw.pdf_url ||
          raw.pdf_file ||
          raw.pdf ||
          localStorage.getItem("portfolio_cv_url") ||
          "";

        const cvName =
          raw.cv_name ||
          raw.cv_filename ||
          localStorage.getItem("portfolio_cv_name") ||
          (cv ? "Curriculum_Vitae.pdf" : "");

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
          cv_url: cv,
          cv_name: cvName,
        });
      })
      .catch(() => {
        toast.error(
          "Failed to load portfolio config from server, loaded defaults",
        );
        setForm((prev) => ({
          ...prev,
          avatar_url: localStorage.getItem("portfolio_avatar") || "",
          cv_url: localStorage.getItem("portfolio_cv_url") || "",
          cv_name: localStorage.getItem("portfolio_cv_name") || "",
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

  const handleCvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      toast.error("Please upload a PDF document only (.pdf)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("PDF file exceeds 10MB limit");
      return;
    }

    const toastId = toast.loading("Loading CV document...");
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setForm((f) => ({
        ...f,
        cv_url: result,
        cv_name: file.name,
      }));
      toast.success(
        `CV attached: "${file.name}"! Click 'Save Changes' to apply.`,
        {
          id: toastId,
        },
      );
    };
    reader.onerror = () => {
      toast.error("Failed to read CV file", { id: toastId });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCv = () => {
    setForm((f) => ({ ...f, cv_url: "", cv_name: "" }));
    if (cvFileInputRef.current) {
      cvFileInputRef.current.value = "";
    }
    try {
      localStorage.removeItem("portfolio_cv_url");
      localStorage.removeItem("portfolio_cv_name");
    } catch {
      // ignore
    }
    toast.success("CV removed.");
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

        if (form.cv_url) {
          localStorage.setItem("portfolio_cv_url", form.cv_url);
          if (form.cv_name)
            localStorage.setItem("portfolio_cv_name", form.cv_name);
        } else {
          localStorage.removeItem("portfolio_cv_url");
          localStorage.removeItem("portfolio_cv_name");
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
        cv: form.cv_url,
        cv_url: form.cv_url,
        cv_file: form.cv_url,
        cv_name: form.cv_name,
        resume: form.cv_url,
        resume_url: form.cv_url,
        pdf: form.cv_url,
        pdf_url: form.cv_url,
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
      "summary" | "avatar_url" | "cv_url" | "cv_name"
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
          <p className="text-sm text-[#8892b0] mt-1">
            Customize your public portfolio information, hero image, and bio
            summary.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-[#0a192f] font-semibold rounded-xl transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 active:scale-[0.98] disabled:opacity-60"
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
            <p className="text-sm text-[#8892b0] mb-4">
              Upload a photo to be showcased in the Hero section of your
              portfolio. If no image is provided, a stylized initials avatar
              ("MP") will be shown.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-[#0a192f]/60 border border-[#233554]">
              {/* Thumbnail preview */}
              <div className="w-24 h-24 rounded-xl bg-[#112240] border border-[#233554] flex items-center justify-center overflow-hidden shrink-0 relative group">
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
                <div className="text-xs text-[#8892b0]">
                  Supports PNG, JPG, WEBP, SVG (max 5MB)
                </div>
              </div>
            </div>

            {/* Direct Image URL input */}
            <div className="mt-4">
              <label className="block text-xs font-medium text-[#8892b0] mb-1.5">
                Or enter image URL:
              </label>
              <div className="relative">
                <ImageIcon
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8892b0]"
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
                  className="w-full pl-10 pr-4 py-2 bg-[#0a192f] border border-[#233554] rounded-lg focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50 outline-none transition-all text-sm text-white placeholder:text-slate-500"
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
            <p className="text-sm text-[#8892b0] mb-4">
              Upload your CV or resume in PDF format. When visitors or
              recruiters click the{" "}
              <strong className="text-amber-400">"Download CV"</strong> button
              on your portfolio hero, this file will be downloaded or opened.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-[#0a192f]/60 border border-[#233554]">
              {/* PDF icon badge */}
              <div className="w-16 h-16 rounded-xl bg-[#112240] border border-[#233554] flex items-center justify-center shrink-0">
                <FileText
                  size={32}
                  className={
                    form.cv_url ? "text-amber-400" : "text-[#8892b0]/40"
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
                  className="hidden"
                  id="cv-file-input"
                />

                {form.cv_url ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-emerald-400">
                      <FileCheck size={16} />
                      <span className="truncate">
                        {form.cv_name || "Curriculum_Vitae.pdf"}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
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
                    <div className="text-xs text-[#8892b0]">
                      Accepts .PDF files only (max 10MB)
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Direct CV URL input */}
            <div className="mt-4">
              <label className="block text-xs font-medium text-[#8892b0] mb-1.5">
                Or enter direct CV download / BE URL:
              </label>
              <div className="relative">
                <FileText
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8892b0]"
                />
                <input
                  type="text"
                  placeholder="https://example.com/cv.pdf or /media/cv.pdf"
                  value={form.cv_url.startsWith("data:") ? "" : form.cv_url}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      cv_url: e.target.value,
                      cv_name: e.target.value ? "Remote_CV.pdf" : "",
                    }))
                  }
                  className="w-full pl-10 pr-4 py-2 bg-[#0a192f] border border-[#233554] rounded-lg focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50 outline-none transition-all text-sm text-white placeholder:text-slate-500"
                />
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
                    className="w-full px-4 py-2.5 bg-[#0a192f] border border-[#233554] rounded-xl focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50 outline-none transition-all text-white placeholder:text-slate-500"
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
              <span className="text-xs text-[#8892b0]">
                {form.summary.length} characters
              </span>
            </div>
            <p className="text-xs text-[#8892b0] mb-3">
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
              className="w-full px-4 py-3 bg-[#0a192f] border border-[#233554] rounded-xl focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50 outline-none transition-all text-white placeholder:text-slate-500 resize-y leading-relaxed text-sm"
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

            <div className="bg-[#0a192f] border border-[#233554] rounded-2xl p-6 text-center overflow-hidden relative">
              {/* Background ambient glow */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

              {/* Hero Avatar Box Preview */}
              <div className="relative inline-block my-2">
                <div className="w-48 h-48 rounded-2xl bg-[#112240] border border-[#233554] flex items-center justify-center relative overflow-hidden group shadow-xl shadow-black/40">
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
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-[#8892b0]">
                {form.location && (
                  <span className="px-2.5 py-1 rounded-full bg-[#112240] border border-[#233554]">
                    📍 {form.location}
                  </span>
                )}
                {form.email && (
                  <span className="px-2.5 py-1 rounded-full bg-[#112240] border border-[#233554]">
                    ✉️ {form.email}
                  </span>
                )}
                {form.phone && (
                  <span className="px-2.5 py-1 rounded-full bg-[#112240] border border-[#233554]">
                    📞 {form.phone}
                  </span>
                )}
              </div>

              {/* CV Status Badge Preview */}
              <div className="mt-3 flex items-center justify-center">
                {form.cv_url ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                    <FileCheck size={13} />
                    Download CV active ({form.cv_name || "PDF"})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#112240] border border-[#233554] text-[#8892b0] text-xs">
                    <FileText size={13} />
                    No CV attached (Download CV disabled)
                  </span>
                )}
              </div>

              {/* About Summary Box Preview */}
              <div className="mt-6 pt-5 border-t border-[#233554]/60 text-left">
                <p className="text-xs font-mono text-amber-400 mb-2">
                  01. About Me Preview:
                </p>
                <div className="p-4 rounded-xl bg-[#112240]/60 border border-[#233554] text-xs text-[#8892b0] leading-relaxed">
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
  const [formData, setFormData] = useState<ExpenseFormData>({
    title: "",
    gross_income: "",
    category_id: "",
    items: [{ description: "", amount: "" }],
    tax_deductions: [{ description: "", amount: "" }],
  });

  const fetchSheets = useCallback(() => {
    client
      .get("/expenses/")
      .then((res) => setSheets(res.data))
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Expense Tracker</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/25"
        >
          <Plus size={18} />
          New Sheet
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="animate-spin text-blue-500" />
        </div>
      ) : sheets.length === 0 ? (
        <div className="text-center py-20">
          <Receipt size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400">
            No expense sheets yet. Create your first one!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sheets.map((sheet) => {
            const matchedCategory = categories.find(
              (c) => c.id === sheet.category_id,
            );

            return (
              <div key={sheet.id} className="glass-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-white">
                      {sheet.title || `Sheet #${sheet.id}`}
                    </h3>
                    {sheet.category_id && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/30 text-blue-300 border border-blue-800/40">
                        <FolderTree size={12} />
                        {matchedCategory?.title ||
                          `Category #${sheet.category_id}`}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(sheet)}
                      className="p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-all"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(sheet.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { label: "Gross Income", value: sheet.gross_income },
                    {
                      label: "Tax Deductions",
                      value: sheet.total_tax_deductions,
                    },
                    { label: "Net Income", value: sheet.net_income },
                    { label: "Total Expenses", value: sheet.total_expenses },
                    { label: "Remaining", value: sheet.remaining_income },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3"
                    >
                      <p className="text-xs text-slate-400">{item.label}</p>
                      <p className="text-lg font-bold text-white">
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
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white placeholder:text-slate-500"
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
                    className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white placeholder:text-slate-500"
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
                    className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white"
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
                    className="text-sm text-blue-400 hover:underline flex items-center gap-1"
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
                      className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder:text-slate-500"
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
                      className="w-28 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder:text-slate-500"
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
                      className="text-sm text-blue-400 hover:underline flex items-center gap-1"
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
                        className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder:text-slate-500"
                      />
                      <input
                        type="number"
                        placeholder="Amount"
                        value={item.amount}
                        onChange={(e) =>
                          updateItem("items", idx, "amount", e.target.value)
                        }
                        className="w-28 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder:text-slate-500"
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
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/25"
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
  const [form, setForm] = useState({
    name: "",
    cost: "",
    doses_taken: "0",
    category_id: "",
  });

  const fetchMeds = useCallback(() => {
    client
      .get("/medications/")
      .then((res) => setMeds(res.data))
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Medication Tracker</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/25"
        >
          <Plus size={18} />
          Add Medication
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="animate-spin text-blue-500" />
        </div>
      ) : meds.length === 0 ? (
        <div className="text-center py-20">
          <Pill size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400">No medications tracked yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {meds.map((med) => {
            const matchedCat = categories.find((c) => c.id === med.category_id);

            return (
              <div key={med.id} className="glass-card p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-white">
                        {med.name}
                      </h3>
                      {med.category_id && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-900/30 text-purple-300 border border-purple-800/40">
                          <FolderTree size={11} />
                          {matchedCat?.title || `Category #${med.category_id}`}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400">
                      ₱{(med.cost || 0).toFixed(2)} per dose
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(med)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-all"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(med.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
                    <p className="text-xs text-slate-400">Doses Taken</p>
                    <p className="text-2xl font-bold text-white">
                      {med.doses_taken}
                    </p>
                  </div>
                  <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
                    <p className="text-xs text-slate-400">Total Spent</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      ₱
                      {(
                        med.total_spent ||
                        med.cost * med.doses_taken ||
                        0
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleTakeDose(med.id)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-900/20 text-emerald-300 hover:bg-emerald-900/30 border border-emerald-800/40 font-medium rounded-xl transition-all"
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
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder:text-slate-500"
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
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder:text-slate-500"
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
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white"
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
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder:text-slate-500"
                  placeholder="0"
                />
              </div>
              <button
                onClick={handleSave}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/25"
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
function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(() => {
    client
      .get("/admin/users")
      .then((res) => setUsers(res.data))
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

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
      case "medications":
        return <MedicationsTab />;
      case "users":
        return <UsersTab />;
      default:
        return <OverviewTab onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a192f] pt-20 text-[#e2e8f0]">
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
                    ? "bg-amber-500 text-[#0a192f] font-semibold shadow-lg shadow-amber-500/20"
                    : "text-[#8892b0] hover:bg-[#112240] hover:text-amber-300 border border-transparent hover:border-[#233554]"
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
