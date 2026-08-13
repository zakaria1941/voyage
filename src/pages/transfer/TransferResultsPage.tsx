import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CarTaxiFront } from 'lucide-react';
import { TransferCard } from '@/components/transfer/TransferCard';
import { TransferCardSkeleton } from '@/components/transfer/TransferCardSkeleton';
import { TransferSearchForm } from '@/components/transfer/TransferSearchForm';
import { SortTabs } from '@/components/booking/SortTabs';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { useAsync } from '@/hooks/useAsync';
import { useLanguage } from '@/context/LanguageContext';
import { searchTransfers } from '@/services/transferService';
import type { TransferSearchParams, TransferVehicleType } from '@/types/search';
import { cn } from '@/utils/cn';

type SortOption = 'recommended' | 'price';
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price', label: 'Cheapest' },
];
const VEHICLE_TABS: { value: TransferVehicleType | 'any'; label: string }[] = [
  { value: 'any', label: 'All vehicles' },
  { value: 'standard', label: 'Standard' },
  { value: 'business', label: 'Business' },
  { value: 'van', label: 'Van' },
  { value: 'luxury', label: 'Luxury' },
];

/** Pickup airport and drop-off are each optional — an empty search browses the full public catalog. */
function parseParams(searchParams: URLSearchParams): TransferSearchParams | null {
  const date = searchParams.get('date');
  if (!date) return null;
  return {
    airport: searchParams.get('airport') || '',
    destination: searchParams.get('destination') || '',
    date,
    time: searchParams.get('time') || '12:00',
    passengers: Number(searchParams.get('passengers') || 1),
    luggage: Number(searchParams.get('luggage') || 1),
    vehicleType: 'any',
  };
}

export default function TransferResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const params = useMemo(() => parseParams(searchParams), [searchParams]);

  const [sort, setSort] = useState<SortOption>('recommended');
  const [vehicleFilter, setVehicleFilter] = useState<TransferVehicleType | 'any'>('any');

  const transfers = useAsync(
    () => (params ? searchTransfers({ airport: params.airport, destination: params.destination }) : Promise.resolve([])),
    [params?.airport, params?.destination],
  );

  if (!params) {
    return (
      <div className="container-page py-16">
        <ErrorState title="We couldn’t read your search" description="Please start a new transfer search." />
      </div>
    );
  }

  let filtered = (transfers.data ?? []).filter((t) => t.maxPassengers >= params.passengers && t.maxLuggage >= params.luggage);
  if (vehicleFilter !== 'any') filtered = filtered.filter((t) => t.vehicleType === vehicleFilter);
  filtered = [...filtered].sort((a, b) => (sort === 'price' ? a.pricePerTrip - b.pricePerTrip : a.pricePerTrip - b.pricePerTrip));

  function handleSelect(transferId: string) {
    const qs = new URLSearchParams({
      destination: params!.destination,
      date: params!.date,
      time: params!.time,
      passengers: String(params!.passengers),
      luggage: String(params!.luggage),
    });
    navigate(`/transfers/${transferId}?${qs.toString()}`);
  }

  function routeLabel(): string {
    const { airport, destination } = params!;
    if (airport && destination) return `${airport.toUpperCase()} → ${destination}`;
    if (airport) return t('search.transfers.fromOnly', { airport: airport.toUpperCase() });
    if (destination) return t('search.transfers.toOnly', { destination });
    return t('search.transfers.allTransfers');
  }

  return (
    <div className="container-page py-8">
      <div className="mb-6 rounded-2xl border border-ink-100 bg-white p-4 shadow-soft sm:p-5">
        <div>
          <p className="font-display text-lg font-bold text-ink-950">{routeLabel()}</p>
          <p className="mt-0.5 text-sm text-ink-500">
            {params.date} at {params.time} · {params.passengers} passenger{params.passengers > 1 ? 's' : ''} · {params.luggage} bag{params.luggage !== 1 ? 's' : ''}
          </p>
        </div>
        <details className="mt-4 border-t border-ink-100 pt-4">
          <summary className="cursor-pointer text-sm font-semibold text-brand-700">Modify search</summary>
          <div className="mt-4">
            <TransferSearchForm initial={params} />
          </div>
        </details>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {VEHICLE_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setVehicleFilter(tab.value)}
              className={cn('rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors', vehicleFilter === tab.value ? 'border-brand-700 bg-brand-700 text-white' : 'border-ink-200 text-ink-600 hover:border-ink-300')}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <SortTabs options={SORT_OPTIONS} value={sort} onChange={setSort} />
      </div>

      {!transfers.loading && !transfers.error && (
        <p className="mb-3 text-sm font-medium text-ink-600">
          {filtered.length === 1 ? t('search.results.transferFound', { count: 1 }) : t('search.results.transfersFound', { count: filtered.length })}
        </p>
      )}

      {transfers.loading && (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <TransferCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!transfers.loading && transfers.error && <ErrorState description={transfers.error} onRetry={transfers.refetch} />}

      {!transfers.loading && !transfers.error && filtered.length === 0 && (
        <EmptyState icon={<CarTaxiFront className="size-6" />} title="No transfers found" description="Try a different airport, or reduce your passenger/luggage count." />
      )}

      {!transfers.loading && !transfers.error && filtered.length > 0 && (
        <div className="flex flex-col gap-4">
          {filtered.map((t) => (
            <TransferCard key={t.id} transfer={t} onSelect={() => handleSelect(t.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
