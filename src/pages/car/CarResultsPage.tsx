import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Car as CarIcon } from 'lucide-react';
import { CarCard } from '@/components/car/CarCard';
import { CarCardSkeleton } from '@/components/car/CarCardSkeleton';
import { CarFilters } from '@/components/car/CarFilters';
import { CarSearchForm } from '@/components/car/CarSearchForm';
import { SortTabs } from '@/components/booking/SortTabs';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { useAsync } from '@/hooks/useAsync';
import { useLanguage } from '@/context/LanguageContext';
import { searchCars } from '@/services/carService';
import type { CarSearchParams } from '@/types/search';
import { DEFAULT_CAR_FILTERS, type CarFiltersState } from '@/types/carFilters';
import { daysBetween } from '@/utils/date';

type SortOption = 'recommended' | 'price' | 'seats';
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price', label: 'Cheapest' },
  { value: 'seats', label: 'Most seats' },
];

/** Pick-up location is optional — an empty search browses the full public catalog. */
function parseParams(searchParams: URLSearchParams): CarSearchParams | null {
  const pickupDate = searchParams.get('pickupDate');
  const dropoffDate = searchParams.get('dropoffDate');
  if (!pickupDate || !dropoffDate) return null;
  const pickupLocation = searchParams.get('pickupLocation') || '';
  return {
    pickupLocation,
    dropoffLocation: searchParams.get('dropoffLocation') || pickupLocation,
    sameDropoff: true,
    pickupDate,
    pickupTime: searchParams.get('pickupTime') || '10:00',
    dropoffDate,
    dropoffTime: searchParams.get('dropoffTime') || '10:00',
    driverAge: Number(searchParams.get('driverAge') || 30),
  };
}

export default function CarResultsPage() {
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const params = useMemo(() => parseParams(searchParams), [searchParams]);

  const [sort, setSort] = useState<SortOption>('recommended');
  const [filters, setFilters] = useState<CarFiltersState>(DEFAULT_CAR_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const cars = useAsync(
    () => (params ? searchCars({ pickupLocation: params.pickupLocation, sort: sort === 'seats' ? 'seats' : 'price' }) : Promise.resolve([])),
    [params?.pickupLocation, sort],
  );

  if (!params) {
    return (
      <div className="container-page py-16">
        <ErrorState title="We couldn’t read your search" description="Please start a new car search." />
      </div>
    );
  }

  const days = Math.max(1, daysBetween(params.pickupDate, params.dropoffDate));
  const all = cars.data ?? [];
  const priceValues = all.map((c) => c.pricePerDay);
  const priceBounds = { min: Math.min(...(priceValues.length ? priceValues : [0])), max: Math.max(...(priceValues.length ? priceValues : [0])) };

  const filtered = all.filter((c) => {
    if (filters.maxPrice != null && c.pricePerDay > filters.maxPrice) return false;
    if (filters.categories.length > 0 && !filters.categories.includes(c.category)) return false;
    if (filters.transmission !== 'any' && c.transmission !== filters.transmission) return false;
    if (filters.minSeats > 0 && c.seats < filters.minSeats) return false;
    if (filters.suppliers.length > 0 && !filters.suppliers.includes(c.supplierName)) return false;
    return true;
  });

  function carHref(carId: string): string {
    const qs = new URLSearchParams({
      pickupLocation: params!.pickupLocation,
      dropoffLocation: params!.dropoffLocation,
      pickupDate: params!.pickupDate,
      pickupTime: params!.pickupTime,
      dropoffDate: params!.dropoffDate,
      dropoffTime: params!.dropoffTime,
      driverAge: String(params!.driverAge),
    });
    return `/cars/${carId}?${qs.toString()}`;
  }

  return (
    <div className="container-page py-8">
      <div className="mb-6 rounded-2xl border border-ink-100 bg-white p-4 shadow-soft sm:p-5">
        <div>
          <p className="font-display text-lg font-bold text-ink-950">{params.pickupLocation || t('search.cars.allCars')}</p>
          <p className="mt-0.5 text-sm text-ink-500">
            {days} day{days > 1 ? 's' : ''} · Pickup {params.pickupDate} · Driver age {params.driverAge}
          </p>
        </div>
        <details className="mt-4 border-t border-ink-100 pt-4">
          <summary className="cursor-pointer text-sm font-semibold text-brand-700">Modify search</summary>
          <div className="mt-4">
            <CarSearchForm initial={params} />
          </div>
        </details>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
            <h2 className="mb-4 font-display text-base font-semibold text-ink-950">Filters</h2>
            <CarFilters cars={all} value={filters} onChange={setFilters} priceBounds={priceBounds} />
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

          {!cars.loading && !cars.error && (
            <p className="mb-3 text-sm font-medium text-ink-600">
              {filtered.length === 1 ? t('search.results.carFound', { count: 1 }) : t('search.results.carsFound', { count: filtered.length })}
            </p>
          )}

          {cars.loading && (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <CarCardSkeleton key={i} />
              ))}
            </div>
          )}

          {!cars.loading && cars.error && <ErrorState description={cars.error} onRetry={cars.refetch} />}

          {!cars.loading && !cars.error && filtered.length === 0 && (
            <EmptyState icon={<CarIcon className="size-6" />} title="No cars found" description="Try a different pickup location or adjust your filters." />
          )}

          {!cars.loading && !cars.error && filtered.length > 0 && (
            <div className="flex flex-col gap-4">
              {filtered.map((car) => (
                <CarCard key={car.id} car={car} days={days} to={carHref(car.id)} />
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
            <CarFilters cars={all} value={filters} onChange={setFilters} priceBounds={priceBounds} />
          </div>
        </div>
      )}
    </div>
  );
}
