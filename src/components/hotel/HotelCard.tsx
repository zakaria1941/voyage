import { Link } from 'react-router-dom';
import { MapPin, Star, Wifi, Coffee, ShieldCheck } from 'lucide-react';
import { CardHoverable } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useCurrency } from '@/context/CurrencyContext';
import type { Hotel } from '@/types/hotel';

export function HotelCard({ hotel, to }: { hotel: Hotel; to: string }) {
  const { format } = useCurrency();

  return (
    <Link to={to}>
      <CardHoverable className="flex flex-col overflow-hidden sm:flex-row">
        <div className="aspect-[4/3] w-full shrink-0 overflow-hidden bg-ink-100 sm:aspect-auto sm:w-64">
          <img src={hotel.images[0]} alt={hotel.name} loading="lazy" className="size-full object-cover" />
        </div>
        <div className="flex flex-1 flex-col justify-between p-5">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-lg font-semibold text-ink-950">{hotel.name}</h3>
                <p className="mt-1 flex items-center gap-1 text-sm text-ink-500">
                  <MapPin className="size-3.5" />
                  {hotel.city}, {hotel.country}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1 text-warning-500">
                {Array.from({ length: hotel.starRating }).map((_, i) => (
                  <Star key={i} className="size-3.5 fill-current" />
                ))}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge tone="brand">{hotel.reviewScore.toFixed(1)} · {hotel.reviewCount} reviews</Badge>
              {hotel.breakfastIncluded && (
                <Badge tone="neutral">
                  <Coffee className="size-3" /> Breakfast included
                </Badge>
              )}
              {hotel.freeCancellation && (
                <Badge tone="success">
                  <ShieldCheck className="size-3" /> Free cancellation
                </Badge>
              )}
              {hotel.amenities.includes('wifi') && (
                <Badge tone="neutral">
                  <Wifi className="size-3" /> Wifi
                </Badge>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-end justify-between border-t border-ink-100 pt-4">
            <p className="text-xs capitalize text-ink-400">{hotel.propertyType}</p>
            <div className="text-right">
              <p className="text-xs text-ink-400">from</p>
              <p className="font-display text-xl font-bold text-brand-800">{format(hotel.pricePerNight)}</p>
              <p className="text-xs text-ink-400">per night</p>
            </div>
          </div>
        </div>
      </CardHoverable>
    </Link>
  );
}
