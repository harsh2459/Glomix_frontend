'use client';
import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

interface NewsletterSectionProps {
  title?: string;
  subtitle?: string;
}

export default function NewsletterSection({
  title = 'Get 10% Off Your First Order',
  subtitle = 'Subscribe to our newsletter for exclusive offers, skincare tips, and new product launches.',
}: NewsletterSectionProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await api.post('/newsletter/subscribe', { email });
      toast.success('🎉 Subscribed! Check your email for your 10% off code.');
      setEmail('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section-sm">
      <div className="container">
        <div
          className="relative rounded-3xl overflow-hidden p-10 md:p-16 text-center animate-pulse-glow"
          style={{
            background: 'rgba(0,0,0,0.03)',
            border: '1px solid rgba(0,0,0,0.07)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-gray-50/30 pointer-events-none" />
          <div className="relative z-10 max-w-xl mx-auto">
            <Sparkles className="w-8 h-8 mx-auto mb-4 text-gray-800" />
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-3">
              {title}
            </h2>
            <p className="text-gray-600 mb-8">
              {subtitle}
            </p>
            <form
              id="newsletter-form"
              className="flex gap-3 max-w-md mx-auto"
              onSubmit={handleSubmit}
            >
              <input
                id="newsletter-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input flex-1"
                required
                aria-label="Email for newsletter"
              />
              <button
                id="newsletter-submit"
                type="submit"
                disabled={loading}
                className="btn-primary shrink-0 disabled:opacity-60"
              >
                {loading ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-4">No spam, ever. Unsubscribe anytime.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
