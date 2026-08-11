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
  const { language, setLanguage } = useLanguage();
  const toast = useToast();
  const navigate = useNavigate();
  const [sendingReset, setSendingReset] = useState(false);

  async function handlePasswordReset() {
    if (!profile) return;
    setSendingReset(true);
    try {
      await resetPassword(profile.email);
      toast.success('Reset email sent', `Check ${profile.email} for a link to change your password.`);
    } catch (error) {
      toast.error('Couldn’t send reset email', error instanceof Error ? error.message : undefined);
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
      <h1 className="font-display text-2xl font-bold text-ink-950 sm:text-3xl">Settings</h1>
      <p className="mt-1 text-ink-500">Preferences and account security.</p>

      <div className="mt-6 flex flex-col gap-4">
        <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
          <p className="flex items-center gap-2 font-display text-sm font-semibold text-ink-950">
            <Wallet className="size-4 text-brand-600" />
            Currency
          </p>
          <p className="mt-1 text-sm text-ink-500">Prices are stored in EUR and converted for display using demo static rates.</p>
          <Select value={currency} onChange={(e) => setCurrency(e.target.value as typeof currency)} className="mt-3 w-40">
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </div>

        <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
          <p className="flex items-center gap-2 font-display text-sm font-semibold text-ink-950">
            <Globe className="size-4 text-brand-600" />
            Language
          </p>
          <p className="mt-1 text-sm text-ink-500">Full translated content is coming soon — this sets your reading direction now.</p>
          <Select value={language} onChange={(e) => setLanguage(e.target.value as typeof language)} className="mt-3 w-48">
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.nativeLabel}</option>
            ))}
          </Select>
        </div>

        <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
          <p className="flex items-center gap-2 font-display text-sm font-semibold text-ink-950">
            <KeyRound className="size-4 text-brand-600" />
            Password
          </p>
          <p className="mt-1 text-sm text-ink-500">We’ll email you a secure link to set a new password.</p>
          <Button variant="outline" className="mt-3" onClick={handlePasswordReset} loading={sendingReset}>
            Send password reset email
          </Button>
        </div>

        <div className="rounded-2xl border border-danger-100 bg-danger-50/40 p-5">
          <p className="flex items-center gap-2 font-display text-sm font-semibold text-ink-950">
            <LogOut className="size-4 text-danger-600" />
            Sign out
          </p>
          <p className="mt-1 text-sm text-ink-500">Sign out of Voyago on this device.</p>
          <Button variant="danger" className="mt-3" onClick={handleLogout}>
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
