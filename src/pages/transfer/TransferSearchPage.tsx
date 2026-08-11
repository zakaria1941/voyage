import { useSearchParams } from 'react-router-dom';
import { TransferSearchForm } from '@/components/transfer/TransferSearchForm';
import type { TransferSearchParams } from '@/types/search';

export default function TransferSearchPage() {
  const [params] = useSearchParams();
  const initial: Partial<TransferSearchParams> = {
    airport: params.get('airport') || undefined,
    destination: params.get('destination') || undefined,
    date: params.get('date') || undefined,
    time: params.get('time') || undefined,
    passengers: params.get('passengers') ? Number(params.get('passengers')) : undefined,
    luggage: params.get('luggage') ? Number(params.get('luggage')) : undefined,
  };

  return (
    <div>
      <div className="bg-gradient-to-b from-brand-950 to-brand-800 pb-24 pt-14 sm:pb-28">
        <div className="container-page text-center">
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">Book an airport transfer</h1>
          <p className="mt-2 text-white/70">Door-to-door rides, no waiting in line.</p>
        </div>
      </div>
      <div className="container-page -mt-16 pb-16 sm:-mt-20">
        <div className="rounded-3xl border border-ink-100 bg-white p-4 shadow-lifted sm:p-6">
          <TransferSearchForm initial={initial} />
        </div>
      </div>
    </div>
  );
}
