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
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { ErrorState } from '@/components/ui/ErrorState';
import { useAdminCrud } from '@/hooks/useAdminCrud';
import { useAsync } from '@/hooks/useAsync';
import { listCars, createCar, updateCar, deleteCar } from '@/services/carService';
import { listCarSuppliers } from '@/services/carSupplierService';
import { buildImageFolder, type UploadResult } from '@/services/cloudinaryService';
import { useCurrency } from '@/context/CurrencyContext';
import { CAR_FEATURES } from '@/types/car';
import type { Car, CarInput, CarFeature } from '@/types/car';
import type { CarCategory } from '@/types/search';

const CATEGORIES: CarCategory[] = ['economy', 'compact', 'sedan', 'suv', 'luxury', 'van', 'electric'];

const schema = z.object({
  supplierId: z.string().min(1, 'Required'),
  make: z.string().trim().min(1, 'Required'),
  model: z.string().trim().min(1, 'Required'),
  category: z.enum(['economy', 'compact', 'sedan', 'suv', 'luxury', 'van', 'electric']),
  transmission: z.enum(['automatic', 'manual']),
  seats: z.number().int().min(1).max(15),
  doors: z.number().int().min(2).max(6),
  fuelType: z.enum(['petrol', 'diesel', 'electric', 'hybrid']),
  mileagePolicy: z.string().trim().min(1, 'Required'),
  pickupCity: z.string().trim().min(1, 'Required'),
  pickupLocation: z.string().trim().min(1, 'Required'),
  pricePerDay: z.number().positive(),
  depositAmount: z.number().min(0),
  minDriverAge: z.number().int().min(18).max(30),
  totalUnits: z.number().int().min(1),
  features: z.array(z.string()),
  images: z.array(z.object({ url: z.string(), publicId: z.string() })),
});
type FormValues = z.infer<typeof schema>;

function toFormValues(c: Car | null): FormValues {
  if (!c) {
    return { supplierId: '', make: '', model: '', category: 'economy', transmission: 'manual', seats: 5, doors: 4, fuelType: 'petrol', mileagePolicy: 'Unlimited mileage', pickupCity: '', pickupLocation: '', pricePerDay: 30, depositAmount: 200, minDriverAge: 21, totalUnits: 3, features: [], images: [] };
  }
  return { ...c, images: c.images.map((url, i) => ({ url, publicId: c.imagePublicIds?.[i] ?? '' })) };
}

