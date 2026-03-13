import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export type UserRole = "manager" | "driver" | "both" | "admin";
export type UserPlan = "free" | "pro" | "family_small" | "family_large";

export interface AppUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  plan: UserPlan;
  onboardingCompleted: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: AppUser | null;
  supabaseUser: SupabaseUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<AppUser>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Fetches the user profile from our API server (/api/auth/me).
 * This syncs the Supabase user to our local PostgreSQL DB on first login.
 */
async function fetchProfile(): Promise<AppUser | null> {
  try {
    const profile = await api.get<AppUser>("/api/auth/me");
    return profile;
  } catch (err) {
    console.error("fetchProfile error:", err);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        const profile = await fetchProfile();
        setUser(profile);
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          const profile = await fetchProfile();
          setUser(profile);
        }
      } else {
        setSupabaseUser(null);
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      
      if (data.session?.user) {
        // Force the cached token to update so api.ts uses it instantly
        api.setCachedToken?.(data.session.access_token);
        setSupabaseUser(data.session.user);
        const profile = await fetchProfile();
        if (!profile) {
          throw new Error("Failed to load user profile");
        }
        setUser(profile);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole = "manager") => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, role } },
      });
      if (error) throw new Error(error.message);
      if (!data.user) throw new Error("فشل في إنشاء الحساب");
      // Profile will be auto-created in local DB when the user first calls /api/auth/me
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
  };

  const refreshUser = async () => {
    const profile = await fetchProfile();
    setUser(profile);
  };

  const updateUser = async (updates: Partial<AppUser>) => {
    if (!user) return;
    try {
      await api.patch("/api/auth/profile", updates);
      setUser(prev => prev ? { ...prev, ...updates } : null);
    } catch (err: unknown) {
      throw new Error(err instanceof Error ? err.message : "فشل في تحديث الملف الشخصي");
    }
  };

  return (
    <AuthContext.Provider value={{ user, supabaseUser, isLoading, login, register, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
