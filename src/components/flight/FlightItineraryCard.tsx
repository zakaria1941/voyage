import { Luggage, Briefcase, ShieldCheck, Plane } from 'lucide-react';
import { AirlineLogo } from './AirlineLogo';
import { Badge } from '@/components/ui/Badge';
import { useLanguage } from '@/context/LanguageContext';
import type { Flight } from '@/types/flight';
import type { CabinClass } from '@/types/search';
import { CABIN_LABEL_KEYS } from '@/types/search';
import { formatDateLong, formatDurationMinutes, formatTime } from '@/utils/date';

export function FlightItineraryCard({ flight, cabin, label }: { flight: Flight; cabin: CabinClass; label: string }) {
  const { t } = useLanguage();
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <Badge tone="brand">{label}</Badge>
        <span className="text-xs text-ink-400">{formatDateLong(flight.departureTime)}</span>
      </div>

      <div className="flex items-center gap-3">
        <AirlineLogo code={flight.airlineCode} className="size-11" />
        <div>
          <p className="font-display text-base font-semibold text-ink-950">{flight.airlineName}</p>
          <p className="text-sm text-ink-500">
            {flight.flightNumber} · {flight.aircraft} · {t(CABIN_LABEL_KEYS[cabin])}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4 sm:gap-8">
        <div>
          <p className="font-display text-2xl font-bold text-ink-950">{formatTime(flight.departureTime)}</p>
          <p className="text-sm font-medium text-ink-600">{flight.originCode}</p>
        </div>
        <div className="flex flex-1 flex-col items-center">
          <p className="text-xs text-ink-400">{formatDurationMinutes(flight.durationMinutes)}</p>
          <div className="relative my-1.5 h-px w-full bg-ink-200">
            <Plane className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rotate-90 bg-white text-brand-600" />
          </div>
          <p className="text-xs text-ink-400">
            {flight.stops === 0 ? t('flight.direct') : `${flight.stops} ${flight.stops === 1 ? t('flight.stop') : t('flight.stops')}`}
          </p>
        </div>
        <div>
          <p className="font-display text-2xl font-bold text-ink-950">{formatTime(flight.arrivalTime)}</p>
          <p className="text-sm font-medium text-ink-600">{flight.destinationCode}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 border-t border-ink-100 pt-4 text-sm text-ink-600 sm:grid-cols-3">
        <div className="flex items-center gap-2">
          <Briefcase className="size-4 text-ink-400" />
          {t('flight.cabinBag')}: {flight.baggageCabin}
        </div>
        <div className="flex items-center gap-2">
          <Luggage className="size-4 text-ink-400" />
          {t('flight.checkedBag')}: {flight.baggageChecked}
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-ink-400" />
          {flight.cancellationPolicy}
        </div>
      </div>
    </div>
  );
}
