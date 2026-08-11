import { useParams } from 'react-router-dom';
import { CheckCircle2, Download, Plane, Hotel, Car, CarTaxiFront, Info } from 'lucide-react';
import { PageSpinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { LinkButton } from '@/components/ui/LinkButton';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAsync } from '@/hooks/useAsync';
import { getBooking } from '@/services/bookingService';
import { useCurrency } from '@/context/CurrencyContext';
import type { BookingType } from '@/types/common';
import { formatDateLong } from '@/utils/date';

const SERVICE_META: Record<BookingType, { icon: typeof Plane; label: string; info: string }> = {
  flight: { icon: Plane, label: 'Flight', info: 'Arrive at the airport at least 2 hours before departure with a valid passport. Check your airline’s baggage policy before you travel.' },
  hotel: { icon: Hotel, label: 'Hotel', info: 'Check-in typically opens from 3pm and check-out is by 11am, unless noted otherwise on your room’s policy. Bring a valid ID for check-in.' },
  car: { icon: Car, label: 'Car rental', info: 'Bring a valid driving licence and the card used to book. Review the fuel and mileage policy shown on your booking before pickup.' },
  transfer: { icon: CarTaxiFront, label: 'Airport transfer', info: 'Your driver will monitor your flight number for delays. Look for a driver holding a sign with your name at the meeting point.' },
};

export default function ConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const { format } = useCurrency();
  const booking = useAsync(() => (id ? getBooking(id) : Promise.resolve(null)), [id]);

  if (booking.loading) return <PageSpinner label="Loading your confirmation…" />;

  if (booking.error || !booking.data) {
    return (
      <div className="container-page py-16">
        <ErrorState title="Booking not found" description="We couldn’t find that booking. Check your dashboard for your confirmed trips." />
      </div>
    );
  }

  const b = booking.data;
  const meta = SERVICE_META[b.bookingType];
  const Icon = meta.icon;

  return (
    <div className="container-page max-w-2xl py-10">
      <div className="flex flex-col items-center text-center print:hidden">
        <span className="flex size-16 items-center justify-center rounded-full bg-success-50 text-success-600">
          <CheckCircle2 className="size-9" />
        </span>
        <h1 className="mt-5 font-display text-3xl font-bold text-ink-950">Booking confirmed</h1>
        <p className="mt-2 text-ink-500">A confirmation has been added to your dashboard.</p>
      </div>

      <div className="mt-8 rounded-2xl border border-ink-100 bg-white p-6 shadow-soft sm:p-8" id="confirmation-print-area">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-ink-200 pb-5">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <Icon className="size-5" />
            </span>
            <div>
              <Badge tone="brand">{meta.label}</Badge>
              <p className="mt-1 font-display text-lg font-bold text-ink-950">{b.bookingReference}</p>
            </div>
          </div>
          <Badge tone={b.status === 'confirmed' ? 'success' : b.status === 'cancelled' ? 'danger' : 'neutral'} className="capitalize">
            {b.status}
          </Badge>
        </div>

        <dl className="mt-5 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-ink-400">Customer</dt>
            <dd className="font-medium text-ink-900">{b.customerInfo.firstName} {b.customerInfo.lastName}</dd>
          </div>
          <div>
            <dt className="text-ink-400">Email</dt>
            <dd className="font-medium text-ink-900">{b.customerInfo.email}</dd>
          </div>
          <div>
            <dt className="text-ink-400">Date</dt>
            <dd className="font-medium text-ink-900">
              {formatDateLong(b.startDate)}
              {b.endDate !== b.startDate ? ` – ${formatDateLong(b.endDate)}` : ''}
            </dd>
          </div>
          <div>
            <dt className="text-ink-400">Payment status</dt>
            <dd className="font-medium capitalize text-ink-900">{b.paymentStatus}</dd>
          </div>
        </dl>

        <div className="mt-5 flex items-center justify-between rounded-xl bg-ink-50 px-4 py-3">
          <span className="text-sm font-medium text-ink-600">Total paid</span>
          <span className="font-display text-xl font-bold text-brand-800">{format(b.pricing.total)}</span>
        </div>

        <div className="mt-5 flex gap-2.5 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-800">
          <Info className="size-4 shrink-0 translate-y-0.5" />
          <p>{meta.info}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 print:hidden">
        <LinkButton to="/dashboard/trips">View booking</LinkButton>
        <Button variant="outline" onClick={() => window.print()}>
          <Download className="size-4" />
          Download confirmation
        </Button>
      </div>
    </div>
  );
}
