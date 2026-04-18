'use client';
import React from 'react';
import Link from 'next/link';
import { ISiteSettings } from '../../types';

interface FooterProps { settings: ISiteSettings | null; }

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  instagram: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>,
  facebook:  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
  twitter:   <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  youtube:   <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>,
  pinterest: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.42 7.63 11.18-.1-.95-.2-2.41.04-3.45.22-.93 1.47-6.22 1.47-6.22s-.38-.75-.38-1.87c0-1.75 1.02-3.06 2.28-3.06 1.08 0 1.6.81 1.6 1.78 0 1.08-.69 2.7-1.05 4.2-.3 1.25.62 2.27 1.85 2.27 2.22 0 3.72-2.86 3.72-6.25 0-2.57-1.73-4.53-4.87-4.53-3.55 0-5.78 2.65-5.78 5.62 0 1.02.3 1.73.76 2.28.21.25.24.35.17.62-.05.2-.17.69-.22.88-.07.28-.28.38-.52.28-1.46-.6-2.14-2.2-2.14-4.01 0-2.97 2.5-6.53 7.46-6.53 4 0 6.63 2.9 6.63 6.02 0 4.12-2.28 7.19-5.64 7.19-1.13 0-2.19-.61-2.56-1.3l-.7 2.72c-.25.98-.93 2.2-1.39 2.94.86.27 1.78.41 2.72.41 6.63 0 12-5.37 12-12S18.63 0 12 0z"/></svg>,
  whatsapp:  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>,
};

const DEFAULT_FOOTER_COLUMNS = [
  { title: 'Shop', links: [{ label: 'All Products', url: '/products' }, { label: 'Best Sellers', url: '/products?sort=bestsellers' }, { label: 'New Arrivals', url: '/products?sort=new' }, { label: 'Sale', url: '/products?sale=true' }, { label: 'Gift Sets', url: '/products?tag=gift' }] },
  { title: 'Company', links: [{ label: 'About Us', url: '/about' }, { label: 'Contact', url: '/contact' }, { label: 'Blog', url: '/blog' }, { label: 'Careers', url: '/careers' }, { label: 'Press', url: '/press' }] },
  { title: 'Support', links: [{ label: 'FAQ', url: '/faq' }, { label: 'Shipping Policy', url: '/shipping-policy' }, { label: 'Return Policy', url: '/return-policy' }, { label: 'Privacy Policy', url: '/privacy-policy' }, { label: 'Track Order', url: '/track-order' }] },
];

const DEFAULT_POLICY_LINKS = [
  { label: 'Privacy Policy', url: '/privacy-policy', order: 0 },
  { label: 'Return Policy', url: '/return-policy', order: 1 },
  { label: 'Shipping Policy', url: '/shipping-policy', order: 2 },
  { label: 'Terms of Service', url: '/terms', order: 3 },
];

const DEFAULT_TRUST_BADGES = [
  { icon: '🌿', text: '100% Natural', desc: 'No harmful chemicals' },
  { icon: '🐰', text: 'Cruelty Free', desc: 'Never tested on animals' },
  { icon: '🇮🇳', text: 'Made in India', desc: 'Proudly local, loved globally' },
  { icon: '✨', text: 'Dermatologist Tested', desc: 'Clinically approved formulas' },
];

