import { Users, BedDouble, Coffee, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useCurrency } from '@/context/CurrencyContext';
import type { Room } from '@/types/hotel';
import { cn } from '@/utils/cn';

export function RoomCard({ room, selected, onSelect }: { room: Room; selected?: boolean; onSelect: () => void }) {
  const { format } = useCurrency();

  return (
    <div className={cn('flex flex-col gap-4 rounded-2xl border bg-white p-5 shadow-soft sm:flex-row', selected ? 'border-brand-600 ring-2 ring-brand-100' : 'border-ink-100')}>
      <div className="aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl bg-ink-100 sm:w-48">
        <img src={room.images[0]} alt={room.name} loading="lazy" className="size-full object-cover" />
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h3 className="font-display text-base font-semibold text-ink-950">{room.name}</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-500">
            <span className="flex items-center gap-1.5">
              <Users className="size-3.5" /> {room.maxGuests} guests
            </span>
            <span className="flex items-center gap-1.5">
              <BedDouble className="size-3.5" /> {room.bedType}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {room.breakfastIncluded && (
              <Badge tone="neutral">
                <Coffee className="size-3" /> Breakfast included
              </Badge>
            )}
            {room.freeCancellation && (
              <Badge tone="success">
                <ShieldCheck className="size-3" /> Free cancellation
              </Badge>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between border-t border-ink-100 pt-4">
          <div>
            <p className="font-display text-xl font-bold text-brand-800">{format(room.pricePerNight)}</p>
            <p className="text-xs text-ink-400">per night</p>
          </div>
          <Button onClick={onSelect} variant={selected ? 'secondary' : 'primary'}>
            {selected ? 'Selected' : 'Select room'}
          </Button>
        </div>
      </div>
    </div>
  );
}
