import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Modal } from './Modal';
import { ConfirmDialog } from './ConfirmDialog';
import { DataTable, type Column } from './DataTable';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { useAdminCrud } from '@/hooks/useAdminCrud';
import { createRoom, deleteRoom, listRooms, updateRoom } from '@/services/hotelService';
import { buildImageFolder, type UploadResult } from '@/services/cloudinaryService';
import { useCurrency } from '@/context/CurrencyContext';
import type { Hotel, Room, RoomInput } from '@/types/hotel';

const schema = z.object({
  name: z.string().trim().min(1, 'Required'),
  description: z.string().trim().min(1, 'Required'),
  maxGuests: z.number().int().min(1),
  bedType: z.string().trim().min(1, 'Required'),
  sizeSqm: z.number().int().min(1),
  images: z.array(z.object({ url: z.string(), publicId: z.string() })),
  breakfastIncluded: z.boolean(),
  freeCancellation: z.boolean(),
  pricePerNight: z.number().positive(),
  totalUnits: z.number().int().min(1),
});
type FormValues = z.infer<typeof schema>;

function toFormValues(r: Room | null): FormValues {
  if (!r) return { name: '', description: '', maxGuests: 2, bedType: '1 queen bed', sizeSqm: 22, images: [], breakfastIncluded: false, freeCancellation: true, pricePerNight: 100, totalUnits: 3 };
  return {
    name: r.name,
    description: r.description,
    maxGuests: r.maxGuests,
    bedType: r.bedType,
    sizeSqm: r.sizeSqm,
    images: r.images.map((url, i) => ({ url, publicId: r.imagePublicIds?.[i] ?? '' })),
    breakfastIncluded: r.breakfastIncluded,
    freeCancellation: r.freeCancellation,
    pricePerNight: r.pricePerNight,
    totalUnits: r.totalUnits,
  };
}

