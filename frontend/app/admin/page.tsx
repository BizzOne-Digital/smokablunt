"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface Stats { totalOrders:number; todayOrders:number; pendingOrders:number; totalRevenue:number; monthRevenue:number; totalProducts:number; totalUsers:number; }
interface Order { _id:string; orderNumber:string; customerInfo:{name:string;phone:string}; total:number; status:string; createdAt:string; }
interface ChartDay { date:string; revenue:number; orders:number; }

const SC: Record<string,string> = {
  pending: "bg-yellow-500/10 text-yellow-400",
  confirmed: "bg-blue-500/10 text-blue-400",
  preparing: "bg-purple-500/10 text-purple-400",
  out_for_delivery: "bg-orange-500/10 text-orange-400",
  delivered: "bg-green/10 text-green",
  cancelled: "bg-error/10 text-error",
};

export default function AdminDashboard() {
  const [stats,  setStats]  = useState<Stats|null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [chart,  setChart]  = useState<ChartDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/stats").then(r => r.json()).then(d => {
      setStats(d.stats); setOrders(d.recentOrders || []); setChart(d.chart || []);
    }).finally(() => setLoading(false));
  }, []);

  const maxRev = Math.max(...chart.map(c => c.revenue), 1);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <span className="ms text-green animate-spin" style={{ fontSize: "36px" }}>progress_activity</span>
    </div>
  );

  const cards = stats ? [
    { l: "Total Revenue",   v: `${stats.totalRevenue.toFixed(0)}`,  i: "payments",        c: "text-green",       sub: `${stats.monthRevenue.toFixed(0)} this month` },
    { l: "Total Orders",    v: `${stats.totalOrders}`,              i: "receipt_long",    c: "text-blue-400",    sub: `${stats.todayOrders} today` },
    { l: "Pending Orders",  v: `${stats.pendingOrders}`,            i: "pending_actions", c: "text-yellow-400",  sub: "Needs attention" },
    { l: "Products",        v: `${stats.totalProducts}`,            i: "inventory_2",     c: "text-purple-400",  sub: `${stats.totalUsers} customers` },
  ] : [];

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="font-title text-2xl font-bold text-textPri">Dashboard</h2>
        <p className="font-sans text-sm text-textSec mt-1">Welcome back. Here&apos;s what&apos;s happening.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.l} className="bg-surface border border-border rounded-3xl p-5 hover:border-borderHi transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-sans text-xs text-textDim uppercase tracking-wider mb-1">{c.l}</p>
                <p className={`font-title text-2xl md:text-3xl font-bold ${c.c}`}>{c.v}</p>
                <p className="font-sans text-xs text-textSec mt-1">{c.sub}</p>
              </div>
              <div className={`w-10 h-10 rounded-2xl bg-surface border border-border flex items-center justify-center flex-shrink-0`}>
                <span className={`ms ${c.c}`} style={{ fontSize: "20px" }}>{c.i}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      {chart.length > 0 && (
        <div className="bg-surface border border-border rounded-3xl p-5 md:p-6">
          <p className="font-sans text-xs font-semibold text-textDim uppercase tracking-widest mb-6">Revenue — Last 7 Days</p>
          <div className="flex items-end gap-2 md:gap-3 h-40">
            {chart.map(d => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5">
                {d.revenue > 0 && <span className="font-sans text-[9px] text-textDim">{d.revenue.toFixed(0)}</span>}
                <div
                  className="w-full bg-green/50 hover:bg-green rounded-t-xl transition-colors cursor-default"
                  style={{ height: `${Math.max((d.revenue / maxRev) * 130, 3)}px` }}
                  title={`${d.date}: ${d.revenue.toFixed(2)} (${d.orders} orders)`}
                />
                <span className="font-sans text-[9px] text-textDim text-center">{d.date.split(",")[0]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent orders */}
      <div className="bg-surface border border-border rounded-3xl overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-border">
          <p className="font-sans text-xs font-semibold text-textDim uppercase tracking-widest">Recent Orders</p>
          <Link href="/admin/orders" className="font-sans text-xs text-green hover:underline">View All →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="border-b border-border">
                {["Order #","Customer","Phone","Total","Status","Time",""].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-sans text-[10px] font-semibold text-textDim uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o._id} className="border-b border-border last:border-0 hover:bg-surfaceHi transition-colors">
                  <td className="px-4 py-3 font-sans text-xs font-bold text-green">{o.orderNumber}</td>
                  <td className="px-4 py-3 font-sans text-sm text-textPri">{o.customerInfo.name}</td>
                  <td className="px-4 py-3"><a href={`tel:${o.customerInfo.phone}`} className="font-sans text-xs text-textSec hover:text-green transition-colors">{o.customerInfo.phone}</a></td>
                  <td className="px-4 py-3 font-title text-sm font-bold text-textPri">{o.total.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full font-sans text-[10px] font-semibold capitalize ${SC[o.status] || "bg-surfaceHi text-textSec"}`}>
                      {o.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-sans text-xs text-textDim">{new Date(o.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</td>
                  <td className="px-4 py-3"><Link href={`/admin/orders/${o._id}`} className="font-sans text-xs text-green hover:underline">Manage →</Link></td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center font-sans text-sm text-textSec">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
