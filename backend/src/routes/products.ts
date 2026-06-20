import { Router, Request, Response } from "express";
import multer from "multer";
import streamifier from "streamifier";
import Product from "../models/Product";
import { protect, adminOnly, AuthRequest } from "../middleware/auth";
import { cloudinary } from "../config/cloudinary";

const router  = Router();
const upload  = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Upload helper
const uploadToCloudinary = (buffer: Buffer): Promise<{ url: string; public_id: string }> =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "smokablunt/products", transformation: [{ width: 800, height: 800, crop: "fill", gravity: "auto" }, { quality: "auto", fetch_format: "auto" }] },
      (err, result) => {
        if (err || !result) return reject(err);
        resolve({ url: result.secure_url, public_id: result.public_id });
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });

// GET /api/products  — public
router.get("/", async (req: Request, res: Response) => {
  try {
    const { type, category, search, featured, all } = req.query;
    const q: any = {};
    if (all !== "true") q.isActive = true;
    if (type)     q.type     = type;
    if (category) q.category = category;
    if (featured === "true") q.isFeatured = true;
    if (search)   q.name = { $regex: search, $options: "i" };
    const products = await Product.find(q).sort({ createdAt: -1 }).lean();
    res.json({ products, total: products.length });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/products/:id — public
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ error: "Not found" });
    res.json({ product });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/products — admin
router.post("/", protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { name, price, type, category, description, thc, stock, isActive, isFeatured, images, amounts, onSale, salePrice } = req.body;
    if (!name || !type || !category)
      return res.status(400).json({ error: "name, type, and category are required" });
    const product = await Product.create({
      name, type, category,
      price:       price ?? 0,
      description: description || "",
      thc:         thc   ?? 0,
      stock:       stock ?? 0,
      isActive:    isActive  ?? true,
      isFeatured:  isFeatured ?? false,
      onSale:      onSale ?? false,
      salePrice:   salePrice ?? 0,
      images:      images || [],
      amounts:     amounts || [],
    });
    res.status(201).json({ product });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/products/:id — admin
router.put("/:id", protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: false });
    if (!product) return res.status(404).json({ error: "Not found" });
    res.json({ product });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/products/:id — admin
router.delete("/:id", protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Not found" });
    // Delete images from Cloudinary
    for (const img of product.images) {
      if (img.public_id) await cloudinary.uploader.destroy(img.public_id).catch(() => {});
    }
    await product.deleteOne();
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/products/upload-image — admin
router.post("/upload-image", protect, adminOnly, upload.single("image"), async (req: any, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image provided" });
    const result = await uploadToCloudinary(req.file.buffer);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: "Upload failed: " + e.message });
  }
});

export default router;