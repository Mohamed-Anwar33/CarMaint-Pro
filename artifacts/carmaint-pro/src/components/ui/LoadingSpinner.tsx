import { Loader2 } from "lucide-react";

export function LoadingSpinner({ className, size = 24 }: { className?: string, size?: number }) {
  return (
    <Loader2 
      size={size} 
      className={`animate-spin text-primary ${className || ''}`} 
    />
  );
}

export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <LoadingSpinner size={40} />
      <p className="text-muted-foreground text-sm animate-pulse">جاري التحميل...</p>
    </div>
  );
}
