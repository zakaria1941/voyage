import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Users, DoorOpen, Fuel, Settings2, Gauge, ShieldCheck, Banknote, Heart, Building2 } from 'lucide-react';
import { ImageGallery } from '@/components/booking/ImageGallery';
import { PriceBreakdown } from '@/components/booking/PriceBreakdown';
import { GuestDetailsForm, type GuestDetailsValues } from '@/components/booking/GuestDetailsForm';
import { SignInToBookPrompt } from '@/components/booking/SignInToBookPrompt';
import { PageSpinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { Badge } from '@/components/ui/Badge';
import { useAsync } from '@/hooks/useAsync';
import { getCar } from '@/services/carService';
import { isFavorite, addFavorite, removeFavorite } from '@/services/favoriteService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useCurrency } from '@/context/CurrencyContext';
import { calculateCarRentalPrice } from '@/utils/pricing';
import { daysBetween, todayISO, addDaysISO } from '@/utils/date';
import type { DraftBooking } from '@/types/draftBooking';
import type { CarBookingDetails } from '@/types/booking';
import { cn } from '@/utils/cn';

export default function CarDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const toast = useToast();
  const { format } = useCurrency();

  const pickupDate = searchParams.get('pickupDate') || todayISO();
  const pickupTime = searchParams.get('pickupTime') || '10:00';
  const dropoffDate = searchParams.get('dropoffDate') || addDaysISO(todayISO(), 3);
  const dropoffTime = searchParams.get('dropoffTime') || '10:00';
  const driverAge = Number(searchParams.get('driverAge') || 30);
  const pickupLocation = searchParams.get('pickupLocation') || '';
  const days = Math.max(1, daysBetween(pickupDate, dropoffDate));

  const [favLoading, setFavLoading] = useState(false);
  const [isFav, setIsFav] = useState(false);

  const car = useAsync(() => (id ? getCar(id) : Promise.resolve(null)), [id]);

  useEffect(() => {
    if (!profile || !id) return;
    let cancelled = false;
    isFavorite(profile.uid, 'car', id).then((fav) => {
      if (!cancelled) setIsFav(fav);
    });
    return () => {
      cancelled = true;
    };
  }, [profile, id]);

  async function toggleFavorite() {
    if (!profile || !id) return;
    setFavLoading(true);
    try {
      if (isFav) {
        await removeFavorite(profile.uid, 'car', id);
        setIsFav(false);
      } else {
        await addFavorite(profile.uid, 'car', id);
        setIsFav(true);
        toast.success('Saved to favorites');
      }
    } finally {
      setFavLoading(false);
    }
  }

  if (car.loading) return <PageSpinner label="Loading car…" />;
  if (car.error || !car.data) {
    return (
      <div className="container-page py-16">
        <ErrorState title="Car not found" description="This car may no longer be available." />
      </div>
    );
  }

  const c = car.data;
  const pricing = calculateCarRentalPrice(c.pricePerDay, days);
  const driverTooYoung = driverAge < c.minDriverAge;

  function handleContinue(values: GuestDetailsValues) {
    if (!id) return;
    const pickupAt = new Date(`${pickupDate}T${pickupTime}:00`).getTime();
    const dropoffAt = new Date(`${dropoffDate}T${dropoffTime}:00`).getTime();

    const details: CarBookingDetails = {
      carId: id,
      carName: `${c!.make} ${c!.model}`,
      pickupLocation: pickupLocation || c!.pickupLocation,
      dropoffLocation: pickupLocation || c!.pickupLocation,
      pickupAt,
      dropoffAt,
      driverAge,
      driverName: `${values.firstName} ${values.lastName}`,
    };

    const draft: DraftBooking = {
      bookingType: 'car',
      itemId: id,
      startDate: pickupAt,
      endDate: dropoffAt,
      guests: 1,
      customerInfo: { firstName: values.firstName, lastName: values.lastName, email: values.email, phone: values.phone },
      details,
      specialRequests: values.specialRequests,
      previewPricing: pricing,
      displayLabel: `${c!.make} ${c!.model}`,
      displaySubLabel: `${c!.supplierName} · ${days} day${days > 1 ? 's' : ''}`,
    };

    navigate(`/booking/car/${id}`, { state: { draft } });
  }

  return (
    <div className="container-page py-8">
      <ImageGallery images={c.images} alt={`${c.make} ${c.model}`} />

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-8">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <Badge tone="brand" className="mb-2 capitalize">{c.category}</Badge>
                <h1 className="font-display text-2xl font-bold text-ink-950 sm:text-3xl">{c.make} {c.model}</h1>
                <p className="mt-1 text-sm text-ink-500">or similar · {c.pickupLocation}</p>
              </div>
              {profile && (
                <button
                  type="button"
                  onClick={toggleFavorite}
                  disabled={favLoading}
                  aria-pressed={isFav}
                  aria-label={isFav ? 'Remove from favorites' : 'Save to favorites'}
                  className={cn('flex size-11 shrink-0 items-center justify-center rounded-full border transition-colors', isFav ? 'border-danger-200 bg-danger-50 text-danger-600' : 'border-ink-200 text-ink-500 hover:border-ink-300')}
                >
                  <Heart className={cn('size-5', isFav && 'fill-current')} />
                </button>
              )}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 rounded-2xl border border-ink-100 bg-white p-5 shadow-soft sm:grid-cols-4">
              <div className="flex flex-col items-center gap-1.5 text-center">
                <Settings2 className="size-5 text-brand-600" />
                <span className="text-xs capitalize text-ink-600">{c.transmission}</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 text-center">
                <Users className="size-5 text-brand-600" />
                <span className="text-xs text-ink-600">{c.seats} seats</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 text-center">
                <DoorOpen className="size-5 text-brand-600" />
                <span className="text-xs text-ink-600">{c.doors} doors</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 text-center">
                <Fuel className="size-5 text-brand-600" />
                <span className="text-xs capitalize text-ink-600">{c.fuelType}</span>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {c.features.map((f) => (
                <Badge key={f} tone="neutral" className="capitalize">{f.replace(/_/g, ' ')}</Badge>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
            <p className="flex items-center gap-2 font-display text-base font-semibold text-ink-950">
              <Building2 className="size-4 text-brand-600" />
              Supplied by {c.supplierName}
            </p>
            <dl className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <div className="flex items-start gap-2.5">
                <Gauge className="mt-0.5 size-4 shrink-0 text-ink-400" />
                <div>
                  <dt className="font-medium text-ink-900">Mileage policy</dt>
                  <dd className="text-ink-500">{c.mileagePolicy}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Fuel className="mt-0.5 size-4 shrink-0 text-ink-400" />
                <div>
                  <dt className="font-medium text-ink-900">Fuel policy</dt>
                  <dd className="text-ink-500">Full to full — return with the same fuel level as pickup.</dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-ink-400" />
                <div>
                  <dt className="font-medium text-ink-900">Insurance</dt>
                  <dd className="text-ink-500">Collision damage waiver included, with standard excess.</dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Banknote className="mt-0.5 size-4 shrink-0 text-ink-400" />
                <div>
                  <dt className="font-medium text-ink-900">Deposit</dt>
                  <dd className="text-ink-500">{format(c.depositAmount)} held at pickup, refunded after return.</dd>
                </div>
              </div>
            </dl>
            <p className="mt-4 rounded-xl bg-ink-50 px-3.5 py-2.5 text-xs text-ink-500">
              Pickup instructions: present a valid driving licence, the card used to book, and photo ID at the {c.pickupLocation} counter. Minimum driver age: {c.minDriverAge}. Free cancellation up to 48 hours before pickup.
            </p>
          </div>

          {driverTooYoung && (
            <p className="rounded-xl bg-warning-50 px-4 py-3 text-sm font-medium text-warning-700">
              The driver age entered in your search ({driverAge}) is below this car’s minimum of {c.minDriverAge}. Please adjust your search.
            </p>
          )}

          {!driverTooYoung && (
            <div>
              <h2 className="mb-4 font-display text-xl font-bold text-ink-950">Driver details</h2>
              {profile ? <GuestDetailsForm submitLabel="Continue to payment" onContinue={handleContinue} /> : <SignInToBookPrompt />}
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <PriceBreakdown pricing={pricing} lines={[`${format(c.pricePerDay)} × ${days} day${days > 1 ? 's' : ''}`]} />
        </div>
      </div>
    </div>
  );
}
