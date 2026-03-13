import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellOff, BellRing, X, CheckCircle, Smartphone } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

import { InAppNotification, inAppNotifications, subscribeToNotifications, markAllRead } from "@/lib/notification-store";

export function NotificationBell() {
  const { user } = useAuth();
  const { status, isSupported, requestPermission, subscribe, sendTestNotification } = useNotifications();
  const [open, setOpen] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [requesting, setRequesting] = useState(false);

  // Subscribe to in-app notification store
  useEffect(() => {
    const fn = () => setNotifications([...inAppNotifications]);
    const unsubscribe = subscribeToNotifications(fn);
    setNotifications([...inAppNotifications]);
    return unsubscribe;
  }, []);

  // Show setup prompt for new users after 5 seconds
  useEffect(() => {
    if (!user || status !== "not-subscribed" || !isSupported) return;
    const timer = setTimeout(() => setShowSetup(true), 5000);
    return () => clearTimeout(timer);
  }, [user, status, isSupported]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleEnable = async () => {
    setRequesting(true);
    const granted = await requestPermission();
    if (granted && user) {
      await subscribe(user.id);
      sendTestNotification();
      setShowSetup(false);
    }
    setRequesting(false);
  };

  const getIcon = (type: InAppNotification["type"]) => {
    if (type === "alert") return "🔴";
    if (type === "reminder") return "🔔";
    return "ℹ️";
  };

  const iconClass = cn(
    "w-9 h-9 rounded-full flex items-center justify-center relative transition-all",
    status === "subscribed" ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25" :
    status === "denied" ? "bg-muted/20 text-muted-foreground" :
    "bg-primary/15 text-primary hover:bg-primary/25"
  );

  return (
    <>
      {/* Notification Setup Banner (bottom of screen) */}
      <AnimatePresence>
        {showSetup && status !== "subscribed" && (
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            className="fixed bottom-20 left-4 right-4 z-[99] max-w-sm mx-auto"
            dir="rtl"
          >
            <div className="bg-slate-800 border border-primary/30 rounded-2xl p-4 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-secondary" />
              <button onClick={() => setShowSetup(false)} className="absolute top-3 left-3 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                <X className="w-3 h-3" />
              </button>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <BellRing className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white text-sm mb-0.5">فعّل تنبيهات الصيانة 🔔</p>
                  <p className="text-xs text-slate-400 mb-3">سنذكّرك بمواعيد زيت سيارتك وتجديد وثائقها تلقائياً — لا تفوّت موعداً</p>
                  <button onClick={handleEnable} disabled={requesting}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold shadow-md shadow-primary/25 hover:shadow-primary/40 transition-all disabled:opacity-60">
                    {requesting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Bell className="w-4 h-4" /> تفعيل التنبيهات</>}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bell Button */}
      <div className="relative">
        <button onClick={() => setOpen(!open)} className={iconClass}>
          {status === "subscribed" ? <BellRing className="w-4 h-4" /> :
           status === "denied" ? <BellOff className="w-4 h-4" /> :
           <Bell className="w-4 h-4" />}
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-white text-[9px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          {status === "not-subscribed" && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
          )}
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {open && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute left-0 mt-2 w-80 rounded-2xl bg-card border border-border/50 shadow-2xl overflow-hidden z-50 origin-top-left"
              >
                <div className="p-3 border-b border-border/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-primary" />
                    <h3 className="font-bold text-sm text-white">التنبيهات</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-[10px] text-primary hover:underline">تحديد كمقروء</button>
                    )}
                    {status !== "subscribed" && isSupported && (
                      <button onClick={handleEnable} className="text-[10px] px-2 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors">
                        {requesting ? "..." : "فعّل التنبيهات"}
                      </button>
                    )}
                    {status === "subscribed" && (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                        <CheckCircle className="w-3 h-3" /> مفعّلة
                      </span>
                    )}
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-10 text-center">
                      <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-40" />
                      <p className="text-sm text-muted-foreground">لا توجد تنبيهات بعد</p>
                      {status === "subscribed" && (
                        <p className="text-xs text-slate-500 mt-1">ستصلك تذكيرات الصيانة تلقائياً</p>
                      )}
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className={cn("px-3 py-2.5 border-b border-border/30 hover:bg-white/3 transition-colors", !n.read && "bg-primary/3")}>
                        <div className="flex items-start gap-2">
                          <span className="text-base mt-0.5">{getIcon(n.type)}</span>
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-xs font-semibold", !n.read ? "text-white" : "text-slate-300")}>{n.title}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{n.body}</p>
                            <p className="text-[9px] text-slate-500 mt-1">{n.timestamp.toLocaleTimeString("ar-SA")}</p>
                          </div>
                          {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {status === "not-subscribed" && isSupported && (
                  <div className="p-3 border-t border-border/50 bg-primary/5">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-primary shrink-0" />
                      <p className="text-[10px] text-slate-400">فعّل التنبيهات للحصول على تذكيرات صيانة السيارة مباشرةً على جهازك</p>
                    </div>
                  </div>
                )}
                {status === "denied" && (
                  <div className="p-3 border-t border-border/50">
                    <p className="text-[10px] text-muted-foreground text-center">التنبيهات محجوبة. يمكنك تفعيلها من إعدادات المتصفح.</p>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
