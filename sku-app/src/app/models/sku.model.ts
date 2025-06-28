export interface DrugSKU {
  id?: string;
  ndc?: string;           // National Drug Code (format: xxxxx-xxxx-xx)
  name: string;           // Drug name
  manufacturer: string;   // Manufacturer name
  dosageForm: string;    // e.g., tablet, capsule, liquid
  strength: string;      // e.g., "10mg", "100mg/5ml"
  packageSize: string;   // e.g., "100 tablets", "500ml"
  gtin?: string;         // Global Trade Item Number
  imageUrl?: string;     // URL to stored product image
  status: SKUStatus;     // Current status in workflow
  lastModified?: Date;
  createdAt?: Date;
  createdBy?: string;
  reviewedBy?: string;
}

export enum SKUStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  DELETED = 'DELETED'
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
