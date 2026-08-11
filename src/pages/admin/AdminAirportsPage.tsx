import { useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { ErrorState } from '@/components/ui/ErrorState';
import { useAdminCrud } from '@/hooks/useAdminCrud';
import { listAirports, createAirport, updateAirport, deleteAirport } from '@/services/airportService';
import type { Airport, AirportInput } from '@/types/airport';

const schema = z.object({
  code: z.string().trim().length(3, 'IATA code must be 3 letters'),
  name: z.string().trim().min(1, 'Required'),
  city: z.string().trim().min(1, 'Required'),
  country: z.string().trim().min(1, 'Required'),
  countryCode: z.string().trim().length(2, 'ISO code must be 2 letters'),
  timezone: z.string().trim().min(1, 'Required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});
type FormValues = z.infer<typeof schema>;

export default function AdminAirportsPage() {
  const [search, setSearch] = useState('');
  const crud = useAdminCrud<Airport, AirportInput>({
    list: listAirports,
    create: createAirport,
    update: updateAirport,
    remove: deleteAirport,
    getId: (a) => a.id,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), values: crud.editing ?? undefined });

  const filtered = crud.items.filter((a) => `${a.code} ${a.name} ${a.city} ${a.country}`.toLowerCase().includes(search.toLowerCase()));

  const columns: Column<Airport>[] = [
    { key: 'code', header: 'Code', render: (a) => <span className="font-mono font-semibold text-brand-700">{a.code}</span> },
    { key: 'name', header: 'Name', render: (a) => a.name },
    { key: 'city', header: 'City', render: (a) => a.city },
    { key: 'country', header: 'Country', render: (a) => a.country },
    { key: 'timezone', header: 'Timezone', render: (a) => <span className="text-xs text-ink-500">{a.timezone}</span> },
  ];

  if (crud.error) return <ErrorState description={crud.error} onRetry={crud.refetch} />;

  return (
    <div>
      <AdminPageHeader title="Airports" description="Reference data used across flight and transfer search." onAdd={crud.openCreate} search={search} onSearchChange={setSearch} />
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

      <Modal open={crud.modalOpen} onClose={crud.closeModal} title={crud.editing ? 'Edit airport' : 'Add airport'} size="lg">
        <form onSubmit={handleSubmit((v) => crud.handleSubmit(v))} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="IATA code" htmlFor="a-code" error={errors.code?.message} required>
            <Input id="a-code" maxLength={3} className="uppercase" error={errors.code?.message} {...register('code')} />
          </FormField>
          <FormField label="Country code (ISO2)" htmlFor="a-countryCode" error={errors.countryCode?.message} required>
            <Input id="a-countryCode" maxLength={2} className="uppercase" error={errors.countryCode?.message} {...register('countryCode')} />
          </FormField>
          <FormField label="Airport name" htmlFor="a-name" error={errors.name?.message} required className="sm:col-span-2">
            <Input id="a-name" error={errors.name?.message} {...register('name')} />
          </FormField>
          <FormField label="City" htmlFor="a-city" error={errors.city?.message} required>
            <Input id="a-city" error={errors.city?.message} {...register('city')} />
          </FormField>
          <FormField label="Country" htmlFor="a-country" error={errors.country?.message} required>
            <Input id="a-country" error={errors.country?.message} {...register('country')} />
          </FormField>
          <FormField label="Timezone" htmlFor="a-timezone" error={errors.timezone?.message} required hint="e.g. Europe/Paris">
            <Input id="a-timezone" error={errors.timezone?.message} {...register('timezone')} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Latitude" htmlFor="a-lat" error={errors.latitude?.message} required>
              <Input id="a-lat" type="number" step="any" error={errors.latitude?.message} {...register('latitude', { valueAsNumber: true })} />
            </FormField>
            <FormField label="Longitude" htmlFor="a-lng" error={errors.longitude?.message} required>
              <Input id="a-lng" type="number" step="any" error={errors.longitude?.message} {...register('longitude', { valueAsNumber: true })} />
            </FormField>
          </div>
          <div className="sm:col-span-2 mt-2 flex justify-end gap-2.5">
            <Button type="button" variant="outline" onClick={crud.closeModal}>
              Cancel
            </Button>
            <Button type="submit" loading={crud.saving}>
              {crud.editing ? 'Save changes' : 'Create airport'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(crud.deleteTarget)}
        title="Delete this airport?"
        description={`"${crud.deleteTarget?.name}" will be permanently removed.`}
        loading={crud.deleting}
        onConfirm={crud.handleDelete}
        onCancel={() => crud.setDeleteTarget(null)}
      />
    </div>
  );
}
