import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Ticket,
  Users,
  Plane,
  Hotel,
  Car,
  CarTaxiFront,
  MapPinned,
  Building2,
  Truck,
  BadgePercent,
  Star,
  Settings,
} from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { useLanguage } from '@/context/LanguageContext';
import type { TranslationKey } from '@/i18n';
import { cn } from '@/utils/cn';

const NAV_GROUPS: { labelKey: TranslationKey; items: { to: string; labelKey: TranslationKey; icon: typeof LayoutDashboard; end: boolean }[] }[] = [
  {
    labelKey: 'admin.nav.general',
    items: [
      { to: '/admin', labelKey: 'admin.nav.overview', icon: LayoutDashboard, end: true },
      { to: '/admin/bookings', labelKey: 'admin.nav.bookings', icon: Ticket, end: false },
      { to: '/admin/users', labelKey: 'admin.nav.users', icon: Users, end: false },
    ],
  },
  {
    labelKey: 'admin.nav.inventory',
    items: [
      { to: '/admin/flights', labelKey: 'admin.nav.flights', icon: Plane, end: false },
      { to: '/admin/hotels', labelKey: 'admin.nav.hotels', icon: Hotel, end: false },
      { to: '/admin/cars', labelKey: 'admin.nav.cars', icon: Car, end: false },
      { to: '/admin/transfers', labelKey: 'admin.nav.transfers', icon: CarTaxiFront, end: false },
      { to: '/admin/airports', labelKey: 'admin.nav.airports', icon: MapPinned, end: false },
      { to: '/admin/airlines', labelKey: 'admin.nav.airlines', icon: Building2, end: false },
      { to: '/admin/suppliers', labelKey: 'admin.nav.suppliers', icon: Truck, end: false },
    ],
  },
  {
    labelKey: 'admin.nav.engagement',
    items: [
      { to: '/admin/coupons', labelKey: 'admin.nav.coupons', icon: BadgePercent, end: false },
      { to: '/admin/reviews', labelKey: 'admin.nav.reviews', icon: Star, end: false },
      { to: '/admin/settings', labelKey: 'admin.nav.settings', icon: Settings, end: false },
    ],
  },
];

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-5 py-5">
        <Logo dark />
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.labelKey} className="mb-5">
            <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-white/40">{t(group.labelKey)}</p>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white',
                      isActive && 'bg-white/10 text-white',
                    )
                  }
                >
                  <item.icon className="size-4" />
                  {t(item.labelKey)}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}
