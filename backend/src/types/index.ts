export interface User {
  id: string;
  email: string;
  role: UserRole;
  managerId?: string;
  azureAdId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  COMPLIANCE = 'compliance',
  MANAGER = 'manager',
  RECRUITER = 'recruiter'
}

export interface FormTemplate {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  isActive: boolean;
  createdAt: Date;
  fields: FormField[];
}

export interface FormField {
  id: string;
  templateId: string;
  fieldType: FieldType;
  fieldName: string;
  label: string;
  isRequired: boolean;
  displayOrder: number;
  fieldOptions?: Record<string, any>;
  createdAt: Date;
}

export enum FieldType {
  TEXT = 'text',
  EMAIL = 'email',
  PHONE = 'phone',
  FILE = 'file',
  SELECT = 'select',
  CHECKBOX = 'checkbox',
  DATE = 'date',
  TEXTAREA = 'textarea'
}

export enum DocumentDataType {
  // Personal Identification
  DRIVERS_LICENSE = 'drivers_license',
  PASSPORT = 'passport',
  SSN_CARD = 'ssn_card',
  BIRTH_CERTIFICATE = 'birth_certificate',
  STATE_ID = 'state_id',
  
  // Financial Documents
  TAX_RETURN = 'tax_return',
  W2 = 'w2',
  PAYSTUB = 'paystub',
  BANK_STATEMENT = 'bank_statement',
  CREDIT_REPORT = 'credit_report',
  
  // Employment Documents
  EMPLOYMENT_VERIFICATION = 'employment_verification',
  RESUME = 'resume',
  REFERENCE_LETTER = 'reference_letter',
  BACKGROUND_CHECK = 'background_check',
  
  // Medical/Health Records
  MEDICAL_RECORD = 'medical_record',
  VACCINATION_RECORD = 'vaccination_record',
  INSURANCE_CARD = 'insurance_card',
  PRESCRIPTION = 'prescription',
  
  // Education Documents
  DIPLOMA = 'diploma',
  TRANSCRIPT = 'transcript',
  CERTIFICATE = 'certificate',
  
  // Legal Documents
  CONTRACT = 'contract',
  COURT_DOCUMENT = 'court_document',
  POWER_OF_ATTORNEY = 'power_of_attorney',
  WILL = 'will',
  
  // Property/Housing
  LEASE_AGREEMENT = 'lease_agreement',
  MORTGAGE_DOCUMENT = 'mortgage_document',
  PROPERTY_DEED = 'property_deed',
  UTILITY_BILL = 'utility_bill',
  
  // Immigration Documents
  VISA = 'visa',
  GREEN_CARD = 'green_card',
  WORK_PERMIT = 'work_permit',
  I9_FORM = 'i9_form',
  
  // Insurance Documents
  AUTO_INSURANCE = 'auto_insurance',
  HEALTH_INSURANCE = 'health_insurance',
  LIABILITY_INSURANCE = 'liability_insurance',
  
  // Other
  OTHER = 'other',
  GENERAL_DOCUMENT = 'general_document'
}

export interface UploadLink {
  id: string;
  jobNumber: string;
  formTemplateId: string;
  expiresAt: Date;
  createdBy: string;
  status: LinkStatus;
  createdAt: Date;
  clientEmail?: string;
}

export enum LinkStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  COMPLETED = 'completed',
  DISABLED = 'disabled'
}

export interface UploadSession {
  id: string;
  linkId: string;
  clientIp: string;
  userAgent?: string;
  sessionData?: Record<string, any>;
  status: SessionStatus;
  completedAt?: Date;
  createdAt: Date;
}

export enum SessionStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned'
}

export interface Document {
  id: string;
  sessionId: string;
  fieldId: string;
  originalFilename: string;
  storedFilename: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  checksum: string;
  encryptionKeyId?: string;
  metadata?: Record<string, any>;
  uploadedAt: Date;
}

export interface DocumentAccessLog {
  id: string;
  userId: string;
  documentId: string;
  action: AccessAction;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export enum AccessAction {
  VIEW = 'view',
  DOWNLOAD = 'download',
  DELETE = 'delete',
  SHARE = 'share'
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}