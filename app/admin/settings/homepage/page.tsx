'use client';

import { useState, useEffect } from 'react';
import api, { apiGet } from '../../../../lib/api';
import toast from 'react-hot-toast';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Loader2, GripVertical, Check, Eye, EyeOff, LayoutTemplate,
  Layers, ImagePlay, LayoutGrid, Puzzle, Image as ImageIcon,
  Grid3x3, BookOpen, Video, Code, Plus, X, PanelRightClose,
  Trash2, MoveUp, MoveDown, MessageSquare, FileText, Sparkles
} from 'lucide-react';
import ImageUpload from '../../../../components/ui/ImageUpload';

interface HomepageSection {
  id: string;
  type?: string;
  name: string;
  isEnabled: boolean;
  order: number;
  config?: any;
}

interface SiteSettingsResponse {
  homepageSections?: HomepageSection[];
}

const SECTION_TYPES = [
  { type: 'Hero Banner', icon: LayoutTemplate },
  { type: 'Hero Slider', icon: Layers },
  { type: 'Image Slider', icon: ImagePlay },
  { type: 'Announcement Bar', icon: MessageSquare },
  { type: 'USP Strip', icon: Sparkles },
  { type: 'Staggered Wall', icon: LayoutGrid },
  { type: 'Puzzle Game', icon: Puzzle },
  { type: 'Promo Banner', icon: ImageIcon },
  { type: 'Product Grid', icon: Grid3x3 },
  { type: 'Category Browser', icon: BookOpen },
  { type: 'Video Showcase', icon: Video },
  { type: 'Testimonial Slider', icon: MessageSquare },
  { type: 'Blog Section', icon: FileText },
  { type: 'Custom HTML', icon: Code },
];

function generateId() {
  return `sec_${Math.random().toString(36).substring(2, 9)}`;
}

// ─────────────────────────────────────────────────────────────────
// Draggable Sortable Item Component
// ─────────────────────────────────────────────────────────────────
function SortableSectionItem({
  section,
  onToggle,
  onEdit,
  onRemove,
}: {
  section: HomepageSection;
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  const Icon = SECTION_TYPES.find(t => t.type === section.type)?.icon || LayoutTemplate;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`card p-4 flex items-center gap-4 transition-colors ${
        isDragging ? 'shadow-xl ring-2 ring-indigo-500 bg-gray-50 relative' : ''
      } ${!section.isEnabled ? 'opacity-60 bg-gray-50' : 'bg-white hover:border-gray-300'}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab hover:bg-gray-100 p-1.5 rounded text-gray-400 hover:text-gray-600 transition touch-none"
      >
        <GripVertical size={18} />
      </div>

      <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
        <Icon size={20} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`font-semibold truncate ${!section.isEnabled ? 'text-gray-500' : 'text-gray-900'}`}>
            {section.name}
          </p>
          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-gray-100 text-gray-500 tracking-wider">
            {section.type || 'Legacy'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${section.isEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
            }`}
        >
          {section.isEnabled ? 'Visible' : 'Hidden'}
        </span>
        
        <div className="h-6 w-px bg-gray-200 mx-1"></div>

        <button
          onClick={(e) => { e.stopPropagation(); onToggle(section.id); }}
          className={`btn-ghost p-2 rounded-lg transition-colors ${section.isEnabled ? 'text-gray-400 hover:text-gray-700' : 'text-gray-400 hover:text-green-600'
            }`}
          title={section.isEnabled ? 'Hide Section' : 'Show Section'}
        >
          {section.isEnabled ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(section.id); }}
          className="btn-ghost p-2 rounded-lg transition-colors text-gray-400 hover:text-indigo-600"
          title="Configure Section"
        >
          <PanelRightClose size={18} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(section.id); }}
          className="btn-ghost p-2 rounded-lg transition-colors text-gray-400 hover:text-red-600"
          title="Remove Section"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Config Editor Drawer
