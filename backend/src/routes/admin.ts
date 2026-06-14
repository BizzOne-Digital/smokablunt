import { Router, Response } from "express";
import Order from "../models/Order";
import Product from "../models/Product";
import User from "../models/User";
import { protect, adminOnly, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(protect, adminOnly);

// GET /api/admin/stats
router.get("/stats", async (_req: AuthRequest, res: Response) => {
  try {
    const now   = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const month = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalOrders, todayOrders, pendingOrders, revArr, monthRevArr, totalProducts, totalUsers, recentOrders, ordersByStatus, topProducts] =
      await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ createdAt: { $gte: today } }),
        Order.countDocuments({ status: { $in: ["pending", "confirmed", "preparing", "out_for_delivery"] } }),
        Order.aggregate([{ $match: { status: { $ne: "cancelled" } } }, { $group: { _id: null, t: { $sum: "$total" } } }]),
        Order.aggregate([{ $match: { createdAt: { $gte: month }, status: { $ne: "cancelled" } } }, { $group: { _id: null, t: { $sum: "$total" } } }]),
        Product.countDocuments({ isActive: true }),
        User.countDocuments({ role: "customer" }),
        Order.find().sort({ createdAt: -1 }).limit(8).lean(),
        Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
        Order.aggregate([
          { $unwind: "$items" },
          { $group: { _id: "$items.name", count: { $sum: "$items.quantity" }, rev: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
          { $sort: { count: -1 } },
          { $limit: 5 },
        ]),
      ]);

    // Last 7 days chart
    const chart = await Promise.all(
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i));
        const s = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const e = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
        return Order.aggregate([
          { $match: { createdAt: { $gte: s, $lte: e }, status: { $ne: "cancelled" } } },
          { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } },
        ]).then(r => ({
          date: s.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
          revenue: r[0]?.total || 0,
          orders:  r[0]?.count || 0,
        }));
      })
    );

    res.json({
      stats: {
        totalOrders, todayOrders, pendingOrders,
        totalRevenue: revArr[0]?.t || 0,
        monthRevenue: monthRevArr[0]?.t || 0,
        totalProducts, totalUsers,
      },
      recentOrders, ordersByStatus, topProducts, chart,
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/admin/users
router.get("/users", async (_req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 }).lean();
    res.json({ users });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH /api/admin/users/:id — toggle role
router.patch("/users/:id", async (req: AuthRequest, res: Response) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");
    res.json({ user });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