export default function AdminCarsPage() {
  const { format } = useCurrency();
  const [search, setSearch] = useState('');
  const suppliers = useAsync(listCarSuppliers, []);
  const crud = useAdminCrud<Car, CarInput>({
    list: listCars,
    create: (input) => createCar(input),
    update: (id, input) => updateCar(id, input),
    remove: deleteCar,
    getId: (c) => c.id,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), values: toFormValues(crud.editing) });

  const images = watch('images');
  const features = watch('features');

  function submit(values: FormValues) {
    const supplier = suppliers.data?.find((s) => s.id === values.supplierId);
    const payload: CarInput = {
      ...values,
      supplierName: supplier?.name ?? '',
      features: values.features as CarFeature[],
      images: values.images.map((i) => i.url),
      imagePublicIds: values.images.map((i) => i.publicId),
    };
    crud.handleSubmit(payload);
  }

  const filtered = crud.items.filter((c) => `${c.make} ${c.model} ${c.supplierName} ${c.pickupCity}`.toLowerCase().includes(search.toLowerCase()));

  const columns: Column<Car>[] = [
    { key: 'image', header: '', render: (c) => (c.images[0] ? <img src={c.images[0]} alt="" className="size-10 rounded-lg object-cover" /> : <div className="size-10 rounded-lg bg-ink-100" />), className: 'px-4 py-2 w-14' },
    { key: 'car', header: 'Car', render: (c) => <div><p className="font-medium">{c.make} {c.model}</p><p className="text-xs capitalize text-ink-400">{c.category}</p></div> },
    { key: 'supplier', header: 'Supplier', render: (c) => c.supplierName },
    { key: 'location', header: 'Pickup city', render: (c) => c.pickupCity },
    { key: 'price', header: 'Price/day', render: (c) => format(c.pricePerDay) },
    { key: 'units', header: 'Fleet', render: (c) => <Badge tone="neutral">{c.totalUnits} units</Badge> },
  ];

  if (crud.error) return <ErrorState description={crud.error} onRetry={crud.refetch} />;

  return (
    <div>
      <AdminPageHeader title="Cars" description="Rental vehicle inventory." onAdd={crud.openCreate} search={search} onSearchChange={setSearch} />
      <DataTable
        columns={columns}
        rows={filtered}
        keyField={(c) => c.id}
        loading={crud.loading}
        actions={(c) => (
          <div className="flex justify-end gap-1.5">
            <button type="button" onClick={() => crud.openEdit(c)} aria-label="Edit" className="flex size-8 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100">
              <Pencil className="size-4" />
            </button>
            <button type="button" onClick={() => crud.setDeleteTarget(c)} aria-label="Delete" className="flex size-8 items-center justify-center rounded-lg text-danger-500 hover:bg-danger-50">
              <Trash2 className="size-4" />
            </button>
          </div>
        )}
      />

      <Modal open={crud.modalOpen} onClose={crud.closeModal} title={crud.editing ? 'Edit car' : 'Add car'} size="xl">
        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-5">
          <div>
            <p className="mb-2 text-sm font-medium text-ink-700">Photos</p>
            <div className="flex flex-wrap gap-3">
              {[0, 1, 2].map((i) => (
                <ImageUploader
                  key={i}
                  value={images[i] ?? null}
                  onChange={(v: UploadResult | null) => {
                    const next = [...images];
                    if (v) next[i] = v;
                    else next.splice(i, 1);
                    setValue('images', next.filter(Boolean));
                  }}
                  folder={buildImageFolder('cars', crud.editing?.id ?? 'new')}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField label="Supplier" htmlFor="car-supplier" error={errors.supplierId?.message} required>
              <Select id="car-supplier" error={errors.supplierId?.message} {...register('supplierId')}>
                <option value="">Select supplier</option>
                {suppliers.data?.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Make" htmlFor="car-make" error={errors.make?.message} required>
              <Input id="car-make" error={errors.make?.message} {...register('make')} />
            </FormField>
            <FormField label="Model" htmlFor="car-model" error={errors.model?.message} required>
              <Input id="car-model" error={errors.model?.message} {...register('model')} />
            </FormField>
            <FormField label="Category" htmlFor="car-category" required>
              <Select id="car-category" {...register('category')}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="capitalize">{c}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Transmission" htmlFor="car-transmission" required>
              <Select id="car-transmission" {...register('transmission')}>
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
              </Select>
            </FormField>
            <FormField label="Fuel type" htmlFor="car-fuel" required>
              <Select id="car-fuel" {...register('fuelType')}>
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
              </Select>
            </FormField>
            <FormField label="Seats" htmlFor="car-seats" error={errors.seats?.message} required>
              <Input id="car-seats" type="number" error={errors.seats?.message} {...register('seats', { valueAsNumber: true })} />
            </FormField>
            <FormField label="Doors" htmlFor="car-doors" error={errors.doors?.message} required>
              <Input id="car-doors" type="number" error={errors.doors?.message} {...register('doors', { valueAsNumber: true })} />
            </FormField>
            <FormField label="Min driver age" htmlFor="car-min-age" error={errors.minDriverAge?.message} required>
              <Input id="car-min-age" type="number" error={errors.minDriverAge?.message} {...register('minDriverAge', { valueAsNumber: true })} />
            </FormField>
            <FormField label="Pickup city" htmlFor="car-city" error={errors.pickupCity?.message} required>
              <Input id="car-city" error={errors.pickupCity?.message} {...register('pickupCity')} />
            </FormField>
            <FormField label="Pickup location" htmlFor="car-location" error={errors.pickupLocation?.message} required className="sm:col-span-2">
              <Input id="car-location" error={errors.pickupLocation?.message} {...register('pickupLocation')} />
            </FormField>
            <FormField label="Mileage policy" htmlFor="car-mileage" error={errors.mileagePolicy?.message} required className="sm:col-span-2 lg:col-span-3">
              <Input id="car-mileage" error={errors.mileagePolicy?.message} {...register('mileagePolicy')} />
            </FormField>
            <FormField label="Price / day (€)" htmlFor="car-price" error={errors.pricePerDay?.message} required>
              <Input id="car-price" type="number" step="any" error={errors.pricePerDay?.message} {...register('pricePerDay', { valueAsNumber: true })} />
            </FormField>
            <FormField label="Deposit (€)" htmlFor="car-deposit" error={errors.depositAmount?.message} required>
              <Input id="car-deposit" type="number" step="any" error={errors.depositAmount?.message} {...register('depositAmount', { valueAsNumber: true })} />
            </FormField>
            <FormField label="Fleet size" htmlFor="car-units" error={errors.totalUnits?.message} required hint="Units bookable at once">
              <Input id="car-units" type="number" error={errors.totalUnits?.message} {...register('totalUnits', { valueAsNumber: true })} />
            </FormField>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-ink-700">Features</p>
            <div className="flex flex-wrap gap-2">
              {CAR_FEATURES.map((f) => {
                const checked = features.includes(f);
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setValue('features', checked ? features.filter((v) => v !== f) : [...features, f])}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${checked ? 'border-brand-700 bg-brand-700 text-white' : 'border-ink-200 text-ink-600'}`}
                  >
                    {f.replace(/_/g, ' ')}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2.5 border-t border-ink-100 pt-4">
            <Button type="button" variant="outline" onClick={crud.closeModal}>
              Cancel
            </Button>
            <Button type="submit" loading={crud.saving}>
              {crud.editing ? 'Save changes' : 'Create car'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(crud.deleteTarget)}
        title="Delete this car?"
        description={`"${crud.deleteTarget?.make} ${crud.deleteTarget?.model}" will be permanently removed.`}
        loading={crud.deleting}
        onConfirm={crud.handleDelete}
        onCancel={() => crud.setDeleteTarget(null)}
      />
    </div>
  );
}
