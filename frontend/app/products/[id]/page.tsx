"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import { useCart } from "@/lib/CartContext";

interface AmountPrice { label: string; price: number; }
interface Product {
  _id: string;
  name: string;
  category: string;
  type: string;
  price: number;
  rating: number;
  description: string;
  images: { url: string }[];
  thc: number;
  amounts?: AmountPrice[];
  onSale?: boolean;
  salePrice?: number;
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
  const out: AmountPrice[] = [];
  description.split(/\n+/).forEach(line => {
    const m = line.trim().match(/^(1\/4|1\/2|\d+\s*oz|oz|\d+)\s*[-:]?\s*\$?(\d+(?:\.\d+)?)$/i);
    if (!m) return;
    const label = m[1].toLowerCase().replace(/\s+/g, "");
    out.push({ label: label === "oz" ? "oz" : label, price: Number(m[2]) });
  });
  return out;
};

const availableAmountsFor = (p: Product): AmountPrice[] => {
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

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedAmount, setSelectedAmount] = useState<AmountPrice | null>(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${params.id}`)
      .then(r => r.json())
      .then(d => setProduct(d.product || null))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  const amounts = useMemo(() => product ? availableAmountsFor(product) : [], [product]);

  useEffect(() => {
    if (amounts.length) setSelectedAmount(amounts[0]);
  }, [amounts]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 flex items-center justify-center">
          <span className="ms text-green animate-spin" style={{ fontSize: "44px" }}>progress_activity</span>
        </main>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 max-w-site mx-auto px-4 md:px-8 text-center">
          <div className="bg-card border border-border rounded-3xl p-10">
            <h1 className="font-title text-3xl font-bold text-textPri mb-3">Product not found</h1>
            <Link href="/shop" className="text-green font-sans text-sm hover:underline">Back to shop</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const images = product.images?.length ? product.images : [{ url: "https://images.unsplash.com/photo-1603909223429-69bb7101f420?w=900&q=80" }];
  const finalPrice = selectedAmount?.price || (product.salePrice && product.salePrice > 0 ? product.salePrice : product.price);

  const addToCart = () => {
    addItem({
      id: product._id,
      name: product.name,
      price: finalPrice,
      category: product.category,
      image: images[0]?.url || "",
      amount: selectedAmount?.label || "1",
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-16 max-w-site mx-auto px-4 md:px-8">
        <Link href="/shop" className="inline-flex items-center gap-1 text-green font-sans text-sm hover:underline mb-6">
          <span className="ms" style={{ fontSize: "16px" }}>arrow_back</span>
          Back to shop
        </Link>

        <section className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-3">
            <div className="bg-card border border-border rounded-3xl overflow-hidden aspect-square">
              <img
                src={images[selectedImage]?.url}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1603909223429-69bb7101f420?w=900&q=80"; }}
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((img, i) => (
                  <button
                    key={`${img.url}-${i}`}
                    type="button"
                    onClick={() => setSelectedImage(i)}
                    className={`aspect-square rounded-2xl overflow-hidden border ${selectedImage === i ? "border-green" : "border-border"}`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-3xl p-5 md:p-8 h-fit">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-green/10 text-green px-3 py-1 rounded-full font-sans text-[10px] font-bold uppercase tracking-widest">{product.category}</span>
              <span className="bg-surface border border-border text-textSec px-3 py-1 rounded-full font-sans text-[10px] font-bold uppercase tracking-widest">{product.type}</span>
              {product.type?.toLowerCase() === "sale" && <span className="bg-red-500 text-white px-3 py-1 rounded-full font-sans text-[10px] font-bold uppercase tracking-widest">Sale</span>}
              {product.type?.toLowerCase() === "promo" && <span className="bg-green text-bg px-3 py-1 rounded-full font-sans text-[10px] font-bold uppercase tracking-widest">Promo</span>}
            </div>

            <h1 className="font-title text-3xl md:text-5xl font-bold text-textPri leading-tight mb-3">{product.name}</h1>
            {product.thc > 0 && <p className="font-sans text-sm text-textSec mb-6">THC: {product.thc}%</p>}

            {amounts.length > 0 ? (
              <div className="mb-6">
                <p className="font-sans text-xs font-semibold text-textDim uppercase tracking-widest mb-3">Select Amount / Quantity</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {amounts.map(a => (
                    <button
                      key={a.label}
                      type="button"
                      onClick={() => setSelectedAmount(a)}
                      className={`rounded-2xl border p-3 text-left transition-all ${selectedAmount?.label === a.label ? "bg-green text-bg border-green" : "bg-bg border-border text-textSec hover:border-green hover:text-green"}`}
                    >
                      <span className="block font-sans text-sm font-bold uppercase">{a.label}</span>
                      <span className="block font-title text-lg font-bold mt-1">{a.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="flex items-center justify-between border-y border-border py-5 mb-6">
              <div>
                <p className="font-sans text-[10px] text-textDim uppercase tracking-widest">Total</p>
                <p className="font-title text-3xl font-bold text-textPri">{finalPrice}</p>
              </div>
              <button
                type="button"
                onClick={addToCart}
                className={`inline-flex items-center gap-2 px-7 py-4 rounded-2xl font-sans text-xs font-bold uppercase tracking-widest transition-all ${added ? "bg-greenBg border border-green text-green" : "bg-green text-bg hover:bg-greenLo shadow-xl shadow-green/20"}`}
              >
                <span className="ms" style={{ fontSize: "18px" }}>{added ? "check" : "add_shopping_cart"}</span>
                {added ? "Added" : "Add to Cart"}
              </button>
            </div>

            {product.description && (
              <div>
                <p className="font-sans text-xs font-semibold text-textDim uppercase tracking-widest mb-3">Description</p>
                <div className="font-sans text-sm md:text-base text-textSec leading-relaxed whitespace-pre-line">
                  {product.description}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
