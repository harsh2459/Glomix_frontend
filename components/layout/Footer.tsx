import Link from 'next/link';
import { ISiteSettings } from '../../types';

interface FooterProps {
  settings: ISiteSettings | null;
}

const socialLabels: Record<string, string> = {
  instagram: 'IG',
  facebook: 'FB',
  twitter: 'X',
  youtube: 'YT',
  pinterest: 'PT',
  whatsapp: 'WA',
};

const DEFAULT_POLICY_LINKS = [
  { label: 'Privacy Policy', url: '/privacy-policy' },
  { label: 'Return Policy', url: '/return-policy' },
  { label: 'Shipping Policy', url: '/shipping-policy' },
];

export default function Footer({ settings }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const footerCopyright = settings?.footerCopyright?.replace('2025', String(currentYear)) || `© ${currentYear} Glomix. All rights reserved.`;

  const policyLinks = (settings?.footerPolicyLinks && settings.footerPolicyLinks.length > 0)
    ? [...settings.footerPolicyLinks].sort((a, b) => a.order - b.order)
    : DEFAULT_POLICY_LINKS;

  return (
    <footer style={{ background: 'var(--color-surface)', borderTop: '1px solid rgba(0,0,0,0.07)' }}>
      <div className="container section-sm">
        {/* Main footer grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            {settings?.logo ? (
              <img src={settings.logo} alt={settings.siteName} className="h-10 w-auto mb-4" />
            ) : (
              <span className="font-heading text-2xl font-bold gradient-text block mb-4">
                {settings?.siteName ?? 'Glomix'}
              </span>
            )}
            {settings?.footerDescription && (
              <p className="text-sm text-gray-400 leading-relaxed mb-4">{settings.footerDescription}</p>
            )}
            {/* Social links */}
            <div className="flex gap-3">
              {Object.entries(settings?.socialLinks ?? {}).map(([platform, url]) => {
                if (!url) return null;
                const label = socialLabels[platform] ?? platform.slice(0, 2).toUpperCase();
                return (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={platform}
                    className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:border-gray-600 transition-all text-xs font-bold"
                  >
                    {label}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Footer columns from DB */}
          {(settings?.footerColumns ?? []).map((col, i) => (
            <div key={i}>
              <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-gray-700">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link, j) => (
                  <li key={j}>
                    <Link
                      href={link.url}
                      className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact info */}
        {(settings?.contactEmail || settings?.contactPhone) && (
          <div className="border-t border-gray-100 pt-8 mb-8 flex flex-wrap gap-6">
            {settings.contactEmail && (
              <a href={`mailto:${settings.contactEmail}`} className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
                📧 {settings.contactEmail}
              </a>
            )}
            {settings.contactPhone && (
              <a href={`tel:${settings.contactPhone}`} className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
                📞 {settings.contactPhone}
              </a>
            )}
            {settings.contactAddress && (
              <span className="text-sm text-gray-400">📍 {settings.contactAddress}</span>
            )}
          </div>
        )}

        {/* Bottom bar */}
        <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">{footerCopyright}</p>
          <div className="flex flex-wrap items-center gap-4">
            {policyLinks.map((link, i) => (
              <Link key={i} href={link.url} className="text-xs text-gray-500 hover:text-gray-700">
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span>Secured by</span>
            <span className="font-semibold text-gray-500">Razorpay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
