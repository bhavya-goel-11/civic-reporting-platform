"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    // Check for admin role in user_metadata
    if (data.user?.user_metadata?.role !== 'admin') {
      setError('You are not authorized as an admin.');
      setLoading(false);
      return;
    }
    router.replace('/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-amber-50">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-amber-800">Admin Sign In</h1>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Admin Email"
          className="w-full mb-4 p-3 border rounded"
          required
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full mb-4 p-3 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-amber-800 text-white py-3 rounded font-semibold"
          disabled={loading}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
        {error && <div className="mt-4 text-red-600 text-sm">{error}</div>}
      </form>
    </div>
  );
}
