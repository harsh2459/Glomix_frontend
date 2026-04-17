import { Metadata } from 'next';
import { Suspense } from 'react';
import SearchClient from './SearchClient';

export const metadata: Metadata = {
  title: 'Search Products',
  description: 'Search for natural beauty and skincare products.',
};

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="container section">
        <div className="grid-products">{Array(8).fill(0).map((_, i) => <div key={i} className="skeleton rounded-2xl aspect-product" />)}</div>
      </div>
    }>
      <SearchClient />
    </Suspense>
  );
}
