import { useSearchParams } from 'react-router-dom';
import { FlightSearchForm } from '@/components/flight/FlightSearchForm';
import type { FlightSearchParams } from '@/types/search';

export default function FlightSearchPage() {
  const [params] = useSearchParams();
  const initial: Partial<FlightSearchParams> = {
    tripType: (params.get('tripType') as FlightSearchParams['tripType']) || undefined,
    origin: params.get('origin') || undefined,
    destination: params.get('destination') || undefined,
    departureDate: params.get('departureDate') || undefined,
    returnDate: params.get('returnDate') || undefined,
    adults: params.get('adults') ? Number(params.get('adults')) : undefined,
    children: params.get('children') ? Number(params.get('children')) : undefined,
    infants: params.get('infants') ? Number(params.get('infants')) : undefined,
    cabin: (params.get('cabin') as FlightSearchParams['cabin']) || undefined,
  };

  return (
    <div>
      <div className="bg-gradient-to-b from-brand-950 to-brand-800 pb-24 pt-14 sm:pb-28">
        <div className="container-page text-center">
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">Find your flight</h1>
          <p className="mt-2 text-white/70">Compare fares across airlines and cabins in seconds.</p>
        </div>
      </div>
      <div className="container-page -mt-16 pb-16 sm:-mt-20">
        <div className="rounded-3xl border border-ink-100 bg-white p-4 shadow-lifted sm:p-6">
          <FlightSearchForm initial={initial} />
        </div>
      </div>
    </div>
  );
}
