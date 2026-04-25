import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Leaf, Shield, Truck, Star, ChevronRight } from 'lucide-react';
import ProductCard from '../../components/products/ProductCard';
import { IProduct, IBanner, ICategory, ISiteSettings, IBlog, IReview } from '../../types';

// ─── Icon map ────────────────────────────────────────────────────
const USP_ICON_MAP: Record<string, React.ReactNode> = {
  leaf:     <Leaf size={18} />,
  shield:   <Shield size={18} />,
  truck:    <Truck size={18} />,
  star:     <Star size={18} />,
  sparkles: <Sparkles size={18} />,
};

// ─── Data fetchers ───────────────────────────────────────────────
async function getSettings(): Promise<ISiteSettings | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json()).data;
  } catch { return null; }
}

async function getHeroBanners(): Promise<IBanner[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/banners?position=hero&isActive=true`, { next: { revalidate: 120 } });
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

// ─── Fallbacks ───────────────────────────────────────────────────
const DEFAULT_USP = [
  { iconName: 'leaf',   title: '100% Natural',           desc: 'Handpicked ingredients' },
  { iconName: 'shield', title: 'Dermatologist Tested',    desc: 'Safe for all skin types' },
  { iconName: 'truck',  title: 'Free Shipping',           desc: 'On orders above ₹499' },
  { iconName: 'star',   title: '10,000+ Happy Customers', desc: 'Loved across India' },
];

const FALLBACK_TESTIMONIALS = [
  { name: 'Priya S.',    text: 'The face cream has transformed my skin! Visible results in just 2 weeks. Absolutely love it!', rating: 5, location: 'Mumbai' },
  { name: 'Anjali M.',   text: 'Finally found natural products that actually work for my sensitive skin. No breakouts, just glow!', rating: 5, location: 'Bangalore' },
  { name: 'Deepika R.',  text: 'The soaps smell divine and leave my skin so soft. Will never go back to chemical soaps.', rating: 5, location: 'Delhi' },
];

// ─── Section import ──────────────────────────────────────────────
import HeroSliderClient from '../../components/home/HeroSliderClient';

// ─── USP Strip ───────────────────────────────────────────────────
function USPStrip({ settings }: { settings: ISiteSettings | null }) {
  const usps = (settings?.uspStrip && settings.uspStrip.length > 0)
    ? [...settings.uspStrip].sort((a, b) => a.order - b.order)
    : DEFAULT_USP;

  return (
    <section style={{ background: '#f5f3ef', padding: '0' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, borderTop: '1px solid rgba(0,0,0,0.06)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}
          className="grid-cols-2 md:grid-cols-4">
          {usps.map((usp, i) => (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '28px 24px',
                borderRight: i < usps.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
              }}
            >
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: '#0a0a0a', color: '#fafaf8',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {usp.iconName?.startsWith('http') || usp.iconName?.startsWith('/') || usp.iconName?.startsWith('data:') ? (
                  <img src={usp.iconName} alt={usp.title} style={{ width: 18, height: 18, objectFit: 'contain', filter: 'invert(1)' }} />
                ) : (
                  USP_ICON_MAP[usp.iconName] ?? <Sparkles size={18} />
                )}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#0a0a0a', lineHeight: 1.3 }}>{usp.title}</p>
                <p style={{ fontSize: 11.5, color: '#6b6560', marginTop: 2, fontWeight: 300 }}>{usp.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Category Card ───────────────────────────────────────────────
function CategoryCard({ cat }: { cat: ICategory }) {
  const pastelColors = [
    '#f2ede8', '#ede8f0', '#f0ebe3', '#e8f0ed',
    '#e8ecf0', '#ede8eb', '#f0e8e8', '#e8ede8',
  ];
  const colorIdx = cat.name.charCodeAt(0) % pastelColors.length;

  return (
    <Link
      href={`/category/${cat.slug}`}
      className="category-card group relative rounded-2xl overflow-hidden block"
      style={{ aspectRatio: '1/1' }}
    >
      {cat.image ? (
        <>
          <Image
            src={cat.image}
            alt={cat.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,10,0.72) 0%, rgba(10,10,10,0.18) 50%, transparent 100%)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 18px' }}>
            <h3 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: 16, fontWeight: 600, color: '#fff', lineHeight: 1.2 }}>{cat.name}</h3>
            <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.65)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
              Shop <ChevronRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
            </p>
          </div>
        </>
      ) : (
        <div style={{ width: '100%', height: '100%', background: pastelColors[colorIdx], display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, fontSize: 22, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
            {cat.name[0]}
          </div>
          <h3 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: 15, fontWeight: 600, color: '#0a0a0a' }}>{cat.name}</h3>
          {cat.description && <p style={{ fontSize: 12, color: '#6b6560', marginTop: 6, lineHeight: 1.5 }} className="line-clamp-2">{cat.description}</p>}
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 3, fontSize: 11.5, fontWeight: 500, color: '#3d3a35' }}>
            Explore <ChevronRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      )}
    </Link>
  );
}

// ─── Category Section ────────────────────────────────────────────
function CategorySection({ categories }: { categories: ICategory[] }) {
  if (categories.length === 0) return null;
  const displayed = categories.slice(0, 4);
  const hasMore = categories.length > 4;

  return (
    <section className="section">
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48 }}>
          <div>
            <p className="section-label">Collections</p>
            <h2 className="section-heading">Shop by Category</h2>
            <p style={{ color: '#6b6560', marginTop: 10, fontSize: 14, fontWeight: 300, maxWidth: 440 }}>
              Explore our curated range crafted for every skin type
            </p>
          </div>
          {hasMore && (
            <Link href="/categories" className="btn-ghost" style={{ color: '#6b6560' }}>
              All Categories <ArrowRight size={14} />
            </Link>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {displayed.map((cat) => <CategoryCard key={cat._id} cat={cat} />)}
        </div>
        {hasMore && (
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Link href="/categories" className="btn-outline" style={{ padding: '0.75rem 2.25rem' }}>View All Categories</Link>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Product Section ─────────────────────────────────────────────
function ProductSection({ title, subtitle, products, viewAllHref }: {
  title: string; subtitle?: string; products: IProduct[]; viewAllHref: string;
}) {
  if (products.length === 0) return null;
  return (
    <section className="section" style={{ background: '#fafaf8' }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48 }}>
          <div>
            <h2 className="section-heading">{title}</h2>
            {subtitle && <p style={{ color: '#6b6560', marginTop: 8, fontSize: 14, fontWeight: 300 }}>{subtitle}</p>}
          </div>
          <Link href={viewAllHref} className="btn-ghost" style={{ color: '#6b6560' }}>
            View All <ArrowRight size={14} />
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

// ─── Testimonials ────────────────────────────────────────────────
function TestimonialsSection({ reviews }: { reviews: IReview[] }) {
  const hasRealReviews = reviews.length > 0;

  return (
    <section className="section" style={{ background: '#f5f3ef' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p className="section-label" style={{ justifyContent: 'center' }}>
            <Star size={10} style={{ color: '#c8a96e' }} fill="#c8a96e" />
            Customer Stories
          </p>
          <h2 className="section-heading">What Our Customers Say</h2>
          <p style={{ color: '#6b6560', marginTop: 10, fontSize: 14, fontWeight: 300 }}>Real results, real people</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {(hasRealReviews ? reviews.slice(0, 3) : FALLBACK_TESTIMONIALS).map((review: any, idx) => (
            <div
              key={review._id ?? review.name}
              style={{
                background: '#ffffff',
                border: '1px solid rgba(0,0,0,0.06)',
                borderRadius: 14,
                padding: '28px 26px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              {/* Stars */}
              <div style={{ display: 'flex', gap: 3 }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={13}
                    fill={s <= (review.rating ?? 5) ? '#c8a96e' : '#e8e4dd'}
                    stroke="none"
                  />
                ))}
              </div>

              {/* Quote */}
              <p style={{ fontSize: 13.5, color: '#3d3a35', lineHeight: 1.75, fontWeight: 300, flex: 1 }}>
                &ldquo;{review.comment ?? review.text}&rdquo;
              </p>

              {/* Author */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: '#0a0a0a', color: '#fafaf8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 600, flexShrink: 0,
                }}>
                  {(review.userName ?? review.name)?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#0a0a0a', lineHeight: 1.2 }}>{review.userName ?? review.name}</p>
                  {review.isVerifiedPurchase && (
                    <p style={{ fontSize: 11, color: '#16a34a', marginTop: 2 }}>✓ Verified Purchase</p>
                  )}
                  {review.location && (
                    <p style={{ fontSize: 11, color: '#b0a99e', marginTop: 2 }}>{review.location}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Blog Section ────────────────────────────────────────────────
function BlogSection({ blogs }: { blogs: IBlog[] }) {
  if (blogs.length === 0) return null;
  return (
    <section className="section" style={{ background: '#fafaf8' }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48 }}>
          <div>
            <p className="section-label">Journal</p>
            <h2 className="section-heading">Beauty Tips &amp; Insights</h2>
            <p style={{ color: '#6b6560', marginTop: 10, fontSize: 14, fontWeight: 300 }}>Expert advice for your skincare journey</p>
          </div>
          <Link href="/blog" className="btn-ghost" style={{ color: '#6b6560' }}>
            All Articles <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <Link
              key={blog._id}
              href={`/blog/${blog.slug}`}
              className="blog-card group block"
            >
              {blog.coverImage && (
                <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }}>
                  <Image src={blog.coverImage} alt={blog.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 33vw" />
                </div>
              )}
              <div style={{ padding: '20px 22px 22px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                  {blog.tags.slice(0, 2).map((tag) => (
                    <span key={tag} style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b6560', background: '#f5f3ef', padding: '3px 8px', borderRadius: 9999 }}>{tag}</span>
                  ))}
                </div>
                <h3 className="blog-card-title line-clamp-2" style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: 16, fontWeight: 600, lineHeight: 1.35, color: '#0a0a0a', marginBottom: 8 }}>
                  {blog.title}
                </h3>
                {blog.excerpt && <p style={{ fontSize: 13, color: '#6b6560', lineHeight: 1.6, fontWeight: 300 }} className="line-clamp-2">{blog.excerpt}</p>}
                <p style={{ fontSize: 11.5, color: '#b0a99e', marginTop: 12 }}>
                  {blog.author} · {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Dynamic CMS Renderer ─────────────────────────────────────────
async function DynamicSectionRenderer({ section, settings, banners, categories, bestSellers, newArrivals, featured, blogs, reviews }: any) {
  const conf = section.config || {};
  const t = section.type || section.id;

  switch (t) {
    case 'Hero Banner':
    case 'Hero Slider':
    case 'hero': {
      let slides = conf.slides;
      if (!slides || slides.length === 0) {
        slides = banners.map((b: any) => ({
          image: b.image, heading: b.title, subheading: b.subtitle,
          buttonText: b.ctaText, buttonLink: b.link,
        }));
      }
      return <HeroSliderClient slides={slides} settings={settings} />;
    }

    case 'USP Strip':
    case 'usp':
      return <USPStrip settings={settings} />;

    case 'Category Browser':
    case 'categories': {
      const catTitle  = conf.title    || 'Shop by Category';
      const catSub    = conf.subtitle || 'Explore our range of natural beauty products crafted for every skin type';
      const catLimit  = Math.min(conf.limit || 8, 4);
      if (categories.length === 0) return null;

      let displayCategories = categories;
      if (conf.selectedCategoryIds?.length > 0) {
        displayCategories = categories.filter((c: any) => conf.selectedCategoryIds.includes(c._id));
      }
      const cmsHasMore = displayCategories.length > catLimit;

      return (
        <section className="section">
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48 }}>
              <div>
                <p className="section-label">Collections</p>
                <h2 className="section-heading">{catTitle}</h2>
                <p style={{ color: '#6b6560', marginTop: 10, fontSize: 14, fontWeight: 300, maxWidth: 440 }}>{catSub}</p>
              </div>
              {cmsHasMore && (
                <Link href="/categories" className="btn-ghost" style={{ color: '#6b6560' }}>
                  All Categories <ArrowRight size={14} />
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {displayCategories.slice(0, catLimit).map((cat: ICategory) => (
                <CategoryCard key={cat._id} cat={cat} />
              ))}
            </div>
            {cmsHasMore && (
              <div style={{ textAlign: 'center', marginTop: 32 }}>
                <Link href="/categories" className="btn-outline" style={{ padding: '0.75rem 2.25rem' }}>View All Categories</Link>
              </div>
            )}
          </div>
        </section>
      );
    }

    case 'Product Grid':
    case 'bestsellers':
    case 'newarrivals': {
      let title    = conf.title;
      let subtitle = conf.subtitle;
      let data     = bestSellers;
      let sortOrCat = 'bestsellers';
      const source  = conf.source || (t === 'newarrivals' ? 'newarrivals' : 'bestsellers');

      if (source === 'bestsellers') {
        title    = title    || 'Best Sellers';
        subtitle = subtitle || 'Our most loved products, trusted by thousands';
        data     = bestSellers;
        sortOrCat = 'bestsellers';
      } else if (source === 'newarrivals') {
        title    = title    || 'New Arrivals';
        subtitle = subtitle || 'Fresh additions to your beauty routine';
        data     = newArrivals;
        sortOrCat = 'new';
      } else if (source === 'featured') {
        title    = title    || 'Featured Products';
        subtitle = subtitle || 'Handpicked selections just for you';
        data     = featured;
        sortOrCat = 'featured';
      } else if (source === 'category' && conf.categoryId) {
        title    = title    || 'Curated Collection';
        subtitle = subtitle || 'Explore specific ranges';
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
    }

    case 'Testimonial Slider':
    case 'testimonials':
      return (
        <div>
          {conf.title && (
            <div className="container" style={{ paddingTop: 64, paddingBottom: 8 }}>
              <h2 className="section-heading">{conf.title}</h2>
              {conf.subtitle && <p style={{ color: '#6b6560', marginTop: 8, fontWeight: 300 }}>{conf.subtitle}</p>}
            </div>
          )}
          <TestimonialsSection reviews={reviews} />
        </div>
      );

    case 'Blog Section':
    case 'blog':
      return (
        <div>
          {conf.title && (
            <div className="container" style={{ paddingTop: 64, paddingBottom: 8 }}>
              <h2 className="section-heading">{conf.title}</h2>
              {conf.subtitle && <p style={{ color: '#6b6560', marginTop: 8, fontWeight: 300 }}>{conf.subtitle}</p>}
            </div>
          )}
          <BlogSection blogs={blogs.slice(0, conf.limit || 3)} />
        </div>
      );

    case 'Newsletter':
    case 'newsletter':
      return null;

    case 'Custom HTML':
      return conf.html ? <div dangerouslySetInnerHTML={{ __html: conf.html }} /> : null;

    case 'Promo Banner':
      return conf.image ? (
        <section className="section-sm container">
          <Link href={conf.link || '#'}>
            <img src={conf.image} className="promo-img" alt="Promo" />
          </Link>
        </section>
      ) : null;

    default:
      return null;
  }
}

// ─── Main Page ───────────────────────────────────────────────────
export default async function HomePage() {
  const [settings, banners, categories, bestSellers, newArrivals, featured, blogs, reviews] = await Promise.all([
    getSettings(), getHeroBanners(), getCategories(), getBestSellers(),
    getNewArrivals(), getFeaturedProducts(), getBlogs(), getApprovedReviews(),
  ]);

  let sections = settings?.homepageSections ?? [];
  if (sections.length === 0) {
    sections = [
      { id: 'hero',         name: 'Hero Banner',  isEnabled: true, order: 0 },
      { id: 'usp',          name: 'USP Strip',    isEnabled: true, order: 1 },
      { id: 'categories',   name: 'Categories',   isEnabled: true, order: 2 },
      { id: 'bestsellers',  name: 'Best Sellers', isEnabled: true, order: 3 },
      { id: 'newarrivals',  name: 'New Arrivals', isEnabled: true, order: 4 },
      { id: 'testimonials', name: 'Testimonials', isEnabled: true, order: 5 },
      { id: 'blog',         name: 'Blog',         isEnabled: true, order: 6 },
    ] as any;
  }

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
