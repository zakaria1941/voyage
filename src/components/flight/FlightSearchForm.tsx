import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftRight, PlaneTakeoff, PlaneLanding, CalendarDays, Search } from 'lucide-react';
import { TripTypeSelector } from './TripTypeSelector';
import { PassengersPopover } from '@/components/booking/PassengersPopover';
import { Input } from '@/components/ui/Input';
import { DatePicker } from '@/components/ui/DatePicker';
import { FormField } from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/context/LanguageContext';
import type { CabinClass, FlightSearchParams, PassengerCounts, TripType } from '@/types/search';
import { addDaysISO, todayISO } from '@/utils/date';

interface FlightSearchFormProps {
  initial?: Partial<FlightSearchParams>;
  onSearch?: (params: FlightSearchParams) => void;
  compact?: boolean;
}

export function FlightSearchForm({ initial, onSearch, compact }: FlightSearchFormProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();
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
    // Both fields are optional — an empty From/To broadens the search
    // (departing anywhere / arriving anywhere / browse everything) rather
    // than blocking submission. Only reject a same non-empty origin/destination.
    if (origin.trim() && destination.trim() && origin.trim().toLowerCase() === destination.trim().toLowerCase()) {
      setError(t('search.flights.errorSameCity'));
      return;
    }
    if (tripType === 'roundtrip' && returnDate < departureDate) {
      setError(t('search.flights.errorReturnBeforeDeparture'));
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
        <FormField label={t('search.flights.from')} htmlFor="flight-origin">
          <Input
            id="flight-origin"
            icon={<PlaneTakeoff className="size-4" />}
            placeholder={t('search.placeholder.cityOrAirport')}
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
            aria-label={t('search.flights.swapAriaLabel')}
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-500 transition-all hover:border-brand-400 hover:text-brand-700 hover:rotate-180 duration-300"
          >
            <ArrowLeftRight className="size-4" />
          </button>
        </div>

        <FormField label={t('search.flights.to')} htmlFor="flight-destination">
          <Input
            id="flight-destination"
            icon={<PlaneLanding className="size-4" />}
            placeholder={t('search.placeholder.cityOrAirport')}
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            autoComplete="off"
          />
        </FormField>

        <FormField label={t('search.flights.departure')} htmlFor="flight-departure">
          <DatePicker
            id="flight-departure"
            icon={<CalendarDays className="size-4" />}
            min={todayISO()}
            value={departureDate}
            onChange={setDepartureDate}
          />
        </FormField>

        <FormField label={t('search.flights.return')} htmlFor="flight-return">
          <DatePicker
            id="flight-return"
            icon={<CalendarDays className="size-4" />}
            min={departureDate}
            value={returnDate}
            disabled={tripType === 'oneway'}
            onChange={setReturnDate}
            className={tripType === 'oneway' ? 'opacity-40' : ''}
          />
        </FormField>

        <FormField label={t('search.flights.passengersAndClass')} htmlFor="flight-passengers">
          <PassengersPopover passengers={passengers} cabin={cabin} onChange={(p, c) => { setPassengers(p); setCabin(c); }} />
        </FormField>

        <div className="flex items-end">
          <Button type="submit" size="lg" fullWidth className="lg:w-auto">
            <Search className="size-4" />
            {t('search.flights.searchButton')}
          </Button>
        </div>
      </div>

      {tripType === 'multicity' && (
        <p className="mt-3 text-xs text-ink-500">{t('search.flights.multiCityNotice')}</p>
      )}
      {error && (
        <p role="alert" className="mt-3 text-sm font-medium text-danger-600">
          {error}
        </p>
      )}
    </form>
  );
}
