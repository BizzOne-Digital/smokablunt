import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./config/db";

import authRoutes    from "./routes/auth";
import productRoutes from "./routes/products";
import orderRoutes   from "./routes/orders";
import adminRoutes   from "./routes/admin";
import contactRoutes from "./routes/contact";

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// ── Routes ────────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders",   orderRoutes);
app.use("/api/admin",    adminRoutes);
app.use("/api/contact",  contactRoutes);

// ── Health check ──────────────────────────────────────
app.get("/api/health", (_req, res) => res.json({ status: "ok", time: new Date() }));

// ── Start ─────────────────────────────────────────────
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 Smokablunt API running on http://localhost:${PORT}`);
    console.log(`📡 CORS allowed from: ${process.env.FRONTEND_URL || "http://localhost:3000"}\n`);
  });
}).catch(err => {
  console.error("❌ DB connection failed:", err);
  process.exit(1);
});

export default app;
