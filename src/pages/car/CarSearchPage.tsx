import { useSearchParams } from 'react-router-dom';
import { CarSearchForm } from '@/components/car/CarSearchForm';
import type { CarSearchParams } from '@/types/search';

export default function CarSearchPage() {
  const [params] = useSearchParams();
  const initial: Partial<CarSearchParams> = {
    pickupLocation: params.get('pickupLocation') || undefined,
    dropoffLocation: params.get('dropoffLocation') || undefined,
    pickupDate: params.get('pickupDate') || undefined,
    pickupTime: params.get('pickupTime') || undefined,
    dropoffDate: params.get('dropoffDate') || undefined,
    dropoffTime: params.get('dropoffTime') || undefined,
    driverAge: params.get('driverAge') ? Number(params.get('driverAge')) : undefined,
  };

  return (
    <div>
      <div className="bg-gradient-to-b from-brand-950 to-brand-800 pb-24 pt-14 sm:pb-28">
        <div className="container-page text-center">
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">Find your rental car</h1>
          <p className="mt-2 text-white/70">Economy to luxury, with flexible pickup locations.</p>
        </div>
      </div>
      <div className="container-page -mt-16 pb-16 sm:-mt-20">
        <div className="rounded-3xl border border-ink-100 bg-white p-4 shadow-lifted sm:p-6">
          <CarSearchForm initial={initial} />
        </div>
      </div>
    </div>
  );
}
