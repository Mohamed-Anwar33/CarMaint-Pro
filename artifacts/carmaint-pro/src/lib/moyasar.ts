/**
 * Moyasar Payment Service Library
 * ================================
 * Central configuration for all payment-related logic.
 * Uses Moyasar Payment Form JS for client-side payment collection.
 * 
 * SETUP: Replace VITE_MOYASAR_PUBLISHABLE_KEY in .env with your actual key.
 */

// ─── Plan Pricing Constants (Single Source of Truth) ─────────────
export interface PlanConfig {
  id: string;
  dbPlan: "free" | "pro" | "family_small" | "family_large";
  name: string;
  nameEn: string;
  monthlyPrice: number;   // SAR
  yearlyPrice: number;    // SAR
  maxCars: number;
  features: string[];
}

export const PLANS: Record<string, PlanConfig> = {
  free: {
    id: "free",
    dbPlan: "free",
    name: "مجاني",
    nameEn: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    maxCars: 1,
    features: ["سيارة واحدة", "تذكيرات الصيانة", "مؤشر الحالة"],
  },
  pro_monthly: {
    id: "pro_monthly",
    dbPlan: "pro",
    name: "شهري",
    nameEn: "Pro Monthly",
    monthlyPrice: 9,
    yearlyPrice: 108,
    maxCars: 1,
    features: ["سيارة واحدة", "تنبيهات SMS والبريد", "رفع الفواتير"],
  },
  pro_yearly: {
    id: "pro_yearly",
    dbPlan: "pro",
    name: "سنوي",
    nameEn: "Pro Yearly",
    monthlyPrice: 8.25,
    yearlyPrice: 99,
    maxCars: 1,
    features: ["سيارة واحدة", "تنبيهات SMS والبريد", "رفع الفواتير", "5 ملصقات مجانية"],
  },
  family_small_monthly: {
    id: "family_small_monthly",
    dbPlan: "family_small",
    name: "عائلة صغيرة شهري",
    nameEn: "Family Small Monthly",
    monthlyPrice: 19,
    yearlyPrice: 228,
    maxCars: 3,
    features: ["3 سيارات", "نظام السائق وولي الأمر", "تنبيهات SMS"],
  },
  family_small_yearly: {
    id: "family_small_yearly",
    dbPlan: "family_small",
    name: "عائلة صغيرة سنوي",
    nameEn: "Family Small Yearly",
    monthlyPrice: 16.58,
    yearlyPrice: 199,
    maxCars: 3,
    features: ["3 سيارات", "نظام السائق وولي الأمر", "10 ملصقات مجانية"],
  },
  family_large_monthly: {
    id: "family_large_monthly",
    dbPlan: "family_large",
    name: "عائلة كبيرة شهري",
    nameEn: "Family Large Monthly",
    monthlyPrice: 29,
    yearlyPrice: 348,
    maxCars: 5,
    features: ["5 سيارات", "نظام السائق وولي الأمر", "كل المميزات"],
  },
  family_large_yearly: {
    id: "family_large_yearly",
    dbPlan: "family_large",
    name: "عائلة كبيرة سنوي",
    nameEn: "Family Large Yearly",
    monthlyPrice: 24.92,
    yearlyPrice: 299,
    maxCars: 5,
    features: ["5 سيارات", "نظام السائق وولي الأمر", "15 ملصق", "كل المميزات"],
  },
};

// ─── Get Price for Payment ───────────────────────────────────────
export function getPaymentAmount(planId: string, billing: "monthly" | "yearly"): number {
  const plan = PLANS[planId];
  if (!plan) return 0;
  
  if (billing === "monthly") return plan.monthlyPrice;
  return plan.yearlyPrice;
}

/**
 * Get amount in halalas (smallest unit) for Moyasar
 * Moyasar expects amounts in halalas: 99 SAR = 9900 halalas
 */
export function getAmountInHalalas(planId: string, billing: "monthly" | "yearly"): number {
  const amount = getPaymentAmount(planId, billing);
  return Math.round(amount * 100);
}

// ─── Moyasar Payment Form Integration ────────────────────────────
export const MOYASAR_PUBLISHABLE_KEY = import.meta.env.VITE_MOYASAR_PUBLISHABLE_KEY || "";

export interface MoyasarPaymentConfig {
  element: string;
  amount: number;          // in halalas
  currency: string;
  description: string;
  publishable_api_key: string;
  callback_url: string;
  methods: string[];
  on_completed?: (payment: MoyasarPayment) => void;
  on_failure?: (error: unknown) => void;
  metadata?: Record<string, string>;
}

export interface MoyasarPayment {
  id: string;
  status: string;
  amount: number;
  currency: string;
  description: string;
  source: {
    type: string;
    company: string;
    name: string;
    number: string;
    message: string;
  };
}

/**
 * Initialize Moyasar Payment Form
 * Call this after the target element is mounted in the DOM.
 */
export function initMoyasarPayment(config: {
  elementId: string;
  planId: string;
  billing: "monthly" | "yearly";
  userId: string;
  userEmail: string;
}): void {
  const plan = PLANS[config.planId];
  if (!plan) {
    console.error("Invalid plan ID:", config.planId);
    return;
  }

  const amount = getAmountInHalalas(config.planId, config.billing);
  if (amount <= 0) {
    console.error("Invalid amount for plan:", config.planId);
    return;
  }

  const callbackUrl = `${window.location.origin}/payment/callback`;

  const moyasarConfig: MoyasarPaymentConfig = {
    element: `#${config.elementId}`,
    amount: amount,
    currency: "SAR",
    description: `اشتراك مداري - ${plan.name}`,
    publishable_api_key: MOYASAR_PUBLISHABLE_KEY,
    callback_url: callbackUrl,
    methods: ["creditcard"],
    metadata: {
      user_id: config.userId,
      user_email: config.userEmail,
      plan_id: config.planId,
      db_plan: plan.dbPlan,
      billing_cycle: config.billing,
    },
  };

  // Check if Moyasar is loaded
  if (typeof (window as any).Moyasar !== "undefined") {
    (window as any).Moyasar.init(moyasarConfig);
  } else {
    console.error("Moyasar JS library not loaded. Please check index.html.");
  }
}

// ─── Payment Verification ────────────────────────────────────────
/**
 * Verify a payment via Supabase Edge Function.
 * This is the ONLY way to activate a subscription — never from client-side.
 */
export async function verifyPayment(paymentId: string, userId: string): Promise<{
  success: boolean;
  message: string;
  invoice_number?: string;
  plan?: string;
}> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const response = await fetch(`${supabaseUrl}/functions/v1/verify-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        payment_id: paymentId,
        user_id: userId,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: data.error || "فشل في التحقق من الدفع",
      };
    }

    return {
      success: true,
      message: data.message || "تم تفعيل الاشتراك بنجاح!",
      invoice_number: data.invoice_number,
      plan: data.plan,
    };
  } catch (err) {
    console.error("Payment verification error:", err);
    return {
      success: false,
      message: "خطأ في الاتصال بالخادم. حاول مرة أخرى.",
    };
  }
}

// ─── Helpers ─────────────────────────────────────────────────────
export function formatPrice(amount: number): string {
  return `${amount} ريال`;
}

export function formatPriceFromHalalas(halalas: number): string {
  return formatPrice(halalas / 100);
}

export function getPlanById(planId: string): PlanConfig | null {
  return PLANS[planId] || null;
}

export function isPaidPlan(plan: string): boolean {
  return plan !== "free";
}

export function getBillingLabel(cycle: "monthly" | "yearly"): string {
  return cycle === "monthly" ? "شهري" : "سنوي";
}
