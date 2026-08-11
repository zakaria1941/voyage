import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Luggage, Ticket, Heart, UserRound, Bell, Settings } from 'lucide-react';
import { cn } from '@/utils/cn';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/trips', label: 'My Trips', icon: Luggage, end: false },
  { to: '/dashboard/bookings', label: 'Bookings', icon: Ticket, end: false },
  { to: '/dashboard/favorites', label: 'Favorites', icon: Heart, end: false },
  { to: '/dashboard/notifications', label: 'Notifications', icon: Bell, end: false },
  { to: '/dashboard/profile', label: 'Profile', icon: UserRound, end: false },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings, end: false },
];

export function DashboardSidebar() {
  return (
    <nav aria-label="Dashboard navigation" className="hidden w-60 shrink-0 lg:block">
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
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export function DashboardMobileTabs() {
  return (
    <nav aria-label="Dashboard navigation" className="mb-6 overflow-x-auto lg:hidden">
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
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
