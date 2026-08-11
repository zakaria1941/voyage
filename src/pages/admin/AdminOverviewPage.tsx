import { Users, Ticket, Wallet, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { StatCard } from '@/components/dashboard/StatCard';
import { PageSpinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { useAsync } from '@/hooks/useAsync';
import { listAllBookings } from '@/services/bookingService';
import { getUserCount } from '@/services/userService';
import { useCurrency } from '@/context/CurrencyContext';
import type { BookingType, BookingStatus } from '@/types/common';

const SERVICE_LABELS: Record<BookingType, string> = { flight: 'Flights', hotel: 'Hotels', car: 'Cars', transfer: 'Transfers' };
const STATUS_COLORS: Record<BookingStatus, string> = { confirmed: '#10b981', pending: '#3d63c2', cancelled: '#ef4444', completed: '#9ca3af' };

export default function AdminOverviewPage() {
  const { format } = useCurrency();
  const bookings = useAsync(() => listAllBookings(500), []);
  const userCount = useAsync(() => getUserCount(), []);

  if (bookings.loading || userCount.loading) return <PageSpinner label="Loading analytics…" />;
  if (bookings.error) return <ErrorState description={bookings.error} onRetry={bookings.refetch} />;

  const all = bookings.data ?? [];
  const revenue = all.filter((b) => b.status !== 'cancelled').reduce((sum, b) => sum + b.pricing.total, 0);
  const pending = all.filter((b) => b.status === 'pending').length;
  const confirmed = all.filter((b) => b.status === 'confirmed').length;
  const cancelled = all.filter((b) => b.status === 'cancelled').length;

  const byService = (['flight', 'hotel', 'car', 'transfer'] as BookingType[]).map((type) => ({
    name: SERVICE_LABELS[type],
    bookings: all.filter((b) => b.bookingType === type).length,
  }));

  const byStatus = (['pending', 'confirmed', 'completed', 'cancelled'] as BookingStatus[])
    .map((status) => ({ name: status, value: all.filter((b) => b.status === status).length, color: STATUS_COLORS[status] }))
    .filter((s) => s.value > 0);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-950">Overview</h1>
      <p className="mt-1 text-sm text-ink-500">A snapshot of Voyago’s activity across all services.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={Users} label="Total users" value={userCount.data ?? 0} />
        <StatCard icon={Ticket} label="Total bookings" value={all.length} tone="accent" />
        <StatCard icon={Wallet} label="Revenue" value={format(revenue)} tone="success" />
        <StatCard icon={Clock} label="Pending" value={pending} tone="warning" />
        <StatCard icon={CheckCircle2} label="Confirmed" value={confirmed} tone="success" />
        <StatCard icon={XCircle} label="Cancelled" value={cancelled} tone="warning" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
          <h2 className="mb-4 font-display text-base font-semibold text-ink-950">Bookings by service</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byService} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f8f9fb' }} contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 13 }} />
                <Bar dataKey="bookings" fill="#2c49a8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
          <h2 className="mb-4 font-display text-base font-semibold text-ink-950">Bookings by status</h2>
          <div className="h-64">
            {byStatus.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-ink-400">No bookings yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                    {byStatus.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            {byStatus.map((s) => (
              <span key={s.name} className="flex items-center gap-1.5 text-xs capitalize text-ink-600">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                {s.name} ({s.value})
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
