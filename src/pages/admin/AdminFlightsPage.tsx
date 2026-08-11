import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, Trash2 } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Modal } from '@/components/admin/Modal';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ErrorState } from '@/components/ui/ErrorState';
import { useAdminCrud } from '@/hooks/useAdminCrud';
import { useAsync } from '@/hooks/useAsync';
import { listFlights, createFlight, updateFlight, deleteFlight } from '@/services/flightService';
import { listAirlines } from '@/services/airlineService';
import { listAirports } from '@/services/airportService';
import { useCurrency } from '@/context/CurrencyContext';
import { formatDateTime } from '@/utils/date';
import type { Flight, FlightInput, FlightFares } from '@/types/flight';

const schema = z.object({
  airlineId: z.string().min(1, 'Required'),
  flightNumber: z.string().trim().min(2, 'Required'),
  originCode: z.string().min(1, 'Required'),
  destinationCode: z.string().min(1, 'Required'),
  departureDate: z.string().min(1, 'Required'),
  departureTimeOfDay: z.string().min(1, 'Required'),
  durationMinutes: z.number().int().positive(),
  stops: z.number().int().min(0).max(3),
  aircraft: z.string().trim().min(1, 'Required'),
  baggageChecked: z.string().trim().min(1, 'Required'),
  baggageCabin: z.string().trim().min(1, 'Required'),
  cancellationPolicy: z.string().trim().min(1, 'Required'),
  status: z.enum(['scheduled', 'delayed', 'cancelled']),
  economyPrice: z.number().positive(),
  economySeats: z.number().int().min(0),
  premiumPrice: z.number().min(0),
  premiumSeats: z.number().int().min(0),
  businessPrice: z.number().min(0),
  businessSeats: z.number().int().min(0),
  firstPrice: z.number().min(0),
  firstSeats: z.number().int().min(0),
});
type FormValues = z.infer<typeof schema>;

function toFormValues(f: Flight | null): FormValues {
  if (!f) {
    return {
      airlineId: '', flightNumber: '', originCode: '', destinationCode: '', departureDate: '', departureTimeOfDay: '10:00', durationMinutes: 120, stops: 0,
      aircraft: 'Airbus A320', baggageChecked: '1 x 23kg', baggageCabin: '1 x 8kg', cancellationPolicy: 'Free cancellation up to 48 hours before departure.', status: 'scheduled',
      economyPrice: 100, economySeats: 40, premiumPrice: 0, premiumSeats: 0, businessPrice: 0, businessSeats: 0, firstPrice: 0, firstSeats: 0,
    };
  }
  const d = new Date(f.departureTime);
  return {
    airlineId: f.airlineId, flightNumber: f.flightNumber, originCode: f.originCode, destinationCode: f.destinationCode,
    departureDate: d.toISOString().slice(0, 10), departureTimeOfDay: d.toTimeString().slice(0, 5), durationMinutes: f.durationMinutes, stops: f.stops,
    aircraft: f.aircraft, baggageChecked: f.baggageChecked, baggageCabin: f.baggageCabin, cancellationPolicy: f.cancellationPolicy, status: f.status,
    economyPrice: f.fares.economy?.price ?? 0, economySeats: f.fares.economy?.seatsAvailable ?? 0,
    premiumPrice: f.fares.premium_economy?.price ?? 0, premiumSeats: f.fares.premium_economy?.seatsAvailable ?? 0,
    businessPrice: f.fares.business?.price ?? 0, businessSeats: f.fares.business?.seatsAvailable ?? 0,
    firstPrice: f.fares.first?.price ?? 0, firstSeats: f.fares.first?.seatsAvailable ?? 0,
  };
}

