import { NavLink } from 'react-router-dom';
import { Home, Search, Luggage, UserRound } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import type { TranslationKey } from '@/i18n';
import { cn } from '@/utils/cn';

export function MobileBottomNav() {
  const { profile } = useAuth();
  const { t } = useLanguage();

  const items: { to: string; key: TranslationKey; icon: typeof Home; end: boolean }[] = [
    { to: '/', key: 'nav.mobile.home', icon: Home, end: true },
    { to: '/explore', key: 'nav.mobile.search', icon: Search, end: false },
    { to: profile ? '/dashboard/trips' : '/login', key: 'nav.mobile.trips', icon: Luggage, end: false },
    { to: profile ? '/dashboard/profile' : '/login', key: 'nav.mobile.profile', icon: UserRound, end: false },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-100 bg-white/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label="Mobile navigation"
    >
      <ul className="grid grid-cols-4">
        {items.map((item) => (
          <li key={item.key}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-ink-500',
                  isActive && 'text-brand-700',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn('size-5', isActive && 'text-brand-700')} strokeWidth={isActive ? 2.5 : 2} />
                  {t(item.key)}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
