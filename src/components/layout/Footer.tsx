import { Link } from 'react-router-dom';
import { Globe, MessageCircle, Rss, Mail } from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import type { TranslationKey } from '@/i18n';

const EXPLORE_LINKS: { key: TranslationKey; to: string }[] = [
  { key: 'nav.flights', to: '/flights' },
  { key: 'nav.hotels', to: '/hotels' },
  { key: 'footer.carRentals', to: '/cars' },
  { key: 'footer.airportTransfers', to: '/transfers' },
  { key: 'nav.deals', to: '/deals' },
];

const COMPANY_LINKS: { key: TranslationKey; to: string }[] = [
  { key: 'footer.aboutVoyago', to: '/explore' },
  { key: 'footer.howItWorks', to: '/help' },
  { key: 'footer.helpCenter', to: '/help' },
  { key: 'footer.careers', to: '/help' },
];

const LEGAL_LINKS: { key: TranslationKey; to: string }[] = [
  { key: 'footer.termsOfService', to: '/help' },
  { key: 'footer.privacyPolicy', to: '/help' },
  { key: 'footer.cancellationPolicy', to: '/help' },
];

export function Footer() {
  const { profile } = useAuth();
  const { t } = useLanguage();

  const accountLinks: { key: TranslationKey; to: string }[] = profile
    ? [
        { key: 'nav.dashboard', to: '/dashboard' },
        { key: 'nav.myTrips', to: '/dashboard/trips' },
        { key: 'nav.favorites', to: '/dashboard/favorites' },
        { key: 'nav.settings', to: '/dashboard/settings' },
      ]
    : [
        { key: 'footer.signIn', to: '/login' },
        { key: 'footer.createAccount', to: '/register' },
      ];

  const columns: { title: string; links: { key: TranslationKey; to: string }[] }[] = [
    { title: t('footer.explore'), links: EXPLORE_LINKS },
    { title: t('footer.company'), links: COMPANY_LINKS },
    { title: t('footer.account'), links: accountLinks },
    { title: t('footer.legal'), links: LEGAL_LINKS },
  ];

  return (
    <footer className="border-t border-ink-100 bg-ink-950 text-ink-300">
      <div className="container-page grid grid-cols-2 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-6">
        <div className="col-span-2">
          <Logo dark />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-400">{t('footer.tagline')}</p>
          <div className="mt-6 flex items-center gap-3">
            {[Globe, MessageCircle, Rss, Mail].map((Icon, i) => (
              <a
                key={i}
                href="#"
                onClick={(e) => e.preventDefault()}
                className="flex size-9 items-center justify-center rounded-full bg-white/5 text-ink-300 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Social link"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="font-display text-sm font-semibold text-white">{col.title}</h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {col.links.map((link) => (
                <li key={link.key}>
                  <Link to={link.to} className="text-sm text-ink-400 transition-colors hover:text-white">
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-6 text-xs text-ink-500 sm:flex-row">
          <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
          <p>{t('footer.demoNotice')}</p>
        </div>
      </div>
    </footer>
  );
}
