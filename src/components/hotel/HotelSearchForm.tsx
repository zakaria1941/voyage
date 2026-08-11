import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CalendarDays, Search } from 'lucide-react';
import { GuestsPopover } from '@/components/booking/GuestsPopover';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';
import type { HotelSearchParams } from '@/types/search';
import { addDaysISO, todayISO } from '@/utils/date';

interface HotelSearchFormProps {
  initial?: Partial<HotelSearchParams>;
  onSearch?: (params: HotelSearchParams) => void;
}

export function HotelSearchForm({ initial, onSearch }: HotelSearchFormProps) {
  const navigate = useNavigate();
  const [destination, setDestination] = useState(initial?.destination ?? '');
  const [checkIn, setCheckIn] = useState(initial?.checkIn ?? addDaysISO(todayISO(), 14));
  const [checkOut, setCheckOut] = useState(initial?.checkOut ?? addDaysISO(todayISO(), 17));
  const [rooms, setRooms] = useState(initial?.rooms ?? 1);
  const [adults, setAdults] = useState(initial?.adults ?? 2);
  const [children, setChildren] = useState(initial?.children ?? 0);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!destination.trim()) {
      setError('Please enter a destination.');
      return;
    }
    if (checkOut <= checkIn) {
      setError('Check-out must be after check-in.');
      return;
    }
    setError(null);

    const params: HotelSearchParams = { destination: destination.trim(), checkIn, checkOut, rooms, adults, children };
    if (onSearch) {
      onSearch(params);
      return;
    }
    const qs = new URLSearchParams({
      destination: params.destination,
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      rooms: String(params.rooms),
      adults: String(params.adults),
      children: String(params.children),
    });
    navigate(`/hotels/results?${qs.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.2fr_auto]">
        <FormField label="Destination" htmlFor="hotel-destination">
          <Input
            id="hotel-destination"
            icon={<MapPin className="size-4" />}
            placeholder="City, region, or hotel name"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            autoComplete="off"
          />
        </FormField>

        <FormField label="Check-in" htmlFor="hotel-checkin">
          <Input
            id="hotel-checkin"
            type="date"
            icon={<CalendarDays className="size-4" />}
            min={todayISO()}
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
          />
        </FormField>

        <FormField label="Check-out" htmlFor="hotel-checkout">
          <Input
            id="hotel-checkout"
            type="date"
            icon={<CalendarDays className="size-4" />}
            min={addDaysISO(checkIn, 1)}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
          />
        </FormField>

        <FormField label="Guests" htmlFor="hotel-guests">
          <GuestsPopover rooms={rooms} adults={adults} children={children} onChange={(v) => { setRooms(v.rooms); setAdults(v.adults); setChildren(v.children); }} />
        </FormField>

        <div className="flex items-end">
          <Button type="submit" size="lg" fullWidth className="lg:w-auto">
            <Search className="size-4" />
            Search hotels
          </Button>
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm font-medium text-danger-600">
          {error}
        </p>
      )}
    </form>
  );
}
