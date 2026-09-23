import React, { useRef, useState } from 'react';
import { UploadCloud, X } from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// ImageUpload — Secure file-upload component
//
// Security measures:
//  1. Strict MIME-type allowlist (no SVG/script types).
//  2. Hard 5 MB file-size limit enforced before reading.
//  3. Image is decoded through a canvas — strips EXIF/metadata
//     and ensures the payload is always a clean raster image.
//  4. Output is WebP at 0.8 quality, max 1200 px on longest side.
// ─────────────────────────────────────────────────────────────

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES  = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_DIMENSION_PX    = 1200;

export function ImageUpload({
  value,
  onChange,
  className = '',
  label = 'Upload Image',
  aspectRatio = 'auto',
}: {
  value: string;
  onChange: (base64: string) => void;
  className?: string;
  label?: string;
  aspectRatio?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const processFile = (file: File | undefined) => {
    setUploadError(null);

    if (!file) return;

    // 1 — MIME-type allowlist (browser-side; final check should be in Storage Rules)
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      setUploadError('Only JPEG, PNG, WebP, and GIF images are allowed.');
      return;
    }

    // 2 — File-size gate
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setUploadError(
        `Image must be under 5 MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)} MB.`
      );
      return;
    }

    // 3 — Decode through FileReader → Image → Canvas (strips metadata)
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        if (width > height) {
          if (width > MAX_DIMENSION_PX) { height = Math.round(height * MAX_DIMENSION_PX / width); width = MAX_DIMENSION_PX; }
        } else {
          if (height > MAX_DIMENSION_PX) { width = Math.round(width * MAX_DIMENSION_PX / height); height = MAX_DIMENSION_PX; }
        }

        const canvas = document.createElement('canvas');
        canvas.width  = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { setUploadError('Could not process image. Please try another file.'); return; }
        ctx.drawImage(img, 0, 0, width, height);

        // 4 — Output as WebP (strips EXIF entirely)
        const base64 = canvas.toDataURL('image/webp', 0.8);
        onChange(base64);
      };
      img.onerror = () => setUploadError('Invalid or corrupted image file.');
      img.src = event.target?.result as string;
    };
    reader.onerror = () => setUploadError('Could not read file.');
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFile(e.target.files?.[0]);
    // Reset input so the same file can be re-selected after clearing
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-slate-900 shadow-sm flex items-center justify-center">
          <img
            src={value}
            alt="Preview"
            className="w-full object-contain"
            style={{ aspectRatio: aspectRatio !== 'auto' ? aspectRatio : undefined, maxHeight: '300px' }}
          />
          <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
            <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-white text-slate-900 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-200 transition shadow-lg">
              Change
            </button>
            <button type="button" onClick={() => onChange('')} className="bg-red-500 text-white p-2 rounded-xl text-sm font-semibold hover:bg-red-600 transition shadow-lg aspect-square">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all bg-slate-900/50 ${
            isDragging ? 'border-baf-cyan bg-baf-cyan/10 scale-[1.01]' : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800'
          }`}
        >
          <div className={`p-3 rounded-full ${isDragging ? 'bg-baf-cyan/20 text-baf-cyan' : 'bg-slate-800 text-slate-400'}`}>
            <UploadCloud className="w-6 h-6" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-200">{label}</p>
            <p className="text-xs text-slate-400 mt-1">JPEG, PNG, WebP or GIF · max 5 MB</p>
          </div>
        </div>
      )}

      {uploadError && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {uploadError}
        </p>
      )}

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
