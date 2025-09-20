"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

type SupabaseUser = {
  id: string;
  email: string;
  user_metadata?: { role?: string };
  [key: string]: any;
} | null;

interface AdminAuthContextType {
  user: SupabaseUser;
  isAdmin: boolean;
  loading: boolean;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType>({ user: null, isAdmin: false, loading: true, logout: async () => {} });

interface AdminAuthProviderProps {
  children: ReactNode;
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [user, setUser] = useState<SupabaseUser>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (mounted) {
        console.log('[AdminAuthProvider] getUser:', data.user);
        setUser(data.user as SupabaseUser);
        setLoading(false);
      }
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[AdminAuthProvider] onAuthStateChange:', session?.user);
      setUser(session?.user as SupabaseUser ?? null);
    });
    return () => {
      mounted = false;
      data?.subscription?.unsubscribe?.();
    };
  }, []);

  const isAdmin = user?.user_metadata?.role === 'admin';
  console.log('[AdminAuthProvider] user:', user);
  console.log('[AdminAuthProvider] isAdmin:', isAdmin, 'loading:', loading);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AdminAuthContext.Provider value={{ user, isAdmin, loading, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
