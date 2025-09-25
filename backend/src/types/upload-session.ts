export interface UploadSession {
  id: string;
  uploadLinkId: string;
  clientData: Record<string, any>;
  uploadedFiles: UploadedFile[];
  status: UploadSessionStatus;
  submittedAt: Date;
  createdAt: Date;
}

export interface UploadedFile {
  id: string;
  sessionId: string;
  fieldName: string;
  originalName: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  documentType?: string;
  uploadedAt: Date;
}

export enum UploadSessionStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface CreateUploadSessionRequest {
  uploadLinkId: string;
  clientData: Record<string, any>;
}

export interface SubmitUploadRequest {
  sessionId: string;
  formData: Record<string, any>;
}

export interface FileUploadResponse {
  success: boolean;
  fileId?: string;
  fileName?: string;
  error?: string;
}

export interface UploadSessionResponse {
  success: boolean;
  sessionId?: string;
  uploadUrl?: string;
  error?: string;
}