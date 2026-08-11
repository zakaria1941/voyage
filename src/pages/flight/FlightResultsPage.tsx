import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, PlaneTakeoff } from 'lucide-react';
import { FlightCard } from '@/components/flight/FlightCard';
import { FlightCardSkeleton } from '@/components/flight/FlightCardSkeleton';
import { FlightFilters } from '@/components/flight/FlightFilters';
import { FlightSearchForm } from '@/components/flight/FlightSearchForm';
import { SortTabs } from '@/components/booking/SortTabs';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Badge } from '@/components/ui/Badge';
import { useAsync } from '@/hooks/useAsync';
import { searchFlights } from '@/services/flightService';
import type { Flight } from '@/types/flight';
import type { CabinClass, FlightSearchParams } from '@/types/search';
import { CABIN_LABELS } from '@/types/search';
import { DEFAULT_FLIGHT_FILTERS, isWithinDepartureWindow, type FlightFiltersState } from '@/types/flightFilters';
import { formatDateLong } from '@/utils/date';

type SortOption = 'recommended' | 'cheapest' | 'fastest' | 'earliest';
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'cheapest', label: 'Cheapest' },
  { value: 'fastest', label: 'Fastest' },
  { value: 'earliest', label: 'Earliest departure' },
];

function parseParams(searchParams: URLSearchParams): FlightSearchParams | null {
  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const departureDate = searchParams.get('departureDate');
  if (!origin || !destination || !departureDate) return null;
  return {
    tripType: (searchParams.get('tripType') as FlightSearchParams['tripType']) || 'oneway',
    origin,
    destination,
    departureDate,
    returnDate: searchParams.get('returnDate') || undefined,
    adults: Number(searchParams.get('adults') || 1),
    children: Number(searchParams.get('children') || 0),
    infants: Number(searchParams.get('infants') || 0),
    cabin: (searchParams.get('cabin') as CabinClass) || 'economy',
  };
}

function applyFiltersAndSort(flights: Flight[], cabin: CabinClass, filters: FlightFiltersState, sort: SortOption): Flight[] {
  let result = flights.filter((f) => f.fares[cabin]);

  if (filters.direct || filters.oneStop) {
    result = result.filter((f) => (filters.direct && f.stops === 0) || (filters.oneStop && f.stops > 0));
  }
  if (filters.airlines.length > 0) {
    result = result.filter((f) => filters.airlines.includes(f.airlineCode));
  }
  if (filters.maxPrice != null) {
    result = result.filter((f) => (f.fares[cabin]?.price ?? Infinity) <= filters.maxPrice!);
  }
  if (filters.departureWindow !== 'any') {
    result = result.filter((f) => isWithinDepartureWindow(new Date(f.departureTime).getHours(), filters.departureWindow));
  }

  const withScore = result.map((f) => ({ f, price: f.fares[cabin]?.price ?? Infinity }));
  switch (sort) {
    case 'cheapest':
      withScore.sort((a, b) => a.price - b.price);
      break;
    case 'fastest':
      withScore.sort((a, b) => a.f.durationMinutes - b.f.durationMinutes);
      break;
    case 'earliest':
      withScore.sort((a, b) => a.f.departureTime - b.f.departureTime);
      break;
    default:
      withScore.sort((a, b) => a.price + a.f.durationMinutes / 10 - (b.price + b.f.durationMinutes / 10));
  }
  return withScore.map((s) => s.f);
}

