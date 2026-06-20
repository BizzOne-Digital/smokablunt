"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { api } from "@/lib/api";

interface AmountPrice { label: string; price: number; }
interface Product {
  _id: string; name: string; category: string; type: string; price: number; stock: number; thc: number;
  description: string; images: { url: string; public_id: string }[]; isActive: boolean; isFeatured: boolean;
  rating: number; amounts?: AmountPrice[]; onSale?: boolean; salePrice?: number;
}

// ─── AMOUNT TEMPLATES ────────────────────────────────────────
// Flowers → weight
const WEIGHT_AMOUNTS: AmountPrice[] = [
  { label:"1/4", price:0 },
  { label:"1/2", price:0 },
  { label:"oz",  price:0 },
  { label:"2oz", price:0 },
  { label:"3oz", price:0 },
];

// Pre-rolls → qty 1–5 + 10
const QTY_AMOUNTS_PREROLL: AmountPrice[] = [
  { label:"1",  price:0 }, { label:"2",  price:0 }, { label:"3",  price:0 },
  { label:"4",  price:0 }, { label:"5",  price:0 }, { label:"10", price:0 },
];

// Edibles, Concentrates, Accessories → qty 1–5
const QTY_AMOUNTS: AmountPrice[] = [
  { label:"1", price:0 }, { label:"2", price:0 }, { label:"3", price:0 },
  { label:"4", price:0 }, { label:"5", price:0 },
];

const WEIGHT_TYPES  = ["flowers", "sale", "promo"];
const PREROLL_TYPES = ["pre-rolls"];
const QTY_TYPES     = ["concentrates", "edibles", "accessories"];
const HAS_AMOUNTS   = [...WEIGHT_TYPES, ...PREROLL_TYPES, ...QTY_TYPES];

const defaultAmountsFor = (type: string): AmountPrice[] => {
  if (WEIGHT_TYPES.includes(type))   return WEIGHT_AMOUNTS.map(a => ({ ...a }));
  if (PREROLL_TYPES.includes(type))  return QTY_AMOUNTS_PREROLL.map(a => ({ ...a }));
  return QTY_AMOUNTS.map(a => ({ ...a }));
};

const mergeAmountsFor = (type: string, saved?: AmountPrice[]): AmountPrice[] => {
  const defaults = defaultAmountsFor(type);
  return defaults.map(a => {
    const match = saved?.find(x => x.label === a.label);
    return match ? { label: a.label, price: Number(match.price) || 0 } : a;
  });
};

// ─── CATEGORY OPTIONS PER TYPE ───────────────────────────────
const CATS: Record<string, string[]> = {
  "flowers":      ["Indica", "Sativa", "Hybrid"],
  "pre-rolls":    ["Indica", "Sativa", "Hybrid", "Mixed"],
  "concentrates": ["Shatter", "Wax", "Live Resin", "Hash", "Distillate", "Other"],
  "edibles":      ["Gummies", "Chocolate", "Beverage", "Capsule", "Other"],
  "accessories":  ["Vaporizer", "Pipe", "Papers", "Grinder", "Other"],
  "sale":         ["Indica", "Sativa", "Hybrid", "Gummies", "Shatter", "Other"],
  "promo":        ["Indica", "Sativa", "Hybrid", "Gummies", "Shatter", "Other"],
};

interface FormState {
  name: string; category: string; type: string;
  price: number; stock: number; thc: number; rating: number; description: string;
  images: { url: string; public_id: string }[];
  isActive: boolean; isFeatured: boolean; onSale: boolean;
  salePrice: number;
  amounts: AmountPrice[];
}

const EMPTY: FormState = {
  name: "", category: "Indica", type: "flowers",
  price: 0, stock: 0, thc: 0, rating: 0, description: "",
  images: [],
  isActive: true, isFeatured: false, onSale: false,
  salePrice: 0,
  amounts: WEIGHT_AMOUNTS.map(a => ({ ...a })),
};

const inp = "w-full bg-bg border border-border rounded-2xl px-4 py-3 font-sans text-sm text-textPri placeholder:text-textDim focus:outline-none focus:border-green transition-colors";
const lbl = "block font-sans text-xs font-semibold text-textDim uppercase tracking-widest mb-1.5";

