'use client';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, Trash2, GripVertical, ChevronDown } from 'lucide-react';
import { apiGet, apiPost, apiPut } from '../../../../lib/api';
import toast from 'react-hot-toast';
import { cn } from '../../../../lib/utils';

type FieldType = 'text' | 'textarea' | 'number' | 'select' | 'multiselect' | 'boolean' | 'tags';

interface TemplateField {
  key: string;
  label: string;
  type: FieldType;
  options: string[];
  placeholder: string;
  unit: string;
  helpText: string;
  required: boolean;
  order: number;
}

const FIELD_TYPE_LABELS: Record<FieldType, { label: string; desc: string }> = {
  text:        { label: 'Text',         desc: 'Single line input' },
  textarea:    { label: 'Paragraph',    desc: 'Multi-line text' },
  number:      { label: 'Number',       desc: 'Numeric value with optional unit' },
  select:      { label: 'Dropdown',     desc: 'Pick one option' },
  multiselect: { label: 'Multi-select', desc: 'Pick multiple options' },
  boolean:     { label: 'Yes/No',       desc: 'Toggle on/off' },
  tags:        { label: 'Tags',         desc: 'Add multiple text tags' },
};

const EMPTY_FIELD = (): TemplateField => ({
  key: '', label: '', type: 'text', options: [], placeholder: '', unit: '', helpText: '', required: false, order: 0,
});

