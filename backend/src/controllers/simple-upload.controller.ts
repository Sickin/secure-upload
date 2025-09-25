import { Request, Response } from 'express';
import { logger } from '../config/logger';

// Simple in-memory storage for demo
const sessions = new Map<string, any>();
const submissions = new Map<string, any>();

export class SimpleUploadController {
  
  // Create upload session
  createSession = async (req: Request, res: Response) => {
    try {
      const { uploadLinkId } = req.body;

      if (!uploadLinkId) {
        return res.status(400).json({
          success: false,
          error: 'Upload link ID is required'
        });
      }

      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      sessions.set(sessionId, {
        id: sessionId,
        uploadLinkId,
        createdAt: new Date(),
        status: 'active'
      });

      logger.info(`Created upload session: ${sessionId} for link: ${uploadLinkId}`);

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

  // Submit form data (simplified - no file uploads for now)
  submitForm = async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const formData = req.body;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error: 'Session ID is required'
        });
      }

      const session = sessions.get(sessionId);
      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Upload session not found'
        });
      }

      // Store the submission
      const submissionId = `submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      submissions.set(submissionId, {
        id: submissionId,
        sessionId,
        formData,
        submittedAt: new Date()
      });

      // Update session status
      session.status = 'completed';
      session.completedAt = new Date();

      logger.info(`Form submitted successfully for session: ${sessionId}`);
      logger.info('Form data:', formData);

      res.json({
        success: true,
        message: 'Form submitted successfully',
        data: {
          submissionId,
          sessionId,
          submittedData: formData
        }
      });

    } catch (error) {
      logger.error('Error submitting form:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to submit form'
      });
    }
  };

  // Get all submissions (for admin view)
  getAllSubmissions = async (req: Request, res: Response) => {
    try {
      const allSubmissions = Array.from(submissions.values()).map(submission => {
        const session = sessions.get(submission.sessionId);
        return {
          ...submission,
          session
        };
      });

      res.json({
        success: true,
        data: allSubmissions,
        count: allSubmissions.length
      });
    } catch (error) {
      logger.error('Error fetching submissions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch submissions'
      });
    }
  };

  // Get sessions for a specific upload link
  getSessionsForLink = async (req: Request, res: Response) => {
    try {
      const { linkId } = req.params;
      
      const linkSessions = Array.from(sessions.values())
        .filter(session => session.uploadLinkId === linkId);

      // Get submissions for these sessions
      const sessionsWithSubmissions = linkSessions.map(session => {
        const sessionSubmissions = Array.from(submissions.values())
          .filter(sub => sub.sessionId === session.id);
        
        return {
          ...session,
          submissions: sessionSubmissions
        };
      });

      res.json({
        success: true,
        data: sessionsWithSubmissions,
        count: sessionsWithSubmissions.length
      });
    } catch (error) {
      logger.error('Error fetching sessions for link:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch sessions'
      });
    }
  };
}