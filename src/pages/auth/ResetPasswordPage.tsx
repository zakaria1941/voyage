import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useSearchParams } from 'react-router-dom';
import { verifyPasswordResetCode } from 'firebase/auth';
import { Lock, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LinkButton } from '@/components/ui/LinkButton';
import { PageSpinner } from '@/components/ui/Spinner';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { getFriendlyErrorMessage } from '@/utils/errors';

type FormValues = { password: string; confirmPassword: string };

type CodeState = { status: 'checking' } | { status: 'invalid'; message: string } | { status: 'valid'; email: string } | { status: 'done' };

export default function ResetPasswordPage() {
  const { confirmPasswordReset } = useAuth();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get('oobCode');
  const [state, setState] = useState<CodeState>(() =>
    oobCode ? { status: 'checking' } : { status: 'invalid', message: t('auth.resetPassword.missingInfo') },
  );
  const [formError, setFormError] = useState<string | null>(null);

  const schema = z
    .object({
      password: z.string().min(6, t('auth.validation.passwordMinLength')),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('auth.validation.passwordsDontMatch'),
      path: ['confirmPassword'],
    });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!oobCode) return;
    verifyPasswordResetCode(auth, oobCode)
      .then((email) => setState({ status: 'valid', email }))
      .catch((error) => setState({ status: 'invalid', message: getFriendlyErrorMessage(error, t('auth.resetPassword.invalidOrExpired')) }));
  }, [oobCode, t]);

  async function onSubmit(values: FormValues) {
    if (!oobCode) return;
    setFormError(null);
    try {
      await confirmPasswordReset(oobCode, values.password);
      setState({ status: 'done' });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : t('auth.resetPassword.errorGeneric'));
    }
  }

  if (state.status === 'checking') {
    return (
      <AuthLayout title={t('auth.resetPassword.title')} subtitle={t('auth.resetPassword.verifying')}>
        <PageSpinner />
      </AuthLayout>
    );
  }

  if (state.status === 'invalid') {
    return (
      <AuthLayout title={t('auth.resetPassword.linkExpiredTitle')} subtitle={t('auth.resetPassword.linkExpiredSubtitle')}>
        <div className="flex flex-col items-center rounded-2xl border border-danger-100 bg-danger-50/40 px-6 py-10 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-danger-50 text-danger-500">
            <XCircle className="size-7" />
          </span>
          <p className="mt-4 text-sm text-ink-600">{state.message}</p>
        </div>
        <Link to="/forgot-password" className="mt-6 flex items-center justify-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800">
          <ArrowLeft className="size-4" />
          {t('auth.resetPassword.requestNewLink')}
        </Link>
      </AuthLayout>
    );
  }

  if (state.status === 'done') {
    return (
      <AuthLayout title={t('auth.resetPassword.doneTitle')} subtitle={t('auth.resetPassword.doneSubtitle')}>
        <div className="flex flex-col items-center rounded-2xl border border-ink-100 bg-ink-50 px-6 py-10 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-success-50 text-success-600">
            <CheckCircle2 className="size-7" />
          </span>
          <p className="mt-4 text-sm text-ink-600">{t('auth.resetPassword.doneDescription')}</p>
        </div>
        <LinkButton to="/login" fullWidth size="lg" className="mt-6">
          {t('auth.login.submit')}
        </LinkButton>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={t('auth.resetPassword.title')} subtitle={t('auth.resetPassword.subtitleWithEmail', { email: state.email })}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <FormField label={t('auth.resetPassword.newPassword')} htmlFor="reset-password" error={errors.password?.message} hint={!errors.password ? t('auth.passwordHint') : undefined}>
          <Input
            id="reset-password"
            type="password"
            icon={<Lock className="size-4" />}
            placeholder="••••••••"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />
        </FormField>

        <FormField label={t('auth.resetPassword.confirmNewPassword')} htmlFor="reset-confirm-password" error={errors.confirmPassword?.message}>
          <Input
            id="reset-confirm-password"
            type="password"
            icon={<Lock className="size-4" />}
            placeholder="••••••••"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        </FormField>

        {formError && (
          <p role="alert" className="rounded-xl bg-danger-50 px-3.5 py-2.5 text-sm font-medium text-danger-600">
            {formError}
          </p>
        )}

        <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
          {t('auth.resetPassword.submit')}
        </Button>
      </form>
    </AuthLayout>
  );
}
