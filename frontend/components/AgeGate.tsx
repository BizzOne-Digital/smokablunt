"use client";
import { useEffect, useState } from "react";

export default function AgeGate() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const verified = sessionStorage.getItem("ageVerified");
    if (!verified) setShow(true);
  }, []);

  const allow = () => { sessionStorage.setItem("ageVerified", "1"); setShow(false); };
  const deny  = () => { window.location.href = "https://www.google.com"; };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-surface border border-border rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-green/10 border border-green/20 flex items-center justify-center mx-auto mb-5">
          <span className="ms text-green" style={{ fontSize: "40px" }}>verified_user</span>
        </div>

        <h2 className="font-title text-2xl font-bold text-textPri mb-2">Are you 19 or older?</h2>
        <p className="font-sans text-sm text-textSec leading-relaxed mb-6">
          You must be 19 years of age or older to view this page.
          Please verify your age to enter.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={allow}
            className="w-full bg-green text-bg py-4 rounded-2xl font-sans text-sm font-bold uppercase tracking-widest hover:bg-greenLo transition-colors"
          >
            I am 19 or older
          </button>
          <button
            onClick={deny}
            className="w-full bg-surface border border-border text-textSec py-4 rounded-2xl font-sans text-sm font-semibold hover:border-borderHi transition-colors"
          >
            I am under 19
          </button>
        </div>

        <p className="font-sans text-[10px] text-textDim mt-4 leading-relaxed">
          By entering this site you confirm you are of legal age in your province to purchase cannabis products.
        </p>
      </div>
    </div>
  );
}