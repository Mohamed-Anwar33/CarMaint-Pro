import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { CarMaintLogo } from "@/components/CarMaintLogo";

export default function Login() {
  const { login, user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
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
    setSubmitting(true);
    try {
      await login(phone, password);
      setLocation("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("Invalid login") || msg.includes("credentials")) {
        setError("رقم الجوال أو كلمة المرور غير صحيحة");
      } else if (msg.includes("Email not confirmed")) {
        setError("يرجى تأكيد حسابك أولاً");
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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background" dir="rtl">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[100px] pointer-events-none" />
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="glass-card rounded-[2.5rem] p-8 sm:p-10">
          <div className="flex justify-center mb-8">
            <CarMaintLogo size="lg" theme="light" animated />
          </div>
          
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-foreground mb-2 tracking-tight">مرحباً بك مجدداً 👋</h1>
            <p className="text-muted-foreground font-medium">سجل دخولك لمتابعة مركباتك</p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-6 font-bold">
              <AlertCircle className="w-5 h-5 shrink-0" /><span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">رقم الجوال</label>
              <input type="text" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="05xxxxxxxx" required dir="ltr" autoComplete="tel"
                className="w-full px-5 py-3.5 rounded-2xl bg-white/50 border border-border focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 text-foreground placeholder:text-muted-foreground transition-all outline-none font-medium" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-foreground">كلمة المرور</label>
                <Link href="/forgot-password" className="text-xs text-primary hover:text-primary/80 font-bold transition-colors">نسيت كلمة المرور؟</Link>
              </div>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required minLength={6} dir="ltr" autoComplete="current-password"
                  className="w-full px-5 pr-5 pl-12 py-3.5 rounded-2xl bg-white/50 border border-border focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 text-foreground placeholder:text-muted-foreground transition-all outline-none font-medium" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-0 top-0 bottom-0 px-4 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <button type="submit" disabled={submitting}
              className="w-full mt-2 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-primary text-white font-bold text-base shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none">
              {submitting ? <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" /> : <><LogIn className="w-5 h-5" /> دخول مساحة العمل</>}
            </button>
          </form>
          
          <div className="mt-8 text-center bg-muted/50 p-4 rounded-2xl border border-border/50">
            <p className="text-sm text-muted-foreground font-medium">
              عضو جديد؟{" "}<Link href="/register" className="text-primary font-black hover:underline">أنشئ حسابك الآن</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
