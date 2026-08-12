import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { ErrorState } from '@/components/ui/ErrorState';
import { useAsync } from '@/hooks/useAsync';
import { listAllBookings, updateBookingStatus } from '@/services/bookingService';
import { useCurrency } from '@/context/CurrencyContext';
import { useToast } from '@/context/ToastContext';
import { useLanguage } from '@/context/LanguageContext';
import { describeBooking } from '@/utils/booking';
import { formatDateShort } from '@/utils/date';
import type { Booking } from '@/types/booking';
import type { BookingStatus, BookingType } from '@/types/common';

const STATUS_TONE: Record<BookingStatus, 'success' | 'brand' | 'danger' | 'neutral'> = {
  confirmed: 'success',
  pending: 'brand',
  cancelled: 'danger',
  completed: 'neutral',
};

export default function AdminBookingsPage() {
  const { format } = useCurrency();
  const toast = useToast();
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<BookingType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const bookings = useAsync(() => listAllBookings(500), []);
  const STATUS_LABEL: Record<BookingStatus, string> = {
    pending: t('admin.overview.pending'),
    confirmed: t('admin.overview.confirmed'),
    completed: t('admin.overview.completed'),
    cancelled: t('admin.overview.cancelled'),
  };

  async function handleStatusChange(booking: Booking, status: BookingStatus) {
    try {
      await updateBookingStatus(booking.id, status, status === 'cancelled' ? 'refunded' : booking.paymentStatus);
      toast.success(t('admin.bookings.statusUpdatedToast'));
      bookings.refetch();
    } catch (error) {
      toast.error(t('admin.bookings.statusUpdateError'), error instanceof Error ? error.message : undefined);
    }
  }

  if (bookings.error) return <ErrorState description={bookings.error} onRetry={bookings.refetch} />;

  const filtered = (bookings.data ?? []).filter((b) => {
    if (typeFilter !== 'all' && b.bookingType !== typeFilter) return false;
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (search && !`${b.bookingReference} ${b.customerInfo.firstName} ${b.customerInfo.lastName} ${b.customerInfo.email}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const columns: Column<Booking>[] = [
    { key: 'reference', header: t('admin.bookings.colReference'), render: (b) => <span className="font-mono text-xs font-semibold text-brand-700">{b.bookingReference}</span> },
    { key: 'service', header: t('admin.bookings.colService'), render: (b) => <div><p className="font-medium capitalize">{b.bookingType}</p><p className="text-xs text-ink-400">{describeBooking(b).title}</p></div> },
    { key: 'customer', header: t('admin.bookings.colCustomer'), render: (b) => <div><p>{b.customerInfo.firstName} {b.customerInfo.lastName}</p><p className="text-xs text-ink-400">{b.customerInfo.email}</p></div> },
    { key: 'date', header: t('admin.bookings.colDate'), render: (b) => formatDateShort(b.startDate) },
    { key: 'total', header: t('admin.bookings.colTotal'), render: (b) => format(b.pricing.total) },
    { key: 'payment', header: t('admin.bookings.colPayment'), render: (b) => <span className="text-xs capitalize text-ink-600">{b.paymentStatus}</span> },
    {
      key: 'status',
      header: t('admin.bookings.colStatus'),
      render: (b) => (
        <div className="flex items-center gap-2">
          <Badge tone={STATUS_TONE[b.status]}>{STATUS_LABEL[b.status]}</Badge>
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader title={t('admin.nav.bookings')} description={t('admin.bookings.subtitle')} search={search} onSearchChange={setSearch} searchPlaceholder={t('admin.bookings.searchPlaceholder')} />

      <div className="mb-4 flex flex-wrap gap-3">
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

      <DataTable
        columns={columns}
        rows={filtered}
        keyField={(b) => b.id}
        loading={bookings.loading}
        actions={(b) => (
          <div className="flex items-center justify-end gap-2">
            <Select value={b.status} onChange={(e) => handleStatusChange(b, e.target.value as BookingStatus)} className="h-8 w-32 text-xs">
              <option value="pending">{t('admin.overview.pending')}</option>
              <option value="confirmed">{t('admin.overview.confirmed')}</option>
              <option value="completed">{t('admin.overview.completed')}</option>
              <option value="cancelled">{t('admin.overview.cancelled')}</option>
            </Select>
            <Link to={`/confirmation/${b.id}`} aria-label={t('admin.bookings.viewAriaLabel')} className="flex size-8 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100">
              <Eye className="size-4" />
            </Link>
          </div>
        )}
      />
    </div>
  );
}
