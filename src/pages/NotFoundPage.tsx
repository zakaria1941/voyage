import { Compass } from 'lucide-react';
import { LinkButton } from '@/components/ui/LinkButton';

export default function NotFoundPage() {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <Compass className="size-8" />
      </span>
      <h1 className="mt-6 font-display text-3xl font-bold text-ink-950 sm:text-4xl">You’ve wandered off the map</h1>
      <p className="mt-3 max-w-md text-ink-500">
        We couldn’t find the page you’re looking for. It may have been moved, or the address might be off.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <LinkButton to="/">Back to home</LinkButton>
        <LinkButton to="/help" variant="outline">
          Contact support
        </LinkButton>
      </div>
    </div>
  );
}
