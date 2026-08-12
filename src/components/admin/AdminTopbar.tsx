import { Link } from 'react-router-dom';
import { Menu, Bell, ExternalLink } from 'lucide-react';
import { UserMenu } from '@/components/layout/UserMenu';
import { useLanguage } from '@/context/LanguageContext';

export function AdminTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { t } = useLanguage();
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-ink-100 bg-white/95 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onMenuClick} aria-label={t('admin.openMenu')} className="flex size-9 items-center justify-center rounded-lg text-ink-600 hover:bg-ink-100 lg:hidden">
          <Menu className="size-5" />
        </button>
        <p className="hidden text-sm font-medium text-ink-500 sm:block">{t('nav.adminDashboard')}</p>
      </div>

      <div className="flex items-center gap-2">
        <Link to="/" className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-600 hover:bg-ink-100 sm:flex">
          <ExternalLink className="size-4" />
          {t('admin.viewSite')}
        </Link>
        <Link to="/dashboard/notifications" aria-label={t('dashboard.nav.notifications')} className="flex size-9 items-center justify-center rounded-lg text-ink-600 hover:bg-ink-100">
          <Bell className="size-5" />
        </Link>
        <UserMenu />
      </div>
    </header>
  );
}
