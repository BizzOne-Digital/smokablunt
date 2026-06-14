import { Router, Request, Response } from "express";
import User from "../models/User";
import { signToken, protect, AuthRequest } from "../middleware/auth";

const router = Router();

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "Name, email and password required" });
    if (await User.findOne({ email })) return res.status(409).json({ error: "Email already registered" });
    const user = await User.create({ name, email, password, phone, role: "customer" });
    const token = signToken({ userId: user._id.toString(), email: user.email, role: user.role });
    res.cookie("auth_token", token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: "lax" });
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, token });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ error: "Invalid email or password" });
    const token = signToken({ userId: user._id.toString(), email: user.email, role: user.role });
    res.cookie("auth_token", token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: "lax" });
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, token });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/auth/me
router.get("/me", protect, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.userId).select("-password");
    if (!user) return res.status(404).json({ error: "Not found" });
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/auth/logout
router.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie("auth_token");
  res.json({ success: true });
});

export default router;
