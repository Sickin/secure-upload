import { query } from '../config/database';
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

export class FormTemplateService {
  
  async getAllTemplates(userId: string, userRole: string): Promise<FormTemplate[]> {
    try {
      let query_text = `
        SELECT ft.* FROM form_templates ft 
        WHERE ft.is_active = true
        ORDER BY ft.created_at DESC
      `;
      
      // Non-admin users can only see their own templates or public ones
      if (userRole !== 'admin' && userRole !== 'compliance') {
        query_text = `
          SELECT ft.* FROM form_templates ft 
          WHERE ft.is_active = true AND ft.created_by = $1
          ORDER BY ft.created_at DESC
        `;
        const result = await query(query_text, [userId]);
        return result.rows;
      }
      
      const result = await query(query_text);
      return result.rows;
    } catch (error) {
      logger.error('Error fetching form templates:', error);
      throw new Error('Failed to fetch form templates');
    }
  }

  async getTemplateById(templateId: string, userId: string, userRole: string): Promise<FormTemplateWithFields | null> {
    try {
      // Get template
      const templateResult = await query(
        'SELECT * FROM form_templates WHERE id = $1',
        [templateId]
      );

      if (!templateResult.rows.length) {
        return null;
      }

      const template = templateResult.rows[0];

      // Check permissions
      if (userRole !== 'admin' && userRole !== 'compliance' && template.created_by !== userId) {
        throw new Error('Access denied to this template');
      }

      // Get fields
      const fieldsResult = await query(
        `SELECT * FROM form_fields 
         WHERE template_id = $1 
         ORDER BY display_order ASC`,
        [templateId]
      );

      return {
        ...template,
        fields: fieldsResult.rows
      };
    } catch (error) {
      logger.error('Error fetching form template:', error);
      throw error;
    }
  }

  async createTemplate(templateData: CreateFormTemplateRequest, userId: string): Promise<string> {
    const client = await query('BEGIN');
    
    try {
      // Create template
      const templateResult = await query(
        `INSERT INTO form_templates (name, description, created_by, is_active) 
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [templateData.name, templateData.description || null, userId, true]
      );

      const templateId = templateResult.rows[0].id;

      // Create fields
      for (const fieldData of templateData.fields) {
        await query(
          `INSERT INTO form_fields 
           (template_id, field_name, field_type, field_label, field_options, 
            is_required, validation_rules, display_order) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            templateId,
            fieldData.field_name,
            fieldData.field_type,
            fieldData.field_label,
            fieldData.field_options ? JSON.stringify(fieldData.field_options) : null,
            fieldData.is_required,
            fieldData.validation_rules ? JSON.stringify(fieldData.validation_rules) : null,
            fieldData.display_order
          ]
        );
      }

