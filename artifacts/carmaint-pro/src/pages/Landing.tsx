import { Link } from "wouter";
import { motion } from "framer-motion";
import { ShieldCheck, BellRing, Users, UserCog, FileText, Activity, ArrowLeft } from "lucide-react";

export default function Landing() {

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
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-40 overflow-hidden">
        {/* Background Orbs & Gradients for Premium Look */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/20 blur-[150px]" />
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-rose-400/10 blur-[100px]" />
          <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 border border-border shadow-sm mb-8 backdrop-blur-md"
            >
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-sm font-medium text-foreground">الجيل الجديد من إدارة المركبات</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-black text-foreground tracking-tight leading-[1.3] mb-8"
            >
              طريقك الأسهل <br className="hidden md:block" />
              نحو صيانة <span className="gradient-text">ذكية وآمنة</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto"
            >
              منصة سحابية متكاملة مصممة خصيصاً للأفراد والعائلات لتتبع وثائق ومواعيد صيانة سياراتهم بكل احترافية وراحة بال.
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
              <a href="#features" className="px-8 py-4 rounded-2xl font-bold bg-card border border-border text-foreground hover:bg-card/80 hover:border-border/80 transition-all text-center">
                استكشف المميزات
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Modern Features Bento Grid */}
      <section id="features" className="py-24 bg-background relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-foreground mb-4 tracking-tight">كل ما تحتاجه لإدارة <span className="text-primary">مركبتك</span></h2>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">تصميم عصري واجهة مستخدم سهلة لتجربة لا مثيل لها.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                className={`glass-card p-8 rounded-3xl relative overflow-hidden group border border-border/50 hover:border-primary/50 transition-all ${idx === 0 || idx === 3 ? 'md:col-span-2' : ''}`}
              >
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3 tracking-wide">{item.title}</h3>
                  <p className="text-muted-foreground font-medium leading-relaxed">{item.desc}</p>
                </div>
                {/* Decorative background accent inside card */}
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition / CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5"></div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="glass-card p-12 md:p-16 rounded-[3rem] box-glow">
            <motion.h2 
              initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              className="text-4xl md:text-5xl font-black text-foreground mb-6 leading-tight"
            >
              انضم لآلاف المستخدمين <br/> وارتقِ بمستوى اهتمامك بسيارتك
            </motion.h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto font-medium">سواء كنت فرداً يهتم بسيارته أو عائلة تدير عدة مركبات، منصتنا صممت خصيصاً لك.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/register" className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-bold bg-primary text-white shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all text-lg w-full sm:w-auto justify-center">
                أنشئ حسابك مجاناً <ArrowLeft className="w-5 h-5" />
              </Link>
              <Link href="/pricing" className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-2xl bg-card border border-border hover:border-primary/50 text-foreground font-bold transition-all group w-full sm:w-auto shadow-sm">
                عرض باقات الأسعار
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
