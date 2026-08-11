import { useState } from 'react';
import { MailWarning } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export function EmailVerificationBanner() {
  const { profile, resendVerificationEmail } = useAuth();
  const toast = useToast();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!profile || profile.emailVerified) return null;

  async function handleResend() {
    setSending(true);
    try {
      await resendVerificationEmail();
      setSent(true);
      toast.success('Verification email sent', `Check ${profile!.email} for the link.`);
    } catch (error) {
      toast.error('Couldn’t send email', error instanceof Error ? error.message : undefined);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-warning-50 px-4 py-3.5 text-sm text-warning-800">
      <p className="flex items-center gap-2.5">
        <MailWarning className="size-4 shrink-0" />
        Please verify your email address to unlock all features.
      </p>
      <button
        type="button"
        onClick={handleResend}
        disabled={sending || sent}
        className="shrink-0 rounded-lg bg-white px-3.5 py-1.5 text-xs font-semibold text-warning-800 shadow-sm hover:bg-warning-100 disabled:opacity-60"
      >
        {sent ? 'Email sent' : sending ? 'Sending…' : 'Resend email'}
      </button>
    </div>
  );
}
