import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { CreditCard, Shield, CheckCircle, ArrowRight, Crown, Lock, Car } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { CarMaintLogo } from "@/components/CarMaintLogo";
import { PLANS, MOYASAR_PUBLISHABLE_KEY, getAmountInHalalas, formatPrice, getBillingLabel } from "@/lib/moyasar";

export default function Checkout() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const moyasarRef = useRef<HTMLDivElement>(null);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Parse URL params
  const params = new URLSearchParams(window.location.search);
  const planId = params.get("plan") || "pro_yearly";
  const billing = (params.get("billing") as "monthly" | "yearly") || "yearly";

  const plan = PLANS[planId];

  useEffect(() => {
    if (!user) {
      setLocation("/login");
      return;
    }
    if (!plan) {
      setError("خطة غير صالحة");
      return;
    }
    if (!MOYASAR_PUBLISHABLE_KEY) {
      setError("بوابة الدفع غير مهيأة. يرجى التواصل مع الدعم الفني.");
      return;
    }

    // Wait for Moyasar script to load, then init
    const initTimer = setInterval(() => {
      if (typeof (window as any).Moyasar !== "undefined" && moyasarRef.current && !initialized) {
        clearInterval(initTimer);
        try {
          const amount = getAmountInHalalas(planId, billing);
          (window as any).Moyasar.init({
            element: "#moyasar-form",
            amount: amount,
            currency: "SAR",
            description: `اشتراك مداري - ${plan.name}`,
            publishable_api_key: MOYASAR_PUBLISHABLE_KEY,
            callback_url: `${window.location.origin}/payment/callback`,
            methods: ["creditcard"],
            metadata: {
              user_id: user.id,
              user_email: user.email,
              plan_id: planId,
              db_plan: plan.dbPlan,
              billing_cycle: billing,
            },
          });
          setInitialized(true);
        } catch (err) {
          console.error("Moyasar init error:", err);
          setError("فشل في تحميل نموذج الدفع");
        }
      }
    }, 200);

    return () => clearInterval(initTimer);
  }, [user, plan, planId, billing, initialized, setLocation]);

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground mb-4">خطة غير صالحة</h2>
          <Link href="/pricing" className="text-primary hover:underline">العودة للأسعار</Link>
        </div>
      </div>
    );
  }

  const amount = billing === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <CarMaintLogo size="md" animated />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground mb-2">إتمام الاشتراك</h1>
          <p className="text-muted-foreground">أنت على بعد خطوة واحدة من تفعيل خطتك</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Left: Order Summary */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="bg-card border border-border/50 rounded-3xl p-6 shadow-xl sticky top-28"
            >
              <h2 className="font-bold text-foreground mb-5 flex items-center gap-2">
                <Crown className="w-5 h-5 text-primary" /> ملخص الطلب
              </h2>

              {/* Plan Card */}
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mb-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-foreground text-lg">{plan.name}</h3>
                    <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full">
                      {getBillingLabel(billing)}
                    </span>
                  </div>
                  <div className="text-left">
                    <span className="text-2xl font-black text-primary">{amount}</span>
                    <span className="text-sm text-muted-foreground mr-1">ريال</span>
                  </div>
                </div>

                <div className="space-y-2 mt-4 pt-4 border-t border-primary/10">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Car className="w-4 h-4 text-primary/60" />
                    <span>حتى {plan.maxCars} {plan.maxCars === 1 ? "سيارة" : "سيارات"}</span>
                  </div>
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-emerald-500/60" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">المبلغ</span>
                  <span className="text-foreground font-medium">{formatPrice(amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">الضريبة (شامل)</span>
                  <span className="text-foreground font-medium">0 ريال</span>
                </div>
                <div className="border-t border-border/50 pt-3 flex justify-between text-base">
                  <span className="font-bold text-foreground">الإجمالي</span>
                  <span className="font-black text-primary text-xl">{formatPrice(amount)}</span>
                </div>
              </div>

              {/* Security Badges */}
              <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Lock className="w-3.5 h-3.5 text-emerald-500" />
                  <span>دفع آمن 256-bit SSL</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Shield className="w-3.5 h-3.5 text-primary" />
                  <span>بوابة ميسر المعتمدة</span>
                </div>
              </div>

              {/* Back Link */}
              <Link href="/pricing" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mt-6 pt-4 border-t border-border/50 transition-colors">
                <ArrowRight className="w-4 h-4" /> العودة للأسعار
              </Link>
            </motion.div>
          </div>

          {/* Right: Payment Form */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="bg-card border border-border/50 rounded-3xl p-6 sm:p-8 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-6 pb-5 border-b border-border/50">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-bold text-foreground">بيانات الدفع</h2>
                  <p className="text-xs text-muted-foreground">أدخل بيانات بطاقتك لإتمام الدفع</p>
                </div>
              </div>

              {error ? (
                <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3">
                    <CreditCard className="w-6 h-6 text-destructive" />
                  </div>
                  <h3 className="font-bold text-destructive mb-2">خطأ في نموذج الدفع</h3>
                  <p className="text-sm text-muted-foreground mb-4">{error}</p>
                  <Link href="/pricing" className="text-primary text-sm font-medium hover:underline">
                    العودة للأسعار
                  </Link>
                </div>
              ) : (
                <>
                  {/* Moyasar Form Container */}
                  <div
                    id="moyasar-form"
                    ref={moyasarRef}
                    className="min-h-[300px] flex items-center justify-center"
                  >
                    {!initialized && (
                      <div className="text-center py-12">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-sm text-muted-foreground">جاري تحميل نموذج الدفع...</p>
                      </div>
                    )}
                  </div>

                  {/* Accepted Cards */}
                  <div className="mt-6 pt-4 border-t border-border/50">
                    <p className="text-xs text-muted-foreground mb-3">البطاقات المقبولة:</p>
                    <div className="flex items-center gap-3">
                      {["mada", "Visa", "Mastercard", "AMEX"].map(card => (
                        <div key={card} className="px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-medium text-muted-foreground">
                          {card}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
