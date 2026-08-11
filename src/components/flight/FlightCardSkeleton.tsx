import { Skeleton } from '@/components/ui/Skeleton';

export function FlightCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-ink-100 bg-white p-5 sm:flex-row sm:items-center">
      <div className="flex items-center gap-3 sm:w-44">
        <Skeleton className="size-10 rounded-xl" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3 w-14" />
        </div>
      </div>
      <div className="flex flex-1 items-center gap-6">
        <Skeleton className="h-8 w-14" />
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 w-14" />
      </div>
      <div className="flex items-center justify-between gap-4 sm:w-40 sm:flex-col sm:items-end">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-10 w-24 rounded-xl" />
      </div>
    </div>
  );
}
