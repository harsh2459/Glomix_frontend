'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ISiteSettings } from '../../types';

const FALLBACK_SLIDE = {
  heading: 'Beauty Rooted\nin Nature',
  subheading: 'Handcrafted with the finest natural ingredients for radiant, healthy skin.',
  buttonText: 'Shop Now',
  buttonLink: '/products',
  image: null,
};

const DEFAULT_TRUST_BADGES = [
  { icon: '🌿', text: '100% Natural' },
  { icon: '🐰', text: 'Cruelty Free' },
  { icon: '🇮🇳', text: 'Made in India' },
  { icon: '✨', text: 'Dermatologist Tested' },
];

export default function HeroSliderClient({ slides, settings }: { slides: any[]; settings?: ISiteSettings }) {
  const trustBadges = (settings?.heroTrustBadges && settings.heroTrustBadges.length > 0)
    ? [...settings.heroTrustBadges].sort((a, b) => a.order - b.order)
    : DEFAULT_TRUST_BADGES;

  const activeSlides = slides && slides.length > 0 ? slides : [FALLBACK_SLIDE];

  const renderSlideContent = (slide: any, i: number) => (
    <>
      {/* Background */}
      {slide.image ? (
        <>
          <Image
            src={slide.image}
            alt={slide.heading || 'Hero Banner'}
            fill
            className="object-cover"
            priority={i === 0}
            sizes="100vw"
          />
          {/* Gradient overlay — left side readable, right shows image */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(250,250,248,0.97) 0%, rgba(250,250,248,0.88) 35%, rgba(250,250,248,0.55) 55%, rgba(250,250,248,0.10) 75%, transparent 100%)' }} />
        </>
      ) : (
        /* Clean gradient background — no image */
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #f5f3ef 0%, #ede9e4 40%, #e8e2da 70%, #f0ece5 100%)' }}>
          {/* Minimal decorative blobs */}
          <div style={{ position: 'absolute', top: '10%', right: '8%', width: 420, height: 420, borderRadius: '50%', background: 'rgba(200,169,110,0.07)', filter: 'blur(80px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '5%', right: '22%', width: 280, height: 280, borderRadius: '50%', background: 'rgba(200,169,110,0.05)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        </div>
      )}

      {/* Content */}
      <div className="absolute inset-0 z-20" style={{ pointerEvents: 'none' }}>
        <div className="container relative h-full flex items-center">
          <div style={{ maxWidth: 560, paddingTop: 'clamp(64px, 8vw, 96px)', paddingBottom: 'clamp(64px, 8vw, 96px)', pointerEvents: 'auto' }}>

            {/* Eyebrow label */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontSize: 10.5, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase',
              color: '#6b6560', marginBottom: 24,
            }}>
              <span style={{ width: 20, height: 1, background: '#c8a96e', display: 'inline-block' }} />
              {settings?.siteName ? `${settings.siteName} — Natural Beauty` : 'Premium Natural Beauty'}
            </div>

            {/* Headline */}
            <h1
              style={{
                fontFamily: 'var(--font-playfair, serif)',
                fontSize: 'clamp(2.4rem, 5.5vw, 4.5rem)',
                fontWeight: 600,
                lineHeight: 1.08,
                letterSpacing: '-0.02em',
                color: '#0a0a0a',
                marginBottom: 24,
              }}
            >
              {slide.heading
                ? slide.heading.split('\n').map((line: string, li: number) => (
                    <span key={li} style={{ display: 'block' }}>{line}</span>
                  ))
                : <>Beauty Rooted<span style={{ display: 'block' }}>in Nature</span></>
              }
            </h1>

            <p style={{ fontSize: 'clamp(0.95rem, 1.5vw, 1.0625rem)', color: '#6b6560', lineHeight: 1.75, marginBottom: 36, maxWidth: 420, fontWeight: 300 }}>
              {slide.subheading || 'Discover our collection of handcrafted beauty products made with the finest natural ingredients.'}
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
              <Link
                href={slide.buttonLink || '/products'}
                className="btn-primary"
                style={{ gap: 8 }}
              >
                {slide.buttonText || 'Shop Now'}
                <ArrowRight size={15} />
              </Link>
              <Link
                href="/products?sort=bestsellers"
                className="btn-outline"
              >
                Best Sellers
              </Link>
            </div>

            {/* Trust badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 40 }}>
              {trustBadges.slice(0, 4).map((badge: any, bIdx: number) => (
                <div
                  key={bIdx}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 11.5, fontWeight: 400, color: '#6b6560',
                    background: 'rgba(255,255,255,0.70)',
                    backdropFilter: 'blur(8px)',
                    padding: '6px 12px',
                    borderRadius: 9999,
                    border: '1px solid rgba(0,0,0,0.07)',
                  }}
                >
                  <span>
                    {typeof badge.icon === 'string' && (badge.icon.startsWith('http') || badge.icon.startsWith('/'))
                      ? <img src={badge.icon} alt="" style={{ width: 13, height: 13, objectFit: 'contain' }} />
                      : badge.icon}
                  </span>
                  <span>{badge.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <section className="relative overflow-hidden group" style={{ minHeight: '92vh', display: 'flex', alignItems: 'center' }}>
      <Swiper
        modules={[Autoplay, EffectFade, Pagination, Navigation]}
        effect="fade"
        speed={1000}
        autoplay={{ delay: 5800, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation={{ prevEl: '.hero-prev', nextEl: '.hero-next' }}
        loop={activeSlides.length > 1}
        className="absolute inset-0 w-full h-full"
      >
        {activeSlides.map((slide, i) => (
          <SwiperSlide key={i} className="relative w-full h-full">
            {renderSlideContent(slide, i)}
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Nav arrows */}
      {activeSlides.length > 1 && (
        <>
          <button
            className="hero-prev absolute left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            aria-label="Previous"
            style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '50%', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', cursor: 'pointer', color: '#0a0a0a' }}
          >
            <ArrowRight className="rotate-180" size={16} />
          </button>
          <button
            className="hero-next absolute right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            aria-label="Next"
            style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '50%', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', cursor: 'pointer', color: '#0a0a0a' }}
          >
            <ArrowRight size={16} />
          </button>
        </>
      )}
    </section>
  );
}
