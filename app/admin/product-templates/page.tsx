'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, Layers, Download, Tag } from 'lucide-react';
import { apiGet, apiPost, apiDelete } from '../../../lib/api';
import toast from 'react-hot-toast';

interface Template {
  _id: string;
  name: string;
  emoji: string;
  description: string;
  fields: { key: string }[];
  isDefault: boolean;
}

export default function ProductTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const router = useRouter();

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiGet<Template[]>('/admin/product-templates');
      setTemplates(Array.isArray(data) ? data : []);
    } catch { toast.error('Failed to load templates'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSeedDefaults = async () => {
    setSeeding(true);
    try {
      await apiPost('/admin/product-templates/seed', {});
      toast.success('Default templates installed!');
      load();
    } catch { toast.error('Failed to seed templates'); }
    finally { setSeeding(false); }
  };

  const handleDelete = async (id: string, name: string, isDefault: boolean) => {
    const warningMsg = isDefault
      ? `"${name}" is a built-in template. Deleting it will NOT affect existing products that used it.\n\nYou can re-install it anytime via "Install Default Templates".\n\nDelete anyway?`
      : `Delete template "${name}"? This cannot be undone.`;
    if (!confirm(warningMsg)) return;
    try {
      await apiDelete(`/admin/product-templates/${id}`);
      toast.success('Template deleted');
      load();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
            <Layers size={22} /> Product Templates
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Define field sets per product type — Soap, Serum, Shirt, etc. When creating a product, pick a template and only relevant fields appear.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {templates.length === 0 && (
            <button
              onClick={handleSeedDefaults}
              disabled={seeding}
              className="btn-outline gap-2 text-sm disabled:opacity-60"
            >
              <Download size={15} />
              {seeding ? 'Installing...' : 'Install Default Templates'}
            </button>
          )}
          <Link href="/admin/product-templates/new" className="btn-primary gap-2">
            <Plus size={16} /> New Template
          </Link>
        </div>
      </div>

      {/* No templates yet */}
      {!loading && templates.length === 0 && (
        <div className="card p-16 text-center">
          <Layers size={40} className="mx-auto text-gray-300 mb-4" />
          <h3 className="font-semibold text-lg mb-2">No templates yet</h3>
          <p className="text-gray-400 text-sm mb-6">
            Install the built-in templates (Soap, Serum, Cream, Clothing, Hair Care) or create your own.
          </p>
          <button onClick={handleSeedDefaults} disabled={seeding} className="btn-primary gap-2 inline-flex disabled:opacity-60">
            <Download size={16} />
            {seeding ? 'Installing...' : 'Install Default Templates'}
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-gray-700 border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(t => (
            <div key={t._id} className="card p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl border border-gray-100">
                    {t.emoji}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    {t.isDefault && (
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Built-in</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Link
                    href={`/admin/product-templates/${t._id}`}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
                    title="Edit template"
                  >
                    <Pencil size={14} />
                  </Link>
                  <button
                    onClick={() => handleDelete(t._id, t.name, t.isDefault)}
                    className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition-all"
                    title={t.isDefault ? 'Delete built-in template' : 'Delete template'}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {t.description && (
                <p className="text-xs text-gray-400 leading-relaxed">{t.description}</p>
              )}

              <div className="flex items-center gap-1 flex-wrap">
                <Tag size={11} className="text-gray-300" />
                <span className="text-xs text-gray-500">{t.fields.length} fields</span>
                {t.fields.slice(0, 4).map(f => (
                  <span key={f.key} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                    {f.key}
                  </span>
                ))}
                {t.fields.length > 4 && (
                  <span className="text-xs text-gray-400">+{t.fields.length - 4} more</span>
                )}
              </div>

              <button
                onClick={() => router.push(`/admin/products/new?template=${t._id}`)}
                className="w-full text-center text-xs py-2 rounded-lg border border-dashed border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-all mt-auto"
              >
                + Create {t.name} Product
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
