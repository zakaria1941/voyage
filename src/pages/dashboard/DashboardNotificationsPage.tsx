import { Bell, BellRing, CalendarClock, CheckCheck, Info, XCircle } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageSpinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { useAsync } from '@/hooks/useAsync';
import { listNotifications, markAllNotificationsRead, markNotificationRead } from '@/services/notificationService';
import { useAuth } from '@/context/AuthContext';
import { formatRelative } from '@/utils/date';
import { cn } from '@/utils/cn';
import type { Notification, NotificationType } from '@/types/notification';

const TYPE_ICON: Record<NotificationType, typeof Bell> = {
  booking_confirmed: BellRing,
  booking_cancelled: XCircle,
  reminder: CalendarClock,
  system: Info,
};

export default function DashboardNotificationsPage() {
  const { profile } = useAuth();
  const notifications = useAsync(() => (profile ? listNotifications(profile.uid) : Promise.resolve([])), [profile?.uid]);

  async function handleMarkRead(n: Notification) {
    if (n.read) return;
    await markNotificationRead(n.id);
    notifications.refetch();
  }

  async function handleMarkAllRead() {
    if (!profile) return;
    await markAllNotificationsRead(profile.uid);
    notifications.refetch();
  }

  if (notifications.loading) return <PageSpinner label="Loading notifications…" />;
  if (notifications.error) return <ErrorState description={notifications.error} onRetry={notifications.refetch} />;

  const items = notifications.data ?? [];
  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-950 sm:text-3xl">Notifications</h1>
          <p className="mt-1 text-ink-500">Updates about your bookings and trips.</p>
        </div>
        {unreadCount > 0 && (
          <button type="button" onClick={handleMarkAllRead} className="flex items-center gap-1.5 rounded-lg border border-ink-200 px-3.5 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50">
            <CheckCheck className="size-4" />
            Mark all as read
          </button>
        )}
      </div>

      <div className="mt-6">
        {items.length === 0 ? (
          <EmptyState icon={<Bell className="size-6" />} title="No notifications" description="Booking confirmations and trip reminders will appear here." />
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((n) => {
              const Icon = TYPE_ICON[n.type];
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleMarkRead(n)}
                  className={cn('flex items-start gap-3.5 rounded-2xl border p-4 text-left transition-colors', n.read ? 'border-ink-100 bg-white' : 'border-brand-100 bg-brand-50/50 hover:bg-brand-50')}
                >
                  <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-full', n.read ? 'bg-ink-100 text-ink-400' : 'bg-brand-100 text-brand-700')}>
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={cn('text-sm', n.read ? 'text-ink-700' : 'font-semibold text-ink-950')}>{n.title}</p>
                    <p className="mt-0.5 text-sm text-ink-500">{n.message}</p>
                    <p className="mt-1 text-xs text-ink-400">{formatRelative(n.createdAt)}</p>
                  </div>
                  {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-600" aria-label="Unread" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
