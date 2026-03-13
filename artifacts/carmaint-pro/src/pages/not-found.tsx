import { Link } from "wouter";
import { motion } from "framer-motion";
import { Home, ArrowRight, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="w-20 h-20 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-6">
          <SearchX className="w-10 h-10 text-destructive" />
        </div>

        <h1 className="text-6xl font-black text-white mb-2">٤٠٤</h1>
        <h2 className="text-xl font-bold text-white mb-3">الصفحة غير موجودة</h2>
        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها. تأكد من الرابط وحاول مرة أخرى.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
          >
            <Home className="w-4 h-4" /> الصفحة الرئيسية
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-card border border-border text-white font-medium hover:bg-card/80 transition-all"
          >
            <ArrowRight className="w-4 h-4" /> العودة للخلف
          </button>
        </div>
      </motion.div>
    </div>
  );
}
