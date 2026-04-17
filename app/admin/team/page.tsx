'use client';
import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../../stores/authStore';
import {
  Plus, Pencil, Trash2, Loader2, UserCog, Shield,
  ShieldCheck, ShieldOff, CheckSquare, Square, RefreshCw,
  Key, Mail, User, Lock, Crown, ChevronDown, ChevronUp,
  LayoutDashboard, Package, Tag, ShoppingCart, Users,
  Ticket, Image, Star, BookOpen, FileText, Settings, Layers,
  LayoutTemplate, Eye, EyeOff,
} from 'lucide-react';

// ─── All permission tabs (must match sidebar navItems) ─────────────────
const PERMISSION_TABS = [
  { key: 'dashboard',         label: 'Dashboard',          icon: LayoutDashboard },
  { key: 'products',          label: 'Products',           icon: Package         },
  { key: 'product-templates', label: 'Product Templates',  icon: Layers          },
  { key: 'categories',        label: 'Categories',         icon: Tag             },
  { key: 'orders',            label: 'Orders',             icon: ShoppingCart    },
  { key: 'customers',         label: 'Customers',          icon: Users           },
  { key: 'coupons',           label: 'Coupons',            icon: Ticket          },
  { key: 'banners',           label: 'Banners',            icon: Image           },
  { key: 'reviews',           label: 'Reviews',            icon: Star            },
  { key: 'blog',              label: 'Blog',               icon: BookOpen        },
  { key: 'pages',             label: 'Pages',              icon: LayoutTemplate  },
  { key: 'team',              label: 'Team',               icon: UserCog         },
  { key: 'settings',          label: 'Settings',           icon: Settings        },
] as const;

type PermissionKey = typeof PERMISSION_TABS[number]['key'];

interface AdminMember {
  _id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'manager';
  isActive: boolean;
  permissions: PermissionKey[];
  lastLogin?: string;
  createdAt: string;
  mustChangePassword: boolean;
}

const EMPTY_FORM = {
  name: '',
  email: '',
  password: '',
  role: 'manager' as 'super_admin' | 'manager',
  permissions: ['dashboard', 'products', 'orders', 'customers', 'reviews'] as PermissionKey[],
};

const PRESET_GROUPS = {
  'Sales Manager': ['dashboard', 'orders', 'customers', 'coupons', 'reviews'] as PermissionKey[],
  'Content Editor': ['dashboard', 'products', 'product-templates', 'categories', 'banners', 'blog', 'pages'] as PermissionKey[],
  'Operations': ['dashboard', 'products', 'orders', 'customers', 'reviews', 'coupons'] as PermissionKey[],
  'Full Access': PERMISSION_TABS.map(t => t.key) as PermissionKey[],
};

