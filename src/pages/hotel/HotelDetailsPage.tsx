import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { MapPin, Star, Heart } from 'lucide-react';
import { ImageGallery } from '@/components/booking/ImageGallery';
import { LocationMapCard } from '@/components/booking/LocationMapCard';
import { RoomCard } from '@/components/hotel/RoomCard';
import { PriceBreakdown } from '@/components/booking/PriceBreakdown';
import { GuestDetailsForm, type GuestDetailsValues } from '@/components/booking/GuestDetailsForm';
import { SignInToBookPrompt } from '@/components/booking/SignInToBookPrompt';
import { PageSpinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { useAsync } from '@/hooks/useAsync';
import { getHotel, listRooms } from '@/services/hotelService';
import { isFavorite, addFavorite, removeFavorite } from '@/services/favoriteService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { calculateHotelPrice } from '@/utils/pricing';
import { nightsBetween, todayISO, addDaysISO } from '@/utils/date';
import type { Room } from '@/types/hotel';
import type { DraftBooking } from '@/types/draftBooking';
import type { HotelBookingDetails } from '@/types/booking';
import { cn } from '@/utils/cn';

export default function HotelDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const toast = useToast();

  const checkIn = searchParams.get('checkIn') || todayISO();
  const checkOut = searchParams.get('checkOut') || addDaysISO(todayISO(), 2);
  const roomsRequested = Number(searchParams.get('rooms') || 1);
  const adults = Number(searchParams.get('adults') || 2);
  const children = Number(searchParams.get('children') || 0);
  const nights = nightsBetween(checkIn, checkOut);

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [favLoading, setFavLoading] = useState(false);
  const [isFav, setIsFav] = useState(false);

  const hotel = useAsync(() => (id ? getHotel(id) : Promise.resolve(null)), [id]);
  const rooms = useAsync(() => (id ? listRooms(id) : Promise.resolve([])), [id]);

  useEffect(() => {
    if (!profile || !id) return;
    let cancelled = false;
    isFavorite(profile.uid, 'hotel', id).then((fav) => {
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
        await removeFavorite(profile.uid, 'hotel', id);
        setIsFav(false);
      } else {
        await addFavorite(profile.uid, 'hotel', id);
        setIsFav(true);
        toast.success('Saved to favorites');
      }
    } finally {
      setFavLoading(false);
    }
  }

  if (hotel.loading || rooms.loading) return <PageSpinner label="Loading hotel…" />;
  if (hotel.error || !hotel.data) {
    return (
      <div className="container-page py-16">
        <ErrorState title="Hotel not found" description="This hotel may no longer be available." />
      </div>
    );
  }

  const h = hotel.data;
  const pricing = selectedRoom ? calculateHotelPrice(selectedRoom.pricePerNight, nights, roomsRequested) : null;

  function handleContinue(values: GuestDetailsValues) {
    if (!selectedRoom || !pricing || !id) return;
    const details: HotelBookingDetails = {
      hotelId: id,
      hotelName: h!.name,
      roomId: selectedRoom.id,
      roomName: selectedRoom.name,
      checkIn: new Date(`${checkIn}T15:00:00`).getTime(),
      checkOut: new Date(`${checkOut}T11:00:00`).getTime(),
      nights,
      rooms: roomsRequested,
      primaryGuestName: `${values.firstName} ${values.lastName}`,
    };

    const draft: DraftBooking = {
      bookingType: 'hotel',
      itemId: selectedRoom.id,
      startDate: details.checkIn,
      endDate: details.checkOut,
      guests: adults + children,
      customerInfo: { firstName: values.firstName, lastName: values.lastName, email: values.email, phone: values.phone },
      details,
      specialRequests: values.specialRequests,
      previewPricing: pricing,
      displayLabel: h!.name,
      displaySubLabel: `${selectedRoom.name} · ${roomsRequested} room${roomsRequested > 1 ? 's' : ''} · ${nights} night${nights !== 1 ? 's' : ''}`,
    };

    navigate(`/booking/hotel/${selectedRoom.id}`, { state: { draft } });
  }

  return (
    <div className="container-page py-8">
      <ImageGallery images={h.images} alt={h.name} />

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-8">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="font-display text-2xl font-bold text-ink-950 sm:text-3xl">{h.name}</h1>
                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-ink-500">
                  <MapPin className="size-4" />
                  {h.address}, {h.city}, {h.country}
                </p>
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

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 text-warning-500">
                {Array.from({ length: h.starRating }).map((_, i) => (
                  <Star key={i} className="size-4 fill-current" />
                ))}
              </div>
              <Badge tone="brand">{h.reviewScore.toFixed(1)} · {h.reviewCount} reviews</Badge>
              <span className="text-sm capitalize text-ink-500">{h.propertyType}</span>
            </div>

            <p className="mt-5 leading-relaxed text-ink-600">{h.description}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {h.amenities.map((a) => (
                <Badge key={a} tone="neutral" className="capitalize">
                  {a.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          </div>

          <LocationMapCard address={h.address} city={h.city} country={h.country} />

          <div>
            <h2 className="mb-4 font-display text-xl font-bold text-ink-950">Available rooms</h2>
            {rooms.data && rooms.data.length > 0 ? (
              <div className="flex flex-col gap-4">
                {rooms.data.map((room) => (
                  <RoomCard key={room.id} room={room} selected={selectedRoom?.id === room.id} onSelect={() => setSelectedRoom(room)} />
                ))}
              </div>
            ) : (
              <EmptyState title="No rooms available" description="This hotel currently has no bookable rooms." />
            )}
          </div>

          {selectedRoom && (
            <div id="complete-booking">
              <h2 className="mb-4 font-display text-xl font-bold text-ink-950">Complete your booking</h2>
              {profile ? (
                <GuestDetailsForm onContinue={handleContinue} />
              ) : (
                <SignInToBookPrompt />
              )}
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          {selectedRoom && pricing ? (
            <PriceBreakdown pricing={pricing} lines={[`${roomsRequested} room${roomsRequested > 1 ? 's' : ''} × ${nights} night${nights !== 1 ? 's' : ''}`]} />
          ) : (
            <div className="rounded-2xl border border-dashed border-ink-200 p-5 text-center text-sm text-ink-500">Select a room to see pricing</div>
          )}
        </div>
      </div>
    </div>
  );
}
