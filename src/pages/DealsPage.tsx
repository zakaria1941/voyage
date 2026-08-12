import { useState } from 'react';
import { BadgePercent, Copy, Check, Percent, Tag } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAsync } from '@/hooks/useAsync';
import { listCoupons } from '@/services/couponService';
import { useLanguage } from '@/context/LanguageContext';
import type { TranslationKey } from '@/i18n';
import { formatDateShort } from '@/utils/date';
import type { Coupon } from '@/types/coupon';
import type { BookingType } from '@/types/common';

const SERVICE_LABEL_KEYS: Record<BookingType, TranslationKey> = {
  flight: 'nav.flights',
  hotel: 'nav.hotels',
  car: 'nav.cars',
  transfer: 'nav.transfers',
};

function describeCoupon(coupon: Coupon, t: (key: TranslationKey, params?: Record<string, string | number>) => string): { title: string; description: string; serviceLabel: string } {
  const discount = coupon.type === 'percentage' ? `${coupon.value}%` : `€${coupon.value}`;
  const isAllServices = coupon.applicableServices.includes('all');
  const serviceLabel = isAllServices ? t('deals.anyService') : coupon.applicableServices.map((s) => t(SERVICE_LABEL_KEYS[s as BookingType])).join(', ');
  const title = `${discount} ${t('deals.off')} ${isAllServices ? t('deals.yourBooking') : serviceLabel}`;
  const minimum = coupon.minimumAmount > 0 ? ` on bookings over €${coupon.minimumAmount.toFixed(0)}` : '';
  const description = `Apply at checkout${minimum}. Valid until ${formatDateShort(coupon.expirationDate)}.`;
  return { title, description, serviceLabel };
}

/**
 * Reads real coupon documents from Firestore (the same `coupons` collection
 * and `listCoupons()` the admin dashboard uses) and shows only the ones
 * currently valid for a customer: active, not expired, not past its usage
 * limit. Inactive/expired/exhausted coupons still exist in Firestore for
 * admin management but are intentionally hidden here.
 */
export default function DealsPage() {
  const { t } = useLanguage();
  const { data: coupons, loading, error, refetch } = useAsync(() => listCoupons(), []);
  const [now] = useState(() => Date.now());
  const activeDeals = (coupons ?? []).filter((c) => c.active && c.expirationDate > now && c.usageCount < c.usageLimit);

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="max-w-2xl">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700">
          <BadgePercent className="size-3.5" />
          {t('deals.badge')}
        </span>
        <h1 className="mt-4 font-display text-3xl font-bold text-ink-950 sm:text-4xl">{t('deals.title')}</h1>
        <p className="mt-3 text-ink-500">{t('deals.subtitle')}</p>
      </div>

      {loading && (
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="mt-10">
          <ErrorState description={error} onRetry={refetch} />
        </div>
      )}

      {!loading && !error && activeDeals.length === 0 && (
        <EmptyState
          className="mt-10"
          icon={<BadgePercent className="size-6" />}
          title={t('deals.noneActive')}
          description={t('deals.noneActiveDesc')}
        />
      )}

      {!loading && !error && activeDeals.length > 0 && (
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {activeDeals.map((coupon) => (
            <DealCard key={coupon.id} coupon={coupon} />
          ))}
        </div>
      )}
    </div>
  );
}

function DealCard({ coupon }: { coupon: Coupon }) {
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();
  const { title, description, serviceLabel } = describeCoupon(coupon, t);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — fail silently, code is still visible to copy manually.
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex">
        <div className="flex w-28 shrink-0 flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-brand-700 to-brand-900 text-white sm:w-36">
          {coupon.type === 'percentage' ? <Percent className="size-6" /> : <Tag className="size-6" />}
          <span className="font-display text-2xl font-bold">
            {coupon.type === 'percentage' ? `${coupon.value}%` : `€${coupon.value}`}
          </span>
          <span className="text-[11px] font-medium uppercase tracking-wide text-white/70">off</span>
        </div>
        <div className="flex flex-1 flex-col justify-between p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{serviceLabel}</p>
            <h3 className="mt-1 font-display text-lg font-semibold text-ink-950">{title}</h3>
            <p className="mt-1 text-sm text-ink-500">{description}</p>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="mt-4 inline-flex w-fit items-center gap-2 rounded-lg border border-dashed border-brand-300 bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-100"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {coupon.code}
          </button>
        </div>
      </div>
    </Card>
  );
}
