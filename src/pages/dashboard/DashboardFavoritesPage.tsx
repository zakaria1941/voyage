import { Heart, Plane, Hotel as HotelIcon, Car as CarIcon, CarTaxiFront } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageSpinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { CardHoverable } from '@/components/ui/Card';
import { useAsync } from '@/hooks/useAsync';
import { listFavorites, removeFavorite } from '@/services/favoriteService';
import { getHotel } from '@/services/hotelService';
import { getCar } from '@/services/carService';
import { getFlight } from '@/services/flightService';
import { getTransfer } from '@/services/transferService';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useToast } from '@/context/ToastContext';
import type { Favorite } from '@/types/favorite';

interface ResolvedFavorite {
  favorite: Favorite;
  title: string;
  subtitle: string;
  image: string | null;
  price: number | null;
  href: string;
}

async function resolveFavorite(fav: Favorite): Promise<ResolvedFavorite | null> {
  if (fav.itemType === 'hotel') {
    const hotel = await getHotel(fav.itemId);
    if (!hotel) return null;
    return { favorite: fav, title: hotel.name, subtitle: `${hotel.city}, ${hotel.country}`, image: hotel.images[0] ?? null, price: hotel.pricePerNight, href: `/hotels/${hotel.id}` };
  }
  if (fav.itemType === 'car') {
    const car = await getCar(fav.itemId);
    if (!car) return null;
    return { favorite: fav, title: `${car.make} ${car.model}`, subtitle: car.pickupLocation, image: car.images[0] ?? null, price: car.pricePerDay, href: `/cars/${car.id}` };
  }
  if (fav.itemType === 'flight') {
    const flight = await getFlight(fav.itemId);
    if (!flight) return null;
    return { favorite: fav, title: `${flight.airlineName} ${flight.flightNumber}`, subtitle: `${flight.originCode} → ${flight.destinationCode}`, image: null, price: flight.price, href: `/flights/${flight.id}` };
  }
  const transfer = await getTransfer(fav.itemId);
  if (!transfer) return null;
  return { favorite: fav, title: transfer.vehicleName, subtitle: `${transfer.airportCode} · ${transfer.city}`, image: transfer.image, price: transfer.pricePerTrip, href: `/transfers/${transfer.id}` };
}

const TYPE_ICON = { hotel: HotelIcon, car: CarIcon, flight: Plane, transfer: CarTaxiFront };

export default function DashboardFavoritesPage() {
  const { profile } = useAuth();
  const { format } = useCurrency();
  const toast = useToast();

  const resolved = useAsync(async () => {
    if (!profile) return [];
    const favorites = await listFavorites(profile.uid);
    const items = await Promise.all(favorites.map(resolveFavorite));
    return items.filter((i): i is ResolvedFavorite => i !== null);
  }, [profile?.uid]);

  async function handleRemove(fav: Favorite) {
    if (!profile) return;
    await removeFavorite(profile.uid, fav.itemType, fav.itemId);
    toast.success('Removed from favorites');
    resolved.refetch();
  }

  if (resolved.loading) return <PageSpinner label="Loading your favorites…" />;
  if (resolved.error) return <ErrorState description={resolved.error} onRetry={resolved.refetch} />;

  const items = resolved.data ?? [];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-950 sm:text-3xl">Favorites</h1>
      <p className="mt-1 text-ink-500">Hotels, cars, flights, and transfers you’ve saved.</p>

      <div className="mt-6">
        {items.length === 0 ? (
          <EmptyState icon={<Heart className="size-6" />} title="No favorites yet" description="Tap the heart icon on any hotel or car to save it here." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const Icon = TYPE_ICON[item.favorite.itemType];
              return (
                <CardHoverable key={`${item.favorite.itemType}_${item.favorite.itemId}`} className="relative overflow-hidden">
                  <Link to={item.href} className="block">
                    <div className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-ink-50">
                      {item.image ? <img src={item.image} alt={item.title} className="size-full object-cover" /> : <Icon className="size-8 text-ink-300" />}
                    </div>
                    <div className="p-4">
                      <p className="truncate font-display text-sm font-semibold text-ink-950">{item.title}</p>
                      <p className="truncate text-xs text-ink-500">{item.subtitle}</p>
                      {item.price != null && <p className="mt-1.5 text-sm font-semibold text-brand-800">{format(item.price)}</p>}
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.favorite)}
                    aria-label="Remove from favorites"
                    className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-white/90 text-danger-600 shadow-sm hover:bg-white"
                  >
                    <Heart className="size-4 fill-current" />
                  </button>
                </CardHoverable>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
