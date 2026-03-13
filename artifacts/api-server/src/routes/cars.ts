import { Router, type IRouter, type Request, type Response } from "express";
import { supabaseAdmin } from "../lib/supabase-admin.js";
import { requireAuth, requireAdmin, type AuthenticatedRequest } from "../middleware/require-auth.js";
import crypto from "crypto";

const router: IRouter = Router();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatCar(c: any) {
  return {
    id: c.id,
    ownerId: c.owner_id,
    driverId: c.driver_id ?? null,
    name: c.name,
    modelYear: c.model_year,
    transmissionType: c.transmission_type,
    engineOilType: c.engine_oil_type,
    coolantFillDate: c.coolant_fill_date ?? null,
    coolantNextAlertDate: c.coolant_next_alert_date ?? null,
    registrationExpiry: c.registration_expiry ?? null,
    licenseExpiry: c.license_expiry ?? null,
    insuranceExpiry: c.insurance_expiry ?? null,
    inspectionExpiry: c.inspection_expiry ?? null,
    batteryInstallDate: c.battery_install_date ?? null,
    batteryWarrantyMonths: c.battery_warranty_months ?? null,
    tireInstallDate: c.tire_install_date ?? null,
    tireWarrantyMonths: c.tire_warranty_months ?? null,
    lastMileage: c.last_mileage ?? null,
    nextOilChangeMileage: c.next_oil_change_mileage ?? null,
    plateNumber: c.plate_number ?? null,
    notes: c.notes ?? null,
    engineOilCustomDays: c.engine_oil_custom_days ?? null,
    engineOilCustomKm: c.engine_oil_custom_km ?? null,
    batteryBrand: c.battery_brand ?? null,
    tireSize: c.tire_size ?? null,
    driverName: c.driver_name ?? null,
    lastReportDate: c.last_report_date ?? null,
    createdAt: c.created_at,
  };
}

