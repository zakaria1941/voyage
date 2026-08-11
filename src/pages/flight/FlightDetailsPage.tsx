import { useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FlightItineraryCard } from '@/components/flight/FlightItineraryCard';
import { PassengerForm, type PassengerFormValues } from '@/components/flight/PassengerForm';
import { PriceBreakdown } from '@/components/booking/PriceBreakdown';
import { SignInToBookPrompt } from '@/components/booking/SignInToBookPrompt';
import { PageSpinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { useAsync } from '@/hooks/useAsync';
import { useAuth } from '@/context/AuthContext';
import { getFlight } from '@/services/flightService';
import { calculateFlightPrice } from '@/utils/pricing';
import type { CabinClass, TripType } from '@/types/search';
import type { DraftBooking } from '@/types/draftBooking';
import type { FlightBookingDetails } from '@/types/booking';

export default function FlightDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const returnId = searchParams.get('returnId');
  const cabin = (searchParams.get('cabin') as CabinClass) || 'economy';
  const tripType = (searchParams.get('tripType') as TripType) || 'oneway';
  const adults = Number(searchParams.get('adults') || 1);
  const children = Number(searchParams.get('children') || 0);
  const infants = Number(searchParams.get('infants') || 0);
  const totalPassengers = adults + children + infants;

  const outbound = useAsync(() => (id ? getFlight(id) : Promise.resolve(null)), [id]);
  const returnFlight = useAsync(() => (returnId ? getFlight(returnId) : Promise.resolve(null)), [returnId]);

  const passengerLabels = useMemo(() => {
    const labels: string[] = [];
    for (let i = 1; i <= adults; i++) labels.push(`Adult ${i}`);
    for (let i = 1; i <= children; i++) labels.push(`Child ${i}`);
    for (let i = 1; i <= infants; i++) labels.push(`Infant ${i}`);
    return labels.length ? labels : ['Passenger 1'];
  }, [adults, children, infants]);

  const loading = outbound.loading || (Boolean(returnId) && returnFlight.loading);
  if (loading) return <PageSpinner label="Loading flight…" />;

  if (outbound.error || !outbound.data) {
    return (
      <div className="container-page py-16">
        <ErrorState title="Flight not found" description="This flight may no longer be available. Please search again." />
      </div>
    );
  }
  if (returnId && (returnFlight.error || !returnFlight.data)) {
    return (
      <div className="container-page py-16">
        <ErrorState title="Return flight not found" description="This flight may no longer be available. Please search again." />
      </div>
    );
  }

  const flight = outbound.data;
  const back = returnFlight.data;
  const fare = flight.fares[cabin];
  const backFare = back?.fares[cabin];

  if (!fare || (back && !backFare)) {
    return (
      <div className="container-page py-16">
        <ErrorState title="Cabin unavailable" description="That cabin class is no longer available on this flight." />
      </div>
    );
  }

  const pricePerPassenger = fare.price + (backFare?.price ?? 0);
  const pricing = calculateFlightPrice(pricePerPassenger, totalPassengers);

  function handleContinue(values: PassengerFormValues) {
    const details: FlightBookingDetails = {
      tripType,
      cabin,
      outboundFlightId: flight.id,
      returnFlightId: back?.id ?? null,
      passengers: values.passengers,
    };

    const draft: DraftBooking = {
      bookingType: 'flight',
      itemId: flight.id,
      startDate: flight.departureTime,
      endDate: back ? back.arrivalTime : flight.arrivalTime,
      guests: totalPassengers,
      customerInfo: {
        firstName: values.passengers[0].firstName,
        lastName: values.passengers[0].lastName,
        email: values.email,
        phone: values.phone,
      },
      details,
      previewPricing: pricing,
      displayLabel: `${flight.airlineName} ${flight.flightNumber}`,
      displaySubLabel: `${flight.originCode} → ${flight.destinationCode}${back ? ' · Round trip' : ' · One way'}`,
    };

    navigate(`/booking/flight/${flight.id}`, { state: { draft } });
  }

  return (
    <div className="container-page py-8">
      <h1 className="font-display text-2xl font-bold text-ink-950 sm:text-3xl">Review your flight</h1>
      <p className="mt-1 text-ink-500">Double-check the details, then add passenger information.</p>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          <FlightItineraryCard flight={flight} cabin={cabin} label="Outbound" />
          {back && <FlightItineraryCard flight={back} cabin={cabin} label="Return" />}

          <h2 className="mt-2 font-display text-xl font-bold text-ink-950">Passenger information</h2>
          {profile ? <PassengerForm passengerLabels={passengerLabels} onContinue={handleContinue} /> : <SignInToBookPrompt />}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <PriceBreakdown
            pricing={pricing}
            lines={[`${totalPassengers} passenger${totalPassengers > 1 ? 's' : ''} × ${back ? '2 flights' : '1 flight'}`]}
          />
        </div>
      </div>
    </div>
  );
}
