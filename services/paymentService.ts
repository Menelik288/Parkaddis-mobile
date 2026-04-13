import apiClient from '../api/client';

export type ChapaCheckout = { checkout_url: string; tx_ref: string };

function extractCheckoutFields(root: Record<string, unknown>): { url: string; txRef: string } | null {
  const candidates: Record<string, unknown>[] = [root];
  for (const k of ['data', 'result', 'payload', 'payment']) {
    const v = root[k];
    if (v && typeof v === 'object') candidates.push(v as Record<string, unknown>);
  }

  for (const o of candidates) {
    const url =
      (typeof o.checkout_url === 'string' && o.checkout_url) ||
      (typeof o.checkoutUrl === 'string' && o.checkoutUrl) ||
      (typeof o.url === 'string' && /^https?:\/\//i.test(o.url) && o.url) ||
      '';
    if (!url) continue;
    const txRef =
      (typeof o.tx_ref === 'string' && o.tx_ref) ||
      (typeof o.txRef === 'string' && o.txRef) ||
      (typeof o.reference === 'string' && o.reference) ||
      '';
    return { url, txRef };
  }
  return null;
}

export type CreateDirectPaymentInput = {
  reservationId: string;
  qrToken?: string | null;
};

export const paymentService = {
  /**
   * Creates a Chapa hosted checkout session. Sends `reservationId` and optional `qrToken`
   * (and snake_case aliases) so either identifier works depending on backend rules.
   */
  createDirectPayment: async (input: CreateDirectPaymentInput): Promise<ChapaCheckout> => {
    const qt = input.qrToken?.trim();
    const body: Record<string, unknown> = { reservationId: input.reservationId };
    if (qt) {
      body.qrToken = qt;
      body.qr_token = qt;
    }

    const response = await apiClient.post<Record<string, unknown>>('/payment/create', body);
    const d = response.data as Record<string, unknown>;

    if (d.success === false || d.ok === false) {
      const msg =
        (typeof d.message === 'string' && d.message) ||
        (typeof d.error === 'string' && d.error) ||
        'Payment could not be started';
      throw new Error(msg);
    }

    const extracted = extractCheckoutFields(d);
    if (extracted) {
      return { checkout_url: extracted.url, tx_ref: extracted.txRef };
    }

    const msg =
      (typeof d.message === 'string' && d.message) ||
      (typeof d.error === 'string' && d.error) ||
      'No checkout link returned';
    throw new Error(msg);
  },
};

export default paymentService;
