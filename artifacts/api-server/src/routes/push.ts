import { Router, type IRouter, type Request, type Response } from "express";
import { requireAuth, type AuthenticatedRequest } from "../middleware/require-auth.js";
import { supabaseAdmin } from "../lib/supabase-admin.js";
import crypto from "crypto";
import webpush from "web-push";

const router: IRouter = Router();

webpush.setVapidDetails(
  process.env.VAPID_EMAIL || "mailto:admin@carmaint.sa",
  process.env.VAPID_PUBLIC_KEY || "",
  process.env.VAPID_PRIVATE_KEY || ""
);

router.get("/public-key", (req: Request, res: Response) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

router.post("/subscribe", requireAuth, async (req: Request, res: Response) => {
  try {
    const { endpoint, keys } = req.body;
    const { userId } = req as AuthenticatedRequest;

    if (!endpoint || !keys) {
      res.status(400).json({ error: "Invalid subscription payload" });
      return;
    }

    const { data: existing } = await supabaseAdmin
      .from("push_subscriptions")
      .select("*")
      .eq("endpoint", endpoint)
      .limit(1);
    
    if (!existing || existing.length === 0) {
      await supabaseAdmin.from("push_subscriptions").insert({
        id: crypto.randomUUID(),
        user_id: userId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      });
    }

    res.status(201).json({ success: true });
  } catch (error) {
    console.error("Push subscribe error:", error);
    res.status(500).json({ error: "Failed to subscribe" });
  }
});

export default router;
