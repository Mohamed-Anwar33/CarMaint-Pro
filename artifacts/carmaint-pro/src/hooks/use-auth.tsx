import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export type UserRole = "manager" | "driver" | "both" | "admin";
export type UserPlan = "free" | "pro" | "family_small" | "family_large";

export interface AppUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  plan: UserPlan;
  accountType: string;
  onboardingCompleted: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: AppUser | null;
  supabaseUser: SupabaseUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: UserRole, accountType?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<AppUser>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Fetches the user profile from Supabase directly instead of an API server.
 * This syncs the Supabase user to our local PostgreSQL DB on first login.
 */
async function fetchProfile(userId: string, email: string): Promise<AppUser | null> {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (user) {
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as UserRole,
        plan: user.plan as UserPlan,
        accountType: user.account_type || "individual",
        onboardingCompleted: user.onboarding_completed,
        createdAt: user.created_at,
      };
    }

    // If error is not "row not found", it might be RLS — log but don't crash
    if (error && error.code !== 'PGRST116') {
      console.warn("fetchProfile select error (might be RLS):", error);
    }
    
    // User profile not found, try to create one
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        id: userId,
        email: email,
        name: null,
        role: "manager",
        plan: "free",
        account_type: "individual",
        onboarding_completed: false,
      })
      .select()
      .single();

    if (insertError) {
      console.warn("fetchProfile insert error:", insertError);
      // Return a minimal fallback user so login doesn't hang
      return {
        id: userId,
        email: email,
        name: null,
        role: "manager" as UserRole,
        plan: "free" as UserPlan,
        accountType: "individual",
        onboardingCompleted: false,
        createdAt: new Date().toISOString(),
      };
    }

    return {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role as UserRole,
      plan: newUser.plan as UserPlan,
      accountType: newUser.account_type || "individual",
      onboardingCompleted: newUser.onboarding_completed,
      createdAt: newUser.created_at,
    };
  } catch (err: unknown) {
    console.error("fetchProfile error:", err);
    // Return a minimal fallback user instead of throwing
    return {
      id: userId,
      email: email,
      name: null,
      role: "manager" as UserRole,
      plan: "free" as UserPlan,
      accountType: "individual",
      onboardingCompleted: false,
      createdAt: new Date().toISOString(),
    };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          setSupabaseUser(session.user);
          const profile = await fetchProfile(session.user.id, session.user.email || "");
          if (mounted) setUser(profile);
        }
      } catch (e) {
        console.error("Auth init error:", e);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (session?.user) {
          if (mounted) setSupabaseUser(session.user);
          if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
            const profile = await fetchProfile(session.user.id, session.user.email || "");
            if (mounted) setUser(profile);
          }
        } else {
          if (mounted) {
            setSupabaseUser(null);
            setUser(null);
          }
        }
      } catch (e) {
        console.error("onAuthStateChange error:", e);
      } finally {
        if (mounted) setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      
      if (data.session?.user) {
        setSupabaseUser(data.session.user);
        const profile = await fetchProfile(data.session.user.id, data.session.user.email || "");
        if (profile) {
          setUser(profile);
        }
      }
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole = "manager", accountType: string = "individual") => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, role, account_type: accountType } },
      });
      if (error) throw new Error(error.message);
      if (!data.user) throw new Error("فشل في إنشاء الحساب");
      
      // Explicitly create profile here since frontend handles logic
      const { error: insertErr } = await supabase.from("users").insert({
        id: data.user.id,
        email: email,
        name: name,
        role: role,
        plan: "free",
        account_type: accountType,
        onboarding_completed: false
      });
      if (insertErr) {
        console.error("Failed to create user profile row:", insertErr);
      }
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
    if (!supabaseUser) return;
    const profile = await fetchProfile(supabaseUser.id, supabaseUser.email || "");
    setUser(profile);
  };

  const updateUser = async (updates: Partial<AppUser>) => {
    if (!user || !supabaseUser) return;
    try {
      const { error } = await supabase.from("users").update({
        name: updates.name,
        role: updates.role,
        plan: updates.plan,
        onboarding_completed: updates.onboardingCompleted
      }).eq("id", supabaseUser.id);
      
      if (error) throw error;
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
