import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, Trash2 } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Modal } from '@/components/admin/Modal';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { ErrorState } from '@/components/ui/ErrorState';
import { useAdminCrud } from '@/hooks/useAdminCrud';
import { listAirlines, createAirline, updateAirline, deleteAirline } from '@/services/airlineService';
import { buildImageFolder } from '@/services/cloudinaryService';
import { AirlineLogo } from '@/components/flight/AirlineLogo';
import type { Airline, AirlineInput } from '@/types/airline';

const schema = z.object({
  code: z.string().trim().min(2).max(3),
  name: z.string().trim().min(1, 'Required'),
  country: z.string().trim().min(1, 'Required'),
  logoUrl: z.string().nullable(),
  logoPublicId: z.string().nullable(),
});
type FormValues = z.infer<typeof schema>;

export default function AdminAirlinesPage() {
  const [search, setSearch] = useState('');
  const crud = useAdminCrud<Airline, AirlineInput>({
    list: listAirlines,
    create: createAirline,
    update: updateAirline,
    remove: deleteAirline,
    getId: (a) => a.id,
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: crud.editing
      ? { code: crud.editing.code, name: crud.editing.name, country: crud.editing.country, logoUrl: crud.editing.logoUrl, logoPublicId: crud.editing.logoPublicId ?? null }
      : { code: '', name: '', country: '', logoUrl: null, logoPublicId: null },
  });

  const logoPublicId = watch('logoPublicId');

  const filtered = crud.items.filter((a) => `${a.code} ${a.name} ${a.country}`.toLowerCase().includes(search.toLowerCase()));

  const columns: Column<Airline>[] = [
    {
      key: 'logo',
      header: '',
      render: (a) => (a.logoUrl ? <img src={a.logoUrl} alt="" className="size-9 rounded-lg object-cover" /> : <AirlineLogo code={a.code} className="size-9" />),
      className: 'px-4 py-2 w-14',
    },
    { key: 'code', header: 'Code', render: (a) => <span className="font-mono font-semibold text-brand-700">{a.code}</span> },
    { key: 'name', header: 'Name', render: (a) => a.name },
    { key: 'country', header: 'Country', render: (a) => a.country },
  ];

  if (crud.error) return <ErrorState description={crud.error} onRetry={crud.refetch} />;

  return (
    <div>
      <AdminPageHeader title="Airlines" description="Carriers available when creating flights." onAdd={crud.openCreate} search={search} onSearchChange={setSearch} />
      <DataTable
        columns={columns}
        rows={filtered}
        keyField={(a) => a.id}
        loading={crud.loading}
        actions={(a) => (
          <div className="flex justify-end gap-1.5">
            <button type="button" onClick={() => crud.openEdit(a)} aria-label="Edit" className="flex size-8 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100">
              <Pencil className="size-4" />
            </button>
            <button type="button" onClick={() => crud.setDeleteTarget(a)} aria-label="Delete" className="flex size-8 items-center justify-center rounded-lg text-danger-500 hover:bg-danger-50">
              <Trash2 className="size-4" />
            </button>
          </div>
        )}
      />

      <Modal open={crud.modalOpen} onClose={crud.closeModal} title={crud.editing ? 'Edit airline' : 'Add airline'} size="md">
        <form onSubmit={handleSubmit((v) => crud.handleSubmit(v))} className="flex flex-col gap-4">
          <Controller
            name="logoUrl"
            control={control}
            render={({ field }) => (
              <ImageUploader
                value={field.value ? { url: field.value, publicId: logoPublicId ?? '' } : null}
                onChange={(v) => {
                  field.onChange(v?.url ?? null);
                  setValue('logoPublicId', v?.publicId ?? null);
                }}
                folder={buildImageFolder('airlines', crud.editing?.id ?? 'new')}
              />
            )}
          />
          <FormField label="IATA code" htmlFor="al-code" error={errors.code?.message} required>
            <Input id="al-code" maxLength={3} className="uppercase" error={errors.code?.message} {...register('code')} />
          </FormField>
          <FormField label="Airline name" htmlFor="al-name" error={errors.name?.message} required>
            <Input id="al-name" error={errors.name?.message} {...register('name')} />
          </FormField>
          <FormField label="Country" htmlFor="al-country" error={errors.country?.message} required>
            <Input id="al-country" error={errors.country?.message} {...register('country')} />
          </FormField>
          <div className="mt-2 flex justify-end gap-2.5">
            <Button type="button" variant="outline" onClick={crud.closeModal}>
              Cancel
            </Button>
            <Button type="submit" loading={crud.saving}>
              {crud.editing ? 'Save changes' : 'Create airline'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(crud.deleteTarget)}
        title="Delete this airline?"
        description={`"${crud.deleteTarget?.name}" will be permanently removed.`}
        loading={crud.deleting}
        onConfirm={crud.handleDelete}
        onCancel={() => crud.setDeleteTarget(null)}
      />
    </div>
  );
}
