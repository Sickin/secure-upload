import { Router } from 'express';
import { FormTemplateController } from '../controllers/form-template.controller';

const router = Router();
const formTemplateController = new FormTemplateController();

// Form Template Routes
router.get('/', formTemplateController.getAllTemplates);
router.get('/:id', formTemplateController.getTemplateById);
router.post('/', formTemplateController.createTemplate);
router.put('/:id', formTemplateController.updateTemplate);
router.delete('/:id', formTemplateController.deleteTemplate);

// Form Field Routes
router.post('/:id/fields', formTemplateController.addField);
router.put('/fields/:fieldId', formTemplateController.updateField);
router.delete('/fields/:fieldId', formTemplateController.deleteField);

export default router;