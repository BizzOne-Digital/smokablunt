"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/lib/CartContext";

interface AmountPrice { label: string; price: number; }
interface P {
  id: string; name: string; category: string; type: string;
  price: number; rating: number; description: string; image: string; thc: number;
  amounts?: AmountPrice[]; onSale?: boolean; salePrice?: number;
}

const SALE_TYPES = ["sale", "promo"];
const WEIGHT_TYPES = ["flowers"];
const PREROLL_TYPES = ["pre-rolls"];
const QTY_TYPES = ["concentrates", "edibles", "accessories"];

const SALE_LABELS = ["1/4", "1/2", "oz", "2oz", "3oz", "1", "2", "3", "4", "5", "10"];
const WEIGHT_LABELS = ["1/4", "1/2", "oz", "2oz", "3oz"];
const PREROLL_LABELS = ["1", "2", "3", "4", "5", "10"];
const QTY_LABELS = ["1", "2", "3", "4", "5"];

const labelsForType = (type: string) => {
  const t = type?.toLowerCase();
  if (SALE_TYPES.includes(t)) return SALE_LABELS;
  if (WEIGHT_TYPES.includes(t)) return WEIGHT_LABELS;
  if (PREROLL_TYPES.includes(t)) return PREROLL_LABELS;
  if (QTY_TYPES.includes(t)) return QTY_LABELS;
  return [];
};

const normalizeLabel = (label: string) => label.toLowerCase().replace(/\s+/g, "").replace("ounce", "oz");

const parseDescriptionAmounts = (description: string): AmountPrice[] => {
  // Supports old sale products where prices were typed in description, e.g.
  // 1/2 45
  // Oz 80
  // 2 oz 150
  const out: AmountPrice[] = [];
  description.split(/\n+/).forEach(line => {
    const m = line.trim().match(/^(1\/4|1\/2|\d+\s*oz|oz|\d+)\s*[-:]?\s*\$?(\d+(?:\.\d+)?)$/i);
    if (!m) return;
    const raw = m[1].toLowerCase().replace(/\s+/g, "");
    const label = raw === "oz" ? "oz" : raw;
    out.push({ label, price: Number(m[2]) });
  });
  return out;
};

const availableAmountsFor = (p: P): AmountPrice[] => {
  const labels = labelsForType(p.type);
  const saved = p.amounts?.filter(a => Number(a.price) > 0) || [];
  const parsed = SALE_TYPES.includes(p.type?.toLowerCase()) ? parseDescriptionAmounts(p.description || "") : [];
  const source = saved.length ? saved : parsed;

  if (!labels.length) return [];

  return labels
    .map(label => {
      const found = source.find(a => normalizeLabel(a.label) === normalizeLabel(label));
      return found ? { label, price: Number(found.price) } : null;
    })
    .filter((a): a is AmountPrice => !!a && a.price > 0);
};

