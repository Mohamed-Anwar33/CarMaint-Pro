import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Car, ShieldAlert, CalendarClock, ChevronLeft, ChevronRight, CheckCircle2, Lock, Crown, Upload } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

type TransmissionType = "automatic" | "manual";
type EngineOilType = "5000km" | "10000km" | "custom";

interface CarFormData {
  name: string;
  modelYear: number | null;
  transmissionType: TransmissionType;
  engineOilType: EngineOilType;
  coolantFillDate: string;
  registrationExpiry: string;
  insuranceExpiry: string;
  inspectionExpiry: string;
  batteryInstallDate: string;
  batteryWarrantyMonths: number | null;
  tireInstallDate: string;
  tireWarrantyMonths: number | null;
  lastMileage: number | null;
  plateNumber: string;
  notes: string;
  engineOilCustomDays: number | null;
  engineOilCustomKm: number | null;
  batteryBrand: string;
  tireSize: string;
}

export default function Onboarding() {
  const { user, refreshUser } = useAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [error, setError] = useState("");
  const [checkingLimit, setCheckingLimit] = useState(true);
  const [limitReached, setLimitReached] = useState(false);

  useEffect(() => {
    if (!user) {
      setCheckingLimit(false);
      return;
    }
    
    async function checkCarsLimit() {
      try {
        const { count, error } = await supabase
          .from("cars")
          .select("*", { count: 'exact', head: true })
          .eq("owner_id", user!.id);
          
        if (error) throw error;
        
        const limit = user!.plan === "family_large" ? Infinity : user!.plan === "family_small" ? 5 : 1;
        if ((count || 0) >= limit) setLimitReached(true);
      } catch (err) {
        console.error("Failed to check cars limit:", err);
      } finally {
        setCheckingLimit(false);
      }
    }
    
    checkCarsLimit();
  }, [user]);

  const [formData, setFormData] = useState<CarFormData>({
    name: "",
    modelYear: null,
    transmissionType: "automatic",
    engineOilType: "10000km",
    coolantFillDate: "",
    registrationExpiry: "",
    insuranceExpiry: "",
    inspectionExpiry: "",
    batteryInstallDate: "",
    batteryWarrantyMonths: null,
    tireInstallDate: "",
    tireWarrantyMonths: null,
    lastMileage: null,
    plateNumber: "",
    notes: "",
    engineOilCustomDays: null,
    engineOilCustomKm: null,
    batteryBrand: "",
    tireSize: "",
  });

  const update = (key: keyof CarFormData, value: string | number | null) => setFormData(prev => ({ ...prev, [key]: value }));

  const handleNext = () => {
    if (step < 4) setStep(s => s + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);
    setError("");
    try {
      const { error: insertError } = await supabase.from("cars").insert({
        owner_id: user.id,
        name: formData.name,
        model_year: formData.modelYear,
        transmission_type: formData.transmissionType,
        engine_oil_type: formData.engineOilType,
        coolant_fill_date: formData.coolantFillDate || null,
        registration_expiry: formData.registrationExpiry || null,
        insurance_expiry: formData.insuranceExpiry || null,
        inspection_expiry: formData.inspectionExpiry || null,
        battery_install_date: formData.batteryInstallDate || null,
        battery_warranty_months: formData.batteryWarrantyMonths || null,
        tire_install_date: formData.tireInstallDate || null,
        tire_warranty_months: formData.tireWarrantyMonths || null,
        tire_size: formData.tireSize || null,
        last_mileage: formData.lastMileage || null,
        plate_number: formData.plateNumber || null,
        notes: formData.notes || null,
        engine_oil_custom_days: formData.engineOilType === 'custom' ? formData.engineOilCustomDays : null,
        engine_oil_custom_km: formData.engineOilType === 'custom' ? formData.engineOilCustomKm : null,
        battery_brand: formData.batteryBrand || null,
      });

      if (insertError) throw insertError;

      // Update onboarding status
      const { error: updateError } = await supabase
        .from("users")
        .update({ onboarding_completed: true })
        .eq("id", user.id);
        
      if (updateError) throw updateError;

      await refreshUser();
      setLocation("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "حدث خطأ أثناء الحفظ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, title: "مواصفات السيارة", icon: <Car className="w-5 h-5" /> },
    { num: 2, title: "السوائل الأساسية", icon: <ShieldAlert className="w-5 h-5" /> },
    { num: 3, title: "الوثائق الرسمية", icon: <CalendarClock className="w-5 h-5" /> },
    { num: 4, title: "البطارية والإطارات", icon: <CheckCircle2 className="w-5 h-5" /> }
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          {limitReached ? "تجاوز الحد الأقصى" : "إضافة سيارتك الأساسية"}
        </h1>
        
        {checkingLimit ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : limitReached ? (
          <div className="max-w-md mx-auto p-8 bg-card border border-destructive/30 rounded-3xl text-center shadow-xl">
            <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">لقد وصلت للحد الأقصى</h2>
            <p className="text-muted-foreground mb-8">لا يمكنك إضافة المزيد من السيارات في خطتك الحالية. قم بترقية حسابك للتمتع بإضافة المزيد من السيارات وميزات إضافية.</p>
            <div className="flex gap-3">
              <button onClick={() => setLocation("/dashboard")} className="flex-1 py-3 border border-border rounded-xl text-white hover:bg-white/5 transition-colors">العودة للرئيسية</button>
              <button onClick={() => setLocation("/pricing")} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">ترقية الحساب</button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-border -z-10" />
            <div className="absolute right-0 top-1/2 h-0.5 bg-primary transition-all duration-500 ease-out -z-10" style={{ width: `${((step - 1) / 3) * 100}%` }} />
            {steps.map((s) => (
              <div key={s.num} className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${step >= s.num ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-card border border-border text-muted-foreground'}`}>
                  {s.icon}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${step >= s.num ? 'text-white' : 'text-muted-foreground'}`}>{s.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {!checkingLimit && !limitReached && (
        <div className="bg-card rounded-3xl p-6 sm:p-10 border border-border/50 shadow-xl min-h-[400px] relative overflow-hidden">
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">{error}</div>
        )}
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white mb-6">المعلومات الأساسية</h2>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">اسم/نوع السيارة <span className="text-destructive">*</span></label>
                  <input type="text" placeholder="مثال: تويوتا كامري" value={formData.name}
                    onChange={e => update('name', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-white focus:border-primary outline-none transition-colors" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4 pt-4 border-t border-border/50">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">رقم اللوحة (اختياري)</label>
                      <input type="text" placeholder="مثال: أ ب ج 1234" value={formData.plateNumber}
                        onChange={e => update('plateNumber', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-background border border-border text-white focus:border-primary outline-none transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">ملاحظات</label>
                      <input type="text" placeholder="مثال: تأمين شامل، فحص..." value={formData.notes}
                        onChange={e => update('notes', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-background border border-border text-white focus:border-primary outline-none transition-colors" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">سنة الصنع <span className="text-destructive">*</span></label>
                    <input type="number" placeholder="2024" value={formData.modelYear || ''}
                      onChange={e => update('modelYear', parseInt(e.target.value) || null)}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border text-white focus:border-primary outline-none font-num transition-colors" dir="ltr" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">نوع القير</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["automatic", "manual"] as TransmissionType[]).map(t => (
                        <button key={t} onClick={() => update('transmissionType', t)}
                          className={`py-3 rounded-xl text-sm font-medium border transition-all ${formData.transmissionType === t ? 'bg-primary/10 border-primary text-primary' : 'bg-background border-border text-muted-foreground hover:border-border/80'}`}>
                          {t === 'automatic' ? 'اوتوماتيك' : 'عادي'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-2 pt-4">
                  <label className="text-sm font-medium text-slate-300">نوع زيت المحرك (تكرار التغيير)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["5000km", "10000km", "custom"] as EngineOilType[]).map(t => (
                      <button key={t} onClick={() => update('engineOilType', t)}
                        className={`py-3 rounded-xl text-sm font-medium border font-num transition-all ${formData.engineOilType === t ? 'bg-primary/10 border-primary text-primary' : 'bg-background border-border text-muted-foreground hover:border-border/80'}`}>
                        {t === '5000km' ? '5,000 كم' : t === '10000km' ? '10,000 كم' : 'مخصص'}
                      </button>
                    ))}
                  </div>
                  {formData.engineOilType === "custom" && (
                    <div className="grid grid-cols-2 gap-4 mt-4 p-4 rounded-xl bg-background border border-border">
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">فترة التغيير بالأيام</label>
                        <input type="number" placeholder="مثال: 90" value={formData.engineOilCustomDays || ''}
                          onChange={e => update('engineOilCustomDays', parseInt(e.target.value) || null)}
                          className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm text-white focus:border-primary outline-none font-num transition-colors" dir="ltr" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">فترة التغيير بالكيلومتر</label>
                        <input type="number" placeholder="مثال: 5000" value={formData.engineOilCustomKm || ''}
                          onChange={e => update('engineOilCustomKm', parseInt(e.target.value) || null)}
                          className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm text-white focus:border-primary outline-none font-num transition-colors" dir="ltr" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white mb-6">مواعيد السوائل (اختياري)</h2>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">تاريخ تعبئة ماء الرديتر (Coolant)</label>
                  <input type="date" value={formData.coolantFillDate} onChange={e => update('coolantFillDate', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-white focus:border-primary outline-none [color-scheme:dark] transition-colors" />
                  <p className="text-xs text-muted-foreground">سيتم تذكيرك تلقائياً بعد 6 أشهر من هذا التاريخ لفحص المستوى.</p>
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white mb-6">تواريخ الانتهاء للوثائق (اختياري)</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    { key: 'registrationExpiry', label: 'الاستمارة (Registration)' },
                    { key: 'insuranceExpiry', label: 'التأمين (Insurance)' },
                    { key: 'inspectionExpiry', label: 'الفحص الدوري' },
                  ].map(f => (
                    <div key={f.key} className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">{f.label}</label>
                      <input type="date" value={formData[f.key as keyof CarFormData] as string}
                        onChange={e => update(f.key as keyof CarFormData, e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-background border border-border text-white focus:border-primary outline-none [color-scheme:dark] transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white mb-6">القطع الاستهلاكية وقراءة العداد (اختياري)</h2>
                {/* Mileage */}
                <div className="bg-background p-5 rounded-2xl border border-border space-y-3">
                  <h3 className="font-medium text-white">قراءة العداد (الكيلومتراج)</h3>
                  <p className="text-xs text-muted-foreground">سيتم حساب موعد تغيير الزيت القادم تلقائياً بناءً على نوع الزيت المختار.</p>
                  <input type="number" placeholder="مثال: 45000" value={formData.lastMileage || ''}
                    onChange={e => update('lastMileage', parseInt(e.target.value) || null)}
                    className="w-full px-4 py-3 rounded-xl bg-card border border-border text-white focus:border-primary outline-none font-num transition-colors" dir="ltr" />
                </div>
                {/* Battery */}
                <div className="bg-background p-5 rounded-2xl border border-border space-y-4">
                  <h3 className="font-medium text-white">سجل البطارية</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">تاريخ تغيير البطارية</label>
                      <input type="date" value={formData.batteryInstallDate} onChange={e => update('batteryInstallDate', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm text-white focus:border-primary outline-none [color-scheme:dark] transition-colors" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">العمر المتوقع (أشهر)</label>
                      <input type="number" placeholder="مثال: 24" value={formData.batteryWarrantyMonths || ''}
                        onChange={e => update('batteryWarrantyMonths', parseInt(e.target.value) || null)}
                        className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm text-white focus:border-primary outline-none font-num transition-colors" dir="ltr" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">الماركة / النوع</label>
                      <input type="text" placeholder="مثال: Bosch 60Ah" value={formData.batteryBrand || ''}
                        onChange={e => update('batteryBrand', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm text-white focus:border-primary outline-none transition-colors" dir="ltr" />
                    </div>
                  </div>
                </div>
                {/* Tires */}
                <div className="bg-background p-5 rounded-2xl border border-border space-y-4">
                  <h3 className="font-medium text-white">سجل الإطارات</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">تاريخ تغيير الإطارات</label>
                      <input type="date" value={formData.tireInstallDate} onChange={e => update('tireInstallDate', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm text-white focus:border-primary outline-none [color-scheme:dark] transition-colors" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">العمر المتوقع (أشهر)</label>
                      <input type="number" placeholder="مثال: 36" value={formData.tireWarrantyMonths || ''}
                        onChange={e => update('tireWarrantyMonths', parseInt(e.target.value) || null)}
                        className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm text-white focus:border-primary outline-none font-num transition-colors" dir="ltr" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">الماركة / المقاس</label>
                      <input type="text" placeholder="مثال: Michelin 205/55 R16" value={formData.tireSize || ''}
                        onChange={e => update('tireSize', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm text-white focus:border-primary outline-none transition-colors" dir="ltr" />
                    </div>
                  </div>
                </div>
                {user?.plan === 'free' ? (
                  <div className="p-4 rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 flex items-start justify-between gap-4 mt-6">
                    <div>
                      <h4 className="text-sm font-medium text-amber-500 flex items-center gap-1.5 mb-1"><Lock className="w-4 h-4" /> حفظ الفواتير للضمان</h4>
                      <p className="text-xs text-muted-foreground">هذه الميزة متاحة لمشتركي باقات البرو والعائلة.</p>
                    </div>
                    <button onClick={() => setShowUpgradeModal(true)} className="shrink-0 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-bold">ترقية</button>
                  </div>
                ) : (
                  <div className="bg-background p-5 rounded-2xl border border-border space-y-4 mt-6">
                    <h3 className="font-medium text-white flex items-center gap-2"><Upload className="w-4 h-4 text-primary" /> حفظ الفواتير للضمان</h3>
                    <p className="text-xs text-muted-foreground">قم برفع صور الفواتير والضمانات الخاصة بالبطارية أو الإطارات للرجوع إليها لاحقاً.</p>
                    <div 
                      onClick={() => alert("سيتم تفعيل خدمة التخزين السحابي قريباً")}
                      className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:bg-white/5 transition-colors cursor-pointer group">
                      <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                        <Upload className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium text-slate-300 block mb-1">اضغط هنا لرفع الصور والملفات</span>
                      <span className="text-xs text-muted-foreground">يدعم PDF, JPG, PNG بحجم أقصى 5MB</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-10 pt-6 border-t border-border flex items-center justify-between">
          <button onClick={() => setStep(s => Math.max(1, s - 1))}
            className={`px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}>
            <ChevronRight className="w-4 h-4" /> السابق
          </button>
          <button onClick={handleNext} disabled={isSubmitting || (step === 1 && (!formData.name || !formData.modelYear))}
            className="px-8 py-2.5 rounded-xl font-bold bg-primary text-white shadow-md shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none transition-all flex items-center gap-2">
            {isSubmitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> جاري الحفظ...</> : <>{step === 4 ? 'إكمال الإضافة' : 'التالي'}{step < 4 && <ChevronLeft className="w-4 h-4" />}</>}
          </button>
        </div>
      </div>
      )}

      {showUpgradeModal && !limitReached && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-card border border-amber-500/30 p-8 rounded-3xl max-w-md w-full shadow-2xl text-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
            <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">رقي حسابك للبرو</h3>
            <p className="text-muted-foreground mb-6">احفظ فواتير القطع والبطاريات بضغطة زر.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowUpgradeModal(false)} className="flex-1 py-3 rounded-xl border border-border text-white hover:bg-white/5 transition-colors">إلغاء</button>
              <button onClick={() => { setShowUpgradeModal(false); setLocation("/pricing"); }} className="flex-1 py-3 rounded-xl bg-amber-500 text-white font-bold transition-colors">عرض الباقات</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
