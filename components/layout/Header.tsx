'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, Search, User, Heart, Menu, X, ChevronDown } from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';
import { useAuthStore } from '../../stores/authStore';
import { ISiteSettings } from '../../types';
import { cn } from '../../lib/utils';
import CartDrawer from './CartDrawer';

interface HeaderProps { settings: ISiteSettings | null; }

const DEFAULT_NAV_LINKS = [
  { href: '/products', label: 'All Products' },
  { href: '/products?category=face-care', label: 'Face Care' },
  { href: '/products?category=body-care', label: 'Body Care' },
  { href: '/products?category=hair-care', label: 'Hair Care' },
  { href: '/blog', label: 'Blog' },
];

export default function Header({ settings }: HeaderProps) {
  const [isScrolled, setIsScrolled]     = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen]     = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');
  const [expandedMobileModals, setExpandedMobileModals] = useState<string[]>([]);
  const { getTotalItems, openCart } = useCartStore();
  const { user } = useAuthStore();
  const pathname   = usePathname();
  const router     = useRouter();
  const totalItems = getTotalItems();

  const navLinks = (settings?.navLinks && settings.navLinks.length > 0)
    ? [...settings.navLinks].sort((a, b) => a.order - b.order).map(l => ({
        href: l.href, label: l.label,
        subLinks: l.subLinks ? [...l.subLinks].sort((a, b) => a.order - b.order) : [],
      }))
    : DEFAULT_NAV_LINKS;

  const toggleMobileNav = (label: string) =>
    setExpandedMobileModals(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]);

  useEffect(() => {
    const fn = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => { setIsMobileOpen(false); }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 w-full">

        {/* ── Announcement bar ── */}
        {settings?.announcementBar?.isEnabled && settings.announcementBar.text && (
          <div
            style={{
              background: settings.announcementBar.backgroundColor || '#0a0a0a',
              color: settings.announcementBar.textColor || '#fafaf8',
              fontSize: 11.5,
              letterSpacing: '0.1em',
              fontWeight: 400,
              textAlign: 'center',
              padding: '9px 16px',
            }}
          >
            {settings.announcementBar.link ? (
              <Link href={settings.announcementBar.link} className="hover:opacity-70 transition-opacity">
                {settings.announcementBar.text}
              </Link>
            ) : (
              <span>{settings.announcementBar.text}</span>
            )}
          </div>
        )}

        {/* ── Main header ── */}
        <header
          style={{
            background: isScrolled ? 'rgba(250,250,248,0.97)' : '#fafaf8',
            backdropFilter: isScrolled ? 'blur(20px)' : 'none',
            borderBottom: isScrolled ? '1px solid rgba(0,0,0,0.07)' : '1px solid transparent',
            boxShadow: isScrolled ? '0 1px 24px rgba(0,0,0,0.05)' : 'none',
            transition: 'all 0.35s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          <div className="container">
            <div className="flex items-center justify-between gap-8" style={{ height: 68 }}>

              {/* Logo */}
              <Link
                href="/"
                style={{
                  fontFamily: 'var(--font-playfair, serif)',
                  fontSize: 22,
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  color: '#0a0a0a',
                  textDecoration: 'none',
                  flexShrink: 0,
                }}
              >
                {settings?.logo
                  ? <img src={settings.logo} alt={settings.siteName} style={{ height: 36, width: 'auto' }} />
                  : (settings?.siteName ?? 'Glomix')}
              </Link>

              {/* Desktop nav */}
              <nav className="hidden lg:flex items-center gap-8 flex-1 justify-center">
                {navLinks.map(link => {
                  const isActive = pathname === link.href;
                  return (
                    <div key={link.href} className="relative group">
                      <Link
                        href={link.href}
                        className="nav-link flex items-center gap-1"
                        style={{
                          fontSize: 12.5,
                          fontWeight: 400,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: isActive ? '#0a0a0a' : '#6b6560',
                          textDecoration: 'none',
                          padding: '6px 0',
                          transition: 'color 0.2s',
                          position: 'relative',
                        }}
                        onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = '#0a0a0a'; }}
                        onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = '#6b6560'; }}
                      >
                        <span style={{ position: 'relative', paddingBottom: 3 }}>
                          {link.label}
                          <span
                            className={isActive ? 'nav-underline nav-underline-active' : 'nav-underline'}
                            style={{ position: 'absolute', left: 0, bottom: 0, height: 1, background: '#0a0a0a', display: 'block' }}
                          />
                        </span>
                        {link.subLinks && link.subLinks.length > 0 && (
                          <ChevronDown size={12} style={{ color: '#b0a99e', marginLeft: 2 }} className="group-hover:-rotate-180 transition-transform duration-200" />
                        )}
                      </Link>

                      {link.subLinks && link.subLinks.length > 0 && (
                        <div
                          className="absolute top-full left-0 w-52 bg-white rounded-xl border opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 translate-y-2 transition-all duration-200 z-50"
                          style={{ borderColor: 'rgba(0,0,0,0.07)', boxShadow: '0 16px 48px rgba(0,0,0,0.10)', marginTop: 4 }}
                        >
                          {link.subLinks.map(sub => (
                            <Link
                              key={sub.href + sub.label}
                              href={sub.href}
                              className="block px-5 py-2.5 text-sm transition-colors"
                              style={{ color: '#3d3a35', fontSize: 12.5, letterSpacing: '0.02em' }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f5f3ef'; (e.currentTarget as HTMLElement).style.color = '#0a0a0a'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#3d3a35'; }}
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>

              {/* Icon actions */}
              <div className="flex items-center gap-0.5 shrink-0">
                {/* Search */}
                {searchOpen ? (
                  <form onSubmit={handleSearch} className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={searchQuery}
                      autoFocus
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      style={{
                        outline: 'none',
                        fontSize: 13,
                        padding: '7px 14px',
                        borderRadius: 9999,
                        border: '1.5px solid rgba(0,0,0,0.12)',
                        width: 200,
                        background: '#f5f3ef',
                        color: '#0a0a0a',
                        fontFamily: 'var(--font-body)',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: '#6b6560', display: 'flex', alignItems: 'center', borderRadius: 9999, transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.05)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}
                    >
                      <X size={16} />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setSearchOpen(true)}
                    aria-label="Search"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#6b6560', display: 'flex', alignItems: 'center', borderRadius: 9999, transition: 'all 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.05)'; (e.currentTarget as HTMLElement).style.color = '#0a0a0a'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = '#6b6560'; }}
                  >
                    <Search size={17} />
                  </button>
                )}

                <Link
                  href="/account/wishlist"
                  className="hidden sm:flex items-center"
                  aria-label="Wishlist"
                  style={{ padding: '8px', color: '#6b6560', borderRadius: 9999, transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.05)'; (e.currentTarget as HTMLElement).style.color = '#0a0a0a'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = '#6b6560'; }}
                >
                  <Heart size={17} />
                </Link>

                <Link
                  href={user ? '/account' : '/auth/login'}
                  className="hidden sm:flex items-center"
                  aria-label="Account"
                  style={{ padding: '8px', color: '#6b6560', borderRadius: 9999, transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.05)'; (e.currentTarget as HTMLElement).style.color = '#0a0a0a'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = '#6b6560'; }}
                >
                  <User size={17} />
                </Link>

                {/* Cart */}
                <button
                  onClick={openCart}
                  aria-label="Cart"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#6b6560', position: 'relative', display: 'flex', alignItems: 'center', borderRadius: 9999, transition: 'all 0.15s', marginLeft: 2 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.05)'; (e.currentTarget as HTMLElement).style.color = '#0a0a0a'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = '#6b6560'; }}
                >
                  <ShoppingBag size={17} />
                  {totalItems > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: 3,
                        right: 3,
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        background: '#0a0a0a',
                        color: '#fafaf8',
                        fontSize: 9,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        letterSpacing: 0,
                      }}
                    >
                      {totalItems > 9 ? '9+' : totalItems}
                    </span>
                  )}
                </button>

                {/* Mobile menu toggle */}
                <button
                  onClick={() => setIsMobileOpen(!isMobileOpen)}
                  className="lg:hidden"
                  aria-label="Menu"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#6b6560', display: 'flex', alignItems: 'center', borderRadius: 9999, transition: 'all 0.15s', marginLeft: 4 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.05)'; (e.currentTarget as HTMLElement).style.color = '#0a0a0a'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = '#6b6560'; }}
                >
                  {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </div>

            {/* ── Mobile nav ── */}
            {isMobileOpen && (
              <div className="lg:hidden pb-4 border-t" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
                <ul className="flex flex-col mt-2 gap-0.5">
                  {navLinks.map(link => (
                    <li key={link.href}>
                      {link.subLinks && link.subLinks.length > 0 ? (
                        <>
                          <button
                            onClick={() => toggleMobileNav(link.label)}
                            className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-colors"
                            style={{ color: '#3d3a35', letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: 11.5, fontWeight: 400, background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            {link.label}
                            <ChevronDown size={14} className={cn('transition-transform text-[#b0a99e]', expandedMobileModals.includes(link.label) && '-rotate-180')} />
                          </button>
                          {expandedMobileModals.includes(link.label) && (
                            <ul className="pl-5 pb-1">
                              {link.subLinks.map(sub => (
                                <li key={sub.href + sub.label}>
                                  <Link href={sub.href} className="block py-2 text-sm" style={{ color: '#6b6560', fontSize: 12.5 }}>
                                    {sub.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </>
                      ) : (
                        <Link
                          href={link.href}
                          className="block px-3 py-2.5 rounded-lg transition-colors"
                          style={{ color: pathname === link.href ? '#0a0a0a' : '#3d3a35', letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: 11.5, fontWeight: pathname === link.href ? 500 : 400 }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.04)'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                  <li className="pt-3 mt-2 border-t px-1" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
                    <Link
                      href={user ? '/account' : '/auth/login'}
                      style={{
                        display: 'block',
                        textAlign: 'center',
                        padding: '10px',
                        borderRadius: 9999,
                        fontSize: 12.5,
                        fontWeight: 500,
                        background: '#0a0a0a',
                        color: '#fafaf8',
                        letterSpacing: '0.04em',
                        textDecoration: 'none',
                      }}
                    >
                      {user ? 'My Account' : 'Login / Register'}
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </header>
      </div>

      <CartDrawer />
    </>
  );
}
