import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Hotel as HotelIcon } from 'lucide-react';
import { HotelCard } from '@/components/hotel/HotelCard';
import { HotelCardSkeleton } from '@/components/hotel/HotelCardSkeleton';
import { HotelFilters } from '@/components/hotel/HotelFilters';
import { HotelSearchForm } from '@/components/hotel/HotelSearchForm';
import { SortTabs } from '@/components/booking/SortTabs';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { useAsync } from '@/hooks/useAsync';
import { searchHotels } from '@/services/hotelService';
import type { HotelSearchParams } from '@/types/search';
import { DEFAULT_HOTEL_FILTERS, type HotelFiltersState } from '@/types/hotelFilters';
import { nightsBetween } from '@/utils/date';

type SortOption = 'recommended' | 'price' | 'rating';
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price', label: 'Price low → high' },
  { value: 'rating', label: 'Rating' },
];

function parseParams(searchParams: URLSearchParams): HotelSearchParams | null {
  const destination = searchParams.get('destination');
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  if (!destination || !checkIn || !checkOut) return null;
  return {
    destination,
    checkIn,
    checkOut,
    rooms: Number(searchParams.get('rooms') || 1),
    adults: Number(searchParams.get('adults') || 2),
    children: Number(searchParams.get('children') || 0),
  };
}

export default function HotelResultsPage() {
  const [searchParams] = useSearchParams();
  const params = useMemo(() => parseParams(searchParams), [searchParams]);

  const [sort, setSort] = useState<SortOption>('recommended');
  const [filters, setFilters] = useState<HotelFiltersState>(DEFAULT_HOTEL_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const hotels = useAsync(
    () => (params ? searchHotels({ destination: params.destination, sort: sort === 'rating' ? 'rating' : 'price' }) : Promise.resolve([])),
    [params?.destination, sort],
  );

  if (!params) {
    return (
      <div className="container-page py-16">
        <ErrorState title="We couldn’t read your search" description="Please start a new hotel search." />
      </div>
    );
  }

  const nights = nightsBetween(params.checkIn, params.checkOut);
  const all = hotels.data ?? [];
  const priceValues = all.map((h) => h.pricePerNight);
  const priceBounds = { min: Math.min(...(priceValues.length ? priceValues : [0])), max: Math.max(...(priceValues.length ? priceValues : [0])) };

  const filtered = all.filter((h) => {
    if (filters.maxPrice != null && h.pricePerNight > filters.maxPrice) return false;
    if (filters.minRating > 0 && h.reviewScore / 2 < filters.minRating) return false;
    if (filters.propertyTypes.length > 0 && !filters.propertyTypes.includes(h.propertyType)) return false;
    if (filters.breakfastOnly && !h.breakfastIncluded) return false;
    if (filters.freeCancellationOnly && !h.freeCancellation) return false;
    if (filters.amenities.length > 0 && !filters.amenities.every((a) => h.amenities.includes(a as never))) return false;
    return true;
  });

  function hotelHref(hotelId: string): string {
    const qs = new URLSearchParams({
      checkIn: params!.checkIn,
      checkOut: params!.checkOut,
      rooms: String(params!.rooms),
      adults: String(params!.adults),
      children: String(params!.children),
    });
    return `/hotels/${hotelId}?${qs.toString()}`;
  }

  return (
    <div className="container-page py-8">
      <div className="mb-6 rounded-2xl border border-ink-100 bg-white p-4 shadow-soft sm:p-5">
        <div>
          <p className="font-display text-lg font-bold text-ink-950">{params.destination}</p>
          <p className="mt-0.5 text-sm text-ink-500">
            {nights} night{nights !== 1 ? 's' : ''} · {params.rooms} room{params.rooms > 1 ? 's' : ''} · {params.adults + params.children} guests
          </p>
        </div>
        <details className="mt-4 border-t border-ink-100 pt-4">
          <summary className="cursor-pointer text-sm font-semibold text-brand-700">Modify search</summary>
          <div className="mt-4">
            <HotelSearchForm initial={params} />
          </div>
        </details>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
            <h2 className="mb-4 font-display text-base font-semibold text-ink-950">Filters</h2>
            <HotelFilters hotels={all} value={filters} onChange={setFilters} priceBounds={priceBounds} />
          </div>
        </aside>

        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <SortTabs options={SORT_OPTIONS} value={sort} onChange={setSort} />
            <button type="button" onClick={() => setFiltersOpen(true)} className="flex shrink-0 items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-1.5 text-sm font-medium text-ink-700 lg:hidden">
              <SlidersHorizontal className="size-4" />
              Filters
            </button>
          </div>

          {hotels.loading && (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <HotelCardSkeleton key={i} />
              ))}
            </div>
          )}

          {!hotels.loading && hotels.error && <ErrorState description={hotels.error} onRetry={hotels.refetch} />}

          {!hotels.loading && !hotels.error && filtered.length === 0 && (
            <EmptyState icon={<HotelIcon className="size-6" />} title="No hotels found" description="Try a different destination or adjust your filters." />
          )}

          {!hotels.loading && !hotels.error && filtered.length > 0 && (
            <div className="flex flex-col gap-4">
              {filtered.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} to={hotelHref(hotel.id)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-ink-950/40" onClick={() => setFiltersOpen(false)} />
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white p-5 animate-slide-up">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-ink-950">Filters</h2>
              <button type="button" onClick={() => setFiltersOpen(false)} className="text-sm font-semibold text-brand-700">
                Done
              </button>
            </div>
            <HotelFilters hotels={all} value={filters} onChange={setFilters} priceBounds={priceBounds} />
          </div>
        </div>
      )}
    </div>
  );
}
