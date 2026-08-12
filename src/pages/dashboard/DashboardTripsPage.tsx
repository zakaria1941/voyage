import { useState } from 'react';
import { Luggage } from 'lucide-react';
import { BookingCard } from '@/components/dashboard/BookingCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageSpinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { useAsync } from '@/hooks/useAsync';
import { listMyBookings } from '@/services/bookingService';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import type { TranslationKey } from '@/i18n';
import { cn } from '@/utils/cn';

type Tab = 'upcoming' | 'completed' | 'cancelled';
const TABS: { value: Tab; labelKey: TranslationKey }[] = [
  { value: 'upcoming', labelKey: 'dashboard.trips.tabUpcoming' },
  { value: 'completed', labelKey: 'admin.overview.completed' },
  { value: 'cancelled', labelKey: 'admin.overview.cancelled' },
];

export default function DashboardTripsPage() {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [tab, setTab] = useState<Tab>('upcoming');
  const bookings = useAsync(() => (profile ? listMyBookings(profile.uid) : Promise.resolve([])), [profile?.uid]);
  const [now] = useState(() => Date.now());

  if (bookings.loading) return <PageSpinner label={t('dashboard.trips.loading')} />;
  if (bookings.error) return <ErrorState description={bookings.error} onRetry={bookings.refetch} />;

  const all = bookings.data ?? [];
  const filtered = all.filter((b) => {
    if (tab === 'cancelled') return b.status === 'cancelled';
    if (tab === 'completed') return b.status === 'completed' || (b.status === 'confirmed' && b.endDate < now);
    return b.status !== 'cancelled' && !(b.status === 'completed' || (b.status === 'confirmed' && b.endDate < now));
  });
  const activeTabLabel = t(TABS.find((x) => x.value === tab)!.labelKey);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-950 sm:text-3xl">{t('nav.myTrips')}</h1>
      <p className="mt-1 text-ink-500">{t('dashboard.trips.subtitle')}</p>

      <div className="mt-6 inline-flex rounded-lg bg-ink-100 p-1">
        {TABS.map((tItem) => (
          <button
            key={tItem.value}
            type="button"
            onClick={() => setTab(tItem.value)}
            className={cn('rounded-md px-4 py-1.5 text-sm font-medium transition-colors', tab === tItem.value ? 'bg-white text-brand-700 shadow-sm' : 'text-ink-600 hover:text-ink-900')}
          >
            {t(tItem.labelKey)}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {filtered.length === 0 ? (
          <EmptyState icon={<Luggage className="size-6" />} title={t('dashboard.trips.noneTitle', { tab: activeTabLabel.toLowerCase() })} description={t('dashboard.trips.noneDesc')} />
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((b) => (
              <BookingCard key={b.id} booking={b} onChanged={bookings.refetch} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
