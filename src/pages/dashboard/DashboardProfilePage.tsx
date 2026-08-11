import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Phone, User } from 'lucide-react';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { buildImageFolder, type UploadResult } from '@/services/cloudinaryService';

const COUNTRIES = [
  'Algeria', 'France', 'Spain', 'United Kingdom', 'United States', 'United Arab Emirates', 'Türkiye', 'Italy',
  'Germany', 'Netherlands', 'Portugal', 'Morocco', 'Tunisia', 'Qatar', 'Singapore', 'Other',
];

const schema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  phone: z.string().trim().optional(),
  country: z.string().trim().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function DashboardProfilePage() {
  const { profile, updateProfile } = useAuth();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: profile ? { firstName: profile.firstName, lastName: profile.lastName, phone: profile.phone ?? '', country: profile.country ?? '' } : undefined,
  });

  if (!profile) return null;

  async function onSubmit(values: FormValues) {
    try {
      await updateProfile({ firstName: values.firstName, lastName: values.lastName, phone: values.phone || null, country: values.country || null });
      toast.success('Profile updated');
    } catch (error) {
      toast.error('Couldn’t update profile', error instanceof Error ? error.message : undefined);
    }
  }

  async function handlePhotoChange(value: UploadResult | null) {
    try {
      await updateProfile({ photoURL: value?.url ?? null, photoPublicId: value?.publicId ?? null });
      toast.success(value ? 'Profile photo updated' : 'Profile photo removed');
    } catch (error) {
      toast.error('Couldn’t update photo', error instanceof Error ? error.message : undefined);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-950 sm:text-3xl">Profile</h1>
      <p className="mt-1 text-ink-500">Manage your personal information.</p>

      <div className="mt-6 rounded-2xl border border-ink-100 bg-white p-6 shadow-soft">
        <div className="flex items-center gap-5">
          <ImageUploader
            value={profile.photoURL ? { url: profile.photoURL, publicId: profile.photoPublicId ?? '' } : null}
            onChange={handlePhotoChange}
            folder={buildImageFolder('users', profile.uid)}
            shape="circle"
          />
          <div>
            <p className="font-display text-lg font-semibold text-ink-950">{profile.firstName} {profile.lastName}</p>
            <p className="flex items-center gap-1.5 text-sm text-ink-500">
              <Mail className="size-3.5" /> {profile.email}
            </p>
            <Badge tone={profile.emailVerified ? 'success' : 'warning'} className="mt-2">
              {profile.emailVerified ? 'Email verified' : 'Email not verified'}
            </Badge>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="First name" htmlFor="profile-first-name" error={errors.firstName?.message} required>
            <Input id="profile-first-name" icon={<User className="size-4" />} error={errors.firstName?.message} {...register('firstName')} />
          </FormField>
          <FormField label="Last name" htmlFor="profile-last-name" error={errors.lastName?.message} required>
            <Input id="profile-last-name" error={errors.lastName?.message} {...register('lastName')} />
          </FormField>
          <FormField label="Phone" htmlFor="profile-phone">
            <Input id="profile-phone" type="tel" icon={<Phone className="size-4" />} placeholder="+1 5xx xxx xxxx" {...register('phone')} />
          </FormField>
          <FormField label="Country" htmlFor="profile-country">
            <select id="profile-country" className="h-11 w-full rounded-xl border border-ink-200 bg-white px-3.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-accent-500/40" {...register('country')}>
              <option value="">Select a country</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </FormField>

          <div className="sm:col-span-2">
            <Button type="submit" loading={isSubmitting}>
              Save changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
