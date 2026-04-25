'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { apiPost } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const data = await apiPost<{ user: unknown }>('/auth/register', form);
      setUser(data.user as Parameters<typeof setUser>[0]);
      toast.success('Account created! Welcome to Glomix');
      router.push('/account');
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '80vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.875rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem' }}>
            Join Glomix
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Create an account and start your beauty journey</p>
        </div>

        <form onSubmit={handleSubmit} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label htmlFor="reg-name" style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-sub)', marginBottom: 6 }}>Full Name</label>
            <input id="reg-name" type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input" placeholder="Your Name" required autoFocus />
          </div>

          <div>
            <label htmlFor="reg-email" style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-sub)', marginBottom: 6 }}>Email</label>
            <input id="reg-email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input" placeholder="you@example.com" required />
          </div>

          <div>
            <label htmlFor="reg-phone" style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-sub)', marginBottom: 6 }}>
              Phone <span style={{ color: 'var(--text-faint)', fontWeight: 400 }}>(optional)</span>
            </label>
            <input id="reg-phone" type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input" placeholder="+91 98765 43210" />
          </div>

          <div>
            <label htmlFor="reg-password" style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-sub)', marginBottom: 6 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="input" style={{ paddingRight: '2.75rem' }}
                placeholder="Min. 6 characters" required minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', display: 'flex', padding: 0 }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            id="reg-submit" type="submit" disabled={loading}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', gap: 8, opacity: loading ? 0.6 : 1 }}
          >
            <UserPlus size={16} />
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link href="/auth/login" style={{ color: 'var(--text-sub)', fontWeight: 500, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
