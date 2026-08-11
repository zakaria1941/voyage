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
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { ErrorState } from '@/components/ui/ErrorState';
import { useAdminCrud } from '@/hooks/useAdminCrud';
import { useAsync } from '@/hooks/useAsync';
import { listTransfers, createTransfer, updateTransfer, deleteTransfer } from '@/services/transferService';
import { listAirports } from '@/services/airportService';
import { buildImageFolder } from '@/services/cloudinaryService';
import { useCurrency } from '@/context/CurrencyContext';
import type { Transfer, TransferInput } from '@/types/transfer';

const schema = z.object({
  airportCode: z.string().min(1, 'Required'),
  vehicleType: z.enum(['standard', 'business', 'van', 'luxury']),
  vehicleName: z.string().trim().min(1, 'Required'),
  image: z.string().min(1, 'Please upload a vehicle photo'),
  imagePublicId: z.string().nullable(),
  maxPassengers: z.number().int().min(1),
  maxLuggage: z.number().int().min(0),
  meetAndGreet: z.boolean(),
  freeCancellation: z.boolean(),
  pricePerTrip: z.number().positive(),
  maxDistanceKm: z.number().int().min(1),
  totalUnits: z.number().int().min(1),
});
type FormValues = z.infer<typeof schema>;

function toFormValues(t: Transfer | null): FormValues {
  if (!t) return { airportCode: '', vehicleType: 'standard', vehicleName: '', image: '', imagePublicId: null, maxPassengers: 3, maxLuggage: 2, meetAndGreet: true, freeCancellation: true, pricePerTrip: 40, maxDistanceKm: 50, totalUnits: 5 };
  return { airportCode: t.airportCode, vehicleType: t.vehicleType, vehicleName: t.vehicleName, image: t.image, imagePublicId: t.imagePublicId ?? null, maxPassengers: t.maxPassengers, maxLuggage: t.maxLuggage, meetAndGreet: t.meetAndGreet, freeCancellation: t.freeCancellation, pricePerTrip: t.pricePerTrip, maxDistanceKm: t.maxDistanceKm, totalUnits: t.totalUnits };
}

