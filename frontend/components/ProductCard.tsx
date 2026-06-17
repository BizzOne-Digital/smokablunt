"use client";
import { useState } from "react";
import { useCart } from "@/lib/CartContext";

interface AmountPrice { label: string; price: number; }
interface P {
  id: string; name: string; category: string; type: string; price: number;
  rating: number; description: string; image: string; thc: number; amounts?: AmountPrice[];
}

const WEIGHT_TYPES = ["flowers","pre-rolls"];
const QTY_TYPES    = ["edibles","concentrates","accessories","sale","promo"];

export default function ProductCard({ p }: { p: P }) {
  const { addItem } = useCart();
  const [added,      setAdded]      = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [qty,        setQty]        = useState(1);

  const isWeight = WEIGHT_TYPES.includes(p.type?.toLowerCase());
  const isQty    = QTY_TYPES.includes(p.type?.toLowerCase());

  // Build picker options
  const buildAmounts = (): AmountPrice[] => {
    // If product has amounts with real prices, use them
    if (p.amounts?.some(a => a.price > 0)) return p.amounts!;
    // Flowers / Pre-rolls — weight picker with base price
    if (isWeight) return [
      { label:"1/4", price: p.price },
      { label:"1/2", price: p.price },
      { label:"oz",  price: p.price },
      { label:"2oz", price: p.price },
      { label:"3oz", price: p.price },
    ];
    // Edibles / Concentrates / Accessories — qty 1–5 with base price × qty
    if (isQty) return [1,2,3,4,5].map(n => ({ label: String(n), price: p.price }));
    return [];
  };

  const amounts = buildAmounts();
  const hasPicker = amounts.length > 0;

  const [selected, setSelected] = useState<AmountPrice | null>(
    hasPicker ? amounts[0] : null
  );

  // Price displayed: selected amount price, or base price
  const displayPrice = selected ? (selected.price > 0 ? selected.price : p.price) : p.price;
  // For qty types, total = price × qty
  const totalPrice = isQty && selected ? displayPrice * qty : displayPrice;

  const catStyle = {
    Indica: "bg-purple-500/10 text-purple-400",
    Sativa: "bg-yellow-500/10 text-yellow-400",
    Hybrid: "bg-green/10 text-green",
  }[p.category] || "bg-green/10 text-green";

  const handleAdd = () => {
    if (hasPicker && !showPicker) { setShowPicker(true); return; }
    addItem({
      id: p.id, name: p.name,
      price: totalPrice,
      category: p.category, image: p.image,
      amount: selected ? (isQty ? `×${selected.label}` : selected.label) : "1",
    });
    setAdded(true); setShowPicker(false);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <article className="group bg-card border border-border rounded-3xl overflow-hidden hover:border-borderHi hover:shadow-xl hover:shadow-black/30 transition-all duration-300 flex flex-col">
      {/* Image */}
      <div className="relative h-56 overflow-hidden bg-bg flex-shrink-0">
        <img
          src={p.image || "https://images.unsplash.com/photo-1603909223429-69bb7101f420?w=600&q=80"}
          alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1603909223429-69bb7101f420?w=600&q=80"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 rounded-full font-sans text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm ${catStyle}`}>
            {p.category}
          </span>
        </div>
        {p.thc > 0 && (
          <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
            <span className="font-sans text-[10px] font-semibold text-textSec">THC {p.thc}%</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-title text-base font-semibold text-textPri leading-snug line-clamp-1">{p.name}</h2>
            {p.rating > 0 && (
              <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
                <span className="ms ms-fill text-yellow-400" style={{fontSize:"13px"}}>star</span>
                <span className="font-sans text-xs font-semibold text-textSec">{p.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          <p className="font-sans text-xs text-textDim uppercase tracking-wider mt-1">{p.type}</p>
        </div>

        <p className="font-sans text-sm text-textSec line-clamp-2 flex-1 leading-relaxed">{p.description}</p>

        {/* Picker — shows when user taps Select/Qty */}
        {showPicker && hasPicker && (
          <div className="space-y-2">
            <p className="font-sans text-xs font-semibold text-textDim uppercase tracking-widest">
              {isQty ? "Select Quantity" : "Select Amount"}
            </p>
            {/* Amount/Qty grid */}
            <div className="grid grid-cols-3 gap-1.5">
              {amounts.map(a => {
                const priceLabel = a.price > 0 ? a.price : p.price;
                const isActive = selected?.label === a.label;
                return (
                  <button key={a.label} onClick={() => setSelected(a)}
                    className={`py-2 px-1 rounded-xl font-sans text-xs font-semibold border transition-all text-center ${isActive ? "bg-green text-bg border-green" : "border-border text-textSec hover:border-green hover:text-green"}`}>
                    <span className="block font-bold">{a.label}</span>
                    <span className="block text-[9px] opacity-80 mt-0.5">{priceLabel}</span>
                  </button>
                );
              })}
            </div>
            {/* Quantity stepper — only for qty types */}
            {isQty && (
              <div className="flex items-center justify-between bg-bg border border-border rounded-xl px-3 py-2">
                <span className="font-sans text-xs text-textSec">Units</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => setQty(q => Math.max(1, q-1))}
                    className="w-6 h-6 flex items-center justify-center text-textSec hover:text-green transition-colors">
                    <span className="ms" style={{fontSize:"14px"}}>remove</span>
                  </button>
                  <span className="font-sans text-sm font-bold text-textPri w-5 text-center">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(5, q+1))}
                    className="w-6 h-6 flex items-center justify-center text-textSec hover:text-green transition-colors">
                    <span className="ms" style={{fontSize:"14px"}}>add</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Price + Add Button */}
        <div className="flex items-center justify-between pt-1 border-t border-border">
          <div>
            <p className="font-sans text-[10px] text-textDim uppercase tracking-wider">
              {showPicker && isQty ? "Total" : "From"}
            </p>
            <p className="font-title text-xl font-bold text-textPri">
              {showPicker && isQty ? totalPrice : displayPrice}
            </p>
          </div>
          <div className="flex gap-2">
            {showPicker && (
              <button onClick={() => setShowPicker(false)}
                className="flex items-center gap-1 px-3 py-2.5 rounded-2xl font-sans text-xs font-semibold border border-border text-textSec hover:border-borderHi transition-all">
                <span className="ms" style={{fontSize:"14px"}}>close</span>
              </button>
            )}
            <button onClick={handleAdd}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-sans text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                added ? "bg-greenBg border border-green text-green" : "bg-green text-bg hover:bg-greenLo active:scale-95 shadow-lg shadow-green/20"
              }`}>
              <span className="ms" style={{fontSize:"16px"}}>
                {added ? "check" : hasPicker && !showPicker ? (isQty ? "tag" : "tune") : "add_shopping_cart"}
              </span>
              {added ? "Added!" : hasPicker && !showPicker ? (isQty ? "Qty" : "Select") : "Add"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}