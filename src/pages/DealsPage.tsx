import { BadgePercent, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Card } from '@/components/ui/Card';

const DEALS = [
  {
    code: 'WELCOME10',
    title: '10% off your first booking',
    description: 'New to Voyago? Save on flights, hotels, cars, or transfers.',
    service: 'Any service',
    seed: 'voyago-deal-welcome',
  },
  {
    code: 'SAVE20',
    title: '€20 off stays over €200',
    description: 'Book 3+ nights at any partner hotel and save instantly.',
    service: 'Hotels',
    seed: 'voyago-deal-hotel',
  },
  {
    code: 'ROADTRIP15',
    title: '15% off weekly car rentals',
    description: 'Rent for 7 days or more and save on economy to SUV categories.',
    service: 'Car rentals',
    seed: 'voyago-deal-car',
  },
  {
    code: 'SKYFAST',
    title: 'Free seat selection',
    description: 'Complimentary seat selection on round-trip Economy fares.',
    service: 'Flights',
    seed: 'voyago-deal-flight',
  },
];

export default function DealsPage() {
  return (
    <div className="container-page py-10 sm:py-14">
      <div className="max-w-2xl">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700">
          <BadgePercent className="size-3.5" />
          Limited-time offers
        </span>
        <h1 className="mt-4 font-display text-3xl font-bold text-ink-950 sm:text-4xl">Deals &amp; promo codes</h1>
        <p className="mt-3 text-ink-500">
          Apply these codes at checkout. Demo discounts are validated against Firestore just like a real promotion
          engine — see <code className="rounded bg-ink-100 px-1.5 py-0.5 text-xs">coupons</code> in the admin
          dashboard.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {DEALS.map((deal) => (
          <DealCard key={deal.code} {...deal} />
        ))}
      </div>
    </div>
  );
}

function DealCard({
  code,
  title,
  description,
  service,
  seed,
}: {
  code: string;
  title: string;
  description: string;
  service: string;
  seed: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — fail silently, code is still visible to copy manually.
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex">
        <img src={`https://picsum.photos/seed/${seed}/240/240`} alt="" className="size-32 object-cover sm:size-40" />
        <div className="flex flex-1 flex-col justify-between p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{service}</p>
            <h3 className="mt-1 font-display text-lg font-semibold text-ink-950">{title}</h3>
            <p className="mt-1 text-sm text-ink-500">{description}</p>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="mt-4 inline-flex w-fit items-center gap-2 rounded-lg border border-dashed border-brand-300 bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-100"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {code}
          </button>
        </div>
      </div>
    </Card>
  );
}