router.get("/", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthenticatedRequest;
  try {
    const { data: owned } = await supabaseAdmin
      .from("cars").select("*").eq("owner_id", userId);
    const { data: driven } = await supabaseAdmin
      .from("cars").select("*").eq("driver_id", userId);
    const all = [...(owned || []), ...(driven || [])];
    const unique = all.filter((c, i, arr) => arr.findIndex(x => x.id === c.id) === i);
    res.json(unique.map(formatCar));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin: get ALL cars in the system
router.get("/all", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
  try {
    const { data: cars, error } = await supabaseAdmin
      .from("cars").select("*").order("created_at", { ascending: false });
    if (error) throw error;

    // Get owner names
    const ownerIds = [...new Set((cars || []).map(c => c.owner_id))];
    const { data: owners } = await supabaseAdmin
      .from("users").select("id, name, email").in("id", ownerIds);
    const ownerMap = new Map((owners || []).map(o => [o.id, o.name || o.email]));

    res.json((cars || []).map(c => ({
      ...formatCar(c),
      ownerName: ownerMap.get(c.owner_id) || "غير معروف",
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthenticatedRequest;
  try {
    const {
      name, modelYear, transmissionType, engineOilType,
      coolantFillDate, registrationExpiry, licenseExpiry,
      insuranceExpiry, inspectionExpiry, batteryInstallDate,
      batteryWarrantyMonths, batteryBrand, tireInstallDate, tireWarrantyMonths, tireSize,
      lastMileage, plateNumber, notes, engineOilCustomDays, engineOilCustomKm
    } = req.body;

    let coolantNextAlertDate: string | null = null;
    if (coolantFillDate) {
      const d = new Date(coolantFillDate);
      d.setMonth(d.getMonth() + 6);
      coolantNextAlertDate = d.toISOString().split("T")[0];
    }

    let nextOilChangeMileage = null;
    if (lastMileage) {
      if (engineOilType === "custom" && engineOilCustomKm) {
        nextOilChangeMileage = lastMileage + engineOilCustomKm;
      } else {
        const oilIntervalKm = engineOilType === "5000km" ? 5000 : 10000;
        nextOilChangeMileage = lastMileage + oilIntervalKm;
      }
    }

    const { data: car, error } = await supabaseAdmin
      .from("cars")
      .insert({
        id: crypto.randomUUID(),
        owner_id: userId,
        name,
        model_year: modelYear,
        transmission_type: transmissionType,
        engine_oil_type: engineOilType,
        coolant_fill_date: coolantFillDate || null,
        coolant_next_alert_date: coolantNextAlertDate,
        registration_expiry: registrationExpiry || null,
        license_expiry: licenseExpiry || null,
        insurance_expiry: insuranceExpiry || null,
        inspection_expiry: inspectionExpiry || null,
        battery_install_date: batteryInstallDate || null,
        battery_warranty_months: batteryWarrantyMonths || null,
        tire_install_date: tireInstallDate || null,
        tire_warranty_months: tireWarrantyMonths || null,
        tire_size: tireSize || null,
        last_mileage: lastMileage || null,
        next_oil_change_mileage: nextOilChangeMileage,
        plate_number: plateNumber || null,
        notes: notes || null,
        engine_oil_custom_days: engineOilCustomDays || null,
        engine_oil_custom_km: engineOilCustomKm || null,
        battery_brand: batteryBrand || null,
      })
      .select()
      .single();

    if (error) throw error;

    await supabaseAdmin
      .from("users")
      .update({ onboarding_completed: true })
      .eq("id", userId);

    res.status(201).json(formatCar(car));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:carId", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthenticatedRequest;
  try {
    const { data: car } = await supabaseAdmin
      .from("cars").select("*").eq("id", req.params.carId).single();
    if (!car) { res.status(404).json({ error: "Car not found" }); return; }
    if (car.owner_id !== userId && car.driver_id !== userId) { res.status(403).json({ error: "Forbidden" }); return; }
    res.json(formatCar(car));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:carId", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthenticatedRequest;
  try {
    const { data: existing } = await supabaseAdmin
      .from("cars").select("*").eq("id", req.params.carId).single();
    if (!existing || existing.owner_id !== userId) { res.status(403).json({ error: "Forbidden" }); return; }

    const { name, modelYear, transmissionType, engineOilType, lastMileage, registrationExpiry, licenseExpiry, insuranceExpiry, inspectionExpiry,
            coolantFillDate, batteryInstallDate, batteryWarrantyMonths, batteryBrand, tireInstallDate, tireWarrantyMonths, tireSize, plateNumber, notes, engineOilCustomDays, engineOilCustomKm } = req.body;
    const updates: Record<string, unknown> = {};

    if (name) updates.name = name;
    if (modelYear !== undefined) updates.model_year = modelYear;
    if (transmissionType !== undefined) updates.transmission_type = transmissionType;
    if (engineOilType !== undefined) updates.engine_oil_type = engineOilType;
    if (registrationExpiry !== undefined) updates.registration_expiry = registrationExpiry;
    if (licenseExpiry !== undefined) updates.license_expiry = licenseExpiry;
    if (insuranceExpiry !== undefined) updates.insurance_expiry = insuranceExpiry;
    if (inspectionExpiry !== undefined) updates.inspection_expiry = inspectionExpiry;
    if (batteryInstallDate !== undefined) updates.battery_install_date = batteryInstallDate;
    if (batteryWarrantyMonths !== undefined) updates.battery_warranty_months = batteryWarrantyMonths;
    if (tireInstallDate !== undefined) updates.tire_install_date = tireInstallDate;
    if (tireWarrantyMonths !== undefined) updates.tire_warranty_months = tireWarrantyMonths;
    if (coolantFillDate !== undefined) {
      updates.coolant_fill_date = coolantFillDate;
      if (coolantFillDate) {
        const d = new Date(coolantFillDate);
        d.setMonth(d.getMonth() + 6);
        updates.coolant_next_alert_date = d.toISOString().split("T")[0];
      } else {
        updates.coolant_next_alert_date = null;
      }
    }
    if (lastMileage !== undefined) {
      updates.last_mileage = lastMileage;
      if (existing.engine_oil_type === "custom" && existing.engine_oil_custom_km) {
        updates.next_oil_change_mileage = lastMileage + existing.engine_oil_custom_km;
      } else {
        const oilInterval = existing.engine_oil_type === "5000km" ? 5000 : 10000;
        updates.next_oil_change_mileage = lastMileage + oilInterval;
      }
    }
    if (plateNumber !== undefined) updates.plate_number = plateNumber;
    if (notes !== undefined) updates.notes = notes;
    if (engineOilCustomDays !== undefined) updates.engine_oil_custom_days = engineOilCustomDays;
    if (engineOilCustomKm !== undefined) updates.engine_oil_custom_km = engineOilCustomKm;
    if (batteryBrand !== undefined) updates.battery_brand = batteryBrand;
    if (tireSize !== undefined) updates.tire_size = tireSize;

    const { data: car, error } = await supabaseAdmin
      .from("cars").update(updates).eq("id", req.params.carId).select().single();
    if (error) throw error;
    res.json(formatCar(car));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:carId/invite-driver", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthenticatedRequest;
  try {
    const { data: car } = await supabaseAdmin
      .from("cars").select("*").eq("id", req.params.carId).single();
    if (!car || car.owner_id !== userId) { res.status(403).json({ error: "Forbidden" }); return; }

    const { email } = req.body;
    if (!email) { res.status(400).json({ error: "Email required" }); return; }

    // Check if the user is already a registered user in our DB
    const { data: driver } = await supabaseAdmin
      .from("users").select("*").eq("email", email).single();

    if (driver) {
      // Driver is already registered, link them immediately
      await supabaseAdmin
        .from("cars")
        .update({ driver_id: driver.id, driver_name: driver.name || driver.email })
        .eq("id", car.id);
      
      res.json({ success: true, message: "هذا السائق مسجل بالفعل في النظام، تم ربطه بسيارتك فوراً!" });
    } else {
      // Driver is not registered. Check if there's already a pending invite for this exact car and email
      const { data: existingInvite } = await supabaseAdmin
        .from("invitations")
        .select("*")
        .eq("car_id", car.id)
        .eq("driver_email", email)
        .eq("status", "pending")
        .single();
        
      if (existingInvite) {
        res.status(400).json({ error: "لقد قمت بإرسال دعوة سابقة لهذا السائق وهي لا تزال قيد الانتظار!" });
        return;
      }

      // Create a pending invitation
      const inviteId = crypto.randomUUID();
      const { error: insertError } = await supabaseAdmin
        .from("invitations")
        .insert({
          id: inviteId,
          manager_id: userId,
          driver_email: email,
          car_id: car.id,
          status: "pending"
        });
        
      if (insertError) throw insertError;

      // Send the email
      try {
        const nodemailer = await import("nodemailer");
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'localhost',
          port: parseInt(process.env.SMTP_PORT || '1025'),
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
        await transporter.sendMail({
          from: process.env.SMTP_FROM || '"متابعة السيارات" <noreply@carmaint.sa>',
          to: email,
          subject: "دعوة للانضمام كسائق",
          text: `لقد تمت دعوتك من قبل مديرك لقيادة السيارة ${car.name}.\nالرجاء تحميل التطبيق وإنشاء حساب كسائق بنفس البريد الإلكتروني لقبول الدعوة آلياً.`,
          html: `<div dir="rtl"><h2>دعوة للانضمام كسائق</h2><p>لقد تمت دعوتك لقيادة السيارة <strong>${car.name}</strong>.</p><p>الرجاء إنشاء حساب "سائق" بنفس هذا البريد الإلكتروني في التطبيق ليتم ربطك بالسيارة تلقائياً.</p></div>`
        });
      } catch (mailErr) {
        // If SMTP isn't configured, it will fail here, but the DB invite is still created successfully
        console.error("Failed to send email (SMTP likely unconfigured), but invitation saved to DB:", mailErr);
      }

      res.json({ success: true, message: `تم إرسال دعوة تسجيل إلى السائق (${email}) بنجاح` });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:carId/remove-driver", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthenticatedRequest;
  try {
    const { data: car } = await supabaseAdmin
      .from("cars").select("*").eq("id", req.params.carId).single();
    if (!car) { res.status(404).json({ error: "Car not found" }); return; }
    if (car.owner_id !== userId) { res.status(403).json({ error: "Forbidden" }); return; }

    const { error } = await supabaseAdmin
      .from("cars")
      .update({ driver_id: null, driver_name: null })
      .eq("id", req.params.carId);

    if (error) throw error;
    res.json({ success: true, message: "تمت إزالة السائق من السيارة بنجاح" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:carId", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthenticatedRequest;
  try {
    const { data: car } = await supabaseAdmin
      .from("cars").select("*").eq("id", req.params.carId).single();
    if (!car) { res.status(404).json({ error: "Car not found" }); return; }
    if (car.owner_id !== userId) { res.status(403).json({ error: "Forbidden" }); return; }

    const { error } = await supabaseAdmin
      .from("cars").delete().eq("id", req.params.carId);
    if (error) throw error;
    res.json({ success: true, message: "تم حذف السيارة بنجاح" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/reports", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthenticatedRequest;
  try {
    const { data: cars } = await supabaseAdmin
      .from("cars").select("id").eq("owner_id", userId);
    
    if (!cars || cars.length === 0) { res.json([]); return; }
    
    const carIds = cars.map(c => c.id);
    const { data: reports, error } = await supabaseAdmin
      .from("service_records")
      .select(`
        *,
        car:car_id (name, model_year, driver_name)
      `)
      .in("car_id", carIds)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(reports || []);
  } catch (err) {
    console.error("[reports] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
