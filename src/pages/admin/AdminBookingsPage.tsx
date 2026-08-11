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
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<BookingType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const bookings = useAsync(() => listAllBookings(500), []);

  async function handleStatusChange(booking: Booking, status: BookingStatus) {
    try {
      await updateBookingStatus(booking.id, status, status === 'cancelled' ? 'refunded' : booking.paymentStatus);
      toast.success('Booking status updated');
      bookings.refetch();
    } catch (error) {
      toast.error('Couldn’t update status', error instanceof Error ? error.message : undefined);
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
    { key: 'reference', header: 'Reference', render: (b) => <span className="font-mono text-xs font-semibold text-brand-700">{b.bookingReference}</span> },
    { key: 'service', header: 'Service', render: (b) => <div><p className="font-medium capitalize">{b.bookingType}</p><p className="text-xs text-ink-400">{describeBooking(b).title}</p></div> },
    { key: 'customer', header: 'Customer', render: (b) => <div><p>{b.customerInfo.firstName} {b.customerInfo.lastName}</p><p className="text-xs text-ink-400">{b.customerInfo.email}</p></div> },
    { key: 'date', header: 'Date', render: (b) => formatDateShort(b.startDate) },
    { key: 'total', header: 'Total', render: (b) => format(b.pricing.total) },
    { key: 'payment', header: 'Payment', render: (b) => <span className="text-xs capitalize text-ink-600">{b.paymentStatus}</span> },
    {
      key: 'status',
      header: 'Status',
      render: (b) => (
        <div className="flex items-center gap-2">
          <Badge tone={STATUS_TONE[b.status]} className="capitalize">{b.status}</Badge>
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader title="Bookings" description="All bookings across every service." search={search} onSearchChange={setSearch} searchPlaceholder="Search reference or customer…" />

      <div className="mb-4 flex flex-wrap gap-3">
        <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as BookingType | 'all')} className="w-auto">
          <option value="all">All services</option>
          <option value="flight">Flights</option>
          <option value="hotel">Hotels</option>
          <option value="car">Cars</option>
          <option value="transfer">Transfers</option>
        </Select>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as BookingStatus | 'all')} className="w-auto">
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
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
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </Select>
            <Link to={`/confirmation/${b.id}`} aria-label="View booking" className="flex size-8 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100">
              <Eye className="size-4" />
            </Link>
          </div>
        )}
      />
    </div>
  );
}
