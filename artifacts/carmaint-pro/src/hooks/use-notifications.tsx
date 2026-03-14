import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export type NotificationPermission = "default" | "granted" | "denied";
export type PushStatus = "unsupported" | "not-subscribed" | "subscribed" | "denied";

interface UseNotificationsReturn {
  status: PushStatus;
  permission: NotificationPermission;
  isSupported: boolean;
  requestPermission: () => Promise<boolean>;
  subscribe: (userId: string) => Promise<boolean>;
  unsubscribe: () => Promise<void>;
  sendTestNotification: () => void;
}

export function useNotifications(): UseNotificationsReturn {
  const [status, setStatus] = useState<PushStatus>("not-subscribed");
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const isSupported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

  useEffect(() => {
    if (!isSupported) { setStatus("unsupported"); return; }
    setPermission(Notification.permission as NotificationPermission);
    if (Notification.permission === "denied") { setStatus("denied"); return; }

    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        setStatus(sub ? "subscribed" : "not-subscribed");
      });
    });
  }, [isSupported]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;
    const result = await Notification.requestPermission();
    setPermission(result as NotificationPermission);
    if (result === "denied") { setStatus("denied"); return false; }
    return result === "granted";
  }, [isSupported]);

  const subscribe = useCallback(async (userId: string): Promise<boolean> => {
    if (!isSupported || !VAPID_PUBLIC_KEY) return false;
    try {
      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      if (existing) await existing.unsubscribe();

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const subKeys = sub.toJSON().keys;
      const { error } = await supabase.from("push_subscriptions").upsert({
        user_id: userId,
        endpoint: sub.endpoint,
        p256dh: subKeys?.p256dh || "",
        auth: subKeys?.auth || "",
      }, { onConflict: "endpoint" });

      if (!error) { setStatus("subscribed"); return true; }
      console.error("Failed to save push subscription to Supabase:", error);
      return false;
    } catch (err) {
      console.error("Push subscribe error:", err);
      return false;
    }
  }, [isSupported]);

  const unsubscribe = useCallback(async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
        await sub.unsubscribe();
      }
      setStatus("not-subscribed");
    } catch (err) {
      console.error("Unsubscribe error:", err);
    }
  }, []);

  const sendTestNotification = useCallback(() => {
    if (Notification.permission === "granted") {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification("صيانة سيارتي 🔔", {
            body: "التنبيهات تعمل بنجاح! ستصلك تذكيرات صيانة سيارتك تلقائياً.",
            icon: "/icons/icon-192.png",
            dir: "rtl",
          } as NotificationOptions);
        });
      }
    }
  }, []);

  return { status, permission, isSupported, requestPermission, subscribe, unsubscribe, sendTestNotification };
}

// Register service worker globally
export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  try {
    await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  } catch (err) {
    console.warn("SW registration failed:", err);
  }
}
