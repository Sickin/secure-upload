import { query } from '../src/config/database';
import { logger } from '../src/config/logger';

export async function seedFormTemplates() {
  try {
    logger.info('Seeding initial form templates...');

    // Check if form templates already exist
    const existingTemplates = await query('SELECT COUNT(*) FROM form_templates');
    if (parseInt(existingTemplates.rows[0].count) > 0) {
      logger.info('Form templates already exist, skipping template seeding');
      return;
    }

    // Get admin user ID for created_by
    const adminUser = await query('SELECT id FROM users WHERE role = $1 LIMIT 1', ['admin']);
    if (!adminUser.rows.length) {
      throw new Error('Admin user not found. Please seed users first.');
    }
    const adminUserId = adminUser.rows[0].id;

    // Create default client onboarding form template
    const clientOnboardingTemplate = {
      name: 'Client Onboarding Documents',
      description: 'Standard form for collecting client onboarding documents including identity verification and compliance materials'
    };

    const result = await query(
      `INSERT INTO form_templates (name, description, created_by, is_active) 
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [clientOnboardingTemplate.name, clientOnboardingTemplate.description, adminUserId, true]
    );

    const templateId = result.rows[0].id;
    logger.info(`Created form template: ${clientOnboardingTemplate.name} (ID: ${templateId})`);

    // Create form fields for the template
    const formFields = [
      {
        field_name: 'first_name',
        field_type: 'text',
        field_label: 'First Name',
        is_required: true,
        display_order: 1,
        validation_rules: { minLength: 2, maxLength: 50 }
      },
      {
        field_name: 'last_name',
        field_type: 'text',
        field_label: 'Last Name',
        is_required: true,
        display_order: 2,
        validation_rules: { minLength: 2, maxLength: 50 }
      },
      {
        field_name: 'email',
        field_type: 'email',
        field_label: 'Email Address',
        is_required: true,
        display_order: 3,
        validation_rules: { format: 'email' }
      },
      {
        field_name: 'phone',
        field_type: 'phone',
        field_label: 'Phone Number',
        is_required: true,
        display_order: 4,
        validation_rules: { format: 'phone' }
      },
      {
        field_name: 'date_of_birth',
        field_type: 'date',
        field_label: 'Date of Birth',
        is_required: true,
        display_order: 5,
        validation_rules: { minAge: 18 }
      },
      {
        field_name: 'employment_type',
        field_type: 'select',
        field_label: 'Employment Type',
        is_required: true,
        display_order: 6,
        field_options: {
          options: [
            { value: 'permanent', label: 'Permanent' },
            { value: 'contract', label: 'Contract' },
            { value: 'temporary', label: 'Temporary' },
            { value: 'freelance', label: 'Freelance' }
          ]
        }
      },
      {
        field_name: 'identity_document',
        field_type: 'file',
        field_label: 'Government Issued ID (Passport/Driver\'s License)',
        is_required: true,
        display_order: 7,
        validation_rules: { 
          allowedTypes: ['pdf', 'jpg', 'jpeg', 'png'],
          maxSize: 5242880 // 5MB
        }
      },
      {
        field_name: 'proof_of_address',
        field_type: 'file',
        field_label: 'Proof of Address (Utility Bill/Bank Statement)',
        is_required: true,
        display_order: 8,
        validation_rules: { 
          allowedTypes: ['pdf', 'jpg', 'jpeg', 'png'],
          maxSize: 5242880 // 5MB
        }
      },
      {
        field_name: 'resume_cv',
        field_type: 'file',
        field_label: 'Resume/CV',
        is_required: true,
        display_order: 9,
        validation_rules: { 
          allowedTypes: ['pdf', 'doc', 'docx'],
          maxSize: 10485760 // 10MB
        }
      },
      {
        field_name: 'right_to_work',
        field_type: 'file',
        field_label: 'Right to Work Documentation',
        is_required: true,
        display_order: 10,
        validation_rules: { 
          allowedTypes: ['pdf', 'jpg', 'jpeg', 'png'],
          maxSize: 5242880 // 5MB
        }
      },
      {
        field_name: 'additional_notes',
        field_type: 'textarea',
        field_label: 'Additional Notes or Comments',
        is_required: false,
        display_order: 11,
        validation_rules: { maxLength: 1000 }
      }
    ];

    for (const field of formFields) {
      await query(
        `INSERT INTO form_fields (template_id, field_name, field_type, field_label, 
         is_required, display_order, field_options, validation_rules) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          templateId,
          field.field_name,
          field.field_type,
          field.field_label,
          field.is_required,
          field.display_order,
          JSON.stringify(field.field_options || null),
          JSON.stringify(field.validation_rules || null)
        ]
      );
    }

    logger.info(`Created ${formFields.length} form fields for template: ${clientOnboardingTemplate.name}`);
    logger.info('Form template seeding completed successfully');
  } catch (error) {
    logger.error('Error seeding form templates:', error);
    throw error;
  }
}