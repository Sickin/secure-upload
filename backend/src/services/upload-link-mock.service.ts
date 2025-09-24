import { UploadLink, LinkStatus } from '../types';
import { v4 as uuidv4 } from 'uuid';

export interface CreateUploadLinkRequest {
  jobNumber: string;
  formTemplateId: string;
  expiresAt?: Date;
  clientEmail?: string;
}

export interface UpdateUploadLinkRequest {
  status?: LinkStatus;
  expiresAt?: Date;
  clientEmail?: string;
}

export class UploadLinkMockService {
  private links: Map<string, UploadLink> = new Map();

  constructor() {
    // Initialize with some sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const sampleLinks: UploadLink[] = [
      {
        id: '1',
        jobNumber: 'JOB001',
        formTemplateId: '1',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        createdBy: 'dev-user-1',
        status: LinkStatus.ACTIVE,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        clientEmail: 'client@example.com'
      },
      {
        id: '2',
        jobNumber: 'JOB002',
        formTemplateId: '2',
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        createdBy: 'dev-user-1',
        status: LinkStatus.ACTIVE,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        clientEmail: 'another.client@company.com'
      },
      {
        id: '3',
        jobNumber: 'JOB003',
        formTemplateId: '1',
        expiresAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago (expired)
        createdBy: 'dev-user-1',
        status: LinkStatus.EXPIRED,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        clientEmail: 'expired.client@test.com'
      }
    ];

    sampleLinks.forEach(link => {
      this.links.set(link.id, link);
    });
  }

  async getAllLinks(userId: string, userRole: string): Promise<UploadLink[]> {
    const links = Array.from(this.links.values());
    
    // Filter based on user role (for now, admin sees all, others see their own)
    if (userRole === 'admin' || userRole === 'compliance') {
      return links.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else {
      return links
        .filter(link => link.createdBy === userId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  }

  async getLinkById(id: string, userId: string, userRole: string): Promise<UploadLink | null> {
    const link = this.links.get(id);
    
    if (!link) {
      return null;
    }

    // Check access permissions
    if (userRole === 'admin' || userRole === 'compliance' || link.createdBy === userId) {
      return link;
    }

    throw new Error('Access denied to this upload link');
  }

  async getLinkByJobNumber(jobNumber: string): Promise<UploadLink | null> {
    const links = Array.from(this.links.values());
    return links.find(link => link.jobNumber === jobNumber) || null;
  }

  async createLink(linkData: CreateUploadLinkRequest, userId: string): Promise<string> {
    // Check if job number already exists
    const existingLink = await this.getLinkByJobNumber(linkData.jobNumber);
    if (existingLink) {
      throw new Error('A link for this job number already exists');
    }

    const id = uuidv4();
    const now = new Date();
    
    // Default expiration: 30 days from now
    const defaultExpiration = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const newLink: UploadLink = {
      id,
      jobNumber: linkData.jobNumber,
      formTemplateId: linkData.formTemplateId,
      expiresAt: linkData.expiresAt || defaultExpiration,
      createdBy: userId,
      status: LinkStatus.ACTIVE,
      createdAt: now,
      clientEmail: linkData.clientEmail
    };

    this.links.set(id, newLink);
    return id;
  }

  async updateLink(
    id: string, 
    updateData: UpdateUploadLinkRequest, 
    userId: string, 
    userRole: string
  ): Promise<void> {
    const link = await this.getLinkById(id, userId, userRole);
    
    if (!link) {
      throw new Error('Upload link not found');
    }

    // Update allowed fields
    if (updateData.status !== undefined) {
      link.status = updateData.status;
    }
    if (updateData.expiresAt !== undefined) {
      link.expiresAt = updateData.expiresAt;
    }
    if (updateData.clientEmail !== undefined) {
      link.clientEmail = updateData.clientEmail;
    }

    this.links.set(id, link);
  }

  async deleteLink(id: string, userId: string, userRole: string): Promise<void> {
    const link = await this.getLinkById(id, userId, userRole);
    
    if (!link) {
      throw new Error('Upload link not found');
    }

    // Check if user has permission to delete (only admin, compliance, or creator)
    if (userRole !== 'admin' && userRole !== 'compliance' && link.createdBy !== userId) {
      throw new Error('Access denied to delete this upload link');
    }

    this.links.delete(id);
  }

  async validateLink(id: string): Promise<{ isValid: boolean; link?: UploadLink; reason?: string }> {
    const link = this.links.get(id);
    
    if (!link) {
      return { isValid: false, reason: 'Link not found' };
    }

    if (link.status !== LinkStatus.ACTIVE) {
      return { isValid: false, reason: 'Link is not active', link };
    }

    if (link.expiresAt < new Date()) {
      // Auto-update expired links
      link.status = LinkStatus.EXPIRED;
      this.links.set(id, link);
      return { isValid: false, reason: 'Link has expired', link };
    }

    return { isValid: true, link };
  }

  async getActiveLinksCount(userId: string, userRole: string): Promise<number> {
    const links = await this.getAllLinks(userId, userRole);
    return links.filter(link => link.status === LinkStatus.ACTIVE).length;
  }

  async getExpiringLinks(userId: string, userRole: string, daysThreshold: number = 3): Promise<UploadLink[]> {
    const links = await this.getAllLinks(userId, userRole);
    const thresholdDate = new Date(Date.now() + daysThreshold * 24 * 60 * 60 * 1000);
    
    return links.filter(link => 
      link.status === LinkStatus.ACTIVE && 
      link.expiresAt <= thresholdDate
    );
  }
}