// ─────────────────────────────────────────────────────────────────
function ConfigEditor({
  section,
  onClose,
  onChange
}: {
  section: HomepageSection;
  onClose: () => void;
  onChange: (updates: Partial<HomepageSection>) => void;
}) {
  const [localConfig, setLocalConfig] = useState<any>(null);
  const [categories, setCategories] = useState<{_id: string, name: string}[]>([]);

  useEffect(() => {
    // Reset local config when section changes
    setLocalConfig(JSON.parse(JSON.stringify(section.config || {})));
    // Fetch categories for dropdowns
    apiGet<any>('/products/categories')
      .then(res => {
         setCategories(Array.isArray(res) ? res : (res?.data || []));
      })
      .catch((e) => console.error("Categories fetch failed:", e));
  }, [section.id]);

  if (!localConfig) return null;

  const updateConfig = (key: string, val: any) => {
    const newConfig = { ...localConfig, [key]: val };
    setLocalConfig(newConfig);
    onChange({ config: newConfig });
  };

  // ---- Type Specific Editors ----

  const renderHeroSlider = () => {
    const slides = Array.isArray(localConfig.slides) ? localConfig.slides : [];
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 border-b pb-2 w-full">Slider Images</h3>
        </div>
        
        {slides.map((slide: any, idx: number) => (
          <div key={idx} className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 space-y-4 relative group">
            <button
              onClick={() => {
                const updated = [...slides];
                updated.splice(idx, 1);
                updateConfig('slides', updated);
              }}
              className="absolute -top-3 -right-3 w-7 h-7 bg-white text-red-500 rounded-full shadow border flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
            >
              <X size={14} />
            </button>
            <div className="absolute -left-3 top-4 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition">
               <button disabled={idx === 0} onClick={() => updateConfig('slides', arrayMove(slides, idx, idx-1))} className="w-6 h-6 bg-white border shadow rounded shadow-sm flex items-center justify-center disabled:opacity-30"><MoveUp size={12}/></button>
               <button disabled={idx === slides.length-1} onClick={() => updateConfig('slides', arrayMove(slides, idx, idx+1))} className="w-6 h-6 bg-white border shadow rounded shadow-sm flex items-center justify-center disabled:opacity-30"><MoveDown size={12}/></button>
            </div>

            <ImageUpload
              label={`Slide ${idx + 1} Image`}
              hint="Recommended: 1920x800px"
              aspect="aspect-[21/9]"
              value={slide.image || ''}
              onChange={(url) => {
                const updated = [...slides];
                updated[idx].image = url;
                updateConfig('slides', updated);
              }}
            />
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="label">Heading</label>
                  <input className="input" value={slide.heading || ''} onChange={e => {
                     const u = [...slides]; u[idx].heading = e.target.value; updateConfig('slides', u);
                  }} />
               </div>
               <div>
                  <label className="label">Subheading / Description</label>
                  <input className="input" value={slide.subheading || ''} onChange={e => {
                     const u = [...slides]; u[idx].subheading = e.target.value; updateConfig('slides', u);
                  }} />
               </div>
               <div>
                  <label className="label">Button Text</label>
                  <input className="input" value={slide.buttonText || ''} onChange={e => {
                     const u = [...slides]; u[idx].buttonText = e.target.value; updateConfig('slides', u);
                  }} />
               </div>
               <div>
                  <label className="label">Button Link</label>
                  <input className="input" placeholder="/products" value={slide.buttonLink || ''} onChange={e => {
                     const u = [...slides]; u[idx].buttonLink = e.target.value; updateConfig('slides', u);
                  }} />
               </div>
            </div>
          </div>
        ))}
        <button
          onClick={() => updateConfig('slides', [...slides, {}])}
          className="btn-outline w-full gap-2 border-dashed"
        >
          <Plus size={16} /> Add New Slide
        </button>
      </div>
    );
  };

  const renderPromoBanner = () => {
     return (
        <div className="space-y-6">
           <ImageUpload
              label="Banner Image"
              hint="Any size, usually full width."
              value={localConfig.image || ''}
              onChange={(url) => updateConfig('image', url)}
           />
           <div>
              <label className="label">Target Link (URL)</label>
              <input className="input" placeholder="/collections/sale" value={localConfig.link || ''} onChange={e => updateConfig('link', e.target.value)} />
           </div>
        </div>
     );
  };

  const renderCustomHTML = () => {
     return (
        <div className="space-y-4">
           <div>
              <label className="label">Raw HTML Content</label>
              <textarea 
                className="input font-mono text-sm leading-relaxed" 
                rows={12} 
                placeholder="<!-- Paste your HTML, iframe, or scripts here -->"
                value={localConfig.html || ''} 
                onChange={e => updateConfig('html', e.target.value)} 
              />
           </div>
        </div>
     );
  };

  const renderProductGrid = () => {
     return (
        <div className="space-y-4">
           <div>
              <label className="label">Section Title</label>
              <input className="input" placeholder="e.g. Best Sellers" value={localConfig.title || ''} onChange={e => updateConfig('title', e.target.value)}/>
           </div>
           <div>
              <label className="label">Section Subtitle</label>
              <input className="input" placeholder="e.g. Our most loved products, trusted by thousands" value={localConfig.subtitle || ''} onChange={e => updateConfig('subtitle', e.target.value)}/>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="label">Data Source</label>
                 <select className="input" value={localConfig.source || 'bestsellers'} onChange={e => updateConfig('source', e.target.value)}>
                    <option value="bestsellers">Best Sellers</option>
                    <option value="newarrivals">New Arrivals</option>
                    <option value="featured">Featured Products</option>
                    <option value="category">Specific Category</option>
                 </select>
              </div>
              <div>
                 <label className="label">Max Items to Show</label>
                 <input type="number" className="input" value={localConfig.limit || 8} onChange={e => updateConfig('limit', Number(e.target.value))}/>
              </div>
           </div>
           {localConfig.source === 'category' && (
             <div>
                <label className="label">Select Category</label>
                 <select className="input" value={localConfig.categoryId || ''} onChange={e => updateConfig('categoryId', e.target.value)}>
                    <option value="">-- Choose Category --</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                 </select>
             </div>
           )}
        </div>
     );
  };

  const renderCategoryBrowser = () => {
     return (
        <div className="space-y-4">
           <div>
              <label className="label">Section Title</label>
              <input className="input" placeholder="e.g. Shop by Category" value={localConfig.title || ''} onChange={e => updateConfig('title', e.target.value)}/>
           </div>
           <div>
              <label className="label">Section Subtitle</label>
              <input className="input" placeholder="Explore our range of natural beauty products" value={localConfig.subtitle || ''} onChange={e => updateConfig('subtitle', e.target.value)}/>
           </div>
           <div>
              <label className="label">Max Categories to Show</label>
              <input type="number" className="input" value={localConfig.limit || 8} onChange={e => updateConfig('limit', Number(e.target.value))}/>
           </div>
           <div>
              <label className="label mb-2 block">Specific Categories to Feauture</label>
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1 bg-white scrollbar-thin">
                 <label className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer text-sm">
                    <input 
                      type="checkbox" 
                      checked={!localConfig.selectedCategoryIds || localConfig.selectedCategoryIds.length === 0}
                      onChange={() => updateConfig('selectedCategoryIds', [])}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span className="font-semibold text-gray-700">Display All (Default)</span>
                 </label>
                 {categories.map(c => (
                   <label key={c._id} className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer text-sm">
                      <input 
                        type="checkbox" 
                        checked={(localConfig.selectedCategoryIds || []).includes(c._id)}
                        onChange={(e) => {
                          const current = new Set(localConfig.selectedCategoryIds || []);
                          if (e.target.checked) current.add(c._id); else current.delete(c._id);
                          updateConfig('selectedCategoryIds', Array.from(current));
                        }}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                      />
                      <span className="text-gray-600">{c.name}</span>
                   </label>
                 ))}
              </div>
           </div>
        </div>
     );
  };

  const renderBlogSection = () => {
     return (
        <div className="space-y-4">
           <div>
              <label className="label">Section Title</label>
              <input className="input" placeholder="e.g. Beauty Tips & Insights" value={localConfig.title || ''} onChange={e => updateConfig('title', e.target.value)}/>
           </div>
           <div>
              <label className="label">Section Subtitle</label>
              <input className="input" placeholder="Expert advice for your skincare journey" value={localConfig.subtitle || ''} onChange={e => updateConfig('subtitle', e.target.value)}/>
           </div>
           <div>
              <label className="label">Posts to Show</label>
              <input type="number" className="input" value={localConfig.limit || 3} onChange={e => updateConfig('limit', Number(e.target.value))}/>
           </div>
        </div>
     );
  };

  const renderTestimonialSlider = () => {
     return (
        <div className="space-y-4">
           <div>
              <label className="label">Section Title</label>
              <input className="input" placeholder="e.g. What Our Customers Say" value={localConfig.title || ''} onChange={e => updateConfig('title', e.target.value)}/>
           </div>
           <div>
              <label className="label">Section Subtitle</label>
              <input className="input" placeholder="Real results, real stories" value={localConfig.subtitle || ''} onChange={e => updateConfig('subtitle', e.target.value)}/>
           </div>
        </div>
     );
  };

  const renderAnnouncementBar = () => (
    <div className="space-y-4">
      <div>
        <label className="label">Message Text</label>
        <input className="input" placeholder="e.g. Free shipping on orders above ₹499!" value={localConfig.text || ''} onChange={e => updateConfig('text', e.target.value)} />
      </div>
      <div>
        <label className="label">Link URL (optional)</label>
        <input className="input" placeholder="/products?sale=true" value={localConfig.link || ''} onChange={e => updateConfig('link', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Background Color</label>
          <div className="flex gap-2">
            <input type="color" className="w-10 h-10 rounded border border-gray-200 cursor-pointer p-0.5" value={localConfig.backgroundColor || '#111827'} onChange={e => updateConfig('backgroundColor', e.target.value)} />
            <input className="input flex-1" value={localConfig.backgroundColor || '#111827'} onChange={e => updateConfig('backgroundColor', e.target.value)} placeholder="#111827" />
          </div>
        </div>
        <div>
          <label className="label">Text Color</label>
          <div className="flex gap-2">
            <input type="color" className="w-10 h-10 rounded border border-gray-200 cursor-pointer p-0.5" value={localConfig.textColor || '#ffffff'} onChange={e => updateConfig('textColor', e.target.value)} />
            <input className="input flex-1" value={localConfig.textColor || '#ffffff'} onChange={e => updateConfig('textColor', e.target.value)} placeholder="#ffffff" />
          </div>
        </div>
      </div>
      <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700">
        Note: The announcement bar appears above the header. Enable/disable it from the <b>Site Settings → General</b> page.
      </div>
    </div>
  );

  const renderUSPStrip = () => {
    const items = Array.isArray(localConfig.items) ? localConfig.items : [];
    return (
      <div className="space-y-4">
        <div>
          <label className="label">Background Style</label>
          <select className="input" value={localConfig.style || 'light'} onChange={e => updateConfig('style', e.target.value)}>
            <option value="light">Light (white/gray)</option>
            <option value="dark">Dark</option>
            <option value="primary">Brand Color</option>
          </select>
        </div>
        {items.map((item: any, idx: number) => (
          <div key={idx} className="p-3 border border-gray-200 rounded-lg space-y-2 relative group">
            <button onClick={() => { const u = [...items]; u.splice(idx,1); updateConfig('items', u); }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-white border text-red-500 rounded-full shadow text-xs flex items-center justify-center opacity-0 group-hover:opacity-100">×</button>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="label text-[10px]">Icon (emoji or name)</label>
                <input className="input text-sm" value={item.iconName || ''} onChange={e => { const u=[...items]; u[idx].iconName=e.target.value; updateConfig('items',u); }} placeholder="🌿 or leaf" />
              </div>
              <div>
                <label className="label text-[10px]">Title</label>
                <input className="input text-sm" value={item.title || ''} onChange={e => { const u=[...items]; u[idx].title=e.target.value; updateConfig('items',u); }} placeholder="100% Natural" />
              </div>
              <div>
                <label className="label text-[10px]">Description</label>
                <input className="input text-sm" value={item.desc || ''} onChange={e => { const u=[...items]; u[idx].desc=e.target.value; updateConfig('items',u); }} placeholder="Pure ingredients" />
              </div>
            </div>
          </div>
        ))}
        <button onClick={() => updateConfig('items', [...items, { iconName: '', title: '', desc: '' }])} className="btn-outline w-full gap-2 border-dashed text-sm">
          <Plus size={14} /> Add Item
        </button>
      </div>
    );
  };

  // Fallback json editor
  const renderJsonFallback = () => (
    <div className="space-y-4">
      <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-sm text-indigo-700">
         Visual editor for <b>{section.type}</b> is coming soon. You can edit the raw JSON configuration below.
      </div>
      <textarea
        className="input font-mono text-xs"
        rows={10}
        value={JSON.stringify(localConfig, null, 2)}
        onChange={(e) => {
          try {
            const parsed = JSON.parse(e.target.value);
            setLocalConfig(parsed);
            onChange({ config: parsed });
          } catch {
             // Let them type invalid json temporarily without crashing
          }
        }}
      />
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-[500px] bg-white z-50 shadow-2xl flex flex-col transform transition-transform border-l border-gray-200">
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 shrink-0">
           <div>
              <h2 className="font-semibold text-gray-900">{section.name}</h2>
              <p className="text-xs text-gray-500 font-medium">{section.type || 'Legacy Component'}</p>
           </div>
          <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
           <div className="mb-6">
              <label className="label">Internal Display Name</label>
              <input 
                 className="input" 
                 value={section.name}
                 onChange={e => onChange({ name: e.target.value })}
              />
              <p className="text-xs text-gray-400 mt-1">Only visible in this admin panel</p>
           </div>

          {section.type === 'Hero Slider' || section.type === 'Image Slider' || section.type === 'Hero Banner' || section.id === 'hero' ? renderHeroSlider() :
           section.type === 'Promo Banner' ? renderPromoBanner() :
           section.type === 'Product Grid' || section.id === 'bestsellers' || section.id === 'newarrivals' ? renderProductGrid() :
           section.type === 'Category Browser' || section.id === 'categories' ? renderCategoryBrowser() :
           section.type === 'Blog Section' || section.id === 'blog' ? renderBlogSection() :
           section.type === 'Testimonial Slider' || section.id === 'testimonials' ? renderTestimonialSlider() :
           section.type === 'Custom HTML' ? renderCustomHTML() :
           section.type === 'Announcement Bar' || section.id === 'announcement' ? renderAnnouncementBar() :
           section.type === 'USP Strip' || section.id === 'usp' ? renderUSPStrip() :
           renderJsonFallback()}
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Page Component
// ─────────────────────────────────────────────────────────────────
export default function HomepageSettingsPage() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await apiGet<SiteSettingsResponse>('/settings');
      let loadedSections = data?.homepageSections || [];
      loadedSections = [...loadedSections].sort((a, b) => a.order - b.order);
      setSections(loadedSections);
      setHasChanges(false);
    } catch {
      toast.error('Failed to load homepage settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newArray = arrayMove(items, oldIndex, newIndex);
        const reordered = newArray.map((item, index) => ({ ...item, order: index }));
        setHasChanges(true);
        return reordered;
      });
    }
  };

  const toggleSection = (id: string) => {
    setSections((items) => {
      const updated = items.map((item) =>
        item.id === id ? { ...item, isEnabled: !item.isEnabled } : item
      );
      setHasChanges(true);
      return updated;
    });
  };

  const removeSection = (id: string) => {
     if(confirm('Are you sure you want to remove this section?')) {
        setSections(items => {
           const filtered = items.filter(i => i.id !== id);
           setHasChanges(true);
           return filtered;
        });
        if(editingId === id) setEditingId(null);
     }
  }

  const updateSectionInfo = (id: string, updates: Partial<HomepageSection>) => {
     setSections(items => {
        return items.map(item => item.id === id ? { ...item, ...updates } : item);
     });
     setHasChanges(true);
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/admin/settings/homepage', sections);
      toast.success('Homepage sections updated!');
      setHasChanges(false);
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const editingSection = sections.find(s => s.id === editingId);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="text-gray-400" size={20} />
            <h1 className="text-xl font-bold font-heading">Homepage Builder</h1>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Design your storefront layout by adding, configuring, and reordering components.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className="btn-primary gap-2 shrink-0 transition-all font-semibold px-6"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          Save Changes
        </button>
      </div>

      {hasChanges && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-sm font-medium flex items-center justify-center shadow-sm">
          You made changes to your layout. <b>Don't forget to push Save Changes!</b>
        </div>
      )}

      {/* Palette */}
      <div className="card p-6 border-gray-200">
         <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Add New Section</h3>
         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {SECTION_TYPES.map(st => (
               <button
                  key={st.type}
                  onClick={() => {
                     const sType = st.type;
                     const newSec: HomepageSection = {
                        id: generateId(),
                        type: sType,
                        name: sType,
                        isEnabled: true,
                        order: sections.length,
                        config: {}
                     };
                     setSections([...sections, newSec]);
                     setHasChanges(true);
                     setEditingId(newSec.id);
                  }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition group text-left"
               >
                  <st.icon size={16} className="text-gray-400 group-hover:text-indigo-500 shrink-0" />
                  <span className="text-[13px] font-medium text-gray-700 group-hover:text-indigo-700 truncate">{st.type}</span>
               </button>
            ))}
         </div>
      </div>

      {/* Sortable List */}
      <div>
         <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Active Layout</h3>
         
         {sections.length === 0 ? (
            <div className="p-12 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-center">
               <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                  <LayoutTemplate size={32} />
               </div>
               <h3 className="text-lg font-bold text-gray-900">Your homepage is empty!</h3>
               <p className="text-gray-500 mt-2 text-sm max-w-sm">Use the palette above to start adding components to your storefront layout.</p>
            </div>
         ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
               <div className="space-y-3">
                  {sections.map((section) => (
                  <SortableSectionItem
                     key={section.id}
                     section={section}
                     onToggle={toggleSection}
                     onEdit={setEditingId}
                     onRemove={removeSection}
                  />
                  ))}
               </div>
            </SortableContext>
            </DndContext>
         )}
      </div>

      {/* Slide Out Editor */}
      {editingSection && (
         <ConfigEditor 
            section={editingSection} 
            onClose={() => setEditingId(null)}
            onChange={(updates) => updateSectionInfo(editingId!, updates)}
         />
      )}

    </div>
  );
}
