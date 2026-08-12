import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Mail, MailCheck, ArrowLeft } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

type FormValues = { email: string };

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const { t } = useLanguage();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const schema = z.object({ email: z.email(t('auth.validation.emailInvalid')) });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setFormError(null);
    try {
      await resetPassword(values.email);
      setSentTo(values.email);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : t('auth.forgotPassword.errorGeneric'));
    }
  }

  if (sentTo) {
    const [sentBefore, sentAfter] = t('auth.forgotPassword.sentDescription').split('{email}');
    return (
      <AuthLayout title={t('auth.forgotPassword.checkEmailTitle')} subtitle={t('auth.forgotPassword.checkEmailSubtitle')}>
        <div className="flex flex-col items-center rounded-2xl border border-ink-100 bg-ink-50 px-6 py-10 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-success-50 text-success-600">
            <MailCheck className="size-7" />
          </span>
          <p className="mt-4 text-sm text-ink-600">
            {sentBefore}
            <span className="font-semibold text-ink-900">{sentTo}</span>
            {sentAfter}
          </p>
        </div>
        <Link to="/login" className="mt-6 flex items-center justify-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800">
          <ArrowLeft className="size-4" />
          {t('auth.forgotPassword.backToLogin')}
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={t('auth.forgotPassword.title')} subtitle={t('auth.forgotPassword.subtitle')}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <FormField label={t('auth.emailLabel')} htmlFor="forgot-email" error={errors.email?.message}>
          <Input
            id="forgot-email"
            type="email"
            icon={<Mail className="size-4" />}
            placeholder="you@example.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
        </FormField>

        {formError && (
          <p role="alert" className="rounded-xl bg-danger-50 px-3.5 py-2.5 text-sm font-medium text-danger-600">
            {formError}
          </p>
        )}

        <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
          {t('auth.forgotPassword.submit')}
        </Button>
      </form>

      <Link to="/login" className="mt-6 flex items-center justify-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800">
        <ArrowLeft className="size-4" />
        {t('auth.forgotPassword.backToLogin')}
      </Link>
    </AuthLayout>
  );
}
