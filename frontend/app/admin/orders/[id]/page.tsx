"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

interface Order { _id:string; orderNumber:string; customerInfo:{name:string;email:string;phone:string}; deliveryAddress:{street:string;city:string;zip:string;notes?:string}; items:{name:string;quantity:number;price:number}[]; subtotal:number; deliveryFee:number; total:number; status:string; statusNote?:string; statusHistory:{status:string;note?:string;at:string}[]; paymentMethod:string; createdAt:string; }

const SC: Record<string,string> = { pending:"bg-yellow-500/10 text-yellow-400", confirmed:"bg-blue-500/10 text-blue-400", preparing:"bg-purple-500/10 text-purple-400", out_for_delivery:"bg-orange-500/10 text-orange-400", delivered:"bg-green/10 text-green", cancelled:"bg-error/10 text-error" };
const OPTS = [ {v:"pending",l:"⏳ Pending"},{v:"confirmed",l:"✅ Confirmed"},{v:"preparing",l:"🌿 Preparing"},{v:"out_for_delivery",l:"🚗 Out for Delivery"},{v:"delivered",l:"🎉 Delivered"},{v:"cancelled",l:"❌ Cancelled"} ];
const inp = "w-full bg-bg border border-border rounded-2xl px-3 py-2.5 font-sans text-sm text-textPri focus:outline-none focus:border-green transition-colors";

