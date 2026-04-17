'use client';
import { useEffect, useState } from 'react';
import {
  Cloud, CreditCard, Zap, CheckCircle, XCircle, Eye, EyeOff,
  Save, RefreshCw, ExternalLink, AlertCircle, Info, Image as ImageIcon
} from 'lucide-react';
import { apiGet, apiPut, apiPost } from '../../../../lib/api';
import toast from 'react-hot-toast';
import { cn } from '../../../../lib/utils';

interface IntegrationData {
  r2: {
    accountId: string; accessKeyId: string; secretAccessKey: string;
    bucket: string; publicUrl: string; region: string;
    enabled: boolean; hasSecret: boolean;
  };
  razorpay: {
    keyId: string; keySecret: string; webhookSecret: string;
    testMode: boolean; enabled: boolean; hasSecret: boolean;
  };
  cloudinary: {
    cloudName: string; apiKey: string; apiSecret: string;
    enabled: boolean; hasSecret: boolean;
  };
}

function SecretInput({ label, value, onChange, placeholder, hint }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; hint?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="input pr-10 font-mono text-sm"
          placeholder={placeholder}
        />
        <button type="button" onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  );
}

function StatusBadge({ enabled, hasSecret }: { enabled: boolean; hasSecret: boolean }) {
  if (enabled && hasSecret) return (
    <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
      <CheckCircle size={12} /> Connected
    </span>
  );
  if (hasSecret) return (
    <span className="flex items-center gap-1.5 text-xs font-semibold text-yellow-700 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
      <AlertCircle size={12} /> Disabled
    </span>
  );
  return (
    <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
      <XCircle size={12} /> Not configured
    </span>
  );
}

function Toggle({ on, onChange, color = 'bg-blue-600' }: { on: boolean; onChange: () => void; color?: string }) {
  return (
    <button onClick={onChange} className={cn('relative w-11 h-6 rounded-full transition-colors', on ? color : 'bg-gray-200')}>
      <span className={cn('absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform', on ? 'translate-x-5' : '')} />
    </button>
  );
}

