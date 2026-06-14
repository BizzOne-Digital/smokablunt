import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/CartContext";
import { AuthProvider } from "@/lib/AuthContext";

export const metadata: Metadata = {
  title: "Smokablunt | Premium Online Dispensary",
  description: "Premium cannabis delivery — flowers, edibles, concentrates to your door.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet"/>
      </head>
      <body><AuthProvider><CartProvider>{children}</CartProvider></AuthProvider></body>
    </html>
  );
}
