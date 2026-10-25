// Shared form styling and API error text for the auth/account pages.
export const inputClass =
  "w-full pl-10 pr-4 py-2.5 bg-[#15121c] border border-[#342c45] rounded-xl focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50 outline-none transition-all text-white placeholder:text-slate-500 text-sm";
export const primaryButtonClass =
  "w-full flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-600 text-[#15121c] font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-sm";

export function apiError(err: unknown, fallback: string): string {
  const detail = (err as { response?: { data?: { detail?: unknown } } }).response?.data?.detail;
  if (typeof detail === "string") return detail;
  // FastAPI validation errors: [{ msg: "..." }]
  if (Array.isArray(detail) && detail[0]?.msg) return String(detail[0].msg).replace(/^Value error, /, "");
  return fallback;
}
