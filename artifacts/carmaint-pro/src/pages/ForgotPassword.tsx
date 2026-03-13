import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Mail, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { CarMaintLogo } from "@/components/CarMaintLogo";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (resetError) throw resetError;
      setSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("rate limit")) {
        setError("تم إرسال رابط مسبقاً. انتظر قليلاً قبل المحاولة مجدداً.");
      } else {
        setError("حدث خطأ أثناء إرسال الرابط. تأكد من بريدك وحاول مرة أخرى.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16" dir="rtl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-2xl shadow-black/40 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex justify-center mb-6">
              <CarMaintLogo size="md" animated />
            </div>

            {success ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">تم إرسال الرابط!</h2>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  تحقق من بريدك الإلكتروني <span className="text-white font-medium" dir="ltr">{email}</span> واتبع الرابط لإعادة تعيين كلمة المرور.
                </p>
                <p className="text-xs text-slate-500 mb-6">لم يصلك البريد؟ تحقق من مجلد الرسائل غير المرغوب فيها (Spam).</p>
                <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all">
                  <ArrowRight className="w-4 h-4" /> العودة لتسجيل الدخول
                </Link>
              </motion.div>
            ) : (
              <>
                <h1 className="text-2xl font-black text-white text-center mb-1">نسيت كلمة المرور؟</h1>
                <p className="text-sm text-muted-foreground text-center mb-8">
                  أدخل بريدك الإلكتروني وسنرسل لك رابط لإعادة تعيين كلمة المرور
                </p>

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
                  <button type="submit" disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none">
                    {submitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Mail className="w-4 h-4" /> إرسال رابط الاستعادة</>}
                  </button>
                </form>

                <p className="text-center text-sm text-muted-foreground mt-6">
                  تذكرت كلمة المرور؟{" "}<Link href="/login" className="text-primary font-semibold hover:underline">تسجيل الدخول</Link>
                </p>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
