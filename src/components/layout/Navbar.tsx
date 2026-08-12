import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Logo } from './Logo';
import { CurrencySelector } from './CurrencySelector';
import { LanguageSelector } from './LanguageSelector';
import { UserMenu } from './UserMenu';
import { LinkButton } from '@/components/ui/LinkButton';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import type { TranslationKey } from '@/i18n';
import { cn } from '@/utils/cn';

const NAV_LINKS: { to: string; key: TranslationKey }[] = [
  { to: '/explore', key: 'nav.explore' },
  { to: '/flights', key: 'nav.flights' },
  { to: '/hotels', key: 'nav.hotels' },
  { to: '/cars', key: 'nav.cars' },
  { to: '/transfers', key: 'nav.transfers' },
  { to: '/deals', key: 'nav.deals' },
  { to: '/help', key: 'nav.help' },
];

export function Navbar() {
  const { pathname } = useLocation();
  const { profile, loading } = useAuth();
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);

  const transparentCapable = pathname === '/';
  const transparent = transparentCapable && !scrolled && !mobileOpen;

  useEffect(() => {
    if (!transparentCapable) return;
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [transparentCapable]);

  // Close the mobile menu on navigation. Adjusted during render (rather than
  // in an effect) per React's guidance for resetting state on prop change.
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMobileOpen(false);
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full transition-colors duration-300',
        transparent ? 'bg-transparent' : 'border-b border-ink-100 bg-white/95 backdrop-blur-md shadow-sm',
      )}
    >
      <nav className="container-page flex h-18 items-center justify-between gap-4 py-3.5" aria-label="Main navigation">
        <div className="flex items-center gap-8">
          <Logo dark={transparent} />
          <ul className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      'rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
                      transparent ? 'text-white/90 hover:bg-white/10 hover:text-white' : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900',
                      isActive && (transparent ? 'bg-white/15 text-white' : 'bg-ink-100 text-ink-900'),
                    )
                  }
                >
                  {t(link.key)}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="hidden items-center gap-1 lg:flex">
          <LanguageSelector dark={transparent} />
          <CurrencySelector dark={transparent} />
          <div className={cn('mx-2 h-6 w-px', transparent ? 'bg-white/20' : 'bg-ink-200')} />
          {!loading && profile ? (
            <UserMenu dark={transparent} />
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className={cn(
                  'rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors',
                  transparent ? 'text-white hover:bg-white/10' : 'text-ink-700 hover:bg-ink-100',
                )}
              >
                {t('nav.login')}
              </Link>
              <LinkButton to="/register" size="sm">
                {t('nav.signup')}
              </LinkButton>
            </div>
          )}
        </div>

        <button
          type="button"
          className={cn('flex size-10 items-center justify-center rounded-xl lg:hidden', transparent ? 'text-white' : 'text-ink-700')}
          aria-label={mobileOpen ? t('nav.closeMenu') : t('nav.openMenu')}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="animate-slide-up border-t border-ink-100 bg-white px-4 pb-6 pt-2 lg:hidden">
          <ul className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      'block rounded-xl px-3.5 py-3 text-base font-medium text-ink-700',
                      isActive && 'bg-ink-100 text-ink-900',
                    )
                  }
                >
                  {t(link.key)}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="my-3 h-px bg-ink-100" />
          <div className="flex items-center justify-between px-1">
            <LanguageSelector />
            <CurrencySelector />
          </div>
          {!loading && !profile && (
            <div className="mt-4 flex flex-col gap-2">
              <LinkButton to="/login" variant="outline">
                {t('nav.login')}
              </LinkButton>
              <LinkButton to="/register">{t('nav.signup')}</LinkButton>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
