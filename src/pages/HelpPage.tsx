import { useState } from 'react';
import { ChevronDown, Mail, MessageCircle, Phone } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/utils/cn';

const FAQS = [
  {
    q: 'How do I cancel or modify a booking?',
    a: 'Go to Dashboard → My Trips, open the booking, and choose Cancel or Modify. Availability of modification depends on the fare or rate rules shown at checkout.',
  },
  {
    q: 'Is payment on Voyago real?',
    a: 'This is a demo platform. Checkout uses a simulated payment screen — no real card is charged and no funds move. See the “Demo payment” notice on the checkout page.',
  },
  {
    q: 'How do refunds work for free-cancellation bookings?',
    a: 'If a rate includes free cancellation, cancelling before the deadline shown on your booking releases the reservation with no charge.',
  },
  {
    q: 'Can I book for someone else?',
    a: 'Yes — passenger and guest details are collected separately from your account details during checkout.',
  },
  {
    q: 'What currencies are supported?',
    a: 'EUR, USD, GBP, and DZD. Amounts are stored in EUR and converted for display using demo static rates — see the currency selector in the navigation bar.',
  },
];

export default function HelpPage() {
  return (
    <div className="container-page py-10 sm:py-14">
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl font-bold text-ink-950 sm:text-4xl">Help center</h1>
        <p className="mt-3 text-ink-500">Answers to common questions, and ways to reach us.</p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-3">
          {FAQS.map((faq) => (
            <FaqItem key={faq.q} {...faq} />
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <Mail className="size-5 text-brand-600" />
            <p className="mt-3 font-display text-sm font-semibold text-ink-950">Email support</p>
            <p className="mt-1 text-sm text-ink-500">support@voyago.example</p>
          </Card>
          <Card className="p-5">
            <Phone className="size-5 text-brand-600" />
            <p className="mt-3 font-display text-sm font-semibold text-ink-950">Phone</p>
            <p className="mt-1 text-sm text-ink-500">+1 (555) 019-2028 · 24/7</p>
          </Card>
          <Card className="p-5">
            <MessageCircle className="size-5 text-brand-600" />
            <p className="mt-3 font-display text-sm font-semibold text-ink-950">Live chat</p>
            <p className="mt-1 text-sm text-ink-500">Available from your dashboard once signed in.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="font-medium text-ink-900">{q}</span>
        <ChevronDown className={cn('size-4 shrink-0 text-ink-400 transition-transform', open && 'rotate-180')} />
      </button>
      {open && <p className="px-5 pb-4 text-sm leading-relaxed text-ink-500">{a}</p>}
    </Card>
  );
}
