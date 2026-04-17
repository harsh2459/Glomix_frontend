  import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Leaf, Shield, Truck, Star, ChevronRight } from 'lucide-react';
import ProductCard from '../../components/products/ProductCard';
import NewsletterSection from '../../components/home/NewsletterSection';
import { IProduct, IBanner, ICategory, ISiteSettings, IBlog, IReview } from '../../types';

// ─── Icon map for USP Strip ────────────────────────────────────
const USP_ICON_MAP: Record<string, React.ReactNode> = {
  leaf:   <Leaf size={20} />,
  shield: <Shield size={20} />,
  truck:  <Truck size={20} />,
  star:   <Star size={20} />,
  sparkles: <Sparkles size={20} />,
};

// ─── Data fetchers ─────────────────────────────────────────────
async function getSettings(): Promise<ISiteSettings | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json()).data;
  } catch { return null; }
}

async function getHeroBanners(): Promise<IBanner[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/banners?position=hero&isActive=true`, {
      next: { revalidate: 120 }
    });
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch { return []; }
}

async function getCategories(): Promise<ICategory[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/categories`, { next: { revalidate: 300 } });
    return (await res.json()).data ?? [];
  } catch { return []; }
}

async function getBestSellers(): Promise<IProduct[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/best-sellers`, { next: { revalidate: 120 } });
    return (await res.json()).data ?? [];
  } catch { return []; }
}

async function getNewArrivals(): Promise<IProduct[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/new-arrivals`, { next: { revalidate: 120 } });
    return (await res.json()).data ?? [];
  } catch { return []; }
}

async function getFeaturedProducts(): Promise<IProduct[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/featured`, { next: { revalidate: 120 } });
    return (await res.json()).data ?? [];
  } catch { return []; }
}

async function getBlogs(): Promise<IBlog[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog?limit=3`, { next: { revalidate: 300 } });
    return (await res.json()).data ?? [];
  } catch { return []; }
}

