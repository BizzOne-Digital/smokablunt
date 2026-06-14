import { Router, Request, Response } from "express";
import { sendContactEmail } from "../utils/email";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const { name, email, phone, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ error: "name, email, message required" });
  try {
    await sendContactEmail({ name, email, phone, message });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: "Failed to send: " + e.message });
  }
});

export default router;
