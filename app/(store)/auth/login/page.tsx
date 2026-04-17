'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { apiPost } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiPost<{ user: unknown }>('/auth/login', form);
      setUser(data.user as Parameters<typeof setUser>[0]);
      toast.success('Welcome back!');
      router.push('/account');
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="section min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-gray-400">Sign in to your Glomix account</p>
        </div>
        <form onSubmit={handleSubmit} className="card p-8 space-y-5">
          <div>
            <label htmlFor="user-login-email" className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <input id="user-login-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className="input" required autoFocus />
          </div>
          <div>
            <label htmlFor="user-login-password" className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
            <div className="relative">
              <input id="user-login-password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Your password" className="input pr-11" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="text-right mt-1.5">
              <Link href="/auth/forgot-password" className="text-xs text-gray-600 hover:text-gray-500">Forgot password?</Link>
            </div>
          </div>
          <button id="user-login-submit" type="submit" disabled={loading} className="btn-primary w-full py-3 gap-2 disabled:opacity-60">
            <LogIn size={16} />
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <p className="text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-gray-600 hover:text-gray-500 font-medium">Create one</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
