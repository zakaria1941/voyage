export interface PaymentDetails {
  cardNumber: string;
  cardholderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  errorMessage?: string;
}

/**
 * Payment abstraction (spec section 47). Swap `activePaymentProvider` in
 * index.ts for a real implementation (e.g. StripePaymentProvider) later —
 * nothing outside this module needs to change. Never implement a provider
 * that stores raw card numbers; a real integration would tokenize
 * client-side and only ever send Voyago's backend an opaque token.
 */
export interface PaymentProvider {
  readonly name: string;
  charge(amountInEur: number, details: PaymentDetails): Promise<PaymentResult>;
}
