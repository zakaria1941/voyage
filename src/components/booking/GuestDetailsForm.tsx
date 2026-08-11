import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Phone, User } from 'lucide-react';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';

const schema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  email: z.email('Enter a valid email address'),
  phone: z.string().trim().min(6, 'Enter a valid phone number'),
  specialRequests: z.string().trim().max(500).optional(),
});

export type GuestDetailsValues = z.infer<typeof schema>;

interface GuestDetailsFormProps {
  submitLabel?: string;
  submitting?: boolean;
  showSpecialRequests?: boolean;
  onContinue: (values: GuestDetailsValues) => void;
}

export function GuestDetailsForm({ submitLabel = 'Continue to payment', submitting, showSpecialRequests = true, onContinue }: GuestDetailsFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GuestDetailsValues>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: '', lastName: '', email: '', phone: '', specialRequests: '' },
  });

  return (
    <form onSubmit={handleSubmit(onContinue)} noValidate className="flex flex-col gap-4 rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="First name" htmlFor="guest-first-name" error={errors.firstName?.message} required>
          <Input id="guest-first-name" icon={<User className="size-4" />} error={errors.firstName?.message} {...register('firstName')} />
        </FormField>
        <FormField label="Last name" htmlFor="guest-last-name" error={errors.lastName?.message} required>
          <Input id="guest-last-name" error={errors.lastName?.message} {...register('lastName')} />
        </FormField>
        <FormField label="Email" htmlFor="guest-email" error={errors.email?.message} required>
          <Input id="guest-email" type="email" icon={<Mail className="size-4" />} error={errors.email?.message} {...register('email')} />
        </FormField>
        <FormField label="Phone" htmlFor="guest-phone" error={errors.phone?.message} required>
          <Input id="guest-phone" type="tel" icon={<Phone className="size-4" />} placeholder="+1 5xx xxx xxxx" error={errors.phone?.message} {...register('phone')} />
        </FormField>
      </div>

      {showSpecialRequests && (
        <FormField label="Special requests" htmlFor="guest-requests" hint="Optional — subject to availability, not guaranteed.">
          <Textarea id="guest-requests" rows={3} placeholder="e.g. High floor, quiet room…" {...register('specialRequests')} />
        </FormField>
      )}

      <Button type="submit" size="lg" loading={submitting}>
        {submitLabel}
      </Button>
    </form>
  );
}
