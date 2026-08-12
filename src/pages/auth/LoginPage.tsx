import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { GoogleIcon } from '@/components/ui/GoogleIcon';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useLanguage } from '@/context/LanguageContext';

function useLoginSchema() {
  const { t } = useLanguage();
  return z.object({
    email: z.email(t('auth.validation.emailInvalid')),
    password: z.string().min(1, t('auth.validation.passwordRequired')),
  });
}

type LoginFormValues = { email: string; password: string };

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string; search?: string } } | null)?.from;
  const redirectTo = from ? `${from.pathname}${from.search || ''}` : '/dashboard';

  const loginSchema = useLoginSchema();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginFormValues) {
    setFormError(null);
    try {
      await login(values.email, values.password);
      toast.success(t('auth.toast.welcomeBack'));
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : t('auth.toast.signInFailedGeneric'));
    }
  }

  async function handleGoogle() {
    setFormError(null);
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      toast.success(t('auth.toast.welcomeBack'));
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : t('auth.toast.googleSignInFailed'));
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <AuthLayout title={t('auth.login.title')} subtitle={t('auth.login.subtitle')}>
      <button
        type="button"
        onClick={handleGoogle}
        disabled={googleLoading}
        className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-ink-200 bg-white text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50 disabled:opacity-60"
      >
        <GoogleIcon className="size-4" />
        {t('auth.continueWithGoogle')}
      </button>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-ink-200" />
        <span className="text-xs font-medium uppercase text-ink-400">{t('auth.or')}</span>
        <div className="h-px flex-1 bg-ink-200" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <FormField label={t('auth.emailLabel')} htmlFor="login-email" error={errors.email?.message}>
          <Input
            id="login-email"
            type="email"
            icon={<Mail className="size-4" />}
            placeholder="you@example.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
        </FormField>

        <FormField label={t('auth.login.password')} htmlFor="login-password" error={errors.password?.message}>
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              icon={<Lock className="size-4" />}
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.password?.message}
              className="pr-10"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
              aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </FormField>

        <div className="-mt-1 flex justify-end">
          <Link to="/forgot-password" className="text-sm font-medium text-brand-700 hover:text-brand-800">
            {t('auth.login.forgotPassword')}
          </Link>
        </div>

        {formError && (
          <p role="alert" className="rounded-xl bg-danger-50 px-3.5 py-2.5 text-sm font-medium text-danger-600">
            {formError}
          </p>
        )}

        <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
          {t('auth.login.submit')}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-ink-500">
        {t('auth.login.noAccount')}{' '}
        <Link to="/register" className="font-semibold text-brand-700 hover:text-brand-800">
          {t('auth.login.createAccount')}
        </Link>
      </p>
    </AuthLayout>
  );
}
