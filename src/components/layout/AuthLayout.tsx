import type { ReactNode } from 'react';
import { ShieldCheck, Sparkles, Star } from 'lucide-react';
import { Logo } from './Logo';

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-[calc(100vh-1px)] grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -left-20 top-10 size-80 rounded-full bg-accent-500/20 blur-3xl" />
          <div className="absolute -bottom-24 right-0 size-96 rounded-full bg-brand-400/20 blur-3xl" />
        </div>

        <Logo dark className="relative" />

        <div className="relative max-w-md">
          <div className="mb-6 flex items-center gap-1 text-accent-300">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-4 fill-current" />
            ))}
          </div>
          <p className="font-display text-2xl font-semibold leading-snug text-white">
            “Booking every leg of our trip in one place, with one clear price, made the whole thing feel effortless.”
          </p>
          <p className="mt-4 text-sm text-white/60">Voyago traveler</p>
        </div>

        <div className="relative flex flex-col gap-3 text-sm text-white/70">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="size-4 text-accent-300" />
            Secure authentication, powered by Firebase
          </div>
          <div className="flex items-center gap-2.5">
            <Sparkles className="size-4 text-accent-300" />
            One account for flights, hotels, cars &amp; transfers
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="font-display text-2xl font-bold text-ink-950 sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm text-ink-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
