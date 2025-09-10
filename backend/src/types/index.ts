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