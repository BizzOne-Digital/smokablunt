"use client";
import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";
import { api } from "@/lib/api";

const inp = "w-full bg-bg border border-border rounded-2xl px-4 py-3 font-sans text-sm text-textPri placeholder:text-textDim focus:outline-none focus:border-green transition-colors";
const lbl = "block font-sans text-xs font-semibold text-textDim uppercase tracking-widest mb-1.5";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState<1|2|3>(1);
  const [form, setForm] = useState({
    firstName: user?.name?.split(" ")[0] || "",
    lastName:  user?.name?.split(" ").slice(1).join(" ") || "",
    email:  user?.email || "",
    phone:  "",
    address:"",
    city:   "",
    zip:    "",
    notes:  "",
  });
  const [saving,   setSaving]   = useState(false);
  const [done,     setDone]     = useState(false);
  const [orderNum, setOrderNum] = useState("");
  const [err,      setErr]      = useState("");

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  // ── NO delivery fee at all ──
  const total = totalPrice;

  const canNext = form.firstName && form.email && form.phone && form.address && form.city;

  const placeOrder = async () => {
    setSaving(true); setErr("");
    try {
      const r = await api.post("/orders", {
        customerInfo:    { name: `${form.firstName} ${form.lastName}`.trim(), email: form.email, phone: form.phone },
        deliveryAddress: { street: form.address, city: form.city, zip: form.zip, notes: form.notes },
        items: items.map(i => ({
          product: i.id, name: i.name, image: i.image,
          price: i.price, quantity: i.quantity, amount: i.amount,
        })),
        paymentMethod: "cash",
        customerId: user?.id || null,
      });
      const d = await r.json();
      if (r.ok) { setOrderNum(d.order.orderNumber); setDone(true); clearCart(); }
      else setErr(d.error || "Failed to place order.");
    } catch { setErr("Network error. Please try again."); }
    setSaving(false);
  };

  // ── Order confirmed screen ──
  if (done) return (
    <>
      <Navbar />
      <main className="pt-24 min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 rounded-full bg-greenBg border border-green/20 flex items-center justify-center mx-auto mb-6">
            <span className="ms text-green" style={{ fontSize:"48px" }}>check_circle</span>
          </div>
          <h1 className="font-title text-3xl font-bold text-textPri mb-2">Order Confirmed!</h1>
          <p className="font-sans text-green font-bold text-lg mb-4">#{orderNum}</p>
          <p className="font-sans text-sm text-textSec mb-2">
            Confirmation sent to <span className="text-textPri">{form.email}</span>
          </p>
          <p className="font-sans text-sm text-textSec mb-8">
            We will be in touch shortly. Have your ID ready.
          </p>
          <Link href="/shop" className="inline-block bg-green text-bg px-8 py-4 rounded-2xl font-sans text-sm font-bold uppercase tracking-widest hover:bg-greenLo transition-colors">
            Continue Shopping
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );

  // ── Empty cart ──
  if (!items.length) return (
    <>
      <Navbar />
      <main className="pt-24 min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <span className="ms text-textDim block mb-4" style={{ fontSize:"64px" }}>shopping_cart</span>
          <p className="font-title text-2xl text-textPri mb-4">Cart is empty</p>
          <Link href="/shop" className="text-green font-sans text-sm hover:underline">Browse Products →</Link>
        </div>
      </main>
      <Footer />
    </>
  );

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-16 max-w-site mx-auto px-4 md:px-8">
        <div className="py-8">
          <h1 className="font-title text-3xl font-bold text-textPri">Checkout</h1>
          <p className="font-sans text-sm text-textSec mt-1">19+ valid ID required at delivery</p>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-8">
          {[{n:1,l:"Delivery"},{n:2,l:"Review"},{n:3,l:"Confirm"}].map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 ${step >= s.n ? "text-green" : "text-textDim"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-sans text-xs font-bold border-2 transition-all ${step > s.n ? "bg-green border-green text-bg" : step === s.n ? "border-green text-green" : "border-border text-textDim"}`}>
                  {step > s.n ? <span className="ms" style={{ fontSize:"14px" }}>check</span> : s.n}
                </div>
                <span className="hidden sm:block font-sans text-xs font-semibold uppercase tracking-wider">{s.l}</span>
              </div>
              {i < 2 && <div className={`flex-1 h-px w-6 ${step > s.n ? "bg-green" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">

            {/* ── Step 1: Delivery Info ── */}
            {step === 1 && (
              <div className="bg-surface border border-border rounded-3xl p-6 md:p-8 space-y-4">
                <h2 className="font-title text-xl font-semibold text-textPri mb-2">Delivery Information</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>First Name *</label>
                    <input required type="text" value={form.firstName} onChange={e => set("firstName", e.target.value)} className={inp} placeholder="John" />
                  </div>
                  <div>
                    <label className={lbl}>Last Name</label>
                    <input type="text" value={form.lastName} onChange={e => set("lastName", e.target.value)} className={inp} placeholder="Doe" />
                  </div>
                </div>

                <div>
                  <label className={lbl}>Email *</label>
                  <input required type="email" value={form.email} onChange={e => set("email", e.target.value)} className={inp} placeholder="your@email.com" />
                </div>

                <div>
                  <label className={lbl}>Phone *</label>
                  <input required type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} className={inp} placeholder="249-288-4892" />
                </div>

                <div>
                  <label className={lbl}>Street Address *</label>
                  <input required type="text" value={form.address} onChange={e => set("address", e.target.value)} className={inp} placeholder="123 Main St" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>City *</label>
                    <input required type="text" value={form.city} onChange={e => set("city", e.target.value)} className={inp} placeholder="Barrie" />
                  </div>
                  <div>
                    <label className={lbl}>Postal Code</label>
                    <input type="text" value={form.zip} onChange={e => set("zip", e.target.value)} className={inp} placeholder="L4M 1A1" />
                  </div>
                </div>

                <div>
                  <label className={lbl}>Notes</label>
                  <textarea rows={2} value={form.notes} onChange={e => set("notes", e.target.value)} className={`${inp} resize-none`} placeholder="Buzzer code, gate code..." />
                </div>

                {/* ── Enjoy message ── */}
                <div className="p-4 bg-greenBg border border-green/20 rounded-2xl text-center">
                  <p className="font-title text-base font-semibold text-green">Enjoy & Have a Nice Day 🌿</p>
                  <p className="font-sans text-xs text-textSec mt-1">Same day delivery · 19+ ID required</p>
                </div>

                <button
                  disabled={!canNext}
                  onClick={() => setStep(2)}
                  className="w-full bg-green text-bg py-4 rounded-2xl font-sans text-sm font-bold uppercase tracking-widest hover:bg-greenLo transition-colors disabled:opacity-40">
                  Continue to Review →
                </button>
              </div>
            )}

            {/* ── Step 2: Review ── */}
            {step === 2 && (
              <div className="bg-surface border border-border rounded-3xl p-6 md:p-8 space-y-4">
                <h2 className="font-title text-xl font-semibold text-textPri mb-2">Review Your Order</h2>

                {items.map(i => (
                  <div key={`${i.id}-${i.amount}`} className="flex gap-4 pb-4 border-b border-border">
                    <img src={i.image} alt={i.name} className="w-14 h-14 rounded-2xl object-cover bg-bg flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-sans text-sm font-semibold text-textPri line-clamp-1">{i.name}</p>
                      <p className="font-sans text-xs text-textDim uppercase mt-0.5">
                        {i.category}{i.amount ? ` · ${i.amount}` : ""} · qty {i.quantity}
                      </p>
                    </div>
                    <p className="font-title text-sm font-bold text-textPri">{(i.price * i.quantity).toFixed(2)}</p>
                  </div>
                ))}

                <div className="bg-bg rounded-2xl p-4 space-y-2 font-sans text-sm">
                  <div className="flex justify-between">
                    <span className="text-textSec">Deliver to</span>
                    <span className="text-textPri text-right ml-4 truncate max-w-[200px]">{form.address}, {form.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-textSec">Payment</span>
                    <span className="text-textPri">Cash · Enjoy & Have a Nice Day 🌿</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex-1 border border-border text-textSec py-4 rounded-2xl font-sans text-sm font-semibold hover:border-borderHi transition-colors">← Edit</button>
                  <button onClick={() => setStep(3)} className="flex-1 bg-green text-bg py-4 rounded-2xl font-sans text-sm font-bold uppercase tracking-widest hover:bg-greenLo transition-colors">Confirm →</button>
                </div>
              </div>
            )}

            {/* ── Step 3: Place Order ── */}
            {step === 3 && (
              <div className="bg-surface border border-border rounded-3xl p-6 md:p-8 space-y-5">
                <h2 className="font-title text-xl font-semibold text-textPri">Place Your Order</h2>
                <div className="p-5 bg-greenBg border border-green/20 rounded-2xl">
                  <p className="font-sans text-sm text-textSec leading-relaxed">
                    By placing this order you confirm you are <strong className="text-green">19+ years old</strong> and will have valid ID ready at delivery.
                    Total due: <strong className="text-textPri">{total.toFixed(2)}</strong>.
                  </p>
                </div>
                {err && (
                  <div className="p-4 bg-errorBg border border-error/20 rounded-2xl">
                    <p className="font-sans text-sm text-error">{err}</p>
                  </div>
                )}
                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="flex-1 border border-border text-textSec py-4 rounded-2xl font-sans text-sm font-semibold hover:border-borderHi transition-colors">← Back</button>
                  <button onClick={placeOrder} disabled={saving}
                    className="flex-1 bg-green text-bg py-4 rounded-2xl font-sans text-sm font-bold uppercase tracking-widest hover:bg-greenLo transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving && <span className="ms animate-spin" style={{ fontSize:"16px" }}>progress_activity</span>}
                    <span className="ms" style={{ fontSize:"18px" }}>local_shipping</span>
                    {saving ? "Placing..." : "Place Order"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Order Summary sidebar ── */}
          <div>
            <div className="sticky top-20 bg-surface border border-border rounded-3xl p-5 space-y-4">
              <h3 className="font-title text-base font-semibold text-textPri">Order Summary</h3>
              <div className="space-y-2.5 max-h-56 overflow-y-auto">
                {items.map(i => (
                  <div key={`${i.id}-${i.amount}`} className="flex justify-between gap-2 font-sans text-sm">
                    <span className="text-textSec truncate">
                      {i.name}{i.amount ? ` (${i.amount})` : ""} ×{i.quantity}
                    </span>
                    <span className="text-textPri font-semibold flex-shrink-0">{(i.price * i.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between font-sans text-sm">
                  <span className="text-textSec">Subtotal</span>
                  <span className="text-textPri">{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-sans text-sm">
                  <span className="text-textSec">Delivery</span>
                  <span className="text-green font-semibold">FREE</span>
                </div>
                <div className="flex justify-between font-title text-xl font-bold border-t border-border pt-3">
                  <span className="text-textPri">Total</span>
                  <span className="text-green">{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}