import { v4 as uuidv4 } from 'uuid';
import { 
  UploadSession, 
  UploadedFile, 
  UploadSessionStatus, 
  CreateUploadSessionRequest 
} from '../types/upload-session';
import { logger } from '../config/logger';

export class UploadSessionMockService {
  private sessions: Map<string, UploadSession> = new Map();
  private files: Map<string, UploadedFile> = new Map();

  constructor() {
    // Initialize with some mock data
    this.initializeMockData();
  }

  private initializeMockData() {
    // Add some sample sessions for demo purposes
    const sampleSession: UploadSession = {
      id: 'session-1',
      uploadLinkId: 'sample-link-id',
      clientData: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '555-0123'
      },
      uploadedFiles: [],
      status: UploadSessionStatus.COMPLETED,
      submittedAt: new Date('2025-09-24T10:00:00Z'),
      createdAt: new Date('2025-09-24T09:30:00Z')
    };

    this.sessions.set(sampleSession.id, sampleSession);
    logger.info('Initialized upload session mock service with sample data');
  }

  async createSession(request: CreateUploadSessionRequest): Promise<string> {
    const sessionId = uuidv4();
    
    const session: UploadSession = {
      id: sessionId,
      uploadLinkId: request.uploadLinkId,
      clientData: request.clientData,
      uploadedFiles: [],
      status: UploadSessionStatus.IN_PROGRESS,
      submittedAt: new Date(),
      createdAt: new Date()
    };

    this.sessions.set(sessionId, session);
    
    logger.info(`Created upload session: ${sessionId} for link: ${request.uploadLinkId}`);
    return sessionId;
  }

  async getSession(sessionId: string): Promise<UploadSession | null> {
    return this.sessions.get(sessionId) || null;
  }

  async getSessionsByUploadLink(uploadLinkId: string): Promise<UploadSession[]> {
    return Array.from(this.sessions.values())
      .filter(session => session.uploadLinkId === uploadLinkId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async addFileToSession(
    sessionId: string, 
    fieldName: string, 
    file: {
      originalName: string;
      fileName: string;
      filePath: string;
      mimeType: string;
      fileSize: number;
    },
    documentType?: string
  ): Promise<string> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Upload session not found');
    }

    const fileId = uuidv4();
    const uploadedFile: UploadedFile = {
      id: fileId,
      sessionId,
      fieldName,
      originalName: file.originalName,
      fileName: file.fileName,
      filePath: file.filePath,
      mimeType: file.mimeType,
      fileSize: file.fileSize,
      documentType,
      uploadedAt: new Date()
    };

    this.files.set(fileId, uploadedFile);
    session.uploadedFiles.push(uploadedFile);
    
    logger.info(`Added file ${fileId} to session ${sessionId}: ${file.originalName}`);
    return fileId;
  }

  async updateSessionData(sessionId: string, formData: Record<string, any>): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Upload session not found');
    }

    session.clientData = { ...session.clientData, ...formData };
    logger.info(`Updated session data for ${sessionId}`);
  }

  async completeSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Upload session not found');
    }

    session.status = UploadSessionStatus.COMPLETED;
    session.submittedAt = new Date();
    
    logger.info(`Completed upload session: ${sessionId}`);
  }

  async getFile(fileId: string): Promise<UploadedFile | null> {
    return this.files.get(fileId) || null;
  }

  async getAllSessions(): Promise<UploadSession[]> {
    return Array.from(this.sessions.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async deleteSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Upload session not found');
    }

    // Remove associated files
    session.uploadedFiles.forEach(file => {
      this.files.delete(file.id);
    });

    this.sessions.delete(sessionId);
    logger.info(`Deleted upload session: ${sessionId}`);
  }
}