import { Skeleton } from '@/components/ui/Skeleton';

export function HotelCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white sm:flex-row">
      <Skeleton className="aspect-[4/3] w-full rounded-none sm:aspect-auto sm:w-64" />
      <div className="flex-1 space-y-3 p-5">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-3.5 w-1/3" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-5 w-32 rounded-full" />
        </div>
        <Skeleton className="mt-6 h-6 w-20" />
      </div>
    </div>
  );
}
