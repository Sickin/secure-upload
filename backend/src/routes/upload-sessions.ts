import { Router } from 'express';
import { SimpleUploadController } from '../controllers/simple-upload.controller';

const router = Router();
const simpleUploadController = new SimpleUploadController();

// Create new upload session
router.post('/', simpleUploadController.createSession);

// Submit form for a session
router.post('/:sessionId/submit', simpleUploadController.submitForm);

// Get sessions for a specific upload link (admin)
router.get('/link/:linkId', simpleUploadController.getSessionsForLink);

// Get all submissions (admin)
router.get('/submissions', simpleUploadController.getAllSubmissions);

export default router;