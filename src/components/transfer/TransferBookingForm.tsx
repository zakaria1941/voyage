import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Phone, Plane, User } from 'lucide-react';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const schema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  email: z.email('Enter a valid email address'),
  phone: z.string().trim().min(6, 'Enter a valid phone number'),
  flightNumber: z.string().trim().max(10).optional(),
  childSeatRequired: z.boolean(),
});

export type TransferBookingValues = z.infer<typeof schema>;

export function TransferBookingForm({ submitting, onContinue }: { submitting?: boolean; onContinue: (values: TransferBookingValues) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TransferBookingValues>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: '', lastName: '', email: '', phone: '', flightNumber: '', childSeatRequired: false },
  });

  return (
    <form onSubmit={handleSubmit(onContinue)} noValidate className="flex flex-col gap-4 rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="First name" htmlFor="tr-first-name" error={errors.firstName?.message} required>
          <Input id="tr-first-name" icon={<User className="size-4" />} error={errors.firstName?.message} {...register('firstName')} />
        </FormField>
        <FormField label="Last name" htmlFor="tr-last-name" error={errors.lastName?.message} required>
          <Input id="tr-last-name" error={errors.lastName?.message} {...register('lastName')} />
        </FormField>
        <FormField label="Email" htmlFor="tr-email" error={errors.email?.message} required>
          <Input id="tr-email" type="email" icon={<Mail className="size-4" />} error={errors.email?.message} {...register('email')} />
        </FormField>
        <FormField label="Phone" htmlFor="tr-phone" error={errors.phone?.message} required>
          <Input id="tr-phone" type="tel" icon={<Phone className="size-4" />} error={errors.phone?.message} {...register('phone')} />
        </FormField>
        <FormField label="Flight number" htmlFor="tr-flight" hint="Optional — helps your driver track delays">
          <Input id="tr-flight" icon={<Plane className="size-4" />} placeholder="e.g. AH1042" {...register('flightNumber')} />
        </FormField>
      </div>

      <label className="flex items-center gap-2.5 text-sm text-ink-700">
        <input type="checkbox" className="size-4 rounded border-ink-300 text-brand-700 focus:ring-accent-500/40" {...register('childSeatRequired')} />
        Child seat required
      </label>

      <Button type="submit" size="lg" loading={submitting}>
        Continue to payment
      </Button>
    </form>
  );
}
