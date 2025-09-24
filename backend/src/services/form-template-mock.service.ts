import { logger } from '../config/logger';
import { 
  FormTemplate, 
  FormField, 
  FormTemplateWithFields,
  CreateFormTemplateRequest,
  CreateFormFieldRequest,
  UpdateFormTemplateRequest,
  UpdateFormFieldRequest
} from '../types/form-template';
import { DocumentDataType } from '../types';

// Mock data storage
let mockTemplates: FormTemplateWithFields[] = [
  {
    id: '1',
    name: 'Employee Onboarding Form',
    description: 'Standard form for new employee document collection',
    created_by: 'dev-user-1',
    is_active: true,
    created_at: new Date('2024-01-15'),
    updated_at: new Date('2024-01-15'),
    fields: [
      {
        id: '1',
        template_id: '1',
        field_name: 'full_name',
        field_type: 'text',
        field_label: 'Full Name',
        field_options: undefined,
        is_required: true,
        validation_rules: undefined,
        display_order: 1,
        created_at: new Date('2024-01-15')
      },
      {
        id: '2',
        template_id: '1',
        field_name: 'email',
        field_type: 'email',
        field_label: 'Email Address',
        field_options: undefined,
        is_required: true,
        validation_rules: undefined,
        display_order: 2,
        created_at: new Date('2024-01-15')
      },
      {
        id: '3',
        template_id: '1',
        field_name: 'id_document',
        field_type: 'file',
        field_label: 'ID Document',
        field_options: { helpText: 'Upload ID document (JPG, PNG, or PDF)' },
        is_required: true,
        validation_rules: undefined,
        display_order: 3,
        created_at: new Date('2024-01-15'),
        document_data_type: DocumentDataType.DRIVERS_LICENSE
      }
    ]
  },
  {
    id: '2',
    name: 'Compliance Documents',
    description: 'Required compliance documentation for financial services',
    created_by: 'dev-user-1',
    is_active: true,
    created_at: new Date('2024-01-20'),
    updated_at: new Date('2024-01-20'),
    fields: [
      {
        id: '4',
        template_id: '2',
        field_name: 'company_name',
        field_type: 'text',
        field_label: 'Company Name',
        field_options: undefined,
        is_required: true,
        validation_rules: undefined,
        display_order: 1,
        created_at: new Date('2024-01-20')
      },
      {
        id: '5',
        template_id: '2',
        field_name: 'tax_certificate',
        field_type: 'file',
        field_label: 'Tax Certificate',
        field_options: { helpText: 'Upload tax certificate (PDF only)' },
        is_required: true,
        validation_rules: undefined,
        display_order: 2,
        created_at: new Date('2024-01-20'),
        document_data_type: DocumentDataType.TAX_RETURN
      }
    ]
  }
];

export class FormTemplateMockService {
  
  async getAllTemplates(userId: string, userRole: string): Promise<FormTemplate[]> {
    try {
      // For mock service, return all templates as simple FormTemplate objects (without fields)
      const templates = mockTemplates.map(template => {
        const { fields, ...templateOnly } = template;
        return templateOnly;
      });
      
      // Filter by user role if needed
      if (userRole !== 'admin' && userRole !== 'compliance') {
        return templates.filter(template => template.created_by === userId);
      }
      
      logger.info(`Mock: Retrieved ${templates.length} form templates for user ${userId}`);
      return templates;
    } catch (error) {
      logger.error('Error fetching form templates:', error);
      throw new Error('Failed to fetch form templates');
    }
  }

  async getTemplateById(templateId: string, userId: string, userRole: string): Promise<FormTemplateWithFields | null> {
    try {
      const template = mockTemplates.find(t => t.id === templateId);
      
      if (!template) {
        return null;
      }

      // Check permissions
      if (userRole !== 'admin' && userRole !== 'compliance' && template.created_by !== userId) {
        throw new Error('Access denied to this template');
      }

      logger.info(`Mock: Retrieved template ${templateId} for user ${userId}`);
      return template;
    } catch (error) {
      logger.error('Error fetching form template:', error);
      throw error;
    }
  }

  async createTemplate(templateData: CreateFormTemplateRequest, userId: string): Promise<string> {
    try {
      const templateId = String(mockTemplates.length + 1);
      const now = new Date();
      
      const newTemplate: FormTemplateWithFields = {
        id: templateId,
        name: templateData.name,
        description: templateData.description,
        created_by: userId,
        is_active: true,
        created_at: now,
        updated_at: now,
        fields: templateData.fields.map((fieldData, index) => ({
          id: String(Date.now() + index),
          template_id: templateId,
          field_name: fieldData.field_name,
          field_type: fieldData.field_type,
          field_label: fieldData.field_label,
          field_options: fieldData.field_options,
          is_required: fieldData.is_required,
          validation_rules: fieldData.validation_rules,
          display_order: fieldData.display_order,
          created_at: now,
          document_data_type: fieldData.document_data_type
        }))
      };

      mockTemplates.push(newTemplate);
      logger.info(`Mock: Created form template: ${templateData.name} by user: ${userId}`);
      return templateId;
    } catch (error) {
      logger.error('Error creating form template:', error);
      throw new Error('Failed to create form template');
    }
  }

