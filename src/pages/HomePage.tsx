import { Link } from 'react-router-dom';
import { ShieldCheck, BadgePercent, Clock, Sparkles, Star, ArrowRight } from 'lucide-react';
import { SearchWidget } from '@/components/booking/SearchWidget';
import { CardHoverable } from '@/components/ui/Card';

const DESTINATIONS = [
  { city: 'Paris', country: 'France', code: 'PAR', seed: 'voyago-paris' },
  { city: 'Barcelona', country: 'Spain', code: 'BCN', seed: 'voyago-barcelona' },
  { city: 'Dubai', country: 'UAE', code: 'DXB', seed: 'voyago-dubai' },
  { city: 'Rome', country: 'Italy', code: 'ROM', seed: 'voyago-rome' },
  { city: 'Istanbul', country: 'Türkiye', code: 'IST', seed: 'voyago-istanbul' },
  { city: 'New York', country: 'United States', code: 'NYC', seed: 'voyago-nyc' },
];

const TRUST_POINTS = [
  { icon: ShieldCheck, title: 'Secure by design', text: 'Firebase-backed authentication and encrypted checkout on every booking.' },
  { icon: BadgePercent, title: 'Transparent pricing', text: 'The price you see is the price you pay — taxes and fees included upfront.' },
  { icon: Clock, title: 'Free cancellation', text: 'Most flights, stays, and rentals can be cancelled free of charge.' },
  { icon: Sparkles, title: 'One place, four services', text: 'Flights, hotels, cars, and transfers — planned and booked together.' },
];

const STEPS = [
  { step: '01', title: 'Search', text: 'Compare flights, hotels, cars, and transfers side by side in seconds.' },
  { step: '02', title: 'Book', text: 'Reserve with clear pricing and flexible cancellation — no hidden fees.' },
  { step: '03', title: 'Travel', text: 'Everything lives in your dashboard: confirmations, trips, and reminders.' },
];

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-950 via-brand-900 to-brand-800 pb-40 pt-28 sm:pb-48 sm:pt-36">
        <HeroDecoration />

        <div className="container-page relative">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white/90 ring-1 ring-white/15 backdrop-blur">
              <Sparkles className="size-3.5 text-accent-300" />
              Flights · Hotels · Cars · Transfers — all in one place
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.08] text-white sm:text-6xl">
              Your journey starts here.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-balance text-lg text-white/75">
              Book flights, hotels, cars, and airport transfers in one place — with transparent pricing and free
              cancellation on most bookings.
            </p>
          </div>
        </div>

        <div className="container-page relative mt-10 sm:mt-12">
          <SearchWidget />
        </div>
      </section>

      <section className="container-page -mt-16 grid grid-cols-1 gap-4 py-12 sm:-mt-20 sm:grid-cols-2 sm:py-16 lg:grid-cols-4">
        {TRUST_POINTS.map((point) => (
          <div key={point.title} className="rounded-2xl border border-ink-100 bg-white p-6 shadow-soft">
            <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <point.icon className="size-5" />
            </span>
            <h3 className="mt-4 font-display text-base font-semibold text-ink-950">{point.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{point.text}</p>
          </div>
        ))}
      </section>

      <section className="container-page py-12 sm:py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink-950 sm:text-3xl">Popular destinations</h2>
            <p className="mt-2 text-ink-500">Handpicked cities travelers are booking right now.</p>
          </div>
          <Link to="/explore" className="hidden items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800 sm:inline-flex">
            Explore all <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {DESTINATIONS.map((dest) => (
            <Link
              key={dest.code}
              to={`/hotels/results?destination=${encodeURIComponent(dest.city)}`}
              className="group"
            >
              <CardHoverable className="overflow-hidden p-0">
                <div className="aspect-[3/4] w-full overflow-hidden bg-ink-100">
                  <img
                    src={`https://picsum.photos/seed/${dest.seed}/400/560`}
                    alt={`${dest.city}, ${dest.country}`}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-3">
                  <p className="font-display text-sm font-semibold text-ink-950">{dest.city}</p>
                  <p className="text-xs text-ink-500">{dest.country}</p>
                </div>
              </CardHoverable>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-ink-50 py-16 sm:py-20">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-2xl font-bold text-ink-950 sm:text-3xl">How Voyago works</h2>
            <p className="mt-2 text-ink-500">From search to touchdown, in three simple steps.</p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.step} className="relative rounded-2xl bg-white p-7 shadow-soft">
                <span className="font-display text-4xl font-bold text-brand-100">{s.step}</span>
                <h3 className="mt-3 font-display text-lg font-semibold text-ink-950">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 to-brand-950 px-6 py-14 text-center sm:px-16">
          <div className="mx-auto flex max-w-md items-center justify-center gap-1 text-accent-300">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-4 fill-current" />
            ))}
          </div>
          <h2 className="mt-4 font-display text-2xl font-bold text-white sm:text-3xl">
            Join travelers planning smarter trips
          </h2>
          <p className="mx-auto mt-3 max-w-md text-white/70">
            Create a free Voyago account to save favorites, track trips, and check out faster.
          </p>
          <Link
            to="/register"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand-800 transition-transform hover:scale-[1.02]"
          >
            Create your account
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function HeroDecoration() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -left-24 top-10 size-96 rounded-full bg-accent-500/20 blur-3xl" />
      <div className="absolute right-0 top-1/3 size-[28rem] rounded-full bg-brand-400/20 blur-3xl" />
      <svg className="absolute inset-0 size-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dot-grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.5" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-grid)" />
      </svg>
      <svg
        viewBox="0 0 1000 300"
        className="absolute left-1/2 top-16 h-auto w-[140%] max-w-none -translate-x-1/2 opacity-30 sm:top-20"
        fill="none"
      >
        <path
          d="M20 260 C 220 40, 420 320, 620 120 S 900 40, 980 60"
          stroke="url(#route-gradient)"
          strokeWidth="2"
          strokeDasharray="2 10"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="route-gradient" x1="0" y1="0" x2="1000" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#67e8f9" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
