'use client';
import { useState } from 'react';
import { Facebook, Link2, Share2, CheckCheck } from 'lucide-react';

interface Props {
  url: string;
  title: string;
  image?: string;
  showLabel?: boolean;
}

export default function ShareButtons({ url, title, image, showLabel }: Props) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  };

  const openShare = (shareUrl: string) => {
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  /* Also try native share API on mobile */
  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url, text: title });
      } catch { /* cancelled */ }
    }
  };

  if (showLabel) {
    return (
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => openShare(shareLinks.facebook)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1877F2] text-white text-sm font-semibold hover:opacity-90 transition"
        >
          <Facebook size={14} /> Facebook
        </button>
        <button
          onClick={() => openShare(shareLinks.twitter)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-white text-sm font-semibold hover:opacity-90 transition"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg> Twitter / X
        </button>
        <button
          onClick={() => openShare(shareLinks.whatsapp)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25D366] text-white text-sm font-semibold hover:opacity-90 transition"
        >
          {/* WhatsApp icon (inline SVG) */}
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.118.554 4.107 1.523 5.826L.057 23.428a.5.5 0 0 0 .617.617l5.628-1.462A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.651-.503-5.17-1.381l-.367-.214-3.803.988.999-3.712-.235-.38A9.97 9.97 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
          </svg>
          WhatsApp
        </button>
        <button
          onClick={() => openShare(shareLinks.linkedin)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0A66C2] text-white text-sm font-semibold hover:opacity-90 transition"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          LinkedIn
        </button>
        <button
          onClick={copyLink}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition ${
            copied
              ? 'border-green-300 bg-green-50 text-green-700'
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          {copied ? <CheckCheck size={14} /> : <Link2 size={14} />}
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            onClick={nativeShare}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition"
          >
            <Share2 size={14} /> Share
          </button>
        )}
      </div>
    );
  }

  // Compact icon-only version (for article header)
  return (
    <div className="flex items-center gap-2 ml-auto">
      <span className="text-xs text-gray-400 mr-1">Share:</span>
      <button
        onClick={() => openShare(shareLinks.facebook)}
        title="Share on Facebook"
        className="w-7 h-7 flex items-center justify-center rounded-full bg-[#1877F2] text-white hover:opacity-90 transition"
      >
        <Facebook size={12} />
      </button>
      <button
        onClick={() => openShare(shareLinks.twitter)}
        title="Share on Twitter / X"
        className="w-7 h-7 flex items-center justify-center rounded-full bg-black text-white hover:opacity-90 transition"
      >
          <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
      </button>
      <button
        onClick={() => openShare(shareLinks.whatsapp)}
        title="Share on WhatsApp"
        className="w-7 h-7 flex items-center justify-center rounded-full bg-[#25D366] text-white hover:opacity-90 transition"
      >
        <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.118.554 4.107 1.523 5.826L.057 23.428a.5.5 0 0 0 .617.617l5.628-1.462A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.651-.503-5.17-1.381l-.367-.214-3.803.988.999-3.712-.235-.38A9.97 9.97 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
        </svg>
      </button>
      <button
        onClick={copyLink}
        title={copied ? 'Copied!' : 'Copy Link'}
        className={`w-7 h-7 flex items-center justify-center rounded-full border transition ${
          copied ? 'border-green-300 bg-green-50 text-green-600' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
        }`}
      >
        {copied ? <CheckCheck size={12} /> : <Link2 size={12} />}
      </button>
    </div>
  );
}
