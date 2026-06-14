"use client";
import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { api } from "@/lib/api";

interface RawProduct { _id:string; name:string; category:string; type:string; price:number; rating:number; description:string; images:{url:string}[]; thc:number; }
const norm = (p: RawProduct) => ({ id:p._id, name:p.name, category:p.category, type:p.type, price:p.price, rating:p.rating||0, description:p.description, image:p.images?.[0]?.url||"", thc:p.thc||0 });

function ShopContent() {
  const sp     = useSearchParams();
  const router = useRouter();
  const typeQ   = sp.get("type")   || "all";
  const searchQ = sp.get("search") || "";

  const [all, setAll]             = useState<ReturnType<typeof norm>[]>([]);
  const [loading, setLoading]     = useState(true);
  const [strains, setStrains]     = useState<string[]>([]);
  const [cats, setCats]           = useState<string[]>([]);
  const [maxPrice, setMaxPrice]   = useState(150);
  const [sort, setSort]           = useState("popular");
  const [search, setSearch]       = useState(searchQ);
  const [mobileFilters, setMobileFilters] = useState(false);

  useEffect(() => { setSearch(searchQ); }, [searchQ]);

  useEffect(() => {
    setLoading(true);
    api.get("/products").then(r => r.json())
      .then(d => { if (d.products?.length) setAll(d.products.map(norm)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggle = (arr: string[], v: string, set: (x: string[]) => void) =>
    set(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);

  const clearAll = () => { setStrains([]); setCats([]); setMaxPrice(150); setSort("popular"); setSearch(""); router.push("/shop"); };

  const filtered = useMemo(() => {
    let list = [...all];
    if (typeQ !== "all") list = list.filter(p => p.type === typeQ);
    if (strains.length)  list = list.filter(p => strains.includes(p.category));
    if (cats.length)     list = list.filter(p => cats.includes(p.type));
    list = list.filter(p => p.price <= maxPrice);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.type.toLowerCase().includes(q));
    }
    if (sort === "price-asc")  list.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    else if (sort === "thc")   list.sort((a, b) => b.thc - a.thc);
    else list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [all, typeQ, strains, cats, maxPrice, sort, search]);

  const heroTitle = ({ flowers: "The Flower Boutique", edibles: "Artisan Edibles", concentrates: "Premium Concentrates" } as Record<string, string>)[typeQ] || "The Full Collection";

  const Filters = () => (
    <div className="space-y-6">
      <div>
        <label className="block font-sans text-xs font-semibold text-green uppercase tracking-widest mb-2">Search</label>
        <div className="flex items-center bg-bg border border-border rounded-2xl px-3 py-2.5 gap-2 focus-within:border-green transition-colors">
          <span className="ms text-textDim" style={{ fontSize: "16px" }}>search</span>
          <input className="bg-transparent outline-none text-sm w-full placeholder:text-textDim text-textPri" placeholder="Strain name..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button onClick={() => { setSearch(""); router.push("/shop"); }} className="text-textDim hover:text-textPri"><span className="ms" style={{ fontSize: "14px" }}>close</span></button>}
        </div>
      </div>

      <div>
        <p className="font-sans text-xs font-semibold text-green uppercase tracking-widest mb-3">Strain Type</p>
        {["Indica", "Sativa", "Hybrid"].map(t => (
          <label key={t} className="flex items-center gap-3 py-2 cursor-pointer group">
            <input type="checkbox" checked={strains.includes(t)} onChange={() => toggle(strains, t, setStrains)} className="w-4 h-4 rounded" />
            <span className="font-sans text-sm text-textSec group-hover:text-textPri transition-colors">{t}</span>
          </label>
        ))}
      </div>

      <div>
        <p className="font-sans text-xs font-semibold text-green uppercase tracking-widest mb-3">Category</p>
        {["flowers", "edibles", "concentrates"].map(c => (
          <label key={c} className="flex items-center gap-3 py-2 cursor-pointer group">
            <input type="checkbox" checked={cats.includes(c)} onChange={() => toggle(cats, c, setCats)} className="w-4 h-4 rounded" />
            <span className="font-sans text-sm text-textSec group-hover:text-textPri transition-colors capitalize">{c}</span>
          </label>
        ))}
      </div>

      <div>
        <div className="flex justify-between mb-2">
          <p className="font-sans text-xs font-semibold text-green uppercase tracking-widest">Max Price</p>
          <span className="font-sans text-xs font-bold text-green">{maxPrice}</span>
        </div>
        <input type="range" min={10} max={150} value={maxPrice} onChange={e => setMaxPrice(+e.target.value)} />
        <div className="flex justify-between mt-1">
          <span className="font-sans text-[10px] text-textDim">10</span>
          <span className="font-sans text-[10px] text-textDim">150</span>
        </div>
      </div>

      <button onClick={clearAll} className="w-full border border-borderHi text-textSec py-2.5 rounded-2xl font-sans text-xs font-semibold uppercase tracking-widest hover:border-green hover:text-green transition-colors">
        Clear All Filters
      </button>
    </div>
  );

  return (
    <>
      <Navbar />
      <main className="pt-14">
        {/* Hero */}
        <div className="relative h-56 md:h-72 flex items-center overflow-hidden">
          <img className="absolute inset-0 w-full h-full object-cover opacity-20" src="https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=1400&q=80" alt="" />
          <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/80 to-transparent" />
          <div className="relative z-10 max-w-site mx-auto px-4 md:px-8 w-full">
            <span className="font-sans text-xs font-semibold text-green uppercase tracking-widest block mb-2">Premium Collection</span>
            <h1 className="font-title text-4xl md:text-6xl font-bold text-textPri tracking-tight">{heroTitle}</h1>
          </div>
        </div>

        <div className="max-w-site mx-auto px-4 md:px-8 py-8">
          {/* Mobile top bar */}
          <div className="flex items-center justify-between mb-5 lg:hidden">
            <span className="font-sans text-sm text-textSec">
              {loading ? "Loading..." : <><span className="text-textPri font-bold">{filtered.length}</span> products</>}
            </span>
            <div className="flex items-center gap-2">
              <select className="bg-surface border border-border rounded-xl px-3 py-2 font-sans text-xs text-green outline-none" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="popular"    className="bg-bg">Popular</option>
                <option value="thc"        className="bg-bg">THC %</option>
                <option value="price-asc"  className="bg-bg">Price ↑</option>
                <option value="price-desc" className="bg-bg">Price ↓</option>
              </select>
              <button onClick={() => setMobileFilters(o => !o)} className="flex items-center gap-1.5 border border-border px-3 py-2 rounded-xl font-sans text-xs text-textSec hover:border-green hover:text-green transition-colors">
                <span className="ms" style={{ fontSize: "16px" }}>tune</span>
                Filters {(strains.length + cats.length) > 0 && <span className="bg-green text-bg rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold">{strains.length + cats.length}</span>}
              </button>
            </div>
          </div>

          {/* Mobile filters */}
          {mobileFilters && (
            <div className="lg:hidden bg-surface border border-border rounded-3xl p-5 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-title text-base font-semibold text-textPri">Filters</h3>
                <button onClick={() => setMobileFilters(false)}><span className="ms text-textSec">close</span></button>
              </div>
              <Filters />
            </div>
          )}

          <div className="flex gap-8">
            {/* Sidebar */}
            <aside className="hidden lg:block w-56 flex-shrink-0">
              <div className="sticky top-20"><Filters /></div>
            </aside>

            {/* Grid */}
            <div className="flex-1 min-w-0">
              {/* Sort bar desktop */}
              <div className="hidden lg:flex items-center justify-between mb-6">
                <span className="font-sans text-sm text-textSec">
                  {loading ? "Loading..." : <><span className="text-textPri font-bold">{filtered.length}</span> products</>}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-sans text-xs text-textDim uppercase tracking-wider">Sort:</span>
                  <select className="bg-transparent border-none font-sans text-sm font-semibold text-green outline-none cursor-pointer" value={sort} onChange={e => setSort(e.target.value)}>
                    <option value="popular"    className="bg-bg">Most Popular</option>
                    <option value="thc"        className="bg-bg">Highest THC</option>
                    <option value="price-asc"  className="bg-bg">Price ↑</option>
                    <option value="price-desc" className="bg-bg">Price ↓</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {[1,2,3,4,5,6].map(i => <div key={i} className="h-96 bg-card border border-border rounded-3xl animate-pulse" />)}
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center py-24 text-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-surfaceHi flex items-center justify-center">
                    <span className="ms text-textDim" style={{ fontSize: "36px" }}>search_off</span>
                  </div>
                  <p className="font-title text-xl font-semibold text-textPri">No products found</p>
                  <p className="font-sans text-sm text-textSec">Try adjusting your filters or search.</p>
                  <button onClick={clearAll} className="text-green font-sans text-sm hover:underline">Clear all filters</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filtered.map(p => <ProductCard key={p.id} p={p} />)}
                </div>
              )}
            </div>
          </div>
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
        <span className="ms text-green animate-spin" style={{ fontSize: "40px" }}>progress_activity</span>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
