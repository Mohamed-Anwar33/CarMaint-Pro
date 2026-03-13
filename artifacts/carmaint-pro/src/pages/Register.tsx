import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { CarMaintLogo } from "@/components/CarMaintLogo";
import type { UserRole } from "@/hooks/use-auth";

export default function Register() {
  const { register } = useAuth();
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>("manager");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user, isLoading } = useAuth();

  // Redirect if already logged in
  if (!isLoading && user) {
    setLocation("/dashboard");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (password.length < 6) { setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل"); return; }
    setSubmitting(true);
    try {
      await register(name, email, password, role);
      setSuccess("تم إنشاء حسابك! تحقق من بريدك الإلكتروني لتأكيد الحساب.");
      setTimeout(() => setLocation("/login"), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("already registered") || msg.includes("already been registered")) {
        setError("هذا البريد مسجل بالفعل. حاول تسجيل الدخول.");
      } else {
        setError(msg || "حدث خطأ أثناء إنشاء الحساب.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16" dir="rtl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-2xl shadow-black/40 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-40 h-40 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex justify-center mb-6">
              <CarMaintLogo size="md" animated />
            </div>
            <h1 className="text-2xl font-black text-white text-center mb-1">إنشاء حساب جديد</h1>
            <p className="text-sm text-muted-foreground text-center mb-8">ابدأ رحلتك مجاناً — لا بطاقة مطلوبة</p>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-5">
                <AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span>
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-5">
                <CheckCircle className="w-4 h-4 shrink-0" /><span>{success}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">الاسم الكامل</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="محمد أحمد" required autoComplete="name"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary/30 text-white placeholder:text-slate-500 transition-all outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">البريد الإلكتروني</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@email.com" required dir="ltr" autoComplete="email"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary/30 text-white placeholder:text-slate-500 transition-all outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">كلمة المرور</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" required minLength={6} dir="ltr" autoComplete="new-password"
                    className="w-full px-4 pr-4 pl-12 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary/30 text-white placeholder:text-slate-500 transition-all outline-none" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors flex items-center justify-center p-1 rounded-md">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">نوع الحساب</label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { value: "manager", label: "صاحب سيارات / مدير", desc: "أدير مركباتي والسائقين" },
                    { value: "driver", label: "سائق القيادة", desc: "أسجل لقبول دعوة مديري" },
                  ] as const).map(opt => (
                    <button key={opt.value} type="button" onClick={() => setRole(opt.value)}
                      className={`p-3 rounded-xl border text-right transition-all ${role === opt.value ? "border-primary bg-primary/10 text-white" : "border-border bg-background text-muted-foreground hover:border-border/80"}`}>
                      <p className="text-xs font-bold">{opt.label}</p>
                      <p className="text-[10px] mt-0.5 opacity-70">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none">
                {submitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><UserPlus className="w-4 h-4" /> إنشاء الحساب مجاناً</>}
              </button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-6">
              لديك حساب بالفعل؟{" "}<Link href="/login" className="text-primary font-semibold hover:underline">سجل الدخول</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
