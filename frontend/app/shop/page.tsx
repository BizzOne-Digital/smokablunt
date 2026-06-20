"use client";
import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { api } from "@/lib/api";

interface AmountPrice { label: string; price: number; }
interface RawProduct {
  _id:string; name:string; category:string; type:string; price:number;
  rating:number; description:string; images:{url:string}[]; thc:number;
  amounts?:AmountPrice[]; onSale?:boolean; salePrice?:number;
}
const norm = (p: RawProduct) => ({
  id:p._id, name:p.name, category:p.category, type:p.type,
  price:p.price, rating:p.rating||0, description:p.description,
  image:p.images?.[0]?.url||"", thc:p.thc||0,
  amounts:p.amounts||[], onSale:p.onSale||false, salePrice:p.salePrice||0,
});

// Category order for display
const CAT_ORDER = ["sale","hybrid","indica","sativa","pre-rolls","edibles","concentrates","accessories","promo"];
const CAT_LABELS: Record<string,string> = {
  sale:"Sale", hybrid:"Hybrid", indica:"Indica", sativa:"Sativa",
  "pre-rolls":"Pre-Rolls", edibles:"Edibles", concentrates:"Concentrates",
  accessories:"Accessories", promo:"Promo",
};

function ShopContent() {
  const sp     = useSearchParams();
  const router = useRouter();
  const typeQ   = sp.get("type")   || "all";
  const searchQ = sp.get("search") || "";

  const [all, setAll]         = useState<ReturnType<typeof norm>[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState(searchQ);
  const [activeTab, setActiveTab] = useState("all");
  const [sort, setSort]       = useState("popular");

  useEffect(() => { setSearch(searchQ); }, [searchQ]);

  useEffect(() => {
    setLoading(true);
    api.get("/products").then(r => r.json())
      .then(d => { if (d.products?.length) setAll(d.products.map(norm)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const clearAll = () => { setSort("popular"); setSearch(""); setActiveTab("all"); router.push("/shop"); };

  const filtered = useMemo(() => {
    let list = [...all];
    // Tab filter
    if (activeTab !== "all") {
      const t = activeTab.toLowerCase();
      if (["hybrid","indica","sativa"].includes(t)) list = list.filter(p => p.category.toLowerCase() === t);
      else list = list.filter(p => p.type.toLowerCase() === t);
    }
    if (typeQ !== "all") list = list.filter(p => p.type === typeQ);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.type.toLowerCase().includes(q));
    }
    if (sort === "price-asc")  list.sort((a,b) => a.price - b.price);
    else if (sort === "price-desc") list.sort((a,b) => b.price - a.price);
    else if (sort === "thc")   list.sort((a,b) => b.thc - a.thc);
    else list.sort((a,b) => b.rating - a.rating);
    return list;
  }, [all, typeQ, activeTab, sort, search]);

  // Group by type/category for "All" tab view
  const grouped = useMemo(() => {
    if (activeTab !== "all" || typeQ !== "all" || search) return null;
    const groups: Record<string, ReturnType<typeof norm>[]> = {};
    filtered.forEach(p => {
      const key = p.type.toLowerCase();
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    });
    // Sort groups by CAT_ORDER
    return CAT_ORDER.filter(k => groups[k]?.length > 0).map(k => ({ key:k, label:CAT_LABELS[k]||k, items:groups[k] }));
  }, [filtered, activeTab, typeQ, search]);

  return (
    <>
      <Navbar />
      <main className="pt-14">
        {/* Hero */}
        <div className="relative h-40 md:h-56 flex items-center overflow-hidden">
          <img className="absolute inset-0 w-full h-full object-cover opacity-20" src="https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=1400&q=80" alt="" />
          <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/80 to-transparent" />
          <div className="relative z-10 max-w-site mx-auto px-4 md:px-8 w-full">
            <span className="font-sans text-xs font-semibold text-green uppercase tracking-widest block mb-2">Premium Collection</span>
            <h1 className="font-title text-4xl md:text-6xl font-bold text-textPri tracking-tight">Shop</h1>
          </div>
        </div>

        <div className="max-w-site mx-auto px-4 md:px-8 py-6">
          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            {[{label:"All",filter:"all"},{label:"Sale",filter:"sale"},{label:"Hybrid",filter:"hybrid"},
              {label:"Indica",filter:"indica"},{label:"Sativa",filter:"sativa"},
              {label:"Pre-Rolls",filter:"pre-rolls"},{label:"Edibles",filter:"edibles"},
              {label:"Concentrates",filter:"concentrates"},{label:"Accessories",filter:"accessories"},
              {label:"Promo",filter:"promo"}].map(tab => (
              <button key={tab.filter} onClick={() => setActiveTab(tab.filter)}
                className={`flex-shrink-0 px-4 py-2 rounded-full font-sans text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${activeTab===tab.filter ? "bg-green text-bg" : "bg-surface border border-border text-textSec hover:border-green hover:text-green"}`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search + Sort bar */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 bg-surface border border-border rounded-2xl px-3 py-2.5 flex-1 focus-within:border-green transition-colors">
              <span className="ms text-textDim" style={{fontSize:"16px"}}>search</span>
              <input className="bg-transparent outline-none text-sm w-full placeholder:text-textDim text-textPri"
                placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
              {search && <button onClick={() => setSearch("")} className="text-textDim hover:text-textPri"><span className="ms" style={{fontSize:"14px"}}>close</span></button>}
            </div>
            <select className="bg-surface border border-border rounded-2xl px-3 py-2.5 font-sans text-xs text-green outline-none flex-shrink-0"
              value={sort} onChange={e => setSort(e.target.value)}>
              <option value="popular" className="bg-bg">Popular</option>
              <option value="thc" className="bg-bg">THC %</option>
              <option value="price-asc" className="bg-bg">Price ↑</option>
              <option value="price-desc" className="bg-bg">Price ↓</option>
            </select>
          </div>

          {/* Products */}
          {loading ? (
            <div className="flex justify-center py-16">
              <span className="ms text-green animate-spin" style={{fontSize:"40px"}}>progress_activity</span>
            </div>
          ) : grouped ? (
            // Grouped by category — 2 per row
            <div className="space-y-10">
              {grouped.map(g => (
                <div key={g.key}>
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="font-title text-xl font-bold text-textPri">{g.label}</h2>
                    <span className="font-sans text-xs text-textDim bg-surface border border-border px-2.5 py-1 rounded-full">{g.items.length}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
                    {g.items.map(p => <ProductCard key={p.id} p={p} />)}
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-24 text-center gap-4">
              <div className="w-20 h-20 rounded-full bg-surfaceHi flex items-center justify-center">
                <span className="ms text-textDim" style={{fontSize:"36px"}}>search_off</span>
              </div>
              <p className="font-title text-xl font-semibold text-textPri">No products found</p>
              <button onClick={clearAll} className="text-green font-sans text-sm hover:underline">Clear filters</button>
            </div>
          ) : (
            // Filtered view — 2 per row
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
              {filtered.map(p => <ProductCard key={p.id} p={p} />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <span className="ms text-green animate-spin" style={{fontSize:"40px"}}>progress_activity</span>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}