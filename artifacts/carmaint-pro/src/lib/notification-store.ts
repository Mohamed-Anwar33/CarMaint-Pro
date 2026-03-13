export interface InAppNotification {
  id: string;
  title: string;
  body: string;
  type: "reminder" | "alert" | "info";
  url?: string;
  timestamp: Date;
  read: boolean;
}

export let inAppNotifications: InAppNotification[] = [];
export let listeners: (() => void)[] = [];

export function addInAppNotification(n: Omit<InAppNotification, "id" | "timestamp" | "read">) {
  const notif: InAppNotification = { ...n, id: crypto.randomUUID(), timestamp: new Date(), read: false };
  inAppNotifications = [notif, ...inAppNotifications].slice(0, 20);
  listeners.forEach(fn => fn());
}

export function markAllRead() {
  inAppNotifications = inAppNotifications.map(n => ({ ...n, read: true }));
  listeners.forEach(fn => fn());
}

export function subscribeToNotifications(fn: () => void) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter(l => l !== fn);
  };
}
