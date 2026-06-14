import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "../src/config/db";

import authRoutes    from "../src/routes/auth";
import productRoutes from "../src/routes/products";
import orderRoutes   from "../src/routes/orders";
import adminRoutes   from "../src/routes/admin";
import contactRoutes from "../src/routes/contact";

const app = express();

// ── CORS — allow all origins (works for any Vercel frontend URL) ──
app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── DB connect (cached for serverless cold starts) ────────────────
let dbConnected = false;
app.use(async (_req, _res, next) => {
  if (!dbConnected) {
    try {
      await connectDB();
      dbConnected = true;
    } catch (err) {
      console.error("DB connect error:", err);
      return next(err);
    }
  }
  next();
});

// ── Routes ────────────────────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders",   orderRoutes);
app.use("/api/admin",    adminRoutes);
app.use("/api/contact",  contactRoutes);

// ── Health / root check ───────────────────────────────────────────
app.get("/", (_req, res) => res.json({ status: "Smokablunt API is running ✅", time: new Date() }));
app.get("/api/health", (_req, res) => res.json({ status: "ok", time: new Date() }));

export default app;