"use client";
import Link from "next/link";
import { useCart } from "@/lib/CartContext";

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, removeItem, updateQty, totalPrice } = useCart();
  const fee   = totalPrice >= 100 ? 0 : 5;
  const total = totalPrice + fee;

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm" onClick={onClose} />}
      <div className={`fixed top-0 right-0 h-full w-full max-w-[360px] bg-surface border-l border-border z-50 flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>

        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-border">
          <h2 className="font-title text-base font-semibold text-textPri">
            Your Cart {items.length > 0 && <span className="text-green">({items.length})</span>}
          </h2>
          <button onClick={onClose} className="text-textSec hover:text-textPri transition-colors p-1">
            <span className="ms">close</span>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-surfaceHi flex items-center justify-center">
                <span className="ms text-textDim" style={{ fontSize: "28px" }}>shopping_cart</span>
              </div>
              <p className="font-sans text-sm text-textSec">Your cart is empty</p>
              <button onClick={onClose} className="text-green font-sans text-sm hover:underline">Browse Products →</button>
            </div>
          ) : items.map(item => (
            <div key={`${item.id}-${item.amount}`} className="flex gap-3 bg-card border border-border rounded-2xl p-3 group">
              <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-bg">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-sans text-sm font-semibold text-textPri line-clamp-1">{item.name}</p>
                <p className="font-sans text-xs text-textDim uppercase tracking-wider mt-0.5">{item.category} · {item.amount}</p>
                <p className="font-title text-sm font-bold text-green mt-1">{item.price}</p>
              </div>
              <div className="flex flex-col items-end justify-between">
                <button onClick={() => removeItem(item.id, item.amount)} className="text-textDim hover:text-error transition-colors opacity-0 group-hover:opacity-100">
                  <span className="ms" style={{ fontSize: "16px" }}>delete</span>
                </button>
                <div className="flex items-center gap-1.5 bg-bg border border-border rounded-full px-1 py-0.5">
                  <button onClick={() => updateQty(item.id, item.amount, item.quantity - 1)} className="w-5 h-5 flex items-center justify-center text-textSec hover:text-green transition-colors">
                    <span className="ms" style={{ fontSize: "12px" }}>remove</span>
                  </button>
                  <span className="font-sans text-xs font-semibold text-textPri w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQty(item.id, item.amount, item.quantity + 1)} className="w-5 h-5 flex items-center justify-center text-textSec hover:text-green transition-colors">
                    <span className="ms" style={{ fontSize: "12px" }}>add</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-border space-y-3 bg-surface">
            <div className="space-y-1.5">
              <div className="flex justify-between font-sans text-sm"><span className="text-textSec">Subtotal</span><span className="text-textPri">{totalPrice.toFixed(2)}</span></div>
              <div className="flex justify-between font-sans text-sm">
                <span className="text-textSec">Delivery</span>
                <span className={fee === 0 ? "text-green font-semibold" : "text-textPri"}>{fee === 0 ? "FREE" : `${fee}.00`}</span>
              </div>
              <div className="flex justify-between font-title text-lg font-bold pt-2 border-t border-border">
                <span className="text-textPri">Total</span>
                <span className="text-green">{total.toFixed(2)}</span>
              </div>
            </div>
            {totalPrice < 100 && (
              <p className="text-center font-sans text-xs text-textDim bg-bg rounded-xl py-2">
                Add <span className="text-green font-bold">{(100 - totalPrice).toFixed(2)}</span> more for free delivery
              </p>
            )}
            <Link href="/checkout" onClick={onClose}
              className="w-full bg-green text-bg py-3.5 rounded-2xl font-sans text-sm font-bold uppercase tracking-widest hover:bg-greenLo transition-colors flex items-center justify-center gap-2">
              <span className="ms" style={{ fontSize: "18px" }}>local_shipping</span>
              Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}