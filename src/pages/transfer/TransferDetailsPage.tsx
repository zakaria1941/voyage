import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { PlaneLanding, MapPin, CalendarDays, Clock, Users, Briefcase, UserRound, Info } from 'lucide-react';
import { PriceBreakdown } from '@/components/booking/PriceBreakdown';
import { TransferBookingForm, type TransferBookingValues } from '@/components/transfer/TransferBookingForm';
import { SignInToBookPrompt } from '@/components/booking/SignInToBookPrompt';
import { PageSpinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { Badge } from '@/components/ui/Badge';
import { useAsync } from '@/hooks/useAsync';
import { getTransfer } from '@/services/transferService';
import { useAuth } from '@/context/AuthContext';
import { calculateTransferPrice } from '@/utils/pricing';
import { todayISO } from '@/utils/date';
import type { DraftBooking } from '@/types/draftBooking';
import type { TransferBookingDetails } from '@/types/booking';

export default function TransferDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const destination = searchParams.get('destination') || '';
  const date = searchParams.get('date') || todayISO();
  const time = searchParams.get('time') || '12:00';
  const passengers = Number(searchParams.get('passengers') || 1);
  const luggage = Number(searchParams.get('luggage') || 1);

  const transfer = useAsync(() => (id ? getTransfer(id) : Promise.resolve(null)), [id]);

  if (transfer.loading) return <PageSpinner label="Loading transfer…" />;
  if (transfer.error || !transfer.data) {
    return (
      <div className="container-page py-16">
        <ErrorState title="Transfer not found" description="This transfer may no longer be available." />
      </div>
    );
  }

  const t = transfer.data;
  const pricing = calculateTransferPrice(t.pricePerTrip);

  function handleContinue(values: TransferBookingValues) {
    if (!id) return;
    const pickupAt = new Date(`${date}T${time}:00`).getTime();

    const details: TransferBookingDetails = {
      transferId: id,
      vehicleName: t!.vehicleName,
      pickupAddress: `${t!.airportName} (${t!.airportCode})`,
      dropoffAddress: destination,
      flightNumber: values.flightNumber || null,
      passengers,
      luggage,
      childSeatRequired: values.childSeatRequired,
    };

    const draft: DraftBooking = {
      bookingType: 'transfer',
      itemId: id,
      startDate: pickupAt,
      endDate: pickupAt,
      guests: passengers,
      customerInfo: { firstName: values.firstName, lastName: values.lastName, email: values.email, phone: values.phone },
      details,
      previewPricing: pricing,
      displayLabel: `${t!.vehicleName} transfer`,
      displaySubLabel: `${t!.airportCode} → ${destination}`,
    };

    navigate(`/booking/transfer/${id}`, { state: { draft } });
  }

  return (
    <div className="container-page py-8">
      <h1 className="font-display text-2xl font-bold text-ink-950 sm:text-3xl">Review your transfer</h1>
      <p className="mt-1 text-ink-500">Confirm the details, then complete your booking.</p>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft">
            <div className="aspect-[21/9] w-full overflow-hidden bg-ink-100">
              <img src={t.image} alt={t.vehicleName} className="size-full object-cover" />
            </div>
            <div className="p-5">
              <Badge tone="brand" className="mb-2 capitalize">{t.vehicleType}</Badge>
              <h2 className="font-display text-lg font-semibold text-ink-950">{t.vehicleName}</h2>

              <dl className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <div className="flex items-start gap-2.5">
                  <PlaneLanding className="mt-0.5 size-4 shrink-0 text-ink-400" />
                  <div>
                    <dt className="font-medium text-ink-900">Pickup</dt>
                    <dd className="text-ink-500">{t.airportName} ({t.airportCode})</dd>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-ink-400" />
                  <div>
                    <dt className="font-medium text-ink-900">Destination</dt>
                    <dd className="text-ink-500">{destination || '—'}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <CalendarDays className="mt-0.5 size-4 shrink-0 text-ink-400" />
                  <div>
                    <dt className="font-medium text-ink-900">Date</dt>
                    <dd className="text-ink-500">{date}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Clock className="mt-0.5 size-4 shrink-0 text-ink-400" />
                  <div>
                    <dt className="font-medium text-ink-900">Time</dt>
                    <dd className="text-ink-500">{time}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Users className="mt-0.5 size-4 shrink-0 text-ink-400" />
                  <div>
                    <dt className="font-medium text-ink-900">Passengers</dt>
                    <dd className="text-ink-500">{passengers}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Briefcase className="mt-0.5 size-4 shrink-0 text-ink-400" />
                  <div>
                    <dt className="font-medium text-ink-900">Luggage</dt>
                    <dd className="text-ink-500">{luggage} bag{luggage !== 1 ? 's' : ''}</dd>
                  </div>
                </div>
              </dl>

              <div className="mt-5 flex gap-2.5 rounded-xl bg-ink-50 px-3.5 py-2.5 text-xs text-ink-500">
                <UserRound className="size-4 shrink-0 translate-y-0.5" />
                <p>Driver information: your driver’s name, vehicle plate, and contact number will be sent by email and SMS 24 hours before pickup.</p>
              </div>
            </div>
          </div>

          <h2 className="font-display text-xl font-bold text-ink-950">Booking details</h2>
          {profile ? <TransferBookingForm onContinue={handleContinue} /> : <SignInToBookPrompt />}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <PriceBreakdown pricing={pricing} lines={['Fixed price for this route — no surge pricing']} />
          <p className="mt-3 flex items-start gap-2 text-xs text-ink-400">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            Free cancellation up to 24 hours before pickup, unless noted otherwise.
          </p>
        </div>
      </div>
    </div>
  );
}
