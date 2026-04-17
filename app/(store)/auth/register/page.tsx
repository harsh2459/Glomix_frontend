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
      toast.success('Account created! Welcome to Glomix 🌸');
      router.push('/account');
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="section min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold mb-2">Join Glomix</h1>
          <p className="text-gray-400">Create an account and start your beauty journey</p>
        </div>
        <form onSubmit={handleSubmit} className="card p-8 space-y-5">
          <div>
            <label htmlFor="reg-name" className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
            <input id="reg-name" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="Your Name" required autoFocus />
          </div>
          <div>
            <label htmlFor="reg-email" className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <input id="reg-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" placeholder="you@example.com" required />
          </div>
          <div>
            <label htmlFor="reg-phone" className="block text-sm font-medium text-gray-300 mb-1.5">Phone <span className="text-gray-500">(optional)</span></label>
            <input id="reg-phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" placeholder="+91 98765 43210" />
          </div>
          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
            <div className="relative">
              <input id="reg-password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input pr-11" placeholder="Min. 6 characters" required minLength={6} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button id="reg-submit" type="submit" disabled={loading} className="btn-primary w-full py-3 gap-2 disabled:opacity-60">
            <UserPlus size={16} />
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
          <p className="text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-gray-600 hover:text-gray-500 font-medium">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
