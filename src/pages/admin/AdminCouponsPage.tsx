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
import { ErrorState } from '@/components/ui/ErrorState';
import { useAdminCrud } from '@/hooks/useAdminCrud';
import { listCoupons, createCoupon, updateCoupon, deleteCoupon } from '@/services/couponService';
import { todayISO, addDaysISO, formatDateShort } from '@/utils/date';
import type { Coupon, CouponInput } from '@/types/coupon';
import type { BookingType } from '@/types/common';

const SERVICES: (BookingType | 'all')[] = ['all', 'flight', 'hotel', 'car', 'transfer'];

const schema = z.object({
  code: z.string().trim().min(3, 'At least 3 characters'),
  type: z.enum(['percentage', 'fixed']),
  value: z.number().positive('Must be greater than 0'),
  minimumAmount: z.number().min(0),
  expirationDate: z.string().min(1, 'Required'),
  usageLimit: z.number().int().positive(),
  applicableServices: z.array(z.enum(['all', 'flight', 'hotel', 'car', 'transfer'])).min(1, 'Select at least one service'),
  active: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

function toFormValues(c: Coupon | null): FormValues {
  if (!c) {
    return { code: '', type: 'percentage', value: 10, minimumAmount: 0, expirationDate: addDaysISO(todayISO(), 90), usageLimit: 100, applicableServices: ['all'], active: true };
  }
  return { code: c.code, type: c.type, value: c.value, minimumAmount: c.minimumAmount, expirationDate: new Date(c.expirationDate).toISOString().slice(0, 10), usageLimit: c.usageLimit, applicableServices: c.applicableServices, active: c.active };
}

export default function AdminCouponsPage() {
  const [search, setSearch] = useState('');
  const crud = useAdminCrud<Coupon, CouponInput>({
    list: listCoupons,
    create: (input) => createCoupon(input),
    update: (id, input) => updateCoupon(id, input),
    remove: deleteCoupon,
    getId: (c) => c.id,
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), values: toFormValues(crud.editing) });

  const filtered = crud.items.filter((c) => c.code.toLowerCase().includes(search.toLowerCase()));

  const columns: Column<Coupon>[] = [
    { key: 'code', header: 'Code', render: (c) => <span className="font-mono font-semibold text-brand-700">{c.code}</span> },
    { key: 'discount', header: 'Discount', render: (c) => (c.type === 'percentage' ? `${c.value}%` : `€${c.value}`) },
    { key: 'services', header: 'Services', render: (c) => <span className="text-xs capitalize text-ink-500">{c.applicableServices.join(', ')}</span> },
    { key: 'usage', header: 'Usage', render: (c) => `${c.usageCount} / ${c.usageLimit}` },
    { key: 'expires', header: 'Expires', render: (c) => formatDateShort(c.expirationDate) },
    { key: 'status', header: 'Status', render: (c) => <Badge tone={c.active ? 'success' : 'neutral'}>{c.active ? 'Active' : 'Inactive'}</Badge> },
  ];

  function submit(values: FormValues) {
    const payload: CouponInput = {
      code: values.code,
      type: values.type,
      value: values.value,
      minimumAmount: values.minimumAmount,
      expirationDate: new Date(`${values.expirationDate}T23:59:59`).getTime(),
      usageLimit: values.usageLimit,
      applicableServices: values.applicableServices,
      active: values.active,
    };
    crud.handleSubmit(payload);
  }

  if (crud.error) return <ErrorState description={crud.error} onRetry={crud.refetch} />;

  return (
    <div>
      <AdminPageHeader title="Coupons" description="Discount codes travelers can apply at checkout." onAdd={crud.openCreate} search={search} onSearchChange={setSearch} />
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

      <Modal open={crud.modalOpen} onClose={crud.closeModal} title={crud.editing ? 'Edit coupon' : 'Add coupon'} size="lg">
        <form onSubmit={handleSubmit(submit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Code" htmlFor="c-code" error={errors.code?.message} required>
            <Input id="c-code" className="uppercase" error={errors.code?.message} {...register('code')} />
          </FormField>
          <FormField label="Type" htmlFor="c-type" error={errors.type?.message} required>
            <Select id="c-type" {...register('type')}>
              <option value="percentage">Percentage off</option>
              <option value="fixed">Fixed amount off</option>
            </Select>
          </FormField>
          <FormField label="Value" htmlFor="c-value" error={errors.value?.message} required hint="Percent (0–100) or EUR amount">
            <Input id="c-value" type="number" step="any" error={errors.value?.message} {...register('value', { valueAsNumber: true })} />
          </FormField>
          <FormField label="Minimum booking amount (€)" htmlFor="c-min" error={errors.minimumAmount?.message}>
            <Input id="c-min" type="number" step="any" error={errors.minimumAmount?.message} {...register('minimumAmount', { valueAsNumber: true })} />
          </FormField>
          <FormField label="Expiration date" htmlFor="c-exp" error={errors.expirationDate?.message} required>
            <Input id="c-exp" type="date" error={errors.expirationDate?.message} {...register('expirationDate')} />
          </FormField>
          <FormField label="Usage limit" htmlFor="c-limit" error={errors.usageLimit?.message} required>
            <Input id="c-limit" type="number" error={errors.usageLimit?.message} {...register('usageLimit', { valueAsNumber: true })} />
          </FormField>

          <div className="sm:col-span-2">
            <p className="mb-2 text-sm font-medium text-ink-700">Applicable services</p>
            <Controller
              name="applicableServices"
              control={control}
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {SERVICES.map((s) => {
                    const checked = field.value?.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => field.onChange(checked ? field.value.filter((v) => v !== s) : [...field.value, s])}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${checked ? 'border-brand-700 bg-brand-700 text-white' : 'border-ink-200 text-ink-600'}`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              )}
            />
            {errors.applicableServices && <p className="mt-1.5 text-xs font-medium text-danger-600">{errors.applicableServices.message}</p>}
          </div>

          <label className="flex items-center gap-2.5 text-sm text-ink-700 sm:col-span-2">
            <input type="checkbox" className="size-4 rounded border-ink-300 text-brand-700" {...register('active')} />
            Active
          </label>

          <div className="sm:col-span-2 mt-2 flex justify-end gap-2.5">
            <Button type="button" variant="outline" onClick={crud.closeModal}>
              Cancel
            </Button>
            <Button type="submit" loading={crud.saving}>
              {crud.editing ? 'Save changes' : 'Create coupon'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(crud.deleteTarget)}
        title="Delete this coupon?"
        description={`"${crud.deleteTarget?.code}" will be permanently removed.`}
        loading={crud.deleting}
        onConfirm={crud.handleDelete}
        onCancel={() => crud.setDeleteTarget(null)}
      />
    </div>
  );
}
