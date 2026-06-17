"use client";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TIERS = [
  { spend:100,  reward:"1g Hash",   icon:"🌿" },
  { spend:150,  reward:"2g Hash",   icon:"🌿🌿" },
  { spend:200,  reward:"2.5g Hash", icon:"🌿🌿" },
  { spend:250,  reward:"3.5g Hash", icon:"🌿🌿🌿" },
  { spend:300,  reward:"4.5g Hash", icon:"🌿🌿🌿" },
  { spend:350,  reward:"5.5g Hash", icon:"🌿🌿🌿🌿" },
  { spend:400,  reward:"7g Hash",   icon:"🌿🌿🌿🌿🌿" },
];

export default function PromoPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20 pb-16 max-w-site mx-auto px-4 md:px-8">

        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="font-sans text-xs font-semibold text-green uppercase tracking-widest block mb-3">Rewards</span>
          <h1 className="font-title text-4xl md:text-5xl font-bold text-textPri mb-4">Promo Deals</h1>
          <p className="font-sans text-sm text-textSec leading-relaxed">
            Every 9th order gets a reward based on your order value. The more you spend, the more you get. Free hash added automatically.
          </p>
        </div>

        {/* Loyalty Card */}
        <div className="bg-surface border border-green/20 rounded-3xl p-6 md:p-10 mb-12 max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-green/10 border border-green/20 flex items-center justify-center mx-auto mb-4">
            <span className="ms text-green" style={{ fontSize:"40px" }}>loyalty</span>
          </div>
          <h2 className="font-title text-2xl font-bold text-textPri mb-2">Every 9th Order — Free Reward</h2>
          <p className="font-sans text-sm text-textSec mb-6">
            Place 8 orders and your 9th automatically includes a free hash bonus based on what you spend on that order.
          </p>
          <div className="inline-flex items-center gap-2 bg-green/10 border border-green/20 text-green px-5 py-2.5 rounded-full font-sans text-xs font-semibold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 bg-green rounded-full animate-pulse" />
            Automatically Applied at Checkout
          </div>
        </div>

        {/* Spend Tiers */}
        <div className="max-w-2xl mx-auto">
          <h3 className="font-title text-xl font-bold text-textPri mb-6 text-center">Reward Tiers — Order Value</h3>
          <div className="space-y-3">
            {TIERS.map((t, i) => (
              <div key={t.spend} className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${i === 0 ? "border-green bg-greenBg" : "border-border bg-surface hover:border-borderHi"}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg ${i === 0 ? "bg-green/20" : "bg-bg border border-border"}`}>
                    {t.icon}
                  </div>
                  <div>
                    <p className="font-title text-base font-bold text-textPri">Spend {t.spend}+</p>
                    <p className="font-sans text-xs text-textSec mt-0.5">On your 9th order</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-title text-sm font-bold text-green">+ {t.reward}</p>
                  <p className="font-sans text-[10px] text-textDim uppercase tracking-wider mt-0.5">Free</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Refer a Friend */}
        <div className="max-w-2xl mx-auto mt-12">
          <div className="bg-surface border border-border rounded-3xl p-6 md:p-8 text-center">
            <span className="ms text-green block mb-3" style={{ fontSize:"36px" }}>group_add</span>
            <h3 className="font-title text-xl font-bold text-textPri mb-2">Refer a Friend</h3>
            <p className="font-sans text-sm text-textSec leading-relaxed mb-4">
              They order. You save. Get 20 off your next order when your friend places their first order.
            </p>
            <p className="font-sans text-xs text-textDim">Contact us to set up your referral.</p>
          </div>
        </div>

        {/* Happy Hour */}
        <div className="max-w-2xl mx-auto mt-6">
          <div className="bg-surface border border-yellow-500/20 rounded-3xl p-6 md:p-8 text-center">
            <span className="ms text-yellow-400 block mb-3" style={{ fontSize:"36px" }}>schedule</span>
            <h3 className="font-title text-xl font-bold text-textPri mb-2">Happy Hour</h3>
            <p className="font-sans text-sm text-textSec leading-relaxed mb-2">
              Daily from <strong className="text-textPri">3 PM – 5 PM</strong>
            </p>
            <p className="font-title text-3xl font-bold text-yellow-400 mb-2">10 off</p>
            <p className="font-sans text-sm text-textSec">All products. Order during the window. Save instantly.</p>
          </div>
        </div>

        <div className="text-center mt-10">
          <Link href="/shop" className="inline-flex items-center gap-2 bg-green text-bg px-8 py-4 rounded-2xl font-sans text-sm font-bold uppercase tracking-widest hover:bg-greenLo transition-colors">
            <span className="ms" style={{ fontSize:"18px" }}>shopping_bag</span>
            Shop Now
          </Link>
        </div>

      </main>
      <Footer />
    </>
  );
}