      await query('COMMIT');
      logger.info(`Created form template: ${templateData.name} by user: ${userId}`);
      return templateId;
    } catch (error) {
      await query('ROLLBACK');
      logger.error('Error creating form template:', error);
      throw new Error('Failed to create form template');
    }
  }

  async updateTemplate(templateId: string, updateData: UpdateFormTemplateRequest, userId: string, userRole: string): Promise<void> {
    try {
      // Check permissions
      const template = await this.getTemplateById(templateId, userId, userRole);
      if (!template) {
        throw new Error('Template not found');
      }

      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updateData.name !== undefined) {
        updates.push(`name = $${paramIndex++}`);
        values.push(updateData.name);
      }
      if (updateData.description !== undefined) {
        updates.push(`description = $${paramIndex++}`);
        values.push(updateData.description);
      }
      if (updateData.is_active !== undefined) {
        updates.push(`is_active = $${paramIndex++}`);
        values.push(updateData.is_active);
      }

      if (updates.length === 0) {
        return;
      }

      updates.push(`updated_at = NOW()`);
      values.push(templateId);

      await query(
        `UPDATE form_templates SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
        values
      );

      logger.info(`Updated form template: ${templateId} by user: ${userId}`);
    } catch (error) {
      logger.error('Error updating form template:', error);
      throw error;
    }
  }

  async deleteTemplate(templateId: string, userId: string, userRole: string): Promise<void> {
    try {
      // Check permissions and existence
      const template = await this.getTemplateById(templateId, userId, userRole);
      if (!template) {
        throw new Error('Template not found');
      }

      // Soft delete by marking as inactive
      await query(
        'UPDATE form_templates SET is_active = false, updated_at = NOW() WHERE id = $1',
        [templateId]
      );

      logger.info(`Deleted form template: ${templateId} by user: ${userId}`);
    } catch (error) {
      logger.error('Error deleting form template:', error);
      throw error;
    }
  }

  async addField(templateId: string, fieldData: CreateFormFieldRequest, userId: string, userRole: string): Promise<string> {
    try {
      // Check permissions
      const template = await this.getTemplateById(templateId, userId, userRole);
      if (!template) {
        throw new Error('Template not found');
      }

      const result = await query(
        `INSERT INTO form_fields 
         (template_id, field_name, field_type, field_label, field_options, 
          is_required, validation_rules, display_order) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
        [
          templateId,
          fieldData.field_name,
          fieldData.field_type,
          fieldData.field_label,
          fieldData.field_options ? JSON.stringify(fieldData.field_options) : null,
          fieldData.is_required,
          fieldData.validation_rules ? JSON.stringify(fieldData.validation_rules) : null,
          fieldData.display_order
        ]
      );

      logger.info(`Added field to template: ${templateId} by user: ${userId}`);
      return result.rows[0].id;
    } catch (error) {
      logger.error('Error adding form field:', error);
      throw new Error('Failed to add form field');
    }
  }

  async updateField(fieldId: string, updateData: UpdateFormFieldRequest, userId: string, userRole: string): Promise<void> {
    try {
      // Get field and check template permissions
      const fieldResult = await query('SELECT template_id FROM form_fields WHERE id = $1', [fieldId]);
      if (!fieldResult.rows.length) {
        throw new Error('Field not found');
      }

      const templateId = fieldResult.rows[0].template_id;
      await this.getTemplateById(templateId, userId, userRole); // This will throw if no permission

      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updateData.field_name !== undefined) {
        updates.push(`field_name = $${paramIndex++}`);
        values.push(updateData.field_name);
      }
      if (updateData.field_type !== undefined) {
        updates.push(`field_type = $${paramIndex++}`);
        values.push(updateData.field_type);
      }
      if (updateData.field_label !== undefined) {
        updates.push(`field_label = $${paramIndex++}`);
        values.push(updateData.field_label);
      }
      if (updateData.field_options !== undefined) {
        updates.push(`field_options = $${paramIndex++}`);
        values.push(JSON.stringify(updateData.field_options));
      }
      if (updateData.is_required !== undefined) {
        updates.push(`is_required = $${paramIndex++}`);
        values.push(updateData.is_required);
      }
      if (updateData.validation_rules !== undefined) {
        updates.push(`validation_rules = $${paramIndex++}`);
        values.push(JSON.stringify(updateData.validation_rules));
      }
      if (updateData.display_order !== undefined) {
        updates.push(`display_order = $${paramIndex++}`);
        values.push(updateData.display_order);
      }

      if (updates.length === 0) {
        return;
      }

      values.push(fieldId);

      await query(
        `UPDATE form_fields SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
        values
      );

      logger.info(`Updated form field: ${fieldId} by user: ${userId}`);
    } catch (error) {
      logger.error('Error updating form field:', error);
      throw error;
    }
  }

  async deleteField(fieldId: string, userId: string, userRole: string): Promise<void> {
    try {
      // Get field and check template permissions
      const fieldResult = await query('SELECT template_id FROM form_fields WHERE id = $1', [fieldId]);
      if (!fieldResult.rows.length) {
        throw new Error('Field not found');
      }

      const templateId = fieldResult.rows[0].template_id;
      await this.getTemplateById(templateId, userId, userRole); // This will throw if no permission

      await query('DELETE FROM form_fields WHERE id = $1', [fieldId]);
      
      logger.info(`Deleted form field: ${fieldId} by user: ${userId}`);
    } catch (error) {
      logger.error('Error deleting form field:', error);
      throw error;
    }
  }
}