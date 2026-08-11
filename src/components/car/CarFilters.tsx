import type { Car } from '@/types/car';
import type { CarCategory } from '@/types/search';
import type { CarFiltersState } from '@/types/carFilters';
import { useCurrency } from '@/context/CurrencyContext';
import { cn } from '@/utils/cn';

const CATEGORIES: CarCategory[] = ['economy', 'compact', 'sedan', 'suv', 'luxury', 'van', 'electric'];

interface CarFiltersProps {
  cars: Car[];
  value: CarFiltersState;
  onChange: (value: CarFiltersState) => void;
  priceBounds: { min: number; max: number };
}

export function CarFilters({ cars, value, onChange, priceBounds }: CarFiltersProps) {
  const { format } = useCurrency();
  const suppliers = [...new Set(cars.map((c) => c.supplierName))];

  function toggleCategory(cat: CarCategory) {
    const next = value.categories.includes(cat) ? value.categories.filter((c) => c !== cat) : [...value.categories, cat];
    onChange({ ...value, categories: next });
  }
  function toggleSupplier(name: string) {
    const next = value.suppliers.includes(name) ? value.suppliers.filter((s) => s !== name) : [...value.suppliers, name];
    onChange({ ...value, suppliers: next });
  }

  return (
    <div className="flex flex-col gap-6">
      {priceBounds.max > priceBounds.min && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-ink-900">Max price / day</h3>
          <input type="range" min={priceBounds.min} max={priceBounds.max} value={value.maxPrice ?? priceBounds.max} onChange={(e) => onChange({ ...value, maxPrice: Number(e.target.value) })} className="w-full accent-brand-700" />
          <p className="mt-1 text-sm text-ink-600">Up to {format(value.maxPrice ?? priceBounds.max)}</p>
        </div>
      )}

      <div>
        <h3 className="mb-3 text-sm font-semibold text-ink-900">Car type</h3>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => toggleCategory(cat)}
              className={cn('rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors', value.categories.includes(cat) ? 'border-brand-700 bg-brand-700 text-white' : 'border-ink-200 text-ink-600 hover:border-ink-300')}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-ink-900">Transmission</h3>
        <div className="flex gap-1.5">
          {(['any', 'automatic', 'manual'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onChange({ ...value, transmission: t })}
              className={cn('rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors', value.transmission === t ? 'border-brand-700 bg-brand-700 text-white' : 'border-ink-200 text-ink-600 hover:border-ink-300')}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-ink-900">Minimum seats</h3>
        <div className="flex flex-wrap gap-1.5">
          {[0, 2, 4, 5, 7].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange({ ...value, minSeats: n })}
              className={cn('rounded-full border px-3 py-1.5 text-xs font-medium transition-colors', value.minSeats === n ? 'border-brand-700 bg-brand-700 text-white' : 'border-ink-200 text-ink-600 hover:border-ink-300')}
            >
              {n === 0 ? 'Any' : `${n}+`}
            </button>
          ))}
        </div>
      </div>

      {suppliers.length > 1 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-ink-900">Supplier</h3>
          <div className="flex flex-col gap-2">
            {suppliers.map((s) => (
              <label key={s} className="flex items-center gap-2.5 text-sm text-ink-700">
                <input type="checkbox" checked={value.suppliers.includes(s)} onChange={() => toggleSupplier(s)} className="size-4 rounded border-ink-300 text-brand-700 focus:ring-accent-500/40" />
                {s}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