export default function IntegrationsPage() {
  const [data, setData] = useState<IntegrationData>({
    r2: { accountId: '', accessKeyId: '', secretAccessKey: '', bucket: '', publicUrl: '', region: 'auto', enabled: false, hasSecret: false },
    razorpay: { keyId: '', keySecret: '', webhookSecret: '', testMode: true, enabled: false, hasSecret: false },
    cloudinary: { cloudName: '', apiKey: '', apiSecret: '', enabled: false, hasSecret: false },
  });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<'r2' | 'razorpay' | null>(null);
  const [testResult, setTestResult] = useState<{ service: string; success: boolean; message: string } | null>(null);

  const [activeTab, setActiveTab] = useState<'r2' | 'razorpay' | 'cloudinary'>('r2');

  useEffect(() => {
    apiGet<IntegrationData>('/admin/settings/integrations')
      .then(d => setData(d))
      .catch(() => toast.error('Failed to load integrations'));
  }, []);

  const setR2 = (k: keyof IntegrationData['r2'], v: unknown) =>
    setData(p => ({ ...p, r2: { ...p.r2, [k]: v } }));
  const setRZ = (k: keyof IntegrationData['razorpay'], v: unknown) =>
    setData(p => ({ ...p, razorpay: { ...p.razorpay, [k]: v } }));
  const setCloud = (k: keyof IntegrationData['cloudinary'], v: unknown) =>
    setData(p => ({ ...p, cloudinary: { ...p.cloudinary, [k]: v } }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiPut('/admin/settings/integrations', { r2: data.r2, razorpay: data.razorpay, cloudinary: data.cloudinary });
      toast.success('Integration settings saved!');
      const fresh = await apiGet<IntegrationData>('/admin/settings/integrations');
      setData(fresh);
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const handleTest = async (service: 'r2' | 'razorpay') => {
    setTesting(service);
    setTestResult(null);
    try {
      const endpoint = service === 'r2' ? '/admin/settings/integrations/test-r2' : '/admin/settings/integrations/test-razorpay';
      const res = await apiPost<{ success: boolean; message: string }>(endpoint, {});
      setTestResult({ service, ...res });
      toast[res.success ? 'success' : 'error'](res.message);
    } catch { toast.error('Test failed'); }
    finally { setTesting(null); }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
            <Zap size={22} /> Integrations
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Set up your external services here. Don't worry, API secrets are hidden once saved.
          </p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary gap-2 disabled:opacity-60">
          <Save size={15} /> {saving ? 'Saving...' : 'Save All'}
        </button>
      </div>

      {/* Options Navigation */}
      <div className="flex border-b border-gray-200 gap-1 pb-px">
        <button
          onClick={() => setActiveTab('r2')}
          className={cn('px-4 py-2.5 text-sm font-semibold border-b-2 transition-all', activeTab === 'r2' ? 'border-gray-800 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700')}
        >
          ☁️ Cloudflare R2
        </button>
        <button
          onClick={() => setActiveTab('razorpay')}
          className={cn('px-4 py-2.5 text-sm font-semibold border-b-2 transition-all', activeTab === 'razorpay' ? 'border-gray-800 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700')}
        >
          💳 Razorpay
        </button>
        <button
          onClick={() => setActiveTab('cloudinary')}
          className={cn('px-4 py-2.5 text-sm font-semibold border-b-2 transition-all', activeTab === 'cloudinary' ? 'border-gray-800 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700')}
        >
          🖼️ Cloudinary (Fallback)
        </button>
      </div>

      {/* ━━ R2 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {activeTab === 'r2' && (
      <div className="card p-6 space-y-5 animate-in fade-in duration-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
              <Cloud size={20} className="text-orange-500" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Cloudflare R2 Storage</h2>
              <p className="text-xs text-gray-600">Store product images, banners, and all uploads</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <StatusBadge enabled={data.r2.enabled} hasSecret={data.r2.hasSecret} />
            <Toggle on={data.r2.enabled} onChange={() => setR2('enabled', !data.r2.enabled)} color="bg-orange-500" />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex gap-2 text-xs text-blue-700">
          <Info size={14} className="shrink-0 mt-0.5 text-blue-500" />
          <div>
            <strong>Need your Cloudflare credentials? Here's how to get them:</strong>
            <ol className="mt-1 space-y-0.5 list-decimal list-inside">
              <li>Go to <a href="https://dash.cloudflare.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">dash.cloudflare.com</a> → R2 Object Storage</li>
              <li>Create or select your bucket (e.g. <code className="bg-blue-100 px-1 rounded">glomix-images</code>)</li>
              <li>Click <strong>Manage R2 API Tokens</strong> → Create API Token</li>
              <li>Copy the <strong>Account ID</strong> from the right sidebar of your dashboard</li>
            </ol>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Account ID *</label>
            <input type="text" value={data.r2.accountId} onChange={e => setR2('accountId', e.target.value)}
              className="input font-mono text-sm" placeholder="abc123def456..." />
            <p className="text-xs text-gray-500 mt-1">From Cloudflare dashboard sidebar</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bucket Name *</label>
            <input type="text" value={data.r2.bucket} onChange={e => setR2('bucket', e.target.value)}
              className="input font-mono text-sm" placeholder="glomix-images" />
            <p className="text-xs text-gray-500 mt-1">Lowercase, no spaces</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Access Key ID *</label>
            <input type="text" value={data.r2.accessKeyId} onChange={e => setR2('accessKeyId', e.target.value)}
              className="input font-mono text-sm" placeholder="R2 API Token Access Key" />
          </div>
          <SecretInput label="Secret Access Key *" value={data.r2.secretAccessKey}
            onChange={v => setR2('secretAccessKey', v)}
            placeholder={data.r2.hasSecret ? '••••••••(saved — enter to update)' : 'R2 API Token Secret'}
            hint="Masked after save. RE-enter to update." />
          <div className="col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Public URL <span className="text-gray-400 font-normal">(Custom domain or R2 public URL)</span>
            </label>
            <input type="url" value={data.r2.publicUrl} onChange={e => setR2('publicUrl', e.target.value)}
              className="input font-mono text-sm" placeholder="https://images.yourdomain.com" />
            <p className="text-xs text-gray-500 mt-1">
              Leave blank to auto-use: <code className="bg-gray-100 px-1 rounded">{`https://${data.r2.accountId || '{accountId}'}.r2.cloudflarestorage.com`}</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
          <button onClick={() => handleTest('r2')} disabled={testing === 'r2'}
            className="btn-outline gap-2 text-sm py-2 px-4 disabled:opacity-60">
            <RefreshCw size={14} className={testing === 'r2' ? 'animate-spin' : ''} />
            {testing === 'r2' ? 'Testing...' : 'Test Connection'}
          </button>
          {testResult?.service === 'r2' && (
            <span className={cn('flex items-center gap-1.5 text-sm font-medium', testResult.success ? 'text-green-600' : 'text-red-500')}>
              {testResult.success ? <CheckCircle size={14} /> : <XCircle size={14} />}
              {testResult.message}
            </span>
          )}
          <a href="https://developers.cloudflare.com/r2/" target="_blank" rel="noopener noreferrer"
            className="ml-auto text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
            R2 Docs <ExternalLink size={11} />
          </a>
        </div>
      </div>
      )}

      {/* ━━ Razorpay ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {activeTab === 'razorpay' && (
      <div className="card p-6 space-y-5 animate-in fade-in duration-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <CreditCard size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Razorpay Payments</h2>
              <p className="text-xs text-gray-600">Accept UPI, cards, netbanking, and wallets</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <StatusBadge enabled={data.razorpay.enabled} hasSecret={data.razorpay.hasSecret} />
            <Toggle on={data.razorpay.enabled} onChange={() => setRZ('enabled', !data.razorpay.enabled)} color="bg-blue-600" />
          </div>
        </div>

        {/* Test/Live mode banner */}
        <div className={cn('rounded-xl p-3 border flex items-center gap-3', data.razorpay.testMode ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200')}>
          <AlertCircle size={16} className={cn('shrink-0', data.razorpay.testMode ? 'text-yellow-600' : 'text-green-600')} />
          <div className="flex-1 min-w-0">
            <p className={cn('text-xs font-bold', data.razorpay.testMode ? 'text-yellow-800' : 'text-green-800')}>
              {data.razorpay.testMode ? '🧪 Test Mode — No real payments' : '🔴 Live Mode — Real transactions'}
            </p>
            <p className={cn('text-xs mt-0.5', data.razorpay.testMode ? 'text-yellow-700' : 'text-green-700')}>
              Use Key ID starting with <code className="font-mono">{data.razorpay.testMode ? 'rzp_test_' : 'rzp_live_'}</code>
            </p>
          </div>
          <button onClick={() => setRZ('testMode', !data.razorpay.testMode)}
            className={cn('text-xs font-semibold px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0',
              data.razorpay.testMode ? 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300' : 'bg-green-200 text-green-800 hover:bg-green-300')}>
            Switch to {data.razorpay.testMode ? 'Live Mode' : 'Test Mode'}
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex gap-2 text-xs text-blue-700">
          <Info size={14} className="shrink-0 mt-0.5 text-blue-500" />
          <span>
            <strong>Get your Razorpay keys</strong> from <a href="https://dashboard.razorpay.com/app/keys" target="_blank" rel="noopener noreferrer" className="underline font-medium">dashboard.razorpay.com → Settings → API Keys</a>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Key ID *</label>
            <input type="text" value={data.razorpay.keyId} onChange={e => setRZ('keyId', e.target.value)}
              className="input font-mono text-sm"
              placeholder={data.razorpay.testMode ? 'rzp_test_XXXXXXXXXX' : 'rzp_live_XXXXXXXXXX'} />
            <p className="text-xs text-gray-500 mt-1">Public key — safe to use in frontend</p>
          </div>
          <SecretInput label="Key Secret *" value={data.razorpay.keySecret}
            onChange={v => setRZ('keySecret', v)}
            placeholder={data.razorpay.hasSecret ? '••••••••(saved — enter to update)' : 'Razorpay Secret Key'}
            hint="Never exposed to frontend. Used for HMAC signature verification." />
          <div className="col-span-2">
            <SecretInput label="Webhook Secret (optional)" value={data.razorpay.webhookSecret}
              onChange={v => setRZ('webhookSecret', v)}
              placeholder={data.razorpay.hasSecret ? '••••(saved)' : 'Webhook signing secret'}
              hint="Set this if you configure webhooks in Razorpay dashboard for payment event notifications" />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
          <button onClick={() => handleTest('razorpay')} disabled={testing === 'razorpay'}
            className="btn-outline gap-2 text-sm py-2 px-4 disabled:opacity-60">
            <RefreshCw size={14} className={testing === 'razorpay' ? 'animate-spin' : ''} />
            {testing === 'razorpay' ? 'Testing...' : 'Test Connection'}
          </button>
          {testResult?.service === 'razorpay' && (
            <span className={cn('flex items-center gap-1.5 text-sm font-medium', testResult.success ? 'text-green-600' : 'text-red-500')}>
              {testResult.success ? <CheckCircle size={14} /> : <XCircle size={14} />}
              {testResult.message}
            </span>
          )}
          <a href="https://razorpay.com/docs/" target="_blank" rel="noopener noreferrer"
            className="ml-auto text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
            Razorpay Docs <ExternalLink size={11} />
          </a>
        </div>
      </div>
      )}

      {/* ━━ Cloudinary ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {activeTab === 'cloudinary' && (
      <div className="card p-6 space-y-5 animate-in fade-in duration-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
              <ImageIcon size={20} className="text-purple-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Cloudinary (Fallback)</h2>
              <p className="text-xs text-gray-600">Used only if R2 is disabled — existing .env values are still respected</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <StatusBadge enabled={data.cloudinary.enabled} hasSecret={data.cloudinary.hasSecret} />
            <Toggle on={data.cloudinary.enabled} onChange={() => setCloud('enabled', !data.cloudinary.enabled)} color="bg-purple-600" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cloud Name</label>
            <input type="text" value={data.cloudinary.cloudName} onChange={e => setCloud('cloudName', e.target.value)}
              className="input text-sm" placeholder="your-cloud-name" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">API Key</label>
            <input type="text" value={data.cloudinary.apiKey} onChange={e => setCloud('apiKey', e.target.value)}
              className="input font-mono text-sm" placeholder="123456789..." />
          </div>
          <SecretInput label="API Secret" value={data.cloudinary.apiSecret}
            onChange={v => setCloud('apiSecret', v)}
            placeholder={data.cloudinary.hasSecret ? '••••(saved)' : 'API Secret'} />
        </div>
      </div>
      )}

      <div className="flex justify-end pb-6">
        <button onClick={handleSave} disabled={saving} className="btn-primary gap-2 disabled:opacity-60">
          <Save size={15} /> {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>
    </div>
  );
}
