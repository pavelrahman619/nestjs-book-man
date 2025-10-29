# Project Structure

## Root Directory Layout
```
├── src/                 # Source code
├── test/               # End-to-end tests
├── dist/               # Compiled output (generated)
├── node_modules/       # Dependencies (generated)
├── .kiro/              # Kiro configuration
└── coverage/           # Test coverage reports (generated)
```

## Source Code Organization (`src/`)
- **Controllers** - Handle HTTP requests and responses
- **Services** - Business logic and data processing
- **Modules** - Feature organization and dependency injection
- **DTOs** - Data transfer objects for validation
- **Entities** - Database models (TypeORM)

## File Naming Conventions
- **Controllers**: `*.controller.ts`
- **Services**: `*.service.ts`
- **Modules**: `*.module.ts`
- **Entities**: `*.entity.ts`
- **DTOs**: `*.dto.ts`
- **Tests**: `*.spec.ts` (unit), `*.e2e-spec.ts` (e2e)

## Architecture Patterns
- **Modular Architecture** - Features organized in modules
- **Dependency Injection** - NestJS IoC container
- **Controller-Service Pattern** - Separation of concerns
- **Repository Pattern** - Data access abstraction via TypeORM

## Configuration Files
- `nest-cli.json` - NestJS CLI configuration
- `tsconfig.json` - TypeScript compiler options
- `package.json` - Dependencies and scripts
- `eslint.config.mjs` - Linting rules
- `.prettierrc` - Code formatting rules

## Testing Structure
- Unit tests alongside source files (`*.spec.ts`)
- E2E tests in dedicated `test/` directory
- Jest configuration in `package.json`