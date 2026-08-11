import { MapPin, ExternalLink } from 'lucide-react';

export function LocationMapCard({ address, city, country }: { address: string; city: string; country: string }) {
  const query = encodeURIComponent(`${address}, ${city}, ${country}`);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft">
      <div className="relative flex h-48 items-center justify-center overflow-hidden bg-brand-50">
        <svg className="absolute inset-0 size-full opacity-40" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="map-grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="var(--color-brand-200)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#map-grid)" />
        </svg>
        <span className="relative flex size-12 items-center justify-center rounded-full bg-brand-700 text-white shadow-lifted">
          <MapPin className="size-6" />
        </span>
      </div>
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink-900">{address}</p>
          <p className="text-xs text-ink-500">{city}, {country}</p>
        </div>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          Open map
          <ExternalLink className="size-3.5" />
        </a>
      </div>
    </div>
  );
}
