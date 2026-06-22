"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/CartContext";

interface AmountPrice { label: string; price: number; }
interface P {
  id: string; name: string; category: string; type: string;
  price: number; rating: number; description: string; image: string; thc: number;
  amounts?: AmountPrice[]; onSale?: boolean; salePrice?: number;
}

const WEIGHT_TYPES  = ["flowers"];
const PREROLL_TYPES = ["pre-rolls"];
const QTY_TYPES     = ["concentrates", "edibles", "accessories"];
const SALE_TYPES    = ["sale", "promo"];

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
    if (!out.some(a => normalizeLabel(a.label) === normalized)) {
      out.push({ label: canonical, price: value });
    }
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

export default function ProductCard({ p }: { p: P }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const type = p.type?.toLowerCase() || "";
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
    const saved = (p.amounts || [])
      .filter(a => a && Number(a.price) > 0 && String(a.label || "").trim())
      .map(a => ({ label: prettyLabel(a.label), price: Number(a.price) }));

    const parsed = isSaleType ? parseSaleAmountsFromDescription(p.description) : [];
    const combined = [...saved];
    parsed.forEach(a => {
      if (!combined.some(x => normalizeLabel(x.label) === normalizeLabel(a.label))) combined.push(a);
    });

    if (!labelTemplate.length) return combined;

    return labelTemplate
      .map(label => combined.find(a => normalizeLabel(a.label) === normalizeLabel(label)))
      .filter(Boolean) as AmountPrice[];
  }, [p.amounts, p.description, isSaleType, labelTemplate.join("|")]);

  const hasPicker = amounts.length > 0;
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const selected = amounts.find(a => a.label === selectedLabel) || amounts[0] || null;

  const prices = amounts.map(a => a.price).filter(x => x > 0);
  const minPrice = prices.length ? Math.min(...prices) : p.price;
  const maxPrice = prices.length ? Math.max(...prices) : p.price;
  const priceRange = prices.length > 1 && minPrice !== maxPrice;
  const displayPrice = selected?.price || p.price;

  const catStyle = ({
    Indica: "bg-purple-500/10 text-purple-400",
    Sativa: "bg-yellow-500/10 text-yellow-400",
    Hybrid: "bg-green/10 text-green",
  } as Record<string,string>)[p.category] || "bg-green/10 text-green";

  const handleAdd = () => {
    if (hasPicker && !showPicker) { setShowPicker(true); return; }
    addItem({
      id: p.id,
      name: p.name,
      price: displayPrice,
      category: p.category,
      image: p.image,
      amount: selected ? selected.label : "1",
    });
    setAdded(true);
    setShowPicker(false);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <article className="group bg-card border border-border rounded-2xl overflow-visible hover:border-borderHi hover:shadow-xl hover:shadow-black/30 transition-all duration-300 flex flex-col relative">
      <Link href={`/products/${p.id}`} className="relative aspect-square md:h-56 md:aspect-auto overflow-hidden bg-bg flex-shrink-0 block">
        <img
          src={p.image || "https://images.unsplash.com/photo-1603909223429-69bb7101f420?w=600&q=80"}
          alt={p.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1603909223429-69bb7101f420?w=600&q=80"; }}
        />
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          <span className={`px-2 py-0.5 rounded-full font-sans text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm ${catStyle}`}>
            {p.category}
          </span>
          {(p.onSale || isSaleType) && <span className="bg-red-500 text-white px-2 py-0.5 rounded-full font-sans text-[9px] font-bold">SALE</span>}
        </div>
        {p.thc > 0 && (
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
            <span className="font-sans text-[9px] font-semibold text-textSec">THC {p.thc}%</span>
          </div>
        )}
      </Link>

      <div className="p-3 md:p-5 flex flex-col flex-1 gap-2 md:gap-3 relative overflow-visible">
        <div>
          <Link href={`/products/${p.id}`} className="font-title text-sm md:text-base font-semibold text-textPri leading-snug line-clamp-2 hover:text-green transition-colors">
            {p.name}
          </Link>
          <p className="font-sans text-[10px] text-textDim uppercase tracking-wider mt-0.5">{p.type}</p>
        </div>

        {p.description && (
          <p className="font-sans text-xs text-textSec line-clamp-2 leading-relaxed">{p.description}</p>
        )}

        {showPicker && hasPicker && (
          <div className="absolute bottom-full left-0 right-0 z-50 mb-1 bg-card border border-green/30 rounded-2xl p-3 shadow-2xl shadow-black/60 space-y-2">
            <p className="font-sans text-[10px] font-semibold text-textDim uppercase tracking-widest">Amount / Quantity</p>
            <div className="grid grid-cols-3 gap-1">
              {amounts.map(a => (
                <button
                  key={a.label}
                  onClick={() => setSelectedLabel(a.label)}
                  className={`py-1.5 px-1 rounded-lg font-sans text-[10px] font-semibold border transition-all text-center ${selected?.label === a.label ? "bg-green text-bg border-green" : "border-border text-textSec hover:border-green hover:text-green"}`}
                >
                  <span className="block font-bold">{a.label}</span>
                  <span className="block text-[9px] opacity-80">{a.price}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-1 border-t border-border mt-auto">
          <div>
            <p className="font-sans text-[9px] text-textDim uppercase">
              {showPicker ? "Total" : priceRange ? "From" : "Total"}
            </p>
            <p className="font-title text-base font-bold text-textPri">
              {showPicker ? displayPrice : priceRange ? `${minPrice} – ${maxPrice}` : displayPrice}
            </p>
          </div>
          <div className="flex gap-1.5">
            {showPicker && (
              <button onClick={() => setShowPicker(false)}
                className="flex items-center gap-1 px-2.5 py-2 rounded-xl font-sans text-[10px] font-semibold border border-border text-textSec hover:border-borderHi transition-all">
                <span className="ms" style={{fontSize:"12px"}}>close</span>
              </button>
            )}
            <button onClick={handleAdd}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-sans text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${added ? "bg-greenBg border border-green text-green" : "bg-green text-bg hover:bg-greenLo active:scale-95 shadow-lg shadow-green/20"}`}>
              <span className="ms" style={{fontSize:"14px"}}>{added ? "check" : hasPicker && !showPicker ? "tune" : "add_shopping_cart"}</span>
              {added ? "Added!" : hasPicker && !showPicker ? "Select" : "Add"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
