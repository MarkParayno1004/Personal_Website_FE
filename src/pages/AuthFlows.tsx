import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, CheckCircle2, KeyRound, Loader2, Lock, Mail, XCircle } from "lucide-react";
import client from "../api/client";
import { apiError, inputClass, primaryButtonClass } from "../api/forms";

function AuthCard({ icon, title, subtitle, children }: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#15121c] px-4">
      <div className="w-full max-w-md glass-card p-8 sm:p-10 border border-[#342c45] accent-left">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#1f1a2b] border border-amber-500/30 flex items-center justify-center">
            {icon}
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
          <p className="text-[#a59cb8] mt-1 text-sm">{subtitle}</p>
        </div>
        {children}
        <div className="text-center mt-6 pt-5 border-t border-[#342c45]/60">
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-1.5 text-xs text-[#a59cb8] hover:text-amber-400 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to sign in</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await client.post("/auth/password-reset/request", { email });
      setSent(true);
    } catch (err) {
      toast.error(apiError(err, "Could not send the reset link. Try again in a minute."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      icon={<KeyRound size={28} className="text-amber-400" />}
      title="Reset your password"
      subtitle="We'll email you a link to choose a new one."
    >
      {sent ? (
        <p className="text-sm text-[#ece8f4] text-center" role="status">
          If {email} has an account, a reset link is on its way. It works once and expires in 30 minutes.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="reset-email" className="block text-sm font-medium text-[#ece8f4] mb-1.5">
              Email address
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a59cb8]" />
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className={inputClass}
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className={primaryButtonClass}>
            {loading && <Loader2 size={18} className="animate-spin" />}
            Send reset link
          </button>
        </form>
      )}
    </AuthCard>
  );
}

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("The two passwords don't match");
      return;
    }
    setLoading(true);
    try {
      await client.post("/auth/password-reset/confirm", { token, new_password: password });
      toast.success("Password changed. Sign in with your new password.");
      navigate("/admin/login");
    } catch (err) {
      toast.error(apiError(err, "This link is invalid or has expired. Request a new one."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      icon={<Lock size={28} className="text-amber-400" />}
      title="Choose a new password"
      subtitle="At least 8 characters. Every signed-in device will be signed out."
    >
      {!token ? (
        <p className="text-sm text-center text-[#ece8f4]">
          This link is missing its token.{" "}
          <Link to="/forgot-password" className="text-amber-400 hover:underline">Request a new link</Link>.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {[
            { id: "new-password", label: "New password", value: password, set: setPassword },
            { id: "confirm-password", label: "Confirm new password", value: confirm, set: setConfirm },
          ].map((field) => (
            <div key={field.id}>
              <label htmlFor={field.id} className="block text-sm font-medium text-[#ece8f4] mb-1.5">
                {field.label}
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a59cb8]" />
                <input
                  id={field.id}
                  type="password"
                  value={field.value}
                  onChange={(e) => field.set(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className={inputClass}
                />
              </div>
            </div>
          ))}
          <button type="submit" disabled={loading} className={primaryButtonClass}>
            {loading && <Loader2 size={18} className="animate-spin" />}
            Change password
          </button>
        </form>
      )}
    </AuthCard>
  );
}

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [state, setState] = useState<"working" | "done" | "failed">(token ? "working" : "failed");
  const sentRef = useRef(false); // StrictMode runs effects twice in dev

  useEffect(() => {
    if (!token || sentRef.current) return;
    sentRef.current = true;
    client
      .post("/auth/verify-email/confirm", { token })
      .then(() => setState("done"))
      .catch(() => setState("failed"));
  }, [token]);

  const content = {
    working: { icon: <Loader2 size={28} className="text-amber-400 animate-spin" />, title: "Verifying your email", text: "One moment." },
    done: { icon: <CheckCircle2 size={28} className="text-emerald-400" />, title: "Email verified", text: "Your address is confirmed. You can close this tab." },
    failed: {
      icon: <XCircle size={28} className="text-red-400" />,
      title: "This link didn't work",
      text: "It may have expired. Sign in and send a new one from Account settings.",
    },
  }[state];

  return (
    <AuthCard icon={content.icon} title={content.title} subtitle={content.text}>
      <span className="sr-only" role="status">{content.title}</span>
    </AuthCard>
  );
}
