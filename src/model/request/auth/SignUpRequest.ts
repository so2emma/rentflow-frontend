import {LandlordDetails, TenantDetails} from "@/types/api";

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
