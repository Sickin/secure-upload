import { Router, Request } from 'express';
import formTemplateRoutes from './form-templates';
import { uploadLinkRoutes } from './upload-links';
import uploadSessionRoutes from './upload-sessions';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

const router = Router();

// Apply authentication middleware to all routes
// TODO: Re-enable authentication after implementing login system
// router.use(authenticate);

// Mount route modules
router.use('/form-templates', formTemplateRoutes);
router.use('/upload-links', uploadLinkRoutes);
router.use('/upload-sessions', uploadSessionRoutes);

// Health check endpoint for authenticated routes
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is working',
    environment: process.env.NODE_ENV || 'development'
  });
});

export default router;