import { Metadata } from 'next';
import { Suspense } from 'react';
import ProductListingClient from './ProductListingClient';

export const metadata: Metadata = {
  title: 'All Products — Shop Natural Skincare',
  description: 'Browse our complete range of natural soaps, face creams, serums, and beauty essentials. Filter by category, price, and more.',
};

export default function ProductsPage() {
  return (
    <div className="section">
      <div className="container">
        <div className="mb-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">All Products</h1>
          <p className="text-gray-400">Discover our full range of natural beauty essentials</p>
        </div>
        <Suspense fallback={<div className="grid-products">{Array(8).fill(0).map((_, i) => <div key={i} className="skeleton rounded-2xl aspect-product" />)}</div>}>
          <ProductListingClient />
        </Suspense>
      </div>
    </div>
  );
}
