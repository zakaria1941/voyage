import type { ReactNode } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Inbox } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  keyField: (row: T) => string;
  loading?: boolean;
  actions?: (row: T) => ReactNode;
  emptyMessage?: string;
}

export function DataTable<T>({ columns, rows, keyField, loading, actions, emptyMessage = 'No records found.' }: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white">
        <div className="flex flex-col gap-3 p-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-ink-100 bg-white">
        <EmptyState icon={<Inbox className="size-6" />} title="Nothing here yet" description={emptyMessage} />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-ink-100 bg-ink-50/60">
            {columns.map((col) => (
              <th key={col.key} className="whitespace-nowrap px-4 py-3 font-semibold text-ink-600">
                {col.header}
              </th>
            ))}
            {actions && <th className="px-4 py-3" />}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={keyField(row)} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/40">
              {columns.map((col) => (
                <td key={col.key} className={col.className ?? 'px-4 py-3 text-ink-800'}>
                  {col.render(row)}
                </td>
              ))}
              {actions && <td className="whitespace-nowrap px-4 py-3 text-right">{actions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
