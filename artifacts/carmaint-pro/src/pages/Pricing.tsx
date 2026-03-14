import React, { useState } from "react";
import { Check, X, Crown, Zap, Star, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type BillingCycle = "monthly" | "yearly";

// ─── Constants for exact matching of Arabic table ──────────────────
const checkCell = "bg-[#dcfce7] border border-white text-center py-2";
const crossCell = "bg-[#ffe4e6] border border-white text-center py-2";
const labelCell = "bg-[#dcfce7] py-2 px-3 text-slate-800 border border-white font-medium";
const checkIcon = "✅";
const crossIcon = "❌";

const getCellClass = (val: boolean) => val ? checkCell : crossCell;
const getIcon = (val: boolean) => val ? checkIcon : crossIcon;

// ─── Family Plans ─────────────────────────────────────────────────
const familyPlans = [
  {
    id: "family_small_monthly",
    name: "العائلة الصغيرة شهري",
    monthlyPrice: 19,
    yearlyPrice: null,
    cars: 3,
    points: null,
    offers: null,
    badge: null,
    highlight: false,
  },
  {
    id: "family_small_yearly",
    name: "العائلة الصغيرة سنوي",
    monthlyPrice: null,
    yearlyPrice: 199,
    cars: 3,
    points: 348,
    offers: null,
    badge: "موصى به",
    highlight: true,
  },
  {
    id: "family_large_monthly",
    name: "العائلة الكبيرة شهري",
    monthlyPrice: 29,
    yearlyPrice: null,
    cars: 5,
    points: null,
    offers: null,
    badge: null,
    highlight: false,
  },
  {
    id: "family_large_yearly",
    name: "العائلة الكبيرة سنوي",
    monthlyPrice: null,
    yearlyPrice: 299,
    cars: 5,
    points: null,
    offers: 15,
    badge: "الأميز",
    highlight: false,
  },
];

// ─── Feature Matrix ───────────────────────────────────────────────
type FeatureValue = boolean | string;
interface Feature {
  label: string;
  values: [FeatureValue, FeatureValue, FeatureValue, FeatureValue, FeatureValue, FeatureValue];
  section?: string;
}

const featureSections: { title: string; features: Feature[]; icon?: React.ReactNode }[] = [
  {
    title: "إعداد السيارة",
    icon: <span className="text-xl">🚗</span>,
    features: [
      { label: "نوع ناقل الحركة (يدوي / أوتوماتيك) ⚙️", values: [true, true, true, true, true, true] },
      { label: "فترة تغيير زيت ناقل الحركة (40,000 أو 60,000 كم) 📏", values: [true, true, true, true, true, true] },
      { label: "تسجيل قراءة العداد الحالية 🔢", values: [true, true, true, true, true, true] },
    ],
  },
  {
    title: "تذكيرات الزيوت",
    icon: <span className="text-xl">🛢️</span>,
    features: [
      { label: "زيت المحرك — بالأيام والكيلومترات 🛢️", values: [true, true, true, true, true, true] },
      { label: "زيت ناقل الحركة — حسب النوع المختار ⚙️", values: [true, true, true, true, true, true] },
      { label: "زيت الفرامل 🔴", values: [true, true, true, true, true, true] },
      { label: "زيت التوجيه 🔄", values: [true, true, true, true, true, true] },
      { label: "زيت التبريد (المياه) 🌡️", values: [true, true, true, true, true, true] },
    ],
  },
  {
    title: "الفلاتر",
    icon: <span className="text-xl">🌀</span>,
    features: [
      { label: "فلتر الهواء 🌀", values: [true, true, true, true, true, true] },
      { label: "فلتر الوقود ⛽", values: [true, true, true, true, true, true] },
    ],
  },
  {
    title: "وثائق السيارة",
    icon: <span className="text-xl">📋</span>,
    features: [
      { label: "تاريخ انتهاء الرخصة (اختياري) 📄", values: [true, true, true, true, true, true] },
      { label: "تاريخ الفحص الدوري 🔍", values: [true, true, true, true, true, true] },
      { label: "تاريخ انتهاء التأمين 🛡️", values: [true, true, true, true, true, true] },
      { label: "تاريخ انتهاء الاستيكر 🔖", values: [true, true, true, true, true, true] },
    ],
  },
  {
    title: "البطارية والإطارات",
    icon: <span className="text-xl">🔋</span>,
    features: [
      { label: "متابعة البطارية (تاريخ، ماركة، ضمان) 🔋", values: [true, true, true, true, true, true] },
      { label: "متابعة الإطارات (تاريخ، مقاس، كيلومترات) 🔄", values: [true, true, true, true, true, true] },
    ],
  },
  {
    title: "التنبيهات والحالة",
    icon: <span className="text-xl">🔔</span>,
    features: [
      { label: "مؤشر الحالة التلقائي (أخضر/أصفر/أحمر) 🟢", values: [true, true, true, true, true, true] },
      { label: "تنبيهات داخل التطبيق 📱", values: [true, true, true, true, true, true] },
      { label: "تنبيهات بريد إلكتروني 📧", values: [false, true, true, true, true, true] },
      { label: "على الجوال SMS تنبيهات 💬", values: [false, true, true, true, true, true] },
    ],
  },
  {
    title: "ميزات إضافية",
    icon: <span className="text-xl">⭐</span>,
    features: [
      { label: "رفع وحفظ فواتير الصيانة 📁", values: [false, true, true, true, true, true] },
      { label: "قائمة تجديد اختيارية قابلة للتخصيص ☑️", values: [true, true, true, true, true, true] },
      { label: "ملصقات صيانة مفرغة تشحن مع الاشتراك 🏷️", values: [false, false, "5", false, "10", "15"] },
    ],
  },
];

const planHeaders = [
  <div className="flex flex-col items-center gap-1"><span className="text-xl">🆓</span> مجاني</div>,
  <div className="flex flex-col items-center gap-1"><span className="text-xl">💎</span> شهري</div>,
  <div className="flex flex-col items-center gap-1"><span className="text-xl">🏆</span> سنوي</div>,
  "عائلة شهري", "عائلة سنوي", "عائلة كبيرة"
];
const planPrices = ["مجاناً", "ريال 108", "✨ ريال 99", "228 ريال", "199 ريال", "299 ريال"];

// ─── Alert System Rows ────────────────────────────────────────────
const alertRows = [
  { step: 1, text: "النظام يحسب موعد تغيير الزيت تلقائياً", icon: "🤖", who: "تلقائي" },
  { step: 2, text: "يُذكّر السائق قبل 7 أيام من الموعد", icon: "🔔", who: "السائق" },
  { step: 3, text: "السائق يغير الزيت ويعبئ النموذج", icon: "🚗", who: "السائق" },
  { step: 4, text: "ولي الأمر يستقبل إشعار «تم التغيير»", icon: "✅", who: "ولي الأمر" },
  { step: 5, text: "إذا لم يُعبأ النموذج خلال 48 ساعة → تنبيه لولي الأمر", icon: "⚠️", who: "تلقائي" },
];

function FeatureCell({ value }: { value: FeatureValue }) {
  if (value === true) return <Check className="w-4 h-4 text-emerald-400 mx-auto" />;
  if (value === false) return <X className="w-4 h-4 text-slate-600 mx-auto" />;
  return <span className="text-xs font-medium text-secondary">{value}</span>;
}

function SectionAccordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between px-4 py-2 bg-card/50 border border-border/30 rounded-lg mb-1 text-sm font-bold text-foreground hover:bg-card transition-colors">
        {title}
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Pricing() {
  const [billing, setBilling] = useState<BillingCycle>("yearly");
  const [showFullMatrix, setShowFullMatrix] = useState(false);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Hero */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px]"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 border border-border shadow-sm mb-6 backdrop-blur-md"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-sm font-medium text-foreground">باقات مصممة خصيصاً لاحتياجاتك</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-foreground mb-6 tracking-tight leading-[1.1]"
          >
            دليل <span className="gradient-text">الخطط</span> والميزات الكامل
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-muted-foreground text-xl mb-12 font-medium"
          >اختر الخطة المناسبة لك ولعائلتك</motion.p>

          {/* Billing Toggle */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-white border border-border/50 shadow-sm"
          >
            <button
              onClick={() => setBilling("monthly")}
              className={cn("px-8 py-3 rounded-[14px] text-sm font-bold transition-all", billing === "monthly" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-foreground")}
            >شهري</button>
            <button
              onClick={() => setBilling("yearly")}
              className={cn("px-8 py-3 rounded-[14px] text-sm font-bold transition-all flex items-center gap-2", billing === "yearly" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-foreground")}
            >
              سنوي
              <span className={cn("text-[10px] rounded-full px-2 py-0.5", billing === "yearly" ? "bg-white/20 text-white" : "bg-emerald-500/10 text-emerald-600")}>وفّر 17%</span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Simplified Plan Cards */}
      <section className="pb-16 px-4 -mt-8 relative z-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm flex flex-col items-center text-center relative overflow-hidden transition-all hover:shadow-md">
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-6 text-2xl">🆓</div>
              <h3 className="text-2xl font-black text-foreground mb-2">الباقة المجانية</h3>
              <p className="text-muted-foreground text-sm mb-6">متابعة أساسية لسيارة واحدة</p>
              <div className="mb-8">
                <span className="text-5xl font-black text-foreground">0</span>
                <span className="text-muted-foreground font-medium"> ريال</span>
              </div>
              <ul className="text-sm font-medium text-muted-foreground space-y-4 mb-8 text-right w-full flex-1">
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> <span className="text-foreground">سيارة واحدة</span></li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> <span className="text-foreground">إشعارات داخل التطبيق</span></li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> <span className="text-foreground">حساب مواعيد الصيانة</span></li>
                <li className="flex items-center gap-3 opacity-50"><X className="w-5 h-5 text-destructive shrink-0" /> بدون تنبيهات SMS أو بريد</li>
                <li className="flex items-center gap-3 opacity-50"><X className="w-5 h-5 text-destructive shrink-0" /> بدون حفظ فواتير</li>
              </ul>
              <Link href="/register" className="w-full py-4 rounded-xl bg-muted text-foreground font-bold hover:bg-muted/80 transition-colors">
                ابدأ مجاناً
              </Link>
            </div>

            {/* Individual Pro Plan */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-3xl p-8 shadow-xl shadow-primary/5 flex flex-col items-center text-center relative overflow-hidden md:-translate-y-4">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary to-orange-400" />
              <div className="absolute top-5 left-5 bg-primary/20 text-primary text-xs font-black px-3 py-1 rounded-full">الأكثر طلباً</div>
              
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-6 text-2xl shadow-inner border border-primary/20">💎</div>
              <h3 className="text-2xl font-black text-primary mb-2">باقة الفرد (برو)</h3>
              <p className="text-primary/70 text-sm mb-6 font-medium">ميزات متقدمة وتنبيهات شاملة</p>
              <div className="mb-8">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-black text-foreground">{billing === "yearly" ? "99" : "9"}</span>
                  <span className="text-muted-foreground font-medium">ريال / {billing === "yearly" ? "سنة" : "شهر"}</span>
                </div>
                {billing === "yearly" && <p className="text-xs text-primary font-bold mt-2 bg-primary/10 py-1 px-3 rounded-full inline-block">توفير 17% عن الدفع الشهري</p>}
              </div>
              <ul className="text-sm font-medium space-y-4 mb-8 text-right w-full flex-1">
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> <span className="text-foreground font-bold">كل ميزات الباقة المجانية</span></li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-primary shrink-0" /> <span className="text-foreground">تنبيهات SMS وبريد إلكتروني</span></li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-primary shrink-0" /> <span className="text-foreground">رفع وحفظ فواتير الإصلاح</span></li>
                {billing === "yearly" && (
                  <li className="flex items-center gap-3 bg-white/50 p-2 rounded-lg border border-primary/10"><Check className="w-5 h-5 text-primary shrink-0" /> <span className="text-primary font-bold">5 ملصقات مفرغة تشحن إليك 🏷️</span></li>
                )}
              </ul>
              <Link href={`/checkout?plan=pro_${billing}&billing=${billing}`} className="w-full py-4 rounded-xl bg-primary text-white font-black shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all">
                اشترك الآن
              </Link>
            </div>

            {/* Family Plan */}
            <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 rounded-3xl p-8 shadow-sm flex flex-col items-center text-center relative overflow-hidden transition-all hover:shadow-md">
              <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center mb-6 text-2xl shadow-inner border border-secondary/20">👨‍👩‍👧‍👦</div>
              <h3 className="text-2xl font-black text-secondary mb-2">باقة العائلة</h3>
              <p className="text-secondary/70 text-sm mb-6 font-medium">التحكم بسيارات العائلة بحسابات مستقلة</p>
              <div className="mb-8">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-black text-foreground">{billing === "yearly" ? "199" : "19"}</span>
                  <span className="text-muted-foreground font-medium">ريال / {billing === "yearly" ? "سنة" : "شهر"}</span>
                </div>
                {billing === "yearly" && <p className="text-xs text-secondary font-bold mt-2 bg-secondary/10 py-1 px-3 rounded-full inline-block">عائلة صغيرة (3 سيارات)</p>}
              </div>
              <ul className="text-sm font-medium space-y-4 mb-8 text-right w-full flex-1">
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> <span className="text-foreground font-bold">3 إلى 5 سيارات</span></li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-secondary shrink-0" /> <span className="text-foreground">حساب ولي الأمر وحساب للسائق</span></li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-secondary shrink-0" /> <span className="text-foreground">إلزام السائق بنموذج الفحص</span></li>
                {billing === "yearly" && (
                  <li className="flex items-center gap-3 bg-white/50 p-2 rounded-lg border border-secondary/10"><Check className="w-5 h-5 text-secondary shrink-0" /> <span className="text-secondary font-bold">حتى 15 ملصق تشحن إليك 🏷️</span></li>
                )}
              </ul>
              <Link href={`/checkout?plan=family_small_${billing}&billing=${billing}`} className="w-full py-4 rounded-xl bg-secondary text-white font-black hover:bg-secondary/90 shadow-lg shadow-secondary/20 hover:-translate-y-1 transition-all">
                اشترك الآن
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/*  أولاً: خطط الفرد                                      */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="pb-16 px-4">
        <div className="max-w-5xl mx-auto border-t border-border pt-16">
          <div className="mb-8 text-center text-muted-foreground flex items-center justify-center gap-2 font-bold mb-12">
            <ChevronDown className="w-5 h-5" />
            الجداول التفصيلية للمقارنة
            <ChevronDown className="w-5 h-5" />
          </div>
          <div className="mb-8">
            <h2 className="text-2xl font-black text-foreground mb-2 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm">1</span>
              خطط الفرد
            </h2>
            <div className="h-1 w-20 bg-gradient-to-r from-primary to-secondary rounded-full mb-4"></div>
            <p className="text-muted-foreground font-medium">مصممة لصاحب السيارة الواحدة الذي يريد متابعة صيانة سيارته وتلقي تنبيهات في الوقت المناسب.</p>
          </div>

          <div className="w-full overflow-x-auto glass-card p-4 sm:p-6 rounded-3xl sm:rounded-[2rem]">
            {/* Top Pricing Summary */}
            <table className="w-full text-sm mb-12 min-w-[400px] sm:min-w-[600px] border-collapse">
              <thead>
                <tr>
                  <th className="bg-transparent p-4 border-b border-border"></th>
                  <th className="bg-muted/50 text-foreground p-4 text-center border-b border-border w-[20%] rounded-tr-2xl font-bold">مجاني <span className="text-lg">🆓</span></th>
                  <th className="bg-primary/5 text-primary p-4 text-center border-b border-border w-[20%] font-bold">شهري <span className="text-lg">💎</span></th>
                  <th className="bg-secondary/5 text-secondary p-4 text-center border-b border-border w-[20%] rounded-tl-2xl font-bold">سنوي <span className="text-lg">🏆</span></th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 text-right font-bold text-foreground border-b border-border/50">السعر</td>
                  <td className="p-4 text-center text-emerald-500 font-bold border-b border-border/50">مجاناً</td>
                  <td className="p-4 text-center text-primary font-bold border-b border-border/50">ريال / شهر <span className="font-black text-xl">9</span></td>
                  <td className="p-4 text-center text-secondary font-bold border-b border-border/50">ريال / سنة <span className="font-black text-xl">99</span></td>
                </tr>
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 text-right font-bold text-foreground border-b border-border/50">ما تدفعه سنوياً</td>
                  <td className="p-4 text-center text-muted-foreground border-b border-border/50">—</td>
                  <td className="p-4 text-center text-muted-foreground border-b border-border/50 font-medium">108 ريال</td>
                  <td className="p-4 text-center text-emerald-500 font-bold border-b border-border/50 bg-emerald-500/5">✨ 99 ريال</td>
                </tr>
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 text-right font-bold text-foreground border-b border-border/50">عدد السيارات</td>
                  <td className="p-4 text-center border-b border-border/50 font-bold text-foreground">1</td>
                  <td className="p-4 text-center border-b border-border/50 font-bold text-foreground">1</td>
                  <td className="p-4 text-center border-b border-border/50 font-bold text-foreground">1</td>
                </tr>
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 text-right font-bold text-foreground border-b border-border/50 rounded-b-2xl">الملصقات</td>
                  <td className="p-4 text-center text-muted-foreground border-b border-border/50 rounded-b-2xl">—</td>
                  <td className="p-4 text-center text-muted-foreground border-b border-border/50">—</td>
                  <td className="p-4 text-center text-secondary font-bold border-b border-border/50 bg-secondary/5 rounded-bl-2xl">5 ملصقات 🏷️</td>
                </tr>
              </tbody>
            </table>
            {/* Detailed Features Title */}
            <h3 className="text-xl font-bold text-foreground mb-6">جدول الميزات التفصيلي</h3>

            {/* Detailed Features Table */}
            <div className="rounded-2xl border border-border overflow-hidden w-full">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-xs sm:text-sm min-w-[450px] sm:min-w-[600px] border-collapse bg-white">
                <thead>
                  <tr>
                    <th className="bg-muted text-foreground p-4 text-right border-b border-border border-l w-[40%] font-bold">الميزة</th>
                    <th className="bg-muted text-foreground p-4 text-center border-b border-border border-l w-[20%] font-bold">مجاني <span className="text-lg">🆓</span></th>
                    <th className="bg-muted text-primary p-4 text-center border-b border-border border-l w-[20%] font-bold">شهري <span className="text-lg">💎</span></th>
                    <th className="bg-muted text-secondary p-4 text-center border-b border-border w-[20%] font-bold">سنوي <span className="text-lg">🏆</span></th>
                  </tr>
                </thead>
                <tbody>
                  {/* Section 1 */}
                  <tr>
                    <td colSpan={4} className="bg-primary/5 text-primary font-bold py-3 px-4 border-b border-border">إعداد السيارة 🚗</td>
                  </tr>
                  <tr>
                    <td className="bg-[#f8fafc] py-2 px-3 text-slate-700 border border-white">نوع ناقل الحركة (يدوي / أوتوماتيك) ⚙️</td>
                    <td className={getCellClass(true)}>{getIcon(true)}</td>
                    <td className={getCellClass(true)}>{getIcon(true)}</td>
                    <td className={getCellClass(true)}>{getIcon(true)}</td>
                  </tr>
                <tr>
                  <td className="bg-[#f8fafc] py-2 px-3 text-slate-700 border border-white">فترة تغيير زيت ناقل الحركة (40,000 أو 60,000 كم) 📏</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                </tr>
                <tr>
                  <td className="bg-[#f8fafc] py-2 px-3 text-slate-700 border border-white">تسجيل قراءة العداد الحالية 🔢</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                </tr>

                {/* Section 2 */}
                <tr>
                  <td colSpan={4} className="bg-[#fff7ed] text-[#ea580c] font-bold py-2 px-3 border border-white">تذكيرات الزيوت 🛢️</td>
                </tr>
                <tr>
                  <td className="bg-[#f8fafc] py-2 px-3 text-slate-700 border border-white">زيت المحرك — بالأيام والكيلومترات 🛢️</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                </tr>
                <tr>
                  <td className="bg-[#f8fafc] py-2 px-3 text-slate-700 border border-white">زيت ناقل الحركة — حسب النوع المختار ⚙️</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                </tr>
                <tr>
                  <td className="bg-[#f8fafc] py-2 px-3 text-slate-700 border border-white">زيت الفرامل 🔴</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                </tr>
                <tr>
                  <td className="bg-[#f8fafc] py-2 px-3 text-slate-700 border border-white">زيت التوجيه 🔄</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                </tr>
                <tr>
                  <td className="bg-[#f8fafc] py-2 px-3 text-slate-700 border border-white">زيت التبريد (المياه) 🌡️</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                </tr>

                {/* Section 3 */}
                <tr>
                  <td colSpan={4} className="bg-[#f0fdf4] text-[#16a34a] font-bold py-2 px-3 border border-white">الفلاتر 🌀</td>
                </tr>
                <tr>
                  <td className={labelCell}>فلتر الهواء 🌀</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                </tr>
                <tr>
                  <td className={labelCell}>فلتر الوقود ⛽</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                </tr>

                {/* Section 4 */}
                <tr>
                  <td colSpan={4} className="bg-[#f0f9ff] text-[#0284c7] font-bold py-2 px-3 border border-white">وثائق السيارة 📋</td>
                </tr>
                <tr>
                  <td className={labelCell}>تاريخ انتهاء الرخصة (اختياري) 📄</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                </tr>
                <tr>
                  <td className={labelCell}>تاريخ الفحص الدوري 🔍</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                </tr>
                <tr>
                  <td className={labelCell}>تاريخ انتهاء التأمين 🛡️</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                </tr>
                <tr>
                  <td className={labelCell}>تاريخ انتهاء الاستيكر 🔖</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                </tr>

                {/* Section 5 */}
                <tr>
                  <td colSpan={4} className="bg-[#faf5ff] text-[#9333ea] font-bold py-2 px-3 border border-white">البطارية والإطارات 🔋</td>
                </tr>
                <tr>
                  <td className={labelCell}>متابعة البطارية (تاريخ، ماركة، ضمان) 🔋</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                </tr>
                <tr>
                  <td className={labelCell}>متابعة الإطارات (تاريخ، مقاس، كيلومترات) 🔄</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                </tr>

                {/* Section 6 */}
                <tr>
                  <td colSpan={4} className="bg-[#fefce8] text-[#ca8a04] font-bold py-2 px-3 border border-white">التنبيهات والحالة 🔔</td>
                </tr>
                <tr>
                  <td className={labelCell}>مؤشر الحالة التلقائي (أخضر/أصفر/أحمر) 🟢</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                </tr>
                <tr>
                  <td className={labelCell}>تنبيهات داخل التطبيق 📱</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                </tr>
                <tr>
                  <td className={labelCell}>تنبيهات بريد إلكتروني 📧</td>
                  <td className={getCellClass(false)}>{getIcon(false)}</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                </tr>
                <tr>
                  <td className={labelCell}>على الجوال SMS تنبيهات 💬</td>
                  <td className={getCellClass(false)}>{getIcon(false)}</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                </tr>

                {/* Section 7 */}
                <tr>
                  <td colSpan={4} className="bg-[#fffbeb] text-[#d97706] font-bold py-2 px-3 border border-white">ميزات إضافية ⭐</td>
                </tr>
                <tr>
                  <td className={labelCell}>رفع وحفظ فواتير الصيانة 📁</td>
                  <td className={getCellClass(false)}>{getIcon(false)}</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                </tr>
                <tr>
                  <td className={labelCell}>قائمة تجديد اختيارية قابلة للتخصيص ☑️</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                </tr>
                <tr>
                  <td className={labelCell}>5 ملصقات صيانة مفرغة تشحن مع الاشتراك 🏷️</td>
                  <td className={getCellClass(false)}>{getIcon(false)}</td>
                  <td className={getCellClass(false)}>{getIcon(false)}</td>
                  <td className={getCellClass(true)}>{getIcon(true)}</td>
                </tr>
              </tbody>
            </table>
            </div>
          </div>

            {/* Footer Note box */}
            <div className="mt-4 p-4 rounded-sm bg-[#fffbeb] border border-[#fde68a] text-slate-700 text-sm flex items-start gap-3 shadow-sm font-medium">
              <span className="text-2xl pt-1">🏷️</span>
              <p>
                الملصقات حصرياً مع الاشتراك السنوي بـ 99 ريال — 5 ملصقات مفرغة تكفي 6 أشهر تشحن لباب بيتك. كما توفر 9 ريال
                <br/>مقارنة بالاشتراك الشهري (108 ريال/سنة مقابل 99 ريال)
              </p>
            </div>
            
            <div className="mt-6 text-center">
              <Link href="/checkout?plan=pro_yearly&billing=yearly" className="inline-block px-8 py-3 rounded-xl bg-[#B45309] hover:bg-[#92400e] text-white font-black shadow-lg shadow-amber-900/20 transition-all hover:-translate-y-1">
                اشترك الآن بـ 99 ريال سنوياً
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/*  ثانياً: خطط العائلة                                   */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-foreground mb-2 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm">2</span>
              خطط العائلة
            </h2>
            <div className="h-1 w-20 bg-gradient-to-r from-primary to-secondary rounded-full mb-4"></div>
            <p className="text-muted-foreground font-medium">تابع جميع سيارات عائلتك من مكان واحد، مع نظام يُلزم السائق بتعبئة نموذج بعد كل تغيير زيت.</p>
          </div>

          <div className="w-full overflow-x-auto glass-card p-4 sm:p-6 rounded-3xl sm:rounded-[2rem]">
            {/* Family Pricing Table */}
            <table className="w-full text-xs sm:text-sm mb-12 min-w-[500px] md:min-w-[600px] border-collapse">
              <thead>
                <tr>
                  <th className="bg-transparent border-none w-[20%] p-4 text-right"></th>
                  <th className="bg-primary text-white p-4 border-b border-border w-[20%] font-bold text-center rounded-tr-2xl">صغيرة شهري</th>
                  <th className="bg-secondary text-white p-4 border-b border-border w-[20%] font-bold text-center">صغيرة سنوي</th>
                  <th className="bg-teal-600 text-white p-4 border-b border-border w-[20%] font-bold text-center">كبيرة شهري</th>
                  <th className="bg-indigo-600 text-white p-4 border-b border-border w-[20%] font-bold text-center rounded-tl-2xl">كبيرة سنوي</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 text-right font-bold text-foreground border-b border-border/50">عدد السيارات</td>
                  <td className="p-4 border-b border-border/50 text-center font-bold text-foreground">3 سيارات</td>
                  <td className="p-4 border-b border-border/50 text-center font-bold text-foreground">3 سيارات</td>
                  <td className="p-4 border-b border-border/50 text-center font-bold text-foreground">5 سيارات</td>
                  <td className="p-4 border-b border-border/50 text-center font-bold text-foreground">5 سيارات</td>
                </tr>
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 text-right font-bold text-foreground border-b border-border/50">السعر</td>
                  <td className="p-4 text-primary font-bold border-b border-border/50 text-center">19 ريال/شهر</td>
                  <td className="p-4 text-secondary font-bold border-b border-border/50 text-center">199 ريال/سنة</td>
                  <td className="p-4 text-teal-600 font-bold border-b border-border/50 text-center">29 ريال/شهر</td>
                  <td className="p-4 text-indigo-600 font-bold border-b border-border/50 text-center">299 ريال/سنة</td>
                </tr>
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 text-right font-bold text-foreground border-b border-border/50">ما تدفعه سنوياً</td>
                  <td className="p-4 text-muted-foreground border-b border-border/50 text-center font-medium">228 ريال</td>
                  <td className="p-4 text-emerald-500 font-black border-b border-border/50 text-center bg-emerald-500/5">✨ 199 ريال</td>
                  <td className="p-4 text-muted-foreground border-b border-border/50 text-center font-medium">348 ريال</td>
                  <td className="p-4 text-emerald-500 font-black border-b border-border/50 text-center bg-emerald-500/5">✨ 299 ريال</td>
                </tr>
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 text-right font-bold text-foreground border-b border-border/50 rounded-b-2xl">الملصقات</td>
                  <td className="p-4 text-muted-foreground border-b border-border/50 text-center rounded-br-2xl">—</td>
                  <td className="p-4 text-amber-500 font-black border-b border-border/50 text-center bg-amber-500/5">10 ملصقات 🏷️</td>
                  <td className="p-4 text-muted-foreground border-b border-border/50 text-center">—</td>
                  <td className="p-4 text-purple-500 font-black border-b border-border/50 text-center bg-purple-500/5 rounded-bl-2xl">15 ملصق 🏷️</td>
                </tr>
              </tbody>
            </table>

            {/* Roles Table */}
            <h3 className="text-xl font-bold text-foreground mb-6">الأدوار في خطة العائلة</h3>
            <div className="rounded-2xl border border-border overflow-hidden mb-12 overflow-x-auto w-full">
              <table className="w-full text-xs sm:text-sm min-w-[500px] md:min-w-[600px] border-collapse bg-white">
                <thead>
                  <tr>
                    <th className="bg-muted text-foreground p-4 border-b border-border border-l w-[25%] font-bold text-right">الدور</th>
                    <th className="bg-muted text-foreground p-4 border-b border-border border-l w-[50%] font-bold text-right">الصلاحيات</th>
                    <th className="bg-muted text-foreground p-4 border-b border-border w-[25%] font-bold text-right">ملاحظة</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-muted/5 transition-colors">
                    <td className="p-4 border-b border-border/50 text-right font-bold text-primary">ولي الأمر 👑</td>
                    <td className="p-4 border-b border-border/50 text-right text-muted-foreground font-medium group-hover:text-foreground">يرى جميع السيارات — يضيف سائقين — يتابع النماذج — يستقبل تنبيهات التأخر</td>
                    <td className="p-4 border-b border-border/50 text-right text-muted-foreground/70 font-medium">متابع فقط — لا يعبئ النماذج</td>
                  </tr>
                  <tr className="hover:bg-muted/5 transition-colors">
                    <td className="p-4 text-right font-bold text-emerald-600">السائق 🚗</td>
                    <td className="p-4 text-right text-muted-foreground font-medium group-hover:text-foreground">يرى سيارته فقط — ملزم بتعبئة نموذج بعد تغيير الزيت — يستقبل تذكيرات</td>
                    <td className="p-4 text-right text-muted-foreground/70 font-medium">لا يرى بيانات باقي السيارات</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Alerts Table */}
            <h3 className="text-xl font-bold text-foreground mb-6">آلية الإلزام والتنبيه</h3>
            <div className="rounded-2xl border border-border overflow-hidden overflow-x-auto w-full">
              <table className="w-full text-xs sm:text-sm mb-4 min-w-[450px] sm:min-w-[600px] border-collapse bg-white">
                <thead>
                  <tr>
                    <th className="bg-muted text-foreground p-4 border-b border-border border-l w-[10%] font-bold text-center">#</th>
                    <th className="bg-muted text-foreground p-4 border-b border-border border-l w-[60%] font-bold text-right">الخطوة</th>
                    <th className="bg-muted text-foreground p-4 border-b border-border w-[30%] font-bold text-center">المسؤول</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-muted/5 transition-colors">
                    <td className="p-4 border-b border-border/50 text-center text-muted-foreground font-bold">1</td>
                    <td className="p-4 border-b border-border/50 text-right text-muted-foreground font-medium">النظام يحسب موعد تغيير الزيت القادم تلقائياً</td>
                    <td className="p-4 border-b border-border/50 text-center font-bold text-indigo-500">تلقائي 🤖</td>
                  </tr>
                  <tr className="hover:bg-muted/5 transition-colors">
                    <td className="p-4 border-b border-border/50 text-center text-muted-foreground font-bold">2</td>
                    <td className="p-4 border-b border-border/50 text-right text-muted-foreground font-medium">تذكير للسائق قبل 7 أيام من الموعد</td>
                    <td className="p-4 border-b border-border/50 text-center font-bold text-indigo-500">تلقائي 🤖</td>
                  </tr>
                  <tr className="hover:bg-muted/5 transition-colors">
                    <td className="p-4 border-b border-border/50 text-center text-muted-foreground font-bold">3</td>
                    <td className="p-4 border-b border-border/50 text-right text-muted-foreground font-medium">السائق يغير الزيت ويعبئ النموذج</td>
                    <td className="p-4 border-b border-border/50 text-center font-bold text-emerald-600">السائق 🚗</td>
                  </tr>
                  <tr className="hover:bg-muted/5 transition-colors">
                    <td className="p-4 border-b border-border/50 text-center text-muted-foreground font-bold">4</td>
                    <td className="p-4 border-b border-border/50 text-right text-muted-foreground font-medium">ولي الأمر يستقبل إشعار "تم التغيير"</td>
                    <td className="p-4 border-b border-border/50 text-center font-bold text-secondary">ولي الأمر 👑</td>
                  </tr>
                  <tr className="hover:bg-muted/5 transition-colors">
                    <td className="p-4 text-center text-muted-foreground font-bold">5</td>
                    <td className="p-4 text-right text-muted-foreground font-medium">إذا لم يُعبأ النموذج خلال 48 ساعة — تنبيه تصعيدي لولي الأمر</td>
                    <td className="p-4 text-center font-bold text-destructive">تلقائي ⚠️</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/*  ثالثاً: مقارنة شاملة                                  */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 max-w-5xl mx-auto text-center">
            <h2 className="text-2xl font-black text-foreground mb-4">ثالثاً: مقارنة شاملة لجميع الخطط</h2>
            <div className="h-1 w-20 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto"></div>
          </div>

          {/* Comprehensive Comparison Table */}
          <div className="w-full overflow-x-auto glass-card p-4 sm:p-6 rounded-3xl sm:rounded-[2rem]">
            <div className="rounded-2xl border border-border overflow-hidden w-full">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-xs sm:text-sm min-w-[700px] md:min-w-[800px] border-collapse bg-white">
                <thead>
                  <tr>
                    <th className="bg-muted text-foreground p-4 border-b border-border border-l w-[22%] font-bold text-right">الميزة</th>
                    <th className="bg-muted text-foreground p-4 border-b border-border border-l w-[13%] font-bold text-center">مجاني</th>
                    <th className="bg-primary/5 text-primary p-4 border-b border-border border-l w-[13%] font-bold text-center">شهري 9</th>
                    <th className="bg-secondary/5 text-secondary p-4 border-b border-border border-l w-[13%] font-bold text-center">سنوي 99</th>
                    <th className="bg-teal-500/5 text-teal-600 p-4 border-b border-border border-l w-[13%] font-bold text-center">عائلة س شهري</th>
                    <th className="bg-emerald-500/5 text-emerald-600 p-4 border-b border-border border-l w-[13%] font-bold text-center">عائلة س سنوي</th>
                    <th className="bg-indigo-500/5 text-indigo-600 p-4 border-b border-border w-[13%] font-bold text-center">عائلة ك سنوي</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Row 1 */}
                  <tr className="hover:bg-muted/5 transition-colors">
                    <td className="p-4 border-b border-border/50 text-foreground font-medium text-right bg-muted/20">عدد السيارات</td>
                    <td className="p-4 text-center border-b border-border/50 font-bold text-foreground">1</td>
                    <td className="p-4 text-center border-b border-border/50 font-bold text-primary bg-primary/5">1</td>
                    <td className="p-4 text-center border-b border-border/50 font-bold text-secondary bg-secondary/5">1</td>
                    <td className="p-4 text-center border-b border-border/50 font-bold text-teal-600">3</td>
                    <td className="p-4 text-center border-b border-border/50 font-bold text-emerald-600">3</td>
                    <td className="p-4 text-center border-b border-border/50 font-bold text-indigo-600">5</td>
                  </tr>
                  {/* Row 2 */}
                  <tr className="hover:bg-muted/5 transition-colors">
                    <td className="p-4 border-b border-border/50 text-muted-foreground font-medium text-right group-hover:text-foreground">تذكيرات الصيانة</td>
                    <td className={getCellClass(true)}>{getIcon(true)}</td>
                    <td className={getCellClass(true)}>{getIcon(true)}</td>
                    <td className={getCellClass(true)}>{getIcon(true)}</td>
                    <td className={getCellClass(true)}>{getIcon(true)}</td>
                    <td className={getCellClass(true)}>{getIcon(true)}</td>
                    <td className={getCellClass(true)}>{getIcon(true)}</td>
                  </tr>
                  {/* Row 3 */}
                  <tr className="hover:bg-muted/5 transition-colors">
                    <td className="p-4 border-b border-border/50 text-muted-foreground font-medium text-right group-hover:text-foreground">ناقل الحركة + فترة التغيير</td>
                    <td className={getCellClass(true)}>{getIcon(true)}</td>
                    <td className={getCellClass(true)}>{getIcon(true)}</td>
                    <td className={getCellClass(true)}>{getIcon(true)}</td>
                    <td className={getCellClass(true)}>{getIcon(true)}</td>
                    <td className={getCellClass(true)}>{getIcon(true)}</td>
                    <td className={getCellClass(true)}>{getIcon(true)}</td>
                  </tr>
                  {/* Row 4 */}
                  <tr className="hover:bg-muted/5 transition-colors">
                    <td className="p-4 border-b border-border/50 text-muted-foreground font-medium text-right group-hover:text-foreground">تذكير رخصة/تأمين/فحص</td>
                    <td className={getCellClass(true)}>{getIcon(true)}</td>
                    <td className={getCellClass(true)}>{getIcon(true)}</td>
                    <td className={getCellClass(true)}>{getIcon(true)}</td>
                    <td className={getCellClass(true)}>{getIcon(true)}</td>
                    <td className={getCellClass(true)}>{getIcon(true)}</td>
                    <td className={getCellClass(true)}>{getIcon(true)}</td>
                  </tr>
                  {/* Row 5 */}
                  <tr className="hover:bg-muted/5 transition-colors">
                    <td className="p-4 border-b border-border/50 text-muted-foreground font-medium text-right group-hover:text-foreground">تنبيه SMS والبريد</td>
                    <td className={getCellClass(false)}>{getIcon(false)}</td>
                    <td className={getCellClass(true)}>{getIcon(true)}</td>
                    <td className={getCellClass(true)}>{getIcon(true)}</td>
                    <td className={getCellClass(true)}>{getIcon(true)}</td>
                    <td className={getCellClass(true)}>{getIcon(true)}</td>
                    <td className={getCellClass(true)}>{getIcon(true)}</td>
                  </tr>
                  {/* Row 6 */}
                  <tr className="hover:bg-muted/5 transition-colors">
                    <td className="p-4 border-b border-border/50 text-muted-foreground font-medium text-right group-hover:text-foreground">رفع الفواتير</td>
                    <td className={getCellClass(false)}>{getIcon(false)}</td>
                    <td className={getCellClass(true)}>{getIcon(true)}</td>
                    <td className={getCellClass(true)}>{getIcon(true)}</td>
                    <td className={getCellClass(true)}>{getIcon(true)}</td>
                    <td className={getCellClass(true)}>{getIcon(true)}</td>
                    <td className={getCellClass(true)}>{getIcon(true)}</td>
                  </tr>
                  {/* Row 7 */}
                  <tr className="hover:bg-muted/5 transition-colors">
                    <td className="p-4 border-b border-border/50 text-muted-foreground font-medium text-right group-hover:text-foreground">نظام السائق وولي الأمر</td>
                    <td className={getCellClass(false)}>{getIcon(false)}</td>
                    <td className={getCellClass(false)}>{getIcon(false)}</td>
                    <td className={getCellClass(false)}>{getIcon(false)}</td>
                    <td className={getCellClass(true)}>{getIcon(true)}</td>
                    <td className={getCellClass(true)}>{getIcon(true)}</td>
                    <td className={getCellClass(true)}>{getIcon(true)}</td>
                  </tr>
                  {/* Row 8 */}
                  <tr className="hover:bg-muted/5 transition-colors">
                    <td className="p-4 border-b border-border/50 text-muted-foreground font-medium text-right group-hover:text-foreground">الملصقات المرفقة</td>
                    <td className={getCellClass(false)}>{getIcon(false)}</td>
                    <td className={getCellClass(false)}>{getIcon(false)}</td>
                    <td className="bg-amber-500/10 text-amber-600 font-bold text-center border-b border-border/50 py-4">5 🏷️</td>
                    <td className={getCellClass(false)}>{getIcon(false)}</td>
                    <td className="bg-amber-500/10 text-amber-600 font-bold text-center border-b border-border/50 py-4">10 🏷️</td>
                    <td className="bg-purple-500/10 text-purple-600 font-bold text-center border-b border-border/50 py-4">15 🏷️</td>
                  </tr>
                  {/* Row 9 */}
                  <tr className="hover:bg-muted/5 transition-colors">
                    <td className="p-4 border-b border-border/50 text-foreground font-bold text-right bg-muted/20">السعر السنوي</td>
                    <td className="bg-emerald-500/10 text-emerald-600 font-bold text-center border-b border-border/50 py-4">مجاني</td>
                    <td className="bg-primary/5 text-primary font-bold text-center border-b border-border/50 py-4">108 ريال</td>
                    <td className="bg-secondary/5 text-secondary font-bold text-center border-b border-border/50 py-4">99 ريال</td>
                    <td className="bg-teal-500/5 text-teal-600 font-bold text-center border-b border-border/50 py-4">228 ريال</td>
                    <td className="bg-emerald-500/5 text-emerald-600 font-bold text-center border-b border-border/50 py-4">199 ريال</td>
                    <td className="bg-indigo-500/5 text-indigo-600 font-bold text-center border-b border-border/50 py-4">299 ريال</td>
                  </tr>
                </tbody>
              </table>
              </div>
            </div>
            
            {/* Box Highlight Callouts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {/* Family Box */}
              <div className="bg-gradient-to-l from-indigo-500/10 to-transparent border border-indigo-500/20 p-6 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-right w-full">
                  <h4 className="font-bold text-indigo-600 text-lg mb-2">الأفضل قيمة للعائلة 👨‍👩‍👧‍👦</h4>
                  <p className="text-muted-foreground text-sm font-medium">الخطة السنوية توفر 29+ ريال وتشمل ملصقات لكل سيارة في العائلة</p>
                </div>
              </div>
              {/* Individual Box */}
              <div className="bg-gradient-to-l from-primary/10 to-transparent border border-primary/20 p-6 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-right w-full">
                  <h4 className="font-bold text-primary text-lg mb-2">الأفضل قيمة للفرد 💡</h4>
                  <p className="text-muted-foreground text-sm font-medium">الاشتراك السنوي بـ 99 ريال — توفر 9 ريال وتحصل على 5 ملصقات مجاناً</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="pb-16 px-4 text-center border-t border-border/50 pt-16 mt-8 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        <div className="flex justify-center gap-4 mt-8">
          <Link href="/register" className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all">
            <ArrowLeft className="w-5 h-5" /> ابدأ مجاناً الآن
          </Link>
          <Link href="/" className="flex items-center gap-2 px-8 py-3 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-border/80 font-medium transition-all bg-white hover:bg-muted/20 shadow-sm">
            الرئيسية
          </Link>
        </div>
      </section>
    </div>
  );
}