export default function TemplateEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const isNew = id === 'new';

  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📦');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<TemplateField[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!isNew) {
      apiGet<{ name: string; emoji: string; description: string; fields: TemplateField[] }>(`/admin/product-templates/${id}`)
        .then(t => {
          setName(t.name);
          setEmoji(t.emoji || '📦');
          setDescription(t.description || '');
          setFields(t.fields || []);
        })
        .finally(() => setLoading(false));
    }
  }, [id, isNew]);

  const addField = () => {
    const f = EMPTY_FIELD();
    f.order = fields.length;
    setFields(prev => [...prev, f]);
    setExpandedIdx(fields.length);
  };

  const removeField = (i: number) => {
    setFields(prev => prev.filter((_, idx) => idx !== i));
    setExpandedIdx(null);
  };

  const updateField = <K extends keyof TemplateField>(i: number, key: K, val: TemplateField[K]) =>
    setFields(prev => prev.map((f, idx) => idx === i ? { ...f, [key]: val } : f));

  const autoKey = (i: number, label: string) => {
    const key = label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');
    updateField(i, 'key', key);
  };

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Template name is required'); return; }
    for (const f of fields) {
      if (!f.label.trim()) { toast.error('All fields must have a label'); return; }
      if (!f.key.trim()) { toast.error('All fields must have a key (auto-generated from label)'); return; }
    }
    setSaving(true);
    try {
      const payload = { name, emoji, description, fields: fields.map((f, i) => ({ ...f, order: i })) };
      if (isNew) {
        await apiPost('/admin/product-templates', payload);
        toast.success('Template created!');
        router.replace('/admin/product-templates');
      } else {
        await apiPut(`/admin/product-templates/${id}`, payload);
        toast.success('Template saved!');
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Failed to save');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 rounded-full border-2 border-gray-700 border-t-transparent animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/product-templates" className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-all">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="font-heading text-xl font-bold">{isNew ? 'New Template' : `Edit: ${name}`}</h1>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary gap-2 disabled:opacity-60">
          <Save size={15} /> {saving ? 'Saving...' : 'Save Template'}
        </button>
      </div>

      {/* Template meta */}
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-sm uppercase tracking-wider text-gray-400">Template Info</h2>
        <div className="flex items-center gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Emoji</label>
            <input
              type="text"
              value={emoji}
              onChange={e => setEmoji(e.target.value)}
              className="input w-16 text-center text-2xl"
              maxLength={4}
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Template Name *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="input" placeholder="e.g. Soap & Cleanser" />
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Description</label>
          <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="input" placeholder="e.g. Bar soaps, liquid soaps, face washes..." />
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-gray-400">
            Custom Fields ({fields.length})
          </h2>
          <button onClick={addField} className="btn-primary py-2 px-3 text-sm gap-1.5">
            <Plus size={14} /> Add Field
          </button>
        </div>

        {fields.length === 0 && (
          <div className="card p-10 text-center border-dashed">
            <p className="text-gray-400 text-sm">No fields yet. Click "Add Field" to define what data to collect for this product type.</p>
          </div>
        )}

        {fields.map((field, i) => (
          <div key={i} className="card overflow-hidden">
            {/* Field header */}
            <div
              role="button"
              tabIndex={0}
              className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
              onKeyDown={e => e.key === 'Enter' && setExpandedIdx(expandedIdx === i ? null : i)}
            >
              <GripVertical size={16} className="text-gray-300 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm truncate">{field.label || '(untitled field)'}</p>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full shrink-0">
                    {FIELD_TYPE_LABELS[field.type].label}
                  </span>
                  {field.required && <span className="text-xs text-red-500 shrink-0">Required</span>}
                </div>
                {field.key && <p className="text-xs text-gray-400 font-mono mt-0.5">key: {field.key}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={e => { e.stopPropagation(); removeField(i); }}
                  className="p-1.5 rounded text-red-400 hover:bg-red-50 transition-all"
                >
                  <Trash2 size={13} />
                </button>
                <ChevronDown size={16} className={cn('text-gray-400 transition-transform', expandedIdx === i ? 'rotate-180' : '')} />
              </div>
            </div>

            {/* Field details */}
            {expandedIdx === i && (
              <div className="px-5 pb-5 space-y-4 border-t border-gray-50">
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Field Label *</label>
                    <input
                      type="text"
                      value={field.label}
                      onChange={e => {
                        updateField(i, 'label', e.target.value);
                        if (!field.key || field.key === autoKey(i, field.label) || true) autoKey(i, e.target.value);
                      }}
                      className="input text-sm"
                      placeholder="e.g. Net Weight"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Storage Key *</label>
                    <input
                      type="text"
                      value={field.key}
                      onChange={e => updateField(i, 'key', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
                      className="input text-sm font-mono"
                      placeholder="net_weight"
                    />
                    <p className="text-xs text-gray-400 mt-0.5">Auto-generated from label</p>
                  </div>
                </div>

                {/* Field type selector */}
                <div>
                  <label className="block text-xs text-gray-500 mb-2">Field Type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(Object.entries(FIELD_TYPE_LABELS) as [FieldType, { label: string; desc: string }][]).map(([type, info]) => (
                      <button
                        key={type}
                        onClick={() => updateField(i, 'type', type)}
                        className={cn(
                          'p-2.5 rounded-xl border-2 text-left transition-all',
                          field.type === type ? 'border-gray-800 bg-gray-50' : 'border-gray-100 hover:border-gray-200'
                        )}
                      >
                        <p className="text-xs font-semibold">{info.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5 leading-tight">{info.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Options for select/multiselect */}
                {(field.type === 'select' || field.type === 'multiselect') && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Options <span className="text-gray-400">(one per line)</span>
                    </label>
                    <textarea
                      rows={4}
                      value={field.options.join('\n')}
                      onChange={e => updateField(i, 'options', e.target.value.split('\n').filter(Boolean))}
                      className="input text-sm font-mono resize-none"
                      placeholder={`Option 1\nOption 2\nOption 3`}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Placeholder</label>
                    <input type="text" value={field.placeholder} onChange={e => updateField(i, 'placeholder', e.target.value)} className="input text-sm" placeholder="e.g. Enter value..." />
                  </div>
                  {field.type === 'number' && (
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Unit</label>
                      <input type="text" value={field.unit} onChange={e => updateField(i, 'unit', e.target.value)} className="input text-sm" placeholder="e.g. grams, ml, SPF" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Help Text (shown under field)</label>
                  <input type="text" value={field.helpText} onChange={e => updateField(i, 'helpText', e.target.value)} className="input text-sm" placeholder="Short hint for the admin entering data" />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={field.required} onChange={e => updateField(i, 'required', e.target.checked)} className="w-4 h-4 rounded border-gray-300" />
                  <span className="text-sm text-gray-700">Required field</span>
                </label>
              </div>
            )}
          </div>
        ))}

        {fields.length > 0 && (
          <button onClick={addField} className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-all flex items-center justify-center gap-2">
            <Plus size={15} /> Add Another Field
          </button>
        )}
      </div>
    </div>
  );
}
