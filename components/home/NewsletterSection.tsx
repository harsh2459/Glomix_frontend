'use client';
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

interface NewsletterSectionProps {
  title?: string;
  subtitle?: string;
}

export default function NewsletterSection({
  title = 'Get 10% Off Your First Order',
  subtitle = 'Subscribe for exclusive offers, skincare tips, and new product launches.',
}: NewsletterSectionProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await api.post('/newsletter/subscribe', { email });
      toast.success('Subscribed! Check your email for your 10% off code.');
      setEmail('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section" style={{ background: '#0a0a0a' }}>
      <div className="container">
        <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
          {/* Eyebrow */}
          <p style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontSize: 10.5, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.35)', marginBottom: 24,
          }}>
            <span style={{ width: 18, height: 1, background: '#c8a96e', display: 'inline-block' }} />
            Newsletter
            <span style={{ width: 18, height: 1, background: '#c8a96e', display: 'inline-block' }} />
          </p>

          <h2 style={{
            fontFamily: 'var(--font-playfair, serif)',
            fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            color: '#fafaf8',
            marginBottom: 14,
          }}>
            {title}
          </h2>

          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, marginBottom: 36, fontWeight: 300 }}>
            {subtitle}
          </p>

          <form
            id="newsletter-form"
            onSubmit={handleSubmit}
            style={{ display: 'flex', gap: 10, maxWidth: 420, margin: '0 auto' }}
          >
            <input
              id="newsletter-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Email for newsletter"
              style={{
                flex: 1,
                padding: '0.8rem 1.25rem',
                background: 'rgba(255,255,255,0.07)',
                border: '1.5px solid rgba(255,255,255,0.12)',
                borderRadius: 9999,
                color: '#fafaf8',
                fontSize: 13.5,
                outline: 'none',
                fontFamily: 'var(--font-body)',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={e => (e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.35)'}
              onBlur={e => (e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.12)'}
            />
            <button
              id="newsletter-submit"
              type="submit"
              disabled={loading}
              style={{
                flexShrink: 0,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '0.8rem 1.5rem',
                background: '#fafaf8',
                color: '#0a0a0a',
                fontWeight: 500,
                fontSize: 13,
                borderRadius: 9999,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.65 : 1,
                letterSpacing: '0.03em',
                transition: 'background 0.2s ease, transform 0.15s ease',
                fontFamily: 'var(--font-body)',
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
            >
              {loading ? 'Subscribing...' : <><span>Subscribe</span><ArrowRight size={14} /></>}
            </button>
          </form>

          <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.22)', marginTop: 16 }}>
            No spam, ever. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
