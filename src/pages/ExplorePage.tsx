import { Link } from 'react-router-dom';
import { Plane, Hotel, Car, CarTaxiFront, ArrowRight } from 'lucide-react';
import { CardHoverable } from '@/components/ui/Card';
import { SearchWidget } from '@/components/booking/SearchWidget';

const CATEGORIES = [
  { type: 'flight', label: 'Flights', icon: Plane, to: '/flights', blurb: 'Compare fares across airlines and cabins.' },
  { type: 'hotel', label: 'Hotels', icon: Hotel, to: '/hotels', blurb: 'From boutique stays to full-service resorts.' },
  { type: 'car', label: 'Car rentals', icon: Car, to: '/cars', blurb: 'Economy to luxury, with flexible pickup.' },
  { type: 'transfer', label: 'Airport transfers', icon: CarTaxiFront, to: '/transfers', blurb: 'Door-to-door rides, no waiting in line.' },
] as const;

const REGIONS = [
  { name: 'Southern Europe', seed: 'voyago-region-south-europe' },
  { name: 'North Africa', seed: 'voyago-region-north-africa' },
  { name: 'Middle East', seed: 'voyago-region-middle-east' },
  { name: 'North America', seed: 'voyago-region-north-america' },
];

export default function ExplorePage() {
  return (
    <div className="container-page py-10 sm:py-14">
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl font-bold text-ink-950 sm:text-4xl">Explore Voyago</h1>
        <p className="mt-3 text-ink-500">
          Start planning your next trip — search any service below, or browse by region for inspiration.
        </p>
      </div>

      <div className="mt-8">
        <SearchWidget />
      </div>

      <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map((cat) => (
          <Link key={cat.type} to={cat.to}>
            <CardHoverable className="flex h-full flex-col p-6">
              <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <cat.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-display text-base font-semibold text-ink-950">{cat.label}</h3>
              <p className="mt-1.5 flex-1 text-sm text-ink-500">{cat.blurb}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
                Search {cat.label.toLowerCase()} <ArrowRight className="size-3.5" />
              </span>
            </CardHoverable>
          </Link>
        ))}
      </div>

      <div className="mt-16">
        <h2 className="font-display text-2xl font-bold text-ink-950">Browse by region</h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {REGIONS.map((region) => (
            <div key={region.name} className="group relative overflow-hidden rounded-2xl">
              <img
                src={`https://picsum.photos/seed/${region.seed}/500/350`}
                alt={region.name}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent" />
              <p className="absolute bottom-4 left-4 font-display text-base font-semibold text-white">{region.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
