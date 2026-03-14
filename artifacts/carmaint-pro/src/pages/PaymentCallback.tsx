import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2, FileText, ArrowRight, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { verifyPayment } from "@/lib/moyasar";
import { CarMaintLogo } from "@/components/CarMaintLogo";
import { supabase } from "@/lib/supabase";

type PaymentStatus = "verifying" | "success" | "failed";

export default function PaymentCallback() {
  const { user, refreshUser } = useAuth();
  const [status, setStatus] = useState<PaymentStatus>("verifying");
  const [message, setMessage] = useState("جاري التحقق من عملية الدفع...");
  const [invoiceNumber, setInvoiceNumber] = useState<string | null>(null);
  const [planName, setPlanName] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      // Read payment details from URL
      const params = new URLSearchParams(window.location.search);
      const paymentId = params.get("id");
      const paymentStatus = params.get("status");

      if (!paymentId) {
        setStatus("failed");
        setMessage("لم يتم العثور على معرّف الدفع.");
        return;
      }

      if (!user) {
        setStatus("failed");
        setMessage("يجب تسجيل الدخول للتحقق من الدفع.");
        return;
      }

      // Log the payment attempt
      try {
        await supabase.from("payment_logs").insert({
          user_id: user.id,
          moyasar_payment_id: paymentId,
          event_type: "payment_callback",
          status: paymentStatus || "unknown",
        });
      } catch {
        // Non-critical, continue
      }

      if (paymentStatus === "failed") {
        setStatus("failed");
        setMessage("تم رفض عملية الدفع. يرجى المحاولة مرة أخرى.");
        return;
      }

      // Verify via Edge Function (server-side)
      setMessage("جاري التحقق من الدفع مع بوابة ميسر...");
      
      const result = await verifyPayment(paymentId, user.id);

      if (result.success) {
        setStatus("success");
        setMessage(result.message);
        setInvoiceNumber(result.invoice_number || null);
        setPlanName(result.plan || null);
        
        // Refresh user data to get updated plan
        await refreshUser();
      } else {
        setStatus("failed");
        setMessage(result.message);
      }
    }

    handleCallback();
  }, [user, refreshUser]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4" dir="rtl">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <CarMaintLogo size="md" animated />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-border/50 rounded-3xl p-8 shadow-xl text-center"
        >
          {/* Verifying State */}
          {status === "verifying" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                <Loader2 className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">جاري التحقق</h2>
              <p className="text-sm text-muted-foreground">{message}</p>
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>لا تغلق هذه الصفحة</span>
              </div>
            </motion.div>
          )}

          {/* Success State */}
          {status === "success" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", damping: 15 }}
              className="py-6"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                >
                  <CheckCircle className="w-10 h-10 text-emerald-500" />
                </motion.div>
              </div>
              <h2 className="text-2xl font-black text-foreground mb-2">تم بنجاح! 🎉</h2>
              <p className="text-muted-foreground mb-6">{message}</p>
              
              {planName && (
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 mb-6">
                  <p className="text-sm text-emerald-600 font-bold">تم تفعيل خطة: {planName}</p>
                </div>
              )}

              {invoiceNumber && (
                <div className="bg-background/50 border border-border rounded-2xl p-4 mb-6 flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    رقم الفاتورة: <span className="font-bold text-foreground font-num">{invoiceNumber}</span>
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Link href="/dashboard" className="w-full py-3 rounded-xl bg-primary text-white font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                  <ArrowRight className="w-4 h-4" /> انتقل للوحة التحكم
                </Link>
                <Link href="/invoices" className="w-full py-3 rounded-xl border border-border text-foreground font-medium flex items-center justify-center gap-2 hover:bg-muted/50 transition-colors">
                  <FileText className="w-4 h-4" /> عرض الفاتورة
                </Link>
              </div>
            </motion.div>
          )}

          {/* Failed State */}
          {status === "failed" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6">
              <div className="w-20 h-20 rounded-full bg-destructive/10 border-2 border-destructive/30 flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-destructive" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">فشل في الدفع</h2>
              <p className="text-sm text-muted-foreground mb-6">{message}</p>
              <div className="flex flex-col gap-3">
                <Link href="/pricing" className="w-full py-3 rounded-xl bg-primary text-white font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                  حاول مرة أخرى
                </Link>
                <Link href="/dashboard" className="w-full py-3 rounded-xl border border-border text-foreground font-medium flex items-center justify-center gap-2 hover:bg-muted/50 transition-colors">
                  العودة للوحة التحكم
                </Link>
              </div>
            </motion.div>
          )}
        </motion.div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          في حال واجهت مشكلة، تواصل معنا على support@mdari.sa
        </p>
      </div>
    </div>
  );
}
