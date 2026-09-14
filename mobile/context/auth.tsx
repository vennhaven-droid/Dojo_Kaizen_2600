import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { apiFetch } from "@/lib/api";
import { supabase } from "@/lib/supabase";

export type MeStudent = {
  id: string;
  first_name: string;
  last_name: string;
  status: string;
  due_date: string | null;
  balance: number;
  checked_in: boolean;
  checked_out: boolean;
  payments: Array<{
    id: string;
    amount: number;
    method: string;
    payment_status: string | null;
    paid_at: string | null;
    due_date: string | null;
  }>;
  memberships: Array<{
    id: string;
    type: string;
    status: string;
    due_date: string | null;
    program_name: string | null;
  }>;
};

export type MePayload = {
  profile: {
    id: string;
    role: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
  students: MeStudent[];
  canManageChat: boolean;
};

type AuthContextValue = {
  ready: boolean;
  session: Session | null;
  me: MePayload | null;
  refreshMe: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [me, setMe] = useState<MePayload | null>(null);

  const refreshMe = useCallback(async () => {
    const token = session?.access_token;
    if (!token) {
      setMe(null);
      return;
    }
    const payload = await apiFetch<MePayload>("/api/me", token);
    setMe(payload);
  }, [session?.access_token]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.access_token) {
      setMe(null);
      return;
    }
    void refreshMe().catch(() => setMe(null));
  }, [refreshMe, session?.access_token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      session,
      me,
      refreshMe,
      signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      },
      signOut: async () => {
        await supabase.auth.signOut();
        setMe(null);
      },
    }),
    [me, ready, refreshMe, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