function PermissionBadge({ count, total, role }: { count: number; total: number; role: string }) {
  if (role === 'super_admin') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-semibold">
        <Crown size={10} /> Full Access
      </span>
    );
  }
  const pct = Math.round((count / total) * 100);
  const color = pct >= 80 ? 'text-green-700 bg-green-50 border-green-200'
              : pct >= 40 ? 'text-blue-700 bg-blue-50 border-blue-200'
              : 'text-gray-600 bg-gray-50 border-gray-200';
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 border rounded-full text-xs font-semibold ${color}`}>
      <ShieldCheck size={10} /> {count}/{total} tabs
    </span>
  );
}

export default function AdminTeamPage() {
  const { admin: currentAdmin } = useAuthStore();
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [showPassword, setShowPassword] = useState(false);
  const [expandedPerms, setExpandedPerms] = useState<string | null>(null);
  const [permSaving, setPermSaving] = useState<string | null>(null);
  const [localPerms, setLocalPerms] = useState<Record<string, PermissionKey[]>>({});

  const isSuperAdmin = currentAdmin?.role === 'super_admin';

  const fetchMembers = async () => {
    try {
      const res = await api.get('/admin/auth/list');
      const list: AdminMember[] = res.data.data.admins ?? [];
      setMembers(list);
      // Seed local permission edits
      const permsMap: Record<string, PermissionKey[]> = {};
      list.forEach(m => { permsMap[m._id] = m.permissions ?? []; });
      setLocalPerms(permsMap);
    } catch { setMembers([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMembers(); }, []);

  const reset = () => {
    setForm({ ...EMPTY_FORM }); setEditId(null); setShowForm(false); setShowPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editId) {
        const payload: Partial<typeof form> = { name: form.name, email: form.email, role: form.role, permissions: form.permissions };
        if (form.password) payload.password = form.password;
        await api.put(`/admin/auth/${editId}`, payload);
        toast.success('Admin updated');
      } else {
        await api.post('/admin/auth/create', form);
        toast.success('Admin created & invite sent');
      }
      reset(); fetchMembers();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error saving admin');
    } finally { setSaving(false); }
  };

  const startEdit = (m: AdminMember) => {
    setForm({
      name: m.name, email: m.email, password: '',
      role: m.role, permissions: m.permissions ?? [],
    });
    setEditId(m._id); setShowForm(true);
    setTimeout(() => document.getElementById('team-form')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleToggleStatus = async (m: AdminMember) => {
    try {
      await api.put(`/admin/auth/${m._id}/toggle`);
      toast.success(`${m.name} ${m.isActive ? 'deactivated' : 'activated'}`);
      fetchMembers();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error');
    }
  };

  const handleDelete = async (m: AdminMember) => {
    if (!confirm(`Delete "${m.name}" permanently? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/auth/${m._id}`);
      toast.success('Admin deleted');
      fetchMembers();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error deleting');
    }
  };

  const savePermissions = async (id: string) => {
    setPermSaving(id);
    try {
      await api.put(`/admin/auth/${id}/permissions`, { permissions: localPerms[id] });
      toast.success('Permissions updated');
      fetchMembers();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error');
    } finally { setPermSaving(null); }
  };

  const togglePerm = (id: string, key: PermissionKey) => {
    setLocalPerms(prev => {
      const current = prev[id] ?? [];
      return {
        ...prev,
        [id]: current.includes(key)
          ? current.filter(k => k !== key)
          : [...current, key],
      };
    });
  };

  const applyPreset = (id: string, preset: PermissionKey[]) => {
    setLocalPerms(prev => ({ ...prev, [id]: preset }));
  };

  const toggleFormPerm = (key: PermissionKey) => {
    setForm(f => ({
      ...f,
      permissions: f.permissions.includes(key)
        ? f.permissions.filter(k => k !== key)
        : [...f.permissions, key],
    }));
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <ShieldOff size={48} className="text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">Access Restricted</h2>
        <p className="text-gray-400">Only super admins can manage the team.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold font-heading">Team Management</h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage admin accounts and control which panel sections each person can access
          </p>
        </div>
        <button
          onClick={() => { reset(); setShowForm(true); }}
          className="btn-primary gap-2"
        >
          <Plus size={16} /> Add Admin
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Admins',   value: members.length,                                  icon: Users,      color: 'bg-blue-50 text-blue-600'   },
          { label: 'Super Admins',   value: members.filter(m => m.role === 'super_admin').length, icon: Crown, color: 'bg-amber-50 text-amber-600' },
          { label: 'Managers',       value: members.filter(m => m.role === 'manager').length, icon: Shield,     color: 'bg-purple-50 text-purple-600'},
          { label: 'Active',         value: members.filter(m => m.isActive).length,           icon: ShieldCheck,color: 'bg-green-50 text-green-600'  },
        ].map(stat => (
          <div key={stat.label} className="card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.color}`}>
              <stat.icon size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── ADD / EDIT FORM ── */}
      {showForm && (
        <div id="team-form" className="card p-6 space-y-5">
          <h2 className="font-semibold text-lg">{editId ? 'Edit Admin' : 'Add New Admin'}</h2>
          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="grid md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-xs text-gray-400 mb-1 flex items-center gap-1"><User size={11} /> Full Name *</label>
                <input className="input" placeholder="Jane Smith" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              {/* Email */}
              <div>
                <label className="block text-xs text-gray-400 mb-1 flex items-center gap-1"><Mail size={11} /> Email *</label>
                <input className="input" type="email" placeholder="jane@glomix.com" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              {/* Password */}
              <div>
                <label className="block text-xs text-gray-400 mb-1 flex items-center gap-1">
                  <Key size={11} /> Password {editId ? '(leave blank to keep)' : '*'}
                </label>
                <div className="relative">
                  <input className="input pr-10" type={showPassword ? 'text' : 'password'}
                    placeholder={editId ? '••••••••' : 'Min 8 characters'} value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    required={!editId} minLength={8} />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              {/* Role */}
              <div>
                <label className="block text-xs text-gray-400 mb-1 flex items-center gap-1"><Shield size={11} /> Role *</label>
                <select className="input" value={form.role}
                  onChange={e => {
                    const role = e.target.value as 'super_admin' | 'manager';
                    setForm(f => ({
                      ...f, role,
                      permissions: role === 'super_admin'
                        ? PERMISSION_TABS.map(t => t.key) as PermissionKey[]
                        : f.permissions,
                    }));
                  }}>
                  <option value="manager">Manager</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
            </div>

            {/* Permissions — only for managers */}
            {form.role === 'manager' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-gray-400 font-medium flex items-center gap-1">
                    <Lock size={11} /> Tab Permissions
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(PRESET_GROUPS).map(([name, keys]) => (
                      <button key={name} type="button"
                        onClick={() => setForm(f => ({ ...f, permissions: keys }))}
                        className="text-[11px] px-2.5 py-1 rounded-lg border border-gray-200 hover:bg-gray-100 transition font-medium">
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  {PERMISSION_TABS.map(({ key, label, icon: Icon }) => {
                    const active = form.permissions.includes(key);
                    return (
                      <button key={key} type="button" onClick={() => toggleFormPerm(key)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                          active
                            ? 'bg-white border-gray-800 text-gray-900 shadow-sm'
                            : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600'
                        }`}>
                        {active
                          ? <CheckSquare size={14} className="text-gray-800 flex-shrink-0" />
                          : <Square size={14} className="flex-shrink-0" />
                        }
                        <Icon size={13} className="flex-shrink-0" />
                        <span className="truncate">{label}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  {form.permissions.length} of {PERMISSION_TABS.length} tabs enabled
                </p>
              </div>
            )}

            {form.role === 'super_admin' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 flex items-center gap-2">
                <Crown size={13} /><span>Super admins automatically have access to <strong>all</strong> panel sections.</span>
              </div>
            )}

            <div className="flex gap-3 pt-2 border-t border-gray-100">
              <button type="submit" disabled={saving} className="btn-primary gap-2">
                {saving && <Loader2 size={14} className="animate-spin" />}
                {editId ? 'Update Admin' : 'Create Admin'}
              </button>
              <button type="button" onClick={reset} className="btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* ── TEAM TABLE ── */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-sm text-gray-600">All Admins</h3>
          <button onClick={fetchMembers} className="btn-ghost p-2 text-gray-400" title="Refresh">
            <RefreshCw size={14} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-gray-600" size={28} />
          </div>
        ) : members.length === 0 ? (
          <div className="text-center p-12 text-gray-400">
            <UserCog size={40} className="mx-auto mb-3 opacity-20" />
            <p>No admins found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {members.map(m => {
              const isMe = m._id === (currentAdmin as { _id?: string } | null)?._id || m.email === currentAdmin?.email;
              const perms = localPerms[m._id] ?? m.permissions ?? [];
              const isExpanded = expandedPerms === m._id;
              const isSuperA = m.role === 'super_admin';

              return (
                <div key={m._id} className="p-5">
                  {/* Top row */}
                  <div className="flex items-start gap-4 flex-wrap">
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${
                      isSuperA ? 'bg-amber-500' : 'bg-slate-700'
                    }`}>
                      {m.name[0]?.toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900">{m.name}</span>
                        {isMe && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                            You
                          </span>
                        )}
                        {isSuperA
                          ? <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                              <Crown size={9} /> Super Admin
                            </span>
                          : <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700">
                              <Shield size={9} /> Manager
                            </span>
                        }
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                          m.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'
                        }`}>
                          {m.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {m.mustChangePassword && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 font-medium">
                            Must change password
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mt-0.5">{m.email}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <PermissionBadge count={isSuperA ? PERMISSION_TABS.length : perms.length} total={PERMISSION_TABS.length} role={m.role} />
                        {m.lastLogin && (
                          <span className="text-xs text-gray-400">
                            Last login: {new Date(m.lastLogin).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {!isMe && (
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button onClick={() => startEdit(m)} className="btn-ghost p-2 text-gray-500" title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(m)}
                          className={`btn-ghost p-2 ${m.isActive ? 'text-orange-400 hover:text-orange-600' : 'text-green-500 hover:text-green-700'}`}
                          title={m.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {m.isActive ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                        </button>
                        <button onClick={() => handleDelete(m)} className="btn-ghost p-2 text-red-400 hover:text-red-600" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Permissions panel (managers only) */}
                  {!isSuperA && (
                    <div className="mt-4">
                      <button
                        onClick={() => setExpandedPerms(isExpanded ? null : m._id)}
                        className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 transition"
                      >
                        <Lock size={11} />
                        {isExpanded ? 'Hide' : 'Manage'} Tab Permissions
                        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>

                      {isExpanded && (
                        <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                          {/* Preset quick-selects */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-gray-400 mr-1">Presets:</span>
                            {Object.entries(PRESET_GROUPS).map(([name, keys]) => (
                              <button key={name} type="button"
                                onClick={() => applyPreset(m._id, keys)}
                                className="text-[11px] px-2.5 py-1 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 transition font-medium">
                                {name}
                              </button>
                            ))}
                          </div>

                          {/* Permission checkboxes */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2">
                            {PERMISSION_TABS.map(({ key, label, icon: Icon }) => {
                              const active = perms.includes(key);
                              return (
                                <button key={key} type="button" onClick={() => togglePerm(m._id, key)}
                                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all text-left ${
                                    active
                                      ? 'bg-white border-gray-800 text-gray-900 shadow-sm'
                                      : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600'
                                  }`}>
                                  {active
                                    ? <CheckSquare size={13} className="text-gray-800 flex-shrink-0" />
                                    : <Square size={13} className="flex-shrink-0" />
                                  }
                                  <Icon size={12} className="flex-shrink-0" />
                                  <span className="truncate">{label}</span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Save bar */}
                          <div className="flex items-center gap-3 pt-1">
                            <button
                              onClick={() => savePermissions(m._id)}
                              disabled={permSaving === m._id}
                              className="btn-primary gap-2 text-sm px-4 py-2"
                            >
                              {permSaving === m._id
                                ? <Loader2 size={13} className="animate-spin" />
                                : <ShieldCheck size={13} />
                              }
                              Save Permissions
                            </button>
                            <button
                              onClick={() => {
                                setLocalPerms(prev => ({ ...prev, [m._id]: m.permissions ?? [] }));
                              }}
                              className="btn-outline text-sm px-4 py-2"
                            >
                              Reset
                            </button>
                            <span className="text-xs text-gray-400 ml-auto">
                              {perms.length} of {PERMISSION_TABS.length} selected
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="card p-4">
        <h4 className="text-sm font-semibold text-gray-600 mb-3">ℹ️ How Permissions Work</h4>
        <div className="grid sm:grid-cols-2 gap-3 text-xs text-gray-500">
          <div className="flex items-start gap-2">
            <Crown size={13} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <span><strong>Super Admin</strong> — Has unrestricted access to all sections. Cannot be permission-limited.</span>
          </div>
          <div className="flex items-start gap-2">
            <Shield size={13} className="text-purple-500 mt-0.5 flex-shrink-0" />
            <span><strong>Manager</strong> — Can only access the tabs you specifically grant. Ideal for staff with limited roles.</span>
          </div>
          <div className="flex items-start gap-2">
            <ShieldOff size={13} className="text-red-400 mt-0.5 flex-shrink-0" />
            <span><strong>Inactive</strong> — Cannot log in at all, even if they have valid credentials.</span>
          </div>
          <div className="flex items-start gap-2">
            <Key size={13} className="text-orange-400 mt-0.5 flex-shrink-0" />
            <span><strong>Must Change Password</strong> — Set automatically for new accounts; cleared after first login.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
