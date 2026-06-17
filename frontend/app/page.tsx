"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { api } from "@/lib/api";

interface Product { _id:string; name:string; category:string; type:string; price:number; rating:number; description:string; images:{url:string}[]; thc:number; }

const norm = (p: Product) => ({ id:p._id, name:p.name, category:p.category, type:p.type, price:p.price, rating:p.rating||0, description:p.description, image:p.images?.[0]?.url||"", thc:p.thc||0 });

export default function Home() {
  const [featured, setFeatured] = useState<ReturnType<typeof norm>[]>([]);
  const [loading, setLoading] = useState(true);
  const [slide, setSlide] = useState(0);
  const slideTimer = useRef<ReturnType<typeof setInterval>|null>(null);

  const nextSlide = useCallback(() => setSlide(s => (s + 1) % 3), []);
  const prevSlide = useCallback(() => setSlide(s => (s - 1 + 3) % 3), []);

  useEffect(() => {
    slideTimer.current = setInterval(nextSlide, 5000);
    return () => { if (slideTimer.current) clearInterval(slideTimer.current); };
  }, [nextSlide]);

  useEffect(() => {
    api.get("/products?featured=true&type=flowers")
      .then(r => r.json())
      .then(d => { if (d.products?.length) setFeatured(d.products.slice(0,3).map(norm)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <main className="pt-14">

        {/* ── Hero ──────────────────────────────────────────────── */}
        <section className="relative min-h-[92vh] flex items-center overflow-hidden">
          <div className="absolute inset-0">
            {/* Mobile banner */}
            <img
              src="/banner2.png"
              alt=""
              className="block md:hidden w-full h-full object-cover object-center"
            />
            {/* Desktop banner */}
            <img
              src="/banner.png"
              alt=""
              className="hidden md:block w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/85 to-bg/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-bg/60 via-transparent to-transparent" />
          </div>
          <div className="relative z-10 max-w-site mx-auto px-4 md:px-8 py-16 md:py-24 w-full">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-green/10 border border-green/20 text-green px-4 py-2 rounded-full font-sans text-xs font-semibold uppercase tracking-widest mb-6">
                <span className="w-1.5 h-1.5 bg-green rounded-full animate-pulse" />
                Premium Online Dispensary
              </div>
              <h1 className="font-title text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight text-textPri mb-6">
                Curated Cannabis,
                <span className="block text-green">Delivered.</span>
              </h1>
              <p className="font-sans text-lg text-textSec leading-relaxed mb-10 max-w-lg">
                Artisan flowers, edibles, and concentrates. Hand-picked for potency, flavour, and effect — delivered fast and discreet.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/shop" className="bg-green text-bg px-8 py-4 rounded-2xl font-sans text-sm font-bold uppercase tracking-widest hover:bg-greenLo transition-colors shadow-xl shadow-green/20">
                  Shop Now
                </Link>
                <Link href="/contact" className="bg-surfaceHi border border-border text-textPri px-8 py-4 rounded-2xl font-sans text-sm font-bold uppercase tracking-widest hover:border-borderHi transition-colors">
                  Delivery Info
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats ─────────────────────────────────────────────── */}
        <section className="bg-surface border-y border-border">
          <div className="max-w-site mx-auto px-4 md:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[["100+","Strains"],["60–90","Min Delivery"],["19+","Age Verified"],["5★","Rated"]].map(([v,l])=>(
              <div key={l} className="text-center">
                <p className="font-title text-3xl font-bold text-green">{v}</p>
                <p className="font-sans text-xs text-textSec uppercase tracking-wider mt-1">{l}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Featured Products ──────────────────────────────────── */}
        <section className="max-w-site mx-auto px-4 md:px-8 py-20">
          <div className="flex justify-between items-end mb-10">
            <div>
              <span className="font-sans text-xs font-semibold text-green uppercase tracking-widest block mb-1.5">Hand-Picked</span>
              <h2 className="font-title text-3xl md:text-4xl font-bold text-textPri">Featured Flowers</h2>
            </div>
            <Link href="/shop?type=flowers" className="hidden sm:flex items-center gap-1 font-sans text-sm text-green hover:underline">
              View All <span className="ms" style={{fontSize:"16px"}}>arrow_forward</span>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[1,2,3].map(i => <div key={i} className="h-96 bg-card border border-border rounded-3xl animate-pulse"/>)}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map(p => <ProductCard key={p.id} p={p} />)}
            </div>
          ) : (
            <div className="text-center py-20 bg-card border border-border rounded-3xl">
              <span className="ms text-textDim block mb-3" style={{fontSize:"48px"}}>inventory_2</span>
              <p className="font-sans text-textSec">No products yet. <Link href="/admin" className="text-green hover:underline">Add from admin →</Link></p>
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link href="/shop?type=flowers" className="font-sans text-sm text-green hover:underline">View all flowers →</Link>
          </div>
        </section>

        {/* ── Categories ────────────────────────────────────────── */}
        <section className="max-w-site mx-auto px-4 md:px-8 pb-20">
          <span className="font-sans text-xs font-semibold text-green uppercase tracking-widest block mb-1.5">Browse</span>
          <h2 className="font-title text-3xl md:text-4xl font-bold text-textPri mb-10">Shop By Category</h2>
          <div className="grid grid-cols-3 gap-3 md:gap-5">
            {[
              { href:"/shop?type=sale",                    img:"/product1.png" },
              { href:"/shop?type=pre-rolls",               img:"/product2.png" },
              { href:"/shop?type=promo",                   img:"/product3.png" },
              { href:"/shop?type=concentrates",            img:"/product4.png" },
              { href:"/shop?type=edibles",                 img:"/product5.png" },
              { href:"/shop?type=accessories",             img:"/product6.png" },
              { href:"/shop?type=flowers&strain=sativa",   img:"/product7.png" },
              { href:"/shop?type=flowers&strain=indica",   img:"/product8.png" },
              { href:"/shop?type=flowers&strain=hybrid",   img:"/product9.png" },
            ].map((c, i) => (
              <Link key={i} href={c.href} className="group relative overflow-hidden rounded-2xl md:rounded-3xl aspect-square block bg-surface border border-border hover:border-green hover:scale-[1.02] transition-all duration-300">
                <img
                  src={c.img}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </Link>
            ))}
          </div>
        </section>



        {/* ── Promo Slider ────────────────────────────────────── */}
        <section className="max-w-site mx-auto px-4 md:px-8 pb-20">
          <div className="relative overflow-hidden rounded-3xl bg-surface border border-border">
            {/* Slides */}
            <div className="relative w-full aspect-[16/6] md:aspect-[16/5]">
              {["/slider1.png", "/slider2.png", "/slider3.png"].map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === slide ? "opacity-100" : "opacity-0"}`}
                />
              ))}
            </div>

            {/* Navigation arrows */}
            <button
              onClick={() => { prevSlide(); if(slideTimer.current) { clearInterval(slideTimer.current); slideTimer.current = setInterval(nextSlide, 5000); } }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 border border-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-all z-20">
              <span className="ms" style={{ fontSize: "20px" }}>chevron_left</span>
            </button>
            <button
              onClick={() => { nextSlide(); if(slideTimer.current) { clearInterval(slideTimer.current); slideTimer.current = setInterval(nextSlide, 5000); } }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 border border-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-all z-20">
              <span className="ms" style={{ fontSize: "20px" }}>chevron_right</span>
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {[0, 1, 2].map(i => (
                <button
                  key={i}
                  onClick={() => { setSlide(i); if(slideTimer.current) { clearInterval(slideTimer.current); slideTimer.current = setInterval(nextSlide, 5000); } }}
                  className={`h-2 rounded-full transition-all duration-300 ${i === slide ? "bg-green w-6" : "bg-white/40 w-2 hover:bg-white/70"}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── Delivery CTA ──────────────────────────────────────── */}
        <section className="max-w-site mx-auto px-4 md:px-8 pb-20">
          <div className="bg-surface border border-border rounded-3xl p-8 md:p-12 grid md:grid-cols-2 gap-8 items-center overflow-hidden relative">
            <div className="absolute right-0 top-0 w-64 h-64 bg-green/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <span className="font-sans text-xs font-semibold text-green uppercase tracking-widest block mb-2">Fast & Discreet</span>
              <h2 className="font-title text-3xl font-bold text-textPri mb-4">Premium Delivery to Your Door</h2>
              <p className="font-sans text-sm text-textSec leading-relaxed mb-6">Serving Barrie and surrounding areas. Free delivery on qualifying orders.</p>
              <Link href="/contact" className="inline-flex items-center gap-2 bg-green text-bg px-6 py-3 rounded-2xl font-sans text-sm font-bold uppercase tracking-widest hover:bg-greenLo transition-colors">
                <span className="ms" style={{fontSize:"18px"}}>local_shipping</span>Check Delivery Area
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 relative z-10">
              {[
                {icon:"timer",         t:"Fast Delivery",    s:"Same day service"},
                {icon:"local_shipping",t:"Free Delivery",   s:"On qualifying orders"},
                {icon:"lock",          t:"Discreet",        s:"Plain packaging"},
                {icon:"verified",      t:"19+ Verified",    s:"ID required at door"},
              ].map(f => (
                <div key={f.t} className="bg-bg border border-border rounded-2xl p-4 hover:border-borderHi transition-colors">
                  <span className="ms text-green block mb-2">{f.icon}</span>
                  <p className="font-sans text-sm font-semibold text-textPri">{f.t}</p>
                  <p className="font-sans text-xs text-textSec mt-0.5">{f.s}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}