export default function FlightResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const params = useMemo(() => parseParams(searchParams), [searchParams]);

  const [step, setStep] = useState<'outbound' | 'return'>('outbound');
  const [selectedOutbound, setSelectedOutbound] = useState<Flight | null>(null);
  const [filters, setFilters] = useState<FlightFiltersState>(DEFAULT_FLIGHT_FILTERS);
  const [sort, setSort] = useState<SortOption>('recommended');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const outbound = useAsync(
    () => (params ? searchFlights({ origin: params.origin, destination: params.destination, departureDate: params.departureDate }) : Promise.resolve([])),
    [params?.origin, params?.destination, params?.departureDate],
  );

  const isReturnLeg = step === 'return' && params?.tripType === 'roundtrip';
  const returnLeg = useAsync(
    () =>
      params && params.tripType === 'roundtrip' && params.returnDate
        ? searchFlights({ origin: params.destination, destination: params.origin, departureDate: params.returnDate })
        : Promise.resolve([]),
    [params?.tripType, params?.origin, params?.destination, params?.returnDate],
  );

  if (!params) {
    return (
      <div className="container-page py-16">
        <ErrorState title="We couldn’t read your search" description="Please start a new flight search." />
      </div>
    );
  }

  const active = isReturnLeg ? returnLeg : outbound;
  const activeFlights = active.data ?? [];
  const filteredSorted = applyFiltersAndSort(activeFlights, params.cabin, filters, sort);
  const priceValues = activeFlights.map((f) => f.fares[params.cabin]?.price ?? 0).filter(Boolean);
  const priceBounds = { min: Math.min(...(priceValues.length ? priceValues : [0])), max: Math.max(...(priceValues.length ? priceValues : [0])) };

  function handleSelect(flight: Flight) {
    if (params!.tripType === 'roundtrip' && step === 'outbound') {
      setSelectedOutbound(flight);
      setStep('return');
      setFilters(DEFAULT_FLIGHT_FILTERS);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const outboundId = params!.tripType === 'roundtrip' ? selectedOutbound!.id : flight.id;
    const qs = new URLSearchParams({
      cabin: params!.cabin,
      adults: String(params!.adults),
      children: String(params!.children),
      infants: String(params!.infants),
      tripType: params!.tripType,
    });
    if (params!.tripType === 'roundtrip') qs.set('returnId', flight.id);
    navigate(`/flights/${outboundId}?${qs.toString()}`);
  }

  const legLabel = isReturnLeg
    ? `${params.destination} → ${params.origin} · ${formatDateLong(params.returnDate!)}`
    : `${params.origin} → ${params.destination} · ${formatDateLong(params.departureDate)}`;

  return (
    <div className="container-page py-8">
      <div className="mb-6 rounded-2xl border border-ink-100 bg-white p-4 shadow-soft sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 font-display text-lg font-bold text-ink-950">
              <PlaneTakeoff className="size-5 text-brand-600" />
              {legLabel}
            </p>
            <p className="mt-0.5 text-sm text-ink-500">
              {params.adults + params.children + params.infants} passenger{params.adults + params.children + params.infants > 1 ? 's' : ''} · {CABIN_LABELS[params.cabin]}
              {params.tripType === 'roundtrip' && (
                <>
                  {' '}
                  · <Badge tone={isReturnLeg ? 'brand' : 'neutral'} className="ml-1">{isReturnLeg ? 'Selecting return' : 'Selecting outbound'}</Badge>
                </>
              )}
            </p>
          </div>
          {selectedOutbound && isReturnLeg && (
            <div className="rounded-xl bg-ink-50 px-3 py-2 text-xs text-ink-600">
              Outbound: <span className="font-semibold text-ink-900">{selectedOutbound.airlineName} {selectedOutbound.flightNumber}</span>
            </div>
          )}
        </div>
        <details className="mt-4 border-t border-ink-100 pt-4">
          <summary className="cursor-pointer text-sm font-semibold text-brand-700">Modify search</summary>
          <div className="mt-4">
            <FlightSearchForm initial={params} />
          </div>
        </details>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
            <h2 className="mb-4 font-display text-base font-semibold text-ink-950">Filters</h2>
            <FlightFilters flights={activeFlights} value={filters} onChange={setFilters} priceBounds={priceBounds} />
          </div>
        </aside>

        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <SortTabs options={SORT_OPTIONS} value={sort} onChange={setSort} />
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-1.5 text-sm font-medium text-ink-700 lg:hidden"
            >
              <SlidersHorizontal className="size-4" />
              Filters
            </button>
          </div>

          {active.loading && (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <FlightCardSkeleton key={i} />
              ))}
            </div>
          )}

          {!active.loading && active.error && <ErrorState description={active.error} onRetry={active.refetch} />}

          {!active.loading && !active.error && filteredSorted.length === 0 && (
            <EmptyState
              icon={<PlaneTakeoff className="size-6" />}
              title="No flights found"
              description="Try different dates or airports — this demo dataset covers a curated set of routes."
            />
          )}

          {!active.loading && !active.error && filteredSorted.length > 0 && (
            <div className="flex flex-col gap-4">
              {filteredSorted.map((flight) => (
                <FlightCard key={flight.id} flight={flight} cabin={params.cabin} onSelect={() => handleSelect(flight)} />
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
            <FlightFilters flights={activeFlights} value={filters} onChange={setFilters} priceBounds={priceBounds} />
          </div>
        </div>
      )}
    </div>
  );
}
