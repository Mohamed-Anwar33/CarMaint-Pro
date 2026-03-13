import { Router, type IRouter, type Request, type Response } from "express";
import { supabaseAdmin } from "../lib/supabase-admin.js";
import { requireAuth, requireAdmin, type AuthenticatedRequest } from "../middleware/require-auth.js";

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

router.get("/", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
  try {
    const { data: users, error: usersError } = await supabaseAdmin.from("users").select("*");
    if (usersError) throw usersError;

    const { data: cars } = await supabaseAdmin.from("cars").select("owner_id");
    const carCounts = (cars || []).reduce((acc: Record<string, number>, car: any) => {
      acc[car.owner_id] = (acc[car.owner_id] || 0) + 1;
      return acc;
    }, {});

    res.json((users || []).map(u => ({
      ...formatUser(u),
      carsCount: carCounts[u.id] || 0
    })));
  } catch (err) {
    console.error("[users/list] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const { role, plan } = req.body as { role?: string; plan?: string };
  try {
    const updates: Record<string, unknown> = {};
    if (role && ["manager", "driver", "both", "admin"].includes(role)) updates.role = role;
    if (plan && ["free", "pro", "family_small", "family_large"].includes(plan)) updates.plan = plan;
    const { data, error } = await supabaseAdmin
      .from("users").update(updates).eq("id", req.params.id).select().single();
    if (error || !data) { res.status(404).json({ error: "User not found" }); return; }
    res.json(formatUser(data));
  } catch (err) {
    console.error("[users/patch] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/onboarding-complete", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthenticatedRequest;
  try {
    await supabaseAdmin
      .from("users").update({ onboarding_completed: true }).eq("id", userId);
    res.json({ success: true });
  } catch (err) {
    console.error("[users/onboarding] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/my-drivers", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthenticatedRequest;
  try {
    const { data: cars } = await supabaseAdmin
      .from("cars").select("*").eq("owner_id", userId);
    
    const driverIds = [...new Set((cars || []).map(c => c.driver_id).filter(Boolean))];
    let registeredDrivers: any[] = [];
    if (driverIds.length > 0) {
      const { data: users } = await supabaseAdmin
        .from("users").select("*").in("id", driverIds);
      registeredDrivers = users || [];
    }

    const { data: invitations } = await supabaseAdmin
      .from("invitations").select("*").eq("manager_id", userId).eq("status", "pending");

    const driversList = [];
    
    // 1. Add pending invitations
    for (const inv of (invitations || [])) {
      const relatedCar = cars?.find(c => c.id === inv.car_id);
      driversList.push({
        id: inv.id,
        email: inv.driver_email,
        name: "يحتاج للتسجيل (دعوة معلقة)",
        status: "pending",
        carId: inv.car_id,
        carName: relatedCar?.name || "سيارة محذوفة",
      });
    }

    // 2. Add registered drivers
    for (const driver of registeredDrivers) {
      const drivingCars = cars?.filter(c => c.driver_id === driver.id) || [];
      for (const car of drivingCars) {
        driversList.push({
          id: driver.id,
          email: driver.email,
          name: driver.name || driver.email,
          status: "registered",
          carId: car.id,
          carName: car.name,
        });
      }
    }

    res.json(driversList);
  } catch (err) {
    console.error("[users/my-drivers] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/invitations/:id", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthenticatedRequest;
  try {
    const { data: invite } = await supabaseAdmin
      .from("invitations")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (!invite) {
      res.status(404).json({ error: "الدعوة غير موجودة" });
      return;
    }

    if (invite.manager_id !== userId) {
      res.status(403).json({ error: "غير مصرح لك بإلغاء هذه الدعوة" });
      return;
    }

    const { error } = await supabaseAdmin
      .from("invitations")
      .delete()
      .eq("id", req.params.id);

    if (error) throw error;
    res.json({ success: true, message: "تم إلغاء الدعوة بنجاح" });
  } catch (err) {
    console.error("[users/delete-invitation] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
