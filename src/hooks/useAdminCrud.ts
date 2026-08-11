import { useState } from 'react';
import { useAsync } from './useAsync';
import { useToast } from '@/context/ToastContext';
import { getFriendlyErrorMessage } from '@/utils/errors';

interface UseAdminCrudOptions<T, TInput> {
  list: () => Promise<T[]>;
  create: (input: TInput) => Promise<string>;
  update: (id: string, input: Partial<TInput>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  getId: (item: T) => string;
}

/** Shared list/create/edit/delete state machine for admin CRUD pages. */
export function useAdminCrud<T, TInput>({ list, create, update, remove, getId }: UseAdminCrudOptions<T, TInput>) {
  const data = useAsync(list, []);
  const toast = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }
  function openEdit(item: T) {
    setEditing(item);
    setModalOpen(true);
  }
  function closeModal() {
    setModalOpen(false);
    setEditing(null);
  }

  async function handleSubmit(input: TInput) {
    setSaving(true);
    try {
      if (editing) {
        await update(getId(editing), input);
        toast.success('Saved changes');
      } else {
        await create(input);
        toast.success('Created successfully');
      }
      closeModal();
      data.refetch();
    } catch (error) {
      toast.error('Something went wrong', getFriendlyErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await remove(getId(deleteTarget));
      toast.success('Deleted');
      setDeleteTarget(null);
      data.refetch();
    } catch (error) {
      toast.error('Couldn’t delete', getFriendlyErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  }

  return {
    items: data.data ?? [],
    loading: data.loading,
    error: data.error,
    refetch: data.refetch,
    modalOpen,
    editing,
    deleteTarget,
    saving,
    deleting,
    openCreate,
    openEdit,
    closeModal,
    handleSubmit,
    handleDelete,
    setDeleteTarget,
  };
}