// ─── NUMBER INPUT — clears 0 on focus ───────────────────────
function NumInput({ value, onChange, className, step = 1 }: {
  value: number; onChange: (v: number) => void; className?: string; step?: number;
}) {
  const [raw, setRaw] = useState(value === 0 ? "" : String(value));

  useEffect(() => {
    setRaw(value === 0 ? "" : String(value));
  }, [value]);

  return (
    <input
      type="number" min={0} step={step}
      value={raw}
      placeholder="0"
      onFocus={e => { if (e.target.value === "0") setRaw(""); }}
      onChange={e => setRaw(e.target.value)}
      onBlur={e => {
        const n = parseFloat(e.target.value);
        const safe = isNaN(n) || n < 0 ? 0 : n;
        onChange(safe);
        setRaw(safe === 0 ? "" : String(safe));
      }}
      className={className ?? inp}
    />
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────
export default function AdminProducts() {
  const [products,  setProducts]  = useState<Product[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [showForm,  setShowForm]  = useState(false);
  const [editing,   setEditing]   = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>({ ...EMPTY });
  const [saving,    setSaving]    = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting,  setDeleting]  = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    setLoading(true);
    api.get("/products?all=true")
      .then(r => r.json())
      .then(d => setProducts(d.products || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setForm({ ...EMPTY, amounts: defaultAmountsFor("flowers") });
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    const amounts = mergeAmountsFor(p.type, p.amounts);
    setForm({
      name: p.name, category: p.category, type: p.type,
      price: p.price, stock: p.stock, thc: p.thc,
      description: p.description, images: p.images,
      isActive: p.isActive, isFeatured: p.isFeatured,
      onSale: p.onSale ?? false,
      rating: p.rating ?? 0,
      amounts,
      salePrice: p.salePrice ?? 0,
    });
    setEditing(p);
    setShowForm(true);
  };

  const close = () => { setShowForm(false); setEditing(null); };

  // ── when TYPE changes → switch amounts + reset category ──
  const handleTypeChange = (t: string) => {
    const cats    = CATS[t] || ["Other"];
    const amounts = defaultAmountsFor(t);   // ← KEY: swaps 1/4…3oz ↔ 1…5
    setForm(prev => ({ ...prev, type: t, category: cats[0], amounts }));
  };

  const uploadImg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    const fd = new FormData(); fd.append("image", file);
    const r  = await api.upload("/products/upload-image", fd);
    const d  = await r.json();
    if (r.ok) setForm(p => ({ ...p, images: [...p.images, { url: d.url, public_id: d.public_id }] }));
    else      alert("Upload failed: " + d.error);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const payload = { ...form, amounts: HAS_AMOUNTS.includes(form.type) ? form.amounts.filter(a => Number(a.price) > 0) : [] };
    try {
      const r = editing
        ? await api.put(`/products/${editing._id}`, payload)
        : await api.post("/products", payload);
      const d = await r.json();
      if (r.ok) { load(); close(); }
      else      alert("Error: " + (d.error || JSON.stringify(d)));
    } catch (err: any) {
      alert("Network error: " + err.message);
    }
    setSaving(false);
  };

  const del = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    setDeleting(id);
    await api.delete(`/products/${id}`);
    load(); setDeleting(null);
  };

  const toggleActive = async (p: Product) => {
    await api.put(`/products/${p._id}`, { isActive: !p.isActive });
    load();
  };

  const filtered = products.filter(p =>
    !search ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.type.toLowerCase().includes(search.toLowerCase())
  );

  const isWeightType   = WEIGHT_TYPES.includes(form.type);
  const isPrerollType  = PREROLL_TYPES.includes(form.type);
  const showAmounts    = HAS_AMOUNTS.includes(form.type);

  return (
    <div className="space-y-5 max-w-6xl">

      {/* ── Header ── */}
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <h2 className="font-title text-2xl font-bold text-textPri">Products</h2>
          <p className="font-sans text-sm text-textSec">{filtered.length} products</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-surface border border-border rounded-2xl px-3 py-2 focus-within:border-green transition-colors">
            <span className="ms text-textDim" style={{ fontSize:"16px" }}>search</span>
            <input className="bg-transparent outline-none text-sm w-36 placeholder:text-textDim text-textPri"
              placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 bg-green text-bg px-5 py-2 rounded-2xl font-sans text-sm font-bold uppercase tracking-widest hover:bg-greenLo transition-colors">
            <span className="ms" style={{ fontSize:"18px" }}>add</span>Add Product
          </button>
        </div>
      </div>

      {/* ── Product Grid ── */}
      {loading ? (
        <div className="flex justify-center py-16">
          <span className="ms text-green animate-spin" style={{ fontSize:"32px" }}>progress_activity</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(p => (
            <div key={p._id} className={`bg-surface border rounded-3xl overflow-hidden transition-all ${p.isActive ? "border-border hover:border-borderHi" : "border-border opacity-60"}`}>
              <div className="relative h-44 bg-bg overflow-hidden">
                {p.images[0]
                  ? <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><span className="ms text-textDim" style={{ fontSize:"40px" }}>image</span></div>}
                <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
                  <span className="bg-bg/80 backdrop-blur-sm text-green px-2 py-0.5 rounded-full font-sans text-[9px] font-bold uppercase">{p.type}</span>
                  {p.onSale    && <span className="bg-red-500/80 text-white px-2 py-0.5 rounded-full font-sans text-[9px] font-bold">SALE</span>}
                  {p.isFeatured && <span className="bg-yellow-500/80 text-yellow-900 px-2 py-0.5 rounded-full font-sans text-[9px] font-bold">★</span>}
                  {!p.isActive && <span className="bg-error/80 text-white px-2 py-0.5 rounded-full font-sans text-[9px] font-bold">Hidden</span>}
                </div>
                <div className="absolute top-2 right-2 flex flex-col gap-1.5">
                  <button onClick={() => openEdit(p)} className="w-7 h-7 bg-bg/80 backdrop-blur-sm rounded-xl flex items-center justify-center text-textSec hover:text-green transition-colors">
                    <span className="ms" style={{ fontSize:"14px" }}>edit</span>
                  </button>
                  <button onClick={() => del(p._id)} disabled={deleting === p._id} className="w-7 h-7 bg-bg/80 backdrop-blur-sm rounded-xl flex items-center justify-center text-textSec hover:text-error transition-colors">
                    <span className="ms" style={{ fontSize:"14px" }}>{deleting === p._id ? "progress_activity" : "delete"}</span>
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-title text-sm font-semibold text-textPri line-clamp-1">{p.name}</h3>
                  <span className="font-title text-sm font-bold text-green flex-shrink-0 ml-2">{p.price}</span>
                </div>
                <p className="font-sans text-xs text-textSec mb-3">{p.category} · THC {p.thc}% · Stock {p.stock}</p>
                {p.amounts?.some(a => a.price > 0) && (
                  <div className="flex gap-1 flex-wrap mb-3">
                    {p.amounts.filter(a => a.price > 0).map(a => (
                      <span key={a.label} className="bg-bg border border-border rounded-lg px-2 py-0.5 font-sans text-[10px] text-textSec">{a.label}: {a.price}</span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => toggleActive(p)}
                    className={`flex-1 py-1.5 rounded-xl font-sans text-[11px] font-semibold uppercase tracking-wide transition-colors border ${p.isActive ? "border-border text-textSec hover:border-error hover:text-error" : "border-green/30 text-green hover:bg-green/10"}`}>
                    {p.isActive ? "Hide" : "Show"}
                  </button>
                  <button onClick={() => openEdit(p)}
                    className="flex-1 py-1.5 rounded-xl font-sans text-[11px] font-semibold uppercase tracking-wide border border-border text-textSec hover:border-green hover:text-green transition-colors">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full bg-surface border border-border rounded-3xl py-16 text-center">
              <span className="ms text-textDim block mb-3" style={{ fontSize:"40px" }}>inventory_2</span>
              <p className="font-sans text-sm text-textSec mb-4">No products yet</p>
              <button onClick={openCreate} className="text-green font-sans text-sm hover:underline">Add your first product →</button>
            </div>
          )}
        </div>
      )}

      {/* ── Form Modal ── */}
      {showForm && (
        <>
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" onClick={close} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-surface border border-border rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 py-5 border-b border-border sticky top-0 bg-surface z-10 rounded-t-3xl">
                <h3 className="font-title text-lg font-semibold text-textPri">{editing ? "Edit Product" : "Add New Product"}</h3>
                <button onClick={close} className="text-textSec hover:text-textPri p-1"><span className="ms">close</span></button>
              </div>

              <form onSubmit={submit} className="p-6 space-y-5">

                {/* Images */}
                <div>
                  <label className={lbl}>Product Images</label>
                  <div className="flex flex-wrap gap-3">
                    {form.images.map((img, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-2xl overflow-hidden border border-border">
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                        <button type="button"
                          onClick={() => setForm(p => ({ ...p, images: p.images.filter((_, j) => j !== i) }))}
                          className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <span className="ms text-white" style={{ fontSize:"16px" }}>delete</span>
                        </button>
                      </div>
                    ))}
                    <label className={`w-16 h-16 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-green transition-colors ${uploading ? "opacity-50" : ""}`}>
                      {uploading
                        ? <span className="ms text-green animate-spin" style={{ fontSize:"20px" }}>progress_activity</span>
                        : <><span className="ms text-textDim" style={{ fontSize:"22px" }}>add_photo_alternate</span><span className="font-sans text-[9px] text-textDim mt-0.5">Upload</span></>}
                      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={uploadImg} disabled={uploading} />
                    </label>
                  </div>
                  <p className="font-sans text-xs text-textDim mt-2">Images upload to Cloudinary automatically</p>
                </div>

                {/* Name */}
                <div>
                  <label className={lbl}>Name *</label>
                  <input value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className={inp} placeholder="e.g. Ghost OG" />
                </div>

                {/* Type + Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>Type *</label>
                    <select value={form.type} onChange={e => handleTypeChange(e.target.value)} className={inp}>
                      <option value="flowers"      className="bg-bg">flowers</option>
                      <option value="pre-rolls"    className="bg-bg">pre-rolls</option>
                      <option value="concentrates" className="bg-bg">concentrates</option>
                      <option value="edibles"      className="bg-bg">edibles</option>
                      <option value="accessories"  className="bg-bg">accessories</option>
                      <option value="sale"         className="bg-bg">sale</option>
                      <option value="promo"        className="bg-bg">promo</option>
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>Category *</label>
                    <select value={form.category}
                      onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className={inp}>
                      {(CATS[form.type] || ["Other"]).map(c => (
                        <option key={c} value={c} className="bg-bg">{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Price + Stock + THC */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>Base Price</label>
                    <NumInput value={form.price} onChange={v => setForm(p => ({ ...p, price: v }))} />
                  </div>
                  <div>
                    <label className={lbl}>Sale Price <span className="text-red-400">(on sale)</span></label>
                    <NumInput value={form.salePrice ?? 0} onChange={v => setForm(p => ({ ...p, salePrice: v }))} />
                    <p className="font-sans text-[10px] text-textDim mt-1">Set sale price + enable On Sale toggle</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>Stock</label>
                    <NumInput value={form.stock} onChange={v => setForm(p => ({ ...p, stock: v }))} />
                  </div>
                  <div>
                    <label className={lbl}>THC %</label>
                    <NumInput value={form.thc} onChange={v => setForm(p => ({ ...p, thc: v }))} step={0.1} />
                  </div>
                </div>

                {/* Amount / Qty Pricing — switches based on type */}
                {showAmounts && (
                  <div>
                    <label className={lbl}>
                      {isWeightType  ? "💊 Amount Pricing — 1/4 · 1/2 · oz · 2oz · 3oz"
                       : isPrerollType ? "🚬 Quantity — 1 · 2 · 3 · 4 · 5 · 10 units"
                       :                 "🔢 Quantity Pricing — 1 · 2 · 3 · 4 · 5 units"}
                    </label>
                    <div className="space-y-2">
                      {form.amounts.map((a, i) => (
                        <div key={`${form.type}-${a.label}`}
                          className="flex items-center gap-3 bg-bg border border-border rounded-2xl px-4 py-2.5">
                          <span className="font-sans text-sm font-bold text-green w-10 flex-shrink-0">{a.label}</span>
                          <NumInput
                            value={a.price}
                            onChange={v => setForm(p => ({
                              ...p,
                              amounts: p.amounts.map((x, j) => j === i ? { ...x, price: v } : x),
                            }))}
                            className="flex-1 bg-transparent outline-none text-sm text-textPri placeholder:text-textDim"
                          />
                        </div>
                      ))}
                    </div>
                    <p className="font-sans text-xs text-textDim mt-1.5">
                      Leave 0/blank to hide that option from the public site.
                    </p>
                  </div>
                )}

                {/* Description */}
                <div>
                  <label className={lbl}>Description *</label>
                  <textarea rows={3} value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    className={`${inp} resize-none`}
                    placeholder="Describe the strain, effects, and flavour..." />
                </div>

                {/* Toggles */}
                <div className="flex flex-wrap gap-6">
                  {([
                    { k:"isActive",   l:"Active (visible in shop)" },
                    { k:"isFeatured", l:"Featured on homepage" },
                    { k:"onSale",     l:"On Sale" },
                  ] as { k: keyof typeof EMPTY; l: string }[]).map(t => {
                    const val = form[t.k] as boolean;
                    return (
                      <label key={t.k} className="flex items-center gap-3 cursor-pointer">
                        <button type="button"
                          onClick={() => setForm(p => ({ ...p, [t.k]: !p[t.k] }))}
                          className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${val ? "bg-green" : "bg-surfaceHi border border-border"}`}>
                          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${val ? "translate-x-6" : "translate-x-1"}`} />
                        </button>
                        <span className="font-sans text-sm text-textSec">{t.l}</span>
                      </label>
                    );
                  })}
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={close}
                    className="flex-1 border border-border text-textSec py-3 rounded-2xl font-sans text-sm font-semibold hover:border-borderHi transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 bg-green text-bg py-3 rounded-2xl font-sans text-sm font-bold uppercase tracking-widest hover:bg-greenLo transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving && <span className="ms animate-spin" style={{ fontSize:"14px" }}>progress_activity</span>}
                    {editing ? "Save Changes" : "Create Product"}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}