export function RoomsManagerModal({ hotel, onClose }: { hotel: Hotel; onClose: () => void }) {
  const { format } = useCurrency();
  const [formOpen, setFormOpen] = useState(false);
  const crud = useAdminCrud<Room, RoomInput>({
    list: () => listRooms(hotel.id),
    create: (input) => createRoom(hotel.id, input),
    update: (id, input) => updateRoom(hotel.id, id, input),
    remove: (id) => deleteRoom(hotel.id, id),
    getId: (r) => r.id,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), values: toFormValues(crud.editing) });

  const images = watch('images');

  const columns: Column<Room>[] = [
    { key: 'name', header: 'Room', render: (r) => <div><p className="font-medium">{r.name}</p><p className="text-xs text-ink-400">{r.bedType} · {r.maxGuests} guests</p></div> },
    { key: 'price', header: 'Price/night', render: (r) => format(r.pricePerNight) },
    { key: 'units', header: 'Units', render: (r) => r.totalUnits },
  ];

  return (
    <Modal open onClose={onClose} title={`Rooms — ${hotel.name}`} size="lg">
      <div className="mb-4 flex justify-end">
        <Button
          size="sm"
          onClick={() => {
            crud.openCreate();
            setFormOpen(true);
          }}
        >
          <Plus className="size-4" />
          Add room
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={crud.items}
        keyField={(r) => r.id}
        loading={crud.loading}
        emptyMessage="Add the first room type for this hotel."
        actions={(r) => (
          <div className="flex justify-end gap-1.5">
            <button
              type="button"
              onClick={() => {
                crud.openEdit(r);
                setFormOpen(true);
              }}
              aria-label="Edit room"
              className="flex size-8 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100"
            >
              <Pencil className="size-4" />
            </button>
            <button type="button" onClick={() => crud.setDeleteTarget(r)} aria-label="Delete room" className="flex size-8 items-center justify-center rounded-lg text-danger-500 hover:bg-danger-50">
              <Trash2 className="size-4" />
            </button>
          </div>
        )}
      />

      <Modal
        open={formOpen && crud.modalOpen}
        onClose={() => {
          setFormOpen(false);
          crud.closeModal();
        }}
        title={crud.editing ? 'Edit room' : 'Add room'}
        size="lg"
      >
        <form
          onSubmit={handleSubmit((v) =>
            crud.handleSubmit({
              ...v,
              amenities: hotel.amenities,
              images: v.images.map((i) => i.url),
              imagePublicIds: v.images.map((i) => i.publicId),
            }),
          )}
          className="flex flex-col gap-4"
        >
          <p className="-mb-2 text-xs text-ink-500">Amenities shown for this room are inherited from the hotel’s amenities.</p>
          <div>
            <p className="mb-2 text-sm font-medium text-ink-700">Photos</p>
            <div className="flex flex-wrap gap-3">
              {[0, 1].map((i) => (
                <ImageUploader
                  key={i}
                  value={images[i] ?? null}
                  onChange={(v: UploadResult | null) => {
                    const next = [...images];
                    if (v) next[i] = v;
                    else next.splice(i, 1);
                    setValue('images', next.filter(Boolean));
                  }}
                  folder={buildImageFolder('hotels', `${hotel.id}/rooms`)}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Room name" htmlFor="r-name" error={errors.name?.message} required className="sm:col-span-2">
              <Input id="r-name" error={errors.name?.message} {...register('name')} />
            </FormField>
            <FormField label="Bed type" htmlFor="r-bed" error={errors.bedType?.message} required>
              <Input id="r-bed" error={errors.bedType?.message} {...register('bedType')} />
            </FormField>
            <FormField label="Max guests" htmlFor="r-guests" error={errors.maxGuests?.message} required>
              <Input id="r-guests" type="number" error={errors.maxGuests?.message} {...register('maxGuests', { valueAsNumber: true })} />
            </FormField>
            <FormField label="Size (sqm)" htmlFor="r-size" error={errors.sizeSqm?.message} required>
              <Input id="r-size" type="number" error={errors.sizeSqm?.message} {...register('sizeSqm', { valueAsNumber: true })} />
            </FormField>
            <FormField label="Price / night (€)" htmlFor="r-price" error={errors.pricePerNight?.message} required>
              <Input id="r-price" type="number" step="any" error={errors.pricePerNight?.message} {...register('pricePerNight', { valueAsNumber: true })} />
            </FormField>
            <FormField label="Units available" htmlFor="r-units" error={errors.totalUnits?.message} required hint="How many of this room type exist">
              <Input id="r-units" type="number" error={errors.totalUnits?.message} {...register('totalUnits', { valueAsNumber: true })} />
            </FormField>
          </div>

          <FormField label="Description" htmlFor="r-desc" error={errors.description?.message} required>
            <Input id="r-desc" error={errors.description?.message} {...register('description')} />
          </FormField>

          <div className="flex flex-wrap gap-5">
            <label className="flex items-center gap-2.5 text-sm text-ink-700">
              <input type="checkbox" className="size-4 rounded border-ink-300 text-brand-700" {...register('breakfastIncluded')} />
              Breakfast included
            </label>
            <label className="flex items-center gap-2.5 text-sm text-ink-700">
              <input type="checkbox" className="size-4 rounded border-ink-300 text-brand-700" {...register('freeCancellation')} />
              Free cancellation
            </label>
          </div>

          <div className="flex justify-end gap-2.5 border-t border-ink-100 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormOpen(false);
                crud.closeModal();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" loading={crud.saving}>
              {crud.editing ? 'Save changes' : 'Add room'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(crud.deleteTarget)}
        title="Delete this room?"
        description={`"${crud.deleteTarget?.name}" will be permanently removed.`}
        loading={crud.deleting}
        onConfirm={crud.handleDelete}
        onCancel={() => crud.setDeleteTarget(null)}
      />
    </Modal>
  );
}
