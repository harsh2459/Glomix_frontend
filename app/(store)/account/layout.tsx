'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { User, ShoppingBag, Heart, MapPin, LogOut, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';

const NAV_ITEMS = [
  { href: '/account', label: 'Dashboard', icon: User },
  { href: '/account/orders', label: 'My Orders', icon: ShoppingBag },
  { href: '/account/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/account/addresses', label: 'Addresses', icon: MapPin },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && !user) router.replace('/auth/login?redirect=/account');
  }, [user, mounted, router]);

  if (!mounted || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="skeleton w-8 h-8 rounded-full" />
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-10">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {/* User info */}
              <div className="p-6 border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white">
                <div className="w-14 h-14 rounded-full bg-gray-900 flex items-center justify-center text-white text-xl font-bold mb-3">
                  {user.name?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <p className="font-semibold text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{user.email}</p>
              </div>

              {/* Nav */}
              <nav className="p-2">
                {NAV_ITEMS.map(item => {
                  const Icon = item.icon;
                  const active = pathname === item.href || (item.href !== '/account' && pathname.startsWith(item.href));
                  return (
                    <Link key={item.href} href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        active ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}>
                      <Icon size={16} />
                      {item.label}
                      {!active && <ChevronRight size={14} className="ml-auto text-gray-300" />}
                    </Link>
                  );
                })}
                <button onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 w-full transition-colors mt-1">
                  <LogOut size={16} />
                  Logout
                </button>
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <main className="lg:col-span-3">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
