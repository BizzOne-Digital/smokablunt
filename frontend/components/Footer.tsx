import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border mt-20">
      <div className="max-w-site mx-auto px-4 md:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="mb-3">
            <Image
              src="/logo1.png"
              alt="Logo"
              width={180}
              height={60}
              className="h-14 w-auto"
            />
          </div>

          <p className="font-sans text-sm text-textSec leading-relaxed">
            Premium cannabis delivery. Flowers, edibles, and concentrates
            delivered discreetly.
          </p>

          <div className="flex gap-3 mt-5">
            <a
              href="tel:2492884892"
              className="w-9 h-9 rounded-xl bg-surfaceHi border border-border flex items-center justify-center text-textSec hover:text-green hover:border-green transition-all"
            >
              <span className="ms" style={{ fontSize: "18px" }}>
                call
              </span>
            </a>

            <a
              href="mailto:smokablunt4you@gmail.com"
              className="w-9 h-9 rounded-xl bg-surfaceHi border border-border flex items-center justify-center text-textSec hover:text-green hover:border-green transition-all"
            >
              <span className="ms" style={{ fontSize: "18px" }}>
                mail
              </span>
            </a>
          </div>
        </div>

        <div>
          <p className="font-sans text-xs font-semibold text-green uppercase tracking-widest mb-4">
            Shop
          </p>

          <ul className="space-y-2.5">
            {[
              ["All Products", "/shop"],
              ["Flowers", "/shop?type=flowers"],
              ["Edibles", "/shop?type=edibles"],
              ["Concentrates", "/shop?type=concentrates"],
            ].map(([label, href]) => (
              <li key={label}>
                <Link
                  href={href}
                  className="font-sans text-sm text-textSec hover:text-textPri transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-sans text-xs font-semibold text-green uppercase tracking-widest mb-4">
            Info
          </p>

          <ul className="space-y-2.5">
            {[
              ["Delivery Info", "/contact"],
              ["Contact Us", "/contact"],
              ["Checkout", "/checkout"],
            ].map(([label, href]) => (
              <li key={label}>
                <Link
                  href={href}
                  className="font-sans text-sm text-textSec hover:text-textPri transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-sans text-xs font-semibold text-green uppercase tracking-widest mb-4">
            Hours
          </p>

          <ul className="space-y-2">
            {[
              ["Monday", "10AM – 6PM"],
              ["Tue–Sat", "10AM – 8PM"],
              ["Sunday", "12PM – 8PM"],
            ].map(([day, hours]) => (
              <li
                key={day}
                className="flex justify-between font-sans text-xs"
              >
                <span className="text-textSec">{day}</span>
                <span className="text-textPri">{hours}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border px-4 md:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-2">
        <p className="font-sans text-xs text-textDim">
          © 2024 Smokablunt. 19+ Only. Enjoy Responsibly.
        </p>

        <Link
          href="/admin/login"
          className="font-sans text-xs text-textDim hover:text-textSec transition-colors"
        >
          Admin
        </Link>
      </div>
    </footer>
  );
}