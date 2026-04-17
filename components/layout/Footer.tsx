'use client';
import React from 'react';
import Link from 'next/link';
import { ISiteSettings } from '../../types';

interface FooterProps {
  settings: ISiteSettings | null;
}

/* ── Social SVG icons ──────────────────────────────────── */
const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  instagram: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  ),
  facebook: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  ),
  twitter: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  youtube: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
      <polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
    </svg>
  ),
  pinterest: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.42 7.63 11.18-.1-.95-.2-2.41.04-3.45.22-.93 1.47-6.22 1.47-6.22s-.38-.75-.38-1.87c0-1.75 1.02-3.06 2.28-3.06 1.08 0 1.6.81 1.6 1.78 0 1.08-.69 2.7-1.05 4.2-.3 1.25.62 2.27 1.85 2.27 2.22 0 3.72-2.86 3.72-6.25 0-2.57-1.73-4.53-4.87-4.53-3.55 0-5.78 2.65-5.78 5.62 0 1.02.3 1.73.76 2.28.21.25.24.35.17.62-.05.2-.17.69-.22.88-.07.28-.28.38-.52.28-1.46-.6-2.14-2.2-2.14-4.01 0-2.97 2.5-6.53 7.46-6.53 4 0 6.63 2.9 6.63 6.02 0 4.12-2.28 7.19-5.64 7.19-1.13 0-2.19-.61-2.56-1.3l-.7 2.72c-.25.98-.93 2.2-1.39 2.94.86.27 1.78.41 2.72.41 6.63 0 12-5.37 12-12S18.63 0 12 0z"/>
    </svg>
  ),
  whatsapp: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
    </svg>
  ),
};

/* ── Fallback data ─────────────────────────────────────── */
const DEFAULT_POLICY_LINKS = [
  { label: 'Privacy Policy', url: '/privacy-policy', order: 0 },
  { label: 'Return Policy', url: '/return-policy', order: 1 },
  { label: 'Shipping Policy', url: '/shipping-policy', order: 2 },
  { label: 'Terms of Service', url: '/terms-of-service', order: 3 },
];

