export interface FormTemplate {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface FormField {
  id: string;
  template_id: string;
  field_name: string;
  field_type: FormFieldType;
  field_label: string;
  field_options?: FormFieldOptions;
  is_required: boolean;
  validation_rules?: ValidationRules;
  display_order: number;
  created_at: Date;
}

export type FormFieldType = 
  | 'text' 
  | 'email' 
  | 'phone' 
  | 'date' 
  | 'select' 
  | 'multiselect' 
  | 'file' 
  | 'textarea' 
  | 'checkbox' 
  | 'radio'
  | 'number';

export interface FormFieldOptions {
  options?: SelectOption[];
  placeholder?: string;
  helpText?: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface ValidationRules {
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  pattern?: string;
  format?: 'email' | 'phone' | 'date';
  allowedTypes?: string[];
  maxSize?: number;
  minAge?: number;
  required?: boolean;
}

export interface CreateFormTemplateRequest {
  name: string;
  description?: string;
  fields: CreateFormFieldRequest[];
}

export interface CreateFormFieldRequest {
  field_name: string;
  field_type: FormFieldType;
  field_label: string;
  field_options?: FormFieldOptions;
  is_required: boolean;
  validation_rules?: ValidationRules;
  display_order: number;
}

export interface UpdateFormTemplateRequest {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateFormFieldRequest {
  field_name?: string;
  field_type?: FormFieldType;
  field_label?: string;
  field_options?: FormFieldOptions;
  is_required?: boolean;
  validation_rules?: ValidationRules;
  display_order?: number;
}

export interface FormTemplateWithFields extends FormTemplate {
  fields: FormField[];
}