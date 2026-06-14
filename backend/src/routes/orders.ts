import { Router, Request, Response } from "express";
import Order from "../models/Order";
import { protect, adminOnly, AuthRequest } from "../middleware/auth";
import { sendOrderConfirmation, sendAdminOrderAlert, sendStatusUpdate } from "../utils/email";

const router = Router();

// GET /api/orders — admin: all, customer: own
router.get("/", protect, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;
    const q: any = {};
    if (req.user?.role !== "admin") q.customer = req.user?.userId;
    if (status) q.status = status;
    const orders = await Order.find(q).sort({ createdAt: -1 }).lean();
    res.json({ orders, total: orders.length });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/orders — place order (public or logged in)
router.post("/", async (req: Request, res: Response) => {
  try {
    const { customerInfo, deliveryAddress, items, paymentMethod, customerId } = req.body;
    if (!customerInfo?.name || !customerInfo?.email || !customerInfo?.phone)
      return res.status(400).json({ error: "Customer info required" });
    if (!deliveryAddress?.street || !deliveryAddress?.city || !deliveryAddress?.zip)
      return res.status(400).json({ error: "Delivery address required" });
    if (!items?.length)
      return res.status(400).json({ error: "No items in order" });

    const subtotal    = items.reduce((s: number, i: any) => s + i.price * i.quantity, 0);
    const deliveryFee = subtotal >= 100 ? 0 : 5;
    const total       = subtotal + deliveryFee;

    const order = await Order.create({
      customer: customerId || null,
      customerInfo, deliveryAddress, items,
      subtotal, deliveryFee, total,
      paymentMethod: paymentMethod || "cash",
      status: "pending",
      statusHistory: [{ status: "pending", at: new Date() }],
    });

    const addr   = `${deliveryAddress.street}, ${deliveryAddress.city} ${deliveryAddress.zip}`;
    const mapped = items.map((i: any) => ({ name: i.name, qty: i.quantity, price: i.price }));
    const pm     = paymentMethod === "etransfer" ? "E-Transfer" : "Cash on Delivery";

    Promise.all([
      sendOrderConfirmation({ orderNumber: order.orderNumber, customerName: customerInfo.name, customerEmail: customerInfo.email, items: mapped, total, address: addr, payment: pm }),
      sendAdminOrderAlert({ orderNumber: order.orderNumber, customerName: customerInfo.name, customerEmail: customerInfo.email, customerPhone: customerInfo.phone, items: mapped, total, address: addr, payment: pm, notes: deliveryAddress.notes }),
    ]).catch(console.error);

    res.status(201).json({ order });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/orders/:id
router.get("/:id", protect, async (req: AuthRequest, res: Response) => {
  try {
    const order: any = await Order.findById(req.params.id).lean();
    if (!order) return res.status(404).json({ error: "Not found" });
    if (req.user?.role !== "admin" && order.customer?.toString() !== req.user?.userId)
      return res.status(403).json({ error: "Forbidden" });
    res.json({ order });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH /api/orders/:id — admin update status
router.patch("/:id", protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { status, statusNote } = req.body;
    const valid = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"];
    if (!valid.includes(status)) return res.status(400).json({ error: "Invalid status" });

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, statusNote, $push: { statusHistory: { status, note: statusNote, at: new Date() } } },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: "Not found" });

    sendStatusUpdate({
      orderNumber: order.orderNumber, customerName: order.customerInfo.name,
      customerEmail: order.customerInfo.email, status, note: statusNote,
    }).catch(console.error);

    res.json({ order });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/orders/:id — admin
router.delete("/:id", protect, adminOnly, async (_req: AuthRequest, res: Response) => {
  try {
    await Order.findByIdAndDelete(_req.params.id);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
