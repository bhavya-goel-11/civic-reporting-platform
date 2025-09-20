'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/components/admin-auth-provider';

export default function Home() {
  const router = useRouter();
  const { isAdmin, loading } = useAdminAuth();

  useEffect(() => {
    if (!loading) {
      if (isAdmin) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [isAdmin, loading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">Loading...</div>
  );
}