  async updateTemplate(templateId: string, updateData: UpdateFormTemplateRequest, userId: string, userRole: string): Promise<void> {
    try {
      const template = await this.getTemplateById(templateId, userId, userRole);
      if (!template) {
        throw new Error('Template not found');
      }

      const templateIndex = mockTemplates.findIndex(t => t.id === templateId);
      if (templateIndex >= 0) {
        if (updateData.name !== undefined) {
          mockTemplates[templateIndex].name = updateData.name;
        }
        if (updateData.description !== undefined) {
          mockTemplates[templateIndex].description = updateData.description;
        }
        if (updateData.is_active !== undefined) {
          mockTemplates[templateIndex].is_active = updateData.is_active;
        }
        mockTemplates[templateIndex].updated_at = new Date();
      }

      logger.info(`Mock: Updated form template: ${templateId} by user: ${userId}`);
    } catch (error) {
      logger.error('Error updating form template:', error);
      throw error;
    }
  }

  async deleteTemplate(templateId: string, userId: string, userRole: string): Promise<void> {
    try {
      const template = await this.getTemplateById(templateId, userId, userRole);
      if (!template) {
        throw new Error('Template not found');
      }

      const templateIndex = mockTemplates.findIndex(t => t.id === templateId);
      if (templateIndex >= 0) {
        mockTemplates[templateIndex].is_active = false;
        mockTemplates[templateIndex].updated_at = new Date();
      }

      logger.info(`Mock: Deleted form template: ${templateId} by user: ${userId}`);
    } catch (error) {
      logger.error('Error deleting form template:', error);
      throw error;
    }
  }

  async addField(templateId: string, fieldData: CreateFormFieldRequest, userId: string, userRole: string): Promise<string> {
    try {
      const template = await this.getTemplateById(templateId, userId, userRole);
      if (!template) {
        throw new Error('Template not found');
      }

      const fieldId = String(Date.now());
      const newField: FormField = {
        id: fieldId,
        template_id: templateId,
        field_name: fieldData.field_name,
        field_type: fieldData.field_type,
        field_label: fieldData.field_label,
        field_options: fieldData.field_options,
        is_required: fieldData.is_required,
        validation_rules: fieldData.validation_rules,
        display_order: fieldData.display_order,
        created_at: new Date(),
        document_data_type: fieldData.document_data_type
      };

      const templateIndex = mockTemplates.findIndex(t => t.id === templateId);
      if (templateIndex >= 0) {
        mockTemplates[templateIndex].fields.push(newField);
      }

      logger.info(`Mock: Added field to template: ${templateId} by user: ${userId}`);
      return fieldId;
    } catch (error) {
      logger.error('Error adding form field:', error);
      throw new Error('Failed to add form field');
    }
  }

  async updateField(fieldId: string, updateData: UpdateFormFieldRequest, userId: string, userRole: string): Promise<void> {
    try {
      // Find field and template
      let targetTemplate: FormTemplateWithFields | null = null;
      let targetField: FormField | null = null;
      
      for (const template of mockTemplates) {
        const field = template.fields.find(f => f.id === fieldId);
        if (field) {
          targetTemplate = template;
          targetField = field;
          break;
        }
      }

      if (!targetField || !targetTemplate) {
        throw new Error('Field not found');
      }

      // Check permissions
      await this.getTemplateById(targetTemplate.id, userId, userRole);

      // Update field
      if (updateData.field_name !== undefined) {
        targetField.field_name = updateData.field_name;
      }
      if (updateData.field_type !== undefined) {
        targetField.field_type = updateData.field_type;
      }
      if (updateData.field_label !== undefined) {
        targetField.field_label = updateData.field_label;
      }
      if (updateData.field_options !== undefined) {
        targetField.field_options = updateData.field_options;
      }
      if (updateData.is_required !== undefined) {
        targetField.is_required = updateData.is_required;
      }
      if (updateData.validation_rules !== undefined) {
        targetField.validation_rules = updateData.validation_rules;
      }
      if (updateData.display_order !== undefined) {
        targetField.display_order = updateData.display_order;
      }
      if (updateData.document_data_type !== undefined) {
        targetField.document_data_type = updateData.document_data_type;
      }

      logger.info(`Mock: Updated form field: ${fieldId} by user: ${userId}`);
    } catch (error) {
      logger.error('Error updating form field:', error);
      throw error;
    }
  }

  async deleteField(fieldId: string, userId: string, userRole: string): Promise<void> {
    try {
      // Find field and template
      let targetTemplate: FormTemplateWithFields | null = null;
      let fieldIndex = -1;
      
      for (const template of mockTemplates) {
        fieldIndex = template.fields.findIndex(f => f.id === fieldId);
        if (fieldIndex >= 0) {
          targetTemplate = template;
          break;
        }
      }

      if (fieldIndex < 0 || !targetTemplate) {
        throw new Error('Field not found');
      }

      // Check permissions
      await this.getTemplateById(targetTemplate.id, userId, userRole);

      // Remove field
      targetTemplate.fields.splice(fieldIndex, 1);
      
      logger.info(`Mock: Deleted form field: ${fieldId} by user: ${userId}`);
    } catch (error) {
      logger.error('Error deleting form field:', error);
      throw error;
    }
  }
}