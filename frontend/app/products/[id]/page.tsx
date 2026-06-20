"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import { useCart } from "@/lib/CartContext";

interface AmountPrice { label: string; price: number; }
interface RawProduct {
  _id: string;
  name: string;
  category: string;
  type: string;
  price: number;
  rating?: number;
  description?: string;
  images?: { url: string; public_id?: string }[];
  thc?: number;
  amounts?: AmountPrice[];
  onSale?: boolean;
  salePrice?: number;
  stock?: number;
}

const fallbackImage = "https://images.unsplash.com/photo-1603909223429-69bb7101f420?w=1200&q=80";

const cleanAmount = (a: AmountPrice) => ({
  label: String(a.label || "").trim(),
  price: Number(a.price || 0),
});

export default function ProductDetailPage() {
  const params = useParams();
  const productId = Array.isArray(params?.id) ? params.id[0] : String(params?.id || "");
  const { addItem } = useCart();

  const [product, setProduct] = useState<RawProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [selected, setSelected] = useState<AmountPrice | null>(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    setError("");

    api.get(`/products/${productId}`)
      .then(async r => {
        if (!r.ok) throw new Error("Product not found");
        return r.json();
      })
      .then(d => setProduct(d.product || null))
      .catch(e => setError(e.message || "Product not found"))
      .finally(() => setLoading(false));
  }, [productId]);

  const amounts = useMemo(
    () => (product?.amounts || []).map(cleanAmount).filter(a => a.label && a.price > 0),
    [product?.amounts]
  );

  useEffect(() => {
    if (amounts.length) setSelected(amounts[0]);
    else setSelected(null);
  }, [amounts.length]);

  const images = product?.images?.length ? product.images : [{ url: fallbackImage }];
  const activeImage = images[selectedImage]?.url || images[0]?.url || fallbackImage;
  const basePrice = Number(product?.salePrice && product.salePrice > 0 ? product.salePrice : product?.price || 0);
  const activePrice = selected?.price || basePrice;
  const allPrices = amounts.length ? amounts.map(a => a.price) : [basePrice].filter(Boolean);
  const minPrice = allPrices.length ? Math.min(...allPrices) : 0;
  const maxPrice = allPrices.length ? Math.max(...allPrices) : 0;

  const handleAdd = () => {
    if (!product || !activePrice) return;

    addItem({
      id: product._id,
      name: product.name,
      price: activePrice,
      category: product.category,
      image: activeImage,
      amount: selected?.label || "1",
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <>
      <Navbar />
      <main className="pt-14 min-h-screen bg-bg">
        <div className="max-w-site mx-auto px-4 md:px-8 py-6 md:py-10">
          <Link href="/shop" className="inline-flex items-center gap-2 font-sans text-sm text-textSec hover:text-green transition-colors mb-6">
            <span className="ms" style={{fontSize:"18px"}}>arrow_back</span>
            Back to shop
          </Link>

          {loading ? (
            <div className="flex justify-center py-24">
              <span className="ms text-green animate-spin" style={{fontSize:"42px"}}>progress_activity</span>
            </div>
          ) : error || !product ? (
            <div className="bg-card border border-border rounded-3xl p-10 text-center">
              <p className="font-title text-2xl text-textPri mb-2">Product not found</p>
              <p className="font-sans text-textSec mb-6">This product may be unavailable or removed.</p>
              <Link href="/shop" className="inline-flex bg-green text-bg rounded-xl px-5 py-3 font-sans text-sm font-bold uppercase tracking-wider">
                Go to shop
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-start">
              <section className="space-y-4">
                <div className="relative bg-card border border-border rounded-3xl overflow-hidden shadow-2xl shadow-black/30">
                  <img
                    src={activeImage}
                    alt={product.name}
                    className="w-full aspect-square object-cover"
                    onError={e => { (e.target as HTMLImageElement).src = fallbackImage; }}
                  />
                  {product.onSale && (
                    <span className="absolute top-4 left-4 bg-red-500 text-white rounded-full px-3 py-1 font-sans text-xs font-bold uppercase tracking-wider">
                      Sale
                    </span>
                  )}
                </div>

                {images.length > 1 && (
                  <div className="grid grid-cols-5 gap-2">
                    {images.map((img, i) => (
                      <button
                        key={`${img.url}-${i}`}
                        onClick={() => setSelectedImage(i)}
                        className={`rounded-2xl overflow-hidden border transition-all ${selectedImage === i ? "border-green" : "border-border hover:border-borderHi"}`}
                      >
                        <img src={img.url} alt="" className="w-full aspect-square object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </section>

              <section className="bg-card border border-border rounded-3xl p-5 md:p-8 shadow-2xl shadow-black/20">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="bg-green/10 text-green border border-green/20 rounded-full px-3 py-1 font-sans text-xs font-bold uppercase tracking-wider">
                    {product.category}
                  </span>
                  <span className="bg-surface border border-border text-textSec rounded-full px-3 py-1 font-sans text-xs font-bold uppercase tracking-wider">
                    {product.type}
                  </span>
                  {Number(product.thc || 0) > 0 && (
                    <span className="bg-surface border border-border text-textSec rounded-full px-3 py-1 font-sans text-xs font-bold uppercase tracking-wider">
                      THC {product.thc}%
                    </span>
                  )}
                </div>

                <h1 className="font-title text-3xl md:text-5xl font-bold text-textPri leading-tight mb-4">
                  {product.name}
                </h1>

                <div className="bg-bg/60 border border-border rounded-2xl p-4 mb-6">
                  <p className="font-sans text-[10px] text-textDim uppercase tracking-widest mb-1">
                    {amounts.length ? "Selected Price" : minPrice !== maxPrice ? "Price" : "Total"}
                  </p>
                  <p className="font-title text-3xl font-bold text-textPri">
                    {activePrice || (minPrice && maxPrice ? `${minPrice} – ${maxPrice}` : "")}
                  </p>
                </div>

                {amounts.length > 0 && (
                  <div className="mb-6">
                    <p className="font-sans text-xs font-bold text-textDim uppercase tracking-widest mb-3">
                      Choose Amount
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {amounts.map(a => (
                        <button
                          key={a.label}
                          onClick={() => setSelected(a)}
                          className={`rounded-2xl border p-4 text-left transition-all ${selected?.label === a.label ? "bg-green text-bg border-green shadow-lg shadow-green/20" : "bg-surface border-border text-textSec hover:border-green hover:text-green"}`}
                        >
                          <span className="block font-title text-lg font-bold">{a.label}</span>
                          <span className="block font-sans text-xs opacity-80 mt-1">{a.price}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleAdd}
                  disabled={!activePrice}
                  className={`w-full rounded-2xl px-5 py-4 font-sans text-sm font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed ${added ? "bg-greenBg border border-green text-green" : "bg-green text-bg hover:bg-greenLo active:scale-[0.99] shadow-xl shadow-green/20"}`}
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <span className="ms" style={{fontSize:"18px"}}>{added ? "check" : "add_shopping_cart"}</span>
                    {added ? "Added to cart" : "Add to cart"}
                  </span>
                </button>

                <div className="mt-8 pt-6 border-t border-border">
                  <h2 className="font-title text-xl font-bold text-textPri mb-3">Product Details</h2>
                  <div className="font-sans text-sm md:text-base text-textSec leading-7 whitespace-pre-line">
                    {product.description || "No description available."}
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
