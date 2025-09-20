"use client";
import { AdminAuthProvider, useAdminAuth } from '@/components/admin-auth-provider';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAdminAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Only protect admin routes
  const protectedRoutes = ['/dashboard', '/reports', '/analytics', '/test-db'];
  const isProtected = protectedRoutes.some(route => pathname?.startsWith(route));

  useEffect(() => {
    if (!loading && isProtected && !isAdmin) {
      router.replace('/login');
    }
    if (!loading && pathname === '/login' && isAdmin) {
      router.replace('/dashboard');
    }
  }, [isAdmin, loading, pathname, router, isProtected]);

  if (isProtected && loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }
  return <>{children}</>;
}

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AuthGate>{children}</AuthGate>
    </AdminAuthProvider>
  );
}