export default function OrderDetail() {
  const { id } = useParams<{id:string}>();
  const router  = useRouter();
  const [order,   setOrder]   = useState<Order|null>(null);
  const [loading, setLoading] = useState(true);
  const [status,  setStatus]  = useState("");
  const [note,    setNote]    = useState("");
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  useEffect(() => {
    api.get(`/orders/${id}`).then(r => r.json()).then(d => { setOrder(d.order); setStatus(d.order?.status || ""); }).finally(() => setLoading(false));
  }, [id]);

  const update = async () => {
    if (!order || !status) return;
    setSaving(true);
    const r = await api.patch(`/orders/${id}`, { status, statusNote: note });
    const d = await r.json();
    if (r.ok) { setOrder(d.order); setSaved(true); setTimeout(() => setSaved(false), 3000); setNote(""); }
    setSaving(false);
  };

  const del = async () => {
    if (!confirm("Delete this order?")) return;
    await api.delete(`/orders/${id}`);
    router.push("/admin/orders");
  };

  if (loading) return <div className="flex justify-center py-16"><span className="ms text-green animate-spin" style={{fontSize:"32px"}}>progress_activity</span></div>;
  if (!order) return <div className="text-center py-16"><p className="text-textSec">Order not found.</p><Link href="/admin/orders" className="text-green mt-4 block hover:underline">← Back</Link></div>;

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/admin/orders" className="font-sans text-xs text-textSec hover:text-green flex items-center gap-1 mb-1.5 transition-colors">
            <span className="ms" style={{fontSize:"14px"}}>arrow_back</span>All Orders
          </Link>
          <h2 className="font-title text-2xl font-bold text-textPri">{order.orderNumber}</h2>
          <p className="font-sans text-xs text-textSec mt-0.5">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`mailto:${order.customerInfo.email}`} className="flex items-center gap-1.5 border border-border text-textSec px-4 py-2 rounded-2xl font-sans text-xs hover:border-borderHi transition-colors">
            <span className="ms" style={{fontSize:"16px"}}>mail</span>Email
          </a>
          <a href={`tel:${order.customerInfo.phone}`} className="flex items-center gap-1.5 bg-green text-bg px-4 py-2 rounded-2xl font-sans text-xs font-bold hover:bg-greenLo transition-colors">
            <span className="ms" style={{fontSize:"16px"}}>call</span>Call
          </a>
          <button onClick={del} className="flex items-center gap-1.5 bg-errorBg border border-error/20 text-error px-4 py-2 rounded-2xl font-sans text-xs hover:brightness-110 transition-all">
            <span className="ms" style={{fontSize:"16px"}}>delete</span>
          </button>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-3xl p-5">
          <p className="font-sans text-[10px] text-textDim uppercase tracking-widest mb-3">Customer</p>
          <p className="font-sans text-base font-semibold text-textPri">{order.customerInfo.name}</p>
          <a href={`tel:${order.customerInfo.phone}`} className="font-sans text-sm text-green hover:underline block mt-1">{order.customerInfo.phone}</a>
          <a href={`mailto:${order.customerInfo.email}`} className="font-sans text-xs text-textSec hover:text-green transition-colors break-all mt-0.5 block">{order.customerInfo.email}</a>
        </div>
        <div className="bg-surface border border-border rounded-3xl p-5">
          <p className="font-sans text-[10px] text-textDim uppercase tracking-widest mb-3">Delivery</p>
          <p className="font-sans text-sm text-textPri">{order.deliveryAddress.street}</p>
          <p className="font-sans text-xs text-textSec">{order.deliveryAddress.city}, {order.deliveryAddress.zip}</p>
          {order.deliveryAddress.notes && <p className="font-sans text-xs text-textSec mt-2 italic">{order.deliveryAddress.notes}</p>}
          <p className="font-sans text-xs text-textSec mt-2">{order.paymentMethod === "etransfer" ? "💳 E-Transfer" : "💵 Cash"}</p>
        </div>
        <div className="bg-surface border border-border rounded-3xl p-5">
          <p className="font-sans text-[10px] text-textDim uppercase tracking-widest mb-3">Update Status</p>
          <select value={status} onChange={e => setStatus(e.target.value)} className={`${inp} mb-2`}>
            {OPTS.map(o => <option key={o.v} value={o.v} className="bg-bg">{o.l}</option>)}
          </select>
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="Note to customer (optional)..." className={`${inp} resize-none mb-3`} />
          <button onClick={update} disabled={saving || status === order.status}
            className="w-full bg-green text-bg py-2.5 rounded-2xl font-sans text-xs font-bold uppercase tracking-widest hover:bg-greenLo transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
            {saving && <span className="ms animate-spin" style={{fontSize:"14px"}}>progress_activity</span>}
            {saved ? "✓ Updated & Email Sent!" : saving ? "Updating..." : "Update & Notify"}
          </button>
        </div>
      </div>

      {/* Items */}
      <div className="bg-surface border border-border rounded-3xl overflow-hidden">
        <p className="font-sans text-xs font-semibold text-textDim uppercase tracking-widest px-5 py-4 border-b border-border">Order Items</p>
        {order.items.map((it, i) => (
          <div key={i} className="flex justify-between items-center px-5 py-4 border-b border-border last:border-0 hover:bg-surfaceHi transition-colors">
            <div><p className="font-sans text-sm font-semibold text-textPri">{it.name}</p><p className="font-sans text-xs text-textSec">Qty: {it.quantity} × {it.price.toFixed(2)}</p></div>
            <p className="font-title text-sm font-bold text-textPri">{(it.price * it.quantity).toFixed(2)}</p>
          </div>
        ))}
        <div className="px-5 py-4 space-y-2 bg-bg/50">
          <div className="flex justify-between font-sans text-sm"><span className="text-textSec">Subtotal</span><span className="text-textPri">{order.subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between font-sans text-sm"><span className="text-textSec">Delivery</span><span className={order.deliveryFee === 0 ? "text-green" : "text-textPri"}>{order.deliveryFee === 0 ? "FREE" : order.deliveryFee.toFixed(2)}</span></div>
          <div className="flex justify-between font-title text-lg font-bold border-t border-border pt-2"><span className="text-textPri">Total</span><span className="text-green">{order.total.toFixed(2)}</span></div>
        </div>
      </div>

      {/* History */}
      <div className="bg-surface border border-border rounded-3xl p-5">
        <p className="font-sans text-xs font-semibold text-textDim uppercase tracking-widest mb-4">Status History</p>
        <div className="space-y-3">
          {[...order.statusHistory].reverse().map((h, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${SC[h.status]?.split(" ")[0] || "bg-border"}`} />
              <div>
                <p className="font-sans text-sm font-semibold text-textPri capitalize">{h.status.replace(/_/g, " ")}</p>
                {h.note && <p className="font-sans text-xs text-textSec">{h.note}</p>}
                <p className="font-sans text-[10px] text-textDim">{new Date(h.at).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
