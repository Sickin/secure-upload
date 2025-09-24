/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  // Create document_types table
  pgm.createTable('document_types', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    name: { type: 'varchar(255)', notNull: true, unique: true },
    description: { type: 'text' },
    category: { 
      type: 'varchar(100)', 
      notNull: true,
      check: "category IN ('identity', 'employment', 'financial', 'legal', 'medical', 'education', 'other')"
    },
    allowed_extensions: { type: 'jsonb', notNull: true }, // ['pdf', 'jpg', 'png']
    max_file_size: { type: 'bigint', notNull: true, default: 10485760 }, // 10MB default
    validation_rules: { type: 'jsonb' }, // Custom validation rules
    is_active: { type: 'boolean', default: true, notNull: true },
    sort_order: { type: 'integer', default: 0, notNull: true },
    created_by: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'RESTRICT' },
    created_at: { type: 'timestamp with time zone', default: pgm.func('now()'), notNull: true },
    updated_at: { type: 'timestamp with time zone', default: pgm.func('now()'), notNull: true }
  });

  // Create form_field_document_types junction table
  pgm.createTable('form_field_document_types', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    field_id: { type: 'uuid', notNull: true, references: 'form_fields(id)', onDelete: 'CASCADE' },
    document_type_id: { type: 'uuid', notNull: true, references: 'document_types(id)', onDelete: 'CASCADE' },
    is_required: { type: 'boolean', default: false, notNull: true },
    display_order: { type: 'integer', default: 0, notNull: true },
    created_at: { type: 'timestamp with time zone', default: pgm.func('now()'), notNull: true }
  });

  // Create indexes
  pgm.createIndex('document_types', 'category');
  pgm.createIndex('document_types', 'is_active');
  pgm.createIndex('document_types', 'sort_order');
  pgm.createIndex('document_types', 'created_by');
  
  pgm.createIndex('form_field_document_types', 'field_id');
  pgm.createIndex('form_field_document_types', 'document_type_id');
  pgm.createIndex('form_field_document_types', ['field_id', 'document_type_id'], { unique: true });

  // Add trigger for updated_at
  pgm.sql(`
    CREATE TRIGGER update_document_types_updated_at 
      BEFORE UPDATE ON document_types 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `);

  // Insert a default admin user if one doesn't exist
  pgm.sql(`
    INSERT INTO users (email, first_name, last_name, role, is_active) 
    SELECT 'admin@secure-upload.local', 'System', 'Administrator', 'admin', true
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE role = 'admin');
  `);

  // Insert default document types
  pgm.sql(`
    INSERT INTO document_types (name, description, category, allowed_extensions, max_file_size, created_by) VALUES
    ('Government ID', 'Passport, driver''s license, or state ID', 'identity', '["pdf", "jpg", "jpeg", "png"]', 5242880, (SELECT id FROM users WHERE role = 'admin' LIMIT 1)),
    ('Birth Certificate', 'Official birth certificate', 'identity', '["pdf", "jpg", "jpeg", "png"]', 5242880, (SELECT id FROM users WHERE role = 'admin' LIMIT 1)),
    ('Social Security Card', 'Social Security card or equivalent', 'identity', '["pdf", "jpg", "jpeg", "png"]', 5242880, (SELECT id FROM users WHERE role = 'admin' LIMIT 1)),
    ('Resume/CV', 'Current resume or curriculum vitae', 'employment', '["pdf", "doc", "docx"]', 10485760, (SELECT id FROM users WHERE role = 'admin' LIMIT 1)),
    ('Employment Authorization', 'Work permit or visa documentation', 'employment', '["pdf", "jpg", "jpeg", "png"]', 5242880, (SELECT id FROM users WHERE role = 'admin' LIMIT 1)),
    ('Bank Statement', 'Recent bank statement for verification', 'financial', '["pdf", "jpg", "jpeg", "png"]', 5242880, (SELECT id FROM users WHERE role = 'admin' LIMIT 1)),
    ('Tax Documents', 'W-2, 1099, or tax return forms', 'financial', '["pdf"]', 10485760, (SELECT id FROM users WHERE role = 'admin' LIMIT 1)),
    ('Educational Credentials', 'Diplomas, certificates, transcripts', 'education', '["pdf", "jpg", "jpeg", "png"]', 10485760, (SELECT id FROM users WHERE role = 'admin' LIMIT 1)),
    ('Medical Records', 'Relevant medical documentation', 'medical', '["pdf", "jpg", "jpeg", "png"]', 10485760, (SELECT id FROM users WHERE role = 'admin' LIMIT 1)),
    ('Legal Documents', 'Contracts, agreements, court documents', 'legal', '["pdf"]', 20971520, (SELECT id FROM users WHERE role = 'admin' LIMIT 1));
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('form_field_document_types');
  pgm.dropTable('document_types');
};
