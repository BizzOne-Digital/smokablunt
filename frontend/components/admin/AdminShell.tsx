"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

const NAV = [
  { href: "/admin",          label: "Dashboard", icon: "dashboard" },
  { href: "/admin/orders",   label: "Orders",    icon: "receipt_long" },
  { href: "/admin/products", label: "Products",  icon: "inventory_2" },
  { href: "/admin/users",    label: "Users",     icon: "group" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout, isAdmin } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) return;
    if (!loading && (!user || !isAdmin)) router.push("/admin/login");
  }, [user, loading, isAdmin, router, isLoginPage]);

  if (isLoginPage) return <>{children}</>;

  if (loading || !user || !isAdmin) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <span className="ms text-green animate-spin" style={{ fontSize: "36px" }}>progress_activity</span>
    </div>
  );

  const active = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 bg-black/70 z-40 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-60 bg-surface border-r border-border flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        {/* Brand */}
        <div className="p-5 border-b border-border">
          <Link href="/" className="font-title text-lg font-bold text-green block">Smokablunt</Link>
          <p className="font-sans text-[10px] text-textDim uppercase tracking-widest mt-0.5">Admin Panel</p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map(n => (
            <Link
              key={n.href} href={n.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl font-sans text-sm transition-all ${active(n.href) ? "bg-greenBg text-green font-semibold border border-green/20" : "text-textSec hover:bg-surfaceHi hover:text-textPri"}`}
            >
              <span className="ms" style={{ fontSize: "20px" }}>{n.icon}</span>
              {n.label}
            </Link>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-border space-y-0.5">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-green/20 flex items-center justify-center flex-shrink-0">
              <span className="font-title text-sm font-bold text-green">{user.name[0]?.toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <p className="font-sans text-sm font-semibold text-textPri truncate">{user.name}</p>
              <p className="font-sans text-xs text-textDim truncate">{user.email}</p>
            </div>
          </div>
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-2xl text-textSec hover:bg-surfaceHi hover:text-textPri transition-all font-sans text-sm">
            <span className="ms" style={{ fontSize: "18px" }}>storefront</span>View Store
          </Link>
          <button onClick={async () => { await logout(); router.push("/"); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-textSec hover:bg-errorBg hover:text-error transition-all font-sans text-sm">
            <span className="ms" style={{ fontSize: "18px" }}>logout</span>Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="h-14 bg-surface border-b border-border flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-textSec hover:text-green transition-colors p-1" onClick={() => setOpen(true)}>
              <span className="ms">menu</span>
            </button>
            <h1 className="font-title text-sm font-semibold text-textPri">
              {NAV.find(n => active(n.href))?.label || "Admin"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green rounded-full animate-pulse" />
            <span className="font-sans text-xs text-green font-semibold">Live</span>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
