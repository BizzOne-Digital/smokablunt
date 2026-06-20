"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/lib/CartContext";

interface AmountPrice { label: string; price: number; }
interface P {
  id: string;
  name: string;
  category: string;
  type: string;
  price: number;
  rating: number;
  description: string;
  image: string;
  thc: number;
  amounts?: AmountPrice[];
  onSale?: boolean;
  salePrice?: number;
}

const cleanAmount = (a: AmountPrice) => ({
  label: String(a.label || "").trim(),
  price: Number(a.price || 0),
});

// Fallback for old Sale products where the admin wrote prices in description like:
// 1/2 45
// Oz 80
// 2 oz 150
// New products should use the Amount Pricing fields, but this keeps old sale items working too.
const parseAmountsFromDescription = (description?: string): AmountPrice[] => {
  if (!description) return [];
  return description
    .split(/\r?\n/)
    .map(line => line.trim())
    .map(line => {
      const match = line.match(/^(1\/4|1\/2|\d+\s*oz|oz|\d+)\s*[-:]?\s*\$?(\d+(?:\.\d+)?)/i);
      if (!match) return null;
      const label = match[1].replace(/\s+/g, " ").replace(/^oz$/i, "oz");
      const price = Number(match[2]);
      return label && price > 0 ? { label, price } : null;
    })
    .filter(Boolean) as AmountPrice[];
};

export default function ProductCard({ p }: { p: P }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  // Only show amounts that admin actually filled with price > 0.
  // This fixes 2-0 / 3-0 / 5-0 showing on the public site.
  const amounts = useMemo(() => {
    const saved = (p.amounts || []).map(cleanAmount).filter(a => a.label && a.price > 0);
    if (saved.length > 0) return saved;
    if (["sale", "promo"].includes(String(p.type || "").toLowerCase())) {
      return parseAmountsFromDescription(p.description);
    }
    return [];
  }, [p.amounts, p.description, p.type]);

  const hasAmounts = amounts.length > 0;
  const fallbackPrice = Number(p.salePrice && p.salePrice > 0 ? p.salePrice : p.price || 0);
  const [selected, setSelected] = useState<AmountPrice | null>(hasAmounts ? amounts[0] : null);

  const prices = hasAmounts ? amounts.map(a => a.price) : [fallbackPrice].filter(Boolean);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const priceRange = prices.length > 1 && minPrice !== maxPrice;
  const displayPrice = selected?.price || fallbackPrice;

  const catStyle = ({
    Indica: "bg-purple-500/10 text-purple-400",
    Sativa: "bg-yellow-500/10 text-yellow-400",
    Hybrid: "bg-green/10 text-green",
  } as Record<string,string>)[p.category] || "bg-green/10 text-green";

  const handleAdd = () => {
    if (hasAmounts && !showPicker) {
      setShowPicker(true);
      return;
    }

    const chosen = selected || (hasAmounts ? amounts[0] : null);
    const price = chosen?.price || fallbackPrice;
    if (!price || price <= 0) return;

    addItem({
      id: p.id,
      name: p.name,
      price,
      category: p.category,
      image: p.image,
      amount: chosen?.label || "1",
    });

    setAdded(true);
    setShowPicker(false);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <article className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-borderHi hover:shadow-xl hover:shadow-black/30 transition-all duration-300 flex flex-col relative">
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
          {p.onSale && <span className="bg-red-500 text-white px-2 py-0.5 rounded-full font-sans text-[9px] font-bold">SALE</span>}
        </div>
        {p.thc > 0 && (
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
            <span className="font-sans text-[9px] font-semibold text-textSec">THC {p.thc}%</span>
          </div>
        )}
      </Link>

      <div className="p-3 md:p-5 flex flex-col flex-1 gap-2 md:gap-3 relative overflow-visible">
        <div>
          <Link href={`/products/${p.id}`} className="hover:text-green transition-colors">
            <h2 className="font-title text-sm md:text-base font-semibold text-textPri leading-snug line-clamp-2">{p.name}</h2>
          </Link>
          <p className="font-sans text-[10px] text-textDim uppercase tracking-wider mt-0.5">{p.type}</p>
        </div>

        {p.description && (
          <p className="font-sans text-xs text-textSec line-clamp-2 leading-relaxed min-h-[2.5rem]">
            {p.description}
          </p>
        )}

        {showPicker && hasAmounts && (
          <div className="absolute bottom-[4.5rem] left-3 right-3 z-50 bg-card border border-green/30 rounded-2xl p-3 shadow-2xl shadow-black/60 space-y-2">
            <p className="font-sans text-[10px] font-semibold text-textDim uppercase tracking-widest">Select Amount</p>
            <div className="grid grid-cols-2 gap-1.5">
              {amounts.map(a => (
                <button
                  key={a.label}
                  onClick={() => setSelected(a)}
                  className={`py-2 px-2 rounded-lg font-sans text-[10px] font-semibold border transition-all text-center ${selected?.label === a.label ? "bg-green text-bg border-green" : "border-border text-textSec hover:border-green hover:text-green"}`}
                >
                  <span className="block font-bold">{a.label}</span>
                  <span className="block text-[9px] opacity-80">{a.price}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-border mt-auto gap-2">
          <div className="min-w-0">
            {prices.length > 0 && (
              <>
                <p className="font-sans text-[9px] text-textDim uppercase">
                  {hasAmounts && !showPicker && priceRange ? "From" : showPicker ? "Total" : ""}
                </p>
                <p className="font-title text-base font-bold text-textPri truncate">
                  {showPicker ? displayPrice : priceRange ? `${minPrice} – ${maxPrice}` : minPrice}
                </p>
              </>
            )}
          </div>

          <div className="flex gap-1.5 flex-shrink-0">
            <Link
              href={`/products/${p.id}`}
              className="flex items-center gap-1 px-2.5 py-2 rounded-xl font-sans text-[10px] font-semibold border border-border text-textSec hover:border-green hover:text-green transition-all"
            >
              View
            </Link>
            {showPicker && (
              <button
                onClick={() => setShowPicker(false)}
                className="flex items-center gap-1 px-2.5 py-2 rounded-xl font-sans text-[10px] font-semibold border border-border text-textSec hover:border-borderHi transition-all"
              >
                <span className="ms" style={{fontSize:"12px"}}>close</span>
              </button>
            )}
            <button
              onClick={handleAdd}
              disabled={prices.length === 0}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-sans text-[10px] font-bold uppercase tracking-wider transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${added ? "bg-greenBg border border-green text-green" : "bg-green text-bg hover:bg-greenLo active:scale-95 shadow-lg shadow-green/20"}`}
            >
              <span className="ms" style={{fontSize:"14px"}}>
                {added ? "check" : hasAmounts && !showPicker ? "tune" : "add_shopping_cart"}
              </span>
              {added ? "Added" : hasAmounts && !showPicker ? "Select" : "Add"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