export default function Footer({ settings }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const siteName = settings?.siteName ?? 'Glomix';

  const footerCopyright =
    settings?.footerCopyright?.replace(/20\d\d/, String(currentYear)) ||
    `© ${currentYear} ${siteName}. All rights reserved.`;

  const footerDescription =
    (settings as any)?.footerDescription ||
    'Premium natural beauty products crafted with love. Cruelty-free, made in India, loved worldwide.';

  const policyLinks =
    settings?.footerPolicyLinks && settings.footerPolicyLinks.length > 0
      ? [...settings.footerPolicyLinks].sort((a, b) => a.order - b.order)
      : DEFAULT_POLICY_LINKS;

  const footerColumns =
    settings?.footerColumns && settings.footerColumns.length > 0
      ? settings.footerColumns
      : DEFAULT_FOOTER_COLUMNS;

  const socialLinks = settings?.socialLinks ?? {};
  const hasSocials = Object.values(socialLinks).some(v => typeof v === 'string' && v.trim() !== '');

  const trustBadges = settings?.heroTrustBadges && settings.heroTrustBadges.length > 0
    ? [...settings.heroTrustBadges].sort((a, b) => a.order - b.order).map(b => ({ icon: b.icon, text: b.text, desc: '' }))
    : DEFAULT_TRUST_BADGES;


  return (
    <footer style={{ background: '#0d0c0a', color: 'rgba(255,255,255,0.5)', position: 'relative', overflow: 'hidden', fontFamily: "'DM Sans', 'Inter', sans-serif" }}>

      {/* Watermark */}
      <div style={{
        position: 'absolute', bottom: -20, left: '50%', transform: 'translateX(-50%)',
        fontFamily: 'var(--font-playfair, serif)', fontSize: 'clamp(80px,14vw,180px)',
        fontWeight: 600, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.025)',
        pointerEvents: 'none', whiteSpace: 'nowrap', userSelect: 'none', zIndex: 0,
      }}>
        {siteName.toUpperCase()}
      </div>


      {/* ── Main columns ── */}
      <div style={{ padding: '56px 40px 44px', borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.5fr repeat(3, 1fr)', gap: 56 }}>

          {/* Brand col */}
          <div>
            {settings?.logo ? (
              <img src={settings.logo} alt={siteName} style={{ height: 40, width: 'auto', marginBottom: 16, filter: 'brightness(0) invert(1)' }} />
            ) : (
              <span style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: 28, fontWeight: 600, letterSpacing: '0.04em', color: '#fff', display: 'block', marginBottom: 16 }}>
                {siteName}
              </span>
            )}
            <p style={{ fontSize: 13, lineHeight: 1.8, fontWeight: 300, color: 'rgba(255,255,255,0.45)', maxWidth: 220, marginBottom: 22 }}>
              {footerDescription}
            </p>
            {/* Only show social icons that have a URL set in DB — nothing if none added */}
            {hasSocials && (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {Object.entries(socialLinks).map(([platform, url]) => {
                  if (!url || typeof url !== 'string') return null;
                  return (
                    <a key={platform} href={url} target="_blank" rel="noopener noreferrer" aria-label={platform}
                      style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', transition: 'all 0.25s' }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#c8a96e'; el.style.color = '#c8a96e'; el.style.background = 'rgba(200,169,110,0.08)'; }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(255,255,255,0.12)'; el.style.color = 'rgba(255,255,255,0.5)'; el.style.background = 'transparent'; }}>
                      {SOCIAL_ICONS[platform] ?? <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>{platform.slice(0, 2)}</span>}
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Nav columns — dynamic from DB */}
          {footerColumns.map((col, i) => (
            <div key={i}>
              <h4 style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 20, fontWeight: 500, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {col.title}
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {col.links.map((link, j) => (
                  <li key={j} style={{ marginBottom: 12 }}>
                    <Link href={link.url} style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 300, transition: 'color 0.2s, padding-left 0.2s', display: 'inline-block' }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = '#fff'; el.style.paddingLeft = '4px'; }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = 'rgba(255,255,255,0.5)'; el.style.paddingLeft = '0'; }}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Trust badges ── */}
      <div style={{ padding: '26px 40px', borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
          {trustBadges.map((badge, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '0 36px',
              borderRight: i < trustBadges.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
            }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(200,169,110,0.1)', border: '1px solid rgba(200,169,110,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>
                {badge.icon}
              </div>
              <div>
                <strong style={{ display: 'block', color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: 500, lineHeight: 1.2 }}>{badge.text}</strong>
                {badge.desc && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{badge.desc}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div style={{ padding: '18px 40px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.02em' }}>{footerCopyright}</span>

          <div style={{ display: 'flex', gap: 24 }}>
            {policyLinks.map((link, i) => (
              <Link key={i} href={link.url} style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 11.5, transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)'}>
                {link.label}
              </Link>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'rgba(255,255,255,0.3)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>Secured by</span>
            <span style={{ color: '#528ff0', fontWeight: 600, fontSize: 12 }}>Razorpay</span>
          </div>
        </div>
      </div>

    </footer>
  );
}
