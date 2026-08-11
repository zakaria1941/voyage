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
import { cn } from '@/utils/cn';

const NAV_GROUPS = [
  {
    label: 'General',
    items: [
      { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
      { to: '/admin/bookings', label: 'Bookings', icon: Ticket, end: false },
      { to: '/admin/users', label: 'Users', icon: Users, end: false },
    ],
  },
  {
    label: 'Inventory',
    items: [
      { to: '/admin/flights', label: 'Flights', icon: Plane, end: false },
      { to: '/admin/hotels', label: 'Hotels', icon: Hotel, end: false },
      { to: '/admin/cars', label: 'Cars', icon: Car, end: false },
      { to: '/admin/transfers', label: 'Transfers', icon: CarTaxiFront, end: false },
      { to: '/admin/airports', label: 'Airports', icon: MapPinned, end: false },
      { to: '/admin/airlines', label: 'Airlines', icon: Building2, end: false },
      { to: '/admin/suppliers', label: 'Car suppliers', icon: Truck, end: false },
    ],
  },
  {
    label: 'Engagement',
    items: [
      { to: '/admin/coupons', label: 'Coupons', icon: BadgePercent, end: false },
      { to: '/admin/reviews', label: 'Reviews', icon: Star, end: false },
      { to: '/admin/settings', label: 'Settings', icon: Settings, end: false },
    ],
  },
];

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-5 py-5">
        <Logo dark />
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-white/40">{group.label}</p>
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
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}
