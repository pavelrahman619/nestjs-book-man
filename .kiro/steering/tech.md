# Technology Stack

## Framework & Runtime
- **NestJS 11.x** - Progressive Node.js framework
- **Node.js** - JavaScript runtime
- **TypeScript 5.7.x** - Primary language with strict type checking

## Database & ORM
- **TypeORM 0.3.x** - Database ORM
- **SQLite 5.x** - Development database
- **PostgreSQL** - Recommended for production

## Code Quality & Testing
- **ESLint 9.x** - Linting with TypeScript rules
- **Prettier 3.x** - Code formatting
- **Jest 30.x** - Testing framework
- **Supertest** - HTTP assertion testing

## Build System
- **NestJS CLI** - Project scaffolding and build tools
- **ts-jest** - TypeScript Jest transformer
- **ts-node** - TypeScript execution

## Common Commands

### Development
```bash
npm run start:dev    # Start with file watching
npm run start:debug  # Start with debugging
npm run build        # Build for production
```

### Code Quality
```bash
npm run lint         # Run ESLint with auto-fix
npm run format       # Format code with Prettier
```

### Testing
```bash
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:cov     # Run tests with coverage
npm run test:e2e     # Run end-to-end tests
```

### Production
```bash
npm run start:prod   # Start production build
```