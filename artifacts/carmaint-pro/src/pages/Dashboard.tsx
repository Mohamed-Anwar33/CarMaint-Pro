import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { Car, Settings, AlertTriangle, Plus, PenTool, CheckCircle, Mail, Gauge, Bell, Crown, Trash2, Edit2, UserPlus, X, Save, FileText, Users, Lock, Droplets, CircleDashed, ShieldAlert, Wind, MessageSquare, CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ManagerDrivers } from "@/components/dashboard/ManagerDrivers";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface CarData {
  id: string; ownerId: string; driverId: string | null; name: string;
  modelYear: number; transmissionType: "automatic" | "manual"; engineOilType: "5000km" | "10000km" | "custom";
  registrationExpiry: string | null; insuranceExpiry: string | null;
  inspectionExpiry: string | null; batteryInstallDate: string | null;
  batteryBrand: string | null; tireSize: string | null;
  plateNumber: string | null; notes: string | null;
  engineOilCustomDays: number | null; engineOilCustomKm: number | null;
  driverName: string | null; lastReportDate: string | null; createdAt: string;
  invoices: string[];
  batteryInvoice: string | null; tireInvoice: string | null;
}

interface Announcement {
  id: string; title: string; message: string; type: "offer" | "update"; active: boolean;
}

function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function ExpiryStatus({ label, date }: { label: string; date: string | null | undefined }) {
  const days = daysUntil(date);
  const status = days === null ? "none" : days < 0 ? "expired" : days < 30 ? "warning" : "ok";
  return (
    <div className={cn("flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 hover:shadow-md", {
      "bg-destructive/5 border-destructive/20": status === "expired",
      "bg-amber-500/5 border-amber-500/30": status === "warning",
      "bg-background border-border/60": status === "ok",
      "bg-muted/30 border-border/40 border-dashed": status === "none",
    })}>
      <p className="text-sm font-medium text-muted-foreground mb-3">{label}</p>
      <div className="flex items-center gap-2">
        <div className={cn("w-2.5 h-2.5 rounded-full shadow-sm", {
          "bg-destructive animate-pulse": status === "expired",
          "bg-amber-500 animate-pulse": status === "warning",
          "bg-emerald-500": status === "ok",
          "bg-muted-foreground/30": status === "none",
        })} />
        <span className={cn("font-num text-sm font-bold", {
          "text-destructive": status === "expired",
          "text-amber-600 dark:text-amber-400": status === "warning",
          "text-foreground": status === "ok",
          "text-muted-foreground": status === "none",
        })}>
          {date ? (status === "expired" ? `منتهي منذ ${Math.abs(days!)} يوم` : `${days} يوم`) : "غير محدد"}
        </span>
      </div>
    </div>
  );
}



function ManagerReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data, error } = await supabase.from("driver_reports").select("*, cars(name, driver_name)").order("submitted_at", { ascending: false });
        if(error) throw error;
        setReports(data.map((r: any) => ({
          ...r,
          mileage: r.current_mileage,
          engine_oil_status: r.oil_level,
          created_at: r.submitted_at,
          car: { name: r.cars?.name, driver_name: r.cars?.driver_name }
        })));
      } catch (err) {
        console.error("Error fetching reports", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-6 bg-card/50 backdrop-blur-sm rounded-3xl border border-border/50">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary/20 rounded-full"></div>
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
      </div>
      <p className="text-lg text-muted-foreground font-medium animate-pulse">جاري تحميل التقارير الاحترافية...</p>
    </div>
  );

  if (reports.length === 0) return (
    <div className="py-24 text-center bg-card/30 backdrop-blur-md border border-dashed border-border/80 rounded-3xl shadow-inner relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card/5 z-0 pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-24 h-24 mb-6 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
          <FileText className="w-12 h-12 text-primary opacity-60" />
        </div>
        <h3 className="text-2xl font-black text-foreground mb-2 tracking-tight">لا توجد تقارير مرفوعة</h3>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">لم يقم السائقون بإرسال أي تقارير فحص ومتابعة حتى الآن.</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {reports.map((report: any) => (
        <div key={report.id} className="group relative bg-card/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-border transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 overflow-hidden">
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 group-hover:bg-primary/10 transition-colors" />
          
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-8 border-b border-border/50 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10 shadow-inner">
                <Car className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="font-black text-foreground text-xl md:text-2xl tracking-tight mb-1">
                  {report.car?.name}
                </h3>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 opacity-70" />
                  السائق: <span className="text-foreground">{report.car?.driver_name || "غير معروف"}</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-background/80 px-4 py-2 rounded-xl border border-border shadow-sm">
              <CalendarClock className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-foreground font-num">
                {new Date(report.created_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm mb-6">
            <div className="bg-background/50 hover:bg-background/80 transition-colors p-4 rounded-2xl border border-border flex flex-col items-center text-center group/card">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover/card:scale-110 transition-transform">
                <Gauge className="w-5 h-5 text-primary" />
              </div>
              <span className="text-muted-foreground text-xs font-semibold mb-1">المسافة المقطوعة</span>
              <span className="text-foreground font-black font-num text-lg">{report.mileage} <span className="text-xs">كم</span></span>
            </div>

            <div className="bg-background/50 hover:bg-background/80 transition-colors p-4 rounded-2xl border border-border flex flex-col items-center text-center group/card">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center mb-3 group-hover/card:scale-110 transition-transform">
                <Droplets className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-muted-foreground text-xs font-semibold mb-1">زيت المحرك</span>
              <span className={cn("font-black text-sm px-3 py-1 rounded-full", report.engine_oil_status === 'low' ? 'bg-destructive/10 text-destructive' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400')}>
                {report.engine_oil_status === 'low' ? 'مستوى منخفض' : 'مستوى طبيعي'}
              </span>
            </div>

            <div className="bg-background/50 hover:bg-background/80 transition-colors p-4 rounded-2xl border border-border flex flex-col items-center text-center group/card">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center mb-3 group-hover/card:scale-110 transition-transform">
                <CircleDashed className="w-5 h-5 text-secondary" />
              </div>
              <span className="text-muted-foreground text-xs font-semibold mb-2">حالة الإطارات</span>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-background border border-border">
                <div className={cn("w-2.5 h-2.5 rounded-full shadow-sm animate-pulse", report.tires_status === 'red' ? 'bg-destructive' : report.tires_status === 'yellow' ? 'bg-amber-500' : 'bg-emerald-500')} />
                <span className="text-xs font-bold text-foreground">
                  {report.tires_status === 'red' ? 'تحتاج تغيير' : report.tires_status === 'yellow' ? 'فحص قريب' : 'سليمة'}
                </span>
              </div>
            </div>

            <div className="bg-background/50 hover:bg-background/80 transition-colors p-4 rounded-2xl border border-border flex flex-col items-center text-center group/card">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center mb-3 group-hover/card:scale-110 transition-transform">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
              </div>
              <span className="text-muted-foreground text-xs font-semibold mb-2">نظام الفرامل</span>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-background border border-border">
                <div className={cn("w-2.5 h-2.5 rounded-full shadow-sm animate-pulse", report.brakes_status === 'red' ? 'bg-destructive' : report.brakes_status === 'yellow' ? 'bg-amber-500' : 'bg-emerald-500')} />
                <span className="text-xs font-bold text-foreground">
                  {report.brakes_status === 'red' ? 'تحتاج صيانة' : report.brakes_status === 'yellow' ? 'فحص قريب' : 'سليمة'}
                </span>
              </div>
            </div>

            <div className="bg-background/50 hover:bg-background/80 transition-colors p-4 rounded-2xl border border-border flex flex-col items-center text-center group/card">
              <div className="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center mb-3 group-hover/card:scale-110 transition-transform">
                <Wind className="w-5 h-5 text-sky-500" />
              </div>
              <span className="text-muted-foreground text-xs font-semibold mb-2">تكييف الهواء</span>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-background border border-border">
                <div className={cn("w-2.5 h-2.5 rounded-full shadow-sm animate-pulse", report.ac_status === 'red' ? 'bg-destructive' : report.ac_status === 'yellow' ? 'bg-amber-500' : 'bg-emerald-500')} />
                <span className="text-xs font-bold text-foreground">
                  {report.ac_status === 'red' ? 'تحتاج فحص' : report.ac_status === 'yellow' ? 'تبريد ضعيف' : 'يعمل جيداً'}
                </span>
              </div>
            </div>
          </div>

          {report.notes && (
            <div className="bg-primary/5 border border-primary/10 p-5 rounded-2xl relative">
              <MessageSquare className="w-6 h-6 text-primary/20 absolute top-4 left-4" />
              <span className="text-sm font-bold text-primary flex items-center gap-2 mb-2">
                ملاحظات إضافية من السائق
              </span>
              <p className="text-sm md:text-base text-foreground/90 leading-relaxed pl-8">
                {report.notes}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

import { useToast } from "@/hooks/use-toast";

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"manager" | "reports" | "driver" | "drivers">(user?.role === "driver" ? "driver" : "manager");
  const [cars, setCars] = useState<CarData[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [showOverduePush, setShowOverduePush] = useState(true);
  const [driverToRemove, setDriverToRemove] = useState<CarData | null>(null);
  
  const [pushSupported, setPushSupported] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true); // Default true so it doesn't flash

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setPushSupported(true);
      setPushEnabled(Notification.permission === 'granted');
    }
  }, []);

  const subscribeToPush = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast({ title: "يجب الموافقة", description: "لم تقم بمنح صلاحية الإشعارات للمتصفح.", variant: "destructive" });
        return;
      }
      
      const registration = await navigator.serviceWorker.ready;
      
      // Removed the custom backend VAPID key fetch, replaced with the env variable directly
      const convertedVapidKey = urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY || "");

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });

      const { data: { session } } = await supabase.auth.getSession();
      if(session?.user) {
        const subKeys = subscription.toJSON().keys;
        await supabase.from("push_subscriptions").upsert({
          user_id: session.user.id,
          endpoint: subscription.endpoint,
          p256dh: subKeys?.p256dh || "",
          auth: subKeys?.auth || "",
        }, { onConflict: "endpoint" });
      }
      
      setPushEnabled(true);
      toast({ title: "تم التفعيل", description: "تم تفعيل الإشعارات التلقائية بنجاح.", variant: "default" });
    } catch (err: any) {
      console.error("Push subscribe error", err);
      toast({ title: "خطأ", description: "حدث خطأ أثناء تفعيل الإشعارات.", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [carsRes, annRes] = await Promise.all([
          // Only fetch cars linked to the user
          supabase.from("cars").select("*").or(`owner_id.eq.${user.id},driver_id.eq.${user.id}`).order("created_at", { ascending: false }),
          supabase.from("announcements").select("*").eq("active", true).order("created_at", { ascending: false }),
        ]);
        if(carsRes.error) throw carsRes.error;
        if(annRes.error) throw annRes.error;

        setCars(carsRes.data.map(c => ({
          id: c.id, ownerId: c.owner_id, driverId: c.driver_id, name: c.name,
          modelYear: c.model_year, transmissionType: c.transmission_type as any, engineOilType: c.engine_oil_type as any,
          registrationExpiry: c.registration_expiry, insuranceExpiry: c.insurance_expiry,
          inspectionExpiry: c.inspection_expiry, batteryInstallDate: c.battery_install_date,
          batteryBrand: c.battery_brand, tireSize: c.tire_size,
          plateNumber: c.plate_number, notes: c.notes,
          engineOilCustomDays: c.engine_oil_custom_days, engineOilCustomKm: c.engine_oil_custom_km,
          driverName: c.driver_name, lastReportDate: c.last_report_date, createdAt: c.created_at,
          invoices: c.invoices || [],
          batteryInvoice: c.battery_invoice || null,
          tireInvoice: c.tire_invoice || null
        })));
        setAnnouncements(annRes.data.map(a => ({
          id: a.id, title: a.title, message: a.message, type: a.type as any, active: a.active
        })));
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  if (!user) return null;

  const expiringCars = cars.filter(car => {
    const dates = [car.registrationExpiry, car.insuranceExpiry, car.inspectionExpiry];
    return dates.some(d => { const days = daysUntil(d); return days !== null && days < 30; });
  });

  const overdueCars = cars.filter(car => !car.lastReportDate || (daysUntil(car.lastReportDate) !== null && daysUntil(car.lastReportDate)! < -7));
  const hasOverduePush = activeTab === "driver" && overdueCars.length > 0 && showOverduePush;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 mb-10 bg-card/20 p-6 rounded-3xl border border-border/30 backdrop-blur-sm">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-black text-foreground flex items-center gap-2 tracking-tight">
            {activeTab === "manager" ? `مرحباً، ${user.name || "مدير"} 👋` : activeTab === "reports" ? "التقارير المرفوعة 📋" : activeTab === "drivers" ? "إدارة العائلة 👥" : "السيارات المخصصة لك"}
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            {activeTab === "manager" ? "تابع حالة مركباتك، وثائقها، وتقاريرها من مكان واحد." : activeTab === "reports" ? "استعرض تقارير الفحص الدورية المقدمة من مستخدمي المركبات" : activeTab === "drivers" ? "شاهد أفراد العائلة النشطين وأرسل دعوات لمشاركة المركبات" : "سجل تقارير الفحص الدورية لمركبات العائلة بنقرة واحدة"}
          </p>
        </div>
        {activeTab === "manager" && (
          <div className="flex items-center gap-3">
            {user.plan === "free" && (
              <Link href="/pricing" className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-semibold hover:bg-amber-500/20 transition-colors">
                <Crown className="w-3.5 h-3.5" /> ترقية للبرو
              </Link>
            )}
            {cars.length >= (user.plan === "family_large" ? 5 : user.plan === "family_small" ? 3 : user.plan === "pro" ? 1 : 1) ? (
              <div className="group relative">
                <button disabled className="flex items-center gap-2 px-4 py-2 bg-card/50 border border-border/50 text-muted-foreground rounded-xl text-sm font-medium transition-all cursor-not-allowed">
                  <Plus className="w-4 h-4" /> إضافة سيارة
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 p-2 bg-popover border border-border rounded-lg text-xs text-popover-foreground shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  {user.plan === "family_large" ? "لقد وصلت للحد الأقصى المسموح (5 سيارات)" : user.plan === "family_small" ? "لقد وصلت للحد الأقصى المسموح (3 سيارات)" : user.plan === "pro" ? "خطة البرو تتيح سيارة واحدة فقط." : "الخطة المجانية تتيح سيارة واحدة فقط."} <Link href="/pricing" className="text-primary hover:underline">رقي حسابك</Link>
                </div>
              </div>
            ) : (
              <Link href="/onboarding" className="flex items-center gap-2 px-4 py-2 bg-card border border-border hover:border-primary/50 text-foreground rounded-xl text-sm font-medium transition-all hover:shadow-lg">
                <Plus className="w-4 h-4" /> إضافة سيارة
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Push Notification for Overdue Reports */}
      <AnimatePresence>
        {hasOverduePush && (
          <motion.div initial={{ y: -100, opacity: 0 }} 
                      animate={{ y: 0, opacity: 1 }} 
                      exit={{ y: -100, opacity: 0, scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="fixed top-4 inset-x-4 z-50 md:max-w-md md:mx-auto">
            <div className="bg-card/95 backdrop-blur-xl border border-destructive/30 p-4 rounded-3xl shadow-2xl flex items-start gap-4 cursor-pointer" onClick={() => setShowOverduePush(false)}>
              <div className="w-12 h-12 rounded-2xl bg-destructive flex items-center justify-center shrink-0 shadow-lg shadow-destructive/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20 animate-pulse" />
                <AlertTriangle className="w-6 h-6 text-foreground relative z-10" />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex justify-between items-center mb-1">
                  <p className="font-bold text-foreground text-base">إشعار نظام المتابعة</p>
                  <span className="text-xs text-muted-foreground">الآن</span>
                </div>
                <p className="text-sm text-foreground leading-snug">
                  لديك تقرير أسبوعي متأخر لـ {overdueCars.length === 1 ? `سيارة (${overdueCars[0].name})` : `${overdueCars.length} سيارات`}! يرجى الدخول وتحديث الحالة فوراً لتجنب المساءلة.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enable Native Push Banner */}
      {pushSupported && !pushEnabled && activeTab === "driver" && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">تفعيل إشعارات الهاتف التلقائية (Web Push)</p>
              <p className="text-xs text-foreground">اسمح للتطبيق بتنبيهك حتى وهو مغلق في حال تأخر تقرير السيارة.</p>
            </div>
          </div>
          <button onClick={subscribeToPush} className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-orange-600 transition-colors whitespace-nowrap">
            تفعيل الإشعارات
          </button>
        </motion.div>
      )}

      {/* Announcement Banner */}
      {showAnnouncement && announcements.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className={cn("mb-6 p-4 rounded-2xl flex items-center gap-4 relative overflow-hidden",
            announcements[0].type === "offer" ? "bg-primary/10 border border-primary/20" : "bg-secondary/10 border border-secondary/20")}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-black/10">
            <Bell className="w-5 h-5 text-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground text-sm">{announcements[0].title}</p>
            <p className="text-xs text-foreground truncate">{announcements[0].message}</p>
          </div>
          <button onClick={() => setShowAnnouncement(false)} className="shrink-0 text-muted-foreground hover:text-foreground text-lg transition-colors px-1">✕</button>
        </motion.div>
      )}



      {/* Premium Tab Header for managers */}
      {["manager", "both"].includes(user.role) && (
        <div className="flex justify-center mb-10 w-full">
          <div className="bg-card/40 backdrop-blur-xl border border-border/40 p-1.5 rounded-2xl flex items-center gap-1.5 shadow-xl shadow-black/10 overflow-x-auto max-w-full scrollbar-hide">
            {[
              { id: "manager", label: "السيارات", icon: Car },
              ...((user.plan === "family_small" || user.plan === "family_large") ? [{ id: "drivers", label: "العائلة", icon: Users }] : []),
              { id: "reports", label: "التقارير", icon: FileText },
              ...(user.role === "both" ? [{ id: "driver", label: "سائق", icon: Gauge }] : [])
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap",
                  activeTab === tab.id 
                    ? tab.id === "driver" ? "bg-secondary text-secondary-foreground shadow-lg shadow-secondary/20 scale-100" : "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-100" 
                    : "text-muted-foreground hover:text-foreground hover:bg-black/5 opacity-80 hover:opacity-100 scale-95"
                )}
              >
                <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "animate-pulse duration-1000" : "")} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">جاري تحميل بياناتك...</p>
        </div>
      ) : (
        <>
          {/* Manager View */}
          {activeTab === "manager" && (
            <div className="space-y-6">
              {expiringCars.length > 0 && (
                <div className="bg-destructive/10 border border-destructive/30 p-4 rounded-2xl flex items-start sm:items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <h3 className="text-destructive font-bold text-sm mb-0.5">تنبيه: وثائق قاربت على الانتهاء</h3>
                    <p className="text-foreground text-sm">{expiringCars.map(c => c.name).join("، ")} — يرجى المراجعة والتجديد.</p>
                  </div>
                </div>
              )}

              {cars.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  <AnimatePresence>
                  {cars.map((car, i) => (
                    <motion.div key={car.id} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.05, duration: 0.3 }}
                      className="group relative bg-card backdrop-blur-md rounded-[24px] border border-border hover:border-primary/30 transition-all duration-500 shadow-xl shadow-black/5 hover:shadow-primary/10">
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 rounded-[24px] overflow-hidden bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                      <div className="p-6 border-b border-border/50 flex justify-between items-start relative z-10">
                        <div className="space-y-2">
                          <h3 className="font-extrabold text-2xl text-foreground tracking-tight">{car.name}</h3>
                          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                            <span className="px-2.5 py-1 rounded-lg bg-muted text-foreground border border-border font-num">{car.modelYear}</span>
                            <span className="px-2.5 py-1 rounded-lg bg-muted text-foreground border border-border">{car.transmissionType === "automatic" ? "اوتوماتيك" : "عادي"}</span>
                            {(!car.lastReportDate || (daysUntil(car.lastReportDate) !== null && daysUntil(car.lastReportDate)! < -7)) && (
                              <span className="px-2.5 py-1 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-1.5 shadow-sm">
                                <AlertTriangle className="w-3.5 h-3.5" /> تقرير مفقود
                              </span>
                            )}
                          </div>
                        </div>
                        <CarActionsMenu car={car} userPlan={user.plan} onUpdate={(updated) => setCars(prev => prev.map(c => c.id === updated.id ? updated : c))} onDelete={(id) => setCars(prev => prev.filter(c => c.id !== id))} />
                      </div>
                      <div className="p-6 space-y-5 relative z-10 bg-gradient-to-b from-transparent to-muted/20">
                        <div className="grid grid-cols-3 gap-3">
                          <ExpiryStatus label="الاستمارة" date={car.registrationExpiry} />
                          <ExpiryStatus label="التأمين" date={car.insuranceExpiry} />
                          <ExpiryStatus label="الفحص" date={car.inspectionExpiry} />
                        </div>
                        
                        <div className="pt-5 border-t border-border/50">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-xs text-muted-foreground font-bold tracking-wider">عضو العائلة المعين</p>
                            {car.driverName && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold uppercase">متصل</span>}
                          </div>
                          
                            {car.driverName ? (
                              <div className="flex items-center justify-between gap-3 bg-muted/60 p-3 rounded-2xl border border-border group-hover:bg-muted transition-colors w-full">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary/30 to-secondary/10 flex items-center justify-center text-secondary font-black shadow-inner border border-secondary/20 shrink-0">
                                    {car.driverName.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <span className="text-sm font-bold text-foreground truncate block leading-tight mb-0.5" title={car.driverName}>{car.driverName}</span>
                                    <span className="text-[11px] font-medium text-muted-foreground block leading-none">صلاحية كاملة</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => setDriverToRemove(car)}
                                  className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-white flex items-center justify-center transition-colors shrink-0"
                                  title="إزالة العضو"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <InviteDriverButton carId={car.id} carName={car.name} userPlan={user.plan} onInvited={(driverName) => setCars(prev => prev.map(c => c.id === car.id ? { ...c, driverName } : c))} />
                            )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}

          {activeTab === "reports" && (
            <ManagerReports />
          )}

          {activeTab === "drivers" && (
            <ManagerDrivers />
          )}

          {/* Driver View */}
          {activeTab === "driver" && (
            <div className="space-y-6">
              <div className="bg-card rounded-2xl border border-border p-6 text-center relative overflow-hidden flex flex-col items-center justify-center">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
                <h2 className="text-3xl font-black text-foreground mb-2 font-sans tracking-tight">الأسبوع {Math.ceil((new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24 * 7))}</h2>
                <p className="text-muted-foreground text-sm flex items-center gap-1.5 font-medium"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> الأسبوع الحالي</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.length === 0 ? (
                <div className="col-span-full py-12 text-center border border-dashed border-border rounded-2xl">
                  <Car className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <h3 className="text-lg font-medium text-foreground">لا توجد سيارات مخصصة لك</h3>
                  <p className="text-sm text-muted-foreground mt-1">اطلب من مديرك إرسال دعوة لبريدك الإلكتروني.</p>
                </div>
              ) : (
                cars.map((car, i) => {
                  const needsReport = !car.lastReportDate || daysUntil(car.lastReportDate) !== null && daysUntil(car.lastReportDate)! < -7;
                  return (
                  <motion.div key={car.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className={cn("bg-card rounded-2xl border p-6 relative overflow-hidden shadow-2xl", needsReport ? "border-destructive/50 shadow-destructive/10" : "border-primary/20 shadow-primary/5")}>
                    <div className={cn("absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl", needsReport ? "bg-destructive/10" : "bg-primary/10")} />
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg", needsReport ? "bg-gradient-to-br from-destructive to-red-600 shadow-destructive/20" : "bg-gradient-to-br from-primary to-orange-600 shadow-primary/20")}>
                        <Car className="w-8 h-8 text-foreground" />
                      </div>
                      <h3 className="font-bold text-xl text-foreground mb-1">{car.name}</h3>
                      <p className="text-sm text-primary mb-2 font-num">{car.modelYear}</p>
                      
                      {needsReport && (
                        <div className="flex items-center gap-1.5 text-xs text-destructive bg-destructive/10 px-3 py-1.5 rounded-lg border border-destructive/20 mb-6 font-medium">
                          <AlertTriangle className="w-3.5 h-3.5" /> يرجى تحديث حالة السيارة الأسبوعية
                        </div>
                      )}
                      {!needsReport && (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 mb-6 font-medium">
                          <CheckCircle className="w-3.5 h-3.5" /> السيارة محدثة
                        </div>
                      )}

                      <ReportModal carId={car.id} carName={car.name} onReportSubmitted={(date) => {
                        setCars(prev => prev.map(c => c.id === car.id ? { ...c, lastReportDate: date } : c));
                      }} />
                    </div>
                  </motion.div>
                )})
              )}
              </div>
            </div>
          )}
        </>
      )}

      <ConfirmModal
        isOpen={!!driverToRemove}
        onClose={() => setDriverToRemove(null)}
        title="إزالة هذا العضو من السيارة؟"
        message={`هل أنت متأكد من إبطال صلاحية السائق ${driverToRemove?.driverName || 'المتوفر'} من سيارة ${driverToRemove?.name || 'هذه'}؟ سيتم منعه من رفع التقارير لهذه السيارة.`}
        confirmText="نعم، حذف العضو"
        cancelText="تراجع"
        variant="danger"
        onConfirm={async () => {
          if (!driverToRemove) return;
          const { error } = await supabase.from('cars').update({ driver_name: null }).eq('id', driverToRemove.id);
          if (!error) {
            setCars(prev => prev.map(c => c.id === driverToRemove.id ? { ...c, driverName: null } : c));
            toast({ title: "تم الإزالة", description: "تمت إزالة العضو بنجاح" });
          } else {
            toast({ title: "خطأ", description: "تعذر إزالة العضو المضاف", variant: "destructive" });
          }
          setDriverToRemove(null);
        }}
      />
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-3xl">
      <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
        <Car className="w-10 h-10 text-primary" />
      </div>
      <h2 className="text-xl font-bold text-foreground mb-2">لا توجد سيارات بعد</h2>
      <p className="text-muted-foreground text-sm mb-8 max-w-xs">ابدأ بإضافة سيارتك الأولى لتتبع وثائقها ومواعيد صيانتها</p>
      <Link href="/onboarding" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all">
        <Plus className="w-4 h-4" /> إضافة أول سيارة
      </Link>
    </motion.div>
  );
}

import { UploadCloud } from "lucide-react";

function CarActionsMenu({ car, userPlan, onUpdate, onDelete }: { car: CarData; userPlan: string; onUpdate: (c: CarData) => void; onDelete: (id: string) => void }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  // Edit form state
  const [editName, setEditName] = useState(car.name);
  const [editModelYear, setEditModelYear] = useState(car.modelYear || "");
  const [editTransmission, setEditTransmission] = useState(car.transmissionType || "automatic");
  const [editEngineOilType, setEditEngineOilType] = useState(car.engineOilType || "10000km");
  const [editEngineOilCustomDays, setEditEngineOilCustomDays] = useState(car.engineOilCustomDays || "");
  const [editEngineOilCustomKm, setEditEngineOilCustomKm] = useState(car.engineOilCustomKm || "");
  const [editRegExpiry, setEditRegExpiry] = useState(car.registrationExpiry || "");
  const [editInsExpiry, setEditInsExpiry] = useState(car.insuranceExpiry || "");
  const [editInspExpiry, setEditInspExpiry] = useState(car.inspectionExpiry || "");
  const [editPlateNumber, setEditPlateNumber] = useState(car.plateNumber || "");
  const [editNotes, setEditNotes] = useState(car.notes || "");
  const [editBatteryBrand, setEditBatteryBrand] = useState(car.batteryBrand || "");
  const [editTireSize, setEditTireSize] = useState(car.tireSize || "");
  const [batteryInvoice, setBatteryInvoice] = useState(car.batteryInvoice || "");
  const [tireInvoice, setTireInvoice] = useState(car.tireInvoice || "");
  const [invoices, setInvoices] = useState<string[]>(car.invoices || []);
  const [uploadingBattery, setUploadingBattery] = useState(false);
  const [uploadingTire, setUploadingTire] = useState(false);
  const [uploadingGeneric, setUploadingGeneric] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleUploadGenericInvoice = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (userPlan === "free") {
      toast({ title: "ترقية مطلوبة", description: "رفع الفواتير متاح فقط للخطط المدفوعة وخطط العائلة.", variant: "destructive" });
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingGeneric(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${car.id}/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('invoices').upload(filePath, file);
      
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('invoices').getPublicUrl(filePath);
      setInvoices(prev => [...prev, data.publicUrl]);
      toast({ title: "تم الرفع", description: "تم رفع الفاتورة بنجاح." });
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message || "حدث خطأ أثناء رفع الفاتورة.", variant: "destructive" });
    } finally {
      setUploadingGeneric(false);
      if(e.target) e.target.value = '';
    }
  };

  const handleUploadSpecificInvoice = async (e: React.ChangeEvent<HTMLInputElement>, type: "battery" | "tire") => {
    if (userPlan === "free") {
      toast({ title: "ترقية مطلوبة", description: "رفع الفواتير متاح فقط للخطط المدفوعة وخطط العائلة.", variant: "destructive" });
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "battery") setUploadingBattery(true);
    if (type === "tire") setUploadingTire(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${car.id}/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('invoices').upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('invoices').getPublicUrl(filePath);
      
      if (type === "battery") setBatteryInvoice(data.publicUrl);
      if (type === "tire") setTireInvoice(data.publicUrl);

      toast({ title: "تم الرفع", description: "تم رفع الفاتورة بنجاح." });
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message || "حدث خطأ أثناء الرفع.", variant: "destructive" });
    } finally {
      if (type === "battery") setUploadingBattery(false);
      if (type === "tire") setUploadingTire(false);
      if(e.target) e.target.value = '';
    }
  };



  const handleSave = async () => {
    setSaving(true);
    try {
      const dbCar = {
        name: editName,
        model_year: editModelYear ? parseInt(editModelYear as string) : null,
        transmission_type: editTransmission,
        engine_oil_type: editEngineOilType,
        engine_oil_custom_days: editEngineOilCustomDays ? parseInt(editEngineOilCustomDays as string) : null,
        engine_oil_custom_km: editEngineOilCustomKm ? parseInt(editEngineOilCustomKm as string) : null,
        registration_expiry: editRegExpiry || null,
        insurance_expiry: editInsExpiry || null,
        inspection_expiry: editInspExpiry || null,
        plate_number: editPlateNumber || null,
        notes: editNotes || null,
        battery_brand: editBatteryBrand || null,
        tire_size: editTireSize || null,
        battery_invoice: batteryInvoice || null,
        tire_invoice: tireInvoice || null,
        invoices: invoices.length > 0 ? invoices : null,
      };
      
      const { data, error } = await supabase.from("cars").update(dbCar).eq("id", car.id).select().single();
      if(error) throw error;
      
      const mappedUpdated: CarData = {
        id: data.id, ownerId: data.owner_id, driverId: data.driver_id, name: data.name,
        modelYear: data.model_year, transmissionType: data.transmission_type as any, engineOilType: data.engine_oil_type as any,
        registrationExpiry: data.registration_expiry, insuranceExpiry: data.insurance_expiry,
        inspectionExpiry: data.inspection_expiry, batteryInstallDate: data.battery_install_date,
        batteryBrand: data.battery_brand, tireSize: data.tire_size,
        plateNumber: data.plate_number, notes: data.notes,
        engineOilCustomDays: data.engine_oil_custom_days, engineOilCustomKm: data.engine_oil_custom_km,
        driverName: data.driver_name, lastReportDate: data.last_report_date, createdAt: data.created_at,
        invoices: data.invoices || invoices,
        batteryInvoice: data.battery_invoice, tireInvoice: data.tire_invoice
      };

      onUpdate(mappedUpdated);
      setShowEdit(false);
      toast({ title: "تم التحديث", description: "تم تحديث بيانات السيارة بنجاح" });
    } catch {
      toast({ title: "خطأ", description: "حدث خطأ أثناء التحديث", variant: "destructive" });
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase.from("cars").delete().eq("id", car.id);
      if(error) throw error;
      onDelete(car.id);
      toast({ title: "تم الحذف", description: "تم حذف السيارة بنجاح" });
    } catch {
      toast({ title: "خطأ", description: "حدث خطأ أثناء الحذف", variant: "destructive" });
    }
    setDeleting(false);
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div className="relative">
        <button onClick={() => setShowMenu(!showMenu)} className="p-2 rounded-lg bg-background hover:bg-black/5 text-muted-foreground transition-colors">
          <Settings className="w-4 h-4" />
        </button>
        {showMenu && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
            <div className="absolute top-full mt-1 left-0 z-40 bg-card border border-border rounded-xl shadow-xl overflow-hidden min-w-[150px]" dir="rtl">
              <button onClick={() => { setShowMenu(false); setShowEdit(true); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-black/5 transition-colors">
                <Edit2 className="w-3.5 h-3.5" /> تعديل البيانات
              </button>
              <div className="border-t border-border/50" />
              <button onClick={() => { setShowMenu(false); setShowDeleteConfirm(true); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> حذف السيارة
              </button>
            </div>
          </>
        )}
      </div>

      {/* Edit Modal */}
      {showEdit && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm pointer-events-auto" dir="rtl" style={{ position: 'fixed' }}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-card/95 backdrop-blur-xl border border-border/60 rounded-3xl w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[90vh]">
            
            {/* Modal Header (Fixed) */}
            <div className="flex items-center justify-between p-6 sm:px-8 border-b border-border/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Edit2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-foreground tracking-tight">تعديل بيانات السيارة</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">تحديث المعلومات والوثائق الخاصة بالمركبة</p>
                </div>
              </div>
              <button onClick={() => setShowEdit(false)} className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 sm:p-8 space-y-8 overflow-y-auto scrollbar-hide flex-1">
              
              {/* Info Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4 border-b border-border/50 pb-2">
                  <Car className="w-4 h-4 text-primary" /> المعلومات الأساسية
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground">اسم السيارة</label>
                    <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl bg-background border border-border text-sm text-foreground focus:border-primary outline-none transition-all placeholder:text-muted-foreground" placeholder="مثال: يارس 2023" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground">سنة الصنع</label>
                    <input type="number" value={editModelYear} onChange={e => setEditModelYear(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl bg-background border border-border text-sm text-foreground focus:border-primary outline-none transition-all font-num text-left placeholder:text-muted-foreground" dir="ltr" placeholder="YYYY" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground">رقم اللوحة</label>
                    <input type="text" value={editPlateNumber} onChange={e => setEditPlateNumber(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl bg-background border border-border text-sm text-foreground focus:border-primary outline-none transition-all text-left font-num placeholder:text-muted-foreground" dir="ltr" placeholder="ABC 1234" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground">نوع القير</label>
                    <select value={editTransmission} onChange={e => setEditTransmission(e.target.value as any)}
                      className="w-full h-12 px-4 rounded-xl bg-background border border-border text-sm text-foreground focus:border-primary outline-none transition-all appearance-none cursor-pointer">
                      <option value="automatic" className="bg-card max-h-40">اوتوماتيك</option>
                      <option value="manual" className="bg-card">عادي</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Maintenance Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4 border-b border-border/50 pb-2">
                  <Settings className="w-4 h-4 text-emerald-500" /> إعدادات الصيانة
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground">نظام تغيير زيت المحرك</label>
                    <select value={editEngineOilType} onChange={e => setEditEngineOilType(e.target.value as any)}
                      className="w-full h-12 px-4 rounded-xl bg-background border border-border text-sm text-foreground focus:border-primary outline-none transition-all appearance-none cursor-pointer">
                      <option value="5000km" className="bg-card">كل 5,000 كم</option>
                      <option value="10000km" className="bg-card">كل 10,000 كم</option>
                      <option value="custom" className="bg-card">إعداد مخصص</option>
                    </select>
                  </div>
                </div>
                
                {editEngineOilType === "custom" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-4 rounded-2xl bg-secondary/5 border border-secondary/20 relative overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-secondary/40 to-transparent" />
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground">أيام تغيير الزيت (تنبيه بالزمن)</label>
                      <input type="number" value={editEngineOilCustomDays} onChange={e => setEditEngineOilCustomDays(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl bg-background border border-secondary/30 text-sm text-foreground focus:border-secondary outline-none transition-all font-num text-left" dir="ltr" placeholder="مثال: 90" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground">كيلومترات الزيت (تنبيه بالمسافة)</label>
                      <input type="number" value={editEngineOilCustomKm} onChange={e => setEditEngineOilCustomKm(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl bg-background border border-secondary/30 text-sm text-foreground focus:border-secondary outline-none transition-all font-num text-left" dir="ltr" placeholder="مثال: 7500" />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground">البطارية (الماركة والنوع)</label>
                    <input type="text" value={editBatteryBrand} onChange={e => setEditBatteryBrand(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl bg-background border border-border text-sm text-foreground focus:border-primary outline-none transition-all text-left placeholder:text-muted-foreground" dir="ltr" placeholder="مثال: AC Delco 70Ah" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground">مقاس الإطارات</label>
                    <input type="text" value={editTireSize} onChange={e => setEditTireSize(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl bg-background border border-border text-sm text-foreground focus:border-primary outline-none transition-all text-left placeholder:text-muted-foreground" dir="ltr" placeholder="مثال: 225/45 R18" />
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4 border-b border-border/50 pb-2">
                  <FileText className="w-4 h-4 text-amber-500" /> الوثائق وتواريخ الانتهاء
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground">الاستمارة</label>
                    <input type="date" value={editRegExpiry} onChange={e => setEditRegExpiry(e.target.value)}
                      className="w-full h-12 px-3 rounded-xl bg-background border border-border text-sm text-foreground focus:border-primary outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground">التأمين</label>
                    <input type="date" value={editInsExpiry} onChange={e => setEditInsExpiry(e.target.value)}
                      className="w-full h-12 px-3 rounded-xl bg-background border border-border text-sm text-foreground focus:border-primary outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground">الفحص الدوري</label>
                    <input type="date" value={editInspExpiry} onChange={e => setEditInspExpiry(e.target.value)}
                      className="w-full h-12 px-3 rounded-xl bg-background border border-border text-sm text-foreground focus:border-primary outline-none transition-all" />
                  </div>
                </div>

                <div className="mt-6 border-t border-border/50 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold text-foreground flex items-center gap-1.5"><UploadCloud className="w-3.5 h-3.5" /> فواتير الضمان والصيانة</label>
                    {userPlan === "free" && <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full border border-amber-500/20">ميزة مدفوعة</span>}
                  </div>
                  
                  {userPlan === "free" ? (
                    <div className="bg-muted p-4 rounded-xl border border-border text-center">
                      <Lock className="w-5 h-5 text-muted-foreground mx-auto mb-2 opacity-50" />
                      <p className="text-xs text-muted-foreground">قم بترقية باقتك لتتمكن من رفع وحفظ الفواتير للضمان.</p>
                      <Link href="/pricing" className="text-xs text-primary font-bold mt-2 inline-block">ترقية الباقة</Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {invoices.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                          {invoices.map((inv, idx) => (
                            <a key={idx} href={inv} target="_blank" rel="noreferrer" className="relative group block rounded-lg overflow-hidden border border-border aspect-video bg-muted/50">
                              <img src={inv} alt={`Invoice ${idx+1}`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
                              <div className="hidden absolute inset-0 flex items-center justify-center text-xs text-muted-foreground"><FileText className="w-4 h-4 mb-1" /> ملف</div>
                              <button type="button" onClick={(e) => { e.preventDefault(); setInvoices(prev => prev.filter((_, i) => i !== idx)); }} className="absolute top-1 left-1 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"><X className="w-3 h-3" /></button>
                            </a>
                          ))}
                        </div>
                      )}
                      <label className="flex items-center justify-center w-full h-12 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all text-sm text-muted-foreground font-medium gap-2">
                        {uploadingGeneric ? <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : <><UploadCloud className="w-4 h-4" /> اختر ملف للرفع</>}
                        <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleUploadGenericInvoice} disabled={uploadingGeneric} />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Extras Section */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground">ملاحظات عامة</label>
                  <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={3}
                    className="w-full p-4 rounded-xl bg-background border border-border text-sm text-foreground focus:border-primary outline-none transition-all resize-none placeholder:text-muted-foreground" placeholder="أضف أي ملاحظات إضافية هنا..." />
                </div>
              </div>

            </div>

            {/* Modal Footer (Fixed) */}
            <div className="p-6 sm:px-8 border-t border-border/50 bg-muted/40 shrink-0 flex items-center justify-end gap-3 rounded-b-3xl">
              <button onClick={() => setShowEdit(false)} className="px-6 py-3 rounded-xl border border-border text-foreground hover:bg-muted font-bold transition-all text-sm">إلغاء</button>
              <button onClick={handleSave} disabled={saving} className="px-8 py-3 rounded-xl bg-primary text-white font-black hover:bg-orange-600 transition-all shadow-xl shadow-primary/20 hover:shadow-primary/40 disabled:opacity-50 flex items-center justify-center gap-2 text-sm min-w-[140px] transform hover:-translate-y-0.5 active:translate-y-0">
                {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> حفظ التعديلات</>}
              </button>
            </div>
          </motion.div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm pointer-events-auto" dir="rtl" style={{ position: 'fixed' }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-card border border-destructive/30 p-8 rounded-3xl max-w-sm w-full shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4">
               <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">حذف السيارة</h3>
            <p className="text-muted-foreground text-sm mb-6">هل أنت متأكد من حذف <span className="text-foreground font-medium">{car.name}</span>؟ لا يمكن التراجع عن هذا الإجراء.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 rounded-xl border border-border text-foreground hover:bg-black/5 transition-colors">إلغاء</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-3 rounded-xl bg-destructive text-white font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              </button>
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </>
  );
}

function InviteDriverButton({ carId, carName, userPlan, onInvited }: { carId: string; carName: string; userPlan: string; onInvited: (name: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    // Programmatic enforcement: Only Family plans can invite drivers
    if (userPlan !== "family_small" && userPlan !== "family_large") {
      toast({ title: "ترقية مطلوبة", description: "إضافة أفراد العائلة متاحة فقط في خطط العائلة.", variant: "destructive" });
      setError("هذه الميزة متاحة فقط لخطط العائلة.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if(!session?.user) throw new Error("يجب تسجيل الدخول");

      // 1. Check if user with that email already exists
      const { data: users, error: userError } = await supabase.from("users").select("id, name, role").eq("email", email).limit(1);
      if(userError) throw userError;
      
      if(users && users.length > 0) {
        // Driver already exists. Link immediately.
        const driver = users[0];
        
        // Update user role to 'both' if they were 'manager' or 'admin', else 'driver'
        const newRole = driver.role === "manager" || driver.role === "admin" ? "both" : "driver";
        if(driver.role !== newRole) {
           await supabase.from("users").update({ role: newRole }).eq("id", driver.id);
        }

        // Assign to car
        const { error: carError } = await supabase.from("cars").update({
          driver_id: driver.id,
          driver_name: driver.name || "سائق"
        }).eq("id", carId);

        if(carError) throw carError;
        
        onInvited(driver.name || "سائق");
        toast({ title: "تم!", description: "تم ربط السائق بالسيارة بنجاح (مستخدم مسجل مسبقاً)" });
      } else {
        // Driver does NOT exist. Create invitation.
        const { error: invErr } = await supabase.from("invitations").insert({
          car_id: carId,
          driver_email: email,
          manager_id: session.user.id
        });
        
        if (invErr) {
          if (invErr.code === '23505') {
            throw new Error("هذا السائق لديه دعوة مسبقة قيد الانتظار لهذة السيارة");
          }
          throw invErr;
        }

        // Note: Edge functions / Supabase triggers can send the actual email, 
        // For now, in a backend-less setup, the row insertion is enough to show pending.
        
        onInvited("سائق مدعو");
        toast({ title: "تم!", description: "تم إرسال دعوة للمستخدم للتسجيل" });
      }
      
      setIsOpen(false);
      setEmail("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    }
    setSubmitting(false);
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="w-full flex items-center justify-center gap-2 bg-background hover:bg-black/5 border border-dashed border-border p-3 rounded-xl text-sm text-primary font-medium transition-colors">
        <UserPlus className="w-4 h-4" /> دعوة سائق للربط
      </button>
      {isOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm pointer-events-auto" dir="rtl" style={{ position: 'fixed' }}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-card border border-border p-6 rounded-3xl max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-foreground flex items-center gap-2"><UserPlus className="w-5 h-5 text-primary" /> دعوة سائق</h3>
              <button onClick={() => setIsOpen(false)} className="w-7 h-7 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">أدخل البريد الإلكتروني للسائق. إذا كان مسجلاً سيتم ربطه مباشرة، وإلا سيُنشأ له حساب تلقائياً.</p>
            {error && <p className="text-destructive text-xs mb-3 p-2 bg-destructive/10 rounded-lg border border-destructive/20">{error}</p>}
            <form onSubmit={handleInvite} className="space-y-4">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="driver@email.com"
                required dir="ltr" className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:border-primary outline-none text-sm transition-colors" />
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsOpen(false)} className="flex-1 py-2.5 rounded-xl border border-border text-foreground hover:bg-black/5 text-sm font-medium transition-colors">إلغاء</button>
                <button type="submit" disabled={submitting} className="flex-[2] py-2.5 rounded-xl bg-primary text-white text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Mail className="w-4 h-4" /> إرسال الدعوة</>}
                </button>
              </div>
            </form>
          </motion.div>
        </div>,
        document.body
      )}
    </>
  );
}

function ReportModal({ carId, carName, onReportSubmitted }: { carId: string; carName: string; onReportSubmitted?: (date: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mileage, setMileage] = useState("");
  const [oil, setOil] = useState<"normal" | "low" | "very_low">("normal");
  const [toggles, setToggles] = useState({ tires: "green", brakes: "green", ac: "green", dashboard: "green" });
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const dashboardLabel = toggles.dashboard === "green" ? "لا توجد" : toggles.dashboard === "yellow" ? "تحذير بسيط" : "تحذير خطير";
      const finalNotes = `[لوحة التحذيرات: ${dashboardLabel}]${notes ? `\nملاحظات السائق:\n${notes}` : ""}`;
      
      const { data: { session } } = await supabase.auth.getSession();
      if(!session?.user) throw new Error("يجب تسجيل الدخول");

      const { error: reportErr } = await supabase.from("driver_reports").insert({
        car_id: carId,
        driver_id: session.user.id,
        current_mileage: parseInt(mileage),
        oil_level: oil === "very_low" ? "low" : oil,
        tires_status: toggles.tires,
        brakes_status: toggles.brakes,
        ac_status: toggles.ac,
        notes: finalNotes || null,
      });

      if(reportErr) throw reportErr;
      
      const now = new Date().toISOString();
      const { error: carUpdErr } = await supabase.from("cars").update({ last_report_date: now }).eq("id", carId);
      if(carUpdErr) throw carUpdErr;
      setSuccess(true);
      if (onReportSubmitted) onReportSubmitted(new Date().toISOString());
      setTimeout(() => { setIsOpen(false); setSuccess(false); setMileage(""); setNotes(""); }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "حدث خطأ، حاول مرة أخرى");
    }
    setSubmitting(false);
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}
        className="w-full py-3 rounded-xl bg-primary text-white font-bold flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors shadow-lg shadow-primary/20">
        <PenTool className="w-4 h-4" /> تحديث حالة السيارة
      </button>

      {isOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm pointer-events-auto" dir="rtl" style={{ position: 'fixed' }}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-card border border-border p-6 sm:p-8 rounded-3xl max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">

            {success ? (
              <div className="flex flex-col items-center justify-center py-8 text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <p className="font-bold text-foreground">تم إرسال التقرير بنجاح!</p>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-primary" /> تقرير: {carName}
                </h2>
                {error && <p className="text-destructive text-sm mb-4 p-3 bg-destructive/10 rounded-xl border border-destructive/30">{error}</p>}
                <div className="mb-6 flex flex-col gap-3">
                  <button type="button" onClick={() => toast({ title: "قريباً", description: "خاصية الإبلاغ عن الحوادث ستكون متاحة قريباً." })} className="w-full py-4 rounded-xl bg-destructive/5 border border-destructive/20 text-destructive font-bold flex items-center justify-center gap-2 hover:bg-destructive/10 transition-colors">
                    <span className="text-lg">🚨</span> إبلاغ عن حادث
                  </button>
                  <button type="button" onClick={() => toast({ title: "قريباً", description: "خاصية الإبلاغ عن الأعطال ستكون متاحة قريباً." })} className="w-full py-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-500 font-bold flex items-center justify-center gap-2 hover:bg-amber-500/10 transition-colors">
                    <span className="w-3 h-3 rounded-full bg-destructive animate-pulse" /> إبلاغ عن بنشر / عطل
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 text-right">
                  <div className="space-y-4">
                    <div className="bg-card border border-border rounded-2xl overflow-hidden p-1 shadow-inner">
                      <div className="bg-card border border-border/50 p-3 rounded-xl flex items-center justify-between">
                        <span className="text-sm font-bold text-foreground flex items-center gap-2">
                          <span className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-primary text-xs">12</span> قراءة عداد الكيلومترات
                        </span>
                      </div>
                      <div className="p-4">
                        <input type="number" required min="0" value={mileage} onChange={e => setMileage(e.target.value)} placeholder="أدخل قراءة العداد الحالية"
                          className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:border-primary outline-none font-num transition-colors placeholder:text-muted-foreground/50 text-left" dir="ltr" />
                      </div>
                    </div>

                    <div className="bg-card border border-border rounded-2xl overflow-hidden p-1 shadow-inner">
                      <div className="bg-card border border-border/50 p-3 rounded-xl flex items-center justify-between">
                        <span className="text-sm font-bold text-foreground flex items-center gap-2">
                          <span className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-primary text-xs">🛢️</span> مستوى زيت المحرك
                        </span>
                      </div>
                      <div className="p-4 grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => setOil("normal")} className={cn("py-2.5 rounded-xl border text-sm font-medium transition-colors flex items-center justify-center gap-2", oil === "normal" ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" : "bg-background border-border text-muted-foreground")}><CheckCircle className="w-4 h-4" /> طبيعي</button>
                        <button type="button" onClick={() => setOil("low")} className={cn("py-2.5 rounded-xl border text-sm font-medium transition-colors flex items-center justify-center gap-2", oil === "low" ? "bg-amber-500/10 border-amber-500 text-amber-500" : "bg-background border-border text-muted-foreground")}><AlertTriangle className="w-4 h-4" /> منخفض قليلاً</button>
                        <button type="button" onClick={() => setOil("very_low")} className={cn("col-span-2 py-2.5 rounded-xl border text-sm font-medium transition-colors flex items-center justify-center gap-2", oil === "very_low" ? "bg-destructive/10 border-destructive text-destructive" : "bg-background border-border text-muted-foreground")}><X className="w-4 h-4" /> منخفض جداً / يحتاج تغيير</button>
                      </div>
                    </div>

                    <div className="bg-card border border-border rounded-2xl overflow-hidden p-1 shadow-inner">
                      <div className="bg-card border border-border/50 p-3 rounded-xl flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-foreground flex items-center gap-2">
                          <span className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-primary text-xs">⚙️</span> حالة المركبة العامة
                        </span>
                      </div>
                      <div className="space-y-3 p-2">
                        {[
                          { id: "tires", label: "الإطارات", labels: ["جيدة", "تحتاج تعبئة هواء", "تالفة"] },
                          { id: "brakes", label: "الفرامل", labels: ["طبيعية", "صوت غريب", "ضعيفة"] },
                          { id: "ac", label: "المكيف / التبريد", labels: ["يعمل جيداً", "يحتاج فحص", "لا يعمل"] },
                          { id: "dashboard", label: "لوحة التحذيرات", labels: ["لا توجد", "تحذير بسيط", "تحذير خطير"] }
                        ].map(item => (
                          <div key={item.id} className="flex flex-col gap-2 p-3 rounded-xl bg-background/50 border border-border/50">
                            <span className="text-sm text-foreground font-medium">{item.label}</span>
                            <div className="grid grid-cols-3 gap-1">
                              {["green", "yellow", "red"].map((color, idx) => (
                                <button key={color} type="button"
                                  onClick={() => setToggles(p => ({ ...p, [item.id]: color }))}
                                  className={cn("py-1.5 px-1 rounded-lg text-xs font-medium border flex items-center justify-center gap-1 transition-all",
                                    toggles[item.id as keyof typeof toggles] === color
                                      ? (color === "green" ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : color === "yellow" ? "bg-amber-500/20 border-amber-500 text-amber-400" : "bg-destructive/20 border-destructive text-destructive")
                                      : "bg-background border-transparent text-muted-foreground hover:bg-black/5")}>
                                  {item.labels[idx]}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-card border border-border rounded-2xl overflow-hidden p-1 shadow-inner">
                      <div className="bg-card border border-border/50 p-3 rounded-xl flex items-center justify-between">
                        <span className="text-sm font-bold text-foreground flex items-center gap-2">
                          <span className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-primary text-xs">📸</span> صور المركبة (اختياري)
                        </span>
                      </div>
                      <div className="p-4 grid grid-cols-2 gap-3">
                        {[
                          { id: "front", label: "الأمام" },
                          { id: "back", label: "الخلف" },
                          { id: "right", label: "اليمين" },
                          { id: "left", label: "اليسار" },
                        ].map(side => (
                          <div key={side.id} className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed border-border/50 bg-background/30 hover:bg-black/5 transition-colors cursor-pointer text-muted-foreground hover:text-foreground group">
                            <div className="w-10 h-10 rounded-full bg-black/5 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                              <span className="text-xl">📷</span>
                            </div>
                            <span className="text-xs font-medium">{side.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-card border border-border rounded-2xl overflow-hidden p-1 shadow-inner">
                      <div className="bg-card border border-border/50 p-3 rounded-xl flex items-center justify-between">
                        <span className="text-sm font-bold text-foreground flex items-center gap-2">
                          <span className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-primary text-xs">📝</span> ملاحظات السائق (اختياري)
                        </span>
                      </div>
                      <div className="p-4">
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="أي ملاحظة إضافية حول حالة السيارة هذا الأسبوع..."
                          className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:border-primary outline-none resize-none text-sm transition-colors" />
                      </div>
                    </div>
                  </div>
                  <div className="pt-2">
                    <button type="submit" disabled={submitting} className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold hover:from-orange-600 hover:to-amber-600 transition-colors shadow-lg shadow-orange-500/20 disabled:opacity-50 flex items-center justify-center gap-2">
                      {submitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><CheckCircle className="w-5 h-5" /> إرسال النموذج الأسبوعي</>}
                    </button>
                    <p className="text-center text-xs text-muted-foreground mt-3">سيتم إرسال النموذج لمدير الصيانة فوراً</p>
                    <button type="button" onClick={() => setIsOpen(false)} className="w-full py-3 rounded-xl border border-border text-foreground hover:bg-black/5 font-medium transition-colors mt-3">إلغاء</button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </div>,
        document.body
      )}
    </>
  );
}
