import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, Star, Trash2, Truck } from 'lucide-react';
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
import { listCarSuppliers, createCarSupplier, updateCarSupplier, deleteCarSupplier } from '@/services/carSupplierService';
import { buildImageFolder } from '@/services/cloudinaryService';
import type { CarSupplier, CarSupplierInput } from '@/types/car';

const schema = z.object({
  name: z.string().trim().min(1, 'Required'),
  logoUrl: z.string().nullable(),
  logoPublicId: z.string().nullable(),
  rating: z.number().min(0).max(5),
});
type FormValues = z.infer<typeof schema>;

export default function AdminSuppliersPage() {
  const [search, setSearch] = useState('');
  const crud = useAdminCrud<CarSupplier, CarSupplierInput>({
    list: listCarSuppliers,
    create: createCarSupplier,
    update: updateCarSupplier,
    remove: deleteCarSupplier,
    getId: (s) => s.id,
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
      ? { name: crud.editing.name, logoUrl: crud.editing.logoUrl, logoPublicId: crud.editing.logoPublicId ?? null, rating: crud.editing.rating }
      : { name: '', logoUrl: null, logoPublicId: null, rating: 4.5 },
  });

  const logoPublicId = watch('logoPublicId');

  const filtered = crud.items.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));

  const columns: Column<CarSupplier>[] = [
    { key: 'logo', header: '', render: (s) => (s.logoUrl ? <img src={s.logoUrl} alt="" className="size-9 rounded-lg object-cover" /> : <span className="flex size-9 items-center justify-center rounded-lg bg-ink-100 text-ink-400"><Truck className="size-4" /></span>), className: 'px-4 py-2 w-14' },
    { key: 'name', header: 'Name', render: (s) => s.name },
    { key: 'rating', header: 'Rating', render: (s) => <span className="flex items-center gap-1"><Star className="size-3.5 fill-current text-warning-500" /> {s.rating.toFixed(1)}</span> },
  ];

  if (crud.error) return <ErrorState description={crud.error} onRetry={crud.refetch} />;

  return (
    <div>
      <AdminPageHeader title="Car suppliers" description="Rental partners available when creating cars." onAdd={crud.openCreate} search={search} onSearchChange={setSearch} />
      <DataTable
        columns={columns}
        rows={filtered}
        keyField={(s) => s.id}
        loading={crud.loading}
        actions={(s) => (
          <div className="flex justify-end gap-1.5">
            <button type="button" onClick={() => crud.openEdit(s)} aria-label="Edit" className="flex size-8 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100">
              <Pencil className="size-4" />
            </button>
            <button type="button" onClick={() => crud.setDeleteTarget(s)} aria-label="Delete" className="flex size-8 items-center justify-center rounded-lg text-danger-500 hover:bg-danger-50">
              <Trash2 className="size-4" />
            </button>
          </div>
        )}
      />

      <Modal open={crud.modalOpen} onClose={crud.closeModal} title={crud.editing ? 'Edit supplier' : 'Add supplier'} size="md">
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
                folder={buildImageFolder('suppliers', crud.editing?.id ?? 'new')}
              />
            )}
          />
          <FormField label="Supplier name" htmlFor="sup-name" error={errors.name?.message} required>
            <Input id="sup-name" error={errors.name?.message} {...register('name')} />
          </FormField>
          <FormField label="Rating (0–5)" htmlFor="sup-rating" error={errors.rating?.message} required>
            <Input id="sup-rating" type="number" step="0.1" min={0} max={5} error={errors.rating?.message} {...register('rating', { valueAsNumber: true })} />
          </FormField>
          <div className="mt-2 flex justify-end gap-2.5">
            <Button type="button" variant="outline" onClick={crud.closeModal}>
              Cancel
            </Button>
            <Button type="submit" loading={crud.saving}>
              {crud.editing ? 'Save changes' : 'Create supplier'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(crud.deleteTarget)}
        title="Delete this supplier?"
        description={`"${crud.deleteTarget?.name}" will be permanently removed.`}
        loading={crud.deleting}
        onConfirm={crud.handleDelete}
        onCancel={() => crud.setDeleteTarget(null)}
      />
    </div>
  );
}
