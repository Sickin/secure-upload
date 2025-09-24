import { Request, Response } from 'express';
import { UploadLinkMockService as UploadLinkService } from '../services/upload-link-mock.service';
import { logger } from '../config/logger';

// Extend Request interface to include user info (will be set by auth middleware)
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class UploadLinkController {
  private uploadLinkService: UploadLinkService;

  constructor() {
    this.uploadLinkService = new UploadLinkService();
  }

  getAllLinks = async (req: AuthenticatedRequest, res: Response) => {
    try {
      // TODO: Re-enable authentication check after implementing login system
      // if (!req.user) {
      //   return res.status(401).json({ error: 'Authentication required' });
      // }

      // For development: use mock user data
      const mockUserId = 'dev-user-1';
      const mockUserRole = 'admin';

      const links = await this.uploadLinkService.getAllLinks(mockUserId, mockUserRole);

      res.json({
        success: true,
        data: links,
        count: links.length
      });
    } catch (error) {
      logger.error('Error in getAllLinks:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch upload links'
      });
    }
  };

  getLinkById = async (req: AuthenticatedRequest, res: Response) => {
    try {
      // TODO: Re-enable authentication check after implementing login system
      // if (!req.user) {
      //   return res.status(401).json({ error: 'Authentication required' });
      // }

      // For development: use mock user data
      const mockUserId = 'dev-user-1';
      const mockUserRole = 'admin';

      const { id } = req.params;
      const link = await this.uploadLinkService.getLinkById(id, mockUserId, mockUserRole);

      if (!link) {
        return res.status(404).json({
          success: false,
          error: 'Upload link not found'
        });
      }

      res.json({
        success: true,
        data: link
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Access denied to this upload link') {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      logger.error('Error in getLinkById:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch upload link'
      });
    }
  };

  createLink = async (req: AuthenticatedRequest, res: Response) => {
    try {
      // TODO: Re-enable authentication check after implementing login system
      // if (!req.user) {
      //   return res.status(401).json({ error: 'Authentication required' });
      // }

      // TODO: Re-enable permission check after implementing login system
      // if (!['admin', 'compliance', 'manager', 'recruiter'].includes(req.user.role)) {
      //   return res.status(403).json({
      //     success: false,
      //     error: 'Insufficient permissions to create upload links'
      //   });
      // }

      // For development: use mock user data
      const mockUserId = 'dev-user-1';

      const { jobNumber, formTemplateId, expiresAt, clientEmail } = req.body;

      // Basic validation
      if (!jobNumber || !formTemplateId) {
        return res.status(400).json({
          success: false,
          error: 'Job number and form template ID are required'
        });
      }

      // Validate expiration date if provided
      if (expiresAt) {
        const expirationDate = new Date(expiresAt);
        if (isNaN(expirationDate.getTime()) || expirationDate <= new Date()) {
          return res.status(400).json({
            success: false,
            error: 'Invalid expiration date - must be a future date'
          });
        }
      }

      // Validate email format if provided
      if (clientEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(clientEmail)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid email format'
          });
        }
      }

      const linkId = await this.uploadLinkService.createLink(
        {
          jobNumber,
          formTemplateId,
          expiresAt: expiresAt ? new Date(expiresAt) : undefined,
          clientEmail
        },
        mockUserId
      );

      // Generate the public upload URL
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const uploadUrl = `${baseUrl}/upload/${linkId}`;

      res.status(201).json({
        success: true,
        data: { 
          id: linkId,
          uploadUrl 
        },
        message: 'Upload link created successfully'
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'A link for this job number already exists') {
        return res.status(409).json({
          success: false,
          error: 'A link for this job number already exists'
        });
      }

      logger.error('Error in createLink:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create upload link'
      });
    }
  };

  updateLink = async (req: AuthenticatedRequest, res: Response) => {
    try {
      // TODO: Re-enable authentication check after implementing login system
      // if (!req.user) {
      //   return res.status(401).json({ error: 'Authentication required' });
      // }

      // For development: use mock user data
      const mockUserId = 'dev-user-1';
      const mockUserRole = 'admin';

      const { id } = req.params;
      const updateData = req.body;

      // Validate expiration date if provided
      if (updateData.expiresAt) {
        const expirationDate = new Date(updateData.expiresAt);
        if (isNaN(expirationDate.getTime()) || expirationDate <= new Date()) {
          return res.status(400).json({
            success: false,
            error: 'Invalid expiration date - must be a future date'
          });
        }
        updateData.expiresAt = expirationDate;
      }

      // Validate email format if provided
      if (updateData.clientEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(updateData.clientEmail)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid email format'
          });
        }
      }

      await this.uploadLinkService.updateLink(id, updateData, mockUserId, mockUserRole);

      res.json({
        success: true,
        message: 'Upload link updated successfully'
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Upload link not found') {
        return res.status(404).json({
          success: false,
          error: 'Upload link not found'
        });
      }

      if (error instanceof Error && error.message === 'Access denied to this upload link') {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      logger.error('Error in updateLink:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update upload link'
      });
    }
  };

  deleteLink = async (req: AuthenticatedRequest, res: Response) => {
    try {
      // TODO: Re-enable authentication check after implementing login system
      // if (!req.user) {
      //   return res.status(401).json({ error: 'Authentication required' });
      // }

      // For development: use mock user data
      const mockUserId = 'dev-user-1';
      const mockUserRole = 'admin';

      const { id } = req.params;

      await this.uploadLinkService.deleteLink(id, mockUserId, mockUserRole);

      res.json({
        success: true,
        message: 'Upload link deleted successfully'
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Upload link not found') {
        return res.status(404).json({
          success: false,
          error: 'Upload link not found'
        });
      }

      if (error instanceof Error && error.message === 'Access denied to delete this upload link') {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      logger.error('Error in deleteLink:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete upload link'
      });
    }
  };

  validateLink = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const validation = await this.uploadLinkService.validateLink(id);

      res.json({
        success: true,
        data: validation
      });
    } catch (error) {
      logger.error('Error in validateLink:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to validate upload link'
      });
    }
  };

  getDashboardStats = async (req: AuthenticatedRequest, res: Response) => {
    try {
      // TODO: Re-enable authentication check after implementing login system
      // if (!req.user) {
      //   return res.status(401).json({ error: 'Authentication required' });
      // }

      // For development: use mock user data
      const mockUserId = 'dev-user-1';
      const mockUserRole = 'admin';

      const [activeCount, expiringLinks] = await Promise.all([
        this.uploadLinkService.getActiveLinksCount(mockUserId, mockUserRole),
        this.uploadLinkService.getExpiringLinks(mockUserId, mockUserRole, 3)
      ]);

      res.json({
        success: true,
        data: {
          activeLinksCount: activeCount,
          expiringLinksCount: expiringLinks.length,
          expiringLinks: expiringLinks
        }
      });
    } catch (error) {
      logger.error('Error in getDashboardStats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch dashboard statistics'
      });
    }
  };
}