import { apiClient } from './client';

export interface BankInfo {
  code: string;
  name: string;
}

export interface LookupResponse {
  code: string;
  description: string;
  data: {
    accountNumber: string;
    accountName: string;
  };
}

/**
 * Fetch list of supported settlement banks.
 */
export async function getBanks(): Promise<BankInfo[]> {
  const response = await apiClient.get<BankInfo[]>('/api/v1/banks');
  return response.data;
}

/**
 * Lookup bank account name.
 */
export async function lookupBankAccount(accountNumber: string, bankCode: string): Promise<LookupResponse> {
  const response = await apiClient.get<LookupResponse>('/api/v1/banks/lookup', {
    params: { accountNumber, bankCode },
  });
  return response.data;
}
