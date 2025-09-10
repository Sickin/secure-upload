import { seedUsers } from './001-initial-users';
import { seedFormTemplates } from './002-form-templates';
import { logger } from '../src/config/logger';
import { testConnection } from '../src/config/database';

async function runSeeds() {
  try {
    logger.info('Starting database seeding...');

    // Test database connection first
    await testConnection();

    // Run seeds in order
    await seedUsers();
    await seedFormTemplates();

    logger.info('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('Database seeding failed:', error);
    process.exit(1);
  }
}

// Run seeds if this file is executed directly
if (require.main === module) {
  runSeeds();
}

export { runSeeds };