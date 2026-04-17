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
import { Sparkles, ArrowRight } from 'lucide-react';
import { ISiteSettings } from '../../types';

export default function HeroSliderClient({ slides, settings }: { slides: any[]; settings?: ISiteSettings }) {
  const trustBadges = (settings?.heroTrustBadges && settings.heroTrustBadges.length > 0)
    ? [...settings.heroTrustBadges].sort((a, b) => a.order - b.order)
    : [];

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-gray-50 group">
      {/* Decorative blobs */}
      <div className="absolute top-20 right-20 w-96 h-96 rounded-full bg-gray-200/60 blur-3xl pointer-events-none z-10" />
      <div className="absolute bottom-20 left-10 w-72 h-72 rounded-full bg-gray-100/80 blur-3xl pointer-events-none z-10" />

      <Swiper
        modules={[Autoplay, EffectFade, Pagination, Navigation]}
        effect="fade"
        speed={1000}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true, renderBullet: () => '<span class="swiper-bullet-custom bg-black/20 hover:bg-black/40 w-10 h-1.5 rounded transition block"></span>', bulletClass: 'swiper-bullet-custom-class' }}
        navigation={{
           prevEl: '.hero-prev',
           nextEl: '.hero-next'
        }}
        loop={slides.length > 1}
        className="absolute inset-0 w-full h-full"
      >
        {slides.map((slide, i) => (
          <SwiperSlide key={i} className="w-full h-full">
            {slide.buttonLink ? (
              <Link href={slide.buttonLink} className="block w-full h-full relative cursor-pointer">
                {slide.image && (
                  <>
                    <Image
                      src={slide.image}
                      alt={slide.heading || 'Hero Banner'}
                      fill
                      className="object-cover opacity-60"
                      priority={i === 0}
                      sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />
                  </>
                )}
              </Link>
            ) : (
                <div className="block w-full h-full relative">
                {slide.image && (
                  <>
                    <Image
                      src={slide.image}
                      alt={slide.heading || 'Hero Banner'}
                      fill
                      className="object-cover opacity-60"
                      priority={i === 0}
                      sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-50 via-gray-50/80 to-transparent" />
                  </>
                )}
                </div>
            )}
            
            <div className="absolute inset-0 z-20 pointer-events-none">
              <div className="container relative h-full flex items-center">
                <div className="max-w-2xl pointer-events-auto mt-20 md:mt-0">
                  <div className="flex items-center gap-2 mb-6">
                    <Sparkles size={16} className="text-gray-500" />
                    <span className="text-gray-500 text-sm font-medium tracking-wider uppercase">
                      Premium Natural Beauty
                    </span>
                  </div>
                  <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-gray-900">
                    {slide.heading || (
                      <>
                        Glow with
                        <br />
                        <span className="text-gray-700">Pure Nature</span>
                      </>
                    )}
                  </h1>
                  <p className="text-gray-600 text-lg md:text-xl leading-relaxed mb-8 max-w-xl">
                    {slide.subheading || 'Discover our collection of handcrafted products.'}
                  </p>
                  
                  {(slide.buttonText || slide.buttonLink) && (
                    <div className="flex flex-wrap gap-4">
                      {slide.buttonLink ? (
                        <Link href={slide.buttonLink} className="btn-primary text-base px-8 py-4">
                          {slide.buttonText || 'Shop Now'}
                          <ArrowRight size={18} />
                        </Link>
                      ) : (
                        <span className="btn-primary text-base px-8 py-4 cursor-default">
                          {slide.buttonText || 'Shop Now'}
                        </span>
                      )}
                      <Link href="/products?featured=true" className="btn-outline text-base px-8 py-4 bg-white/50 backdrop-blur-sm">
                        Best Sellers
                      </Link>
                    </div>
                  )}

                  {/* Trust Badges directly inside slide container */}
                  {trustBadges.length > 0 && i === 0 && (
                     <div className="flex flex-wrap gap-6 mt-14 opacity-80 z-30 relative">
                        {trustBadges.map((badge, bIdx) => (
                           <div key={bIdx} className="flex items-center gap-2 text-sm text-gray-700 bg-white/60 backdrop-blur py-1.5 px-3 rounded-xl border border-white/40 shadow-sm">
                             <span className="flex items-center justify-center">
                               {badge.icon?.startsWith('http') || badge.icon?.startsWith('/') || badge.icon?.startsWith('data:') ? (
                                 // eslint-disable-next-line @next/next/no-img-element
                                 <img src={badge.icon} alt={badge.text} className="w-4 h-4 object-contain" />
                               ) : badge.icon}
                             </span>
                             <span className="font-medium">{badge.text}</span>
                           </div>
                        ))}
                     </div>
                  )}
                </div>
              </div>
            </div>
            
          </SwiperSlide>
        ))}
        
        {/* Navigation Arrows */}
        {slides.length > 1 && (
            <>
               <div className="hero-prev absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/50 hover:bg-white border shadow-lg rounded-full flex items-center justify-center cursor-pointer transition text-gray-800 opacity-0 group-hover:opacity-100 backdrop-blur-sm -translate-x-10 group-hover:translate-x-0">
                  <ArrowRight className="rotate-180" size={20} />
               </div>
               <div className="hero-next absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/50 hover:bg-white border shadow-lg rounded-full flex items-center justify-center cursor-pointer transition text-gray-800 opacity-0 group-hover:opacity-100 backdrop-blur-sm translate-x-10 group-hover:translate-x-0">
                  <ArrowRight size={20} />
               </div>
            </>
        )}
      </Swiper>
      {/* Pagination Container */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2 hero-pagination"></div>
    </section>
  );
}
