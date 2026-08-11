import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CalendarClock, Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';
import type { CarSearchParams } from '@/types/search';
import { addDaysISO, todayISO } from '@/utils/date';

interface CarSearchFormProps {
  initial?: Partial<CarSearchParams>;
  onSearch?: (params: CarSearchParams) => void;
}

export function CarSearchForm({ initial, onSearch }: CarSearchFormProps) {
  const navigate = useNavigate();
  const [pickupLocation, setPickupLocation] = useState(initial?.pickupLocation ?? '');
  const [sameDropoff, setSameDropoff] = useState(initial?.sameDropoff ?? true);
  const [dropoffLocation, setDropoffLocation] = useState(initial?.dropoffLocation ?? '');
  const [pickupDate, setPickupDate] = useState(initial?.pickupDate ?? addDaysISO(todayISO(), 7));
  const [pickupTime, setPickupTime] = useState(initial?.pickupTime ?? '10:00');
  const [dropoffDate, setDropoffDate] = useState(initial?.dropoffDate ?? addDaysISO(todayISO(), 10));
  const [dropoffTime, setDropoffTime] = useState(initial?.dropoffTime ?? '10:00');
  const [driverAge, setDriverAge] = useState(initial?.driverAge ?? 30);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pickupLocation.trim()) {
      setError('Please enter a pick-up location.');
      return;
    }
    if (!sameDropoff && !dropoffLocation.trim()) {
      setError('Please enter a drop-off location.');
      return;
    }
    if (dropoffDate < pickupDate) {
      setError('Drop-off date can’t be before pick-up date.');
      return;
    }
    setError(null);

    const params: CarSearchParams = {
      pickupLocation: pickupLocation.trim(),
      dropoffLocation: sameDropoff ? pickupLocation.trim() : dropoffLocation.trim(),
      sameDropoff,
      pickupDate,
      pickupTime,
      dropoffDate,
      dropoffTime,
      driverAge,
    };

    if (onSearch) {
      onSearch(params);
      return;
    }
    const qs = new URLSearchParams({
      pickupLocation: params.pickupLocation,
      dropoffLocation: params.dropoffLocation,
      pickupDate: params.pickupDate,
      pickupTime: params.pickupTime,
      dropoffDate: params.dropoffDate,
      dropoffTime: params.dropoffTime,
      driverAge: String(params.driverAge),
    });
    navigate(`/cars/results?${qs.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <label className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-ink-700">
        <input
          type="checkbox"
          checked={sameDropoff}
          onChange={(e) => setSameDropoff(e.target.checked)}
          className="size-4 rounded border-ink-300 text-brand-700 focus:ring-accent-500/40"
        />
        Return car to the same location
      </label>

      <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${sameDropoff ? 'lg:grid-cols-[1.4fr_1fr_1fr_0.7fr_auto]' : 'lg:grid-cols-[1.1fr_1.1fr_1fr_1fr_0.6fr_auto]'}`}>
        <FormField label="Pick-up location" htmlFor="car-pickup">
          <Input id="car-pickup" icon={<MapPin className="size-4" />} placeholder="City or airport" value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} autoComplete="off" />
        </FormField>

        {!sameDropoff && (
          <FormField label="Drop-off location" htmlFor="car-dropoff">
            <Input id="car-dropoff" icon={<MapPin className="size-4" />} placeholder="City or airport" value={dropoffLocation} onChange={(e) => setDropoffLocation(e.target.value)} autoComplete="off" />
          </FormField>
        )}

        <FormField label="Pick-up" htmlFor="car-pickup-date">
          <div className="flex gap-1.5">
            <Input id="car-pickup-date" type="date" icon={<CalendarClock className="size-4" />} min={todayISO()} value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} className="pr-1" />
            <Input type="time" aria-label="Pick-up time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} className="w-[5.5rem] px-2" />
          </div>
        </FormField>

        <FormField label="Drop-off" htmlFor="car-dropoff-date">
          <div className="flex gap-1.5">
            <Input id="car-dropoff-date" type="date" icon={<CalendarClock className="size-4" />} min={pickupDate} value={dropoffDate} onChange={(e) => setDropoffDate(e.target.value)} />
            <Input type="time" aria-label="Drop-off time" value={dropoffTime} onChange={(e) => setDropoffTime(e.target.value)} className="w-[5.5rem] px-2" />
          </div>
        </FormField>

        <FormField label="Driver age" htmlFor="car-driver-age">
          <Input id="car-driver-age" type="number" min={18} max={99} value={driverAge} onChange={(e) => setDriverAge(Number(e.target.value))} />
        </FormField>

        <div className="flex items-end">
          <Button type="submit" size="lg" fullWidth className="lg:w-auto">
            <Search className="size-4" />
            Search cars
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
