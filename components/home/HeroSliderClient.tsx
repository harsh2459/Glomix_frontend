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
import { Sparkles, ArrowRight, Leaf, Shield, Star } from 'lucide-react';
import { ISiteSettings } from '../../types';

// Default fallback hero shown when no banners are in DB
const FALLBACK_SLIDE = {
  heading: 'Glow with\nPure Nature',
  subheading: 'Handcrafted with love — natural ingredients for radiant, healthy skin.',
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

  // Use fallback when no slides from DB
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
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/75 to-white/20" />
        </>
      ) : (
        /* Gradient background when no image */
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-pink-50/40 to-purple-50/30">
          {/* Decorative circles */}
          <div className="absolute top-10 right-[15%] w-80 h-80 rounded-full bg-pink-100/60 blur-3xl" />
          <div className="absolute bottom-10 right-[5%] w-64 h-64 rounded-full bg-purple-100/40 blur-3xl" />
          <div className="absolute top-1/2 right-[30%] w-48 h-48 rounded-full bg-rose-100/50 blur-2xl" />
          {/* Decorative product mockup */}
          <div className="absolute right-8 md:right-24 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-4 items-center opacity-20">
            <div className="w-32 h-48 rounded-2xl bg-gradient-to-b from-pink-300 to-rose-400 shadow-xl" />
            <div className="w-20 h-32 rounded-2xl bg-gradient-to-b from-purple-300 to-pink-400 shadow-xl -mt-8 ml-20" />
            <div className="w-24 h-36 rounded-2xl bg-gradient-to-b from-rose-200 to-pink-300 shadow-xl -mt-16 -ml-12" />
          </div>
        </div>
      )}

      {/* Content overlay */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <div className="container relative h-full flex items-center">
          <div className="max-w-2xl pointer-events-auto py-20 md:py-0">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-pink-100 text-pink-600 text-xs font-semibold px-4 py-2 rounded-full mb-6 shadow-sm">
              <Sparkles size={13} />
              {settings?.siteName ? `${settings.siteName} — Premium Natural Beauty` : 'Premium Natural Beauty'}
            </div>

            {/* Heading */}
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-5 text-gray-900">
              {slide.heading
                ? slide.heading.split('\n').map((line: string, li: number) => (
                    <span key={li}>{line}{li < slide.heading.split('\n').length - 1 && <br />}</span>
                  ))
                : <>Glow with<br /><span style={{ color: 'var(--color-primary)' }}>Pure Nature</span></>
              }
            </h1>

            <p className="text-gray-500 text-base md:text-lg leading-relaxed mb-8 max-w-xl">
              {slide.subheading || 'Discover our collection of handcrafted beauty products made with the finest natural ingredients.'}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              {slide.buttonLink ? (
                <Link href={slide.buttonLink} className="btn-primary text-sm md:text-base px-7 py-3.5 gap-2">
                  {slide.buttonText || 'Shop Now'} <ArrowRight size={17} />
                </Link>
              ) : (
                <Link href="/products" className="btn-primary text-sm md:text-base px-7 py-3.5 gap-2">
                  Shop Now <ArrowRight size={17} />
                </Link>
              )}
              <Link href="/products?sort=bestsellers" className="btn-outline text-sm md:text-base px-7 py-3.5" style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)' }}>
                Best Sellers
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3 mt-10">
              {trustBadges.slice(0, 4).map((badge: any, bIdx: number) => (
                <div key={bIdx} className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-white/70 backdrop-blur-sm py-1.5 px-3 rounded-full border border-gray-100 shadow-sm">
                  <span>{typeof badge.icon === 'string' && (badge.icon.startsWith('http') || badge.icon.startsWith('/'))
                    ? <img src={badge.icon} alt="" className="w-3.5 h-3.5 object-contain" />
                    : badge.icon
                  }</span>
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
    <section className="relative min-h-[88vh] flex items-center overflow-hidden group">
      <Swiper
        modules={[Autoplay, EffectFade, Pagination, Navigation]}
        effect="fade"
        speed={900}
        autoplay={{ delay: 5500, disableOnInteraction: false }}
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

      {/* Nav arrows — only show when multiple slides */}
      {activeSlides.length > 1 && (
        <>
          <button className="hero-prev absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 bg-white/80 hover:bg-white border border-gray-100 shadow-lg rounded-full flex items-center justify-center transition-all text-gray-700 opacity-0 group-hover:opacity-100 backdrop-blur-sm" aria-label="Previous">
            <ArrowRight className="rotate-180" size={18} />
          </button>
          <button className="hero-next absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 bg-white/80 hover:bg-white border border-gray-100 shadow-lg rounded-full flex items-center justify-center transition-all text-gray-700 opacity-0 group-hover:opacity-100 backdrop-blur-sm" aria-label="Next">
            <ArrowRight size={18} />
          </button>
        </>
      )}
    </section>
  );
}
