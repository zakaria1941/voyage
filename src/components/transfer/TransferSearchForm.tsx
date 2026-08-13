import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlaneLanding, MapPin, CalendarDays, Clock, Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { DatePicker } from '@/components/ui/DatePicker';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/context/LanguageContext';
import type { TransferSearchParams } from '@/types/search';
import { addDaysISO, todayISO } from '@/utils/date';

interface TransferSearchFormProps {
  initial?: Partial<TransferSearchParams>;
  onSearch?: (params: TransferSearchParams) => void;
}

export function TransferSearchForm({ initial, onSearch }: TransferSearchFormProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [airport, setAirport] = useState(initial?.airport ?? '');
  const [destination, setDestination] = useState(initial?.destination ?? '');
  const [date, setDate] = useState(initial?.date ?? addDaysISO(todayISO(), 7));
  const [time, setTime] = useState(initial?.time ?? '14:00');
  const [passengers, setPassengers] = useState(initial?.passengers ?? 2);
  const [luggage, setLuggage] = useState(initial?.luggage ?? 2);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Pickup airport and drop-off are each optional — either one alone, or
    // neither, still runs a valid search (see TransferResultsPage/transferService).
    const params: TransferSearchParams = { airport: airport.trim(), destination: destination.trim(), date, time, passengers, luggage, vehicleType: 'any' };
    if (onSearch) {
      onSearch(params);
      return;
    }
    const qs = new URLSearchParams({
      airport: params.airport,
      destination: params.destination,
      date: params.date,
      time: params.time,
      passengers: String(params.passengers),
      luggage: String(params.luggage),
    });
    navigate(`/transfers/results?${qs.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1.2fr_1.2fr_0.9fr_0.7fr_0.8fr_0.8fr_auto]">
        <FormField label={t('search.transfers.pickupAirport')} htmlFor="transfer-airport">
          <Input id="transfer-airport" icon={<PlaneLanding className="size-4" />} placeholder={t('search.transfers.airportPlaceholder')} value={airport} onChange={(e) => setAirport(e.target.value)} autoComplete="off" />
        </FormField>

        <FormField label={t('search.transfers.dropoffAddress')} htmlFor="transfer-destination">
          <Input id="transfer-destination" icon={<MapPin className="size-4" />} placeholder={t('search.transfers.addressPlaceholder')} value={destination} onChange={(e) => setDestination(e.target.value)} autoComplete="off" />
        </FormField>

        <FormField label={t('search.transfers.date')} htmlFor="transfer-date">
          <DatePicker id="transfer-date" icon={<CalendarDays className="size-4" />} min={todayISO()} value={date} onChange={setDate} />
        </FormField>

        <FormField label={t('search.transfers.time')} htmlFor="transfer-time">
          <Input id="transfer-time" type="time" icon={<Clock className="size-4" />} value={time} onChange={(e) => setTime(e.target.value)} />
        </FormField>

        <FormField label={t('search.transfers.passengersLabel')} htmlFor="transfer-passengers">
          <Select id="transfer-passengers" value={passengers} onChange={(e) => setPassengers(Number(e.target.value))}>
            {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? t('common.passenger') : t('common.passengers')}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label={t('search.luggage.label')} htmlFor="transfer-luggage">
          <Select id="transfer-luggage" value={luggage} onChange={(e) => setLuggage(Number(e.target.value))}>
            {Array.from({ length: 8 }, (_, i) => i).map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? t('search.luggage.bag') : t('search.luggage.bags')}
              </option>
            ))}
          </Select>
        </FormField>

        <div className="flex items-end">
          <Button type="submit" size="lg" fullWidth className="lg:w-auto">
            <Search className="size-4" />
            {t('search.transfers.searchButton')}
          </Button>
        </div>
      </div>
    </form>
  );
}
