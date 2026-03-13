import cron from "node-cron";
import { supabaseAdmin } from "../lib/supabase-admin.js";
import webpush from "web-push";

// Runs every day at 10 AM (0 10 * * *)
export function startNotificationScheduler() {
  cron.schedule("0 10 * * *", async () => {
    console.log("[Scheduler] Running daily check for overdue driver reports...");
    try {
      // Find cars that need a report (last_report_date is older than 7 days, or null)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: cars, error: carsErr } = await supabaseAdmin
        .from("cars")
        .select("id, name, driver_id, last_report_date")
        .not("driver_id", "is", null);

      if (carsErr || !cars) {
        throw new Error(carsErr?.message || "Failed to fetch cars");
      }

      const overdueTargetDriverIds = new Set<string>();
      
      for (const car of cars) {
        if (!car.last_report_date || new Date(car.last_report_date) < sevenDaysAgo) {
          if (car.driver_id) overdueTargetDriverIds.add(car.driver_id);
        }
      }

      if (overdueTargetDriverIds.size === 0) {
        console.log("[Scheduler] No overdue reports found today.");
        return;
      }

      // Fetch push subscriptions for these drivers
      const { data: subscriptions, error: subErr } = await supabaseAdmin
        .from("push_subscriptions")
        .select("*")
        .in("user_id", Array.from(overdueTargetDriverIds));

      if (subErr || !subscriptions) {
        throw new Error(subErr?.message || "Failed to fetch subscriptions");
      }

      let sentCount = 0;
      
      for (const sub of subscriptions) {
        try {
          const pushPayload = JSON.stringify({
            title: "إشعار نظام المتابعة",
            body: "لديك تقرير أسبوعي متأخر للسيارة! يرجى الدخول للحساب وتحديث الحالة فوراً لتجنب المساءلة.",
            url: "/dashboard"
          });

          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth
              }
            },
            pushPayload
          );
          sentCount++;
        } catch (err: any) {
          console.error(`[Scheduler] Failed to send push to ${sub.endpoint}:`, err.message);
          // If subscription is invalid/expired (HTTP 410 or 404), remove it from DB
          if (err.statusCode === 410 || err.statusCode === 404) {
            await supabaseAdmin.from("push_subscriptions").delete().eq("id", sub.id);
          }
        }
      }

      console.log(`[Scheduler] Finished sending ${sentCount} push notifications.`);
    } catch (err) {
      console.error("[Scheduler] Error in overdue report cron job:", err);
    }
  });
  
  console.log("[Scheduler] Push notification cron job initialized.");
}
