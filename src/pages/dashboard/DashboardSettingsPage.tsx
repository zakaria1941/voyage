import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, KeyRound, LogOut, Wallet } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useLanguage, LANGUAGES } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';
import { CURRENCIES } from '@/types/common';

export default function DashboardSettingsPage() {
  const { profile, resetPassword, logout } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const { language, setLanguage, t } = useLanguage();
  const toast = useToast();
  const navigate = useNavigate();
  const [sendingReset, setSendingReset] = useState(false);

  async function handlePasswordReset() {
    if (!profile) return;
    setSendingReset(true);
    try {
      await resetPassword(profile.email);
      toast.success(t('dashboard.settings.resetSentTitle'), t('dashboard.settings.resetSentDesc', { email: profile.email }));
    } catch (error) {
      toast.error(t('dashboard.settings.resetErrorTitle'), error instanceof Error ? error.message : undefined);
    } finally {
      setSendingReset(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-950 sm:text-3xl">{t('dashboard.settings.title')}</h1>
      <p className="mt-1 text-ink-500">{t('dashboard.settings.subtitle')}</p>

      <div className="mt-6 flex flex-col gap-4">
        <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
          <p className="flex items-center gap-2 font-display text-sm font-semibold text-ink-950">
            <Wallet className="size-4 text-brand-600" />
            {t('nav.currency')}
          </p>
          <p className="mt-1 text-sm text-ink-500">{t('dashboard.settings.currencyDesc')}</p>
          <Select value={currency} onChange={(e) => setCurrency(e.target.value as typeof currency)} className="mt-3 w-40">
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </div>

        <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
          <p className="flex items-center gap-2 font-display text-sm font-semibold text-ink-950">
            <Globe className="size-4 text-brand-600" />
            {t('nav.language')}
          </p>
          <p className="mt-1 text-sm text-ink-500">{t('dashboard.settings.languageDesc')}</p>
          <Select value={language} onChange={(e) => setLanguage(e.target.value as typeof language)} className="mt-3 w-48">
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.nativeLabel}</option>
            ))}
          </Select>
        </div>

        <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
          <p className="flex items-center gap-2 font-display text-sm font-semibold text-ink-950">
            <KeyRound className="size-4 text-brand-600" />
            {t('dashboard.settings.passwordLabel')}
          </p>
          <p className="mt-1 text-sm text-ink-500">{t('dashboard.settings.passwordDesc')}</p>
          <Button variant="outline" className="mt-3" onClick={handlePasswordReset} loading={sendingReset}>
            {t('dashboard.settings.sendResetButton')}
          </Button>
        </div>

        <div className="rounded-2xl border border-danger-100 bg-danger-50/40 p-5">
          <p className="flex items-center gap-2 font-display text-sm font-semibold text-ink-950">
            <LogOut className="size-4 text-danger-600" />
            {t('nav.signOut')}
          </p>
          <p className="mt-1 text-sm text-ink-500">{t('dashboard.settings.signOutDesc')}</p>
          <Button variant="danger" className="mt-3" onClick={handleLogout}>
            {t('nav.signOut')}
          </Button>
        </div>
      </div>
    </div>
  );
}
