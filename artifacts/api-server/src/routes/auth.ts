import { Router, type IRouter, type Request, type Response } from "express";
import { supabaseAdmin } from "../lib/supabase-admin.js";
import { requireAuth, type AuthenticatedRequest } from "../middleware/require-auth.js";

const router: IRouter = Router();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatUser(u: any) {
  return {
    id: u.id,
    email: u.email,
    name: u.name ?? null,
    role: u.role,
    plan: u.plan,
    onboardingCompleted: u.onboarding_completed,
    createdAt: u.created_at,
  };
}

router.get("/me", requireAuth, async (req: Request, res: Response) => {
  const { userId, userEmail } = req as AuthenticatedRequest;
  try {
    let { data: user } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (!user) {
      const { data: authData } = await supabaseAdmin.auth.admin.getUserById(userId);
      const meta = authData?.user?.user_metadata || {};

      // Auto-link pending invitations for this email
      const { data: pendingInvites } = await supabaseAdmin
        .from("invitations")
        .select("*")
        .eq("driver_email", userEmail)
        .eq("status", "pending");

      const hasInvites = pendingInvites && pendingInvites.length > 0;
      const assignedRole = hasInvites ? "driver" : (meta.role || "manager");

      const { data: created, error: insertErr } = await supabaseAdmin
        .from("users")
        .insert({
          id: userId,
          email: userEmail,
          name: meta.name || meta.full_name || null,
          role: assignedRole,
          plan: "free",
          onboarding_completed: false, // Maybe true for drivers to skip?
        })
        .select()
        .single();

      if (insertErr) throw insertErr;
      user = created;

      // If they had invites, mark them accepted and link cars
      if (hasInvites) {
        // Mark invites accepted
        const inviteIds = pendingInvites.map(inv => inv.id);
        await supabaseAdmin.from("invitations").update({ status: "accepted" }).in("id", inviteIds);
        
        // Link all cars from those invites to this new driver UUID
        const carIds = pendingInvites.map(inv => inv.car_id);
        await supabaseAdmin.from("cars").update({ driver_id: userId, driver_name: user?.name || userEmail }).in("id", carIds);
        
        // Mark onboarding completed automatically for invited drivers so they skip the setup
        await supabaseAdmin.from("users").update({ onboarding_completed: true }).eq("id", userId);
        user.onboarding_completed = true;
      }

    }

    res.json(formatUser(user));
  } catch (err: any) {
    console.error("[auth/me] error:", err);
    res.status(500).json({ error: err?.message || JSON.stringify(err) || "Internal server error" });
  }
});

router.patch("/profile", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthenticatedRequest;
  const { name, role } = req.body as { name?: string; role?: string };
  try {
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (role && ["manager", "driver", "both", "admin"].includes(role)) updates.role = role;

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    res.json(formatUser(user));
  } catch (err) {
    console.error("[auth/profile] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