async function getApprovedReviews(): Promise<IReview[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews?isApproved=true&limit=3`, { next: { revalidate: 300 } });
    return (await res.json()).data ?? [];
  } catch { return []; }
}

// ─── Default fallbacks (only used if DB has no data yet) ───────
const DEFAULT_TRUST_BADGES = [
  { icon: '🌿', text: '100% Natural' },
  { icon: '🐰', text: 'Cruelty Free' },
  { icon: '🇮🇳', text: 'Made in India' },
  { icon: '✨', text: 'Dermatologist Tested' },
];

const DEFAULT_USP = [
  { iconName: 'leaf',   title: '100% Natural',           desc: 'Handpicked ingredients' },
  { iconName: 'shield', title: 'Dermatologist Tested',    desc: 'Safe for all skin types' },
  { iconName: 'truck',  title: 'Free Shipping',           desc: 'On orders above ₹499' },
  { iconName: 'star',   title: '10,000+ Happy Customers', desc: 'Loved across India' },
];

const FALLBACK_TESTIMONIALS = [
  { name: 'Priya S.', text: 'The face cream has transformed my skin! Visible results in just 2 weeks. Absolutely love it!', rating: 5, location: 'Mumbai' },
  { name: 'Anjali M.', text: 'Finally found natural products that actually work for my sensitive skin. No breakouts, just glow!', rating: 5, location: 'Bangalore' },
  { name: 'Deepika R.', text: 'The soaps smell divine and leave my skin so soft. Will never go back to chemical soaps.', rating: 5, location: 'Delhi' },
];

// ─── Section components ────────────────────────────────────────

import HeroSliderClient from '../../components/home/HeroSliderClient';

function USPStrip({ settings }: { settings: ISiteSettings | null }) {
  const usps = (settings?.uspStrip && settings.uspStrip.length > 0)
    ? [...settings.uspStrip].sort((a, b) => a.order - b.order)
    : DEFAULT_USP;

  return (
    <section className="section-sm" style={{ background: 'var(--color-surface)' }}>
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {usps.map((usp, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(0,0,0,0.06)', color: 'var(--color-primary)' }}>
                {usp.iconName?.startsWith('http') || usp.iconName?.startsWith('/') || usp.iconName?.startsWith('data:') ? (
                  <img src={usp.iconName} alt={usp.title} className="w-5 h-5 object-contain" />
                ) : (
                  USP_ICON_MAP[usp.iconName] ?? <Sparkles size={20} />
                )}
              </div>
              <div>
                <p className="font-semibold text-sm">{usp.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{usp.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategorySection({ categories }: { categories: ICategory[] }) {
  if (categories.length === 0) return null;
  return (
    <section className="section">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Shop by Category</h2>
          <p className="text-gray-500 max-w-xl mx-auto">Explore our range of natural beauty products crafted for every skin type</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.slice(0, 8).map((cat) => (
            <Link
              key={cat._id}
              href={`/category/${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden aspect-square"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/20" />
              {cat.image && (
                <Image src={cat.image} alt={cat.name} fill className="object-cover opacity-60 group-hover:scale-110 transition-transform duration-500" sizes="(max-width: 768px) 50vw, 25vw" />
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                <h3 className="font-heading text-lg font-bold text-white drop-shadow-lg">{cat.name}</h3>
                <ChevronRight size={16} className="mt-2 text-white group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductSection({ title, subtitle, products, viewAllHref }: {
  title: string;
  subtitle?: string;
  products: IProduct[];
  viewAllHref: string;
}) {
  if (products.length === 0) return null;
  return (
    <section className="section">
      <div className="container">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-2">{title}</h2>
            {subtitle && <p className="text-gray-500">{subtitle}</p>}
          </div>
          <Link href={viewAllHref} className="btn-ghost text-gray-600 hover:text-gray-500 gap-1">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid-products">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection({ reviews }: { reviews: IReview[] }) {
  // Use real DB reviews if available, otherwise show branded fallback
  const hasRealReviews = reviews.length > 0;

  return (
    <section className="section">
      <div className="container text-center">
        <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
        <p className="text-gray-500 mb-12">Real results, real stories</p>
        <div className="grid md:grid-cols-3 gap-6">
          {hasRealReviews
            ? reviews.slice(0, 3).map((review) => (
              <div key={review._id} className="card p-6 text-left">
                <div className="flex mb-3">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} size={14} className={s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">&quot;{review.comment}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'rgba(0,0,0,0.06)', color: 'var(--color-primary)' }}>
                    {review.userName?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{review.userName}</p>
                    {review.isVerifiedPurchase && <p className="text-xs text-green-500">✓ Verified Purchase</p>}
                  </div>
                </div>
              </div>
            ))
            : FALLBACK_TESTIMONIALS.map((review) => (
              <div key={review.name} className="card p-6 text-left">
                <div className="flex mb-3">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} size={14} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">&quot;{review.text}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'rgba(0,0,0,0.06)', color: 'var(--color-primary)' }}>
                    {review.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{review.name}</p>
                    <p className="text-xs text-gray-500">{review.location}</p>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </section>
  );
}

function BlogSection({ blogs }: { blogs: IBlog[] }) {
  if (blogs.length === 0) return null;
  return (
    <section className="section" style={{ background: 'var(--color-surface)' }}>
      <div className="container">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-heading text-3xl font-bold mb-2">Beauty Tips &amp; Insights</h2>
            <p className="text-gray-500">Expert advice for your skincare journey</p>
          </div>
          <Link href="/blog" className="btn-ghost text-gray-600 gap-1">
            All Articles <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <Link key={blog._id} href={`/blog/${blog.slug}`} className="card group">
              {blog.coverImage && (
                <div className="relative aspect-video overflow-hidden">
                  <Image src={blog.coverImage} alt={blog.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 33vw" />
                </div>
              )}
              <div className="p-5">
                <div className="flex flex-wrap gap-2 mb-3">
                  {blog.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="badge badge-primary text-xs">{tag}</span>
                  ))}
                </div>
                <h3 className="font-heading text-lg font-semibold line-clamp-2 group-hover:text-gray-500 transition-colors">{blog.title}</h3>
                {blog.excerpt && <p className="text-sm text-gray-500 mt-2 line-clamp-2">{blog.excerpt}</p>}
                <p className="text-xs text-gray-500 mt-3">{blog.author} · {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Dynamic CMS Renderer ──────────────────────────────────────
async function DynamicSectionRenderer({ section, settings, banners, categories, bestSellers, newArrivals, featured, blogs, reviews }: any) {
  // Extract custom configs with fallbacks to defaults
  const conf = section.config || {};
  const t = section.type || section.id; // fallback to legacy IDs as types if unpopulated

  switch (t) {
    case 'Hero Banner':
    case 'Hero Slider':
    case 'hero':
      let slides = conf.slides;
      if (!slides || slides.length === 0) {
         slides = banners.map((b: any) => ({
            image: b.image,
            heading: b.title,
            subheading: b.subtitle,
            buttonText: b.ctaText,
            buttonLink: b.link
         }));
      }
      return <HeroSliderClient slides={slides} settings={settings} />;
      
    case 'USP Strip':
    case 'usp':
      return <USPStrip settings={settings} />;
      
    case 'Category Browser':
    case 'categories':
      // The CMS limits categories displayed or modifies title
      const catTitle = conf.title || "Shop by Category";
      const catSub = conf.subtitle || "Explore our range of natural beauty products crafted for every skin type";
      const catLimit = conf.limit || 8;
      
      if (categories.length === 0) return null;

      let displayCategories = categories;
      if (conf.selectedCategoryIds && Array.isArray(conf.selectedCategoryIds) && conf.selectedCategoryIds.length > 0) {
         displayCategories = categories.filter((c: any) => conf.selectedCategoryIds.includes(c._id));
      }
      
      return (
        <section className="section">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">{catTitle}</h2>
              <p className="text-gray-500 max-w-xl mx-auto">{catSub}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {displayCategories.slice(0, catLimit).map((cat: ICategory) => (
                <Link key={cat._id} href={`/category/${cat.slug}`} className="group relative rounded-2xl overflow-hidden aspect-square">
                  <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/20" />
                  {cat.image && (
                    <img src={cat.image} alt={cat.name} className="object-cover w-full h-full opacity-60 group-hover:scale-110 transition-transform duration-500" />
                  )}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                    <h3 className="font-heading text-lg font-bold text-white drop-shadow-lg">{cat.name}</h3>
                    <ChevronRight size={16} className="mt-2 text-white group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      );
      
    case 'Product Grid':
    case 'bestsellers':
    case 'newarrivals':
      // CMS Config overrides
      let title = conf.title;
      let subtitle = conf.subtitle;
      let data = bestSellers;
      let sortOrCat = 'bestsellers';
      
      // Map based on source property OR legacy IDs
      const source = conf.source || (t === 'newarrivals' ? 'newarrivals' : 'bestsellers');
      
      if (source === 'bestsellers') {
         title = title || "Best Sellers";
         subtitle = subtitle || "Our most loved products, trusted by thousands";
         data = bestSellers;
         sortOrCat = 'bestsellers';
      } else if (source === 'newarrivals') {
         title = title || "New Arrivals";
         subtitle = subtitle || "Fresh additions to your beauty routine";
         data = newArrivals;
         sortOrCat = 'new';
      } else if (source === 'featured') {
         title = title || "Featured Products";
         subtitle = subtitle || "Handpicked selections just for you";
         data = featured;
         sortOrCat = 'featured';
      } else if (source === 'category' && conf.categoryId) {
         // Dynamically fetch specific category items if requested!
         title = title || "Curated Collection";
         subtitle = subtitle || "Explore specific ranges";
         sortOrCat = conf.categoryId;
         try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?category=${conf.categoryId}&limit=${conf.limit || 8}`, { next: { revalidate: 60 } });
            data = (await res.json()).data ?? [];
         } catch { data = []; }
      }
      
      return (
        <ProductSection
          title={title}
          subtitle={subtitle}
          products={data.slice(0, conf.limit || 8)}
          viewAllHref={source === 'category' ? `/category/${sortOrCat}` : `/products?sort=${sortOrCat}`}
        />
      );
      
    case 'Testimonial Slider':
    case 'testimonials':
      return (
         <div className="relative">
            {conf.title && <div className="container pt-12 pb-4 text-center"><h2 className="font-heading text-3xl font-bold">{conf.title}</h2>{conf.subtitle && <p className="text-gray-500 mt-2">{conf.subtitle}</p>}</div>}
            <TestimonialsSection reviews={reviews} />
         </div>
      );
      
    case 'Blog Section':
    case 'blog':
      return (
         <div className="relative">
            {conf.title && <div className="container pt-12 pb-4"><h2 className="font-heading text-3xl font-bold">{conf.title}</h2>{conf.subtitle && <p className="text-gray-500 mt-2">{conf.subtitle}</p>}</div>}
            <BlogSection blogs={blogs.slice(0, conf.limit || 3)} />
         </div>
      );
      
    case 'Newsletter':
    case 'newsletter':
      return <NewsletterSection title={conf.title || settings?.newsletterTitle} subtitle={conf.subtitle || settings?.newsletterSubtitle} />;
      
    case 'Custom HTML':
      return conf.html ? <div dangerouslySetInnerHTML={{ __html: conf.html }} /> : null;
      
    case 'Promo Banner':
      return conf.image ? (
        <section className="section pb-0 container">
          <Link href={conf.link || '#'}>
            <img src={conf.image} className="w-full rounded-2xl object-cover hover:shadow-lg transition" alt="Promo" />
          </Link>
        </section>
      ) : null;
      
    default:
      return null;
  }
}

// ─── Main Homepage ─────────────────────────────────────────────
export default async function HomePage() {
  const [settings, banners, categories, bestSellers, newArrivals, featured, blogs, reviews] = await Promise.all([
    getSettings(),
    getHeroBanners(),
    getCategories(),
    getBestSellers(),
    getNewArrivals(),
    getFeaturedProducts(),
    getBlogs(),
    getApprovedReviews(),
  ]);

  // Handle completely empty/new sites by supplying legacy defaults directly IF sections is entirely empty.
  let sections = settings?.homepageSections ?? [];
  if (sections.length === 0) {
     sections = [
       { id: 'hero', name: 'Hero Banner', isEnabled: true, order: 0 },
       { id: 'usp', name: 'USP Strip', isEnabled: true, order: 1 },
       { id: 'categories', name: 'Categories', isEnabled: true, order: 2 },
       { id: 'bestsellers', name: 'Best Sellers', isEnabled: true, order: 3 },
       { id: 'newarrivals', name: 'New Arrivals', isEnabled: true, order: 4 },
       { id: 'testimonials', name: 'Testimonials', isEnabled: true, order: 5 },
       { id: 'blog', name: 'Blog', isEnabled: true, order: 6 },
       { id: 'newsletter', name: 'Newsletter', isEnabled: true, order: 7 },
     ] as any;
  }

  // Filter and sort the sections driven completely by Admin CMS logic
  const activeSections = sections.filter((s) => s.isEnabled).sort((a, b) => a.order - b.order);

  return (
    <>
      {activeSections.map((section) => (
         <DynamicSectionRenderer 
           key={section.id} 
           section={section} 
           settings={settings}
           banners={banners}
           categories={categories}
           bestSellers={bestSellers}
           newArrivals={newArrivals}
           featured={featured}
           blogs={blogs}
           reviews={reviews}
         />
      ))}
    </>
  );
}
