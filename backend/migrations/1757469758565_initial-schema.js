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
  // Create users table
  pgm.createTable('users', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    azure_id: { type: 'varchar(255)', unique: true, notNull: false }, // Azure AD B2C user ID
    email: { type: 'varchar(255)', unique: true, notNull: true },
    first_name: { type: 'varchar(100)', notNull: true },
    last_name: { type: 'varchar(100)', notNull: true },
    role: { 
      type: 'varchar(50)', 
      notNull: true,
      check: "role IN ('recruiter', 'manager', 'compliance', 'admin')"
    },
    is_active: { type: 'boolean', default: true, notNull: true },
    last_login: { type: 'timestamp with time zone' },
    created_at: { type: 'timestamp with time zone', default: pgm.func('now()'), notNull: true },
    updated_at: { type: 'timestamp with time zone', default: pgm.func('now()'), notNull: true }
  });

  // Create form_templates table
  pgm.createTable('form_templates', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    name: { type: 'varchar(255)', notNull: true },
    description: { type: 'text' },
    is_active: { type: 'boolean', default: true, notNull: true },
    created_by: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'RESTRICT' },
    created_at: { type: 'timestamp with time zone', default: pgm.func('now()'), notNull: true },
    updated_at: { type: 'timestamp with time zone', default: pgm.func('now()'), notNull: true }
  });

  // Create form_fields table
  pgm.createTable('form_fields', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    template_id: { type: 'uuid', notNull: true, references: 'form_templates(id)', onDelete: 'CASCADE' },
    field_name: { type: 'varchar(255)', notNull: true },
    field_type: { 
      type: 'varchar(50)', 
      notNull: true,
      check: "field_type IN ('text', 'email', 'phone', 'date', 'select', 'multiselect', 'file', 'textarea', 'checkbox', 'radio')"
    },
    field_label: { type: 'varchar(255)', notNull: true },
    field_options: { type: 'jsonb' }, // For select/radio options
    is_required: { type: 'boolean', default: false, notNull: true },
    validation_rules: { type: 'jsonb' }, // Validation constraints
    display_order: { type: 'integer', notNull: true },
    created_at: { type: 'timestamp with time zone', default: pgm.func('now()'), notNull: true }
  });

  // Create upload_links table
  pgm.createTable('upload_links', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    token: { type: 'varchar(255)', unique: true, notNull: true },
    salesforce_job_number: { type: 'varchar(100)', notNull: true },
    client_name: { type: 'varchar(255)', notNull: true },
    client_email: { type: 'varchar(255)', notNull: true },
    template_id: { type: 'uuid', notNull: true, references: 'form_templates(id)', onDelete: 'RESTRICT' },
    created_by: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'RESTRICT' },
    expires_at: { type: 'timestamp with time zone', notNull: true },
    is_active: { type: 'boolean', default: true, notNull: true },
    max_uploads: { type: 'integer', default: 10, notNull: true },
    current_uploads: { type: 'integer', default: 0, notNull: true },
    notes: { type: 'text' },
    created_at: { type: 'timestamp with time zone', default: pgm.func('now()'), notNull: true },
    updated_at: { type: 'timestamp with time zone', default: pgm.func('now()'), notNull: true }
  });

  // Create upload_sessions table
  pgm.createTable('upload_sessions', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    link_id: { type: 'uuid', notNull: true, references: 'upload_links(id)', onDelete: 'CASCADE' },
    client_ip: { type: 'inet', notNull: true },
    user_agent: { type: 'text' },
    form_data: { type: 'jsonb', notNull: true }, // Client submitted form data
    status: { 
      type: 'varchar(50)', 
      notNull: true, 
      default: 'in_progress',
      check: "status IN ('in_progress', 'completed', 'failed', 'expired')"
    },
    total_files: { type: 'integer', default: 0, notNull: true },
    uploaded_files: { type: 'integer', default: 0, notNull: true },
    started_at: { type: 'timestamp with time zone', default: pgm.func('now()'), notNull: true },
    completed_at: { type: 'timestamp with time zone' },
    created_at: { type: 'timestamp with time zone', default: pgm.func('now()'), notNull: true }
  });

  // Create documents table
  pgm.createTable('documents', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    session_id: { type: 'uuid', notNull: true, references: 'upload_sessions(id)', onDelete: 'CASCADE' },
    original_filename: { type: 'varchar(255)', notNull: true },
    stored_filename: { type: 'varchar(255)', notNull: true },
    file_path: { type: 'varchar(500)', notNull: true },
    file_size: { type: 'bigint', notNull: true },
    mime_type: { type: 'varchar(100)', notNull: true },
    file_hash: { type: 'varchar(64)', notNull: true }, // SHA-256 hash for integrity
    encryption_key_id: { type: 'varchar(255)' }, // Reference to encryption key
    is_encrypted: { type: 'boolean', default: true, notNull: true },
    virus_scan_status: { 
      type: 'varchar(50)', 
      default: 'pending',
      check: "virus_scan_status IN ('pending', 'clean', 'infected', 'failed')"
    },
    virus_scan_result: { type: 'jsonb' },
    upload_status: { 
      type: 'varchar(50)', 
      notNull: true, 
      default: 'uploaded',
      check: "upload_status IN ('uploading', 'uploaded', 'processed', 'failed', 'deleted')"
    },
    metadata: { type: 'jsonb' }, // Additional file metadata
    uploaded_at: { type: 'timestamp with time zone', default: pgm.func('now()'), notNull: true },
    processed_at: { type: 'timestamp with time zone' }
  });

  // Create document_access_log table for audit trail
  pgm.createTable('document_access_log', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    document_id: { type: 'uuid', notNull: true, references: 'documents(id)', onDelete: 'CASCADE' },
    user_id: { type: 'uuid', references: 'users(id)', onDelete: 'SET NULL' }, // Null for public access
    action: { 
      type: 'varchar(50)', 
      notNull: true,
      check: "action IN ('view', 'download', 'delete', 'share', 'access_denied')"
    },
    ip_address: { type: 'inet', notNull: true },
    user_agent: { type: 'text' },
    details: { type: 'jsonb' }, // Additional context
    accessed_at: { type: 'timestamp with time zone', default: pgm.func('now()'), notNull: true }
  });

  // Create indexes for performance
  pgm.createIndex('users', 'email');
  pgm.createIndex('users', 'azure_id');
  pgm.createIndex('users', 'role');
  
  pgm.createIndex('form_fields', 'template_id');
  pgm.createIndex('form_fields', ['template_id', 'display_order']);
  
  pgm.createIndex('upload_links', 'token');
  pgm.createIndex('upload_links', 'salesforce_job_number');
  pgm.createIndex('upload_links', 'created_by');
  pgm.createIndex('upload_links', 'expires_at');
  pgm.createIndex('upload_links', ['is_active', 'expires_at']);
  
  pgm.createIndex('upload_sessions', 'link_id');
  pgm.createIndex('upload_sessions', 'status');
  pgm.createIndex('upload_sessions', 'started_at');
  
  pgm.createIndex('documents', 'session_id');
  pgm.createIndex('documents', 'file_hash');
  pgm.createIndex('documents', 'upload_status');
  pgm.createIndex('documents', 'virus_scan_status');
  pgm.createIndex('documents', 'uploaded_at');
  
  pgm.createIndex('document_access_log', 'document_id');
  pgm.createIndex('document_access_log', 'user_id');
  pgm.createIndex('document_access_log', 'action');
  pgm.createIndex('document_access_log', 'accessed_at');

  // Add updated_at trigger function for tables that need it
  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);

  // Create triggers for updated_at columns
  pgm.sql(`
    CREATE TRIGGER update_users_updated_at 
      BEFORE UPDATE ON users 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `);

  pgm.sql(`
    CREATE TRIGGER update_form_templates_updated_at 
      BEFORE UPDATE ON form_templates 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `);

  pgm.sql(`
    CREATE TRIGGER update_upload_links_updated_at 
      BEFORE UPDATE ON upload_links 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  // Drop tables in reverse order due to foreign key constraints
  pgm.dropTable('document_access_log');
  pgm.dropTable('documents');
  pgm.dropTable('upload_sessions');
  pgm.dropTable('upload_links');
  pgm.dropTable('form_fields');
  pgm.dropTable('form_templates');
  pgm.dropTable('users');
  
  // Drop the trigger function
  pgm.sql('DROP FUNCTION IF EXISTS update_updated_at_column();');
};
