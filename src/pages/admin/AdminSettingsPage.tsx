import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Settings2 } from 'lucide-react';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Spinner';
import { useAsync } from '@/hooks/useAsync';
import { useToast } from '@/context/ToastContext';
import { getPlatformSettings, updatePlatformSettings } from '@/services/settingsService';
import { CURRENCIES } from '@/types/common';

const schema = z.object({
  siteName: z.string().trim().min(1, 'Required'),
  supportEmail: z.email('Enter a valid email'),
  supportPhone: z.string().trim().min(1, 'Required'),
  defaultCurrency: z.enum(['EUR', 'USD', 'DZD', 'GBP']),
  maintenanceMode: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

export default function AdminSettingsPage() {
  const toast = useToast();
  const settings = useAsync(getPlatformSettings, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: settings.data ? { ...settings.data } : { siteName: 'Voyago', supportEmail: 'support@voyago.example', supportPhone: '', defaultCurrency: 'EUR', maintenanceMode: false },
  });

  async function onSubmit(values: FormValues) {
    try {
      await updatePlatformSettings(values);
      toast.success('Settings saved');
    } catch (error) {
      toast.error('Couldn’t save settings', error instanceof Error ? error.message : undefined);
    }
  }

  if (settings.loading) return <PageSpinner label="Loading settings…" />;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-950">Settings</h1>
      <p className="mt-1 text-sm text-ink-500">Platform-wide configuration.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex max-w-xl flex-col gap-4 rounded-2xl border border-ink-100 bg-white p-6 shadow-soft">
        <div className="mb-1 flex items-center gap-2 text-ink-500">
          <Settings2 className="size-4" />
          <span className="text-sm font-medium">General</span>
        </div>
        <FormField label="Site name" htmlFor="s-name" error={errors.siteName?.message} required>
          <Input id="s-name" error={errors.siteName?.message} {...register('siteName')} />
        </FormField>
        <FormField label="Support email" htmlFor="s-email" error={errors.supportEmail?.message} required>
          <Input id="s-email" type="email" error={errors.supportEmail?.message} {...register('supportEmail')} />
        </FormField>
        <FormField label="Support phone" htmlFor="s-phone" error={errors.supportPhone?.message} required>
          <Input id="s-phone" error={errors.supportPhone?.message} {...register('supportPhone')} />
        </FormField>
        <FormField label="Default currency" htmlFor="s-currency" required>
          <Select id="s-currency" {...register('defaultCurrency')}>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </FormField>
        <label className="flex items-center gap-2.5 text-sm text-ink-700">
          <input type="checkbox" className="size-4 rounded border-ink-300 text-brand-700" {...register('maintenanceMode')} />
          Maintenance mode
        </label>
        <Button type="submit" loading={isSubmitting} className="mt-2 self-start">
          Save settings
        </Button>
      </form>
    </div>
  );
}
