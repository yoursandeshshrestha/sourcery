export interface BasicInfoFormData {
  first_name: string;
  last_name: string;
  phone: string;
}

export interface KYCDocument {
  type: 'id' | 'aml' | 'insurance';
  label: string;
  description: string;
  url: string | null;
  dbField: 'id_document_url' | 'aml_document_url' | 'insurance_document_url';
}

export const KYC_DOCUMENTS: KYCDocument[] = [
  {
    type: 'id',
    label: 'ID Document',
    description: 'Valid passport or driver\'s license',
    url: null,
    dbField: 'id_document_url',
  },
  {
    type: 'aml',
    label: 'AML Certificate',
    description: 'Anti-Money Laundering certificate',
    url: null,
    dbField: 'aml_document_url',
  },
  {
    type: 'insurance',
    label: 'Insurance Certificate',
    description: 'Professional indemnity insurance',
    url: null,
    dbField: 'insurance_document_url',
  },
];

export type UserRole = 'INVESTOR' | 'SOURCER' | 'ADMIN';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'CANCELLED';
