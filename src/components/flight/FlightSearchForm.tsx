import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftRight, PlaneTakeoff, PlaneLanding, CalendarDays, Search } from 'lucide-react';
import { TripTypeSelector } from './TripTypeSelector';
import { PassengersPopover } from '@/components/booking/PassengersPopover';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';
import type { CabinClass, FlightSearchParams, PassengerCounts, TripType } from '@/types/search';
import { addDaysISO, todayISO } from '@/utils/date';

interface FlightSearchFormProps {
  initial?: Partial<FlightSearchParams>;
  onSearch?: (params: FlightSearchParams) => void;
  compact?: boolean;
}

export function FlightSearchForm({ initial, onSearch, compact }: FlightSearchFormProps) {
  const navigate = useNavigate();
  const [tripType, setTripType] = useState<TripType>(initial?.tripType ?? 'roundtrip');
  const [origin, setOrigin] = useState(initial?.origin ?? '');
  const [destination, setDestination] = useState(initial?.destination ?? '');
  const [departureDate, setDepartureDate] = useState(initial?.departureDate ?? addDaysISO(todayISO(), 14));
  const [returnDate, setReturnDate] = useState(initial?.returnDate ?? addDaysISO(todayISO(), 21));
  const [passengers, setPassengers] = useState<PassengerCounts>({
    adults: initial?.adults ?? 1,
    children: initial?.children ?? 0,
    infants: initial?.infants ?? 0,
  });
  const [cabin, setCabin] = useState<CabinClass>(initial?.cabin ?? 'economy');
  const [error, setError] = useState<string | null>(null);

  function swap() {
    setOrigin(destination);
    setDestination(origin);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!origin.trim() || !destination.trim()) {
      setError('Please enter both a departure and destination city or airport.');
      return;
    }
    if (origin.trim().toLowerCase() === destination.trim().toLowerCase()) {
      setError('Departure and destination can’t be the same.');
      return;
    }
    if (tripType === 'roundtrip' && returnDate < departureDate) {
      setError('Your return date can’t be before your departure date.');
      return;
    }
    setError(null);

    const params: FlightSearchParams = {
      tripType,
      origin: origin.trim().toUpperCase(),
      destination: destination.trim().toUpperCase(),
      departureDate,
      returnDate: tripType === 'roundtrip' ? returnDate : undefined,
      adults: passengers.adults,
      children: passengers.children,
      infants: passengers.infants,
      cabin,
    };

    if (onSearch) {
      onSearch(params);
      return;
    }

    const qs = new URLSearchParams({
      tripType: params.tripType,
      origin: params.origin,
      destination: params.destination,
      departureDate: params.departureDate,
      adults: String(params.adults),
      children: String(params.children),
      infants: String(params.infants),
      cabin: params.cabin,
    });
    if (params.returnDate) qs.set('returnDate', params.returnDate);
    navigate(`/flights/results?${qs.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <TripTypeSelector value={tripType} onChange={setTripType} />
      </div>

      <div
        className={
          'grid grid-cols-1 gap-3 sm:grid-cols-2 ' +
          (compact
            ? 'lg:grid-cols-[1.1fr_auto_1.1fr_0.9fr_0.9fr_1.2fr_auto]'
            : 'lg:grid-cols-[1.1fr_auto_1.1fr_0.9fr_0.9fr_1.2fr_auto]')
        }
      >
        <FormField label="From" htmlFor="flight-origin">
          <Input
            id="flight-origin"
            icon={<PlaneTakeoff className="size-4" />}
            placeholder="City or airport"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            autoComplete="off"
          />
        </FormField>

        <div className="flex items-end justify-center pb-0.5 sm:col-span-2 sm:justify-start lg:col-span-1 lg:justify-center">
          <span className="mb-1.5 hidden text-sm text-transparent select-none lg:block">.</span>
          <button
            type="button"
            onClick={swap}
            aria-label="Swap origin and destination"
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-500 transition-all hover:border-brand-400 hover:text-brand-700 hover:rotate-180 duration-300"
          >
            <ArrowLeftRight className="size-4" />
          </button>
        </div>

        <FormField label="To" htmlFor="flight-destination">
          <Input
            id="flight-destination"
            icon={<PlaneLanding className="size-4" />}
            placeholder="City or airport"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            autoComplete="off"
          />
        </FormField>

        <FormField label="Departure" htmlFor="flight-departure">
          <Input
            id="flight-departure"
            type="date"
            icon={<CalendarDays className="size-4" />}
            min={todayISO()}
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
          />
        </FormField>

        <FormField label="Return" htmlFor="flight-return">
          <Input
            id="flight-return"
            type="date"
            icon={<CalendarDays className="size-4" />}
            min={departureDate}
            value={returnDate}
            disabled={tripType === 'oneway'}
            onChange={(e) => setReturnDate(e.target.value)}
            className={tripType === 'oneway' ? 'opacity-40' : ''}
          />
        </FormField>

        <FormField label="Passengers &amp; class" htmlFor="flight-passengers">
          <PassengersPopover passengers={passengers} cabin={cabin} onChange={(p, c) => { setPassengers(p); setCabin(c); }} />
        </FormField>

        <div className="flex items-end">
          <Button type="submit" size="lg" fullWidth className="lg:w-auto">
            <Search className="size-4" />
            Search flights
          </Button>
        </div>
      </div>

      {tripType === 'multicity' && (
        <p className="mt-3 text-xs text-ink-500">
          Multi-city trips start with your first flight below — you’ll be able to add more flights on the results page.
        </p>
      )}
      {error && (
        <p role="alert" className="mt-3 text-sm font-medium text-danger-600">
          {error}
        </p>
      )}
    </form>
  );
}
