import { Metadata } from 'next';
import { Suspense } from 'react';
import ProductListingClient from './ProductListingClient';

export const metadata: Metadata = {
  title: 'All Products — Shop Natural Skincare',
  description: 'Browse our complete range of natural soaps, face creams, serums, and beauty essentials.',
};

export default function ProductsPage() {
  return (
    <div className="min-h-screen" style={{ background: '#fafaf8' }}>

      {/* ── Page hero — cream background like the HTML ── */}
      <div style={{ background: '#f4f1ec', borderBottom: '1px solid #e8e4dd', padding: '56px 0 40px' }}>
        <div className="container">
          <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#b0a99e', marginBottom: 14 }}>
            Shop &nbsp;/&nbsp; <span style={{ color: '#4a453f' }}>All Products</span>
          </p>
          <h1 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: 'clamp(40px, 6vw, 68px)', fontWeight: 300, letterSpacing: '-0.01em', lineHeight: 1.05, color: '#0a0a0a' }}>
            All <em style={{ fontStyle: 'italic', color: '#a07840' }}>Products</em>
          </h1>
          <p style={{ marginTop: 10, color: '#4a453f', fontWeight: 300, fontSize: 15, maxWidth: 400 }}>
            Discover our full range of natural beauty essentials — cruelty-free, made in India.
          </p>
        </div>
      </div>

      {/* ── Shop layout ── */}
      <div className="container" style={{ paddingTop: 44, paddingBottom: 80 }}>
        <Suspense fallback={
          <div className="grid-products">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="rounded-xl" style={{ aspectRatio: '1/1', background: '#f4f1ec', animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        }>
          <ProductListingClient />
        </Suspense>
      </div>
    </div>
  );
}
