'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Package, Tag, ShoppingCart, Users,
  Ticket, Image, Star, BookOpen, ChevronRight,
  LogOut, Menu, Palette, Home, FileText, Plug, UserCog, Bell,
  ExternalLink, PanelLeftClose, PanelLeftOpen, X, Settings, Layers, LayoutTemplate
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { apiGet } from '../../lib/api';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';

// permissionKey maps each nav entry to the Admin.permissions key
const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, permissionKey: 'dashboard' },
  { href: '/admin/products', label: 'Products', icon: Package, permissionKey: 'products' },
  { href: '/admin/product-templates', label: 'Product Templates', icon: Layers, permissionKey: 'product-templates' },
  { href: '/admin/categories', label: 'Categories', icon: Tag, permissionKey: 'categories' },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart, permissionKey: 'orders' },
  { href: '/admin/customers', label: 'Customers', icon: Users, permissionKey: 'customers' },
  { href: '/admin/coupons', label: 'Coupons', icon: Ticket, permissionKey: 'coupons' },
  { href: '/admin/banners', label: 'Banners', icon: Image, permissionKey: 'banners' },
  { href: '/admin/reviews', label: 'Reviews', icon: Star, permissionKey: 'reviews' },
  { href: '/admin/blog', label: 'Blog', icon: BookOpen, permissionKey: 'blog' },
  { href: '/admin/pages', label: 'Pages', icon: LayoutTemplate, permissionKey: 'pages' },
  { href: '/admin/team', label: 'Team', icon: UserCog, permissionKey: 'team' },
] as const;

const settingsItems = [
  { href: '/admin/settings/general', label: 'General', icon: Settings },
  { href: '/admin/settings/theme', label: 'Theme', icon: Palette },
  { href: '/admin/settings/homepage', label: 'Homepage', icon: Home },
  { href: '/admin/settings/content', label: 'Content', icon: Layers },
  { href: '/admin/settings/footer', label: 'Footer', icon: FileText },
  { href: '/admin/settings/seo', label: 'SEO', icon: Bell },
  { href: '/admin/settings/integrations', label: 'Integrations', icon: Plug },
];

// Returns true if `admin` can see/access the given permissionKey
function hasPermission(admin: { role: string; permissions?: string[] } | null, key: string): boolean {
  if (!admin) return false;
  if (admin.role === 'super_admin') return true; // super admin sees everything
  return (admin.permissions ?? []).includes(key);
}

/* ── Tooltip wrapper for collapsed icon mode ─────────────────── */
function SidebarLink({
  href, label, icon: Icon, isActive, collapsed, onClick,
}: {
  href: string; label: string; icon: React.ElementType;
  isActive: boolean; collapsed: boolean; onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={cn(
        'relative flex items-center rounded-lg transition-all duration-150 group',
        collapsed ? 'justify-center p-3 mx-auto' : 'gap-3 px-3 py-2',
        isActive
          ? 'bg-white/10 text-white'
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      )}
    >
      <Icon size={17} className="shrink-0" />

      {/* Label — hidden when collapsed */}
      {!collapsed && (
        <span className="truncate text-sm font-medium">{label}</span>
      )}
      {!collapsed && isActive && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white shrink-0" />
      )}

      {/* Custom tooltip on collapsed */}
      {collapsed && (
        <span
          className="
            absolute left-full ml-3 px-2.5 py-1.5 rounded-lg
            bg-slate-800 text-white text-xs font-medium whitespace-nowrap
            pointer-events-none opacity-0 translate-x-1 scale-95
            group-hover:opacity-100 group-hover:translate-x-0 group-hover:scale-100
            transition-all duration-150 z-50 shadow-lg border border-white/10
          "
        >
          {label}
        </span>
      )}
    </Link>
  );
}

