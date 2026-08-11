import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Phone, User } from 'lucide-react';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { todayISO } from '@/utils/date';

const passengerSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  nationality: z.string().trim().min(1, 'Nationality is required'),
  passportNumber: z.string().trim().min(3, 'Enter a valid passport number'),
});

const checkoutSchema = z.object({
  passengers: z.array(passengerSchema).min(1),
  email: z.email('Enter a valid email address'),
  phone: z.string().trim().min(6, 'Enter a valid phone number'),
});

export type PassengerFormValues = z.infer<typeof checkoutSchema>;

interface PassengerFormProps {
  passengerLabels: string[];
  submitting?: boolean;
  onContinue: (values: PassengerFormValues) => void;
}

export function PassengerForm({ passengerLabels, submitting, onContinue }: PassengerFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PassengerFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      passengers: passengerLabels.map(() => ({ firstName: '', lastName: '', dateOfBirth: '', nationality: '', passportNumber: '' })),
      email: '',
      phone: '',
    },
  });
  const { fields } = useFieldArray({ control, name: 'passengers' });

  return (
    <form onSubmit={handleSubmit(onContinue)} noValidate className="flex flex-col gap-6">
      {fields.map((field, index) => (
        <div key={field.id} className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
          <p className="mb-4 flex items-center gap-2 font-display text-sm font-semibold text-ink-900">
            <User className="size-4 text-brand-600" />
            {passengerLabels[index]}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="First name" htmlFor={`passengers.${index}.firstName`} error={errors.passengers?.[index]?.firstName?.message} required>
              <Input id={`passengers.${index}.firstName`} error={errors.passengers?.[index]?.firstName?.message} {...register(`passengers.${index}.firstName`)} />
            </FormField>
            <FormField label="Last name" htmlFor={`passengers.${index}.lastName`} error={errors.passengers?.[index]?.lastName?.message} required>
              <Input id={`passengers.${index}.lastName`} error={errors.passengers?.[index]?.lastName?.message} {...register(`passengers.${index}.lastName`)} />
            </FormField>
            <FormField label="Date of birth" htmlFor={`passengers.${index}.dateOfBirth`} error={errors.passengers?.[index]?.dateOfBirth?.message} required>
              <Input id={`passengers.${index}.dateOfBirth`} type="date" max={todayISO()} error={errors.passengers?.[index]?.dateOfBirth?.message} {...register(`passengers.${index}.dateOfBirth`)} />
            </FormField>
            <FormField label="Nationality" htmlFor={`passengers.${index}.nationality`} error={errors.passengers?.[index]?.nationality?.message} required>
              <Input id={`passengers.${index}.nationality`} placeholder="e.g. Algerian" error={errors.passengers?.[index]?.nationality?.message} {...register(`passengers.${index}.nationality`)} />
            </FormField>
            <FormField label="Passport number" htmlFor={`passengers.${index}.passportNumber`} error={errors.passengers?.[index]?.passportNumber?.message} required className="sm:col-span-2">
              <Input id={`passengers.${index}.passportNumber`} error={errors.passengers?.[index]?.passportNumber?.message} {...register(`passengers.${index}.passportNumber`)} />
            </FormField>
          </div>
        </div>
      ))}

      <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
        <p className="mb-4 font-display text-sm font-semibold text-ink-900">Contact details</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Email" htmlFor="contact-email" error={errors.email?.message} required>
            <Input id="contact-email" type="email" icon={<Mail className="size-4" />} error={errors.email?.message} {...register('email')} />
          </FormField>
          <FormField label="Phone" htmlFor="contact-phone" error={errors.phone?.message} required>
            <Input id="contact-phone" type="tel" icon={<Phone className="size-4" />} placeholder="+213 5xx xxx xxx" error={errors.phone?.message} {...register('phone')} />
          </FormField>
        </div>
      </div>

      <Button type="submit" size="lg" loading={submitting}>
        Continue to payment
      </Button>
    </form>
  );
}
