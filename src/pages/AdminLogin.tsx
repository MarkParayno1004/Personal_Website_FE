import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { Shield, Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.admin) {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch {
      // Error toast is handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a192f] px-4 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-amber-500/[0.04] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-teal-500/[0.04] rounded-full blur-[140px] pointer-events-none" />

      {/* Floating decorative dots */}
      <div className="absolute top-[20%] left-[15%] w-1.5 h-1.5 rounded-full bg-amber-400/30 animate-float" />
      <div className="absolute bottom-[20%] right-[15%] w-2 h-2 rounded-full bg-teal-400/25 animate-float-slow" />
      <div className="absolute top-[60%] left-[10%] w-1 h-1 rounded-full bg-amber-400/20 animate-float-slower" />

      <div className="relative w-full max-w-md z-10">
        <div className="glass-card p-8 sm:p-10 border border-[#233554] shadow-2xl shadow-black/50 accent-left">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#112240] border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10 relative">
              <Shield size={28} className="text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Admin Portal</h1>
            <p className="text-[#8892b0] mt-1 text-sm">
              Sign in to manage your portfolio & content
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#e2e8f0] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8892b0]"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0a192f] border border-[#233554] rounded-xl focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50 outline-none transition-all text-white placeholder:text-slate-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#e2e8f0] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8892b0]"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-12 py-2.5 bg-[#0a192f] border border-[#233554] rounded-xl focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50 outline-none transition-all text-white placeholder:text-slate-500 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8892b0] hover:text-amber-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-600 text-[#0a192f] font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin text-[#0a192f]" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Back link */}
          <div className="text-center mt-6 pt-5 border-t border-[#233554]/60">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-[#8892b0] hover:text-amber-400 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to Portfolio</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
