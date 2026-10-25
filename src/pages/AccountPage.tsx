import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { BadgeCheck, Loader2, Lock, MailWarning, Trash2 } from "lucide-react";
import client from "../api/client";
import { useAuth } from "../context/useAuth";
import { apiError, inputClass } from "../api/forms";

export default function AccountPage() {
  const { user, setSession, clearSession } = useAuth();
  const navigate = useNavigate();
  const [sendingVerification, setSendingVerification] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  const resendVerification = async () => {
    setSendingVerification(true);
    try {
      await client.post("/auth/verify-email/request");
      toast.success(`Verification link sent to ${user?.email}`);
    } catch (err) {
      toast.error(apiError(err, "Could not send the link. Try again in a minute."));
    } finally {
      setSendingVerification(false);
    }
  };

  const changePassword = async (e: FormEvent) => {
    e.preventDefault();
    setSavingPassword(true);
    try {
      const res = await client.put("/auth/me/password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      // Old tokens are revoked; the response carries the only valid one.
      const { token, ...userData } = res.data;
      setSession(token, userData);
      setCurrentPassword("");
      setNewPassword("");
      toast.success("Password changed. Other devices were signed out.");
    } catch (err) {
      toast.error(apiError(err, "Could not change the password"));
    } finally {
      setSavingPassword(false);
    }
  };

  const deleteAccount = async (e: FormEvent) => {
    e.preventDefault();
    setDeleting(true);
    try {
      await client.delete("/auth/me");
      clearSession();
      toast.success("Account deleted");
      navigate("/");
    } catch (err) {
      toast.error(apiError(err, "Could not delete the account"));
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#15121c] pt-24 pb-16 text-[#ece8f4]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6">
        <h1 className="text-3xl font-bold text-white">Account settings</h1>

        <section className="glass-card p-6" aria-labelledby="email-heading">
          <h2 id="email-heading" className="text-lg font-semibold text-white mb-1">Email</h2>
          <p className="text-sm text-[#a59cb8] mb-4">{user?.email}</p>
          {user?.email_verified ? (
            <p className="inline-flex items-center gap-2 text-sm text-emerald-400">
              <BadgeCheck size={16} /> Verified
            </p>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <p className="inline-flex items-center gap-2 text-sm text-amber-300">
                <MailWarning size={16} /> Not verified yet
              </p>
              <button
                onClick={resendVerification}
                disabled={sendingVerification}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-sm font-medium disabled:opacity-60"
              >
                {sendingVerification && <Loader2 size={14} className="animate-spin" />}
                Send verification link
              </button>
            </div>
          )}
        </section>

        <section className="glass-card p-6" aria-labelledby="password-heading">
          <h2 id="password-heading" className="text-lg font-semibold text-white mb-4">Change password</h2>
          <form onSubmit={changePassword} className="space-y-4">
            {[
              { id: "current-password", label: "Current password", value: currentPassword, set: setCurrentPassword, auto: "current-password", min: undefined },
              { id: "account-new-password", label: "New password (at least 8 characters)", value: newPassword, set: setNewPassword, auto: "new-password", min: 8 },
            ].map((field) => (
              <div key={field.id}>
                <label htmlFor={field.id} className="block text-sm font-medium mb-1.5">{field.label}</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a59cb8]" />
                  <input
                    id={field.id}
                    type="password"
                    value={field.value}
                    onChange={(e) => field.set(e.target.value)}
                    required
                    minLength={field.min}
                    autoComplete={field.auto}
                    className={inputClass}
                  />
                </div>
              </div>
            ))}
            <button
              type="submit"
              disabled={savingPassword}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-[#15121c] font-semibold rounded-xl text-sm disabled:opacity-60"
            >
              {savingPassword && <Loader2 size={16} className="animate-spin" />}
              Change password
            </button>
          </form>
        </section>

        <section className="glass-card p-6 border-red-500/30" aria-labelledby="delete-heading">
          <h2 id="delete-heading" className="text-lg font-semibold text-red-400 mb-1">Delete account</h2>
          <p className="text-sm text-[#a59cb8] mb-4">
            Permanently removes your account, your records and uploaded files. This can't be undone.
          </p>
          <form onSubmit={deleteAccount} className="flex flex-col sm:flex-row gap-3">
            <label htmlFor="delete-confirm" className="sr-only">Type DELETE to confirm</label>
            <input
              id="delete-confirm"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="flex-1 px-4 py-2.5 bg-[#15121c] border border-[#342c45] rounded-xl outline-none focus:ring-2 focus:ring-red-500/40 text-sm text-white placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={deleteConfirm !== "DELETE" || deleting}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              Delete account
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
