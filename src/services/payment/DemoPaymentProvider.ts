import type { PaymentDetails, PaymentProvider, PaymentResult } from './PaymentProvider';

const DECLINED_TEST_CARD = '4000000000000002';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomTransactionId(): string {
  return `demo_${Math.random().toString(36).slice(2, 12)}`;
}

/**
 * Simulated payment provider — no real money moves and no card numbers are
 * ever persisted or sent anywhere. Use card 4242 4242 4242 4242 for a
 * successful demo charge, or 4000 0000 0000 0002 to see the decline path.
 */
export class DemoPaymentProvider implements PaymentProvider {
  readonly name = 'demo';

  async charge(_amountInEur: number, details: PaymentDetails): Promise<PaymentResult> {
    await delay(900 + Math.random() * 500);

    const digitsOnly = details.cardNumber.replace(/\s+/g, '');
    if (digitsOnly === DECLINED_TEST_CARD) {
      return { success: false, errorMessage: 'Your card was declined. Please try a different card.' };
    }

    return { success: true, transactionId: randomTransactionId() };
  }
}

export const activePaymentProvider: PaymentProvider = new DemoPaymentProvider();
