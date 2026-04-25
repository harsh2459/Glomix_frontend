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
    <div style={{ minHeight: '70vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.875rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem' }}>
            Welcome Back
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Sign in to your Glomix account</p>
        </div>

        <form onSubmit={handleSubmit} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label htmlFor="user-login-email" style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-sub)', marginBottom: 6 }}>Email</label>
            <input
              id="user-login-email" type="email" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              className="input" required autoFocus
            />
          </div>

          <div>
            <label htmlFor="user-login-password" style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-sub)', marginBottom: 6 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="user-login-password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Your password"
                className="input" style={{ paddingRight: '2.75rem' }} required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', display: 'flex', padding: 0 }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div style={{ textAlign: 'right', marginTop: 6 }}>
              <Link href="/auth/forgot-password" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            id="user-login-submit" type="submit" disabled={loading}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', gap: 8, opacity: loading ? 0.6 : 1 }}
          >
            <LogIn size={16} />
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" style={{ color: 'var(--text-sub)', fontWeight: 500, textDecoration: 'none' }}>
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
