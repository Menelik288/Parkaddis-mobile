import apiClient from '../api/client';

export interface Wallet {
  id: string;
  balance: string;
  status: string;
}

export interface Transaction {
  id: string;
  amount: string;
  type: 'CREDIT' | 'DEBIT';
  description: string;
  createdAt: string;
}

export const walletService = {
  getWallet: async () => {
    const response = await apiClient.get<Wallet>('/wallet');
    return response.data;
  },

  getTransactionHistory: async (walletId: string) => {
    const response = await apiClient.post<Transaction[]>('/wallet/transaction', { walletId });
    return response.data;
  },

  /**
   * Chapa-hosted checkout. Optional `preferredChannel` is sent if the API supports it (ignored otherwise).
   */
  topUp: async (amount: number, options?: { preferredChannel?: string }) => {
    const body: Record<string, unknown> = { amount };
    if (options?.preferredChannel) body.preferredChannel = options.preferredChannel;
    const response = await apiClient.post<Record<string, unknown>>('/wallet/topup', body);
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
      const msg = typeof d.message === 'string' ? d.message : 'No payment link returned';
      throw new Error(msg);
    }
    return { checkout_url: url, tx_ref: txRef };
  },

  payForReservation: async (reservationId: string, amount: number) => {
    const response = await apiClient.post<{ ok?: boolean; message?: string }>('/wallet/pay/reservation', {
      reservationId,
      amount,
    });
    const d = response.data as { ok?: boolean; message?: string };
    if (d?.ok === false) {
      throw new Error(d.message || 'Payment was not accepted');
    }
    return d;
  },
};

export default walletService;
