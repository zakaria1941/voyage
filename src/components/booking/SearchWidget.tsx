import { useState } from 'react';
import { Plane, Hotel, Car, CarTaxiFront } from 'lucide-react';
import { FlightSearchForm } from '@/components/flight/FlightSearchForm';
import { HotelSearchForm } from '@/components/hotel/HotelSearchForm';
import { CarSearchForm } from '@/components/car/CarSearchForm';
import { TransferSearchForm } from '@/components/transfer/TransferSearchForm';
import { cn } from '@/utils/cn';
import type { BookingType } from '@/types/common';

const TABS: { type: BookingType; label: string; icon: typeof Plane }[] = [
  { type: 'flight', label: 'Flights', icon: Plane },
  { type: 'hotel', label: 'Hotels', icon: Hotel },
  { type: 'car', label: 'Cars', icon: Car },
  { type: 'transfer', label: 'Transfers', icon: CarTaxiFront },
];

export function SearchWidget({ defaultTab = 'flight', className }: { defaultTab?: BookingType; className?: string }) {
  const [active, setActive] = useState<BookingType>(defaultTab);

  return (
    <div className={cn('w-full rounded-3xl border border-ink-100 bg-white p-3 shadow-lifted sm:p-4', className)}>
      <div role="tablist" aria-label="Search by category" className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.type}
            role="tab"
            aria-selected={active === tab.type}
            onClick={() => setActive(tab.type)}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors',
              active === tab.type ? 'bg-brand-700 text-white shadow-soft' : 'text-ink-600 hover:bg-ink-100',
            )}
          >
            <tab.icon className="size-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4 px-1 pb-1 sm:px-2">
        {active === 'flight' && <FlightSearchForm />}
        {active === 'hotel' && <HotelSearchForm />}
        {active === 'car' && <CarSearchForm />}
        {active === 'transfer' && <TransferSearchForm />}
      </div>
    </div>
  );
}
