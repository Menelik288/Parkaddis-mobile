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

/**
 * Recursively searches a JSON object for a valid https:// checkout URL.
 */
function findCheckoutUrl(root: Record<string, unknown>): string | null {
  const URL_KEYS = ['checkout_url', 'checkoutUrl', 'url'];
  const NEST_KEYS = ['data', 'result', 'payload', 'payment', 'chapa', 'response', 'session'];

  const isValidUrl = (v: unknown): v is string =>
    typeof v === 'string' && /^https?:\/\//i.test(v);

  for (const k of URL_KEYS) {
    if (isValidUrl(root[k])) return root[k] as string;
  }

  for (const nk of NEST_KEYS) {
    const n1 = root[nk];
    if (!n1 || typeof n1 !== 'object') continue;
    const obj1 = n1 as Record<string, unknown>;
    for (const k of URL_KEYS) {
      if (isValidUrl(obj1[k])) return obj1[k] as string;
    }
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

export const walletService = {
  getWallet: async () => {
    const response = await apiClient.get<Wallet>('/wallet');
    return response.data;
  },

  getTransactionHistory: async (walletId: string) => {
    const response = await apiClient.post<any[]>('/wallet/transaction', { walletId });
    // User only wants to see finalized SUCCESS transactions in the history
    const transactions = response.data || [];
    return transactions.filter((tx: any) => tx.status === 'SUCCESS');
  },

  /**
   * Verifies if a specific transaction reference has reached SUCCESS status.
   */
  verifyPayment: async (walletId: string, tx_ref: string): Promise<boolean> => {
    try {
      const response = await apiClient.post<any[]>('/wallet/transaction', { walletId });
      const transactions = response.data || [];
      const match = transactions.find((tx: any) => tx.referenceId === tx_ref);
      return match?.status === 'SUCCESS';
    } catch {
      return false;
    }
  },

  /**
   * Chapa-hosted checkout.
   */
  topUp: async (amount: number, options?: { preferredChannel?: string }) => {
    const body: Record<string, unknown> = {
      amount: amount.toString(),
      returnUrl: 'https://park-addis.onrender.com/api/payment/success',
    };
    // preferredChannel is not mentioned in the mobile integration doc, skipping it for now
    
    const response = await apiClient.post<Record<string, unknown>>('/wallet/topup', body);
    const d = response.data as Record<string, unknown>;

    const url = findCheckoutUrl(d);
    if (url) {
      return { checkout_url: url, tx_ref: (d.tx_ref || d.txRef || '') as string };
    }

    const msg =
      (typeof d.error === 'string' && d.error) ||
      (typeof d.message === 'string' && d.message !== 'Hosted link' && d.message) ||
      'No payment link returned from server';

    throw new Error(msg);
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
