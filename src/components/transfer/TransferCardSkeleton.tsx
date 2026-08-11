import { Skeleton } from '@/components/ui/Skeleton';

export function TransferCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white sm:flex-row">
      <Skeleton className="aspect-[4/3] w-full rounded-none sm:aspect-auto sm:w-56" />
      <div className="flex-1 space-y-3 p-5">
        <Skeleton className="h-4 w-20 rounded-full" />
        <Skeleton className="h-5 w-1/2" />
        <div className="flex gap-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="mt-6 h-6 w-20" />
      </div>
    </div>
  );
}
