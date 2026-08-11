import { Link } from 'react-router-dom';
import { Users, DoorOpen, Fuel, Gauge, Settings2 } from 'lucide-react';
import { CardHoverable } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useCurrency } from '@/context/CurrencyContext';
import type { Car } from '@/types/car';

export function CarCard({ car, days, to }: { car: Car; days: number; to: string }) {
  const { format } = useCurrency();
  const total = car.pricePerDay * Math.max(1, days);

  return (
    <Link to={to}>
      <CardHoverable className="flex flex-col overflow-hidden sm:flex-row">
        <div className="flex aspect-[4/3] w-full shrink-0 items-center justify-center overflow-hidden bg-ink-50 sm:aspect-auto sm:w-56">
          <img src={car.images[0]} alt={`${car.make} ${car.model}`} loading="lazy" className="size-full object-cover" />
        </div>
        <div className="flex flex-1 flex-col justify-between p-5">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <Badge tone="brand" className="mb-1.5 capitalize">{car.category}</Badge>
                <h3 className="font-display text-lg font-semibold text-ink-950">{car.make} {car.model}</h3>
                <p className="text-xs text-ink-500">or similar · {car.supplierName}</p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-ink-600 sm:grid-cols-4">
              <span className="flex items-center gap-1.5">
                <Settings2 className="size-3.5 text-ink-400" /> {car.transmission === 'automatic' ? 'Auto' : 'Manual'}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="size-3.5 text-ink-400" /> {car.seats} seats
              </span>
              <span className="flex items-center gap-1.5">
                <DoorOpen className="size-3.5 text-ink-400" /> {car.doors} doors
              </span>
              <span className="flex items-center gap-1.5 capitalize">
                <Fuel className="size-3.5 text-ink-400" /> {car.fuelType}
              </span>
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-400">
              <Gauge className="size-3.5" /> {car.mileagePolicy}
            </p>
          </div>

          <div className="mt-4 flex items-end justify-between border-t border-ink-100 pt-4">
            <p className="text-xs text-ink-400">{car.pickupLocation}</p>
            <div className="text-right">
              <p className="font-display text-xl font-bold text-brand-800">{format(car.pricePerDay)}</p>
              <p className="text-xs text-ink-400">per day · {format(total)} total</p>
            </div>
          </div>
        </div>
      </CardHoverable>
    </Link>
  );
}
