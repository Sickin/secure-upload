import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { UploadSessionMockService } from '../services/upload-session-mock.service';
import { UploadLinkMockService } from '../services/upload-link-mock.service';
import { FormTemplateMockService } from '../services/form-template-mock.service';
import { logger } from '../config/logger';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // In production, this would be a secure upload directory
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter with document type validation
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const fieldName = file.fieldname;
  const documentType = req.body[`${fieldName}_document_type`];
  
  // Define allowed file types based on document type
  const documentTypeFileTypes: Record<string, string[]> = {
    'drivers_license': ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
    'passport': ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
    'medical_record': ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
    'tax_return': ['application/pdf'],
    'bank_statement': ['application/pdf'],
    'contract': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    'resume': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    'general_document': ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  };

  // If document type is specified, validate file type
  if (documentType && documentTypeFileTypes[documentType]) {
    const allowedTypes = documentTypeFileTypes[documentType];
    if (!allowedTypes.includes(file.mimetype)) {
      const error = new Error(`Invalid file type for ${documentType}. Allowed types: ${allowedTypes.join(', ')}`);
      return cb(error, false);
    }
  }

  // General file size limit (10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size && file.size > maxSize) {
    const error = new Error('File size too large. Maximum size is 10MB.');
    return cb(error, false);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 20 // Maximum 20 files per request
  }
});

export class UploadSessionController {
  private uploadSessionService: UploadSessionMockService;
  private uploadLinkService: UploadLinkMockService;
  private formTemplateService: FormTemplateMockService;

  constructor() {
    this.uploadSessionService = new UploadSessionMockService();
    this.uploadLinkService = new UploadLinkMockService();
    this.formTemplateService = new FormTemplateMockService();
  }

  // Create a new upload session
  createSession = async (req: Request, res: Response) => {
    try {
      const { uploadLinkId } = req.body;

      if (!uploadLinkId) {
        return res.status(400).json({
          success: false,
          error: 'Upload link ID is required'
        });
      }

      // Validate upload link
      const linkValidation = await this.uploadLinkService.validateLink(uploadLinkId);
      if (!linkValidation.isValid) {
        return res.status(400).json({
          success: false,
          error: linkValidation.reason || 'Invalid upload link'
        });
      }

      const sessionId = await this.uploadSessionService.createSession({
        uploadLinkId,
        clientData: {}
      });

      res.json({
        success: true,
        sessionId,
        message: 'Upload session created successfully'
      });
    } catch (error) {
      logger.error('Error creating upload session:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create upload session'
      });
    }
  };

  // Submit form data and files
  submitForm = async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const formData = req.body;
      const files = req.files as Express.Multer.File[];

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error: 'Session ID is required'
        });
      }

      // Get the upload session
      const session = await this.uploadSessionService.getSession(sessionId);
      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Upload session not found'
        });
      }

      // Validate the upload link is still valid
      const linkValidation = await this.uploadLinkService.validateLink(session.uploadLinkId);
      if (!linkValidation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Upload link is no longer valid'
        });
      }

      // Get the form template to understand field requirements
      const formTemplate = await this.formTemplateService.getTemplateWithFields(
        linkValidation.link!.formTemplateId
      );

      if (!formTemplate) {
        return res.status(404).json({
          success: false,
          error: 'Form template not found'
        });
      }

      // Process uploaded files
      const uploadedFiles = [];
      if (files && files.length > 0) {
        for (const file of files) {
          const fieldName = file.fieldname;
          
          // Find the corresponding form field
          const formField = formTemplate.fields.find(f => f.field_name === fieldName);
          const documentType = formField?.document_data_type || formData[`${fieldName}_document_type`];

          const fileId = await this.uploadSessionService.addFileToSession(
            sessionId,
            fieldName,
            {
              originalName: file.originalname,
              fileName: file.filename,
              filePath: file.path,
              mimeType: file.mimetype,
              fileSize: file.size
            },
            documentType
          );

          uploadedFiles.push({
            fileId,
            fieldName,
            originalName: file.originalname,
            documentType
          });
        }
      }

      // Update session with form data (excluding file fields)
      const cleanFormData = { ...formData };
      // Remove multer-specific fields and document type indicators
      Object.keys(cleanFormData).forEach(key => {
        if (key.endsWith('_document_type') || key.startsWith('_')) {
          delete cleanFormData[key];
        }
      });

      await this.uploadSessionService.updateSessionData(sessionId, cleanFormData);
      await this.uploadSessionService.completeSession(sessionId);

      res.json({
        success: true,
        message: 'Form submitted successfully',
        data: {
          sessionId,
          uploadedFiles,
          submittedData: cleanFormData
        }
      });

    } catch (error) {
      logger.error('Error submitting form:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit form'
      });
    }
  };

  // Get all sessions for an upload link (admin view)
  getSessionsForLink = async (req: Request, res: Response) => {
    try {
      const { linkId } = req.params;

      const sessions = await this.uploadSessionService.getSessionsByUploadLink(linkId);
      
      res.json({
        success: true,
        data: sessions,
        count: sessions.length
      });
    } catch (error) {
      logger.error('Error fetching sessions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch sessions'
      });
    }
  };

  // Get session details
  getSession = async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;

      const session = await this.uploadSessionService.getSession(sessionId);
      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Session not found'
        });
      }

      res.json({
        success: true,
        data: session
      });
    } catch (error) {
      logger.error('Error fetching session:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch session'
      });
    }
  };

  // Get all sessions (admin overview)
  getAllSessions = async (req: Request, res: Response) => {
    try {
      const sessions = await this.uploadSessionService.getAllSessions();
      
      res.json({
        success: true,
        data: sessions,
        count: sessions.length
      });
    } catch (error) {
      logger.error('Error fetching all sessions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch sessions'
      });
    }
  };

  // Middleware to handle file uploads
  uploadMiddleware = upload.any();
}