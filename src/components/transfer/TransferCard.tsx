import { Users, Briefcase, ShieldCheck, UserCheck } from 'lucide-react';
import { CardHoverable } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useCurrency } from '@/context/CurrencyContext';
import type { Transfer } from '@/types/transfer';

const VEHICLE_LABELS: Record<Transfer['vehicleType'], string> = {
  standard: 'Standard',
  business: 'Business',
  van: 'Van',
  luxury: 'Luxury',
};

export function TransferCard({ transfer, onSelect }: { transfer: Transfer; onSelect: () => void }) {
  const { format } = useCurrency();

  return (
    <CardHoverable className="flex flex-col overflow-hidden sm:flex-row">
      <div className="flex aspect-[4/3] w-full shrink-0 items-center justify-center overflow-hidden bg-ink-50 sm:aspect-auto sm:w-56">
        <img src={transfer.image} alt={transfer.vehicleName} loading="lazy" className="size-full object-cover" />
      </div>
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <Badge tone="brand" className="mb-1.5">{VEHICLE_LABELS[transfer.vehicleType]}</Badge>
          <h3 className="font-display text-lg font-semibold text-ink-950">{transfer.vehicleName}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-ink-600">
            <span className="flex items-center gap-1.5">
              <Users className="size-3.5 text-ink-400" /> Up to {transfer.maxPassengers}
            </span>
            <span className="flex items-center gap-1.5">
              <Briefcase className="size-3.5 text-ink-400" /> Up to {transfer.maxLuggage} bags
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {transfer.meetAndGreet && (
              <Badge tone="neutral">
                <UserCheck className="size-3" /> Meet &amp; greet
              </Badge>
            )}
            {transfer.freeCancellation && (
              <Badge tone="success">
                <ShieldCheck className="size-3" /> Free cancellation
              </Badge>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between border-t border-ink-100 pt-4">
          <p className="text-xs text-ink-400">Fixed price · No surge pricing</p>
          <div className="flex items-center gap-4">
            <p className="font-display text-xl font-bold text-brand-800">{format(transfer.pricePerTrip)}</p>
            <Button onClick={onSelect}>Select</Button>
          </div>
        </div>
      </div>
    </CardHoverable>
  );
}
