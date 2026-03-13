import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Mail, Car, Clock, CheckCircle, Trash2, UserMinus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

type DriverData = {
  id: string;
  email: string;
  name: string;
  status: "pending" | "registered";
  carId: string;
  carName: string;
};

export function ManagerDrivers() {
  const { user } = useAuth();
  const [drivers, setDrivers] = useState<DriverData[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const userDrivers: DriverData[] = [];

      // 1. Fetch pending invitations sent by this manager
      const { data: invites, error: invitesErr } = await supabase
        .from("invitations")
        .select("id, invited_email, status, car_id, cars(name)")
        .eq("invited_by", user.id)
        .eq("status", "pending");

      if (invitesErr) throw invitesErr;
      
      if (invites) {
        invites.forEach((inv: any) => {
          userDrivers.push({
            id: inv.id,
            email: inv.invited_email,
            name: "سائق مدعو",
            status: "pending",
            carId: inv.car_id,
            carName: inv.cars?.name || "سيارة",
          });
        });
      }

      // 2. Fetch registered drivers (users assigned to cars owned by this manager)
      const { data: cars, error: carsErr } = await supabase
        .from("cars")
        .select("id, name, driver_id, driver_name, users!cars_driver_id_fkey(email)")
        .eq("owner_id", user.id)
        .not("driver_id", "is", null);

      if (carsErr) throw carsErr;

      if (cars) {
        cars.forEach((car: any) => {
          userDrivers.push({
            id: car.driver_id,
            email: car.users?.email || "",
            name: car.driver_name || "سائق",
            status: "registered",
            carId: car.id,
            carName: car.name,
          });
        });
      }

      setDrivers(userDrivers);
    } catch (err) {
      console.error("Failed to fetch drivers:", err);
      toast({ title: "خطأ", description: "لم نتمكن من جلب بيانات السائقين", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (inviteId: string) => {
    if (!confirm("هل أنت متأكد من إلغاء هذه الدعوة؟")) return;
    setActionLoading(inviteId);
    try {
      const { error } = await supabase.from("invitations").delete().eq("id", inviteId);
      if (error) throw error;
      toast({ title: "تم", description: "تم إلغاء الدعوة بنجاح" });
      await fetchDrivers();
    } catch (err) {
      console.error(err);
      toast({ title: "خطأ", description: "فشل إلغاء الدعوة", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemove = async (carId: string, driverId: string) => {
    if (!confirm("هل أنت متأكد من إزالة هذا السائق من السيارة؟")) return;
    setActionLoading(`${carId}-${driverId}`);
    try {
      const { error } = await supabase
        .from("cars")
        .update({ driver_id: null, driver_name: null })
        .eq("id", carId);
        
      if (error) throw error;
      toast({ title: "تم", description: "تمت إزالة السائق من السيارة بنجاح" });
      await fetchDrivers();
    } catch (err) {
      console.error(err);
      toast({ title: "خطأ", description: "فشل إزالة السائق", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">جاري تحميل السائقين...</p>
      </div>
    );
  }

  if (drivers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-card border border-border/50 rounded-3xl text-center px-4">
        <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
          <Users className="w-10 h-10 text-secondary opacity-80" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">لا يوجد أي سائقين أو دعوات</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          لم تقم بدعوة أي سائق حتى الآن. قم بالذهاب لإدارة السيارات وإرسال دعوة لسائقك الأول.
        </p>
      </div>
    );
  }

  const pendingDrivers = drivers.filter(d => d.status === "pending");
  const activeDrivers = drivers.filter(d => d.status === "registered");

  return (
    <div className="space-y-8">
      {pendingDrivers.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-white">دعوات قيد الانتظار ({pendingDrivers.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingDrivers.map((driver, i) => (
              <motion.div key={driver.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                className="bg-card border border-amber-500/20 rounded-2xl p-5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl -mr-10 -mt-10" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                      <Mail className="w-5 h-5" />
                    </div>
                    <span className="bg-amber-500/10 text-amber-500 text-[10px] font-bold px-2 py-1 rounded border border-amber-500/20">قيد الانتظار</span>
                  </div>
                  <h3 className="text-sm font-medium text-slate-300 mb-1 truncate" dir="ltr">{driver.email}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50">
                    <Car className="w-3.5 h-3.5" />
                    <span className="truncate">دعوة لقيادة: <strong className="text-white font-normal">{driver.carName}</strong></span>
                  </div>
                  
                  <button 
                    onClick={() => handleRevoke(driver.id)}
                    disabled={actionLoading === driver.id}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl text-xs font-bold hover:bg-destructive/20 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === driver.id ? <div className="w-3 h-3 border border-destructive border-t-transparent rounded-full animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    إلغاء الدعوة
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {activeDrivers.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4 mt-6">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-white">السائقين النشطين ({activeDrivers.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeDrivers.map((driver, i) => (
              <motion.div key={`${driver.id}-${driver.carId}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                className="bg-card border border-border/50 hover:border-emerald-500/30 transition-colors rounded-2xl p-5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-lg border border-secondary/20 shadow-inner">
                      {driver.name.charAt(0)}
                    </div>
                    <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded border border-emerald-500/20">نشط</span>
                  </div>
                  <h3 className="font-bold text-white text-base mb-0.5 truncate">{driver.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3 truncate" dir="ltr">{driver.email}</p>
                  
                  <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-3 pt-3 border-t border-border/50">
                    <Car className="w-3.5 h-3.5 text-secondary" />
                    <span className="truncate">يقود: <strong className="text-white">{driver.carName}</strong></span>
                  </div>

                  <button 
                    onClick={() => handleRemove(driver.carId, driver.id)}
                    disabled={actionLoading === `${driver.carId}-${driver.id}`}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 bg-card border border-border text-muted-foreground rounded-xl text-xs font-bold hover:text-destructive hover:border-destructive/50 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === `${driver.carId}-${driver.id}` ? <div className="w-3 h-3 border border-muted-foreground border-t-transparent rounded-full animate-spin" /> : <UserMinus className="w-3.5 h-3.5" />}
                    إزالة من السيارة
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
