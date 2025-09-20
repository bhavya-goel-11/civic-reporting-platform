import { useEffect } from 'react';
import { useAdminAuth } from './admin-auth-provider';
import { useRouter } from 'next/navigation';

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace('/login');
    }
  }, [isAdmin, loading, router]);

  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  if (!isAdmin) return null;
  return <>{children}</>;
}
