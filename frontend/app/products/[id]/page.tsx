"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import { useCart } from "@/lib/CartContext";

interface AmountPrice { label: string; price: number; }
interface Product {
  _id: string; name: string; category: string; type: string; price: number;
  description: string; images: { url: string }[]; thc: number;
  amounts?: AmountPrice[]; onSale?: boolean; salePrice?: number;
}

const WEIGHT_TYPES = ["flowers"];
const PREROLL_TYPES = ["pre-rolls"];
const QTY_TYPES = ["concentrates", "edibles", "accessories"];
const SALE_TYPES = ["sale", "promo"];
const WEIGHT_LABELS = ["1/4", "1/2", "oz", "2oz", "3oz"];
const PREROLL_LABELS = ["1", "2", "3", "4", "5", "10"];
const QTY_LABELS = ["1", "2", "3", "4", "5"];
const SALE_LABELS = ["1/4", "1/2", "oz", "2oz", "3oz", "1", "2", "3", "4", "5", "10"];

const normalizeLabel = (label: string) => {
  const cleaned = label.toLowerCase().replace(/\s+/g, "").trim();
  if (cleaned === "ounce" || cleaned === "1oz") return "oz";
  if (cleaned === "2ounce") return "2oz";
  if (cleaned === "3ounce") return "3oz";
  return cleaned;
};

const prettyLabel = (label: string) => {
  const n = normalizeLabel(label);
  if (n === "oz") return "oz";
  if (n === "2oz") return "2oz";
  if (n === "3oz") return "3oz";
  return label.trim();
};

const parseSaleAmountsFromDescription = (description: string): AmountPrice[] => {
  if (!description) return [];
  const text = description.replace(/,/g, "\n");
  const out: AmountPrice[] = [];
  const add = (label: string, price: string) => {
    const value = Number(price);
    if (!Number.isFinite(value) || value <= 0) return;
    const normalized = normalizeLabel(label);
    const allowed = SALE_LABELS.map(normalizeLabel);
    const index = allowed.indexOf(normalized);
    if (index === -1) return;
    const canonical = SALE_LABELS[index];
    if (!out.some(a => normalizeLabel(a.label) === normalized)) out.push({ label: canonical, price: value });
  };

  const patterns = [
    /(^|\s)(1\/4|1\/2|oz|ounce|1\s*oz|2\s*oz|3\s*oz)\s*[-:]?\s*\$?(\d+(?:\.\d+)?)/gi,
    /(^|\s)(1|2|3|4|5|10)\s*[-:]?\s*\$?(\d+(?:\.\d+)?)(?=\s|$)/gi,
  ];
  for (const pattern of patterns) {
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(text)) !== null) add(m[2], m[3]);
  }
  return out;
};

