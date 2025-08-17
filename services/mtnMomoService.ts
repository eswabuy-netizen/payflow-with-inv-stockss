// services/mtnMomoService.ts

/**
 * MTN Eswatini Mobile Money (MoMo) Integration Service (Mockup)
 * Replace mock logic with real API calls as needed.
 */

export type MtnMomoTopUpStatus = 'pending' | 'success' | 'failed';

export interface MtnMomoTopUpRequest {
  phoneNumber: string;
  amount: number;
  reference: string;
}

export interface MtnMomoTopUpResult {
  status: MtnMomoTopUpStatus;
  transactionId?: string;
  error?: string;
}

export class MtnMomoService {
  /**
   * Initiate a top-up request via MTN MoMo API (mocked)
   * @param request { phoneNumber, amount, reference }
   * @returns { status, transactionId, error }
   */
  static async initiateTopUp(request: MtnMomoTopUpRequest): Promise<MtnMomoTopUpResult> {
    // TODO: Replace this mock with a real API call to MTN MoMo
    // For now, simulate a delay and always succeed
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate random success/failure
        if (Math.random() < 0.9) {
          resolve({
            status: 'success',
            transactionId: 'MOCK-' + Date.now(),
          });
        } else {
          resolve({
            status: 'failed',
            error: 'Simulated payment failure. Try again.',
          });
        }
      }, 2000);
    });
  }

  /**
   * Poll for payment confirmation (mocked)
   * In real implementation, poll the MTN MoMo API or handle webhook/callback.
   */
  static async pollTopUpStatus(transactionId: string): Promise<MtnMomoTopUpStatus> {
    // TODO: Replace with real status check
    return new Promise((resolve) => {
      setTimeout(() => resolve('success'), 1000);
    });
  }
}