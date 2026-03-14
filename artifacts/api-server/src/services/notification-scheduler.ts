import cron from "node-cron";
import { supabaseAdmin } from "../lib/supabase-admin.js";
import webpush from "web-push";

function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  // Use UTC to avoid timezone issues when checking precise day differences
  const targetDate = new Date(dateStr);
  targetDate.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const diff = targetDate.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Runs every day at 10 AM (0 10 * * *)
export function startNotificationScheduler() {
  cron.schedule("0 10 * * *", async () => {
    console.log("[Scheduler] Running daily check for document expiries...");
    try {
      const { data: cars, error: carsErr } = await supabaseAdmin
        .from("cars")
        .select("id, name, owner_id, driver_id, registration_expiry, insurance_expiry, inspection_expiry");

      if (carsErr || !cars) {
        throw new Error(carsErr?.message || "Failed to fetch cars");
      }

      // Fetch all premium users (plan != 'free')
      const { data: premiumUsers, error: usersErr } = await supabaseAdmin
        .from("users")
        .select("id, plan")
        .neq("plan", "free");

      if (usersErr || !premiumUsers) {
        throw new Error(usersErr?.message || "Failed to fetch premium users");
      }

      const premiumUserIds = new Set(premiumUsers.map(u => u.id));

      // Map User ID -> Array of notification messages
      const notificationsToSend = new Map<string, string[]>();

      for (const car of cars) {
        // Enforce premium plan check: Only send notifications if the owner is on a paid plan
        if (!car.owner_id || !premiumUserIds.has(car.owner_id)) {
          continue; // Owner is on the free plan, skip notifications for this car
        }

        const checkExpiry = (docName: string, dateStr: string | null) => {
          const days = daysUntil(dateStr);
          if (days === 30 || days === 15 || days === 0) {
            const timeWord = days === 0 ? "اليوم" : `خلال ${days} أيام`;
            const msg = `وثيقة ${docName} للسيارة (${car.name}) تنتهي ${timeWord}!`;
            
            // Notify Owner
            if (car.owner_id) {
              if (!notificationsToSend.has(car.owner_id)) notificationsToSend.set(car.owner_id, []);
              notificationsToSend.get(car.owner_id)!.push(msg);
            }
            // Notify Driver if assigned
            if (car.driver_id && car.driver_id !== car.owner_id) {
               if (!notificationsToSend.has(car.driver_id)) notificationsToSend.set(car.driver_id, []);
               notificationsToSend.get(car.driver_id)!.push(msg);
            }
          }
        };

        checkExpiry("الاستمارة", car.registration_expiry);
        checkExpiry("التأمين", car.insurance_expiry);
        checkExpiry("الفحص الدوري", car.inspection_expiry);
      }

      if (notificationsToSend.size === 0) {
        console.log("[Scheduler] No expiries need notifications today.");
        return;
      }

      // Fetch push subscriptions for all users who need notifications
      const userIds = Array.from(notificationsToSend.keys());
      const { data: subscriptions, error: subErr } = await supabaseAdmin
        .from("push_subscriptions")
        .select("*")
        .in("user_id", userIds);

      if (subErr || !subscriptions) {
        throw new Error(subErr?.message || "Failed to fetch subscriptions");
      }

      let sentCount = 0;
      
      for (const sub of subscriptions) {
        try {
          const userMsgs = notificationsToSend.get(sub.user_id);
          if (!userMsgs || userMsgs.length === 0) continue;

          // Combine multiple messages if a user has more than one expiry today
          const body = userMsgs.length === 1 ? userMsgs[0] : `لديك ${userMsgs.length} تنبيهات وثائق:\n${userMsgs.join("\n")}`;

          const pushPayload = JSON.stringify({
            title: "مداري | تنبيه الوثائق 🔔",
            body: body,
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
      console.error("[Scheduler] Error in document expiry cron job:", err);
    }
  });
  
  console.log("[Scheduler] Push notification cron job initialized.");
}
