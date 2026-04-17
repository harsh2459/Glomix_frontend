'use client';
import { useEffect, useState } from 'react';
import { Settings, Save, Globe, DollarSign, AlertTriangle } from 'lucide-react';
import { apiGet, apiPut } from '../../../../lib/api';
import { ISiteSettings } from '../../../../types';
import toast from 'react-hot-toast';
import ImageUpload from '../../../../components/ui/ImageUpload';

interface GeneralForm {
  siteName: string;
  logo: string;
  favicon: string;
  currency: string;
  currencySymbol: string;
  maintenanceMode: boolean;
  customHeadScripts: string;
}

export default function AdminGeneralSettingsPage() {
  const [form, setForm] = useState<GeneralForm>({
    siteName: '',
    logo: '',
    favicon: '',
    currency: 'INR',
    currencySymbol: '₹',
    maintenanceMode: false,
    customHeadScripts: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [original, setOriginal] = useState<GeneralForm | null>(null);

  useEffect(() => {
    apiGet<ISiteSettings>('/settings').then((s) => {
      const f: GeneralForm = {
        siteName: s?.siteName ?? '',
        logo: s?.logo ?? '',
        favicon: s?.favicon ?? '',
        currency: s?.currency ?? 'INR',
        currencySymbol: s?.currencySymbol ?? '₹',
        maintenanceMode: s?.maintenanceMode ?? false,
        customHeadScripts: s?.customHeadScripts ?? '',
      };
      setForm(f);
      setOriginal(f);
    }).finally(() => setLoading(false));
  }, []);

  const set = (key: keyof GeneralForm, value: string | boolean) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiPut('/admin/settings/general', form);
      setOriginal(form);
      toast.success('General settings saved!');
    } catch { toast.error('Failed to save settings'); }
    finally { setSaving(false); }
  };

  const hasChanges = JSON.stringify(form) !== JSON.stringify(original);

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 border-gray-700 border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
          <Settings size={22} /> General Settings
        </h1>
        <p className="text-gray-400 text-sm mt-1">Site name, logo, currency, and global configuration</p>
      </div>

      {/* Brand */}
      <div className="card p-6 space-y-5">
        <h2 className="font-semibold text-sm uppercase tracking-wider text-gray-400 flex items-center gap-2">
          <Globe size={15} /> Brand Identity
        </h2>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Site Name</label>
          <input
            id="general-sitename"
            type="text"
            value={form.siteName}
            onChange={e => set('siteName', e.target.value)}
            className="input"
            placeholder="Glomix"
          />
          <p className="text-xs text-gray-500 mt-1">Appears in browser tab, emails, and footer</p>
        </div>
        <ImageUpload
          label="Site Logo"
          hint="Recommended: 300×80px PNG/SVG"
          aspect="aspect-[300/80]"
          value={form.logo}
          onChange={url => set('logo', url)}
        />
        <ImageUpload
          label="Favicon"
          hint="32×32px .ico or .png"
          aspect="aspect-square"
          value={form.favicon}
          onChange={url => set('favicon', url)}
          className="max-w-[160px]"
        />
      </div>

      {/* Currency */}
      <div className="card p-6 space-y-5">
        <h2 className="font-semibold text-sm uppercase tracking-wider text-gray-400 flex items-center gap-2">
          <DollarSign size={15} /> Currency
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Currency Code</label>
            <input
              id="general-currency"
              type="text"
              value={form.currency}
              onChange={e => set('currency', e.target.value.toUpperCase())}
              className="input font-mono"
              maxLength={3}
              placeholder="INR"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Currency Symbol</label>
            <input
              id="general-currency-symbol"
              type="text"
              value={form.currencySymbol}
              onChange={e => set('currencySymbol', e.target.value)}
              className="input"
              maxLength={3}
              placeholder="₹"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500">Used to format prices across the entire storefront (e.g. ₹499)</p>
      </div>

      {/* Maintenance Mode */}
      <div className="card p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className={form.maintenanceMode ? 'text-yellow-400 shrink-0 mt-0.5' : 'text-gray-400 shrink-0 mt-0.5'} />
            <div>
              <p className="font-medium text-sm">Maintenance Mode</p>
              <p className="text-xs text-gray-400 mt-0.5">
                When enabled, visitors see a &quot;coming soon&quot; page. Admin panel stays accessible.
              </p>
            </div>
          </div>
          <button
            id="general-maintenance-toggle"
            onClick={() => set('maintenanceMode', !form.maintenanceMode)}
            className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${form.maintenanceMode ? 'bg-yellow-500' : 'bg-gray-200'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>
        {form.maintenanceMode && (
          <div className="mt-3 px-3 py-2 rounded-lg bg-yellow-50 border border-yellow-100 text-xs text-yellow-700">
            ⚠️ Your store is currently in maintenance mode. Customers cannot browse or purchase.
          </div>
        )}
      </div>

      {/* Custom Scripts */}
      <div className="card p-6 space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Custom &lt;head&gt; Scripts</label>
          <p className="text-xs text-gray-500 mb-2">Inject analytics, pixel, or tracking scripts (Google Analytics, Facebook Pixel, etc.)</p>
          <textarea
            id="general-scripts"
            rows={5}
            value={form.customHeadScripts}
            onChange={e => set('customHeadScripts', e.target.value)}
            className="input font-mono text-xs resize-none"
            placeholder={'<!-- Google Analytics -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXX"></script>'}
          />
        </div>
      </div>

      <button
        id="general-save-btn"
        onClick={handleSave}
        disabled={saving || !hasChanges}
        className="btn-primary gap-2 disabled:opacity-60"
      >
        <Save size={16} />
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
}
