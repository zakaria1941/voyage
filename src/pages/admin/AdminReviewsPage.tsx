import { useState } from 'react';
import { Star, Trash2 } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { ErrorState } from '@/components/ui/ErrorState';
import { useAsync } from '@/hooks/useAsync';
import { useToast } from '@/context/ToastContext';
import { listAllReviews } from '@/services/reviewService';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatDateShort } from '@/utils/date';
import type { Review } from '@/types/review';

export default function AdminReviewsPage() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);
  const [deleting, setDeleting] = useState(false);
  const reviews = useAsync(() => listAllReviews(200), []);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'reviews', deleteTarget.id));
      toast.success('Review deleted');
      setDeleteTarget(null);
      reviews.refetch();
    } catch (error) {
      toast.error('Couldn’t delete review', error instanceof Error ? error.message : undefined);
    } finally {
      setDeleting(false);
    }
  }

  if (reviews.error) return <ErrorState description={reviews.error} onRetry={reviews.refetch} />;

  const filtered = (reviews.data ?? []).filter((r) => `${r.userName} ${r.title} ${r.comment}`.toLowerCase().includes(search.toLowerCase()));

  const columns: Column<Review>[] = [
    { key: 'author', header: 'Author', render: (r) => r.userName },
    { key: 'rating', header: 'Rating', render: (r) => <span className="flex items-center gap-1"><Star className="size-3.5 fill-current text-warning-500" /> {r.rating}</span> },
    { key: 'title', header: 'Review', render: (r) => <div className="max-w-sm"><p className="font-medium">{r.title}</p><p className="truncate text-xs text-ink-400">{r.comment}</p></div> },
    { key: 'type', header: 'Service', render: (r) => <Badge tone="neutral" className="capitalize">{r.itemType}</Badge> },
    { key: 'date', header: 'Posted', render: (r) => formatDateShort(r.createdAt) },
  ];

  return (
    <div>
      <AdminPageHeader title="Reviews" description="Moderate reviews submitted by travelers." search={search} onSearchChange={setSearch} />
      <DataTable
        columns={columns}
        rows={filtered}
        keyField={(r) => r.id}
        loading={reviews.loading}
        emptyMessage="No reviews have been submitted yet."
        actions={(r) => (
          <button type="button" onClick={() => setDeleteTarget(r)} aria-label="Delete review" className="flex size-8 items-center justify-center rounded-lg text-danger-500 hover:bg-danger-50">
            <Trash2 className="size-4" />
          </button>
        )}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this review?"
        description="This review will be permanently removed."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
