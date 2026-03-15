import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { CarMaintLogo } from "@/components/CarMaintLogo";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/hooks/use-auth";

export default function Register() {
  const { register, user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>("manager");
  const [accountType, setAccountType] = useState<"individual" | "family">("individual");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && user) {
      setLocation("/dashboard");
    }
  }, [isLoading, user, setLocation]);

  if (!isLoading && user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (password.length < 6) { setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل"); return; }
    setSubmitting(true);
    try {
      await register(name, phone, password, role, accountType);
      setSuccess("تم إنشاء حسابك بنجاح! يتم تحويلك لتسجيل الدخول...");
      setTimeout(() => setLocation("/login"), 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("already registered") || msg.includes("already been registered")) {
        setError("هذا الرقم/البريد مسجل بالفعل. حاول تسجيل الدخول.");
      } else if (msg.includes("Unexpected token") || msg.includes("SyntaxError") || msg.includes("fetch")) {
        setError("خطأ في الاتصال بقاعدة البيانات. تأكد من متغيّرات بيئة Netlify واعمل تحديث للصفحة.");
      } else {
        setError(msg || "حدث خطأ أثناء إنشاء الحساب.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background" dir="rtl">
      {/* Background Decor */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10 py-10">
        <div className="glass-card rounded-[2.5rem] p-8 sm:p-10">
          <div className="flex justify-center mb-8">
            <CarMaintLogo size="lg" theme="light" animated />
          </div>
          
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-foreground mb-2 tracking-tight">إنشاء حساب جديد</h1>
            <p className="text-muted-foreground font-medium">ابدأ رحلتك مجاناً — لا بطاقة مطلوبة</p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-6 font-bold">
              <AlertCircle className="w-5 h-5 shrink-0" /><span>{error}</span>
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm mb-6 font-bold">
              <CheckCircle className="w-5 h-5 shrink-0" /><span>{success}</span>
            </motion.div>
          )}

        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">الاسم الكامل</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="محمد أحمد" required autoComplete="name"
                className="w-full px-5 py-3.5 rounded-2xl bg-white/50 border border-border focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 text-foreground placeholder:text-muted-foreground transition-all outline-none font-medium" />
            </div>
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">رقم الجوال</label>
              <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="05xxxxxxxx" required dir="ltr" autoComplete="tel"
                className="w-full px-5 py-3.5 rounded-2xl bg-white/50 border border-border focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 text-foreground placeholder:text-muted-foreground transition-all outline-none font-medium" />
            </div>
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">كلمة المرور</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required minLength={6} dir="ltr" autoComplete="new-password"
                  className="w-full px-5 pr-5 pl-12 py-3.5 rounded-2xl bg-white/50 border border-border focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 text-foreground placeholder:text-muted-foreground transition-all outline-none font-medium" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-0 top-0 bottom-0 px-4 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-foreground mb-3">نوع التسجيل</label>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { value: "manager", label: "مالك مركبة", desc: "أدير مركباتي/عائلتي" },
                  { value: "driver", label: "سائق/مضاف", desc: "أقبل دعوة مديري/عائلتي" },
                ] as const).map(opt => (
                  <button key={opt.value} type="button" onClick={() => setRole(opt.value)}
                    className={cn(
                      "p-4 rounded-2xl border text-right transition-all group",
                      role === opt.value ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20" : "border-border bg-white/40 hover:bg-white hover:border-primary/40"
                    )}>
                    <div className="flex justify-between items-start mb-1">
                      <p className={cn("text-sm font-bold", role === opt.value ? "text-primary" : "text-foreground group-hover:text-primary")}>{opt.label}</p>
                      {role === opt.value && <CheckCircle className="w-4 h-4 text-primary" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {role === "manager" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
                <label className="block text-sm font-bold text-foreground mb-3">حدد نوع الحساب</label>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { value: "individual", label: "حساب فردي", desc: "أتابع سيارتي فقط" },
                    { value: "family", label: "حساب العائلة", desc: "أشارك سياراتي" },
                  ] as const).map(opt => (
                    <button key={opt.value} type="button" onClick={() => setAccountType(opt.value as any)}
                      className={cn(
                        "p-4 rounded-2xl border text-center transition-all group",
                        accountType === opt.value ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20" : "border-border bg-white/40 hover:bg-white hover:border-primary/40"
                      )}>
                      <p className={cn("text-sm font-bold mb-1", accountType === opt.value ? "text-primary" : "text-foreground group-hover:text-primary")}>{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <button type="submit" disabled={submitting}
              className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-primary text-white font-bold text-base shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none">
              {submitting ? <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" /> : <><UserPlus className="w-5 h-5" /> إنشاء الحساب مجاناً</>}
            </button>
          </form>

          <div className="mt-8 text-center bg-muted/50 p-4 rounded-2xl border border-border/50">
            <p className="text-sm text-muted-foreground font-medium">
              لديك حساب بالفعل؟{" "}<Link href="/login" className="text-primary font-black hover:underline">سجل الدخول</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
