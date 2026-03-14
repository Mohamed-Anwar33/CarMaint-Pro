import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Download, Calendar, CreditCard, Receipt, ArrowRight, Crown, Printer } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { Link } from "wouter";

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  plan: string;
  billing_cycle: string;
  payment_method: string | null;
  company_name: string | null;
  company_address: string | null;
  vat_number: string | null;
  status: string;
  issued_at: string;
}

const PLAN_LABELS: Record<string, string> = {
  free: "مجاني",
  pro: "احترافي",
  family_small: "عائلة صغيرة",
  family_large: "عائلة كبيرة",
};

const BILLING_LABELS: Record<string, string> = {
  monthly: "شهري",
  yearly: "سنوي",
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  paid: { label: "مدفوع", color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" },
  refunded: { label: "مسترد", color: "text-amber-600 bg-amber-500/10 border-amber-500/20" },
  pending: { label: "قيد الانتظار", color: "text-primary bg-primary/10 border-primary/20" },
};

export default function Invoices() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    async function fetchInvoices() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("invoices")
          .select("*")
          .eq("user_id", user.id)
          .order("issued_at", { ascending: false });

        if (error) throw error;
        setInvoices(data || []);
      } catch (err) {
        console.error("Error fetching invoices:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchInvoices();
  }, [user]);

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function formatAmount(halalas: number) {
    return `${(halalas / 100).toFixed(2)} ريال`;
  }

  function handlePrint(invoice: Invoice) {
    setSelectedInvoice(invoice);
    setTimeout(() => window.print(), 300);
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* Header */}
        <div className="mb-8">
          <Link href="/settings" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowRight className="w-4 h-4" /> العودة للإعدادات
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-primary" />
            </div>
            الفواتير
          </h1>
          <p className="text-muted-foreground mt-2">جميع فواتير اشتراكاتك في مكان واحد</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card rounded-2xl p-6 border border-border/50 animate-pulse">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-muted rounded" />
                    <div className="h-3 w-48 bg-muted rounded" />
                  </div>
                  <div className="h-6 w-20 bg-muted rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : invoices.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-3xl p-12 border border-border/50 text-center shadow-lg"
          >
            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">لا توجد فواتير</h3>
            <p className="text-sm text-muted-foreground mb-6">ستظهر فواتيرك هنا بعد أول اشتراك</p>
            <Link href="/pricing" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
              <Crown className="w-4 h-4" /> عرض الخطط
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice, index) => {
              const statusConfig = STATUS_LABELS[invoice.status] || STATUS_LABELS.pending;
              return (
                <motion.div
                  key={invoice.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card rounded-2xl p-5 sm:p-6 border border-border/50 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Invoice Info */}
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-foreground font-num">{invoice.invoice_number}</h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {formatDate(invoice.issued_at)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {PLAN_LABELS[invoice.plan] || invoice.plan} • {BILLING_LABELS[invoice.billing_cycle] || invoice.billing_cycle}
                          </span>
                          {invoice.payment_method && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <CreditCard className="w-3 h-3" /> {invoice.payment_method}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Amount + Actions */}
                    <div className="flex items-center gap-3 sm:gap-4 mr-14 sm:mr-0">
                      <span className="text-lg font-black text-primary">{formatAmount(invoice.amount)}</span>
                      <button
                        onClick={() => handlePrint(invoice)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/50 border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" /> طباعة
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Print-Only Invoice View */}
      {selectedInvoice && (
        <div className="hidden print:block p-8 bg-white text-black" dir="rtl">
          <div className="max-w-lg mx-auto border border-gray-200 rounded-lg p-8">
            <div className="text-center mb-8 border-b pb-6">
              <h1 className="text-2xl font-black mb-1">{selectedInvoice.company_name || "مداري - Mdari"}</h1>
              <p className="text-sm text-gray-500">{selectedInvoice.company_address || "المملكة العربية السعودية"}</p>
              {selectedInvoice.vat_number && (
                <p className="text-xs text-gray-400 mt-1">الرقم الضريبي: {selectedInvoice.vat_number}</p>
              )}
            </div>

            <h2 className="text-xl font-bold text-center mb-6">فاتورة ضريبية</h2>

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <strong>رقم الفاتورة:</strong>
                <p className="text-gray-600">{selectedInvoice.invoice_number}</p>
              </div>
              <div>
                <strong>التاريخ:</strong>
                <p className="text-gray-600">{formatDate(selectedInvoice.issued_at)}</p>
              </div>
              <div>
                <strong>الخطة:</strong>
                <p className="text-gray-600">{PLAN_LABELS[selectedInvoice.plan]} ({BILLING_LABELS[selectedInvoice.billing_cycle]})</p>
              </div>
              <div>
                <strong>طريقة الدفع:</strong>
                <p className="text-gray-600">{selectedInvoice.payment_method || "—"}</p>
              </div>
            </div>

            <table className="w-full text-sm border-collapse mb-6">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-right py-2">البيان</th>
                  <th className="text-left py-2">المبلغ</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-3">اشتراك {PLAN_LABELS[selectedInvoice.plan]} - {BILLING_LABELS[selectedInvoice.billing_cycle]}</td>
                  <td className="py-3 text-left">{formatAmount(selectedInvoice.amount)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="font-bold text-lg border-t-2 border-gray-300">
                  <td className="py-3">الإجمالي</td>
                  <td className="py-3 text-left">{formatAmount(selectedInvoice.amount)}</td>
                </tr>
              </tfoot>
            </table>

            <div className="text-center text-xs text-gray-400 border-t pt-4">
              <p>شكراً لاشتراكك في مداري! 🚗</p>
              <p>www.mdari.sa</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
