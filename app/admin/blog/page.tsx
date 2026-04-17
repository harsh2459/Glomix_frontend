'use client';
import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import {
  Plus, Pencil, Trash2, Loader2, BookOpen,
  FileText, Search as SearchIcon, ChevronDown,
} from 'lucide-react';
import ImageUpload from '../../../components/ui/ImageUpload';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  author: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  isPublished: boolean;
  publishedAt?: string;
  tags: string[];
  createdAt: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    ogImage?: string;
  };
}

const EMPTY_FORM = {
  title: '',
  excerpt: '',
  content: '',
  author: 'Glomix Team',
  coverImage: '',
  tags: '',
  isPublished: false,
  seo: { metaTitle: '', metaDescription: '', keywords: '', ogImage: '' },
};

type FormState = typeof EMPTY_FORM;

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [activeTab, setActiveTab] = useState<'content' | 'seo'>('content');
  const [search, setSearch] = useState('');
  const [preview, setPreview] = useState(false);

  const fetchPosts = async () => {
    try { const res = await api.get('/admin/blog'); setPosts(res.data.data ?? []); }
    catch { setPosts([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetchPosts(); }, []);

  const reset = () => {
    setForm(EMPTY_FORM); setEditId(null); setShowForm(false);
    setActiveTab('content'); setPreview(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = {
        title: form.title,
        excerpt: form.excerpt,
        content: form.content,
        author: form.author,
        coverImage: form.coverImage,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        isPublished: form.isPublished,
        seo: {
          metaTitle: form.seo.metaTitle,
          metaDescription: form.seo.metaDescription,
          keywords: form.seo.keywords.split(',').map(k => k.trim()).filter(Boolean),
          ogImage: form.seo.ogImage,
        },
      };
      if (editId) {
        await api.put(`/admin/blog/${editId}`, payload);
        toast.success('Post updated');
      } else {
        await api.post('/admin/blog', payload);
        toast.success('Post created');
      }
      reset(); fetchPosts();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error saving post');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    try { await api.delete(`/admin/blog/${id}`); toast.success('Deleted'); fetchPosts(); }
    catch { toast.error('Error deleting'); }
  };

  const startEdit = async (p: Blog) => {
    try {
      const res = await api.get(`/admin/blog/${p._id}`);
      const full: Blog = res.data.data;
      setForm({
        title: full.title,
        excerpt: full.excerpt ?? '',
        content: full.content ?? '',
        author: full.author,
        coverImage: full.coverImage ?? '',
        tags: (full.tags ?? []).join(', '),
        isPublished: full.isPublished,
        seo: {
          metaTitle: full.seo?.metaTitle ?? '',
          metaDescription: full.seo?.metaDescription ?? '',
          keywords: (full.seo?.keywords ?? []).join(', '),
          ogImage: full.seo?.ogImage ?? '',
        },
      });
    } catch {
      setForm({
        title: p.title, excerpt: '', content: '', author: p.author,
        coverImage: '', tags: p.tags.join(', '), isPublished: p.isPublished,
        seo: { metaTitle: '', metaDescription: '', keywords: '', ogImage: '' },
      });
    }
    setEditId(p._id); setShowForm(true); setActiveTab('content');
    setTimeout(() => document.getElementById('blog-form-top')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const filtered = posts.filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.author.toLowerCase().includes(search.toLowerCase()) ||
    p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  const toolbarButtons = [
    { label: 'H2', title: 'Heading 2', wrap: ['<h2>', '</h2>'] },
    { label: 'H3', title: 'Heading 3', wrap: ['<h3>', '</h3>'] },
    { label: 'B', title: 'Bold', wrap: ['<strong>', '</strong>'] },
    { label: 'I', title: 'Italic', wrap: ['<em>', '</em>'] },
    { label: '¶', title: 'Paragraph', wrap: ['<p>', '</p>'] },
    { label: '•', title: 'Bullet List', wrap: ['<ul>\n  <li>', '</li>\n</ul>'] },
    { label: '1.', title: 'Numbered List', wrap: ['<ol>\n  <li>', '</li>\n</ol>'] },
    { label: '"', title: 'Blockquote', wrap: ['<blockquote>', '</blockquote>'] },
    { label: '—', title: 'Divider', wrap: ['\n<hr />\n', ''] },
    { label: 'A', title: 'Link', wrap: ['<a href="URL">', '</a>'] },
  ];

  const applyWrap = (before: string, after: string) => {
    const ta = document.getElementById('blog-content') as HTMLTextAreaElement;
    if (!ta) return;
    const s = ta.selectionStart;
    const e = ta.selectionEnd;
    const selected = ta.value.substring(s, e) || 'text';
    const newVal = ta.value.substring(0, s) + before + selected + after + ta.value.substring(e);
    setForm(f => ({ ...f, content: newVal }));
    // Restore cursor
    setTimeout(() => { ta.focus(); ta.setSelectionRange(s + before.length, s + before.length + selected.length); }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">Blog Posts</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your beauty &amp; skincare articles</p>
        </div>
        <button
          id="new-blog-btn"
          onClick={() => { reset(); setShowForm(true); }}
          className="btn-primary gap-2"
        >
          <Plus size={16} /> New Post
        </button>
      </div>

      {/* ── FORM ── */}
      {showForm && (
        <div id="blog-form-top" className="card p-6 space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="font-semibold text-lg">{editId ? 'Edit' : 'Create'} Blog Post</h2>
            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {(['content', 'seo'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition capitalize ${
                    activeTab === tab ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'content' ? 'Content' : 'SEO / Share'}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* ── CONTENT TAB ── */}
            {activeTab === 'content' && (
              <div className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Title *</label>
                    <input
                      id="blog-title"
                      className="input"
                      placeholder="e.g. 10 Tips for Glowing Skin"
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Author</label>
                    <input
                      id="blog-author"
                      className="input"
                      value={form.author}
                      onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                    />
                  </div>
                </div>

                <ImageUpload
                  label="Cover Image"
                  hint="Recommended: 1200×628px"
                  aspect="aspect-[2/1]"
                  value={form.coverImage}
                  onChange={url => setForm(f => ({ ...f, coverImage: url }))}
                />

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Tags (comma-separated)</label>
                  <input
                    id="blog-tags"
                    className="input"
                    placeholder="skincare, tips, beauty, anti-aging"
                    value={form.tags}
                    onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Excerpt (short summary)</label>
                  <textarea
                    id="blog-excerpt"
                    className="input min-h-[70px] resize-none"
                    placeholder="A brief 1–2 sentence summary shown in the blog listing…"
                    value={form.excerpt}
                    onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                  />
                </div>

                {/* Rich HTML editor */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs text-gray-400">
                      Content * <span className="opacity-60">(HTML — use toolbar below)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setPreview(v => !v)}
                      className="text-xs text-blue-500 hover:text-blue-700 font-medium underline"
                    >
                      {preview ? '✏ Edit' : '👁 Preview'}
                    </button>
                  </div>

                  {/* Toolbar */}
                  {!preview && (
                    <div className="flex flex-wrap gap-1 mb-2 p-2 bg-gray-50 border border-gray-200 rounded-lg">
                      {toolbarButtons.map(btn => (
                        <button
                          key={btn.label}
                          type="button"
                          title={btn.title}
                          onClick={() => applyWrap(btn.wrap[0], btn.wrap[1])}
                          className="px-2.5 py-1 text-xs font-bold border border-gray-200 rounded bg-white hover:bg-gray-50 hover:border-gray-300 transition min-w-[28px] text-center shadow-sm"
                        >
                          {btn.label}
                        </button>
                      ))}
                      <span className="ml-auto text-[10px] text-gray-400 self-center italic">
                        Select text then click to wrap
                      </span>
                    </div>
                  )}

                  {preview ? (
                    <div
                      className="prose-content min-h-[320px] p-4 border border-gray-200 rounded-xl bg-white overflow-auto"
                      dangerouslySetInnerHTML={{ __html: form.content || '<p style="color:#9CA3AF">Nothing to preview yet…</p>' }}
                    />
                  ) : (
                    <textarea
                      id="blog-content"
                      className="input min-h-[320px] resize-y font-mono text-sm leading-relaxed"
                      placeholder={`Write HTML content here:\n\n<p>Your paragraph text here…</p>\n\n<h2>Section Heading</h2>\n<p>More text…</p>\n\n<ul>\n  <li>Bullet point one</li>\n  <li>Bullet point two</li>\n  <li>Bullet point three</li>\n</ul>\n\n<blockquote>A highlighted quote or tip</blockquote>`}
                      value={form.content}
                      onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                      required
                    />
                  )}
                  <p className="text-[10px] text-gray-400 mt-1">
                    Supported tags: &lt;h2&gt; &lt;h3&gt; &lt;p&gt; &lt;ul&gt;&lt;li&gt; &lt;ol&gt;&lt;li&gt; &lt;strong&gt; &lt;em&gt; &lt;blockquote&gt; &lt;hr&gt; &lt;a&gt; &lt;img&gt;
                  </p>
                </div>

                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <input
                    type="checkbox"
                    id="publish"
                    checked={form.isPublished}
                    onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))}
                    className="w-4 h-4 accent-gray-800"
                  />
                  <label htmlFor="publish" className="text-sm font-medium cursor-pointer select-none">
                    Publish immediately (visible on website)
                  </label>
                </div>
              </div>
            )}

            {/* ── SEO TAB ── */}
            {activeTab === 'seo' && (
              <div className="space-y-5">
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700 leading-relaxed">
                  <strong>SEO &amp; Share Settings</strong> — These fields improve search engine visibility and control how the post appears when shared on social media (Facebook, Twitter, WhatsApp, etc.)
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Meta Title</label>
                  <input
                    className="input"
                    placeholder="Leave blank to use post title"
                    value={form.seo.metaTitle}
                    onChange={e => setForm(f => ({ ...f, seo: { ...f.seo, metaTitle: e.target.value } }))}
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Meta Description</label>
                  <textarea
                    className="input min-h-[80px] resize-none"
                    placeholder="150–160 characters recommended…"
                    value={form.seo.metaDescription}
                    onChange={e => setForm(f => ({ ...f, seo: { ...f.seo, metaDescription: e.target.value } }))}
                  />
                  <p className={`text-[10px] mt-0.5 ${form.seo.metaDescription.length > 160 ? 'text-red-400' : 'text-gray-400'}`}>
                    {form.seo.metaDescription.length} / 160 characters
                  </p>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Keywords (comma-separated)</label>
                  <input
                    className="input"
                    placeholder="skincare, moisturizer, glow, anti-aging"
                    value={form.seo.keywords}
                    onChange={e => setForm(f => ({ ...f, seo: { ...f.seo, keywords: e.target.value } }))}
                  />
                </div>

                <ImageUpload
                  label="Share Image (Open Graph / Social Preview)"
                  hint="Recommended: 1200×630px"
                  aspect="aspect-[2/1]"
                  value={form.seo.ogImage}
                  onChange={url => setForm(f => ({ ...f, seo: { ...f.seo, ogImage: url } }))}
                />
                <p className="text-[10px] text-gray-400 -mt-2">
                  Shown when shared on Facebook, Twitter, WhatsApp, LinkedIn, etc. If blank, the cover image is used.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2 border-t border-gray-100">
              <button type="submit" disabled={saving} className="btn-primary gap-2">
                {saving && <Loader2 size={14} className="animate-spin" />}
                {editId ? 'Update Post' : 'Publish Post'}
              </button>
              <button type="button" onClick={reset} className="btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* ── LISTING ── */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-xs">
            <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input pl-8 text-sm py-2"
              placeholder="Search posts…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <span className="text-sm text-gray-400 ml-auto">
            {filtered.length} post{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-gray-600" size={28} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center p-12 text-gray-500">
            <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
            <p>{search ? 'No posts match your search.' : 'No blog posts yet. Write your first article!'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase">
                  <th className="text-left p-4">Title</th>
                  <th className="text-left p-4">Author</th>
                  <th className="text-left p-4">Tags</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Date</th>
                  <th className="p-4" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {p.coverImage
                          ? <img src={p.coverImage} alt="" className="w-10 h-7 object-cover rounded-md flex-shrink-0" />
                          : <div className="w-10 h-7 bg-gray-100 rounded-md flex-shrink-0 flex items-center justify-center">
                              <FileText size={12} className="text-gray-400" />
                            </div>
                        }
                        <span className="font-medium max-w-[220px] truncate">{p.title}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-400">{p.author}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {p.tags.slice(0, 3).map(t => (
                          <span key={t} className="badge badge-primary text-xs">{t}</span>
                        ))}
                        {p.tags.length > 3 && (
                          <span className="text-xs text-gray-400">+{p.tags.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`badge ${p.isPublished ? 'badge-success' : 'badge-warning'}`}>
                        {p.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400">{new Date(p.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => startEdit(p)} className="btn-ghost p-1.5" title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(p._id)} className="btn-ghost p-1.5 text-red-400" title="Delete">
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
    </div>
  );
}
