# Secure Document Upload Portal - Development Setup

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** (v18 or higher): [Download Node.js](https://nodejs.org/)
- **PostgreSQL** (v12 or higher): [Download PostgreSQL](https://www.postgresql.org/download/)
- **Git**: [Download Git](https://git-scm.com/downloads)

## Quick Start

### 1. Clone and Setup Project

```bash
# Clone the repository
git clone <repository-url>
cd secure-upload

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup

#### Install PostgreSQL (if not already installed)
- **Windows**: Download from [PostgreSQL.org](https://www.postgresql.org/download/windows/)
- **Mac**: `brew install postgresql` or use the installer
- **Linux**: `sudo apt-get install postgresql postgresql-contrib`

#### Create Database

**Method 1: Using PostgreSQL default postgres user**
```bash
# Create database using the postgres user (recommended for development)
# Set your postgres user password when prompted during PostgreSQL installation
# or use: ALTER USER postgres PASSWORD 'your-password'; in psql

# Create the database
createdb -U postgres secure_upload_dev

# Test connection
psql -U postgres -d secure_upload_dev -c "SELECT version();"
```

**Method 2: Create dedicated user (optional for production)**
```bash
# Connect to PostgreSQL as superuser
psql -U postgres

# Create database and user
CREATE DATABASE secure_upload_dev;
CREATE USER secure_upload_user WITH ENCRYPTED PASSWORD 'secure_dev_password_2024';
GRANT ALL PRIVILEGES ON DATABASE secure_upload_dev TO secure_upload_user;
\q
```

### 3. Environment Configuration

#### Backend Environment
```bash
# Copy environment template
cd backend
cp .env.example .env
```

Edit `backend/.env` with your database credentials:

**For Method 1 (postgres user - recommended for development):**
```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Database Configuration - using postgres user
DATABASE_URL=postgresql://postgres:your-postgres-password@localhost:5432/secure_upload_dev
DB_HOST=localhost
DB_PORT=5432
DB_NAME=secure_upload_dev
DB_USER=postgres
DB_PASSWORD=your-postgres-password

# JWT Configuration (generate secure keys for production)
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-secret-here-change-in-production
JWT_REFRESH_EXPIRE=30d

# Security (generate secure keys for production)
ENCRYPTION_KEY=your-32-character-encryption-key-here
SESSION_SECRET=your-session-secret-here-change-in-production
```

#### Frontend Environment
```bash
# Copy environment template
cd frontend
cp .env.example .env
```

The frontend `.env` should already have the correct defaults:
```env
REACT_APP_API_URL=http://localhost:3001/api/v1
REACT_APP_MAX_FILE_SIZE=10485760
REACT_APP_ALLOWED_FILE_TYPES=pdf,doc,docx,jpg,jpeg,png,txt
```

### 4. Database Migration

```bash
# From the backend directory
cd backend
npm run migrate:up
```

This will:
- Create all necessary database tables (users, form_templates, form_fields, upload_links, documents, etc.)
- Create a default admin user: `admin@secure-upload.local`
- Seed 10 document types across categories (Identity, Employment, Financial, Legal, Medical, Education)
- Set up all indexes and triggers for optimal performance

**Verify migration success:**
```bash
# Check that tables were created
PGPASSWORD=your-postgres-password psql -U postgres -d secure_upload_dev -c "\dt"

# Check admin user was created
PGPASSWORD=your-postgres-password psql -U postgres -d secure_upload_dev -c "SELECT email, role FROM users;"

# Check document types were seeded
PGPASSWORD=your-postgres-password psql -U postgres -d secure_upload_dev -c "SELECT name, category FROM document_types;"
```

### 5. Start Development Servers

**Option 1: Start both servers separately**
```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend  
cd frontend
npm start
```

**Option 2: Use concurrent development (if you set it up)**
```bash
# From root directory
npm run dev  # (if you have a root package.json with concurrently)
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/v1/health

## Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check if PostgreSQL is running
# Windows: Check Services or run:
pg_ctl status -D "C:\Program Files\PostgreSQL\17\data"

# Mac/Linux: 
brew services list | grep postgresql  # Mac
sudo systemctl status postgresql      # Linux

# Start PostgreSQL if not running
# Windows: Start via Services or:
pg_ctl start -D "C:\Program Files\PostgreSQL\17\data"

# Mac/Linux:
brew services start postgresql  # Mac
sudo systemctl start postgresql # Linux
```

#### Permission Issues
```bash
# If you get permission errors, try connecting as postgres user:
psql -U postgres -d secure_upload_dev

# Grant all necessary permissions:
GRANT ALL ON SCHEMA public TO secure_upload_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO secure_upload_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO secure_upload_user;
```

#### Port Conflicts
- Backend runs on port 3001, frontend on 3000
- Change ports in `.env` files if needed
- Check for existing processes: `lsof -i :3001` (Mac/Linux) or `netstat -an | find "3001"` (Windows)

#### Node.js Version Issues
```bash
# Check Node version
node --version  # Should be v18 or higher

# If you have multiple Node versions, consider using nvm:
# Install nvm: https://github.com/nvm-sh/nvm
nvm install 18
nvm use 18
```

### Development Mode vs Production

This setup guide is for **development only**. For production deployment:

1. Use secure, randomly generated secrets
2. Set up proper SSL/TLS certificates
3. Configure Azure services (Blob Storage, Key Vault, etc.)
4. Use environment-specific configuration
5. Set up proper monitoring and logging

## Project Structure

```
secure-upload/
├── frontend/           # React TypeScript frontend
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/            # Node.js Express API
│   ├── src/
│   ├── migrations/     # Database migrations
│   └── package.json
├── docs/               # Documentation
├── CLAUDE.md          # Claude Code instructions
└── README.md
```

## Available Scripts

### Backend (`cd backend`)
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript  
npm start           # Start production server
npm run migrate:up   # Run database migrations
npm run migrate:down # Rollback migrations
npm run migrate:create <name> # Create new migration
```

### Frontend (`cd frontend`)
```bash
npm start           # Start development server
npm run build       # Build for production
npm test           # Run tests
```

## Next Steps

Once you have the basic setup running:

1. **Verify Everything Works**
   - Check that both servers start without errors
   - Verify you can access the frontend and see form templates
   - Test the API health endpoint

2. **Start Development**
   - The app should show 2 sample form templates
   - You can begin adding features like form creation, editing, etc.

3. **Production Setup** (when ready)
   - Set up Azure services
   - Configure CI/CD pipeline
   - Set up monitoring and logging

## Getting Help

- Check the logs in both terminal windows for error messages
- Verify all environment variables are set correctly
- Ensure PostgreSQL is running and accessible
- Check that all dependencies are installed (`npm install`)

---

**Note**: This is a development setup. Never use these credentials or configurations in production!