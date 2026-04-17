'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Eye, EyeOff } from 'lucide-react';
import { apiPost, apiGet } from '../../../lib/api';
import toast from 'react-hot-toast';

export default function AdminSetupPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    // If admin already exists, redirect to login
    apiGet<{ exists: boolean }>('/admin/auth/check').then(({ exists }) => {
      if (exists) router.replace('/admin/login');
      else setChecking(false);
    }).catch(() => setChecking(false));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await apiPost('/admin/auth/setup', form);
      toast.success('Admin account created! Redirecting...');
      router.push('/admin');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Setup failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="w-8 h-8 rounded-full border-2 border-gray-700 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--color-bg)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gray-800/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-gray-500/10 blur-3xl" />
      </div>
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}>
            <Sparkles size={28} className="text-white" />
          </div>
          <h1 className="font-heading text-3xl font-bold mb-2">Welcome to Glomix</h1>
          <p className="text-gray-400">Create your first admin account to get started</p>
          <div className="mt-3 px-4 py-2 rounded-lg text-xs text-yellow-400" style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)' }}>
            ⚠️ This page will be disabled once the first admin is created
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card p-8 space-y-5">
          <div>
            <label htmlFor="setup-name" className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
            <input
              id="setup-name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Admin Name"
              className="input"
              required
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="setup-email" className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
            <input
              id="setup-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="admin@glomix.in"
              className="input"
              required
            />
          </div>
          <div>
            <label htmlFor="setup-password" className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
            <div className="relative">
              <input
                id="setup-password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Min. 8 characters"
                className="input pr-11"
                required
                minLength={8}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button id="setup-submit" type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2 disabled:opacity-60">
            {loading ? (
              <span className="flex items-center gap-2 justify-center">
                <span className="w-4 h-4 rounded-full border-2 border-gray-400 border-t-gray-700 animate-spin" />
                Creating Account...
              </span>
            ) : 'Create Admin Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
