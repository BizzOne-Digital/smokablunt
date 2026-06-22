"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";

const HOURS = [
  { day:"Monday",    h:"10:00 AM – 6:00 PM", d:1 },
  { day:"Tuesday",   h:"10:00 AM – 8:00 PM", d:2 },
  { day:"Wednesday", h:"10:00 AM – 8:00 PM", d:3 },
  { day:"Thursday",  h:"10:00 AM – 8:00 PM", d:4 },
  { day:"Friday",    h:"10:00 AM – 8:00 PM", d:5 },
  { day:"Saturday",  h:"10:00 AM – 8:00 PM", d:6 },
  { day:"Sunday",    h:"12:00 PM – 8:00 PM", d:0 },
];

export default function ContactPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [today, setToday]   = useState(0);
  const [form, setForm]     = useState({ name:"", email:"", phone:"", message:"" });
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(false);
  const [err, setErr]         = useState("");

  useEffect(() => {
    const now = new Date();
    const h = now.getHours(), d = now.getDay();
    setToday(d);
    if (d===0) setIsOpen(h>=12&&h<20);
    else if (d===1) setIsOpen(h>=10&&h<18);
    else setIsOpen(h>=10&&h<20);
  }, []);

  const f = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const send = async (e: React.FormEvent) => {
    e.preventDefault(); setSending(true); setErr("");
    try {
      const r = await api.post("/contact", form);
      if (r.ok) { setSent(true); setForm({ name:"", email:"", phone:"", message:"" }); }
      else { const d = await r.json(); setErr(d.error || "Failed to send."); }
    } catch { setErr("Network error. Please try again."); }
    setSending(false);
  };

  const inp = "w-full bg-bg border border-border rounded-2xl px-4 py-3 font-sans text-sm text-textPri placeholder:text-textDim focus:outline-none focus:border-green transition-colors";
  const lbl = "block font-sans text-xs font-semibold text-textDim uppercase tracking-widest mb-1.5";

  return (
    <>
      <Navbar />
      <main className="pt-14">
        {/* Hero */}
        <div className="relative h-64 md:h-80 flex items-end overflow-hidden">
          <img className="absolute inset-0 w-full h-full object-cover opacity-20" src="https://images.unsplash.com/photo-1530530824905-5c4dd436aefc?w=1400&q=80" alt="" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
          <div className="relative z-10 max-w-site mx-auto px-4 md:px-8 pb-10 w-full">
            <span className="font-sans text-xs font-semibold text-green uppercase tracking-widest block mb-2">Get In Touch</span>
            <h1 className="font-title text-4xl md:text-5xl font-bold text-textPri">Contact & Delivery</h1>
          </div>
        </div>

        <div className="max-w-site mx-auto px-4 md:px-8 py-10 space-y-5">

          {/* Contact + Hours grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Contact card */}
            <div className="bg-surface border border-border rounded-3xl p-6 md:p-8">
              <h2 className="font-title text-xl font-semibold text-textPri mb-6">Direct Contact</h2>
              <ul className="space-y-5">
                {[
                  { icon:"call",         lbl:"Phone",    val:"249-288-4892",  href:"tel:2492884892" },
                  { icon:"sms",          lbl:"Text",     val:"249-288-4892",  href:"sms:2492884892" },
                  { icon:"shopping_bag", lbl:"Order Online", val:"Order on our website", href:"/shop" },
                  { icon:"location_on",  lbl:"Location", val:"Barrie, Ontario", href:"https://maps.google.com/?q=Barrie+Ontario" },
                ].map(c => (
                  <li key={c.lbl} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-greenBg border border-green/20 flex items-center justify-center flex-shrink-0">
                      <span className="ms text-green" style={{ fontSize: "20px" }}>{c.icon}</span>
                    </div>
                    <div>
                      <p className="font-sans text-xs text-textDim uppercase tracking-wider mb-0.5">{c.lbl}</p>
                      <a href={c.href} target="_blank" rel="noopener noreferrer" className="font-sans text-sm text-textPri hover:text-green transition-colors">{c.val}</a>
                    </div>
                  </li>
                ))}
              </ul>
              <a href="https://maps.google.com/?q=Barrie+Ontario" target="_blank" rel="noopener noreferrer"
                className="mt-8 w-full bg-green text-bg py-3.5 rounded-2xl font-sans text-sm font-bold uppercase tracking-widest hover:bg-greenLo transition-colors flex items-center justify-center gap-2">
                <span className="ms" style={{ fontSize: "18px" }}>near_me</span>Get Directions
              </a>
            </div>

            {/* Hours card */}
            <div className="bg-surface border border-border rounded-3xl p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-title text-xl font-semibold text-textPri">Operating Hours</h2>
                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-sans text-xs font-semibold ${isOpen ? "bg-greenBg border border-green/20 text-green" : "bg-errorBg border border-error/20 text-error"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? "bg-green animate-pulse" : "bg-error"}`} />
                  {isOpen ? "Open Now" : "Closed"}
                </span>
              </div>
              <ul className="space-y-2.5">
                {HOURS.map(h => (
                  <li key={h.day} className={`flex justify-between font-sans text-sm pb-2.5 border-b border-border ${h.d === today ? "text-green font-semibold" : ""}`}>
                    <span className={h.d === today ? "text-green" : "text-textSec"}>{h.day}</span>
                    <span className={h.d === today ? "text-green font-bold" : "text-textPri"}>{h.h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Delivery areas */}
          <div className="bg-surface border border-border rounded-3xl p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="font-sans text-xs font-semibold text-green uppercase tracking-widest block mb-2">Coverage</span>
                <h2 className="font-title text-2xl font-bold text-textPri mb-4">Delivery Areas</h2>
                <p className="font-sans text-sm text-textSec leading-relaxed mb-6">We offer discreet, premium delivery to Barrie and surrounding communities.</p>
                <ul className="space-y-3 mb-6">
                  {["Barrie", "Surrounding Cities"].map(a => (
                    <li key={a} className="flex items-center gap-3">
                      <span className="ms text-green" style={{ fontSize: "18px" }}>check_circle</span>
                      <span className="font-sans text-sm text-textPri">{a}</span>
                    </li>
                  ))}
                </ul>
                <div className="space-y-3">
                  <div className="p-4 bg-greenBg border border-green/20 rounded-2xl">
                    <p className="font-sans text-xs font-semibold text-green uppercase tracking-wider mb-1">Barrie</p>
                    <p className="font-sans text-sm text-textSec">Minimum order <span className="text-green font-bold">50</span> for free delivery. Under minimum: <span className="text-green font-bold">5–10</span> delivery fee.</p>
                  </div>
                  <div className="p-4 bg-greenBg border border-green/20 rounded-2xl">
                    <p className="font-sans text-xs font-semibold text-green uppercase tracking-wider mb-1">Surrounding Cities</p>
                    <p className="font-sans text-sm text-textSec">Minimum order <span className="text-green font-bold">70–100</span> for free delivery. Under minimum: <span className="text-green font-bold">10–20</span> delivery fee.</p>
                  </div>
                </div>
              </div>
              <div className="relative h-64 rounded-2xl overflow-hidden bg-bg border border-border flex items-center justify-center">
                <img className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale" src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&q=80" alt="map" />
                <div className="absolute inset-0 bg-green/5" />
                <div className="relative">
                  <span className="absolute inset-0 w-6 h-6 bg-green/40 rounded-full animate-ping" />
                  <span className="relative flex w-6 h-6 bg-green rounded-full border-4 border-bg shadow-lg shadow-green/50" />
                </div>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="bg-surface border border-border rounded-3xl p-6 md:p-8">
            <h2 className="font-title text-xl font-semibold text-textPri mb-1">Send Us a Message</h2>
            <p className="font-sans text-sm text-textSec mb-6">Questions about an order or product? We respond promptly.</p>

            {sent ? (
              <div className="flex flex-col items-center py-12 text-center gap-3">
                <div className="w-16 h-16 rounded-full bg-greenBg border border-green/20 flex items-center justify-center">
                  <span className="ms text-green" style={{ fontSize: "32px" }}>check_circle</span>
                </div>
                <h3 className="font-title text-xl font-semibold text-textPri">Message Sent!</h3>
                <p className="font-sans text-sm text-textSec">We&apos;ll get back to you shortly.</p>
                <button onClick={() => setSent(false)} className="text-green font-sans text-sm hover:underline mt-2">Send another message</button>
              </div>
            ) : (
              <form onSubmit={send} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className={lbl}>Name *</label><input required type="text" value={form.name} onChange={e => f("name", e.target.value)} className={inp} placeholder="Your name" /></div>
                <div><label className={lbl}>Email *</label><input required type="email" value={form.email} onChange={e => f("email", e.target.value)} className={inp} placeholder="your@email.com" /></div>
                <div><label className={lbl}>Phone</label><input type="tel" value={form.phone} onChange={e => f("phone", e.target.value)} className={inp} placeholder="249-288-4892" /></div>
                <div className="md:col-span-2"><label className={lbl}>Message *</label><textarea required rows={4} value={form.message} onChange={e => f("message", e.target.value)} className={`${inp} resize-none`} placeholder="How can we help?" /></div>
                {err && <div className="md:col-span-2 p-3 bg-errorBg border border-error/20 rounded-2xl"><p className="font-sans text-sm text-error">{err}</p></div>}
                <div className="md:col-span-2">
                  <button type="submit" disabled={sending} className="inline-flex items-center gap-2 bg-green text-bg px-8 py-3.5 rounded-2xl font-sans text-sm font-bold uppercase tracking-widest hover:bg-greenLo transition-colors disabled:opacity-50">
                    {sending && <span className="ms animate-spin" style={{ fontSize: "16px" }}>progress_activity</span>}
                    <span className="ms" style={{ fontSize: "16px" }}>send</span>
                    {sending ? "Sending..." : "Send Message"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}