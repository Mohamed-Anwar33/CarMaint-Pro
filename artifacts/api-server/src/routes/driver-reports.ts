import { Router, type IRouter, type Request, type Response } from "express";
import { supabaseAdmin } from "../lib/supabase-admin.js";
import crypto from "crypto";
import { requireAuth, type AuthenticatedRequest } from "../middleware/require-auth.js";

const router: IRouter = Router();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatReport(r: any) {
  return {
    id: r.id,
    carId: r.car_id,
    driverId: r.driver_id,
    currentMileage: r.current_mileage,
    oilLevel: r.oil_level,
    tiresStatus: r.tires_status,
    brakesStatus: r.brakes_status,
    acStatus: r.ac_status,
    notes: r.notes ?? null,
    submittedAt: r.submitted_at,
  };
}

router.get("/", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthenticatedRequest;
  const { carId } = req.query as { carId?: string };
  try {
    const query = supabaseAdmin
      .from("driver_reports")
      .select("*")
      .order("submitted_at", { ascending: false });

    const { data, error } = carId
      ? await query.eq("car_id", carId)
      : await query.eq("driver_id", userId);

    if (error) throw error;
    res.json((data || []).map(formatReport));
  } catch (err) { console.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.post("/", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthenticatedRequest;
  const { carId, currentMileage, oilLevel, tiresStatus, brakesStatus, acStatus, notes } = req.body as {
    carId?: string; currentMileage?: number; oilLevel?: string;
    tiresStatus?: string; brakesStatus?: string; acStatus?: string; notes?: string;
  };
  if (!carId || !currentMileage || !oilLevel || !tiresStatus || !brakesStatus || !acStatus) {
    res.status(400).json({ error: "All required fields must be provided" }); return;
  }
  try {
    const { data, error } = await supabaseAdmin
      .from("driver_reports")
      .insert({
        id: crypto.randomUUID(),
        car_id: carId,
        driver_id: userId,
        current_mileage: currentMileage,
        oil_level: oilLevel,
        tires_status: tiresStatus,
        brakes_status: brakesStatus,
        ac_status: acStatus,
        notes: notes || null,
      })
      .select()
      .single();
    if (error) throw error;
    
    // Also update the car's last_report_date
    await supabaseAdmin
      .from("cars")
      .update({ last_report_date: new Date().toISOString(), last_mileage: currentMileage })
      .eq("id", carId);

    res.status(201).json(formatReport(data));
  } catch (err) { console.error(err); res.status(500).json({ error: "Internal server error" }); }
});

export default router;
