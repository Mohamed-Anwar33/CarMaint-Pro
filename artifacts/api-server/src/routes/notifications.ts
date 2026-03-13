import { Router, Request, Response } from "express";
import webpush from "web-push";
import { supabaseAdmin } from "../lib/supabase-admin.js";

const router = Router();

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL || "mailto:admin@carmaint.sa",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

router.get("/vapid-key", (_req: Request, res: Response) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY || "" });
});

router.post("/subscribe", async (req: Request, res: Response) => {
  const { subscription, userId } = req.body as {
    subscription: { endpoint: string; keys: { p256dh: string; auth: string } };
    userId: string;
  };
  if (!subscription?.endpoint || !userId) {
    res.status(400).json({ error: "Missing subscription or userId" }); return;
  }
  try {
    await supabaseAdmin.from("push_subscriptions").upsert({
      user_id: userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    }, { onConflict: "endpoint" });
    res.json({ ok: true });
  } catch (err) {
    console.error("Subscribe error:", err);
    res.status(500).json({ error: "Failed to save subscription" });
  }
});

router.post("/unsubscribe", async (req: Request, res: Response) => {
  const { endpoint } = req.body as { endpoint: string };
  if (!endpoint) { res.status(400).json({ error: "Missing endpoint" }); return; }
  try {
    await supabaseAdmin.from("push_subscriptions").delete().eq("endpoint", endpoint);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove subscription" });
  }
});

router.post("/send", async (req: Request, res: Response) => {
  const { userId, payload } = req.body as { userId?: string; payload: object };
  try {
    let query = supabaseAdmin.from("push_subscriptions").select("*");
    if (userId) query = query.eq("user_id", userId) as typeof query;
    const { data: subs } = await query;
    let sent = 0, failed = 0;
    await Promise.allSettled(
      (subs || []).map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            JSON.stringify(payload)
          );
          sent++;
        } catch (err: unknown) {
          const e = err as { statusCode?: number };
          if (e.statusCode === 410 || e.statusCode === 404) {
            await supabaseAdmin.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
          }
          failed++;
        }
      })
    );
    res.json({ sent, failed });
  } catch (err) {
    console.error("Send notification error:", err);
    res.status(500).json({ error: "Send failed" });
  }
});

router.post("/send-user", async (req: Request, res: Response) => {
  const { userId, title, body, url, tag, requireInteraction } = req.body as {
    userId: string; title: string; body: string;
    url?: string; tag?: string; requireInteraction?: boolean;
  };
  if (!userId || !title || !body) { res.status(400).json({ error: "Missing fields" }); return; }
  const payload = JSON.stringify({ title, body, url: url || "/dashboard", tag: tag || "reminder", requireInteraction });
  try {
    const { data: subs } = await supabaseAdmin
      .from("push_subscriptions").select("*").eq("user_id", userId);
    let sent = 0;
    await Promise.allSettled(
      (subs || []).map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload
          );
          sent++;
        } catch (err: unknown) {
          const e = err as { statusCode?: number };
          if (e.statusCode === 410 || e.statusCode === 404) {
            await supabaseAdmin.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
          }
        }
      })
    );
    await supabaseAdmin.from("notification_log").insert({
      user_id: userId,
      type: req.body.type || "reminder",
      title,
      body,
      channel: "push",
      status: sent > 0 ? "sent" : "no_subscription",
    });
    res.json({ sent, subscribers: subs?.length || 0 });
  } catch (err) {
    res.status(500).json({ error: "Send failed" });
  }
});

router.get("/status/:userId", async (req: Request, res: Response) => {
  try {
    const { count } = await supabaseAdmin
      .from("push_subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", req.params.userId);
    res.json({ subscribed: (count || 0) > 0, count: count || 0 });
  } catch {
    res.json({ subscribed: false, count: 0 });
  }
});

export default router;
