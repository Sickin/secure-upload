# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Secure Document Upload Portal - A role-based document collection system that integrates with Salesforce to streamline client onboarding and compliance document gathering. Built with enterprise security, compliance features, and Azure cloud integration.

**Tech Stack:**
- Frontend: React 18 + TypeScript + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL
- File Storage: Azure Blob Storage (with encryption)
- Authentication: Azure AD B2C (planned)
- Infrastructure: Azure App Service + Azure Functions

## Development Commands

### Backend Commands (from `/backend` directory)
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm start           # Start production server
npm run clean       # Clean build directory

# Database migrations
npm run migrate:create <name>  # Create new migration
npm run migrate:up            # Run pending migrations
npm run migrate:down          # Rollback last migration
```

### Frontend Commands (from `/frontend` directory)
```bash
npm start           # Start development server (port 3000)
npm run build       # Build for production
npm test           # Run tests
npm run eject      # Eject from Create React App (irreversible)
```

### Root Level Commands
```bash
# Setup environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Install dependencies for both projects
cd backend && npm install
cd frontend && npm install
```

## Project Structure

```
secure-upload/
├── frontend/                 # React TypeScript application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── common/      # Shared components
│   │   │   ├── forms/       # Form-related components
│   │   │   ├── dashboard/   # Dashboard components
│   │   │   └── upload/      # Upload-related components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Utility functions
│   │   ├── types/          # TypeScript type definitions
│   │   ├── services/       # API service functions
│   │   └── api/            # API configuration
│   └── tailwind.config.js  # Tailwind CSS configuration
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── config/         # Configuration files (database, logger)
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API route definitions
│   │   ├── services/       # Business logic services
│   │   ├── types/          # TypeScript type definitions
│   │   ├── utils/          # Utility functions
│   │   ├── controllers/    # Route controllers
│   │   └── models/         # Data models
│   ├── migrations/         # Database migration files
│   └── logs/              # Application logs
├── shared/                 # Shared utilities and types
└── docs/                  # Project documentation
```

## Architecture Overview

### Core Components

1. **Form Template Builder**: Admin interface for creating dynamic forms with various field types
2. **Link Generation System**: Creates secure, time-limited upload links tied to Salesforce job numbers
3. **Upload Portal**: Public interface where clients upload documents using generated links
4. **Role-Based Dashboards**: Different interfaces for Recruiters, Managers, Compliance, and Admins
5. **Document Management**: Secure storage, encryption, and access control for uploaded files
6. **Salesforce Integration**: API endpoints for generating links and retrieving document status

### Database Schema (PostgreSQL)

Key tables:
- `users` - User management with role-based access
- `form_templates` - Dynamic form definitions
- `form_fields` - Individual form field configurations
- `upload_links` - Generated links with expiration and job tracking
- `upload_sessions` - Client upload sessions
- `documents` - File metadata and storage information
- `document_access_log` - Audit trail for compliance

### Security Features

- All files encrypted at rest (AES-256) and in transit (TLS 1.3)
- Role-based access control (RBAC)
- JWT authentication with refresh tokens
- Rate limiting and request validation
- Comprehensive audit logging
- File type validation and virus scanning (planned)

### User Roles & Permissions

- **Recruiters**: Generate links, view their own link status
- **Managers**: View team performance, bulk operations
- **Compliance**: Full document access, audit trails, reporting
- **Admins**: User management, system configuration

## Environment Configuration

### Backend Environment Variables
Key variables to configure in `backend/.env`:
```bash
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:pass@localhost:5432/secure_upload_dev
JWT_SECRET=your-jwt-secret
AZURE_STORAGE_ACCOUNT_NAME=your-storage-account
ENCRYPTION_KEY=your-32-char-encryption-key
```

### Frontend Environment Variables
Key variables to configure in `frontend/.env`:
```bash
REACT_APP_API_URL=http://localhost:3001/api/v1
REACT_APP_MAX_FILE_SIZE=10485760
REACT_APP_ALLOWED_FILE_TYPES=pdf,doc,docx,jpg,jpeg,png,txt
```

## Development Workflow

1. **Database Setup**: Install PostgreSQL and create development database
2. **Environment**: Copy and configure `.env` files for both frontend and backend
3. **Dependencies**: Run `npm install` in both `frontend/` and `backend/` directories
4. **Development**: Start backend (`npm run dev`) and frontend (`npm start`) simultaneously
5. **Database Migrations**: Use `npm run migrate:up` to apply schema changes

## Testing Strategy

- Backend: Unit tests for API endpoints, integration tests for database operations
- Frontend: Component tests with React Testing Library, end-to-end user flow tests
- Security: Penetration testing, file upload security validation
- Load Testing: File upload performance under concurrent users

## Important Security Considerations

- Never commit secrets or API keys to the repository
- All file uploads must be validated for type and content
- Implement proper CORS policies for production
- Use parameterized queries to prevent SQL injection
- Encrypt sensitive data before database storage
- Regular security audits and dependency updates

## Deployment Notes

- Backend: Azure App Service with PostgreSQL database
- Frontend: Azure Static Web Apps
- File Storage: Azure Blob Storage with encryption
- Monitoring: Azure Application Insights
- CI/CD: GitHub Actions with automated testing and deployment