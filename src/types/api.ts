export interface LandlordDetails {
  bankCode: string;
  bankAccountNumber: string;
  bankAccountName: string;
}

export interface TenantDetails {
  bvn: string;
}

export interface SignUpRequest {
  email: string;
  password?: string;
  role: 'LANDLORD' | 'TENANT' | 'ADMIN';
  firstName: string;
  lastName: string;
  phoneNumber: string;
  landlordDetails?: LandlordDetails;
  tenantDetails?: TenantDetails;
}

export interface SignUpResponse {
  message: string;
  email: string;
  id: string; // UUID
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface LoginResponse {
  token: string;
  email: string;
  roles: string[];
}

export interface PropertyRequest {
  name: string;
  address: string;
  propertyCode: string;
}

export interface PropertyResponse {
  id: string; // UUID
  name: string;
  address: string;
  propertyCode: string;
}

export type UnitStatus = 'VACANT' | 'OCCUPIED' | 'MAINTENANCE';

export interface UnitRequest {
  unitNumber: string;
  baseRent: number;
  status?: UnitStatus;
}

export interface UnitResponse {
  id: string; // UUID
  propertyId: string; // UUID
  propertyName: string;
  unitNumber: string;
  baseRent: number;
  status: string;
}

export interface LeaseRequest {
  tenantId: string; // UUID
  unitId: string; // UUID
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  gracePeriodDays?: number;
  lateFeePercentage?: number;
  nombaVactRef?: string;
}

export interface LeaseResponse {
  id: string; // UUID
  tenantId: string; // UUID
  tenantName?: string;
  unitId: string; // UUID
  unitNumber?: string;
  propertyName?: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  gracePeriodDays?: number;
  status: string;
  nombaVactRef?: string;
  nombaVactNumber?: string;
  nombaVactBank?: string;
  baseRent?: number;
  depositWalletBalance?: number;
}

export interface LedgerEntryResponse {
  id: string; // UUID
  dueDate: string; // YYYY-MM-DD
  entryType: string;
  amountDue: number;
  amountPaid: number;
  status: string;
}

export interface TenantResponse {
  id: string; // UUID
  name: string;
  email: string;
}

export interface ApiError {
  status?: number;
  code?: string;
  message: string;
}
