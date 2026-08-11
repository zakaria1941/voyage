import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BedDouble, Pencil, Star, Trash2 } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Modal } from '@/components/admin/Modal';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { RoomsManagerModal } from '@/components/admin/RoomsManagerModal';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { ErrorState } from '@/components/ui/ErrorState';
import { useAdminCrud } from '@/hooks/useAdminCrud';
import { listHotels, createHotel, updateHotel, deleteHotel } from '@/services/hotelService';
import { buildImageFolder, type UploadResult } from '@/services/cloudinaryService';
import { useCurrency } from '@/context/CurrencyContext';
import { HOTEL_AMENITIES } from '@/types/hotel';
import type { Hotel, HotelInput, PropertyType } from '@/types/hotel';

const PROPERTY_TYPES: PropertyType[] = ['hotel', 'apartment', 'resort', 'villa', 'hostel'];

const schema = z.object({
  name: z.string().trim().min(1, 'Required'),
  description: z.string().trim().min(1, 'Required'),
  city: z.string().trim().min(1, 'Required'),
  country: z.string().trim().min(1, 'Required'),
  address: z.string().trim().min(1, 'Required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  starRating: z.number().int().min(1).max(5),
  propertyType: z.enum(['hotel', 'apartment', 'resort', 'villa', 'hostel']),
  amenities: z.array(z.string()),
  images: z.array(z.object({ url: z.string(), publicId: z.string() })),
  pricePerNight: z.number().positive(),
  breakfastIncluded: z.boolean(),
  freeCancellation: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

function toFormValues(h: Hotel | null): FormValues {
  if (!h) return { name: '', description: '', city: '', country: '', address: '', latitude: 0, longitude: 0, starRating: 4, propertyType: 'hotel', amenities: [], images: [], pricePerNight: 100, breakfastIncluded: false, freeCancellation: true };
  return { ...h, images: h.images.map((url, i) => ({ url, publicId: h.imagePublicIds?.[i] ?? '' })) };
}

export default function AdminHotelsPage() {
  const { format } = useCurrency();
  const [search, setSearch] = useState('');
  const [roomsFor, setRoomsFor] = useState<Hotel | null>(null);
  const crud = useAdminCrud<Hotel, HotelInput>({
    list: listHotels,
    create: (input) => createHotel(input),
    update: (id, input) => updateHotel(id, input),
    remove: deleteHotel,
    getId: (h) => h.id,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), values: toFormValues(crud.editing) });

  const images = watch('images');
  const amenities = watch('amenities');

  const filtered = crud.items.filter((h) => `${h.name} ${h.city} ${h.country}`.toLowerCase().includes(search.toLowerCase()));

  const columns: Column<Hotel>[] = [
    { key: 'image', header: '', render: (h) => (h.images[0] ? <img src={h.images[0]} alt="" className="size-10 rounded-lg object-cover" /> : <div className="size-10 rounded-lg bg-ink-100" />), className: 'px-4 py-2 w-14' },
    { key: 'name', header: 'Hotel', render: (h) => <div><p className="font-medium">{h.name}</p><p className="text-xs text-ink-400">{h.city}, {h.country}</p></div> },
    { key: 'rating', header: 'Rating', render: (h) => <span className="flex items-center gap-1"><Star className="size-3.5 fill-current text-warning-500" /> {h.reviewScore.toFixed(1)} ({h.reviewCount})</span> },
    { key: 'price', header: 'Price/night', render: (h) => format(h.pricePerNight) },
  ];

  if (crud.error) return <ErrorState description={crud.error} onRetry={crud.refetch} />;

  return (
    <div>
      <AdminPageHeader title="Hotels" description="Properties available for booking." onAdd={crud.openCreate} search={search} onSearchChange={setSearch} />
      <DataTable
        columns={columns}
        rows={filtered}
        keyField={(h) => h.id}
        loading={crud.loading}
        actions={(h) => (
          <div className="flex justify-end gap-1.5">
            <button type="button" onClick={() => setRoomsFor(h)} aria-label="Manage rooms" className="flex size-8 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100" title="Manage rooms">
              <BedDouble className="size-4" />
            </button>
            <button type="button" onClick={() => crud.openEdit(h)} aria-label="Edit" className="flex size-8 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100">
              <Pencil className="size-4" />
            </button>
            <button type="button" onClick={() => crud.setDeleteTarget(h)} aria-label="Delete" className="flex size-8 items-center justify-center rounded-lg text-danger-500 hover:bg-danger-50">
              <Trash2 className="size-4" />
            </button>
          </div>
        )}
      />

      <Modal open={crud.modalOpen} onClose={crud.closeModal} title={crud.editing ? 'Edit hotel' : 'Add hotel'} size="xl">
        <form
          onSubmit={handleSubmit((v) =>
            crud.handleSubmit({
              ...v,
              amenities: v.amenities as Hotel['amenities'],
              images: v.images.map((i) => i.url),
              imagePublicIds: v.images.map((i) => i.publicId),
            }),
          )}
          className="flex flex-col gap-5"
        >
          <div>
            <p className="mb-2 text-sm font-medium text-ink-700">Photos</p>
            <div className="flex flex-wrap gap-3">
              {[0, 1, 2, 3].map((i) => (
                <ImageUploader
                  key={i}
                  value={images[i] ?? null}
                  onChange={(v: UploadResult | null) => {
                    const next = [...images];
                    if (v) next[i] = v;
                    else next.splice(i, 1);
                    setValue('images', next.filter(Boolean));
                  }}
                  folder={buildImageFolder('hotels', crud.editing?.id ?? 'new')}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField label="Hotel name" htmlFor="h-name" error={errors.name?.message} required className="sm:col-span-2 lg:col-span-3">
              <Input id="h-name" error={errors.name?.message} {...register('name')} />
            </FormField>
            <FormField label="City" htmlFor="h-city" error={errors.city?.message} required>
              <Input id="h-city" error={errors.city?.message} {...register('city')} />
            </FormField>
            <FormField label="Country" htmlFor="h-country" error={errors.country?.message} required>
              <Input id="h-country" error={errors.country?.message} {...register('country')} />
            </FormField>
            <FormField label="Property type" htmlFor="h-type" required>
              <Select id="h-type" {...register('propertyType')}>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t} className="capitalize">{t}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Address" htmlFor="h-address" error={errors.address?.message} required className="sm:col-span-2 lg:col-span-3">
              <Input id="h-address" error={errors.address?.message} {...register('address')} />
            </FormField>
            <FormField label="Star rating" htmlFor="h-star" error={errors.starRating?.message} required>
              <Input id="h-star" type="number" min={1} max={5} error={errors.starRating?.message} {...register('starRating', { valueAsNumber: true })} />
            </FormField>
            <FormField label="Latitude" htmlFor="h-lat" error={errors.latitude?.message} required>
              <Input id="h-lat" type="number" step="any" error={errors.latitude?.message} {...register('latitude', { valueAsNumber: true })} />
            </FormField>
            <FormField label="Longitude" htmlFor="h-lng" error={errors.longitude?.message} required>
              <Input id="h-lng" type="number" step="any" error={errors.longitude?.message} {...register('longitude', { valueAsNumber: true })} />
            </FormField>
            <FormField label="From price / night (€)" htmlFor="h-price" error={errors.pricePerNight?.message} required hint="Display price — actual charge uses the selected room">
              <Input id="h-price" type="number" step="any" error={errors.pricePerNight?.message} {...register('pricePerNight', { valueAsNumber: true })} />
            </FormField>
          </div>

          <FormField label="Description" htmlFor="h-desc" error={errors.description?.message} required>
            <Textarea id="h-desc" rows={3} error={errors.description?.message} {...register('description')} />
          </FormField>

          <div>
            <p className="mb-2 text-sm font-medium text-ink-700">Amenities</p>
            <div className="flex flex-wrap gap-2">
              {HOTEL_AMENITIES.map((a) => {
                const checked = amenities.includes(a);
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setValue('amenities', checked ? amenities.filter((v) => v !== a) : [...amenities, a])}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${checked ? 'border-brand-700 bg-brand-700 text-white' : 'border-ink-200 text-ink-600'}`}
                  >
                    {a.replace(/_/g, ' ')}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap gap-5">
            <label className="flex items-center gap-2.5 text-sm text-ink-700">
              <input type="checkbox" className="size-4 rounded border-ink-300 text-brand-700" {...register('breakfastIncluded')} />
              Breakfast included (property-wide default)
            </label>
            <label className="flex items-center gap-2.5 text-sm text-ink-700">
              <input type="checkbox" className="size-4 rounded border-ink-300 text-brand-700" {...register('freeCancellation')} />
              Free cancellation (property-wide default)
            </label>
          </div>

          <div className="flex justify-end gap-2.5 border-t border-ink-100 pt-4">
            <Button type="button" variant="outline" onClick={crud.closeModal}>
              Cancel
            </Button>
            <Button type="submit" loading={crud.saving}>
              {crud.editing ? 'Save changes' : 'Create hotel'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(crud.deleteTarget)}
        title="Delete this hotel?"
        description={`"${crud.deleteTarget?.name}" and its rooms will be permanently removed.`}
        loading={crud.deleting}
        onConfirm={crud.handleDelete}
        onCancel={() => crud.setDeleteTarget(null)}
      />

      {roomsFor && <RoomsManagerModal hotel={roomsFor} onClose={() => setRoomsFor(null)} />}
    </div>
  );
}
