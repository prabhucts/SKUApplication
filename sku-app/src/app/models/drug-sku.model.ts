export interface DrugSKU {
  id?: number;
  ndc: string;           // National Drug Code (format: xxxxx-xxxx-xx)
  name: string;          // Drug name
  manufacturer: string;  // Manufacturer name
  dosage_form: string;   // e.g., tablet, capsule, liquid
  strength: string;      // e.g., "10mg", "100mg/5ml"
  package_size: string;  // e.g., "100 tablets", "500ml"
  gtin?: string;         // Global Trade Item Number
  image_url?: string;    // URL to stored product image
  status: SKUStatus;     // Current status in workflow
  last_modified?: Date;
  created_at?: Date;
  created_by?: string;
  reviewed_by?: string;
}

export enum SKUStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  DELETED = 'DELETED'
  // Removed ACTIVE status as it's not in the backend
}

export interface SKUValidationResult {
  isValid: boolean;
  errors: {
    field: string;
    message: string;
  }[];
}

export interface SKUSearchCriteria {
  ndc?: string;
  name?: string;
  manufacturer?: string;
  status?: SKUStatus;
  page?: number;
  pageSize?: number;
}

export interface SKUSearchCriteria {
  ndc?: string;
  name?: string;
  manufacturer?: string;
  status?: SKUStatus;
  page?: number;
  pageSize?: number;
}
