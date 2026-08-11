import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { GoogleIcon } from '@/components/ui/GoogleIcon';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, 'First name is required').max(50),
    lastName: z.string().trim().min(1, 'Last name is required').max(50),
    email: z.email('Enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((v) => v === true, { message: 'You must accept the Terms to continue' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords don’t match',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser, loginWithGoogle } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string; search?: string } } | null)?.from;
  const redirectTo = from ? `${from.pathname}${from.search || ''}` : '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: '', lastName: '', email: '', password: '', confirmPassword: '', acceptTerms: false },
  });

  async function onSubmit(values: RegisterFormValues) {
    setFormError(null);
    try {
      await registerUser({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
      });
      toast.success('Account created', 'We sent you a verification email — you can verify anytime from your dashboard.');
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'We couldn’t create your account.');
    }
  }

  async function handleGoogle() {
    setFormError(null);
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Welcome to Voyago!');
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Google sign-in failed.');
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="Join Voyago to save favorites, track trips, and book faster.">
      <button
        type="button"
        onClick={handleGoogle}
        disabled={googleLoading}
        className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-ink-200 bg-white text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50 disabled:opacity-60"
      >
        <GoogleIcon className="size-4" />
        Continue with Google
      </button>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-ink-200" />
        <span className="text-xs font-medium uppercase text-ink-400">or</span>
        <div className="h-px flex-1 bg-ink-200" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField label="First name" htmlFor="register-first-name" error={errors.firstName?.message}>
            <Input id="register-first-name" icon={<User className="size-4" />} autoComplete="given-name" error={errors.firstName?.message} {...register('firstName')} />
          </FormField>
          <FormField label="Last name" htmlFor="register-last-name" error={errors.lastName?.message}>
            <Input id="register-last-name" autoComplete="family-name" error={errors.lastName?.message} {...register('lastName')} />
          </FormField>
        </div>

        <FormField label="Email" htmlFor="register-email" error={errors.email?.message}>
          <Input
            id="register-email"
            type="email"
            icon={<Mail className="size-4" />}
            placeholder="you@example.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
        </FormField>

        <FormField label="Password" htmlFor="register-password" error={errors.password?.message} hint={!errors.password ? 'At least 6 characters' : undefined}>
          <div className="relative">
            <Input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              icon={<Lock className="size-4" />}
              placeholder="••••••••"
              autoComplete="new-password"
              error={errors.password?.message}
              className="pr-10"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </FormField>

        <FormField label="Confirm password" htmlFor="register-confirm-password" error={errors.confirmPassword?.message}>
          <Input
            id="register-confirm-password"
            type={showPassword ? 'text' : 'password'}
            icon={<Lock className="size-4" />}
            placeholder="••••••••"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        </FormField>

        <label className="flex items-start gap-2.5 text-sm text-ink-600">
          <input type="checkbox" className="mt-0.5 size-4 rounded border-ink-300 text-brand-700 focus:ring-accent-500/40" {...register('acceptTerms')} />
          <span>
            I agree to Voyago’s{' '}
            <Link to="/help" className="font-medium text-brand-700 hover:text-brand-800">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/help" className="font-medium text-brand-700 hover:text-brand-800">
              Privacy Policy
            </Link>
          </span>
        </label>
        {errors.acceptTerms && (
          <p role="alert" className="-mt-2 text-xs font-medium text-danger-600">
            {errors.acceptTerms.message}
          </p>
        )}

        {formError && (
          <p role="alert" className="rounded-xl bg-danger-50 px-3.5 py-2.5 text-sm font-medium text-danger-600">
            {formError}
          </p>
        )}

        <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
          Create account
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-ink-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
