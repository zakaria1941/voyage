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

const schema = z.object({ email: z.email('Enter a valid email address') });
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

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
      setFormError(error instanceof Error ? error.message : 'We couldn’t send the reset email.');
    }
  }

  if (sentTo) {
    return (
      <AuthLayout title="Check your email" subtitle="We sent password reset instructions to your inbox.">
        <div className="flex flex-col items-center rounded-2xl border border-ink-100 bg-ink-50 px-6 py-10 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-success-50 text-success-600">
            <MailCheck className="size-7" />
          </span>
          <p className="mt-4 text-sm text-ink-600">
            If an account exists for <span className="font-semibold text-ink-900">{sentTo}</span>, you’ll receive an
            email with a link to reset your password shortly.
          </p>
        </div>
        <Link to="/login" className="mt-6 flex items-center justify-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800">
          <ArrowLeft className="size-4" />
          Back to log in
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot your password?" subtitle="Enter the email linked to your account and we’ll send you a reset link.">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <FormField label="Email" htmlFor="forgot-email" error={errors.email?.message}>
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
          Send reset link
        </Button>
      </form>

      <Link to="/login" className="mt-6 flex items-center justify-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800">
        <ArrowLeft className="size-4" />
        Back to log in
      </Link>
    </AuthLayout>
  );
}
