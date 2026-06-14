"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface Order { _id:string; orderNumber:string; customerInfo:{name:string;email:string;phone:string}; deliveryAddress:{street:string;city:string;zip:string}; items:{name:string;quantity:number;price:number}[]; total:number; status:string; paymentMethod:string; createdAt:string; }

const SC: Record<string,string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  confirmed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  preparing: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  out_for_delivery: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  delivered: "bg-green/10 text-green border-green/20",
  cancelled: "bg-error/10 text-error border-error/20",
};
const STATUSES = ["all","pending","confirmed","preparing","out_for_delivery","delivered","cancelled"];

const NEXT: Record<string,{s:string;l:string;c:string}> = {
  pending:          { s:"confirmed",        l:"✓ Confirm",    c:"border-blue-500/30 text-blue-400 hover:bg-blue-500/10" },
  confirmed:        { s:"preparing",        l:"🌿 Preparing", c:"border-purple-500/30 text-purple-400 hover:bg-purple-500/10" },
  preparing:        { s:"out_for_delivery", l:"🚗 Out for Delivery", c:"border-orange-500/30 text-orange-400 hover:bg-orange-500/10" },
  out_for_delivery: { s:"delivered",        l:"✅ Delivered", c:"border-green/30 text-green hover:bg-green/10" },
};

export default function AdminOrders() {
  const [orders,   setOrders]   = useState<Order[]>([]);
  const [filter,   setFilter]   = useState("all");
  const [search,   setSearch]   = useState("");
  const [loading,  setLoading]  = useState(true);
  const [updating, setUpdating] = useState<string|null>(null);

  const load = useCallback(() => {
    setLoading(true);
    api.get(`/orders${filter !== "all" ? `?status=${filter}` : ""}`)
      .then(r => r.json()).then(d => setOrders(d.orders || [])).finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    await api.patch(`/orders/${id}`, { status });
    setUpdating(null); load();
  };

  const filtered = orders.filter(o =>
    !search || o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
    o.customerInfo.name.toLowerCase().includes(search.toLowerCase()) ||
    o.customerInfo.phone.includes(search)
  );

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div>
          <h2 className="font-title text-2xl font-bold text-textPri">Orders</h2>
          <p className="font-sans text-sm text-textSec">{filtered.length} order{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-2 bg-surface border border-border rounded-2xl px-3 py-2 w-full sm:w-56 focus-within:border-green transition-colors">
          <span className="ms text-textDim" style={{ fontSize: "16px" }}>search</span>
          <input className="bg-transparent outline-none text-sm w-full placeholder:text-textDim text-textPri" placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button onClick={() => setSearch("")}><span className="ms text-textDim" style={{ fontSize: "14px" }}>close</span></button>}
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full font-sans text-xs font-semibold capitalize transition-all border ${filter === s ? "bg-green text-bg border-green" : "border-border text-textSec hover:border-borderHi hover:text-textPri"}`}>
            {s.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><span className="ms text-green animate-spin" style={{ fontSize: "32px" }}>progress_activity</span></div>
      ) : (
        <div className="space-y-3">
          {filtered.map(o => (
            <div key={o._id} className="bg-surface border border-border rounded-3xl overflow-hidden hover:border-borderHi transition-colors">
              {/* Top */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-border">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-title text-sm font-bold text-green">{o.orderNumber}</span>
                  <span className={`px-2.5 py-1 rounded-full font-sans text-[10px] font-semibold capitalize border ${SC[o.status]}`}>{o.status.replace(/_/g, " ")}</span>
                  <span className="font-sans text-xs text-textDim">{new Date(o.createdAt).toLocaleString("en-US", { month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" })}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-title text-lg font-bold text-textPri">{o.total.toFixed(2)}</span>
                  <Link href={`/admin/orders/${o._id}`} className="border border-border text-textSec px-3 py-1.5 rounded-xl font-sans text-xs hover:border-green hover:text-green transition-colors">
                    Details
                  </Link>
                </div>
              </div>

              {/* Body */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5">
                <div>
                  <p className="font-sans text-[10px] text-textDim uppercase tracking-widest mb-1.5">Customer</p>
                  <p className="font-sans text-sm font-semibold text-textPri">{o.customerInfo.name}</p>
                  <a href={`tel:${o.customerInfo.phone}`} className="font-sans text-xs text-green hover:underline block">{o.customerInfo.phone}</a>
                  <p className="font-sans text-xs text-textSec truncate">{o.customerInfo.email}</p>
                </div>
                <div>
                  <p className="font-sans text-[10px] text-textDim uppercase tracking-widest mb-1.5">Delivery</p>
                  <p className="font-sans text-sm text-textPri">{o.deliveryAddress.street}</p>
                  <p className="font-sans text-xs text-textSec">{o.deliveryAddress.city}, {o.deliveryAddress.zip}</p>
                  <p className="font-sans text-xs text-textSec mt-1">{o.paymentMethod === "etransfer" ? "💳 E-Transfer" : "💵 Cash"}</p>
                </div>
                <div>
                  <p className="font-sans text-[10px] text-textDim uppercase tracking-widest mb-1.5">Items</p>
                  <div className="space-y-0.5 mb-3">
                    {o.items.map((it, i) => <p key={i} className="font-sans text-xs text-textSec">{it.name} ×{it.quantity}</p>)}
                  </div>
                  {o.status !== "delivered" && o.status !== "cancelled" && (
                    <div className="flex flex-wrap gap-2">
                      {NEXT[o.status] && (
                        <button disabled={updating === o._id} onClick={() => updateStatus(o._id, NEXT[o.status].s)}
                          className={`px-3 py-1.5 rounded-full font-sans text-[10px] font-semibold border transition-colors disabled:opacity-40 ${NEXT[o.status].c}`}>
                          {updating === o._id ? "..." : NEXT[o.status].l}
                        </button>
                      )}
                      <button disabled={updating === o._id} onClick={() => updateStatus(o._id, "cancelled")}
                        className="px-3 py-1.5 rounded-full font-sans text-[10px] font-semibold border border-error/30 text-error hover:bg-error/10 transition-colors disabled:opacity-40">
                        ✕ Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="bg-surface border border-border rounded-3xl py-16 text-center">
              <span className="ms text-textDim block mb-3" style={{ fontSize: "40px" }}>receipt_long</span>
              <p className="font-sans text-sm text-textSec">No orders found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
