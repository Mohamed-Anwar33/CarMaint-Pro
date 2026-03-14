import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lightbulb, Clock, ChevronLeft, Car } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Tip {
  id: string;
  title: string;
  message: string;
  imageUrl: string | null;
  createdAt: string;
}

export default function Tips() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTips() {
      try {
        const { data, error } = await supabase
          .from("announcements")
          .select("*")
          .eq("type", "update")
          .eq("active", true)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setTips(data.map(d => ({
          id: d.id,
          title: d.title,
          message: d.message,
          imageUrl: (d as any).image_url || null,
          createdAt: d.created_at
        })));
      } catch (err) {
        console.error("Failed to fetch tips", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTips();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20 pt-10" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-foreground mb-3">نصائح وإرشادات</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            مجموعة من النصائح الذهبية للحفاظ على سيارتك وإطالة عمر القطع الاستهلاكية.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tips.length > 0 ? (
          <div className="space-y-6">
            {tips.map((tip, i) => (
              <motion.div 
                key={tip.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border/50 rounded-3xl overflow-hidden hover:border-emerald-500/30 transition-colors flex flex-col sm:flex-row group"
              >
                {tip.imageUrl ? (
                  <div className="w-full sm:w-48 xl:w-64 shrink-0 h-48 sm:h-auto overflow-hidden">
                    <img src={tip.imageUrl} alt={tip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                ) : (
                  <div className="w-full sm:w-32 shrink-0 h-32 sm:h-auto bg-emerald-500/5 flex flex-col items-center justify-center text-emerald-500/50">
                    <Car className="w-8 h-8 mb-2" />
                    <span className="text-xs font-bold">مداري</span>
                  </div>
                )}
                
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(tip.createdAt).toLocaleDateString('ar-SA')}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold text-[10px] mr-auto">
                      نصيحة
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{tip.title}</h3>
                  <p className="text-sm text-foreground/80 leading-relaxed mb-0">{tip.message}</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card border border-border/50 rounded-3xl">
            <Lightbulb className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">لا توجد نصائح حالياً</h3>
            <p className="text-muted-foreground">سيتم إضافة نصائح وإرشادات قريباً هنا.</p>
          </div>
        )}

      </div>
    </div>
  );
}
