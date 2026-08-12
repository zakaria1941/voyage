import { useState } from 'react';
import { Ticket } from 'lucide-react';
import { BookingCard } from '@/components/dashboard/BookingCard';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageSpinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { useAsync } from '@/hooks/useAsync';
import { listMyBookings } from '@/services/bookingService';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import type { BookingStatus, BookingType } from '@/types/common';

export default function DashboardBookingsPage() {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<BookingType | 'all'>('all');
  const bookings = useAsync(() => (profile ? listMyBookings(profile.uid) : Promise.resolve([])), [profile?.uid]);

  if (bookings.loading) return <PageSpinner label={t('dashboard.bookings.loading')} />;
  if (bookings.error) return <ErrorState description={bookings.error} onRetry={bookings.refetch} />;

  const filtered = (bookings.data ?? []).filter((b) => (statusFilter === 'all' || b.status === statusFilter) && (typeFilter === 'all' || b.bookingType === typeFilter));

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-950 sm:text-3xl">{t('dashboard.bookings.title')}</h1>
      <p className="mt-1 text-ink-500">{t('dashboard.bookings.subtitle')}</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as BookingType | 'all')} className="w-auto">
          <option value="all">{t('dashboard.bookings.allServices')}</option>
          <option value="flight">{t('nav.flights')}</option>
          <option value="hotel">{t('nav.hotels')}</option>
          <option value="car">{t('nav.cars')}</option>
          <option value="transfer">{t('nav.transfers')}</option>
        </Select>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as BookingStatus | 'all')} className="w-auto">
          <option value="all">{t('dashboard.bookings.allStatuses')}</option>
          <option value="pending">{t('admin.overview.pending')}</option>
          <option value="confirmed">{t('admin.overview.confirmed')}</option>
          <option value="completed">{t('admin.overview.completed')}</option>
          <option value="cancelled">{t('admin.overview.cancelled')}</option>
        </Select>
      </div>

      <div className="mt-6">
        {filtered.length === 0 ? (
          <EmptyState icon={<Ticket className="size-6" />} title={t('dashboard.bookings.noneFoundTitle')} description={t('dashboard.bookings.noneFoundDesc')} />
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
