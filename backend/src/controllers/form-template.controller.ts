import { Request, Response } from 'express';
// TODO: Switch back to real service when database is set up
// import { FormTemplateService } from '../services/form-template.service';
import { FormTemplateMockService as FormTemplateService } from '../services/form-template-mock.service';
import { logger } from '../config/logger';

// Extend Request interface to include user info (will be set by auth middleware)
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class FormTemplateController {
  private formTemplateService: FormTemplateService;

  constructor() {
    this.formTemplateService = new FormTemplateService();
  }

  getAllTemplates = async (req: AuthenticatedRequest, res: Response) => {
    try {
      // TODO: Re-enable authentication check after implementing login system
      // if (!req.user) {
      //   return res.status(401).json({ error: 'Authentication required' });
      // }

      // For development: use mock user data
      const mockUserId = 'dev-user-1';
      const mockUserRole = 'admin';

      const templates = await this.formTemplateService.getAllTemplates(
        mockUserId, 
        mockUserRole
      );

      res.json({
        success: true,
        data: templates,
        count: templates.length
      });
    } catch (error) {
      logger.error('Error in getAllTemplates:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch form templates'
      });
    }
  };

  getTemplateById = async (req: AuthenticatedRequest, res: Response) => {
    try {
      // TODO: Re-enable authentication check after implementing login system
      // if (!req.user) {
      //   return res.status(401).json({ error: 'Authentication required' });
      // }

      // For development: use mock user data
      const mockUserId = 'dev-user-1';
      const mockUserRole = 'admin';

      const { id } = req.params;
      const template = await this.formTemplateService.getTemplateById(
        id, 
        mockUserId, 
        mockUserRole
      );

      if (!template) {
        return res.status(404).json({
          success: false,
          error: 'Form template not found'
        });
      }

      res.json({
        success: true,
        data: template
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Access denied to this template') {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      logger.error('Error in getTemplateById:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch form template'
      });
    }
  };

  createTemplate = async (req: AuthenticatedRequest, res: Response) => {
    try {
      // TODO: Re-enable authentication check after implementing login system
      // if (!req.user) {
      //   return res.status(401).json({ error: 'Authentication required' });
      // }

      // TODO: Re-enable permission check after implementing login system
      // if (!['admin', 'compliance', 'manager'].includes(req.user.role)) {
      //   return res.status(403).json({
      //     success: false,
      //     error: 'Insufficient permissions to create templates'
      //   });
      // }

      // For development: use mock user data
      const mockUserId = 'dev-user-1';

      const { name, description, fields } = req.body;

      // Basic validation
      if (!name || !fields || !Array.isArray(fields) || fields.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Name and at least one field are required'
        });
      }

      // Validate fields
      for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        if (!field.field_name || !field.field_type || !field.field_label) {
          return res.status(400).json({
            success: false,
            error: `Field ${i + 1} is missing required properties`
          });
        }
      }

      const templateId = await this.formTemplateService.createTemplate(
        { name, description, fields },
        mockUserId
      );

      res.status(201).json({
        success: true,
        data: { id: templateId },
        message: 'Form template created successfully'
      });
    } catch (error) {
      logger.error('Error in createTemplate:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create form template'
      });
    }
  };

  updateTemplate = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { id } = req.params;
      const updateData = req.body;

      await this.formTemplateService.updateTemplate(
        id, 
        updateData, 
        req.user.id, 
        req.user.role
      );

      res.json({
        success: true,
        message: 'Form template updated successfully'
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Template not found') {
        return res.status(404).json({
          success: false,
          error: 'Form template not found'
        });
      }

      logger.error('Error in updateTemplate:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update form template'
      });
    }
  };

  deleteTemplate = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { id } = req.params;

      await this.formTemplateService.deleteTemplate(
        id, 
        req.user.id, 
        req.user.role
      );

      res.json({
        success: true,
        message: 'Form template deleted successfully'
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Template not found') {
        return res.status(404).json({
          success: false,
          error: 'Form template not found'
        });
      }

      logger.error('Error in deleteTemplate:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete form template'
      });
    }
  };

  addField = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { id } = req.params;
      const fieldData = req.body;

      // Basic validation
      if (!fieldData.field_name || !fieldData.field_type || !fieldData.field_label) {
        return res.status(400).json({
          success: false,
          error: 'Field name, type, and label are required'
        });
      }

      const fieldId = await this.formTemplateService.addField(
        id, 
        fieldData, 
        req.user.id, 
        req.user.role
      );

      res.status(201).json({
        success: true,
        data: { id: fieldId },
        message: 'Field added successfully'
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Template not found') {
        return res.status(404).json({
          success: false,
          error: 'Form template not found'
        });
      }

      logger.error('Error in addField:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add field'
      });
    }
  };

  updateField = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { fieldId } = req.params;
      const updateData = req.body;

      await this.formTemplateService.updateField(
        fieldId, 
        updateData, 
        req.user.id, 
        req.user.role
      );

      res.json({
        success: true,
        message: 'Field updated successfully'
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Field not found') {
        return res.status(404).json({
          success: false,
          error: 'Field not found'
        });
      }

      logger.error('Error in updateField:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update field'
      });
    }
  };

  deleteField = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { fieldId } = req.params;

      await this.formTemplateService.deleteField(
        fieldId, 
        req.user.id, 
        req.user.role
      );

      res.json({
        success: true,
        message: 'Field deleted successfully'
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Field not found') {
        return res.status(404).json({
          success: false,
          error: 'Field not found'
        });
      }

      logger.error('Error in deleteField:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete field'
      });
    }
  };
}