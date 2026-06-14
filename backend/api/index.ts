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

// ── Middleware ────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL || "",
  "http://localhost:3000",
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // allow all for Vercel deployments
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── DB connect (cached for serverless) ───────────────
let dbConnected = false;
app.use(async (_req, _res, next) => {
  if (!dbConnected) {
    await connectDB();
    dbConnected = true;
  }
  next();
});

// ── Routes ────────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders",   orderRoutes);
app.use("/api/admin",    adminRoutes);
app.use("/api/contact",  contactRoutes);

// ── Health check ──────────────────────────────────────
app.get("/api/health", (_req, res) => res.json({ status: "ok", time: new Date() }));

export default app;
