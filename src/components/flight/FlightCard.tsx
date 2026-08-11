import { PlaneTakeoff } from 'lucide-react';
import { AirlineLogo } from './AirlineLogo';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useCurrency } from '@/context/CurrencyContext';
import type { Flight } from '@/types/flight';
import type { CabinClass } from '@/types/search';
import { formatTime, formatDurationMinutes } from '@/utils/date';

interface FlightCardProps {
  flight: Flight;
  cabin: CabinClass;
  onSelect: () => void;
}

export function FlightCard({ flight, cabin, onSelect }: FlightCardProps) {
  const { format } = useCurrency();
  const fare = flight.fares[cabin];

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-ink-100 bg-white p-5 shadow-soft transition-shadow hover:shadow-lifted sm:flex-row sm:items-center">
      <div className="flex items-center gap-3 sm:w-44">
        <AirlineLogo code={flight.airlineCode} className="size-10" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink-900">{flight.airlineName}</p>
          <p className="text-xs text-ink-500">{flight.flightNumber}</p>
        </div>
      </div>

      <div className="flex flex-1 items-center gap-4 sm:gap-6">
        <div className="text-center">
          <p className="font-display text-lg font-bold text-ink-950">{formatTime(flight.departureTime)}</p>
          <p className="text-xs font-medium text-ink-500">{flight.originCode}</p>
        </div>

        <div className="flex flex-1 flex-col items-center">
          <p className="text-xs text-ink-400">{formatDurationMinutes(flight.durationMinutes)}</p>
          <div className="relative my-1.5 h-px w-full bg-ink-200">
            <PlaneTakeoff className="absolute left-1/2 top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rotate-90 bg-white text-ink-400" />
          </div>
          <Badge tone={flight.stops === 0 ? 'success' : 'neutral'} className="text-[10px]">
            {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
          </Badge>
        </div>

        <div className="text-center">
          <p className="font-display text-lg font-bold text-ink-950">{formatTime(flight.arrivalTime)}</p>
          <p className="text-xs font-medium text-ink-500">{flight.destinationCode}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-ink-100 pt-4 sm:w-40 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
        <div className="text-left sm:text-right">
          <p className="font-display text-xl font-bold text-brand-800">{fare ? format(fare.price) : '—'}</p>
          <p className="text-xs text-ink-400">per passenger</p>
        </div>
        <Button onClick={onSelect} disabled={!fare || fare.seatsAvailable <= 0}>
          {fare && fare.seatsAvailable > 0 ? 'Select' : 'Sold out'}
        </Button>
      </div>
    </div>
  );
}
