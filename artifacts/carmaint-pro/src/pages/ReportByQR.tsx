import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { Car, AlertTriangle, PenTool, CheckCircle, Gauge, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

export default function ReportByQR({ params }: { params?: { carId: string } }) {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const carId = params?.carId || "";
  
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [mileage, setMileage] = useState("");
  const [oil, setOil] = useState<"normal" | "low" | "very_low">("normal");
  const [toggles, setToggles] = useState({ tires: "green", brakes: "green", ac: "green", dashboard: "green" });
  const [notes, setNotes] = useState("");
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!carId) return;
    const fetchCar = async () => {
      try {
        const { data, error } = await supabase.from("cars").select("*").eq("id", carId).single();
        if (error) throw error;
        setCar(data);
      } catch (err) {
        console.error("Error fetching car:", err);
      }
      setLoading(false);
    };
    fetchCar();
  }, [carId]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 pb-12">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-foreground mb-2">السيارة غير موجودة</h2>
        <p className="text-muted-foreground mb-8">عذراً، لم نتمكن من العثور على بيانات لهذه السيارة.</p>
        <button onClick={() => setLocation("/dashboard")} className="px-6 py-3 rounded-xl bg-primary text-white font-bold transition-colors">
          العودة للرئيسية
        </button>
      </div>
    );
  }

  // Show beautiful message if user is not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background" dir="rtl">
        {/* Background Decor */}
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[100px] pointer-events-none" />
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
          <div className="bg-card/80 backdrop-blur-xl rounded-[2.5rem] p-8 sm:p-10 border border-border/50 shadow-2xl text-center relative overflow-hidden">
            {/* Top Gradient Line */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary via-orange-500 to-amber-500" />
            
            {/* Car Icon */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/10">
              <Car className="w-10 h-10 text-primary" />
            </div>
            
            {/* Car Name */}
            <h1 className="text-2xl font-black text-foreground mb-2 tracking-tight">
              فحص سيارة: {car.name}
            </h1>
            <p className="text-muted-foreground text-sm mb-2 font-num">
              موديل {car.model_year} {car.plate_number ? `• ${car.plate_number}` : ''}
            </p>
            
            {/* Divider */}
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent mx-auto my-6" />
            
            {/* Message */}
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 mb-8">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🔐</span>
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">يجب تسجيل الدخول أولاً</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                لرفع تقرير فحص هذه السيارة، يجب أن يكون لديك حساب في التطبيق. سجّل دخولك أو أنشئ حساباً جديداً مجاناً.
              </p>
            </div>
            
            {/* Buttons */}
            <div className="flex flex-col gap-3">
              <button onClick={() => setLocation("/login")} 
                className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-base shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                <Gauge className="w-5 h-5" /> تسجيل الدخول
              </button>
              <button onClick={() => setLocation("/register")} 
                className="w-full py-4 rounded-2xl bg-card border border-border hover:border-primary/40 text-foreground font-bold text-base hover:shadow-lg transition-all flex items-center justify-center gap-2">
                إنشاء حساب مجاني
              </button>
            </div>
            
            <p className="text-xs text-muted-foreground mt-6">سيتم تحويلك تلقائياً لهذه الصفحة بعد تسجيل الدخول</p>
          </div>
        </motion.div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);
    setError(null);
    try {
      const dashboardLabel = toggles.dashboard === "green" ? "لا توجد" : toggles.dashboard === "yellow" ? "تحذير بسيط" : "تحذير خطير";
      const finalNotes = `[لوحة التحذيرات: ${dashboardLabel}]${notes ? `\nملاحظات السائق:\n${notes}` : ""}`;
      
      const { error: reportErr } = await supabase.from("driver_reports").insert({
        car_id: car.id,
        driver_id: user.id,
        current_mileage: parseInt(mileage),
        oil_level: oil === "very_low" ? "low" : oil,
        tires_status: toggles.tires,
        brakes_status: toggles.brakes,
        ac_status: toggles.ac,
        notes: finalNotes || null,
      });
      if(reportErr) throw reportErr;
      
      const now = new Date().toISOString();
      const numMileage = parseInt(mileage);
      const updateData: any = { last_report_date: now };
      
      // Update car's last mileage if provided and valid
      if (!isNaN(numMileage) && numMileage > 0) {
        updateData.last_mileage = numMileage;
      }
      
      const { error: carUpdErr } = await supabase.from("cars").update(updateData).eq("id", car.id);
      if(carUpdErr) throw carUpdErr;
      
      setSuccess(true);
      toast({ title: "شكراً لك", description: "تم إرسال التقرير بنجاح." });
      setTimeout(() => setLocation("/dashboard"), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "حدث خطأ، حاول مرة أخرى");
    }
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-32 text-center flex flex-col items-center justify-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center shadow-xl shadow-emerald-500/10">
            <CheckCircle className="w-12 h-12 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-foreground mb-2">تم الإرسال بنجاح!</h2>
            <p className="text-muted-foreground font-medium">تم رفع التقرير وتحديث حالة السيارة.</p>
          </div>
          <button onClick={() => setLocation("/dashboard")} className="px-8 py-3 rounded-xl bg-card border border-border hover:border-emerald-500/50 hover:bg-emerald-500/5 text-foreground font-bold transition-all mt-4">
            العودة للوحة التحكم
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12 sm:py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border shadow-2xl rounded-[2rem] overflow-hidden relative">
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-primary to-orange-500" />
        
        <div className="p-6 sm:p-10">
          <h2 className="text-2xl font-black text-foreground mb-1 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Gauge className="w-6 h-6" />
            </div>
            فحص سيارة: {car.name}
          </h2>
          <p className="text-muted-foreground text-sm font-medium mb-8">({car.plate_number}) - موديل {car.model_year}</p>
          
          {error && <p className="text-destructive text-sm mb-6 p-4 bg-destructive/10 rounded-xl border border-destructive/20 font-bold">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-6 text-right">
            <div className="space-y-4">
              <div className="bg-background border border-border rounded-2xl overflow-hidden p-1 shadow-inner">
                <div className="bg-card border border-border/50 p-3 rounded-xl flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-primary text-xs">12</span> قراءة عداد الكيلومترات
                  </span>
                </div>
                <div className="p-4">
                  <input type="number" required min="0" value={mileage} onChange={e => setMileage(e.target.value)} placeholder="أدخل قراءة العداد الحالية"
                    className="w-full px-4 py-3.5 rounded-xl bg-card border border-border text-foreground focus:border-primary outline-none font-num transition-colors placeholder:text-muted-foreground/50 text-left" dir="ltr" />
                </div>
              </div>

              <div className="bg-background border border-border rounded-2xl overflow-hidden p-1 shadow-inner">
                <div className="bg-card border border-border/50 p-3 rounded-xl flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-primary text-xs">🛢️</span> مستوى زيت المحرك
                  </span>
                </div>
                <div className="p-4 flex flex-col sm:flex-row gap-2">
                  <button type="button" onClick={() => setOil("normal")} className={cn("flex-1 py-3 rounded-xl border text-sm font-bold transition-colors flex items-center justify-center gap-2", oil === "normal" ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" : "bg-card border-border text-muted-foreground hover:bg-black/5")}><CheckCircle className="w-4 h-4" /> طبيعي</button>
                  <button type="button" onClick={() => setOil("low")} className={cn("flex-1 py-3 rounded-xl border text-sm font-bold transition-colors flex items-center justify-center gap-2", oil === "low" ? "bg-amber-500/10 border-amber-500 text-amber-500" : "bg-card border-border text-muted-foreground hover:bg-black/5")}><AlertTriangle className="w-4 h-4" /> منخفض</button>
                  <button type="button" onClick={() => setOil("very_low")} className={cn("flex-1 py-3 rounded-xl border text-sm font-bold transition-colors flex items-center justify-center gap-2", oil === "very_low" ? "bg-destructive/10 border-destructive text-destructive" : "bg-card border-border text-muted-foreground hover:bg-black/5")}><X className="w-4 h-4" /> يحتاج تغيير</button>
                </div>
              </div>

              <div className="bg-background border border-border rounded-2xl overflow-hidden p-1 shadow-inner">
                <div className="bg-card border border-border/50 p-3 rounded-xl flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-foreground flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-primary text-xs">⚙️</span> حالة المركبة
                  </span>
                </div>
                <div className="space-y-3 p-2">
                  {[
                    { id: "tires", label: "الإطارات", labels: ["جيدة", "تحتاج تعبئة", "تالفة"] },
                    { id: "brakes", label: "الفرامل", labels: ["طبيعية", "صوت غريب", "ضعيفة"] },
                    { id: "ac", label: "المكيف", labels: ["يعمل", "يحتاج فحص", "لا يعمل"] },
                    { id: "dashboard", label: "لوحة التحذير", labels: ["لا توجد", "بسيط", "خطير"] }
                  ].map(item => (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/50 shadow-sm">
                      <span className="text-sm text-foreground font-bold">{item.label}</span>
                      <div className="flex bg-background border border-border rounded-lg p-1">
                        {["green", "yellow", "red"].map((color, idx) => (
                          <button key={color} type="button"
                            onClick={() => setToggles(p => ({ ...p, [item.id]: color }))}
                            className={cn("px-4 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap",
                              toggles[item.id as keyof typeof toggles] === color
                                ? (color === "green" ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20" : color === "yellow" ? "bg-amber-500 text-white shadow-md shadow-amber-500/20" : "bg-destructive text-white shadow-md shadow-destructive/20")
                                : "text-muted-foreground hover:bg-black/5")}>
                            {item.labels[idx]}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-background border border-border rounded-2xl overflow-hidden p-1 shadow-inner">
                <div className="bg-card border border-border/50 p-3 rounded-xl flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-foreground flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-primary text-xs">📝</span> ملاحظات أو أعطال
                  </span>
                </div>
                <div className="p-2">
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="اكتب أي ملاحظات إضافية هنا..." rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground focus:border-primary outline-none transition-colors placeholder:text-muted-foreground/50 resize-none font-medium text-sm" />
                </div>
              </div>
            </div>

            <button type="submit" disabled={submitting}
              className="w-full py-4 rounded-2xl bg-primary text-white font-black text-lg transition-all shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 flex items-center justify-center gap-3 mt-8">
              {submitting ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><PenTool className="w-5 h-5" /> إرسال التقرير المباشر</>}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
