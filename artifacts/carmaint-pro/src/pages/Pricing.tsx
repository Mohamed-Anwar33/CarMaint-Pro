import React, { useState } from "react";
import { Check, X, Crown, Zap, Star, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type BillingCycle = "monthly" | "yearly";

// ─── Individual Plans ─────────────────────────────────────────────
const individualPlans = [
  {
    id: "free",
    name: "المجانية",
    subtitle: "ابدأ مجاناً",
    monthlyPrice: 0,
    yearlyPrice: 0,
    cars: 1,
    trial: null,
    badge: null,
    icon: <Zap className="w-5 h-5" />,
    color: "slate" as const,
    highlight: false,
  },
  {
    id: "pro_monthly",
    name: "الفردية الشهرية",
    subtitle: "للأفراد",
    monthlyPrice: 9,
    yearlyPrice: null,
    cars: 1,
    trial: "3 أيام تجريبية",
    badge: null,
    icon: <Crown className="w-5 h-5" />,
    color: "primary" as const,
    highlight: false,
  },
  {
    id: "pro_yearly",
    name: "الفردية السنوية",
    subtitle: "وفّر مع الاشتراك السنوي",
    monthlyPrice: null,
    yearlyPrice: 99,
    cars: 1,
    trial: "108 أيام تجريبية",
    badge: "الأوفر",
    icon: <Star className="w-5 h-5" />,
    color: "secondary" as const,
    highlight: true,
  },
];

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
    cars: 5,
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
    cars: "غير محدود",
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
    cars: "غير محدود",
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

const featureSections: { title: string; features: Feature[] }[] = [
  {
    title: "إعداد السيارة",
    features: [
      { label: "عدد السيارات", values: ["1", "1", "1", "3", "5", "غير محدود"] },
      { label: "تذكيرات الصيانة", values: [true, true, true, true, true, true] },
    ],
  },
  {
    title: "تذكيرات التغيير",
    features: [
      { label: "تتبع الحركة + قراءة الكيلومترات", values: [true, true, true, true, true, true] },
      { label: "تذكير قبل الموعد (15 / 30 يوم)", values: ["15 يوم", "15 يوم", "30 يوم", "30 يوم", "30 يوم", "30 يوم"] },
      { label: "إيميل بالموعد", values: [true, true, true, true, true, true] },
      { label: "تذكير لولي الأمر", values: [false, false, true, true, true, true] },
      { label: "إشعار SMS", values: [false, false, true, true, true, true] },
    ],
  },
  {
    title: "البطارية",
    features: [
      { label: "رفع الفواتير", values: [false, true, true, true, true, true] },
    ],
  },
  {
    title: "وثائق السيارة",
    features: [
      { label: "تاريخ تجديد التسجيل", values: [true, true, true, true, true, true] },
      { label: "تاريخ الفحص الدوري", values: [true, true, true, true, true, true] },
      { label: "تاريخ انتهاء التأمين", values: [true, true, true, true, true, true] },
    ],
  },
  {
    title: "المشاركة والزيارات",
    features: [
      { label: "متابعة السيارات بمركة", values: [false, false, false, true, true, true] },
      { label: "نظام السائق والأمر", values: [false, false, false, true, true, true] },
    ],
  },
  {
    title: "المعلومات المرفقة",
    features: [
      { label: "المعلومات المرفقة", values: [false, "5%", "5%", "10%", "10%", "15%"] },
    ],
  },
];

const planHeaders = ["مجاني", "فردي شهري", "سنوي 99", "عائلة صغيرة", "عائلة من", "عائلة ك"];
const planPrices = ["مجاناً", "108 ريال", "99 ريال", "199 ريال", "228 ريال", "299 ريال"];

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
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between px-4 py-2 bg-card/50 border border-border/30 rounded-lg mb-1 text-sm font-bold text-white hover:bg-card transition-colors">
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
      <section className="relative py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4">
            دليل <span className="text-primary">الخطط</span> والميزات الكامل
          </h1>
          <p className="text-muted-foreground text-lg mb-8">اختر الخطة المناسبة لك ولعائلتك</p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-1 p-1 rounded-2xl bg-card border border-border/50">
            <button
              onClick={() => setBilling("monthly")}
              className={cn("px-5 py-2 rounded-xl text-sm font-bold transition-all", billing === "monthly" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-white")}
            >شهري</button>
            <button
              onClick={() => setBilling("yearly")}
              className={cn("px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2", billing === "yearly" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-white")}
            >
              سنوي
              <span className="text-[10px] bg-emerald-500 text-white rounded-full px-1.5 py-0.5">وفّر 17%</span>
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/*  أولاً: خطط الفرد                                      */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-black text-white mb-2 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary font-black text-lg flex items-center justify-center">١</span>
            أولاً: خطة الفرد
          </h2>
          <p className="text-muted-foreground mb-6 text-sm">مصممة للأفراد الذين يريدون متابعة صيانة سيارة واحدة وتلقّي التنبيهات في الوقت المناسب.</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {individualPlans.map((plan) => {
              const price = billing === "yearly" && plan.yearlyPrice !== null ? plan.yearlyPrice : plan.monthlyPrice;
              const period = plan.yearlyPrice !== null && billing === "yearly" ? "سنوياً" : "شهرياً";
              return (
                <motion.div
                  key={plan.id}
                  whileHover={{ y: -4 }}
                  className={cn(
                    "relative rounded-2xl border p-5 flex flex-col gap-4 transition-all",
                    plan.highlight
                      ? "bg-gradient-to-b from-secondary/10 to-secondary/5 border-secondary/30 shadow-lg shadow-secondary/10"
                      : "bg-card border-border/50"
                  )}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-secondary text-background text-xs font-black shadow-md">
                      {plan.badge}
                    </div>
                  )}
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", plan.highlight ? "bg-secondary/20 text-secondary" : plan.color === "primary" ? "bg-primary/15 text-primary" : "bg-slate-700 text-slate-400")}>
                    {plan.icon}
                  </div>
                  <div>
                    <h3 className="font-black text-white text-lg">{plan.name}</h3>
                    <p className="text-muted-foreground text-xs mt-0.5">{plan.subtitle}</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    {price === 0 ? (
                      <span className="text-3xl font-black text-white">مجاناً</span>
                    ) : (
                      <>
                        <span className="text-3xl font-black text-white">{price}</span>
                        <span className="text-sm text-muted-foreground">ريال/{period}</span>
                      </>
                    )}
                  </div>
                  <div className="space-y-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2"><span className="text-primary">🚗</span> {plan.cars} سيارة</div>
                    {plan.trial && <div className="flex items-center gap-2"><span className="text-secondary">⏱️</span> {plan.trial}</div>}
                  </div>
                  <Link href="/register" className={cn("mt-auto block text-center py-2.5 rounded-xl font-bold text-sm transition-all", plan.highlight ? "bg-secondary text-background hover:bg-secondary/90" : "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20")}>
                    ابدأ الآن
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/*  ثانياً: خطط العائلة                                   */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-black text-white mb-2 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-secondary/10 border border-secondary/20 text-secondary font-black text-lg flex items-center justify-center">٢</span>
            ثانياً: خطة العائلة
          </h2>
          <p className="text-muted-foreground mb-6 text-sm">تابع جميع سيارات عائلتك من مكان واحد، مع نظام السائق الذكي الذي يتعلم نمط القيادة بعد كل تغيير زيت.</p>

          {/* Roles */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { role: "ولي الأمر", emoji: "👑", access: "يرى جميع السيارات + يتابع السائق", note: "يُبلَّغ ببيانات نموذج السائق بعد التغيير" },
              { role: "السائق", emoji: "🚗", access: "يرى سيارته فقط", note: "لا يرى بيانات باقي السيارات" },
            ].map(r => (
              <div key={r.role} className="rounded-xl bg-card border border-border/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{r.emoji}</span>
                  <span className="font-bold text-white text-sm">{r.role}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{r.access}</p>
                <p className="text-xs text-slate-500">{r.note}</p>
              </div>
            ))}
          </div>

          {/* Alert System */}
          <div className="rounded-2xl bg-card border border-border/50 p-5 mb-6">
            <h3 className="font-black text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs flex items-center justify-center font-black">🔔</span>
              آلية الإلزام والتنبيه
            </h3>
            <div className="space-y-2">
              {alertRows.map(row => (
                <div key={row.step} className="flex items-center gap-3 rounded-xl bg-background/50 border border-border/30 px-4 py-2.5">
                  <span className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black flex items-center justify-center shrink-0">{row.step}</span>
                  <p className="text-sm text-slate-300 flex-1">{row.text}</p>
                  <span className="text-lg">{row.icon}</span>
                  <span className="text-[10px] text-slate-500 shrink-0">{row.who}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Family Plan Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {familyPlans.map((plan) => (
              <motion.div
                key={plan.id}
                whileHover={{ y: -3 }}
                className={cn(
                  "relative rounded-2xl border p-4 flex flex-col gap-3",
                  plan.highlight ? "bg-gradient-to-b from-primary/10 to-primary/5 border-primary/30 shadow-lg" : "bg-card border-border/50"
                )}
              >
                {plan.badge && (
                  <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-black">{plan.badge}</div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{plan.name}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white">{plan.monthlyPrice ?? plan.yearlyPrice}</span>
                    <span className="text-xs text-muted-foreground">ريال/{plan.monthlyPrice ? "شهري" : "سنوي"}</span>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5"><span>🚗</span> {plan.cars} سيارة</div>
                  {plan.points && <div className="flex items-center gap-1.5"><span>⭐</span> {plan.points} نقطة</div>}
                  {plan.offers && <div className="flex items-center gap-1.5"><span>🎁</span> {plan.offers} عروض</div>}
                </div>
                <Link href="/register" className={cn("block text-center py-2 rounded-xl text-xs font-bold transition-all", plan.highlight ? "bg-primary text-white" : "bg-white/5 text-muted-foreground hover:bg-white/10")}>
                  اشترك الآن
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/*  ثالثاً: مقارنة شاملة                                  */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-white/5 border border-border text-white font-black text-lg flex items-center justify-center">٣</span>
            ثالثاً: مقارنة شاملة لجميع الخطط
          </h2>

          {/* Scrollable table */}
          <div className="rounded-2xl border border-border/50 overflow-hidden overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="bg-card border-b border-border/50">
                  <th className="text-right px-4 py-3 text-muted-foreground font-semibold w-44">الميزة</th>
                  {planHeaders.map((h, i) => (
                    <th key={i} className={cn("px-3 py-3 text-center font-black text-xs", i === 2 ? "text-secondary" : i >= 3 ? "text-primary" : "text-white")}>
                      {h}
                      <div className={cn("text-[10px] font-normal mt-0.5", "text-muted-foreground")}>{planPrices[i]}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {featureSections.map((section, si) => (
                  <React.Fragment key={`section-${si}`}>
                    <tr className="bg-white/2 border-t border-border/30">
                      <td colSpan={7} className="px-4 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">{section.title}</td>
                    </tr>
                    {section.features.map((feature, fi) => (
                      <tr key={`feature-${si}-${fi}`} className="border-t border-border/20 hover:bg-white/2 transition-colors">
                        <td className="px-4 py-2.5 text-sm text-slate-300">{feature.label}</td>
                        {feature.values.map((val, vi) => (
                          <td key={vi} className="px-3 py-2.5 text-center">
                            <FeatureCell value={val} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
                {/* Price row */}
                <tr className="border-t-2 border-border/50 bg-card">
                  <td className="px-4 py-3 font-bold text-white text-sm">السعر الشهري</td>
                  <td className="px-3 py-3 text-center text-xs font-bold text-emerald-400">مجاني</td>
                  <td className="px-3 py-3 text-center text-xs font-bold text-white">108 ريال</td>
                  <td className="px-3 py-3 text-center text-xs font-bold text-secondary">99 ريال</td>
                  <td className="px-3 py-3 text-center text-xs font-bold text-primary">199 ريال</td>
                  <td className="px-3 py-3 text-center text-xs font-bold text-primary">228 ريال</td>
                  <td className="px-3 py-3 text-center text-xs font-bold text-primary">299 ريال</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Best Value Callouts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="rounded-2xl bg-gradient-to-l from-secondary/10 to-secondary/5 border border-secondary/20 p-5">
              <p className="text-sm font-bold text-secondary mb-1">الأفضل قيمة للفرد 🌟</p>
              <p className="text-xs text-slate-400">الاشتراك السنوي بـ 99 ريال = 9 ريال شهرياً وتحصل على 5 خدمات مجانية + 108 أيام تجريبية</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-l from-primary/10 to-primary/5 border border-primary/20 p-5">
              <p className="text-sm font-bold text-primary mb-1">الأفضل قيمة للعائلة 👨‍👩‍👧‍👦</p>
              <p className="text-xs text-slate-400">الخطة السنوية من 29+ ريال = 199 ريال وتشمل خدمات لكل سيارة في العائلة</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="pb-16 px-4 text-center border-t border-border/30 pt-12">
        <p className="text-muted-foreground text-sm mb-1">صيانة سيارتي — CarMaint Pro</p>
        <p className="text-muted-foreground text-xs">www.carmaint.sa · {new Date().getFullYear()}</p>
        <div className="flex justify-center gap-3 mt-6">
          <Link href="/register" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all">
            <ArrowLeft className="w-4 h-4" /> ابدأ مجاناً الآن
          </Link>
          <Link href="/" className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-muted-foreground hover:text-white hover:border-border/80 font-medium transition-all">
            الرئيسية
          </Link>
        </div>
      </section>
    </div>
  );
}