export default function AdminTransfersPage() {
  const { format } = useCurrency();
  const [search, setSearch] = useState('');
  const airports = useAsync(listAirports, []);
  const crud = useAdminCrud<Transfer, TransferInput>({
    list: listTransfers,
    create: (input) => createTransfer(input),
    update: (id, input) => updateTransfer(id, input),
    remove: deleteTransfer,
    getId: (t) => t.id,
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), values: toFormValues(crud.editing) });

  const imagePublicId = watch('imagePublicId');

  function submit(values: FormValues) {
    const airport = airports.data?.find((a) => a.code === values.airportCode);
    const payload: TransferInput = { ...values, airportName: airport?.name ?? '', city: airport?.city ?? '' };
    crud.handleSubmit(payload);
  }

  const filtered = crud.items.filter((t) => `${t.airportCode} ${t.vehicleName} ${t.city}`.toLowerCase().includes(search.toLowerCase()));

  const columns: Column<Transfer>[] = [
    { key: 'image', header: '', render: (t) => (t.image ? <img src={t.image} alt="" className="size-10 rounded-lg object-cover" /> : <div className="size-10 rounded-lg bg-ink-100" />), className: 'px-4 py-2 w-14' },
    { key: 'airport', header: 'Airport', render: (t) => <span className="font-mono font-semibold text-brand-700">{t.airportCode}</span> },
    { key: 'vehicle', header: 'Vehicle', render: (t) => <div><p>{t.vehicleName}</p><Badge tone="neutral" className="mt-1 capitalize">{t.vehicleType}</Badge></div> },
    { key: 'capacity', header: 'Capacity', render: (t) => `${t.maxPassengers} pax · ${t.maxLuggage} bags` },
    { key: 'price', header: 'Price', render: (t) => format(t.pricePerTrip) },
    { key: 'units', header: 'Fleet', render: (t) => t.totalUnits },
  ];

  if (crud.error) return <ErrorState description={crud.error} onRetry={crud.refetch} />;

  return (
    <div>
      <AdminPageHeader title="Airport transfers" description="Vehicles bookable for airport pickup/drop-off." onAdd={crud.openCreate} search={search} onSearchChange={setSearch} />
      <DataTable
        columns={columns}
        rows={filtered}
        keyField={(t) => t.id}
        loading={crud.loading}
        actions={(t) => (
          <div className="flex justify-end gap-1.5">
            <button type="button" onClick={() => crud.openEdit(t)} aria-label="Edit" className="flex size-8 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100">
              <Pencil className="size-4" />
            </button>
            <button type="button" onClick={() => crud.setDeleteTarget(t)} aria-label="Delete" className="flex size-8 items-center justify-center rounded-lg text-danger-500 hover:bg-danger-50">
              <Trash2 className="size-4" />
            </button>
          </div>
        )}
      />

      <Modal open={crud.modalOpen} onClose={crud.closeModal} title={crud.editing ? 'Edit transfer' : 'Add transfer'} size="lg">
        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-5">
          <Controller
            name="image"
            control={control}
            render={({ field }) => (
              <ImageUploader
                value={field.value ? { url: field.value, publicId: imagePublicId ?? '' } : null}
                onChange={(v) => {
                  field.onChange(v?.url ?? '');
                  setValue('imagePublicId', v?.publicId ?? null);
                }}
                folder={buildImageFolder('transfers', crud.editing?.id ?? 'new')}
              />
            )}
          />
          {errors.image && <p className="-mt-3 text-xs font-medium text-danger-600">{errors.image.message}</p>}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Airport" htmlFor="tr-airport" error={errors.airportCode?.message} required>
              <Select id="tr-airport" error={errors.airportCode?.message} {...register('airportCode')}>
                <option value="">Select airport</option>
                {airports.data?.map((a) => (
                  <option key={a.id} value={a.code}>{a.code} — {a.city}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Vehicle type" htmlFor="tr-type" required>
              <Select id="tr-type" {...register('vehicleType')}>
                <option value="standard">Standard</option>
                <option value="business">Business</option>
                <option value="van">Van</option>
                <option value="luxury">Luxury</option>
              </Select>
            </FormField>
            <FormField label="Vehicle name" htmlFor="tr-name" error={errors.vehicleName?.message} required className="sm:col-span-2">
              <Input id="tr-name" placeholder="e.g. Mercedes E-Class or similar" error={errors.vehicleName?.message} {...register('vehicleName')} />
            </FormField>
            <FormField label="Max passengers" htmlFor="tr-pax" error={errors.maxPassengers?.message} required>
              <Input id="tr-pax" type="number" error={errors.maxPassengers?.message} {...register('maxPassengers', { valueAsNumber: true })} />
            </FormField>
            <FormField label="Max luggage" htmlFor="tr-luggage" error={errors.maxLuggage?.message} required>
              <Input id="tr-luggage" type="number" error={errors.maxLuggage?.message} {...register('maxLuggage', { valueAsNumber: true })} />
            </FormField>
            <FormField label="Price per trip (€)" htmlFor="tr-price" error={errors.pricePerTrip?.message} required>
              <Input id="tr-price" type="number" step="any" error={errors.pricePerTrip?.message} {...register('pricePerTrip', { valueAsNumber: true })} />
            </FormField>
            <FormField label="Coverage radius (km)" htmlFor="tr-distance" error={errors.maxDistanceKm?.message} required>
              <Input id="tr-distance" type="number" error={errors.maxDistanceKm?.message} {...register('maxDistanceKm', { valueAsNumber: true })} />
            </FormField>
            <FormField label="Fleet size" htmlFor="tr-units" error={errors.totalUnits?.message} required>
              <Input id="tr-units" type="number" error={errors.totalUnits?.message} {...register('totalUnits', { valueAsNumber: true })} />
            </FormField>
          </div>

          <div className="flex flex-wrap gap-5">
            <label className="flex items-center gap-2.5 text-sm text-ink-700">
              <input type="checkbox" className="size-4 rounded border-ink-300 text-brand-700" {...register('meetAndGreet')} />
              Meet &amp; greet included
            </label>
            <label className="flex items-center gap-2.5 text-sm text-ink-700">
              <input type="checkbox" className="size-4 rounded border-ink-300 text-brand-700" {...register('freeCancellation')} />
              Free cancellation
            </label>
          </div>

          <div className="flex justify-end gap-2.5 border-t border-ink-100 pt-4">
            <Button type="button" variant="outline" onClick={crud.closeModal}>
              Cancel
            </Button>
            <Button type="submit" loading={crud.saving}>
              {crud.editing ? 'Save changes' : 'Create transfer'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(crud.deleteTarget)}
        title="Delete this transfer?"
        description={`"${crud.deleteTarget?.vehicleName}" will be permanently removed.`}
        loading={crud.deleting}
        onConfirm={crud.handleDelete}
        onCancel={() => crud.setDeleteTarget(null)}
      />
    </div>
  );
}
