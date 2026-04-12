import apiClient from '../api/client';

export type ChapaCheckout = { checkout_url: string; tx_ref: string };

export const paymentService = {
  createDirectPayment: async (qrToken: string): Promise<ChapaCheckout> => {
    const response = await apiClient.post<Record<string, unknown>>('/payment/create', { qrToken });
    const d = response.data as Record<string, unknown>;
    const url =
      (typeof d.checkout_url === 'string' && d.checkout_url) ||
      (typeof d.checkoutUrl === 'string' && d.checkoutUrl) ||
      '';
    const txRef =
      (typeof d.tx_ref === 'string' && d.tx_ref) ||
      (typeof d.txRef === 'string' && d.txRef) ||
      '';
    if (!url) {
      const msg = typeof d.message === 'string' ? d.message : 'No checkout link returned';
      throw new Error(msg);
    }
    return { checkout_url: url, tx_ref: txRef };
  },
};

export default paymentService;
