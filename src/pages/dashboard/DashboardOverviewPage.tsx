import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Luggage, Ticket, Heart, TrendingUp, Plane, Hotel, Car, CarTaxiFront } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { BookingCard } from '@/components/dashboard/BookingCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageSpinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { useAsync } from '@/hooks/useAsync';
import { listMyBookings } from '@/services/bookingService';
import { listFavorites } from '@/services/favoriteService';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';

const QUICK_LINKS = [
  { to: '/flights', label: 'Flights', icon: Plane },
  { to: '/hotels', label: 'Hotels', icon: Hotel },
  { to: '/cars', label: 'Cars', icon: Car },
  { to: '/transfers', label: 'Transfers', icon: CarTaxiFront },
];

export default function DashboardOverviewPage() {
  const { profile } = useAuth();
  const { format } = useCurrency();
  const bookings = useAsync(() => (profile ? listMyBookings(profile.uid) : Promise.resolve([])), [profile?.uid]);
  const favorites = useAsync(() => (profile ? listFavorites(profile.uid) : Promise.resolve([])), [profile?.uid]);
  const [now] = useState(() => Date.now());

  if (bookings.loading) return <PageSpinner label="Loading your dashboard…" />;
  if (bookings.error) return <ErrorState description={bookings.error} onRetry={bookings.refetch} />;

  const all = bookings.data ?? [];
  const upcoming = all.filter((b) => b.startDate >= now && b.status !== 'cancelled');
  const totalSpent = all.filter((b) => b.status !== 'cancelled').reduce((sum, b) => sum + b.pricing.total, 0);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-950 sm:text-3xl">
        Welcome back{profile ? `, ${profile.firstName}` : ''}
      </h1>
      <p className="mt-1 text-ink-500">Here’s what’s happening with your trips.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Luggage} label="Upcoming trips" value={upcoming.length} />
        <StatCard icon={Ticket} label="Total bookings" value={all.length} tone="accent" />
        <StatCard icon={Heart} label="Favorites" value={favorites.data?.length ?? 0} tone="warning" />
        <StatCard icon={TrendingUp} label="Total spent" value={format(totalSpent)} tone="success" />
      </div>

      <div className="mt-10">
        <h2 className="mb-4 font-display text-lg font-semibold text-ink-950">Search &amp; book</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {QUICK_LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="flex flex-col items-center gap-2 rounded-2xl border border-ink-100 bg-white p-5 text-center shadow-soft transition-shadow hover:shadow-lifted">
              <l.icon className="size-5 text-brand-600" />
              <span className="text-sm font-medium text-ink-800">{l.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink-950">Recent bookings</h2>
          <Link to="/dashboard/bookings" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
            View all
          </Link>
        </div>
        {all.length === 0 ? (
          <EmptyState icon={<Ticket className="size-6" />} title="No bookings yet" description="When you book a flight, hotel, car, or transfer, it’ll show up here." />
        ) : (
          <div className="flex flex-col gap-4">
            {all.slice(0, 3).map((b) => (
              <BookingCard key={b.id} booking={b} onChanged={bookings.refetch} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
