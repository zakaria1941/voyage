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
import { getFriendlyErrorMessage } from '@/utils/errors';

const schema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords don’t match',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

type CodeState = { status: 'checking' } | { status: 'invalid'; message: string } | { status: 'valid'; email: string } | { status: 'done' };

export default function ResetPasswordPage() {
  const { confirmPasswordReset } = useAuth();
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get('oobCode');
  const [state, setState] = useState<CodeState>(() =>
    oobCode ? { status: 'checking' } : { status: 'invalid', message: 'This reset link is missing required information.' },
  );
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!oobCode) return;
    verifyPasswordResetCode(auth, oobCode)
      .then((email) => setState({ status: 'valid', email }))
      .catch((error) => setState({ status: 'invalid', message: getFriendlyErrorMessage(error, 'This reset link is invalid or has expired.') }));
  }, [oobCode]);

  async function onSubmit(values: FormValues) {
    if (!oobCode) return;
    setFormError(null);
    try {
      await confirmPasswordReset(oobCode, values.password);
      setState({ status: 'done' });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'We couldn’t reset your password.');
    }
  }

  if (state.status === 'checking') {
    return (
      <AuthLayout title="Reset your password" subtitle="Verifying your reset link…">
        <PageSpinner />
      </AuthLayout>
    );
  }

  if (state.status === 'invalid') {
    return (
      <AuthLayout title="Link expired" subtitle="This password reset link is no longer valid.">
        <div className="flex flex-col items-center rounded-2xl border border-danger-100 bg-danger-50/40 px-6 py-10 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-danger-50 text-danger-500">
            <XCircle className="size-7" />
          </span>
          <p className="mt-4 text-sm text-ink-600">{state.message}</p>
        </div>
        <Link to="/forgot-password" className="mt-6 flex items-center justify-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800">
          <ArrowLeft className="size-4" />
          Request a new link
        </Link>
      </AuthLayout>
    );
  }

  if (state.status === 'done') {
    return (
      <AuthLayout title="Password updated" subtitle="Your password has been changed successfully.">
        <div className="flex flex-col items-center rounded-2xl border border-ink-100 bg-ink-50 px-6 py-10 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-success-50 text-success-600">
            <CheckCircle2 className="size-7" />
          </span>
          <p className="mt-4 text-sm text-ink-600">You can now log in with your new password.</p>
        </div>
        <LinkButton to="/login" fullWidth size="lg" className="mt-6">
          Log in
        </LinkButton>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Set a new password" subtitle={`Choose a new password for ${state.email}.`}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <FormField label="New password" htmlFor="reset-password" error={errors.password?.message} hint={!errors.password ? 'At least 6 characters' : undefined}>
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

        <FormField label="Confirm new password" htmlFor="reset-confirm-password" error={errors.confirmPassword?.message}>
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
          Update password
        </Button>
      </form>
    </AuthLayout>
  );
}
