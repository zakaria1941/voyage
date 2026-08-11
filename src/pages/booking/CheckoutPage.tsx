import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { PriceBreakdown } from '@/components/booking/PriceBreakdown';
import { CouponInput } from '@/components/booking/CouponInput';
import { DemoPaymentForm } from '@/components/booking/DemoPaymentForm';
import { EmptyState } from '@/components/ui/EmptyState';
import { LinkButton } from '@/components/ui/LinkButton';
import { createBooking } from '@/services/bookingService';
import { activePaymentProvider } from '@/services/payment/DemoPaymentProvider';
import type { PaymentDetails } from '@/services/payment/PaymentProvider';
import { useToast } from '@/context/ToastContext';
import type { DraftBooking } from '@/types/draftBooking';
import { round2 } from '@/utils/pricing';
import { getFriendlyErrorMessage } from '@/utils/errors';
import { formatDateLong } from '@/utils/date';

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const draft = (location.state as { draft?: DraftBooking } | null)?.draft;

  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!draft) {
    return (
      <div className="container-page py-16">
        <EmptyState
          title="Nothing to check out"
          description="Your booking details weren’t found — this can happen after a page refresh. Please start your search again."
          action={<LinkButton to="/">Back to home</LinkButton>}
        />
      </div>
    );
  }

  const discount = coupon?.discount ?? 0;
  const displayPricing = {
    ...draft.previewPricing,
    discount,
    total: round2(draft.previewPricing.basePrice + draft.previewPricing.taxes + draft.previewPricing.fees - discount),
  };

  async function handlePay(paymentDetails: PaymentDetails) {
    if (!draft) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await activePaymentProvider.charge(displayPricing.total, paymentDetails);
      if (!result.success) {
        setError(result.errorMessage || 'Payment failed. Please try again.');
        setSubmitting(false);
        return;
      }

      const response = await createBooking({
        bookingType: draft.bookingType,
        itemId: draft.itemId,
        startDate: draft.startDate,
        endDate: draft.endDate,
        guests: draft.guests,
        customerInfo: draft.customerInfo,
        details: draft.details,
        couponCode: coupon?.code,
        specialRequests: draft.specialRequests,
      });

      toast.success('Booking confirmed!', `Reference ${response.bookingReference}`);
      navigate(`/confirmation/${response.bookingId}`, { replace: true });
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'We couldn’t complete your booking. Please try again.'));
      setSubmitting(false);
    }
  }

  return (
    <div className="container-page py-8">
      <h1 className="font-display text-2xl font-bold text-ink-950 sm:text-3xl">Checkout</h1>
      <p className="mt-1 text-ink-500">Review your order and complete payment to confirm your booking.</p>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
        <div className="order-2 flex flex-col gap-6 lg:order-1">
          <CouponInput service={draft.bookingType} amount={draft.previewPricing.basePrice} onApplied={setCoupon} />
          <DemoPaymentForm submitting={submitting} onSubmit={handlePay} />
          {error && (
            <p role="alert" className="rounded-xl bg-danger-50 px-4 py-3 text-sm font-medium text-danger-600">
              {error}
            </p>
          )}
          <p className="flex items-center gap-2 text-xs text-ink-400">
            <ShieldCheck className="size-4" />
            Your booking is protected — most rates include free cancellation. See the fare details above.
          </p>
        </div>

        <div className="order-1 flex flex-col gap-6 lg:order-2 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
            <h2 className="font-display text-base font-semibold text-ink-950">{draft.displayLabel}</h2>
            {draft.displaySubLabel && <p className="mt-1 text-sm text-ink-500">{draft.displaySubLabel}</p>}
            <p className="mt-2 text-xs text-ink-400">
              {formatDateLong(draft.startDate)}
              {draft.endDate !== draft.startDate ? ` – ${formatDateLong(draft.endDate)}` : ''}
            </p>
          </div>
          <PriceBreakdown pricing={displayPricing} />
        </div>
      </div>
    </div>
  );
}