export default function AdminFlightsPage() {
  const { format } = useCurrency();
  const [search, setSearch] = useState('');
  const airlines = useAsync(listAirlines, []);
  const airports = useAsync(listAirports, []);
  const crud = useAdminCrud<Flight, FlightInput>({
    list: () => listFlights(200),
    create: (input) => createFlight(input),
    update: (id, input) => updateFlight(id, input),
    remove: deleteFlight,
    getId: (f) => f.id,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), values: toFormValues(crud.editing) });

  function submit(v: FormValues) {
    const airline = airlines.data?.find((a) => a.id === v.airlineId);
    if (!airline) return;
    const departureTime = new Date(`${v.departureDate}T${v.departureTimeOfDay}:00`).getTime();
    const arrivalTime = departureTime + v.durationMinutes * 60000;

    const fares: FlightFares = { economy: { price: v.economyPrice, seatsAvailable: v.economySeats } };
    if (v.premiumPrice > 0 && v.premiumSeats > 0) fares.premium_economy = { price: v.premiumPrice, seatsAvailable: v.premiumSeats };
    if (v.businessPrice > 0 && v.businessSeats > 0) fares.business = { price: v.businessPrice, seatsAvailable: v.businessSeats };
    if (v.firstPrice > 0 && v.firstSeats > 0) fares.first = { price: v.firstPrice, seatsAvailable: v.firstSeats };

    const payload: FlightInput = {
      airlineId: airline.id, airlineCode: airline.code, airlineName: airline.name, flightNumber: v.flightNumber.toUpperCase(),
      originCode: v.originCode.toUpperCase(), destinationCode: v.destinationCode.toUpperCase(), departureTime, arrivalTime, durationMinutes: v.durationMinutes,
      stops: v.stops, layoverAirportCodes: [], aircraft: v.aircraft, price: v.economyPrice, fares,
      baggageChecked: v.baggageChecked, baggageCabin: v.baggageCabin, cancellationPolicy: v.cancellationPolicy, status: v.status,
    };
    crud.handleSubmit(payload);
  }

  const filtered = crud.items.filter((f) => `${f.flightNumber} ${f.originCode} ${f.destinationCode} ${f.airlineName}`.toLowerCase().includes(search.toLowerCase()));

  const columns: Column<Flight>[] = [
    { key: 'flight', header: 'Flight', render: (f) => <div><p className="font-mono font-semibold text-brand-700">{f.flightNumber}</p><p className="text-xs text-ink-400">{f.airlineName}</p></div> },
    { key: 'route', header: 'Route', render: (f) => `${f.originCode} → ${f.destinationCode}` },
    { key: 'departure', header: 'Departure', render: (f) => formatDateTime(f.departureTime) },
    { key: 'price', header: 'From', render: (f) => format(f.price) },
    { key: 'seats', header: 'Economy seats', render: (f) => f.fares.economy?.seatsAvailable ?? 0 },
    { key: 'status', header: 'Status', render: (f) => <Badge tone={f.status === 'scheduled' ? 'success' : f.status === 'delayed' ? 'warning' : 'danger'} className="capitalize">{f.status}</Badge> },
  ];

  if (crud.error) return <ErrorState description={crud.error} onRetry={crud.refetch} />;

  return (
    <div>
      <AdminPageHeader title="Flights" description="Scheduled flights available for search and booking." onAdd={crud.openCreate} search={search} onSearchChange={setSearch} />
      <DataTable
        columns={columns}
        rows={filtered}
        keyField={(f) => f.id}
        loading={crud.loading}
        actions={(f) => (
          <div className="flex justify-end gap-1.5">
            <button type="button" onClick={() => crud.openEdit(f)} aria-label="Edit" className="flex size-8 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100">
              <Pencil className="size-4" />
            </button>
            <button type="button" onClick={() => crud.setDeleteTarget(f)} aria-label="Delete" className="flex size-8 items-center justify-center rounded-lg text-danger-500 hover:bg-danger-50">
              <Trash2 className="size-4" />
            </button>
          </div>
        )}
      />

      <Modal open={crud.modalOpen} onClose={crud.closeModal} title={crud.editing ? 'Edit flight' : 'Add flight'} size="xl">
        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField label="Airline" htmlFor="f-airline" error={errors.airlineId?.message} required>
              <Select id="f-airline" error={errors.airlineId?.message} {...register('airlineId')}>
                <option value="">Select airline</option>
                {airlines.data?.map((a) => (
                  <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Flight number" htmlFor="f-number" error={errors.flightNumber?.message} required>
              <Input id="f-number" className="uppercase" placeholder="e.g. AH1042" error={errors.flightNumber?.message} {...register('flightNumber')} />
            </FormField>
            <FormField label="Status" htmlFor="f-status" required>
              <Select id="f-status" {...register('status')}>
                <option value="scheduled">Scheduled</option>
                <option value="delayed">Delayed</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </FormField>
            <FormField label="Origin" htmlFor="f-origin" error={errors.originCode?.message} required>
              <Select id="f-origin" error={errors.originCode?.message} {...register('originCode')}>
                <option value="">Select airport</option>
                {airports.data?.map((a) => (
                  <option key={a.id} value={a.code}>{a.code} — {a.city}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Destination" htmlFor="f-dest" error={errors.destinationCode?.message} required>
              <Select id="f-dest" error={errors.destinationCode?.message} {...register('destinationCode')}>
                <option value="">Select airport</option>
                {airports.data?.map((a) => (
                  <option key={a.id} value={a.code}>{a.code} — {a.city}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Aircraft" htmlFor="f-aircraft" error={errors.aircraft?.message} required>
              <Input id="f-aircraft" error={errors.aircraft?.message} {...register('aircraft')} />
            </FormField>
            <FormField label="Departure date" htmlFor="f-date" error={errors.departureDate?.message} required>
              <Input id="f-date" type="date" error={errors.departureDate?.message} {...register('departureDate')} />
            </FormField>
            <FormField label="Departure time" htmlFor="f-time" error={errors.departureTimeOfDay?.message} required>
              <Input id="f-time" type="time" error={errors.departureTimeOfDay?.message} {...register('departureTimeOfDay')} />
            </FormField>
            <FormField label="Duration (minutes)" htmlFor="f-duration" error={errors.durationMinutes?.message} required>
              <Input id="f-duration" type="number" error={errors.durationMinutes?.message} {...register('durationMinutes', { valueAsNumber: true })} />
            </FormField>
            <FormField label="Stops" htmlFor="f-stops" error={errors.stops?.message} required>
              <Input id="f-stops" type="number" min={0} max={3} error={errors.stops?.message} {...register('stops', { valueAsNumber: true })} />
            </FormField>
            <FormField label="Checked baggage" htmlFor="f-checked" error={errors.baggageChecked?.message} required>
              <Input id="f-checked" error={errors.baggageChecked?.message} {...register('baggageChecked')} />
            </FormField>
            <FormField label="Cabin baggage" htmlFor="f-cabin-bag" error={errors.baggageCabin?.message} required>
              <Input id="f-cabin-bag" error={errors.baggageCabin?.message} {...register('baggageCabin')} />
            </FormField>
          </div>

          <FormField label="Cancellation policy" htmlFor="f-cancel" error={errors.cancellationPolicy?.message} required>
            <Input id="f-cancel" error={errors.cancellationPolicy?.message} {...register('cancellationPolicy')} />
          </FormField>

          <div>
            <p className="mb-3 text-sm font-semibold text-ink-900">Fares by cabin</p>
            <p className="mb-3 text-xs text-ink-500">Economy is required. Leave a cabin’s price/seats at 0 to not offer it.</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-ink-100 p-3">
                <p className="mb-2 text-xs font-semibold uppercase text-ink-500">Economy</p>
                <FormField label="Price (€)" htmlFor="f-eco-price" error={errors.economyPrice?.message}>
                  <Input id="f-eco-price" type="number" step="any" error={errors.economyPrice?.message} {...register('economyPrice', { valueAsNumber: true })} />
                </FormField>
                <FormField label="Seats" htmlFor="f-eco-seats" error={errors.economySeats?.message} className="mt-2">
                  <Input id="f-eco-seats" type="number" error={errors.economySeats?.message} {...register('economySeats', { valueAsNumber: true })} />
                </FormField>
              </div>
              <div className="rounded-xl border border-ink-100 p-3">
                <p className="mb-2 text-xs font-semibold uppercase text-ink-500">Premium economy</p>
                <FormField label="Price (€)" htmlFor="f-pe-price">
                  <Input id="f-pe-price" type="number" step="any" {...register('premiumPrice', { valueAsNumber: true })} />
                </FormField>
                <FormField label="Seats" htmlFor="f-pe-seats" className="mt-2">
                  <Input id="f-pe-seats" type="number" {...register('premiumSeats', { valueAsNumber: true })} />
                </FormField>
              </div>
              <div className="rounded-xl border border-ink-100 p-3">
                <p className="mb-2 text-xs font-semibold uppercase text-ink-500">Business</p>
                <FormField label="Price (€)" htmlFor="f-biz-price">
                  <Input id="f-biz-price" type="number" step="any" {...register('businessPrice', { valueAsNumber: true })} />
                </FormField>
                <FormField label="Seats" htmlFor="f-biz-seats" className="mt-2">
                  <Input id="f-biz-seats" type="number" {...register('businessSeats', { valueAsNumber: true })} />
                </FormField>
              </div>
              <div className="rounded-xl border border-ink-100 p-3">
                <p className="mb-2 text-xs font-semibold uppercase text-ink-500">First</p>
                <FormField label="Price (€)" htmlFor="f-first-price">
                  <Input id="f-first-price" type="number" step="any" {...register('firstPrice', { valueAsNumber: true })} />
                </FormField>
                <FormField label="Seats" htmlFor="f-first-seats" className="mt-2">
                  <Input id="f-first-seats" type="number" {...register('firstSeats', { valueAsNumber: true })} />
                </FormField>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 border-t border-ink-100 pt-4">
            <Button type="button" variant="outline" onClick={crud.closeModal}>
              Cancel
            </Button>
            <Button type="submit" loading={crud.saving}>
              {crud.editing ? 'Save changes' : 'Create flight'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(crud.deleteTarget)}
        title="Delete this flight?"
        description={`Flight "${crud.deleteTarget?.flightNumber}" will be permanently removed.`}
        loading={crud.deleting}
        onConfirm={crud.handleDelete}
        onCancel={() => crud.setDeleteTarget(null)}
      />
    </div>
  );
}
