import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { CarMaintLogo } from "@/components/CarMaintLogo";

export function Footer() {
  const { user } = useAuth();

  return (
    <footer className="bg-[#0f172a] text-slate-300 border-t border-white/10 mt-auto relative overflow-hidden">
      {/* Subtle Glow inside footer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <CarMaintLogo size="md" theme="dark" animated={true} className="mb-6" />
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              المنصة المتكاملة الأولى لإدارة وثائق مركبتك، ومتابعة عائلتك بكل سهولة واحترافية.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-6 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" />روابط سريعة</h4>
            <ul className="space-y-3">
              <li><Link href="/#features" className="text-sm text-slate-400 hover:text-primary transition-colors hover:translate-x-1 inline-block">المميزات</Link></li>
              <li><Link href="/pricing" className="text-sm text-slate-400 hover:text-primary transition-colors hover:translate-x-1 inline-block">الأسعار</Link></li>
              {user && (
                <li><Link href="/dashboard" className="text-sm text-slate-400 hover:text-primary transition-colors hover:translate-x-1 inline-block">لوحة القيادة</Link></li>
              )}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-6 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-secondary" />الحساب</h4>
            <ul className="space-y-3">
              {user ? (
                <>
                  <li><Link href="/dashboard" className="text-sm text-slate-400 hover:text-primary transition-colors hover:translate-x-1 inline-block">لوحة القيادة</Link></li>
                  <li><Link href="/onboarding" className="text-sm text-slate-400 hover:text-primary transition-colors hover:translate-x-1 inline-block">إضافة سيارة</Link></li>
                </>
              ) : (
                <>
                  <li><Link href="/login" className="text-sm text-slate-400 hover:text-primary transition-colors hover:translate-x-1 inline-block">تسجيل الدخول</Link></li>
                  <li><Link href="/register" className="text-sm text-slate-400 hover:text-primary transition-colors hover:translate-x-1 inline-block">إنشاء حساب مجاني</Link></li>
                </>
              )}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500 font-medium">
            © {new Date().getFullYear()} مداري (Mdari). جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            <span>صُنع بـ ❤️ لأصحاب السيارات</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
