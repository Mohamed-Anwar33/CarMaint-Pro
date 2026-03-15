import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'carmaint-pro-auth',
    flowType: 'pkce',
    // No-op lock: bypasses navigator.locks to prevent "Lock broken by 
    // another request with the 'steal' option" caused by Service Worker
    lock: async (name: string, acquireTimeout: number, fn: () => Promise<any>) => {
      return await fn();
    },
  },
} as any);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          role: "manager" | "driver" | "both" | "admin";
          plan: "free" | "pro" | "family_small" | "family_large";
          account_type: string | null;
          onboarding_completed: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["users"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["users"]["Row"]>;
      };
      cars: {
        Row: {
          id: string;
          owner_id: string;
          driver_id: string | null;
          name: string;
          model_year: number;
          transmission_type: "automatic" | "manual";
          engine_oil_type: "5000km" | "10000km" | "custom";
          coolant_fill_date: string | null;
          coolant_next_alert_date: string | null;
          registration_expiry: string | null;
          license_expiry: string | null;
          insurance_expiry: string | null;
          inspection_expiry: string | null;
          battery_install_date: string | null;
          battery_warranty_months: number | null;
          tire_install_date: string | null;
          tire_warranty_months: number | null;
          last_mileage: number | null;
          next_oil_change_mileage: number | null;
          driver_name: string | null;
          plate_number: string | null;
          notes: string | null;
          engine_oil_custom_days: number | null;
          engine_oil_custom_km: number | null;
          battery_brand: string | null;
          tire_size: string | null;
          invoices: string[] | null;
          battery_invoice: string | null;
          tire_invoice: string | null;
          last_report_date: string | null;
          brakes_install_date: string | null;
          next_air_filter_mileage: number | null;
          created_at: string;
        };
      };
      announcements: {
        Row: {
          id: string;
          title: string;
          message: string;
          type: "offer" | "update" | "tip";
          image_url: string | null;
          active: boolean;
          created_at: string;
        };
      };
      driver_reports: {
        Row: {
          id: string;
          car_id: string;
          driver_id: string;
          current_mileage: number;
          oil_level: "normal" | "low";
          tires_status: "green" | "yellow" | "red";
          brakes_status: "green" | "yellow" | "red";
          ac_status: "green" | "yellow" | "red";
          notes: string | null;
          submitted_at: string;
        };
      };
      invitations: {
        Row: {
          id: string;
          car_id: string;
          driver_email: string;
          manager_id: string;
          status: "pending" | "accepted" | "declined";
          created_at: string;
        };
      };
    };
  };
};
