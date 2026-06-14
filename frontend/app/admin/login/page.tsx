"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

export default function AdminLoginPage() {
  const { login, user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err,  setErr]  = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) router.push(isAdmin ? "/admin" : "/");
  }, [user, isAdmin, loading, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr("");
    const res = await login(form.email, form.password);
    if (res.error) { setErr(res.error); setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="font-title text-3xl font-bold text-green">Smokablunt</Link>
          <p className="font-sans text-xs text-textDim mt-1 uppercase tracking-widest">Admin Panel</p>
        </div>

        <div className="bg-surface border border-border rounded-3xl overflow-hidden">
          <div className="bg-greenBg border-b border-border px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-green/20 flex items-center justify-center">
                <span className="ms text-green" style={{ fontSize: "20px" }}>admin_panel_settings</span>
              </div>
              <div>
                <h1 className="font-title text-base font-semibold text-textPri">Admin Sign In</h1>
                <p className="font-sans text-xs text-textSec">Restricted access only</p>
              </div>
            </div>
          </div>

          <form onSubmit={submit} className="p-6 space-y-4">
            <div>
              <label className="block font-sans text-xs font-semibold text-textDim uppercase tracking-widest mb-1.5">Email</label>
              <input
                required type="email"
                value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="w-full bg-bg border border-border rounded-2xl px-4 py-3 font-sans text-sm text-textPri placeholder:text-textDim focus:outline-none focus:border-green transition-colors"
                placeholder="admin@smokablunt.com"
              />
            </div>
            <div>
              <label className="block font-sans text-xs font-semibold text-textDim uppercase tracking-widest mb-1.5">Password</label>
              <input
                required type="password"
                value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className="w-full bg-bg border border-border rounded-2xl px-4 py-3 font-sans text-sm text-textPri placeholder:text-textDim focus:outline-none focus:border-green transition-colors"
                placeholder="••••••••"
              />
            </div>

            {err && (
              <div className="p-3 bg-errorBg border border-error/20 rounded-2xl">
                <p className="font-sans text-sm text-error flex items-center gap-2">
                  <span className="ms" style={{ fontSize: "16px" }}>error</span>{err}
                </p>
              </div>
            )}

            <button
              type="submit" disabled={busy}
              className="w-full bg-green text-bg py-4 rounded-2xl font-sans text-sm font-bold uppercase tracking-widest hover:bg-greenLo transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {busy && <span className="ms animate-spin" style={{ fontSize: "16px" }}>progress_activity</span>}
              {busy ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <div className="text-center mt-6 space-y-2">
          <Link href="/" className="font-sans text-xs text-textDim hover:text-textSec transition-colors block">
            ← Back to store
          </Link>
          <p className="font-sans text-xs text-textDim">
            Run <code className="text-green">npm run seed</code> in backend to create admin
          </p>
        </div>
      </div>
    </div>
  );
}
