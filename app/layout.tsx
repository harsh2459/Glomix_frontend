import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { Providers } from './providers';
import { ISiteSettings } from '../types';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' });

async function getSiteSettings(): Promise<ISiteSettings | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as ISiteSettings;
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const seo = settings?.seo;
  return {
    title: {
      default: seo?.siteTitle ?? 'Glomix — Premium Natural Beauty & Skincare',
      template: `%s | ${settings?.siteName ?? 'Glomix'}`,
    },
    description: seo?.siteDescription ?? 'Discover Glomix premium natural cosmetics. Shop soaps, face creams, serums, and beauty essentials. Cruelty-free, made in India.',
    keywords: seo?.siteKeywords ?? ['glomix', 'natural skincare', 'face cream', 'soap', 'beauty products', 'cosmetics india'],
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      siteName: settings?.siteName ?? 'Glomix',
      images: seo?.ogImage ? [{ url: seo.ogImage }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      site: seo?.twitterHandle,
    },
    verification: { google: seo?.googleVerification },
    alternates: { canonical: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://glomix.in' },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const theme = settings?.theme;

  // Build dynamic CSS custom properties from DB settings
  const themeVars = theme ? `
    :root {
      --color-primary: ${theme.primaryColor};
      --color-secondary: ${theme.secondaryColor};
      --color-accent: ${theme.accentColor};
      --color-bg: ${theme.backgroundColor};
      --color-surface: ${theme.surfaceColor};
      --color-text: ${theme.textColor};
      --color-muted: ${theme.mutedColor};
      --radius: ${theme.borderRadius};
    }
  ` : '';

  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        {themeVars && (
          <style id="theme-vars" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: themeVars }} />
        )}
        {settings?.customHeadScripts && (
          <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: settings.customHeadScripts }} />
        )}
        {settings?.favicon && <link rel="icon" href={settings.favicon} />}
      </head>
      <body style={{ fontFamily: 'var(--font-inter, Inter, sans-serif)' }} suppressHydrationWarning>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#FFFFFF',
                color: '#111827',
                border: '1px solid rgba(147, 51, 234, 0.15)',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
