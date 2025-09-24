import { Router } from 'express';
import { UploadLinkController } from '../controllers/upload-link.controller';

const router = Router();
const uploadLinkController = new UploadLinkController();

// Upload link management routes (authenticated)
router.get('/', uploadLinkController.getAllLinks);
router.get('/stats', uploadLinkController.getDashboardStats);
router.get('/:id', uploadLinkController.getLinkById);
router.post('/', uploadLinkController.createLink);
router.put('/:id', uploadLinkController.updateLink);
router.delete('/:id', uploadLinkController.deleteLink);

// Public route for link validation (no auth required)
router.get('/:id/validate', uploadLinkController.validateLink);

export { router as uploadLinkRoutes };