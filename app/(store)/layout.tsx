import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { ISiteSettings } from '../../types';

async function getSettings(): Promise<ISiteSettings | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as ISiteSettings;
  } catch {
    return null;
  }
}

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return <StoreLayoutInner>{children}</StoreLayoutInner>;
}

async function StoreLayoutInner({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <div className="flex flex-col min-h-screen">
      <Header settings={settings} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
    </div>
  );
}
