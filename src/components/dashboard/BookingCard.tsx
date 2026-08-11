import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plane, Hotel, Car, CarTaxiFront, Download, X } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useCurrency } from '@/context/CurrencyContext';
import { useToast } from '@/context/ToastContext';
import { cancelBooking } from '@/services/bookingService';
import { describeBooking } from '@/utils/booking';
import { formatDateLong } from '@/utils/date';
import type { Booking } from '@/types/booking';
import type { BookingType } from '@/types/common';

const SERVICE_ICON: Record<BookingType, typeof Plane> = { flight: Plane, hotel: Hotel, car: Car, transfer: CarTaxiFront };
const STATUS_TONE: Record<Booking['status'], 'success' | 'brand' | 'danger' | 'neutral'> = {
  confirmed: 'success',
  pending: 'brand',
  cancelled: 'danger',
  completed: 'neutral',
};

export function BookingCard({ booking, onChanged }: { booking: Booking; onChanged?: () => void }) {
  const { format } = useCurrency();
  const toast = useToast();
  const [cancelling, setCancelling] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [now] = useState(() => Date.now());

  const { title, subtitle } = describeBooking(booking);
  const Icon = SERVICE_ICON[booking.bookingType];
  const canCancel = (booking.status === 'confirmed' || booking.status === 'pending') && booking.startDate > now;

  async function handleCancel() {
    setCancelling(true);
    try {
      await cancelBooking(booking.id, 'Cancelled by customer');
      toast.success('Booking cancelled');
      setShowConfirm(false);
      onChanged?.();
    } catch (error) {
      toast.error('Couldn’t cancel booking', error instanceof Error ? error.message : undefined);
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <Icon className="size-5" />
          </span>
          <div>
            <p className="font-display text-base font-semibold text-ink-950">{title}</p>
            <p className="text-sm text-ink-500">{subtitle}</p>
            <p className="mt-1 text-xs text-ink-400">
              {booking.bookingReference} · {formatDateLong(booking.startDate)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <Badge tone={STATUS_TONE[booking.status]} className="capitalize">{booking.status}</Badge>
          <p className="mt-2 font-display text-lg font-bold text-ink-950">{format(booking.pricing.total)}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ink-100 pt-4">
        <Link to={`/confirmation/${booking.id}`} className="rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-ink-50">
          View details
        </Link>
        <Link to={`/confirmation/${booking.id}`} className="flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-ink-50">
          <Download className="size-3.5" />
          Confirmation
        </Link>
        {canCancel && (
          <button type="button" onClick={() => setShowConfirm(true)} className="flex items-center gap-1.5 rounded-lg border border-danger-200 px-3 py-1.5 text-xs font-semibold text-danger-600 hover:bg-danger-50">
            <X className="size-3.5" />
            Cancel booking
          </button>
        )}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lifted animate-scale-in">
            <h3 className="font-display text-lg font-semibold text-ink-950">Cancel this booking?</h3>
            <p className="mt-1.5 text-sm text-ink-500">This can’t be undone. Refunds follow the fare’s cancellation policy.</p>
            <div className="mt-5 flex justify-end gap-2.5">
              <Button variant="outline" onClick={() => setShowConfirm(false)}>
                Keep booking
              </Button>
              <Button variant="danger" onClick={handleCancel} loading={cancelling}>
                Cancel booking
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
