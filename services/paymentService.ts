import apiClient from '../api/client';

export type ChapaCheckout = { checkout_url: string; tx_ref: string; isFree?: boolean };

export type CreateDirectPaymentInput = {
  reservationId: string;
  qrToken?: string | null;
};

/**
 * Recursively searches a JSON object for a valid https:// checkout URL.
 * Searches direct keys, then one level deep, then two levels deep.
 */
function findCheckoutUrl(root: Record<string, unknown>): string | null {
  const URL_KEYS = ['checkout_url', 'checkoutUrl', 'url'];
  const NEST_KEYS = ['data', 'result', 'payload', 'payment', 'chapa', 'response', 'session'];

  const isValidUrl = (v: unknown): v is string =>
    typeof v === 'string' && /^https?:\/\//i.test(v);

  // Level 0: direct on root
  for (const k of URL_KEYS) {
    if (isValidUrl(root[k])) return root[k] as string;
  }

  // Level 1: root.data / root.payment / etc.
  for (const nk of NEST_KEYS) {
    const n1 = root[nk];
    if (!n1 || typeof n1 !== 'object') continue;
    const obj1 = n1 as Record<string, unknown>;

    for (const k of URL_KEYS) {
      if (isValidUrl(obj1[k])) return obj1[k] as string;
    }

    // Level 2: root.data.data / root.payment.data / etc.
    for (const nk2 of NEST_KEYS) {
      const n2 = obj1[nk2];
      if (!n2 || typeof n2 !== 'object') continue;
      const obj2 = n2 as Record<string, unknown>;
      for (const k of URL_KEYS) {
        if (isValidUrl(obj2[k])) return obj2[k] as string;
      }
    }
  }

  return null;
}

export const paymentService = {
  /**
   * Creates a Chapa hosted checkout session.
   * - Sends `returnUrl: 'parkaddis://payment-success'` so Chapa deep-links the user back to the app.
   * - Sends `returnUrl: 'https://park-addis.onrender.com/api/payment/success'` so Chapa deep-links the user back to the app.
   * - Handles zero-cost sessions where the backend auto-marks the reservation as PAID.
   * - Searches the response at multiple nesting levels to find the checkout URL.
   */
  createDirectPayment: async (input: CreateDirectPaymentInput): Promise<ChapaCheckout> => {
    const qt = input.qrToken?.trim();

    const body: Record<string, unknown> = {
      reservationId: input.reservationId,
      returnUrl: 'https://park-addis.onrender.com/api/payment/success',
    };
    if (qt) {
      body.qrToken = qt;
      body.qr_token = qt;
    }

    const response = await apiClient.post<Record<string, unknown>>('/payment/create', body);
    const d = response.data as Record<string, unknown>;

    // Explicit backend error
    if (d.success === false || d.ok === false) {
      const msg =
        (typeof d.message === 'string' && d.message) ||
        (typeof d.error === 'string' && d.error) ||
        'Payment could not be started';
      throw new Error(msg);
    }

    // Zero-cost session: backend already marked reservation as PAID
    const dataObj = d.data as Record<string, unknown> | undefined;
    if (dataObj?.isFree === true) {
      return { checkout_url: '', tx_ref: '', isFree: true };
    }

    // Deep-search for checkout URL across any nesting level
    const url = findCheckoutUrl(d);
    if (url) {
      return { checkout_url: url, tx_ref: '' };
    }

    // URL not found — show a meaningful error

    // Don't surface Chapa's internal "Hosted link" label as the error
    const errMsg =
      (typeof d.error === 'string' && d.error) ||
      (typeof d.message === 'string' && d.message !== 'Hosted link' && d.message) ||
      'No checkout link received from server. Please try again.';

    throw new Error(errMsg);
  },
};

export default paymentService;
