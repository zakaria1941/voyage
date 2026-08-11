import type { Flight } from '@/types/flight';
import type { FlightFiltersState, DepartureWindow } from '@/types/flightFilters';
import { useCurrency } from '@/context/CurrencyContext';
import { cn } from '@/utils/cn';

interface FlightFiltersProps {
  flights: Flight[];
  value: FlightFiltersState;
  onChange: (value: FlightFiltersState) => void;
  priceBounds: { min: number; max: number };
}

const WINDOWS: { value: DepartureWindow; label: string; hint: string }[] = [
  { value: 'any', label: 'Any time', hint: '' },
  { value: 'morning', label: 'Morning', hint: '5am–12pm' },
  { value: 'afternoon', label: 'Afternoon', hint: '12pm–6pm' },
  { value: 'evening', label: 'Evening', hint: '6pm–12am' },
  { value: 'night', label: 'Night', hint: '12am–5am' },
];

export function FlightFilters({ flights, value, onChange, priceBounds }: FlightFiltersProps) {
  const { format } = useCurrency();
  const airlines = [...new Map(flights.map((f) => [f.airlineCode, f.airlineName])).entries()];

  function toggleAirline(code: string) {
    const next = value.airlines.includes(code) ? value.airlines.filter((a) => a !== code) : [...value.airlines, code];
    onChange({ ...value, airlines: next });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-ink-900">Stops</h3>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2.5 text-sm text-ink-700">
            <input type="checkbox" checked={value.direct} onChange={(e) => onChange({ ...value, direct: e.target.checked })} className="size-4 rounded border-ink-300 text-brand-700 focus:ring-accent-500/40" />
            Direct
          </label>
          <label className="flex items-center gap-2.5 text-sm text-ink-700">
            <input type="checkbox" checked={value.oneStop} onChange={(e) => onChange({ ...value, oneStop: e.target.checked })} className="size-4 rounded border-ink-300 text-brand-700 focus:ring-accent-500/40" />
            1 stop
          </label>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-ink-900">Departure time</h3>
        <div className="grid grid-cols-1 gap-1.5">
          {WINDOWS.map((w) => (
            <button
              key={w.value}
              type="button"
              onClick={() => onChange({ ...value, departureWindow: w.value })}
              className={cn(
                'flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                value.departureWindow === w.value ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-ink-200 text-ink-600 hover:border-ink-300',
              )}
            >
              {w.label}
              {w.hint && <span className="text-xs text-ink-400">{w.hint}</span>}
            </button>
          ))}
        </div>
      </div>

      {airlines.length > 1 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-ink-900">Airlines</h3>
          <div className="flex flex-col gap-2">
            {airlines.map(([code, name]) => (
              <label key={code} className="flex items-center gap-2.5 text-sm text-ink-700">
                <input type="checkbox" checked={value.airlines.includes(code)} onChange={() => toggleAirline(code)} className="size-4 rounded border-ink-300 text-brand-700 focus:ring-accent-500/40" />
                {name}
              </label>
            ))}
          </div>
        </div>
      )}

      {priceBounds.max > priceBounds.min && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-ink-900">Max price</h3>
          <input
            type="range"
            min={priceBounds.min}
            max={priceBounds.max}
            value={value.maxPrice ?? priceBounds.max}
            onChange={(e) => onChange({ ...value, maxPrice: Number(e.target.value) })}
            className="w-full accent-brand-700"
          />
          <p className="mt-1 text-sm text-ink-600">Up to {format(value.maxPrice ?? priceBounds.max)}</p>
        </div>
      )}
    </div>
  );
}
