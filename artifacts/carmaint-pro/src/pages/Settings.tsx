import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { User, Shield, Key, Save, AlertTriangle } from "lucide-react";

const PLAN_LABELS: Record<string, string> = { free: "مجاني", pro: "برو", family_small: "عائلة صغيرة", family_large: "عائلة كبيرة" };
const ROLE_LABELS: Record<string, string> = { manager: "مدير سيارات", driver: "سائق", both: "مدير وسائق", admin: "مسؤول النظام" };

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  
  const [name, setName] = useState(user?.name || "");
  const [newPassword, setNewPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  if (!user) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSavingProfile(true);
    try {
      await updateUser({ name: name.trim() });
      toast({ title: "تم التحديث", description: "تم تحديث بيانات ملفك الشخصي بنجاح." });
    } catch {
      toast({ title: "خطأ", description: "حدث خطأ أثناء تحديث البيانات.", variant: "destructive" });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast({ title: "كلمة مرور ضعيفة", description: "يجب أن تتكون كلمة المرور الجديدة من 6 أحرف على الأقل.", variant: "destructive" });
      return;
    }
    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: "تم التحديث", description: "تم تغيير كلمة المرور بنجاح." });
      setNewPassword("");
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message || "حدث خطأ أثناء تغيير كلمة المرور.", variant: "destructive" });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12" dir="rtl">
      <h1 className="text-3xl font-bold text-white mb-8">إعدادات الحساب</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Col: Account Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-card rounded-3xl p-6 border border-border/50 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
            
            <div className="relative z-10 text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-2xl font-black mx-auto mb-4">
                {(user.name || user.email).charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-white mb-1">{user.name || "مستخدم"}</h2>
              <p className="text-sm text-slate-400 truncate px-2">{user.email}</p>
            </div>

            <div className="space-y-4 pt-6 border-t border-border/50">
              <div className="flex justify-between items-center bg-background/50 p-3 rounded-xl border border-border">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Shield className="w-4 h-4 text-primary" /> الدور المحسوب
                </div>
                <span className="text-xs font-bold text-white bg-primary/20 px-2 py-1 rounded-md">{ROLE_LABELS[user.role]}</span>
              </div>
              <div className="flex justify-between items-center bg-background/50 p-3 rounded-xl border border-border">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <User className="w-4 h-4 text-emerald-400" /> الباقة الحالية
                </div>
                <span className="text-xs font-bold text-white bg-emerald-500/20 px-2 py-1 rounded-md">{PLAN_LABELS[user.plan]}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Forms */}
        <div className="md:col-span-2 space-y-6">
          
          <div className="bg-card rounded-3xl p-6 md:p-8 border border-border/50 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <User className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white">المعلومات الأساسية</h2>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">الاسم الكامل</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-white focus:border-primary outline-none transition-colors" />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">البريد الإلكتروني (لا يمكن تغييره حالياً)</label>
                <input type="email" value={user.email} disabled className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border/50 text-slate-500 cursor-not-allowed" />
              </div>

              <div className="pt-4 flex justify-end">
                <button type="submit" disabled={savingProfile || name === user.name || !name.trim()}
                  className="px-6 py-2.5 rounded-xl font-bold bg-primary text-white shadow-md shadow-primary/20 hover:shadow-primary/40 disabled:opacity-50 transition-all flex items-center gap-2">
                  {savingProfile ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />} حفظ التغييرات
                </button>
              </div>
            </form>
          </div>

          <div className="bg-card rounded-3xl p-6 md:p-8 border border-border/50 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Key className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white">كلمة المرور</h2>
            </div>
            
            <div className="p-4 mb-6 rounded-xl border border-amber-500/30 bg-amber-500/5 flex items-start gap-4">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-300 leading-relaxed">تغيير كلمة المرور سيقوم بتحديث بيانات الدخول الخاصة بك. تأكد من استخدام كلمة مرور قوية.</p>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">كلمة المرور الجديدة</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" dir="ltr"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-white focus:border-primary outline-none transition-colors" />
              </div>

              <div className="pt-4 flex justify-end">
                <button type="submit" disabled={savingPassword || !newPassword}
                  className="px-6 py-2.5 rounded-xl font-bold bg-amber-500 text-white shadow-md shadow-amber-500/20 hover:shadow-amber-500/40 disabled:opacity-50 transition-all flex items-center gap-2">
                  {savingPassword ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />} تغيير كلمة المرور
                </button>
              </div>
            </form>
          </div>

          <div className="bg-card rounded-3xl p-6 md:p-8 border border-destructive/20 shadow-xl mt-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white">إدارة الحساب</h2>
            </div>
            
            <div className="p-4 mb-6 rounded-xl border border-destructive/30 bg-destructive/5 flex items-start gap-4">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-slate-300 leading-relaxed">حذف الحساب هو إجراء نهائي ولا يمكن التراجع عنه. سيتم مسح جميع بياناتك والسيارات والتقارير المرتبطة بها نهائياً ولن تتمكن من استعادتها.</p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  if (window.confirm("هل أنت متأكد من رغبتك في حذف حسابك نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.")) {
                    toast({ title: "رسالة نظام", description: "تم إرسال طلب حذف حسابك للإدارة. سيتم مسح بياناتك قريباً." });
                  }
                }}
                className="px-6 py-2.5 rounded-xl font-bold bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive hover:text-white transition-all flex items-center gap-2">
                حذف الحساب نهائياً
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
