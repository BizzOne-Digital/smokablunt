"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface User { _id:string; name:string; email:string; phone?:string; role:"admin"|"customer"; createdAt:string; }

export default function AdminUsers() {
  const [users,    setUsers]    = useState<User[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [updating, setUpdating] = useState<string|null>(null);

  const load = () => { setLoading(true); api.get("/admin/users").then(r => r.json()).then(d => setUsers(d.users || [])).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const toggleRole = async (u: User) => {
    if (!confirm(`Make ${u.name} a ${u.role === "admin" ? "customer" : "admin"}?`)) return;
    setUpdating(u._id);
    await api.patch(`/admin/users/${u._id}`, { role: u.role === "admin" ? "customer" : "admin" });
    load(); setUpdating(null);
  };

  const filtered = users.filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <h2 className="font-title text-2xl font-bold text-textPri">Users</h2>
          <p className="font-sans text-sm text-textSec">{filtered.length} accounts</p>
        </div>
        <div className="flex items-center gap-2 bg-surface border border-border rounded-2xl px-3 py-2 focus-within:border-green transition-colors">
          <span className="ms text-textDim" style={{fontSize:"16px"}}>search</span>
          <input className="bg-transparent outline-none text-sm w-44 placeholder:text-textDim text-textPri" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><span className="ms text-green animate-spin" style={{fontSize:"32px"}}>progress_activity</span></div>
      ) : (
        <div className="bg-surface border border-border rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border">
                  {["User","Email","Phone","Role","Joined","Action"].map(h => (
                    <th key={h} className="px-5 py-4 text-left font-sans text-[10px] font-semibold text-textDim uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u._id} className="border-b border-border last:border-0 hover:bg-surfaceHi transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-green/15 flex items-center justify-center flex-shrink-0">
                          <span className="font-title text-xs font-bold text-green">{u.name[0]?.toUpperCase()}</span>
                        </div>
                        <span className="font-sans text-sm font-semibold text-textPri">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4"><a href={`mailto:${u.email}`} className="font-sans text-sm text-textSec hover:text-green transition-colors">{u.email}</a></td>
                    <td className="px-5 py-4">{u.phone ? <a href={`tel:${u.phone}`} className="font-sans text-sm text-textSec hover:text-green transition-colors">{u.phone}</a> : <span className="font-sans text-sm text-textDim">—</span>}</td>
                    <td className="px-5 py-4"><span className={`px-2.5 py-1 rounded-full font-sans text-[10px] font-semibold ${u.role === "admin" ? "bg-green/15 text-green" : "bg-surfaceHi text-textSec"}`}>{u.role}</span></td>
                    <td className="px-5 py-4 font-sans text-xs text-textDim">{new Date(u.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</td>
                    <td className="px-5 py-4">
                      <button disabled={updating === u._id} onClick={() => toggleRole(u)}
                        className={`font-sans text-xs px-3 py-1.5 rounded-full border transition-colors disabled:opacity-50 ${u.role === "admin" ? "border-error/30 text-error hover:bg-errorBg" : "border-green/30 text-green hover:bg-green/10"}`}>
                        {updating === u._id ? "..." : (u.role === "admin" ? "Remove Admin" : "Make Admin")}
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center font-sans text-sm text-textSec">No users found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
