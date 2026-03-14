/**
 * Supabase Edge Function: verify-payment
 * ========================================
 * This function verifies a Moyasar payment and activates the user's subscription.
 * 
 * SECURITY: This is the ONLY way to activate a subscription.
 * It uses the Moyasar SECRET_KEY to verify payments server-side.
 * 
 * DEPLOYMENT:
 *   1. Create this function in Supabase Dashboard → Edge Functions
 *   2. Set environment variable: MOYASAR_SECRET_KEY=sk_live_xxx
 *   3. OR deploy via CLI: supabase functions deploy verify-payment
 * 
 * ENDPOINT: POST /functions/v1/verify-payment
 * BODY: { payment_id: string, user_id: string }
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { payment_id, user_id } = await req.json();

    if (!payment_id || !user_id) {
      return new Response(
        JSON.stringify({ error: "Missing payment_id or user_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 1. Verify Payment with Moyasar API ──────────────────────────
    const MOYASAR_SECRET_KEY = Deno.env.get("MOYASAR_SECRET_KEY");
    if (!MOYASAR_SECRET_KEY) {
      console.error("MOYASAR_SECRET_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Payment gateway not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const moyasarResponse = await fetch(`https://api.moyasar.com/v1/payments/${payment_id}`, {
      headers: {
        "Authorization": "Basic " + btoa(MOYASAR_SECRET_KEY + ":"),
      },
    });

    if (!moyasarResponse.ok) {
      return new Response(
        JSON.stringify({ error: "فشل في التحقق من الدفع مع ميسر" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payment = await moyasarResponse.json();

    // ── 2. Validate Payment Status ──────────────────────────────────
    if (payment.status !== "paid") {
      // Log failed attempt
      await logPayment(user_id, payment_id, "verification_failed", payment.status, payment.amount, payment);
      
      return new Response(
        JSON.stringify({ error: `الدفع لم يكتمل. الحالة: ${payment.status}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 3. Extract plan info from metadata ──────────────────────────
    const metadata = payment.metadata || {};
    const planId = metadata.plan_id;
    const dbPlan = metadata.db_plan;
    const billingCycle = metadata.billing_cycle;
    const metaUserId = metadata.user_id;

    // Security: verify the user_id matches
    if (metaUserId && metaUserId !== user_id) {
      await logPayment(user_id, payment_id, "security_mismatch", "blocked", payment.amount, payment);
      return new Response(
        JSON.stringify({ error: "User ID mismatch" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!dbPlan || !billingCycle) {
      return new Response(
        JSON.stringify({ error: "Missing plan metadata in payment" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 4. Check for duplicate processing ──────────────────────────
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("moyasar_payment_id", payment_id)
      .eq("status", "active")
      .single();

    if (existingSub) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "الاشتراك مفعّل بالفعل!",
          plan: dbPlan 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 5. Calculate subscription dates ──────────────────────────────
    const now = new Date();
    const expiresAt = new Date(now);
    if (billingCycle === "monthly") {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    // ── 6. Create Subscription ──────────────────────────────────────
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .insert({
        user_id: user_id,
        plan: dbPlan,
        billing_cycle: billingCycle,
        status: "active",
        moyasar_payment_id: payment_id,
        amount: payment.amount,
        currency: payment.currency || "SAR",
        starts_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .select("id")
      .single();

    if (subError) {
      console.error("Failed to create subscription:", subError);
      await logPayment(user_id, payment_id, "subscription_create_failed", "error", payment.amount, { error: subError });
      return new Response(
        JSON.stringify({ error: "فشل في إنشاء الاشتراك" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 7. Generate Invoice ──────────────────────────────────────────
    const { data: invoiceNumResult } = await supabase.rpc("generate_invoice_number");
    const invoiceNumber = invoiceNumResult || `INV-${Date.now()}`;

    const paymentSource = payment.source || {};
    const paymentMethod = paymentSource.company || paymentSource.type || "card";

    const { error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        user_id: user_id,
        subscription_id: subscription.id,
        invoice_number: invoiceNumber,
        amount: payment.amount,
        currency: payment.currency || "SAR",
        plan: dbPlan,
        billing_cycle: billingCycle,
        payment_method: paymentMethod,
        moyasar_payment_id: payment_id,
        status: "paid",
      });

    if (invoiceError) {
      console.error("Failed to create invoice:", invoiceError);
      // Non-critical: subscription is already created
    }

    // ── 8. Update User Plan ──────────────────────────────────────────
    const { error: userError } = await supabase
      .from("users")
      .update({ plan: dbPlan })
      .eq("id", user_id);

    if (userError) {
      console.error("Failed to update user plan:", userError);
      // Critical but subscription exists — admin can fix
    }

    // ── 9. Expire old subscriptions ──────────────────────────────────
    await supabase
      .from("subscriptions")
      .update({ status: "expired" })
      .eq("user_id", user_id)
      .eq("status", "active")
      .neq("id", subscription.id);

    // ── 10. Log Success ──────────────────────────────────────────────
    await logPayment(user_id, payment_id, "verification_success", "paid", payment.amount, {
      plan: dbPlan,
      billing_cycle: billingCycle,
      invoice_number: invoiceNumber,
      subscription_id: subscription.id,
    });

    // ── 11. Return Success ──────────────────────────────────────────
    const PLAN_NAMES: Record<string, string> = {
      pro: "احترافي",
      family_small: "عائلة صغيرة",
      family_large: "عائلة كبيرة",
    };

    return new Response(
      JSON.stringify({
        success: true,
        message: `تم تفعيل خطة ${PLAN_NAMES[dbPlan] || dbPlan} بنجاح! 🎉`,
        invoice_number: invoiceNumber,
        plan: PLAN_NAMES[dbPlan] || dbPlan,
        expires_at: expiresAt.toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Verify payment error:", err);
    return new Response(
      JSON.stringify({ error: "خطأ داخلي في الخادم" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Helper: Log payment event
async function logPayment(
  userId: string,
  paymentId: string,
  eventType: string,
  status: string,
  amount: number,
  rawResponse: unknown
) {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    await supabase.from("payment_logs").insert({
      user_id: userId,
      moyasar_payment_id: paymentId,
      event_type: eventType,
      status: status,
      amount: amount,
      raw_response: rawResponse,
    });
  } catch (err) {
    console.error("Failed to log payment:", err);
  }
}
