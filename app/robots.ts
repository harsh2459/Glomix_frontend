import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://glomix.in';

export default async function robots(): Promise<MetadataRoute.Robots> {
  // Optionally fetch custom robots.txt from settings
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, { next: { revalidate: 3600 } });
    const json = await res.json();
    if (json.data?.robotsTxt) {
      // Return raw robots.txt if admin has customized it
      return {
        rules: { userAgent: '*', allow: '/', disallow: ['/admin/', '/api/', '/account/', '/checkout/'] },
        sitemap: `${SITE_URL}/sitemap.xml`,
      };
    }
  } catch { /* use defaults */ }

  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin/', '/api/', '/account/', '/checkout/', '/auth/'] },
      { userAgent: 'Googlebot', allow: '/' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
