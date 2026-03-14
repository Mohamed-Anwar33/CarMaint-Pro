import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Smartphone } from "lucide-react";
import { CarMaintLogo } from "@/components/CarMaintLogo";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const alreadyDismissed = localStorage.getItem("pwa_install_dismissed");
    if (alreadyDismissed) return;

    // Detect iOS Safari
    const ua = navigator.userAgent;
    const isIOSDevice = /iphone|ipad|ipod/i.test(ua);
    const isStandalone = (window.navigator as { standalone?: boolean }).standalone;
    
    if (isIOSDevice && !isStandalone) {
      setIsIOS(true);
      setTimeout(() => setShowBanner(true), 3000);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowBanner(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    localStorage.setItem("pwa_install_dismissed", "true");
  };

  if (dismissed) return null;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed top-4 left-4 right-4 z-[9999] max-w-sm mx-auto"
          dir="rtl"
        >
          <div className="bg-card border border-border border border-sky-400/30 rounded-2xl p-4 shadow-2xl shadow-black/50 relative overflow-hidden">
            {/* Glow effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <button
              onClick={handleDismiss}
              className="absolute top-3 left-3 w-6 h-6 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-50 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-start gap-3 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                <Smartphone className="w-6 h-6 text-orange-400" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="mb-1">
                  <CarMaintLogo size="sm" animated={false} />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                  {isIOS
                    ? 'اضغط على أيقونة المشاركة ← "إضافة إلى الشاشة الرئيسية" لتحميل التطبيق'
                    : "حمّل التطبيق على هاتفك للوصول السريع وتجربة أفضل — حتى بدون إنترنت!"
                  }
                </p>
                
                {!isIOS && (
                  <button
                    onClick={handleInstall}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-l from-orange-500 to-orange-600 text-foreground text-sm font-bold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    تحميل التطبيق مجاناً
                  </button>
                )}
                
                {isIOS && (
                  <div className="flex items-center gap-2 text-xs text-sky-400">
                    <div className="w-4 h-4 rounded bg-sky-400/20 flex items-center justify-center">
                      <span className="text-[10px]">↓</span>
                    </div>
                    <span>اضغط زر المشاركة في شريط المتصفح بالأسفل</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
