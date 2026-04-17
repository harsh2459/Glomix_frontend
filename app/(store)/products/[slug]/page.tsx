import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';
import { IProduct } from '../../../../types';

interface Props { params: Promise<{ slug: string }> }

async function getProduct(slug: string): Promise<{ product: IProduct; related: IProduct[] } | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${slug}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return (await res.json()).data;
  } catch { return null; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProduct(slug);
  if (!data) return { title: 'Product Not Found' };
  const { product } = data;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://glomix.in';
  return {
    title: product.seo.metaTitle || `${product.name} — Glomix`,
    description: product.seo.metaDescription || product.shortDescription || `Buy ${product.name} from Glomix. Premium natural beauty product.`,
    keywords: product.seo.keywords,
    openGraph: {
      title: product.seo.metaTitle || product.name,
      description: product.seo.metaDescription || product.shortDescription || '',
      images: product.images[0] ? [{ url: product.images[0], alt: product.name }] : [],
      url: `${siteUrl}/products/${product.slug}`,
      type: 'website',
    },
    alternates: { canonical: `${siteUrl}/products/${product.slug}` },
    other: {
      'product:price:amount': String(product.salePrice || product.price),
      'product:price:currency': 'INR',
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const data = await getProduct(slug);
  if (!data) notFound();
  const { product, related } = data;

  // JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images,
    description: product.shortDescription || product.description,
    sku: product.sku,
    brand: { '@type': 'Brand', name: 'Glomix' },
    offers: {
      '@type': 'Offer',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/products/${product.slug}`,
      priceCurrency: 'INR',
      price: product.salePrice || product.price,
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    aggregateRating: product.reviewCount > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    } : undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductDetailClient product={product} related={related} />
    </>
  );
}
