import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { CarMaintLogo } from "@/components/CarMaintLogo";

export function Footer() {
  const { user } = useAuth();

  return (
    <footer className="bg-slate-900/80 border-t border-border/30 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <CarMaintLogo size="md" animated={true} className="mb-4" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              المنصة المتكاملة الأولى لتتبع صيانة سيارتك، إدارة وثائقها، ومتابعة السائقين بكل سهولة واحترافية.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-4">روابط سريعة</h4>
            <ul className="space-y-2">
              <li><Link href="/#features" className="text-sm text-muted-foreground hover:text-primary transition-colors">المميزات</Link></li>
              <li><Link href="/pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">الأسعار</Link></li>
              {user && (
                <li><Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">لوحة القيادة</Link></li>
              )}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-4">الحساب</h4>
            <ul className="space-y-2">
              {user ? (
                <>
                  <li><Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">لوحة القيادة</Link></li>
                  <li><Link href="/onboarding" className="text-sm text-muted-foreground hover:text-primary transition-colors">إضافة سيارة</Link></li>
                </>
              ) : (
                <>
                  <li><Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">تسجيل الدخول</Link></li>
                  <li><Link href="/register" className="text-sm text-muted-foreground hover:text-primary transition-colors">إنشاء حساب مجاني</Link></li>
                </>
              )}
            </ul>
          </div>
        </div>
        <div className="border-t border-border/30 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} صيانة سيارتي (CarMaint Pro). جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>صُنع بـ ❤️ لأصحاب السيارات</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
