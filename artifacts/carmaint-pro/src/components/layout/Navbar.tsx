import { Link, useLocation } from "wouter";
import { LogOut, LayoutDashboard, Crown, Shield, Menu, X, Settings } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { CarMaintLogo } from "@/components/CarMaintLogo";
import { NotificationBell } from "@/components/NotificationBell";

export function Navbar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0f172a]/95 text-white backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <CarMaintLogo size="lg" theme="dark" animated={true} />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {!user && (
            <>
              <Link href="/#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">المميزات</Link>
              <Link href="/pricing" className={cn("text-sm font-medium hover:text-white transition-colors", location === '/pricing' ? "text-white" : "text-slate-300")}>الأسعار</Link>
            </>
          )}
          {user && (
            <Link href="/dashboard" className={cn("text-sm font-medium hover:text-white transition-colors", location === '/dashboard' ? "text-white" : "text-slate-300")}>لوحة القيادة</Link>
          )}
          {user?.role === 'admin' && (
            <Link href="/admin" className={cn("text-sm font-medium hover:text-white transition-colors flex items-center gap-1", location.startsWith('/admin') ? "text-white" : "text-slate-300")}>
              <Shield className="w-3.5 h-3.5" /> لوحة الإدارة
            </Link>
          )}
          <Link href="/offers" className={cn("text-sm font-medium hover:text-white transition-colors", location === '/offers' ? "text-white" : "text-slate-300")}>العروض</Link>
          <Link href="/pricing" className={cn("text-sm font-medium hover:text-white transition-colors", location === '/pricing' ? "text-white" : "text-slate-300")}>الأسعار</Link>
          <Link href="/tips" className={cn("text-sm font-medium hover:text-white transition-colors", location === '/tips' ? "text-white" : "text-slate-300")}>نصائح</Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3 relative">
              {user.plan === 'free' && (
                <Link href="/pricing" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/20 text-amber-500 text-xs font-semibold hover:bg-amber-500/20 transition-colors">
                  <Crown className="w-3.5 h-3.5" />
                  ترقية
                </Link>
              )}
              <NotificationBell />
              
              <div className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm border border-primary/30">
                    {user.name ? user.name.charAt(0).toUpperCase() : (user.email?.includes('@mdari.local') ? user.email.charAt(0) : "م")}
                  </div>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-sm font-bold text-white max-w-[120px] truncate">{user.name || (user.email?.includes('@mdari.local') ? user.email.split('@')[0] : user.email)}</span>
                    <span className="text-[10px] text-primary/80 font-bold tracking-wide">
                      {user.role === 'admin' ? 'مسؤول النظام' : user.role === 'manager' ? 'مدير' : user.role === 'driver' ? 'سائق' : 'مدير وسائق'}
                    </span>
                  </div>
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute left-0 mt-2 w-52 rounded-xl bg-card border border-border/50 shadow-xl overflow-hidden z-50 origin-top-left"
                      >
                        <div className="p-3 border-b border-border/50">
                          <p className="text-sm font-semibold text-foreground">{user.name || (user.email?.includes('@mdari.local') ? user.email.split('@')[0] : "مستخدم")}</p>
                          <p className="text-xs text-muted-foreground truncate" dir="ltr">{user.email?.includes('@mdari.local') ? user.email.split('@')[0] : user.email}</p>
                          <span className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                            {user.role === 'admin' ? 'مسؤول' : user.role === 'manager' ? 'مدير' : user.role === 'driver' ? 'سائق' : 'مدير وسائق'}
                          </span>
                        </div>
                        <div className="p-1">
                          <Link href="/dashboard" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-black/5 transition-colors">
                            <LayoutDashboard className="w-4 h-4" /> لوحة القيادة
                          </Link>
                          {user.role === 'admin' && (
                            <Link href="/admin" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-black/5 transition-colors">
                              <Shield className="w-4 h-4" /> لوحة الإدارة
                            </Link>
                          )}
                          <Link href="/settings" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-black/5 transition-colors">
                            <Settings className="w-4 h-4" /> إعدادات الحساب
                          </Link>
                          <div className="border-t border-border/50 my-1" />
                          <button onClick={async () => { await logout(); setIsDropdownOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors">
                            <LogOut className="w-4 h-4" /> تسجيل الخروج
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium text-white hover:text-primary transition-colors px-2 py-2 hidden sm:block">دخول</Link>
              <Link href="/register" className="text-sm font-bold bg-primary text-white px-5 py-2.5 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all">سجل مجاناً</Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-white/10 bg-[#0f172a]/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-4 py-6 space-y-2">
              {!user && (
                <>
                  <Link href="/#features" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors">المميزات</Link>
                  <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors">الأسعار</Link>
                  <Link href="/offers" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors">العروض</Link>
                  <Link href="/tips" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors">نصائح</Link>
                  <div className="pt-4 grid grid-cols-2 gap-3">
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="block text-center px-4 py-3 rounded-xl border border-white/20 text-sm text-white font-medium transition-colors hover:bg-white/10">دخول</Link>
                    <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="block text-center px-4 py-3 rounded-xl bg-primary text-white text-sm font-bold shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-colors">سجل مجاناً</Link>
                  </div>
                </>
              )}
              {user && (
                <>
                  <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                    <LayoutDashboard className="w-5 h-5 text-primary" /> لوحة القيادة
                  </Link>
                  {user.role === 'admin' && (
                    <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                      <Shield className="w-5 h-5 text-emerald-400" /> لوحة الإدارة
                    </Link>
                  )}
                  <Link href="/offers" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                    <Crown className="w-5 h-5 text-amber-400" /> العروض
                  </Link>
                  <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                    <Crown className="w-5 h-5 text-primary" /> الأسعار
                  </Link>
                  <Link href="/tips" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                    <Shield className="w-5 h-5 text-secondary" /> نصائح
                  </Link>
                  <button onClick={async () => { await logout(); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-3 mt-4 px-4 py-3 rounded-xl text-base font-medium text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors">
                    <LogOut className="w-5 h-5" /> تسجيل الخروج
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
