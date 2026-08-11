import { Link } from 'react-router-dom';
import { Globe, MessageCircle, Rss, Mail } from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '@/context/AuthContext';

const EXPLORE_LINKS = [
  { label: 'Flights', to: '/flights' },
  { label: 'Hotels', to: '/hotels' },
  { label: 'Car rentals', to: '/cars' },
  { label: 'Airport transfers', to: '/transfers' },
  { label: 'Deals', to: '/deals' },
];

const COMPANY_LINKS = [
  { label: 'About Voyago', to: '/explore' },
  { label: 'How it works', to: '/help' },
  { label: 'Help center', to: '/help' },
  { label: 'Careers', to: '/help' },
];

const LEGAL_LINKS = [
  { label: 'Terms of service', to: '/help' },
  { label: 'Privacy policy', to: '/help' },
  { label: 'Cancellation policy', to: '/help' },
];

export function Footer() {
  const { profile } = useAuth();

  const accountLinks = profile
    ? [
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'My trips', to: '/dashboard/trips' },
        { label: 'Favorites', to: '/dashboard/favorites' },
        { label: 'Settings', to: '/dashboard/settings' },
      ]
    : [
        { label: 'Sign in', to: '/login' },
        { label: 'Create account', to: '/register' },
      ];

  const columns = [
    { title: 'Explore', links: EXPLORE_LINKS },
    { title: 'Company', links: COMPANY_LINKS },
    { title: 'Account', links: accountLinks },
    { title: 'Legal', links: LEGAL_LINKS },
  ];

  return (
    <footer className="border-t border-ink-100 bg-ink-950 text-ink-300">
      <div className="container-page grid grid-cols-2 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-6">
        <div className="col-span-2">
          <Logo dark />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-400">
            Everything you need for your next trip — flights, hotels, cars, and airport transfers, booked in one
            place.
          </p>
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
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-ink-400 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-6 text-xs text-ink-500 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Voyago. All rights reserved.</p>
          <p>Demo platform — inventory and payments are simulated for demonstration purposes.</p>
        </div>
      </div>
    </footer>
  );
}
