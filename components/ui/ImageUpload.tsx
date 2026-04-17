'use client';
import { useRef, useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Link } from 'lucide-react';
import { cn } from '../../lib/utils';
import { apiUpload } from '../../lib/api';

interface Props {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;          // e.g. "Recommended: 1200×628px"
  aspect?: string;        // e.g. "aspect-video" | "aspect-square"
  className?: string;
}

export default function ImageUpload({ value, onChange, label, hint, aspect = 'aspect-video', className }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [urlMode, setUrlMode] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const uploadFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await apiUpload<{ url: string }>('/upload', fd);
      onChange(res.url);
    } catch {
      // error toast is handled by global interceptor
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }, [uploadFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = '';
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) { onChange(urlInput.trim()); setUrlInput(''); setUrlMode(false); }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs text-gray-400 font-medium">{label}</label>
          {hint && <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded font-mono">{hint}</span>}
        </div>
      )}

      {/* Drop zone / preview */}
      <div
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => !value && !uploading && fileRef.current?.click()}
        className={cn(
          'relative rounded-xl border-2 overflow-hidden transition-all duration-200 cursor-pointer group',
          aspect,
          value
            ? 'border-gray-200 cursor-default'
            : dragOver
              ? 'border-blue-400 bg-blue-50 scale-[1.01]'
              : 'border-dashed border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100',
        )}>

        {/* Existing image */}
        {value && !uploading && (
          <>
            <img src={value} alt="upload preview" className="w-full h-full object-cover" />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
              <button type="button" onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}
                className="flex items-center gap-1.5 bg-white text-gray-800 text-xs font-semibold px-3 py-2 rounded-lg shadow hover:bg-gray-50 transition">
                <Upload size={13} /> Change
              </button>
              <button type="button" onClick={e => { e.stopPropagation(); onChange(''); }}
                className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow hover:bg-red-600 transition">
                <X size={13} /> Remove
              </button>
            </div>
          </>
        )}

        {/* Uploading spinner */}
        {uploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90">
            <Loader2 size={28} className="animate-spin text-blue-500 mb-2" />
            <p className="text-xs text-gray-500 font-medium">Uploading...</p>
          </div>
        )}

        {/* Empty state: choose/drag prompt */}
        {!value && !uploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
            <div className={cn('rounded-full p-3 transition-colors', dragOver ? 'bg-blue-100' : 'bg-gray-200 group-hover:bg-gray-300')}>
              <ImageIcon size={22} className={cn('transition-colors', dragOver ? 'text-blue-500' : 'text-gray-500')} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">
                {dragOver ? 'Drop to upload' : 'Click or drag & drop'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, WebP · Max 10 MB</p>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons row */}
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition">
          <Upload size={12} /> Choose file
        </button>
        <button type="button" onClick={() => setUrlMode(v => !v)}
          className={cn('flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition',
            urlMode ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50')}>
          <Link size={12} /> Paste URL
        </button>
        {value && (
          <button type="button" onClick={() => onChange('')}
            className="ml-auto flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition px-2 py-1.5">
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* URL input panel */}
      {urlMode && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleUrlSubmit())}
            placeholder="https://example.com/image.jpg"
            autoFocus
            className="input flex-1 text-sm"
          />
          <button type="button" onClick={handleUrlSubmit}
            className="btn-primary text-sm px-4 whitespace-nowrap">
            Use URL
          </button>
          <button type="button" onClick={() => { setUrlMode(false); setUrlInput(''); }}
            className="btn-outline text-sm px-3">
            Cancel
          </button>
        </div>
      )}

      {/* Hidden file input */}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
    </div>
  );
}
