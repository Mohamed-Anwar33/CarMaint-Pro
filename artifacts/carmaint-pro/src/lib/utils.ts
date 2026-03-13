import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format numbers for RTL contexts
export function formatNum(num: number | string | null | undefined): string {
  if (num === null || num === undefined) return "-";
  return new Intl.NumberFormat('en-US').format(Number(num));
}

// Format dates in Arabic
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "غير محدد";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  } catch {
    return "تاريخ غير صالح";
  }
}
