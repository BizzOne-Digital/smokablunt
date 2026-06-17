"use client";
import { useState } from "react";
import { useCart } from "@/lib/CartContext";

interface AmountPrice { label:string; price:number; }
interface P { id:string; name:string; category:string; type:string; price:number; rating:number; description:string; image:string; thc:number; amounts?:AmountPrice[]; }

export default function ProductCard({ p }: { p: P }) {
  const { addItem } = useCart();
  const [added, setAdded]     = useState(false);
  const [qty, setQty]         = useState(1);
  const [showPicker, setShowPicker] = useState(false);

  const isFlower   = ["flowers","pre-rolls"].includes(p.type?.toLowerCase());
  const isQtyType  = ["edibles","concentrates"].includes(p.type?.toLowerCase());

  const flowerAmts: AmountPrice[] = [
    { label:"1/4", price:p.price },
    { label:"1/2", price:p.price },
    { label:"oz",  price:p.price },
    { label:"2oz", price:p.price },
    { label:"3oz", price:p.price },
  ];

  const qtyAmts: AmountPrice[] = [1,2,3,4,5].map(n => ({ label: String(n), price: p.price * n }));

  // Use product-level amounts if set, else defaults per type
  const amounts: AmountPrice[] =
    p.amounts?.some(a => a.price > 0) ? p.amounts :
    isFlower  ? flowerAmts :
    isQtyType ? qtyAmts :
    [];

  const [selectedAmount, setSelectedAmount] = useState<AmountPrice|null>(
    amounts.length > 0 ? amounts[0] : null
  );

  const activePrice = selectedAmount ? selectedAmount.price || p.price : p.price;

  const catStyle = {
    Indica: "bg-purple-500/10 text-purple-400",
    Sativa: "bg-yellow-500/10 text-yellow-400",
    Hybrid: "bg-green/10 text-green",
  }[p.category] || "bg-green/10 text-green";

  const handleAdd = () => {
    if (amounts.length > 0 && !showPicker) { setShowPicker(true); return; }
    addItem({
      id: p.id,
      name: p.name,
      price: activePrice,
      category: p.category,
      image: p.image,
      amount: selectedAmount?.label || "1",
    });
    setAdded(true);
    setShowPicker(false);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <article className="group bg-card border border-border rounded-3xl overflow-hidden hover:border-borderHi hover:shadow-xl hover:shadow-black/30 transition-all duration-300 flex flex-col">
      {/* Image */}
      <div className="relative h-56 overflow-hidden bg-bg flex-shrink-0">
        <img
          src={p.image || "https://images.unsplash.com/photo-1603909223429-69bb7101f420?w=600&q=80"}
          alt={p.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
            <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
              <span className="ms ms-fill text-yellow-400" style={{ fontSize: "13px" }}>star</span>
              <span className="font-sans text-xs font-semibold text-textSec">{p.rating.toFixed(1)}</span>
            </div>
          </div>
          <p className="font-sans text-xs text-textDim uppercase tracking-wider mt-1">{p.type}</p>
        </div>

        <p className="font-sans text-sm text-textSec line-clamp-2 flex-1 leading-relaxed">{p.description}</p>

        {/* Amount selector — shown when picker is open */}
        {showPicker && amounts.length > 0 && (
          <div className="space-y-2">
            <p className="font-sans text-xs font-semibold text-textDim uppercase tracking-widest">
              {isQtyType ? "Select Quantity" : "Select Amount"}
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {amounts.map(a => (
                <button
                  key={a.label}
                  onClick={() => setSelectedAmount(a)}
                  className={`py-2 rounded-xl font-sans text-xs font-semibold border transition-all ${selectedAmount?.label === a.label ? "bg-green text-bg border-green" : "border-border text-textSec hover:border-green hover:text-green"}`}
                >
                  {a.label}
                  {a.price > 0 && <span className="block text-[9px] opacity-70">{a.price}</span>}
                </button>
              ))}
            </div>
            {/* Quantity */}
            <div className="flex items-center justify-between bg-bg border border-border rounded-xl px-3 py-2">
              <span className="font-sans text-xs text-textSec">Qty</span>
              <div className="flex items-center gap-3">
                <button onClick={() => setQty(q => Math.max(1, q-1))} className="w-6 h-6 flex items-center justify-center text-textSec hover:text-green transition-colors">
                  <span className="ms" style={{ fontSize:"14px" }}>remove</span>
                </button>
                <span className="font-sans text-sm font-bold text-textPri w-5 text-center">{qty}</span>
                <button onClick={() => setQty(q => q+1)} className="w-6 h-6 flex items-center justify-center text-textSec hover:text-green transition-colors">
                  <span className="ms" style={{ fontSize:"14px" }}>add</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Price + Add */}
        <div className="flex items-center justify-between pt-1 border-t border-border">
          <div>
            <p className="font-sans text-[10px] text-textDim uppercase tracking-wider">From</p>
            <p className="font-title text-xl font-bold text-textPri">{activePrice}</p>
          </div>
          <div className="flex gap-2">
            {showPicker && (
              <button onClick={() => setShowPicker(false)} className="flex items-center gap-1 px-3 py-2.5 rounded-2xl font-sans text-xs font-semibold border border-border text-textSec hover:border-borderHi transition-all">
                <span className="ms" style={{ fontSize:"14px" }}>close</span>
              </button>
            )}
            <button
              onClick={handleAdd}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-sans text-xs font-bold uppercase tracking-wider transition-all duration-200 ${added
                ? "bg-greenBg border border-green text-green"
                : "bg-green text-bg hover:bg-greenLo active:scale-95 shadow-lg shadow-green/20"
              }`}
            >
              <span className="ms" style={{ fontSize: "16px" }}>{added ? "check" : amounts.length > 0 && !showPicker ? (isQtyType ? "tag" : "tune") : "add_shopping_cart"}</span>
              {added ? "Added!" : amounts.length > 0 && !showPicker ? (isQtyType ? "Qty" : "Select") : "Add"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}