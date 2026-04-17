'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText, Plus, Pencil, Trash2, Eye, EyeOff, Globe, Clock } from 'lucide-react';
import { apiGet, apiDelete } from '../../../lib/api';
import toast from 'react-hot-toast';

interface PageItem {
  _id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  showInNav: boolean;
  updatedAt: string;
}

export default function AdminPagesPage() {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const load = () => {
    setLoading(true);
    apiGet<PageItem[]>('/admin/pages')
      .then(data => setPages(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await apiDelete(`/admin/pages/${id}`);
      toast.success('Page deleted');
      load();
    } catch { toast.error('Failed to delete page'); }
  };

  const QUICK_TEMPLATES = [
    { title: 'Privacy Policy', slug: 'privacy-policy' },
    { title: 'Return & Refund Policy', slug: 'return-policy' },
    { title: 'Shipping Policy', slug: 'shipping-policy' },
    { title: 'Terms of Service', slug: 'terms' },
    { title: 'About Us', slug: 'about' },
    { title: 'Contact Us', slug: 'contact' },
    { title: 'FAQ', slug: 'faq' },
  ];

  const existingSlugs = new Set(pages.map(p => p.slug));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
            <FileText size={22} /> Pages
          </h1>
          <p className="text-gray-400 text-sm mt-1">Create and manage static pages like Privacy Policy, About Us, FAQ, etc.</p>
        </div>
        <Link href="/admin/pages/new" className="btn-primary gap-2">
          <Plus size={16} /> New Page
        </Link>
      </div>

      {/* Quick-create templates */}
      <div className="card p-5">
        <p className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Quick Create</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_TEMPLATES.map(tmpl => {
            const exists = existingSlugs.has(tmpl.slug);
            return (
              <button
                key={tmpl.slug}
                disabled={exists}
                onClick={() => router.push(`/admin/pages/new?title=${encodeURIComponent(tmpl.title)}&slug=${tmpl.slug}`)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                  exists
                    ? 'border-green-200 bg-green-50 text-green-600 cursor-default'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                {exists ? '✓ ' : '+ '}{tmpl.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pages list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-gray-700 border-t-transparent animate-spin" />
        </div>
      ) : pages.length === 0 ? (
        <div className="card p-16 text-center">
          <FileText size={40} className="mx-auto text-gray-300 mb-4" />
          <h3 className="font-semibold text-lg mb-2">No pages yet</h3>
          <p className="text-gray-400 text-sm mb-6">Use the quick-create buttons above or create a custom page.</p>
          <Link href="/admin/pages/new" className="btn-primary gap-2 inline-flex">
            <Plus size={16} /> Create Your First Page
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Title</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider hidden md:table-cell">URL Slug</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider hidden sm:table-cell">Status</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider hidden lg:table-cell">Updated</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pages.map(page => (
                <tr key={page._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-800">{page.title}</p>
                    <p className="text-xs text-gray-400 md:hidden">/{page.slug}</p>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <div className="flex items-center gap-1.5">
                      <code className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">/{page.slug}</code>
                      <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition-colors">
                        <Globe size={12} />
                      </a>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${page.isPublished ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                      {page.isPublished ? <Eye size={10} /> : <EyeOff size={10} />}
                      {page.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(page.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <Link
                        href={`/admin/pages/${page._id}`}
                        className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </Link>
                      <button
                        onClick={() => handleDelete(page._id, page.title)}
                        className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition-all"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
