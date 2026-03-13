import { Router, type IRouter, type Request, type Response } from "express";
import { supabaseAdmin } from "../lib/supabase-admin.js";
import crypto from "crypto";
import { requireAuth, requireAdmin } from "../middleware/require-auth.js";

const router: IRouter = Router();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fmt(a: any) {
  return { id: a.id, title: a.title, message: a.message, type: a.type, active: a.active, createdAt: a.created_at };
}

router.get("/", async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json((data || []).map(fmt));
  } catch (err) { console.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.post("/", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const { title, message, type, active } = req.body as { title?: string; message?: string; type?: string; active?: boolean };
  if (!title || !message || !type) { res.status(400).json({ error: "title, message, type required" }); return; }
  try {
    const { data, error } = await supabaseAdmin
      .from("announcements")
      .insert({ id: crypto.randomUUID(), title, message, type, active: active !== false })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(fmt(data));
  } catch (err) { console.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.put("/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const { title, message, type, active } = req.body;
  try {
    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title;
    if (message !== undefined) updates.message = message;
    if (type !== undefined) updates.type = type;
    if (active !== undefined) updates.active = active;
    const { data, error } = await supabaseAdmin
      .from("announcements").update(updates).eq("id", req.params.id).select().single();
    if (error || !data) { res.status(404).json({ error: "Not found" }); return; }
    res.json(fmt(data));
  } catch (err) { console.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.delete("/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { error } = await supabaseAdmin
      .from("announcements").delete().eq("id", req.params.id);
    if (error) throw error;
    res.status(204).send();
  } catch (err) { console.error(err); res.status(500).json({ error: "Internal server error" }); }
});

export default router;
