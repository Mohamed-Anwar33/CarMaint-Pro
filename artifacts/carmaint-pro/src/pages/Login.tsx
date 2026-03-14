import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { CarMaintLogo } from "@/components/CarMaintLogo";

export default function Login() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
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
    setSubmitting(true);
    try {
      await login(email, password);
      setLocation("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("Invalid login") || msg.includes("credentials")) {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      } else if (msg.includes("Email not confirmed")) {
        setError("يرجى تأكيد بريدك الإلكتروني أولاً");
      } else if (msg.includes("DATA_FETCH_ERROR")) {
        setError("خطأ في الاتصال بقاعدة البيانات. تأكد من متغيّرات بيئة Netlify واعمل تحديث للصفحة.");
      } else {
        setError("حدث خطأ. تأكد من جودة الاتصال أو تحديث الصفحة.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16" dir="rtl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-2xl shadow-black/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex justify-center mb-6">
              <CarMaintLogo size="md" animated />
            </div>
            <h1 className="text-2xl font-black text-white text-center mb-1">أهلاً بعودتك!</h1>
            <p className="text-sm text-muted-foreground text-center mb-8">سجل دخولك للوصول إلى لوحة القيادة</p>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-5">
                <AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">البريد الإلكتروني</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="example@email.com" required dir="ltr" autoComplete="email"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary/30 text-white placeholder:text-slate-500 transition-all outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">كلمة المرور</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" required minLength={6} dir="ltr" autoComplete="current-password"
                    className="w-full px-4 pr-4 pl-12 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary/30 text-white placeholder:text-slate-500 transition-all outline-none" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors flex items-center justify-center p-1 rounded-md">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end">
                <Link href="/forgot-password" className="text-xs text-primary hover:underline font-medium">نسيت كلمة المرور؟</Link>
              </div>
              <button type="submit" disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none">
                {submitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><LogIn className="w-4 h-4" /> تسجيل الدخول</>}
              </button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-6">
              ليس لديك حساب؟{" "}<Link href="/register" className="text-primary font-semibold hover:underline">سجل الآن</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
