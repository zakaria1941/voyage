import { useState } from 'react';
import { BadgePercent, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { previewCoupon } from '@/services/couponService';
import { useCurrency } from '@/context/CurrencyContext';
import type { BookingType } from '@/types/common';

interface CouponInputProps {
  service: BookingType;
  amount: number;
  onApplied: (result: { code: string; discount: number } | null) => void;
}

export function CouponInput({ service, amount, onApplied }: CouponInputProps) {
  const { format } = useCurrency();
  const [code, setCode] = useState('');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<{ code: string; discount: number } | { error: string } | null>(null);

  async function handleApply() {
    if (!code.trim()) return;
    setChecking(true);
    setResult(null);
    try {
      const preview = await previewCoupon(code, service, amount);
      if (preview.eligible) {
        const applied = { code: code.trim().toUpperCase(), discount: preview.discount };
        setResult(applied);
        onApplied(applied);
      } else {
        setResult({ error: preview.reason || 'This coupon can’t be applied.' });
        onApplied(null);
      }
    } catch {
      setResult({ error: 'We couldn’t check that code. Please try again.' });
      onApplied(null);
    } finally {
      setChecking(false);
    }
  }

  function handleRemove() {
    setCode('');
    setResult(null);
    onApplied(null);
  }

  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
      <p className="mb-3 flex items-center gap-2 font-display text-sm font-semibold text-ink-900">
        <BadgePercent className="size-4 text-brand-600" />
        Promo code
      </p>

      {result && 'code' in result ? (
        <div className="flex items-center justify-between rounded-xl bg-success-50 px-3.5 py-2.5">
          <p className="flex items-center gap-2 text-sm font-medium text-success-700">
            <Check className="size-4" />
            {result.code} applied — you save {format(result.discount)}
          </p>
          <button type="button" onClick={handleRemove} aria-label="Remove coupon" className="text-success-700 hover:text-success-800">
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <div>
          <div className="flex gap-2">
            <Input
              placeholder="Enter code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApply())}
            />
            <Button type="button" variant="outline" onClick={handleApply} loading={checking}>
              Apply
            </Button>
          </div>
          {result && 'error' in result && <p className="mt-2 text-xs font-medium text-danger-600">{result.error}</p>}
        </div>
      )}
    </div>
  );
}
