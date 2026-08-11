import { useSearchParams } from 'react-router-dom';
import { HotelSearchForm } from '@/components/hotel/HotelSearchForm';
import type { HotelSearchParams } from '@/types/search';

export default function HotelSearchPage() {
  const [params] = useSearchParams();
  const initial: Partial<HotelSearchParams> = {
    destination: params.get('destination') || undefined,
    checkIn: params.get('checkIn') || undefined,
    checkOut: params.get('checkOut') || undefined,
    rooms: params.get('rooms') ? Number(params.get('rooms')) : undefined,
    adults: params.get('adults') ? Number(params.get('adults')) : undefined,
    children: params.get('children') ? Number(params.get('children')) : undefined,
  };

  return (
    <div>
      <div className="bg-gradient-to-b from-brand-950 to-brand-800 pb-24 pt-14 sm:pb-28">
        <div className="container-page text-center">
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">Find your stay</h1>
          <p className="mt-2 text-white/70">From boutique hotels to full-service resorts.</p>
        </div>
      </div>
      <div className="container-page -mt-16 pb-16 sm:-mt-20">
        <div className="rounded-3xl border border-ink-100 bg-white p-4 shadow-lifted sm:p-6">
          <HotelSearchForm initial={initial} />
        </div>
      </div>
    </div>
  );
}
