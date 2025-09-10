# Secure Document Upload Portal

A role-based document collection system that integrates with Salesforce to streamline client onboarding and compliance document gathering.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Initial Setup

1. **Clone and install dependencies:**
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies  
cd ../frontend
npm install
```

2. **Environment configuration:**
```bash
# Copy environment templates
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Configure your database and other settings in the .env files
```

3. **Database setup:**
```bash
# Create PostgreSQL database
createdb secure_upload_dev

# Run migrations (when available)
cd backend
npm run migrate:up
```

4. **Start development servers:**
```bash
# Terminal 1: Backend (port 3001)
cd backend
npm run dev

# Terminal 2: Frontend (port 3000)  
cd frontend
npm start
```

## 📋 Project Status

### ✅ Completed (Phase 1.1 - Project Setup)
- [x] Project structure initialization
- [x] React TypeScript frontend with Tailwind CSS
- [x] Node.js Express backend with TypeScript
- [x] Database configuration (PostgreSQL)
- [x] Environment configuration templates
- [x] Basic server setup with security middleware
- [x] TypeScript type definitions
- [x] Logging and error handling setup
- [x] Development commands and scripts

### 🔄 Next Steps (Phase 1.2 - Database Schema)
- [ ] Create database migration scripts
- [ ] Implement core database schema (users, forms, links, documents)
- [ ] Set up database seeding scripts
- [ ] Add connection pooling and optimization

### 📅 Upcoming Phases
- **Phase 2**: Form Template Builder
- **Phase 3**: Client Upload Portal  
- **Phase 4**: Role-Based Dashboard System
- **Phase 5**: Salesforce Integration
- **Phase 6**: Notifications & Communication
- **Phase 7**: Analytics & Polish

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **File Storage**: Azure Blob Storage (planned)
- **Authentication**: Azure AD B2C (planned)

### Project Structure
```
secure-upload/
├── frontend/          # React application
├── backend/           # Node.js API
├── shared/            # Shared utilities
├── docs/              # Documentation
├── CLAUDE.md          # Claude Code guidance
└── README.md          # This file
```

## 🔐 Security Features

- JWT authentication with refresh tokens
- Role-based access control (RBAC)
- File encryption at rest and in transit
- Rate limiting and request validation
- Comprehensive audit logging
- Input sanitization and validation

## 👥 User Roles

- **Recruiters**: Generate upload links, view link status
- **Managers**: Team overview, bulk operations
- **Compliance**: Full document access, audit trails
- **Admins**: User management, system configuration

## 🛠️ Development

### Backend Commands
```bash
npm run dev          # Development server
npm run build        # Build TypeScript
npm start           # Production server
npm run migrate:up   # Run database migrations
```

### Frontend Commands  
```bash
npm start           # Development server
npm run build       # Production build
npm test           # Run tests
```

## 📝 Documentation

- [CLAUDE.md](./CLAUDE.md) - Comprehensive guide for Claude Code
- [Project Plan](./docs/project-plan.md) - Detailed implementation plan
- [API Documentation](./docs/api.md) - API endpoints (coming soon)

## 🤝 Contributing

1. Follow the established TypeScript and code conventions
2. Add tests for new functionality
3. Update documentation as needed
4. Use meaningful commit messages

## 📄 License

This project is proprietary and confidential.

---

**Status**: Phase 1.1 Complete ✅  
**Next Phase**: Database Schema Implementation  
**Last Updated**: September 2025