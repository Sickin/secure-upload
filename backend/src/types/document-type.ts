export interface DocumentType {
  id: string;
  name: string;
  description?: string;
  category: DocumentCategory;
  allowed_extensions: string[];
  max_file_size: number;
  validation_rules?: ValidationRules;
  is_active: boolean;
  sort_order: number;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export type DocumentCategory = 
  | 'identity'
  | 'employment' 
  | 'financial'
  | 'legal'
  | 'medical'
  | 'education'
  | 'other';

export interface ValidationRules {
  require_readable_text?: boolean;
  require_color?: boolean;
  min_resolution?: { width: number; height: number };
  max_age_days?: number;
  required_fields?: string[];
}

export interface CreateDocumentTypeRequest {
  name: string;
  description?: string;
  category: DocumentCategory;
  allowed_extensions: string[];
  max_file_size: number;
  validation_rules?: ValidationRules;
  is_active?: boolean;
  sort_order?: number;
}

export interface UpdateDocumentTypeRequest {
  name?: string;
  description?: string;
  category?: DocumentCategory;
  allowed_extensions?: string[];
  max_file_size?: number;
  validation_rules?: ValidationRules;
  is_active?: boolean;
  sort_order?: number;
}

export interface FormFieldDocumentType {
  id: string;
  field_id: string;
  document_type_id: string;
  is_required: boolean;
  display_order: number;
  created_at: Date;
  document_type?: DocumentType;
}

export interface CreateFormFieldDocumentTypeRequest {
  document_type_id: string;
  is_required: boolean;
  display_order: number;
}

export const DOCUMENT_CATEGORIES: { value: DocumentCategory; label: string; description: string }[] = [
  { value: 'identity', label: 'Identity Documents', description: 'Government IDs, passports, birth certificates' },
  { value: 'employment', label: 'Employment Documents', description: 'Resumes, work permits, employment verification' },
  { value: 'financial', label: 'Financial Documents', description: 'Bank statements, tax forms, pay stubs' },
  { value: 'legal', label: 'Legal Documents', description: 'Contracts, court orders, legal agreements' },
  { value: 'medical', label: 'Medical Documents', description: 'Health records, medical certificates' },
  { value: 'education', label: 'Educational Documents', description: 'Diplomas, transcripts, certificates' },
  { value: 'other', label: 'Other Documents', description: 'Miscellaneous document types' },
];