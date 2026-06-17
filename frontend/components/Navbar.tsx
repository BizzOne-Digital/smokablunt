"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";
import CartDrawer from "./CartDrawer";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems } = useCart();
  const { user } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [search, setSearch] = useState("");

  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (search.trim()) {
      router.push(`/shop?search=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  };

  const links = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
    { href: "/shop?type=flowers", label: "Flowers" },
    { href: "/shop?type=edibles", label: "Edibles" },
    { href: "/shop?type=concentrates", label: "Concentrates" },
    { href: "/contact", label: "Delivery" },
  ];

  const isActive = (h: string) =>
    h === "/"
      ? pathname === "/"
      : pathname.startsWith(h.split("?")[0]) && h !== "/";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-bg/95 backdrop-blur-md border-b border-border"
            : "bg-bg/70 backdrop-blur-sm"
        } py-3`}
      >
        <div className="max-w-site mx-auto px-4 md:px-8 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logo1.png"
              alt="Logo"
              width={180}
              height={60}
              className="h-12 w-auto"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-7">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`font-sans text-sm transition-colors ${
                  isActive(l.href)
                    ? "text-green font-semibold"
                    : "text-textSec hover:text-textPri"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-2">
            {/* Desktop search */}
            <form
              onSubmit={handleSearch}
              className="hidden md:flex items-center bg-surface border border-border rounded-full px-3 py-1.5 gap-2 focus-within:border-green transition-colors w-40"
            >
              <span
                className="ms text-textDim"
                style={{ fontSize: "16px" }}
              >
                search
              </span>

              <input
                ref={searchRef}
                className="bg-transparent outline-none text-sm w-full placeholder:text-textDim text-textPri"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>

            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 text-textSec hover:text-green transition-colors"
            >
              <span className="ms">shopping_cart</span>

              {totalItems > 0 && (
                <span className="absolute top-1 right-1 bg-green text-bg text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Admin badge */}
            {user?.role === "admin" && (
              <Link
                href="/admin"
                className="hidden md:flex items-center gap-1.5 bg-green/10 text-green border border-green/30 px-3 py-1.5 rounded-full font-sans text-xs font-semibold hover:bg-green/20 transition-colors"
              >
                <span
                  className="ms"
                  style={{ fontSize: "14px" }}
                >
                  admin_panel_settings
                </span>
                Admin
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 text-textSec hover:text-green transition-colors"
              onClick={() => setMobileOpen((o) => !o)}
            >
              <span className="ms">
                {mobileOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-surface border-t border-border">
            {/* Mobile search */}
            <form
              onSubmit={handleSearch}
              className="px-4 pt-3 pb-1"
            >
              <div className="flex items-center bg-bg border border-border rounded-xl px-3 py-2 gap-2 focus-within:border-green transition-colors">
                <span
                  className="ms text-textDim"
                  style={{ fontSize: "16px" }}
                >
                  search
                </span>

                <input
                  className="bg-transparent outline-none text-sm w-full placeholder:text-textDim text-textPri"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </form>

            <nav className="px-2 pb-3">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`flex items-center px-3 py-3 rounded-xl font-sans text-sm my-0.5 transition-colors ${
                    isActive(l.href)
                      ? "bg-greenBg text-green font-semibold"
                      : "text-textSec hover:bg-surfaceHi hover:text-textPri"
                  }`}
                >
                  {l.label}
                </Link>
              ))}

              {user?.role === "admin" && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-3 py-3 rounded-xl font-sans text-sm text-green bg-greenBg mt-1"
                >
                  <span
                    className="ms"
                    style={{ fontSize: "18px" }}
                  >
                    admin_panel_settings
                  </span>
                  Admin Panel
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
      />
    </>
  );
}