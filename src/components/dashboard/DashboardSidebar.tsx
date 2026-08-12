import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Luggage, Ticket, Heart, UserRound, Bell, Settings } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { TranslationKey } from '@/i18n';
import { cn } from '@/utils/cn';

const NAV_ITEMS: { to: string; labelKey: TranslationKey; icon: typeof LayoutDashboard; end: boolean }[] = [
  { to: '/dashboard', labelKey: 'dashboard.nav.overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/trips', labelKey: 'dashboard.nav.myTrips', icon: Luggage, end: false },
  { to: '/dashboard/bookings', labelKey: 'dashboard.nav.bookings', icon: Ticket, end: false },
  { to: '/dashboard/favorites', labelKey: 'dashboard.nav.favorites', icon: Heart, end: false },
  { to: '/dashboard/notifications', labelKey: 'dashboard.nav.notifications', icon: Bell, end: false },
  { to: '/dashboard/profile', labelKey: 'dashboard.nav.profile', icon: UserRound, end: false },
  { to: '/dashboard/settings', labelKey: 'dashboard.nav.settings', icon: Settings, end: false },
];

export function DashboardSidebar() {
  const { t } = useLanguage();
  return (
    <nav aria-label={t('dashboard.nav.ariaLabel')} className="hidden w-60 shrink-0 lg:block">
      <div className="sticky top-24 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-100',
                isActive && 'bg-brand-50 text-brand-700 hover:bg-brand-50',
              )
            }
          >
            <item.icon className="size-4.5" />
            {t(item.labelKey)}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export function DashboardMobileTabs() {
  const { t } = useLanguage();
  return (
    <nav aria-label={t('dashboard.nav.ariaLabel')} className="mb-6 overflow-x-auto lg:hidden">
      <div className="flex w-max gap-1.5 border-b border-ink-100 pb-px">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex shrink-0 items-center gap-1.5 border-b-2 border-transparent px-3 py-2.5 text-sm font-medium text-ink-500',
                isActive && 'border-brand-700 text-brand-700',
              )
            }
          >
            <item.icon className="size-4" />
            {t(item.labelKey)}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
