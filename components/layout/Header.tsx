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

interface HeaderProps {
  settings: ISiteSettings | null;
}

const DEFAULT_NAV_LINKS = [
  { href: '/products', label: 'All Products' },
  { href: '/products?category=face-care', label: 'Face Care' },
  { href: '/products?category=body-care', label: 'Body Care' },
  { href: '/products?category=hair-care', label: 'Hair Care' },
  { href: '/blog', label: 'Blog' },
];

export default function Header({ settings }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { getTotalItems, openCart } = useCartStore();
  const { user } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const totalItems = getTotalItems();

  // Use DB nav links if available, otherwise fall back to defaults
  const navLinks = (settings?.navLinks && settings.navLinks.length > 0)
    ? [...settings.navLinks].sort((a, b) => a.order - b.order).map(l => ({ 
        href: l.href, 
        label: l.label,
        subLinks: l.subLinks ? [...l.subLinks].sort((a,b) => a.order - b.order) : []
      }))
    : DEFAULT_NAV_LINKS;

  const [expandedMobileModals, setExpandedMobileModals] = useState<string[]>([]);

  const toggleMobileNav = (label: string) => {
    setExpandedMobileModals(prev => 
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

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
      {/* Announcement Bar */}
      {settings?.announcementBar?.isEnabled && (
        <div
          className="announcement-bar text-sm py-2 px-4 text-center"
          style={{
            backgroundColor: settings.announcementBar.backgroundColor,
            color: settings.announcementBar.textColor,
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

      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-300',
          isScrolled
            ? 'shadow-md border-b border-gray-100'
            : 'border-b border-gray-100'
        )}
        style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(0,0,0,0.07)' }}
      >
        <nav className="container">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              {settings?.logo ? (
                <img src={settings.logo} alt={settings.siteName} className="h-10 w-auto" />
              ) : (
                <span className="font-heading text-2xl font-bold gradient-text">
                  {settings?.siteName ?? 'Glomix'}
                </span>
              )}
            </Link>

            {/* Desktop Nav */}
            <ul className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <li key={link.href} className="relative group">
                  <Link
                    href={link.href}
                    className={cn(
                      'text-sm font-medium transition-colors hover:text-gray-800 flex items-center gap-1.5 py-5',
                      pathname === link.href ? 'text-gray-800' : 'text-gray-700'
                    )}
                  >
                    {link.label}
                    {link.subLinks && link.subLinks.length > 0 && (
                      <ChevronDown size={14} className="text-gray-400 group-hover:text-gray-800 transition-transform group-hover:-rotate-180" />
                    )}
                  </Link>

                  {/* Dropdown Menu */}
                  {link.subLinks && link.subLinks.length > 0 && (
                    <div className="absolute top-full left-0 w-56 bg-white shadow-xl shadow-gray-200/50 rounded-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0 z-50">
                      <ul className="flex flex-col py-2">
                        {link.subLinks.map((subLink) => (
                          <li key={subLink.href + subLink.label}>
                            <Link
                              href={subLink.href}
                              className="block px-5 py-2.5 text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors"
                            >
                              {subLink.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              {searchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                  <input
                    id="header-search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="input w-48 h-9 text-sm"
                    autoFocus
                  />
                  <button type="button" onClick={() => setSearchOpen(false)} className="btn-ghost p-2">
                    <X size={18} />
                  </button>
                </form>
              ) : (
                <button
                  id="header-search-btn"
                  onClick={() => setSearchOpen(true)}
                  className="btn-ghost p-2"
                  aria-label="Search"
                >
                  <Search size={20} />
                </button>
              )}

              {/* Wishlist */}
              <Link href="/account/wishlist" className="btn-ghost p-2 hidden sm:flex" aria-label="Wishlist">
                <Heart size={20} />
              </Link>

              {/* Account */}
              <Link
                href={user ? '/account' : '/auth/login'}
                className="btn-ghost p-2 hidden sm:flex"
                aria-label="Account"
              >
                <User size={20} />
              </Link>

              {/* Cart */}
              <button
                id="cart-btn"
                onClick={openCart}
                className="btn-ghost p-2 relative"
                aria-label="Cart"
              >
                <ShoppingBag size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gray-700 text-white text-xs flex items-center justify-center font-bold animate-scale-in">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </button>

              {/* Mobile menu */}
              <button
                id="mobile-menu-btn"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="btn-ghost p-2 lg:hidden"
                aria-label="Menu"
              >
                {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* Mobile Nav */}
          {isMobileOpen && (
            <div className="lg:hidden border-t border-gray-100 py-4 animate-fade-in">
              <ul className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    {link.subLinks && link.subLinks.length > 0 ? (
                      <div className="flex flex-col">
                        <button
                          onClick={() => toggleMobileNav(link.label)}
                          className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          {link.label}
                          <ChevronDown size={18} className={cn("text-gray-400 transition-transform", expandedMobileModals.includes(link.label) && "-rotate-180 text-gray-800")} />
                        </button>
                        {expandedMobileModals.includes(link.label) && (
                          <ul className="flex flex-col pl-6 pr-4 pb-2 border-l-2 border-gray-100 ml-4 mt-1">
                            {link.subLinks.map((subLink) => (
                              <li key={subLink.href + subLink.label}>
                                <Link
                                  href={subLink.href}
                                  className="block py-2.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                                >
                                  {subLink.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={link.href}
                        className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
                  <li className="pt-2 border-t border-gray-100 mt-2 flex gap-3 px-4">
                  <Link href={user ? '/account' : '/auth/login'} className="btn-outline flex-1 text-sm py-2">
                    {user ? 'My Account' : 'Login / Register'}
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </nav>
      </header>

      <CartDrawer />
    </>
  );
}