/* ─────────────────────────────────────────────────────────────── */

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { admin, setAdmin } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile
  const [collapsed, setCollapsed] = useState(false); // desktop collapse

  const isAuthPage = pathname === '/admin/login' || pathname === '/admin/setup';

  /* ── persist collapse state ── */
  useEffect(() => {
    const saved = localStorage.getItem('admin-sidebar-collapsed');
    if (saved !== null) setCollapsed(JSON.parse(saved));
  }, []);

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      localStorage.setItem('admin-sidebar-collapsed', JSON.stringify(!prev));
      return !prev;
    });
  };

  /* ── auth check ── */
  useEffect(() => {
    if (isAuthPage) { setLoading(false); return; }
    apiGet<{ admin: unknown }>('/admin/auth/me')
      .then(data => { setAdmin(data.admin as Parameters<typeof setAdmin>[0]); setLoading(false); })
      .catch(() => setTimeout(() => router.replace('/admin/login'), 0));
  }, [isAuthPage, router, setAdmin]);

  /* ── permission route-guard ── */
  useEffect(() => {
    if (isAuthPage || !admin || loading) return;
    if (admin.role === 'super_admin') return; // super admin: no restrictions

    const perms: string[] = admin.permissions ?? [];

    // Check settings access
    if (pathname.startsWith('/admin/settings') && !perms.includes('settings')) {
      router.replace('/admin');
      toast.error('You don\'t have permission to access Settings');
      return;
    }

    // Check each nav item
    const blocked = navItems.find(item => {
      if (item.permissionKey === 'dashboard') return false; // always allow dashboard
      const pathMatches = item.href === '/admin'
        ? pathname === '/admin'
        : pathname.startsWith(item.href); 
      return pathMatches && !perms.includes(item.permissionKey);
    });

    if (blocked) {
      router.replace('/admin');
      toast.error(`You don\'t have permission to access ${blocked.label}`);
    }
  }, [pathname, admin, loading, isAuthPage, router]);

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/auth/logout`, {
        method: 'POST', credentials: 'include',
      });
    } finally {
      setAdmin(null);
      toast.success('Logged out');
      router.push('/admin/login');
    }
  };

  if (isAuthPage) return <>{children}</>;
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-slate-600 border-t-white animate-spin" />
          <p className="text-slate-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const adminInitial = admin?.name?.[0]?.toUpperCase() ?? 'A';

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ══════════════ SIDEBAR ══════════════ */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full z-40 flex flex-col transition-all duration-300',
          /* width: collapsed desktop = 64px, expanded = 256px */
          collapsed ? 'w-16' : 'w-64',
          /* mobile: slide in/out; desktop: always visible */
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        style={{
          background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {/* ── Logo / Brand ── */}
        <div
          className={cn(
            'flex items-center h-16 border-b border-white/5 shrink-0 transition-all duration-300',
            collapsed ? 'justify-center px-2' : 'px-4 gap-3'
          )}
        >
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
            <span className="text-white text-sm font-bold">G</span>
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm leading-tight">Glomix Admin</p>
              <p className="text-slate-500 text-xs">Management Panel</p>
            </div>
          )}

          {/* Mobile close */}
          {!collapsed && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-500 hover:text-white p-1 transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* ── Scrollable nav ── */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 space-y-0.5 scrollbar-thin">

          {/* Main section header */}
          {!collapsed && (
            <p className="px-3 text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-2">
              Main Menu
            </p>
          )}
          {collapsed && <div className="mb-3 border-t border-white/5 mx-2" />}

          {navItems.filter(item => hasPermission(admin, item.permissionKey)).map(item => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <SidebarLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={isActive}
                collapsed={collapsed}
                onClick={() => setSidebarOpen(false)}
              />
            );
          })}

          {/* Settings section — only show if admin has 'settings' permission */}
          {hasPermission(admin, 'settings') && (
            <>
              <div className={cn('pt-4 pb-1', collapsed && 'flex justify-center')}>
                {collapsed
                  ? <div className="w-6 border-t border-white/10" />
                  : <p className="px-3 text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-1">Settings</p>
                }
              </div>

              {settingsItems.map(item => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <SidebarLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    isActive={isActive}
                    collapsed={collapsed}
                    onClick={() => setSidebarOpen(false)}
                  />
                );
              })}
            </>
          )}

          {/* View Store */}
          <div className="pt-3">
            <Link
              href="/"
              target="_blank"
              title={collapsed ? 'View Store' : undefined}
              className={cn(
                'relative flex items-center rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all group',
                collapsed ? 'justify-center p-3 mx-auto' : 'gap-3 px-3 py-2'
              )}
            >
              <ExternalLink size={16} className="shrink-0" />
              {!collapsed && <span className="text-sm">View Store</span>}
              {collapsed && (
                <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-medium whitespace-nowrap pointer-events-none opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 z-50 shadow-lg border border-white/10">
                  View Store
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* ── Profile + logout (sticky bottom) ── */}
        <div className="shrink-0 border-t border-white/5 p-3">
          {collapsed ? (
            /* Icon-only mode */
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-8 h-8 rounded-full bg-white/10 text-white text-xs font-bold flex items-center justify-center cursor-default"
                title={admin?.name ?? 'Admin'}
              >
                {adminInitial}
              </div>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            /* Full profile row */
            <div className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-full bg-white/10 text-white text-xs font-bold flex items-center justify-center shrink-0">
                {adminInitial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate leading-tight">{admin?.name}</p>
                <p className="text-xs text-slate-500 truncate capitalize">{admin?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>
      </aside>
      {/* ══════════════ END SIDEBAR ══════════════ */}


      {/* ══════════════ MAIN CONTENT ══════════════ */}
      <div
        className={cn(
          'flex-1 flex flex-col min-h-screen transition-all duration-300',
          collapsed ? 'lg:ml-16' : 'lg:ml-64'
        )}
      >
        {/* ── Top Bar ── */}
        <header className="sticky top-0 z-20 flex items-center px-4 lg:px-5 h-14 bg-white border-b border-gray-200 shrink-0 gap-3">

          {/* Desktop collapse toggle */}
          <button
            onClick={toggleCollapsed}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
          >
            <Menu size={20} />
          </button>

          {/* Breadcrumb */}
          <div className="hidden sm:flex items-center gap-1.5 text-sm text-gray-400">
            <span className="text-gray-700 font-medium">Admin</span>
            <ChevronRight size={14} className="text-gray-300" />
            <span className="capitalize text-gray-500">
              {pathname.split('/').filter(Boolean).slice(1).join(' › ') || 'Dashboard'}
            </span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all font-medium"
            >
              <ExternalLink size={13} />
              View Store
            </Link>
            {admin && (
              <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                <div className="w-7 h-7 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center">
                  {adminInitial}
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
                  {admin.name}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* ── Page Content ── */}
        <main className="admin-main flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

// Trigger recreation
