import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreditCard, Lock, ShieldCheck } from 'lucide-react';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { PaymentDetails } from '@/services/payment/PaymentProvider';

const currentYear = new Date().getFullYear();

const schema = z.object({
  cardholderName: z.string().trim().min(1, 'Name on card is required'),
  cardNumber: z
    .string()
    .trim()
    .regex(/^[\d\s]{13,19}$/, 'Enter a valid card number')
    .refine((v) => v.replace(/\s+/g, '').length >= 13, 'Enter a valid card number'),
  expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, 'MM'),
  expiryYear: z
    .string()
    .regex(/^\d{4}$/, 'YYYY')
    .refine((v) => Number(v) >= currentYear, 'Card has expired'),
  cvv: z.string().regex(/^\d{3,4}$/, 'CVV'),
});

type FormValues = z.infer<typeof schema>;

function formatCardNumber(value: string): string {
  return value
    .replace(/\D/g, '')
    .slice(0, 19)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

export function DemoPaymentForm({ submitting, onSubmit }: { submitting?: boolean; onSubmit: (details: PaymentDetails) => void }) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { cardholderName: '', cardNumber: '', expiryMonth: '', expiryYear: '', cvv: '' },
  });

  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
      <div className="mb-4 flex items-center gap-2 rounded-xl bg-warning-50 px-3.5 py-2.5 text-sm font-medium text-warning-700">
        <ShieldCheck className="size-4 shrink-0" />
        Demo payment — no real money will be charged.
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <FormField label="Name on card" htmlFor="pay-name" error={errors.cardholderName?.message} required>
          <Input id="pay-name" error={errors.cardholderName?.message} {...register('cardholderName')} />
        </FormField>

        <FormField label="Card number" htmlFor="pay-number" error={errors.cardNumber?.message} hint={!errors.cardNumber ? 'Try 4242 4242 4242 4242' : undefined} required>
          <Controller
            name="cardNumber"
            control={control}
            render={({ field }) => (
              <Input
                id="pay-number"
                icon={<CreditCard className="size-4" />}
                inputMode="numeric"
                placeholder="4242 4242 4242 4242"
                value={field.value}
                error={errors.cardNumber?.message}
                onChange={(e) => field.onChange(formatCardNumber(e.target.value))}
              />
            )}
          />
        </FormField>

        <div className="grid grid-cols-3 gap-3">
          <FormField label="Month" htmlFor="pay-mm" error={errors.expiryMonth?.message} required>
            <Input id="pay-mm" placeholder="MM" maxLength={2} error={errors.expiryMonth?.message} {...register('expiryMonth')} />
          </FormField>
          <FormField label="Year" htmlFor="pay-yy" error={errors.expiryYear?.message} required>
            <Input id="pay-yy" placeholder="YYYY" maxLength={4} error={errors.expiryYear?.message} {...register('expiryYear')} />
          </FormField>
          <FormField label="CVV" htmlFor="pay-cvv" error={errors.cvv?.message} required>
            <Input id="pay-cvv" icon={<Lock className="size-4" />} placeholder="123" maxLength={4} error={errors.cvv?.message} {...register('cvv')} />
          </FormField>
        </div>

        <Button type="submit" size="lg" fullWidth loading={submitting}>
          Confirm &amp; pay
        </Button>
      </form>
    </div>
  );
}
