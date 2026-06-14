import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: { userId: string; email: string; role: "admin" | "customer" };
}

const SECRET = process.env.JWT_SECRET || "smokablunt_secret_change_me";

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.auth_token || req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    req.user = jwt.verify(token, SECRET) as AuthRequest["user"];
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== "admin") return res.status(403).json({ error: "Admin access required" });
  next();
};

export const signToken = (payload: { userId: string; email: string; role: string }) =>
  jwt.sign(payload, SECRET, { expiresIn: "7d" });