const DEFAULT_FOOTER_COLUMNS = [
  {
    title: 'Shop',
    links: [
      { label: 'All Products', url: '/products' },
      { label: 'Best Sellers', url: '/products?sort=bestsellers' },
      { label: 'New Arrivals', url: '/products?sort=new' },
      { label: 'Sale', url: '/products?sale=true' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', url: '/about-us' },
      { label: 'Contact', url: '/contact' },
      { label: 'Blog', url: '/blog' },
      { label: 'Careers', url: '/careers' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'FAQ', url: '/faq' },
      { label: 'Shipping Policy', url: '/shipping-policy' },
      { label: 'Return Policy', url: '/return-policy' },
      { label: 'Privacy Policy', url: '/privacy-policy' },
    ],
  },
];

const DEFAULT_TRUST_BADGES = [
  { emoji: '🌿', label: '100% Natural' },
  { emoji: '🐰', label: 'Cruelty Free' },
  { emoji: '🇮🇳', label: 'Made in India' },
  { emoji: '✨', label: 'Dermatologist Tested' },
  { emoji: '🔒', label: 'Secure Payments' },
  { emoji: '🚚', label: 'Free Shipping ₹499+' },
];

/* ── Hard colours — footer is ALWAYS dark regardless of theme ── */
// This ensures the footer is readable no matter what theme the admin picks.
const FG_WHITE   = '#ffffff';      // headings / logo
const FG_SUB     = '#c9cdd4';      // sublinks / description  ← bigger & brighter
const FG_MUTED   = '#8b949e';      // secondary text
const BG_FOOTER  = '#0d0e16';      // footer background
const BG_BOTTOM  = '#080810';      // bottom-bar background
const BORDER_CLR = 'rgba(255,255,255,0.08)';

// Primary accent: use CSS var so it respects admin theme, fallback purple
const ACCENT = 'var(--color-primary, #7c3aed)';

/* ── Component ─────────────────────────────────────────── */
export default function Footer({ settings }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const siteName = settings?.siteName ?? 'Glomix';

  const footerCopyright =
    settings?.footerCopyright?.replace(/20\d\d/, String(currentYear)) ||
    `© ${currentYear} ${siteName}. All rights reserved.`;

  const footerDescription =
    settings?.footerDescription ||
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
  const hasSocials  = Object.values(socialLinks).some(Boolean);

  return (
    <footer style={{
      background: BG_FOOTER,
      color: FG_SUB,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>

      {/* ── Top border ───────────────────────────────────── */}
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }} />

      {/* ── Main body ───────────────────────────────────── */}
      <div style={{ padding: '64px 32px 56px' }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'clamp(220px, 24%, 300px) 1fr',
          gap: '64px',
          alignItems: 'start',
        }}>

          {/* ── Brand column ─────────────────────────────── */}
          <div>
            {/* Logo or Site name */}
            {settings?.logo ? (
              <img
                src={settings.logo}
                alt={siteName}
                style={{
                  height: '44px',
                  width: 'auto',
                  marginBottom: '20px',
                  filter: 'brightness(0) invert(1)',
                }}
              />
            ) : (
              <span style={{
                fontSize: '32px',
                fontWeight: 800,
                color: FG_WHITE,
                letterSpacing: '-0.8px',
                marginBottom: '18px',
                display: 'block',
                lineHeight: 1,
              }}>
                {siteName}
              </span>
            )}

            {/* Description */}
            <p style={{
              fontSize: '15px',
              lineHeight: '1.75',
              color: FG_SUB,
              marginBottom: '28px',
              maxWidth: '260px',
            }}>
              {footerDescription}
            </p>

            {/* Social icons */}
            {hasSocials && (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '28px' }}>
                {Object.entries(socialLinks).map(([platform, url]) => {
                  if (!url) return null;
                  return (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={platform}
                      title={platform}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        border: `1px solid ${BORDER_CLR}`,
                        background: 'rgba(255,255,255,0.05)',
                        color: FG_SUB,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.background = 'rgba(124,58,237,0.2)';
                        el.style.borderColor = 'rgba(124,58,237,0.5)';
                        el.style.color = FG_WHITE;
                      }}
                      onMouseLeave={e => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.background = 'rgba(255,255,255,0.05)';
                        el.style.borderColor = BORDER_CLR;
                        el.style.color = FG_SUB;
                      }}
                    >
                      {SOCIAL_ICONS[platform] ?? (
                        <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                          {platform.slice(0, 2)}
                        </span>
                      )}
                    </a>
                  );
                })}
              </div>
            )}

            {/* Contact info */}
            {(settings?.contactEmail || settings?.contactPhone || settings?.contactAddress) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {settings?.contactEmail && (
                  <a
                    href={`mailto:${settings.contactEmail}`}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: FG_SUB, textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = FG_WHITE}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = FG_SUB}
                  >
                    <svg style={{ flexShrink: 0, opacity: 0.7 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                    </svg>
                    {settings.contactEmail}
                  </a>
                )}
                {settings?.contactPhone && (
                  <a
                    href={`tel:${settings.contactPhone}`}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: FG_SUB, textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = FG_WHITE}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = FG_SUB}
                  >
                    <svg style={{ flexShrink: 0, opacity: 0.7 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.42 2 2 0 0 1 3.58 2.25h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.72 6.72l1.75-1.75a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 23 16.92z"/>
                    </svg>
                    {settings.contactPhone}
                  </a>
                )}
                {settings?.contactAddress && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', color: FG_SUB }}>
                    <svg style={{ flexShrink: 0, marginTop: '2px', opacity: 0.7 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span>{settings.contactAddress}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Nav columns — auto-fit for any number ─────── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '48px 24px',
          }}>
            {footerColumns.map((col, i) => (
              <div key={i}>
                {/* Column title */}
                <h4 style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  color: FG_WHITE,
                  marginBottom: '22px',
                  paddingBottom: '12px',
                  borderBottom: `1px solid ${BORDER_CLR}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  margin: '0 0 22px 0',
                }}>
                  <span style={{
                    width: '4px',
                    height: '14px',
                    borderRadius: '2px',
                    background: 'rgba(255,255,255,0.3)',
                    flexShrink: 0,
                    display: 'inline-block',
                  }} />
                  {col.title}
                </h4>

                {/* Links */}
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}>
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <Link
                        href={link.url}
                        style={{
                          fontSize: '15px',
                          fontWeight: 400,
                          color: FG_SUB,
                          textDecoration: 'none',
                          transition: 'color 0.2s',
                          display: 'block',
                          lineHeight: 1.4,
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = FG_WHITE}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = FG_SUB}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Trust badges ────────────────────────────────── */}
      <div style={{
        borderTop: `1px solid ${BORDER_CLR}`,
        borderBottom: `1px solid ${BORDER_CLR}`,
        padding: '20px 32px',
        background: 'rgba(0,0,0,0.2)',
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          justifyContent: 'center',
        }}>
          {DEFAULT_TRUST_BADGES.map(({ emoji, label }) => (
            <div key={label} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              borderRadius: '100px',
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${BORDER_CLR}`,
              fontSize: '13px',
              color: FG_SUB,
              whiteSpace: 'nowrap',
            }}>
              <span style={{ fontSize: '15px' }}>{emoji}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom bar ──────────────────────────────────── */}
      <div style={{ background: BG_BOTTOM, padding: '20px 32px' }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
        }}>
          {/* Copyright */}
          <p style={{ fontSize: '13px', color: FG_MUTED, margin: 0 }}>
            {footerCopyright}
          </p>

          {/* Policy links — dynamic, auto-wraps if many added */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 0px', alignItems: 'center' }}>
            {policyLinks.map((link, i) => (
              <React.Fragment key={i}>
                {i > 0 && (
                  <span style={{ color: '#374151', padding: '0 6px', fontSize: '12px' }}>·</span>
                )}
                <Link
                  href={link.url}
                  style={{
                    fontSize: '13px',
                    color: FG_MUTED,
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                    padding: '2px 0',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = FG_WHITE}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = FG_MUTED}
                >
                  {link.label}
                </Link>
              </React.Fragment>
            ))}
          </div>

          {/* Razorpay */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: FG_MUTED }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>Secured by</span>
            <span style={{
              fontWeight: 700,
              color: '#c4c9d4',
              fontSize: '13px',
            }}>Razorpay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
