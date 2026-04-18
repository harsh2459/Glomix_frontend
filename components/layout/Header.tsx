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
  const [isScrolled, setIsScrolled]   = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen]   = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedMobileModals, setExpandedMobileModals] = useState<string[]>([]);
  const { getTotalItems, openCart } = useCartStore();
  const { user } = useAuthStore();
  const pathname = usePathname();
  const router   = useRouter();
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
    const fn = () => setIsScrolled(window.scrollY > 20);
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
            className="text-center py-2.5 px-4"
            style={{
              background: settings.announcementBar.backgroundColor || '#0a0a0a',
              color: settings.announcementBar.textColor || '#fafaf8',
              fontSize: 12,
              letterSpacing: '0.08em',
              fontWeight: 300,
            }}
          >
            {settings.announcementBar.link ? (
              <Link href={settings.announcementBar.link} className="hover:opacity-80 transition-opacity">
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
            background: 'rgba(250,250,248,0.96)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid #e8e4dd',
            boxShadow: isScrolled ? '0 4px 24px rgba(0,0,0,0.07)' : 'none',
            transition: 'box-shadow 0.3s',
          }}
        >
          <div className="container">
            <div className="flex items-center justify-between h-[68px] gap-6">

              {/* Logo */}
              <Link href="/" className="shrink-0" style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: 26, fontWeight: 600, letterSpacing: '0.04em', color: '#0a0a0a', textDecoration: 'none' }}>
                {settings?.logo
                  ? <img src={settings.logo} alt={settings.siteName} className="h-9 w-auto" />
                  : (settings?.siteName ?? 'Glomix')}
              </Link>

              {/* Desktop nav */}
              <nav className="hidden lg:flex items-center gap-7">
                {navLinks.map(link => {
                  const isActive = pathname === link.href;
                  return (
                  <div key={link.href} className="relative group">
                    <Link
                      href={link.href}
                      className="nav-link flex items-center gap-1 py-2"
                      style={{
                        fontSize: 13,
                        fontWeight: 400,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        color: '#4a453f',
                        textDecoration: 'none',
                        position: 'relative',
                      }}
                    >
                      <span className="nav-link-inner" style={{ position: 'relative', paddingBottom: 3 }}>
                        {link.label}
                        {/* underline — grows on hover via CSS, always full-width if active */}
                        <span
                          className={isActive ? 'nav-underline nav-underline-active' : 'nav-underline'}
                          style={{ position: 'absolute', left: 0, bottom: 0, height: 1, background: '#c8a96e', display: 'block' }}
                        />
                      </span>
                      {link.subLinks && link.subLinks.length > 0 && (
                        <ChevronDown size={13} style={{ color: '#b0a99e' }} className="group-hover:-rotate-180 transition-transform duration-200" />
                      )}
                    </Link>

                    {link.subLinks && link.subLinks.length > 0 && (
                      <div className="absolute top-full left-0 w-52 bg-white rounded-xl border opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 translate-y-2 transition-all duration-200 z-50"
                        style={{ borderColor: '#e8e4dd', boxShadow: '0 12px 40px rgba(0,0,0,0.10)' }}>
                        {link.subLinks.map(sub => (
                          <Link key={sub.href + sub.label} href={sub.href}
                            className="block px-5 py-2.5 text-sm transition-colors hover:bg-[#f4f1ec]"
                            style={{ color: '#4a453f', fontSize: 13 }}>
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                  );
                })}
              </nav>

              {/* Icons */}
              <div className="flex items-center gap-1">
                {/* Search */}
                {searchOpen ? (
                  <form onSubmit={handleSearch} className="flex items-center gap-2">
                    <input
                      type="text" value={searchQuery} autoFocus
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="outline-none text-sm px-3 py-1.5 rounded-lg border"
                      style={{ borderColor: '#e8e4dd', width: 180, background: '#fafaf8' }}
                    />
                    <button type="button" onClick={() => setSearchOpen(false)}
                      className="p-2 transition-colors" style={{ color: '#4a453f' }}>
                      <X size={18} />
                    </button>
                  </form>
                ) : (
                  <button onClick={() => setSearchOpen(true)}
                    className="p-2 transition-colors hover:text-black" style={{ color: '#4a453f', background: 'none', border: 'none', cursor: 'pointer' }}
                    aria-label="Search">
                    <Search size={18} />
                  </button>
                )}

                <Link href="/account/wishlist" className="p-2 hidden sm:flex transition-colors hover:text-black" style={{ color: '#4a453f' }} aria-label="Wishlist">
                  <Heart size={18} />
                </Link>

                <Link href={user ? '/account' : '/auth/login'} className="p-2 hidden sm:flex transition-colors hover:text-black" style={{ color: '#4a453f' }} aria-label="Account">
                  <User size={18} />
                </Link>

                <button onClick={openCart} className="p-2 relative transition-colors hover:text-black" style={{ color: '#4a453f', background: 'none', border: 'none', cursor: 'pointer' }} aria-label="Cart">
                  <ShoppingBag size={18} />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                      style={{ background: '#c8a96e', color: '#fff' }}>
                      {totalItems > 9 ? '9+' : totalItems}
                    </span>
                  )}
                </button>

                <button onClick={() => setIsMobileOpen(!isMobileOpen)}
                  className="p-2 lg:hidden transition-colors" style={{ color: '#4a453f', background: 'none', border: 'none', cursor: 'pointer' }}
                  aria-label="Menu">
                  {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
              </div>
            </div>

            {/* Mobile nav */}
            {isMobileOpen && (
              <div className="lg:hidden py-4 border-t" style={{ borderColor: '#e8e4dd' }}>
                <ul className="flex flex-col gap-0.5">
                  {navLinks.map(link => (
                    <li key={link.href}>
                      {link.subLinks && link.subLinks.length > 0 ? (
                        <>
                          <button onClick={() => toggleMobileNav(link.label)}
                            className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm transition-colors"
                            style={{ color: '#4a453f', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: 12 }}>
                            {link.label}
                            <ChevronDown size={16} className={cn('transition-transform', expandedMobileModals.includes(link.label) && '-rotate-180')} />
                          </button>
                          {expandedMobileModals.includes(link.label) && (
                            <ul className="pl-6 pb-2">
                              {link.subLinks.map(sub => (
                                <li key={sub.href + sub.label}>
                                  <Link href={sub.href} className="block py-2 text-sm" style={{ color: '#4a453f' }}>{sub.label}</Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </>
                      ) : (
                        <Link href={link.href}
                          className="block px-4 py-3 rounded-lg text-sm transition-colors hover:bg-[#f4f1ec]"
                          style={{ color: '#4a453f', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: 12 }}>
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                  <li className="pt-3 border-t mt-2 px-4" style={{ borderColor: '#e8e4dd' }}>
                    <Link href={user ? '/account' : '/auth/login'}
                      className="block text-center py-2.5 rounded-lg text-sm font-medium border transition-colors"
                      style={{ borderColor: '#e8e4dd', color: '#0a0a0a' }}>
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