export default function ProductCard({ p }: { p: P }) {
  const { addItem } = useCart();
  const amounts = useMemo(() => availableAmountsFor(p), [p]);
  const [added, setAdded] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [selected, setSelected] = useState<AmountPrice | null>(amounts[0] || null);

  const hasPicker = amounts.length > 0;
  const prices = hasPicker ? amounts.map(a => a.price) : [p.salePrice && p.salePrice > 0 ? p.salePrice : p.price].filter(Boolean);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const priceRange = hasPicker && minPrice !== maxPrice;
  const detailHref = `/products/${p.id}`;

  const catStyle = ({
    Indica: "bg-purple-500/10 text-purple-400",
    Sativa: "bg-yellow-500/10 text-yellow-400",
    Hybrid: "bg-green/10 text-green",
  } as Record<string,string>)[p.category] || "bg-green/10 text-green";

  const handleAdd = () => {
    if (hasPicker && !selected) {
      setSelected(amounts[0]);
      setShowPicker(true);
      return;
    }
    if (hasPicker && !showPicker) {
      setShowPicker(true);
      return;
    }

    const finalPrice = selected?.price || (p.salePrice && p.salePrice > 0 ? p.salePrice : p.price);
    addItem({
      id: p.id,
      name: p.name,
      price: finalPrice,
      category: p.category,
      image: p.image,
      amount: selected?.label || "1",
    });
    setAdded(true);
    setShowPicker(false);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <article className="group bg-card border border-border rounded-2xl overflow-visible hover:border-borderHi hover:shadow-xl hover:shadow-black/30 transition-all duration-300 flex flex-col relative">
      <Link href={detailHref} className="relative aspect-square md:h-56 md:aspect-auto overflow-hidden bg-bg flex-shrink-0 block rounded-t-2xl">
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
          {p.type?.toLowerCase() === "sale" && <span className="bg-red-500 text-white px-2 py-0.5 rounded-full font-sans text-[9px] font-bold">SALE</span>}
          {p.type?.toLowerCase() === "promo" && <span className="bg-green text-bg px-2 py-0.5 rounded-full font-sans text-[9px] font-bold">PROMO</span>}
        </div>
        {p.thc > 0 && (
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
            <span className="font-sans text-[9px] font-semibold text-textSec">THC {p.thc}%</span>
          </div>
        )}
      </Link>

      <div className="p-3 md:p-5 flex flex-col flex-1 gap-2 md:gap-3 relative overflow-visible">
        <div>
          <Link href={detailHref} className="font-title text-sm md:text-base font-semibold text-textPri leading-snug line-clamp-2 hover:text-green transition-colors">
            {p.name}
          </Link>
          <p className="font-sans text-[10px] text-textDim uppercase tracking-wider mt-0.5">{p.type}</p>
        </div>

        {p.description && (
          <p className="font-sans text-xs text-textSec line-clamp-2 leading-relaxed">{p.description}</p>
        )}

        {showPicker && hasPicker && (
          <div className="absolute bottom-full left-0 right-0 z-50 mb-1 bg-card border border-green/30 rounded-2xl p-3 shadow-2xl shadow-black/60 space-y-2">
            <p className="font-sans text-[10px] font-semibold text-textDim uppercase tracking-widest">Select Amount</p>
            <div className="grid grid-cols-3 gap-1">
              {amounts.map(a => (
                <button
                  key={a.label}
                  type="button"
                  onClick={() => setSelected(a)}
                  className={`py-1.5 px-1 rounded-lg font-sans text-[10px] font-semibold border transition-all text-center ${selected?.label === a.label ? "bg-green text-bg border-green" : "border-border text-textSec hover:border-green hover:text-green"}`}
                >
                  <span className="block font-bold">{a.label}</span>
                  <span className="block text-[9px] opacity-80">{a.price}</span>
                </button>
              ))}
            </div>
            <Link href={detailHref} className="block text-center font-sans text-[10px] text-green hover:underline pt-1">
              View full details
            </Link>
          </div>
        )}

        <div className="flex items-center justify-between pt-1 border-t border-border mt-auto">
          <div>
            <p className="font-sans text-[9px] text-textDim uppercase">
              {priceRange ? "From" : showPicker ? "Total" : ""}
            </p>
            <p className="font-title text-base font-bold text-textPri">
              {hasPicker
                ? (showPicker && selected ? selected.price : priceRange ? `${minPrice} – ${maxPrice}` : minPrice)
                : (p.salePrice && p.salePrice > 0 ? p.salePrice : p.price)}
            </p>
          </div>
          <div className="flex gap-1.5">
            {showPicker && (
              <button
                type="button"
                onClick={() => setShowPicker(false)}
                className="flex items-center gap-1 px-2.5 py-2 rounded-xl font-sans text-[10px] font-semibold border border-border text-textSec hover:border-borderHi transition-all"
              >
                <span className="ms" style={{fontSize:"12px"}}>close</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleAdd}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-sans text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${added ? "bg-greenBg border border-green text-green" : "bg-green text-bg hover:bg-greenLo active:scale-95 shadow-lg shadow-green/20"}`}
            >
              <span className="ms" style={{fontSize:"14px"}}>{added ? "check" : hasPicker && !showPicker ? "tune" : "add_shopping_cart"}</span>
              {added ? "Added" : hasPicker && !showPicker ? "Select" : "Add"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
