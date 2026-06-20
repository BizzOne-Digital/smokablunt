"use client";
import { useState } from "react";
import { useCart } from "@/lib/CartContext";

interface AmountPrice { label: string; price: number; }
interface P {
  id: string; name: string; category: string; type: string;
  price: number; rating: number; description: string; image: string; thc: number;
  amounts?: AmountPrice[]; onSale?: boolean; salePrice?: number;
}

const WEIGHT_TYPES  = ["flowers", "sale", "promo"];
const PREROLL_TYPES = ["pre-rolls"];
const QTY_TYPES     = ["concentrates", "edibles", "accessories"];

// Default labels are only used when an old product has no saved amount list.
// On the public site we only show options that have a price greater than 0.
const WEIGHT_LABELS  = ["1/4","1/2","oz","2oz","3oz"];
const PREROLL_LABELS = ["1","2","3","4","5","10"];
const QTY_LABELS     = ["1","2","3","4","5"];

export default function ProductCard({ p }: { p: P }) {
  const { addItem } = useCart();
  const [added,      setAdded]      = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const isWeight    = WEIGHT_TYPES.includes(p.type?.toLowerCase());
  const isPreroll   = PREROLL_TYPES.includes(p.type?.toLowerCase());
  const isQty       = QTY_TYPES.includes(p.type?.toLowerCase());
  const isQtyPicker = isPreroll || isQty;

  const defaultLabels = isWeight ? WEIGHT_LABELS : isPreroll ? PREROLL_LABELS : isQty ? QTY_LABELS : [];

  // Only priced options are active. Example: if only "1" has price 25,
  // the customer sees only 1-25, not 2-0 / 3-0.
  const amounts = (p.amounts?.length
    ? p.amounts
    : defaultLabels.map(label => ({ label, price: p.price }))
  ).filter(a => Number(a.price) > 0);

  const hasPicker   = amounts.length > 0;
  const hasAnyPrice = p.price > 0 || amounts.length > 0;

  const prices     = amounts.map(a => Number(a.price)).filter(x => x > 0);
  const minPrice   = prices.length ? Math.min(...prices) : p.price;
  const maxPrice   = prices.length ? Math.max(...prices) : p.price;
  const priceRange = prices.length > 1 && minPrice !== maxPrice;

  const [selected, setSelected] = useState<AmountPrice | null>(
    hasPicker ? amounts[0] : null
  );

  const displayPrice = selected?.price ?? p.price;
  // Each saved amount/quantity price is the final total for that option.
  const totalPrice   = displayPrice;

  // Sale price display
  const hasOldPrice = p.onSale && p.salePrice && p.salePrice > 0 && p.salePrice < p.price;

  const catStyle = ({
    Indica: "bg-purple-500/10 text-purple-400",
    Sativa: "bg-yellow-500/10 text-yellow-400",
    Hybrid: "bg-green/10 text-green",
  } as Record<string,string>)[p.category] || "bg-green/10 text-green";

  const handleAdd = () => {
    if (hasPicker && !showPicker) { setShowPicker(true); return; }
    addItem({
      id: p.id, name: p.name, price: totalPrice,
      category: p.category, image: p.image,
      amount: selected ? (isQtyPicker ? `×${selected.label}` : selected.label) : "1",
    });
    setAdded(true); setShowPicker(false);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <article className="group bg-card border border-border rounded-2xl overflow-visible hover:border-borderHi hover:shadow-xl hover:shadow-black/30 transition-all duration-300 flex flex-col relative">
      <div className="relative aspect-square md:h-56 md:aspect-auto overflow-hidden bg-bg flex-shrink-0">
        <img
          src={p.image || "https://images.unsplash.com/photo-1603909223429-69bb7101f420?w=600&q=80"}
          alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
      </div>

      {/* Body */}
      <div className="p-3 md:p-5 flex flex-col flex-1 gap-2 md:gap-3 relative overflow-visible">
        <div>
          <h2 className="font-title text-sm md:text-base font-semibold text-textPri leading-snug line-clamp-2">{p.name}</h2>
          <p className="font-sans text-[10px] text-textDim uppercase tracking-wider mt-0.5">{p.type}</p>
        </div>

        {p.description && (
          <p className="font-sans text-xs text-textSec leading-relaxed whitespace-pre-line break-words">{p.description}</p>
        )}

        {/* Amount/Qty Picker — absolute overlay so it doesn't affect grid layout */}
        {showPicker && hasPicker && (
          <div className="absolute bottom-full left-0 right-0 z-50 mb-1 bg-card border border-green/30 rounded-2xl p-3 shadow-2xl shadow-black/60 space-y-2">
            <p className="font-sans text-[10px] font-semibold text-textDim uppercase tracking-widest">
              {isQtyPicker ? "Quantity" : "Amount"}
            </p>
            <div className="grid grid-cols-3 gap-1">
              {amounts.map(a => (
                <button key={a.label} onClick={() => setSelected(a)}
                  className={`py-1.5 px-1 rounded-lg font-sans text-[10px] font-semibold border transition-all text-center ${selected?.label === a.label ? "bg-green text-bg border-green" : "border-border text-textSec hover:border-green hover:text-green"}`}>
                  <span className="block font-bold">{a.label}</span>
                  {hasAnyPrice && <span className="block text-[9px] opacity-80">{a.price}</span>}
                </button>
              ))}
            </div>
            {/* No separate units stepper — for qty types, selecting 1/2/3/4/5 IS the quantity */}
          </div>
        )}

        {/* Price + Button */}
        <div className="flex items-center justify-between pt-1 border-t border-border mt-auto">
          <div>
            {hasAnyPrice && (
              <>
                {hasOldPrice ? (
                  <>
                    <p className="font-sans text-[9px] line-through text-textDim">{p.price}</p>
                    <p className="font-title text-base font-bold text-red-400">{p.salePrice}</p>
                  </>
                ) : (
                  <>
                    <p className="font-sans text-[9px] text-textDim uppercase">
                      {showPicker ? "Total" : priceRange && !showPicker ? "From" : ""}
                    </p>
                    <p className="font-title text-base font-bold text-textPri">
                      {showPicker ? totalPrice : priceRange ? `${minPrice} – ${maxPrice}` : displayPrice}
                    </p>
                  </>
                )}
              </>
            )}
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
              <span className="ms" style={{fontSize:"14px"}}>
                {added ? "check" : hasPicker && !showPicker ? (isQtyPicker ? "tag" : "tune") : "add_shopping_cart"}
              </span>
              {added ? "Added!" : hasPicker && !showPicker ? (isQtyPicker ? "Qty" : "Select") : "Add"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}