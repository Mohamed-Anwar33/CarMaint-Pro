import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Calendar, Tag, Gift, Percent } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface Offer {
  id: string;
  title: string;
  message: string;
  imageUrl: string | null;
  createdAt: string;
}

export default function Offers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchOffers() {
      try {
        const { data, error } = await supabase
          .from("announcements")
          .select("*")
          .eq("type", "offer")
          .eq("active", true)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setOffers(data.map(d => ({
          id: d.id,
          title: d.title,
          message: d.message,
          imageUrl: (d as any).image_url || null,
          createdAt: d.created_at
        })));
      } catch (err) {
        console.error("Failed to fetch offers", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOffers();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20 pt-10" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-foreground mb-3">العروض الحصرية</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            خصومات وعروض خاصة لمشتركي مداري من أفضل مراكز الصيانة وقطع الغيار.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : offers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {offers.map((offer, i) => (
              <motion.div 
                key={offer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-primary/20 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all group"
              >
                {/* Image or Pattern */}
                <div className="h-48 bg-primary/5 relative overflow-hidden flex items-center justify-center">
                  {offer.imageUrl ? (
                    <img src={offer.imageUrl} alt={offer.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <>
                      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                      <Percent className="w-16 h-16 text-primary/30" />
                    </>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 right-4 flex items-center gap-2">
                    <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full flex items-center gap-1 backdrop-blur-md">
                      <Sparkles className="w-3 h-3" /> عرض خاص
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(offer.createdAt).toLocaleDateString('ar-SA')}</span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{offer.title}</h3>
                  <p className="text-sm text-foreground/80 leading-relaxed mb-6">{offer.message}</p>
                  
                  <button onClick={() => toast({ title: "قريباً", description: "سيتم تفعيل خاصية الحصول على العروض قريباً." })} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary/10 text-primary font-bold hover:bg-primary hover:text-white transition-colors">
                    <Tag className="w-4 h-4" /> الحصول على العرض
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card border border-border/50 rounded-3xl">
            <Gift className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">لا توجد عروض حالياً</h3>
            <p className="text-muted-foreground">راجع هذه الصفحة قريباً للإطلاع على أحدث العروض والخصومات.</p>
          </div>
        )}

      </div>
    </div>
  );
}
