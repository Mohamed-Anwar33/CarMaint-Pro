import { Link } from "wouter";
import { motion } from "framer-motion";
import { ShieldCheck, BellRing, Users, UserCog, FileText, Activity, ChevronLeft, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// Mock announcements if API fails
const MOCK_ANNOUNCEMENTS = [
  { id: '1', title: 'عرض خاص!', message: 'اشترك في باقة العائلة الكبيرة واحصل على شهرين مجاناً', type: 'offer' },
  { id: '2', title: 'تحديث جديد', message: 'تمت إضافة ميزة تتبع مصاريف الوقود في لوحة القيادة', type: 'update' }
];

export default function Landing() {
  const [announcements, setAnnouncements] = useState(MOCK_ANNOUNCEMENTS);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from("announcements").select("*").eq("active", true).order("created_at", { ascending: false });
        if (data && data.length > 0) setAnnouncements(data);
      } catch { /* silently use mock data */ }
    })();
  }, []);

  const activeAnnouncements = announcements.filter((a: any) => a.active !== false);

  const features = [
    { icon: <Activity className="w-6 h-6 text-primary" />, title: "تتبع صحة السيارة", desc: "سجل قراءات الزيت، الإطارات، الفرامل والتكييف بضغطة زر." },
    { icon: <BellRing className="w-6 h-6 text-secondary" />, title: "تنبيهات ذكية", desc: "تنبيهات مبكرة لتغيير الزيت وتجديد الوثائق قبل انتهائها." },
    { icon: <Users className="w-6 h-6 text-emerald-400" />, title: "أسطول العائلة", desc: "أضف سيارات العائلة وتابع حالتها من لوحة تحكم واحدة." },
    { icon: <UserCog className="w-6 h-6 text-purple-400" />, title: "إدارة السائقين", desc: "خصص سائق لكل سيارة واستقبل تقارير دورية منهم مباشرة." },
    { icon: <FileText className="w-6 h-6 text-amber-400" />, title: "متابعة الوثائق", desc: "تتبع تواريخ الاستمارة، التأمين، الفحص الدوري والرخصة." },
    { icon: <ShieldCheck className="w-6 h-6 text-rose-400" />, title: "تقارير احترافية", desc: "احتفظ بسجل صيانة كامل يرفع من قيمة سيارتك عند البيع." },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Announcement Bar */}
      {activeAnnouncements.length > 0 && (
        <div className="bg-card border-b border-border/50 overflow-hidden relative">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center text-sm text-center">
            <motion.div 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }}
              className="flex items-center gap-2"
            >
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${activeAnnouncements[0].type === 'offer' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'}`}>
                {activeAnnouncements[0].type === 'offer' ? 'عرض' : 'تحديث'}
              </span>
              <span className="text-white font-medium">{activeAnnouncements[0].title}</span>
              <span className="text-muted-foreground hidden sm:inline">- {activeAnnouncements[0].message}</span>
            </motion.div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/80 to-background"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-black text-white tracking-tight leading-[1.2]"
            >
              احتفظ بسيارتك في <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400 text-glow">أفضل حال</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6 text-lg md:text-xl text-muted-foreground"
            >
              المنصة المتكاملة الأولى لتتبع صيانة سيارتك، إدارة وثائقها، ومتابعة السائقين بكل سهولة واحترافية.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/register" className="px-8 py-4 rounded-2xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                ابدأ الآن مجاناً <ArrowLeft className="w-5 h-5" />
              </Link>
              <a href="#features" className="px-8 py-4 rounded-2xl font-bold bg-card border border-border text-white hover:bg-card/80 hover:border-border/80 transition-all text-center">
                استكشف المميزات
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-background relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white">كل ما تحتاجه لسيارتك</h2>
            <p className="mt-4 text-muted-foreground">صُمم ليناسب احتياجات الفرد والعائلة بأسلوب عصري</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-3xl p-8 border border-border/50 hover:border-primary/30 transition-all group hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/5"
              >
                <div className="w-14 h-14 rounded-2xl bg-background flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-24 bg-card/30 border-y border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">باقات تناسب الجميع</h2>
          <p className="mt-4 text-muted-foreground mb-12">ابدأ مجاناً وقم بالترقية عند الحاجة لميزات متقدمة</p>
          
          <Link href="/pricing" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-card border border-border hover:border-primary/50 text-white font-medium transition-all group">
            عرض باقات الأسعار
            <ChevronLeft className="w-4 h-4 text-primary group-hover:-translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

    </div>
  );
}
