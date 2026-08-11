import { useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { uploadImage, deleteImage, type UploadResult } from '@/services/cloudinaryService';
import { getFriendlyErrorMessage } from '@/utils/errors';
import { cn } from '@/utils/cn';

const MAX_SIZE_BYTES = 8 * 1024 * 1024;

interface ImageUploaderProps {
  value: UploadResult | null;
  onChange: (value: UploadResult | null) => void;
  /** Cloudinary folder this image belongs in, e.g. "voyago/hotels/abc123" (see cloudinaryService.buildImageFolder). */
  folder: string;
  shape?: 'square' | 'circle';
  className?: string;
}

export function ImageUploader({ value, onChange, folder, shape = 'square', className }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError('Image must be smaller than 8MB.');
      return;
    }
    const previous = value;
    setProgress(0);
    try {
      const result = await uploadImage(folder, file, setProgress);
      onChange(result);
      if (previous) void deleteImage(previous.publicId).catch(() => undefined);
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'Upload failed. Please try again.'));
    } finally {
      setProgress(null);
    }
  }

  function handleRemove() {
    const previous = value;
    onChange(null);
    if (previous) void deleteImage(previous.publicId).catch(() => undefined);
  }

  const uploading = progress !== null;

  return (
    <div className={cn('inline-flex flex-col gap-2', className)}>
      <div
        className={cn(
          'relative flex size-28 items-center justify-center overflow-hidden border-2 border-dashed border-ink-200 bg-ink-50 text-ink-400 transition-colors hover:border-brand-400',
          shape === 'circle' ? 'rounded-full' : 'rounded-2xl',
        )}
      >
        {value && !uploading && <img src={value.url} alt="" className="size-full object-cover" />}
        {!value && !uploading && <ImagePlus className="size-6" />}
        {uploading && (
          <div className="flex flex-col items-center gap-1 text-brand-600">
            <Loader2 className="size-5 animate-spin" />
            <span className="text-[10px] font-semibold">{progress}%</span>
          </div>
        )}

        {value && !uploading && (
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Remove image"
            className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-ink-950/70 text-white hover:bg-ink-950"
          >
            <X className="size-3.5" />
          </button>
        )}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="absolute inset-0"
          aria-label={value ? 'Replace image' : 'Upload image'}
        />
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {error && <p className="max-w-28 text-xs font-medium text-danger-600">{error}</p>}
    </div>
  );
}