export default function ProductDetailPage() {
  const params = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!params?.id) return;
    setLoading(true);
    api.get(`/products/${params.id}`)
      .then(r => r.json())
      .then(d => setProduct(d.product || null))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [params?.id]);

  const type = product?.type?.toLowerCase() || "";
  const isSaleType = SALE_TYPES.includes(type);
  const labelTemplate = isSaleType
    ? SALE_LABELS
    : WEIGHT_TYPES.includes(type)
      ? WEIGHT_LABELS
      : PREROLL_TYPES.includes(type)
        ? PREROLL_LABELS
        : QTY_TYPES.includes(type)
          ? QTY_LABELS
          : [];

  const amounts = useMemo(() => {
    if (!product) return [];
    const saved = (product.amounts || [])
      .filter(a => a && Number(a.price) > 0 && String(a.label || "").trim())
      .map(a => ({ label: prettyLabel(a.label), price: Number(a.price) }));
    const parsed = isSaleType ? parseSaleAmountsFromDescription(product.description) : [];
    const combined = [...saved];
    parsed.forEach(a => {
      if (!combined.some(x => normalizeLabel(x.label) === normalizeLabel(a.label))) combined.push(a);
    });
    if (!labelTemplate.length) return combined;
    return labelTemplate
      .map(label => combined.find(a => normalizeLabel(a.label) === normalizeLabel(label)))
      .filter(Boolean) as AmountPrice[];
  }, [product, isSaleType, labelTemplate.join("|")]);

  const selected = amounts.find(a => a.label === selectedLabel) || amounts[0] || null;
  const displayPrice = selected?.price || product?.price || 0;

  const addToCart = () => {
    if (!product) return;
    addItem({
      id: product._id,
      name: product.name,
      price: displayPrice,
      category: product.category,
      image: product.images?.[0]?.url || "",
      amount: selected ? selected.label : "1",
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-16 max-w-site mx-auto px-4 md:px-8">
        {loading ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <span className="ms text-green animate-spin" style={{fontSize:"40px"}}>progress_activity</span>
          </div>
        ) : !product ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-4">
            <p className="font-title text-2xl font-bold text-textPri">Product not found</p>
            <Link href="/shop" className="text-green font-sans text-sm hover:underline">Back to shop</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div className="bg-card border border-border rounded-3xl overflow-hidden">
              <img
                src={product.images?.[0]?.url || "https://images.unsplash.com/photo-1603909223429-69bb7101f420?w=900&q=80"}
                alt={product.name}
                className="w-full aspect-square object-cover"
              />
            </div>

            <section className="bg-card border border-border rounded-3xl p-5 md:p-8 space-y-6">
              <div>
                <Link href="/shop" className="font-sans text-xs text-green hover:underline">← Back to shop</Link>
                <div className="flex flex-wrap gap-2 mt-4 mb-3">
                  <span className="bg-green/10 text-green border border-green/20 px-3 py-1 rounded-full font-sans text-[10px] font-bold uppercase tracking-wider">{product.category}</span>
                  {(product.onSale || isSaleType) && <span className="bg-red-500 text-white px-3 py-1 rounded-full font-sans text-[10px] font-bold uppercase tracking-wider">Sale</span>}
                  {product.thc > 0 && <span className="bg-surfaceHi text-textSec border border-border px-3 py-1 rounded-full font-sans text-[10px] font-bold uppercase tracking-wider">THC {product.thc}%</span>}
                </div>
                <h1 className="font-title text-3xl md:text-5xl font-bold text-textPri leading-tight">{product.name}</h1>
                <p className="font-sans text-xs text-textDim uppercase tracking-widest mt-2">{product.type}</p>
              </div>

              {amounts.length > 0 && (
                <div>
                  <p className="font-sans text-xs font-semibold text-textDim uppercase tracking-widest mb-3">Select Amount / Quantity</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {amounts.map(a => (
                      <button
                        key={a.label}
                        onClick={() => setSelectedLabel(a.label)}
                        className={`rounded-2xl border p-3 text-left transition-all ${selected?.label === a.label ? "bg-green text-bg border-green" : "bg-bg border-border text-textSec hover:border-green hover:text-green"}`}
                      >
                        <span className="block font-title text-lg font-bold">{a.label}</span>
                        <span className="block font-sans text-xs opacity-80">{a.price}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-border pt-5">
                <div>
                  <p className="font-sans text-[10px] text-textDim uppercase tracking-widest">Total</p>
                  <p className="font-title text-3xl font-bold text-textPri">{displayPrice}</p>
                </div>
                <button onClick={addToCart} className={`px-6 py-4 rounded-2xl font-sans text-xs font-bold uppercase tracking-widest transition-all ${added ? "bg-greenBg border border-green text-green" : "bg-green text-bg hover:bg-greenLo shadow-lg shadow-green/20"}`}>
                  {added ? "Added!" : "Add to Cart"}
                </button>
              </div>

              {product.description && (
                <div className="border-t border-border pt-5">
                  <p className="font-sans text-xs font-semibold text-textDim uppercase tracking-widest mb-3">Description</p>
                  <p className="font-sans text-sm md:text-base text-textSec leading-relaxed whitespace-pre-line">{product.description}</p>
                </div>
              )}
            </section>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
