import { useState } from 'react';
import { cn } from '@/utils/cn';

export function ImageGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  if (images.length === 0) return null;

  return (
    <div>
      <div className="aspect-[16/9] w-full overflow-hidden rounded-2xl bg-ink-100">
        <img src={images[active]} alt={alt} className="size-full object-cover" />
      </div>
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1}`}
              aria-current={active === i}
              className={cn(
                'aspect-square overflow-hidden rounded-lg ring-2 transition-all',
                active === i ? 'ring-brand-600' : 'ring-transparent opacity-80 hover:opacity-100',
              )}
            >
              <img src={src} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
