import type { Hotel, PropertyType } from '@/types/hotel';
import type { HotelFiltersState } from '@/types/hotelFilters';
import { useCurrency } from '@/context/CurrencyContext';
import { cn } from '@/utils/cn';

const PROPERTY_TYPES: PropertyType[] = ['hotel', 'apartment', 'resort', 'villa', 'hostel'];
const AMENITY_OPTIONS = ['wifi', 'pool', 'parking', 'gym', 'spa', 'air_conditioning', 'airport_shuttle', 'restaurant'] as const;

function label(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

interface HotelFiltersProps {
  hotels: Hotel[];
  value: HotelFiltersState;
  onChange: (value: HotelFiltersState) => void;
  priceBounds: { min: number; max: number };
}

export function HotelFilters({ value, onChange, priceBounds }: HotelFiltersProps) {
  const { format } = useCurrency();

  function toggle<K extends 'propertyTypes' | 'amenities'>(key: K, item: string) {
    const list = value[key] as string[];
    const next = list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
    onChange({ ...value, [key]: next });
  }

  return (
    <div className="flex flex-col gap-6">
      {priceBounds.max > priceBounds.min && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-ink-900">Max price / night</h3>
          <input
            type="range"
            min={priceBounds.min}
            max={priceBounds.max}
            value={value.maxPrice ?? priceBounds.max}
            onChange={(e) => onChange({ ...value, maxPrice: Number(e.target.value) })}
            className="w-full accent-brand-700"
          />
          <p className="mt-1 text-sm text-ink-600">Up to {format(value.maxPrice ?? priceBounds.max)}</p>
        </div>
      )}

      <div>
        <h3 className="mb-3 text-sm font-semibold text-ink-900">Rating</h3>
        <div className="flex flex-wrap gap-1.5">
          {[0, 3, 4, 4.5].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onChange({ ...value, minRating: r })}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                value.minRating === r ? 'border-brand-700 bg-brand-700 text-white' : 'border-ink-200 text-ink-600 hover:border-ink-300',
              )}
            >
              {r === 0 ? 'Any' : `${r}+`}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-ink-900">Property type</h3>
        <div className="flex flex-col gap-2">
          {PROPERTY_TYPES.map((t) => (
            <label key={t} className="flex items-center gap-2.5 text-sm capitalize text-ink-700">
              <input type="checkbox" checked={value.propertyTypes.includes(t)} onChange={() => toggle('propertyTypes', t)} className="size-4 rounded border-ink-300 text-brand-700 focus:ring-accent-500/40" />
              {t}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-ink-900">Booking options</h3>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2.5 text-sm text-ink-700">
            <input type="checkbox" checked={value.breakfastOnly} onChange={(e) => onChange({ ...value, breakfastOnly: e.target.checked })} className="size-4 rounded border-ink-300 text-brand-700 focus:ring-accent-500/40" />
            Breakfast included
          </label>
          <label className="flex items-center gap-2.5 text-sm text-ink-700">
            <input type="checkbox" checked={value.freeCancellationOnly} onChange={(e) => onChange({ ...value, freeCancellationOnly: e.target.checked })} className="size-4 rounded border-ink-300 text-brand-700 focus:ring-accent-500/40" />
            Free cancellation
          </label>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-ink-900">Amenities</h3>
        <div className="flex flex-col gap-2">
          {AMENITY_OPTIONS.map((a) => (
            <label key={a} className="flex items-center gap-2.5 text-sm text-ink-700">
              <input type="checkbox" checked={value.amenities.includes(a)} onChange={() => toggle('amenities', a)} className="size-4 rounded border-ink-300 text-brand-700 focus:ring-accent-500/40" />
              {label(a)}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
