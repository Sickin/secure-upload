import { query } from '../src/config/database';
import { logger } from '../src/config/logger';
import bcrypt from 'bcrypt';

export async function seedUsers() {
  try {
    logger.info('Seeding initial users...');

    // Check if users already exist
    const existingUsers = await query('SELECT COUNT(*) FROM users');
    if (parseInt(existingUsers.rows[0].count) > 0) {
      logger.info('Users already exist, skipping user seeding');
      return;
    }

    // Create initial admin user
    const adminUser = {
      email: 'admin@company.com',
      first_name: 'System',
      last_name: 'Administrator',
      role: 'admin'
    };

    // Create initial compliance user
    const complianceUser = {
      email: 'compliance@company.com',
      first_name: 'Compliance',
      last_name: 'Officer',
      role: 'compliance'
    };

    // Create initial manager user
    const managerUser = {
      email: 'manager@company.com',
      first_name: 'Department',
      last_name: 'Manager',
      role: 'manager'
    };

    // Create initial recruiter user
    const recruiterUser = {
      email: 'recruiter@company.com',
      first_name: 'Lead',
      last_name: 'Recruiter',
      role: 'recruiter'
    };

    const users = [adminUser, complianceUser, managerUser, recruiterUser];

    for (const user of users) {
      await query(
        `INSERT INTO users (email, first_name, last_name, role, is_active) 
         VALUES ($1, $2, $3, $4, $5)`,
        [user.email, user.first_name, user.last_name, user.role, true]
      );
      logger.info(`Created user: ${user.email} (${user.role})`);
    }

    logger.info('User seeding completed successfully');
  } catch (error) {
    logger.error('Error seeding users:', error);
    throw error;
  }
}