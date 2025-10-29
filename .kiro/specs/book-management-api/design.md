# Design Document

## Overview

The Book Management System is a NestJS-based RESTful API that provides comprehensive CRUD operations for managing books and authors. The system follows NestJS architectural patterns with TypeORM for database operations, implementing a modular structure with proper separation of concerns.

## Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Controllers   │───▶│    Services     │───▶│  Repositories   │
│  (HTTP Layer)   │    │ (Business Logic)│    │ (Data Access)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      DTOs       │    │   Entities      │    │    Database     │
│  (Validation)   │    │   (Models)      │    │    (SQLite)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Module Structure

- **AppModule**: Root module orchestrating the application
- **AuthorsModule**: Handles all author-related functionality
- **BooksModule**: Manages book operations and author relationships
- **DatabaseModule**: Configures TypeORM and database connections

## Components and Interfaces

### Entities

#### Author Entity
```typescript
@Entity('authors')
export class Author {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ type: 'date', nullable: true })
  birthDate?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Book, book => book.author)
  books: Book[];
}
```

#### Book Entity
```typescript
@Entity('books')
export class Book {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'varchar', length: 17, unique: true })
  isbn: string;

  @Column({ type: 'date', nullable: true })
  publishedDate?: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  genre?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Author, author => author.books, { eager: true })
  @JoinColumn({ name: 'authorId' })
  author: Author;

  @Column({ name: 'authorId' })
  authorId: string;
}
```

### DTOs (Data Transfer Objects)

#### Author DTOs
```typescript
// Create Author DTO
export class CreateAuthorDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;
}

// Update Author DTO
export class UpdateAuthorDto extends PartialType(CreateAuthorDto) {}

// Query Author DTO
export class QueryAuthorDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;
}
```

#### Book DTOs
```typescript
// Create Book DTO
export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsISBN()
  isbn: string;

  @IsOptional()
  @IsDateString()
  publishedDate?: string;

  @IsOptional()
  @IsString()
  genre?: string;

  @IsUUID()
  authorId: string;
}

// Update Book DTO
export class UpdateBookDto extends PartialType(CreateBookDto) {}

// Query Book DTO
export class QueryBookDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  isbn?: string;

  @IsOptional()
  @IsUUID()
  authorId?: string;
}
```

### Services

#### AuthorsService
```typescript
@Injectable()
export class AuthorsService {
  constructor(
    @InjectRepository(Author)
    private authorsRepository: Repository<Author>,
  ) {}

  async create(createAuthorDto: CreateAuthorDto): Promise<Author>
  async findAll(queryDto: QueryAuthorDto): Promise<{ data: Author[]; total: number }>
  async findOne(id: string): Promise<Author>
  async update(id: string, updateAuthorDto: UpdateAuthorDto): Promise<Author>
  async remove(id: string): Promise<void>
  async hasBooks(authorId: string): Promise<boolean>
}
```

#### BooksService
```typescript
@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private booksRepository: Repository<Book>,
    private authorsService: AuthorsService,
  ) {}

  async create(createBookDto: CreateBookDto): Promise<Book>
  async findAll(queryDto: QueryBookDto): Promise<{ data: Book[]; total: number }>
  async findOne(id: string): Promise<Book>
  async update(id: string, updateBookDto: UpdateBookDto): Promise<Book>
  async remove(id: string): Promise<void>
}
```

### Controllers

#### AuthorsController
```typescript
@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createAuthorDto: CreateAuthorDto): Promise<Author>

  @Get()
  async findAll(@Query() queryDto: QueryAuthorDto): Promise<{ data: Author[]; total: number }>

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Author>

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAuthorDto: UpdateAuthorDto,
  ): Promise<Author>

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void>
}
```

#### BooksController
```typescript
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createBookDto: CreateBookDto): Promise<Book>

  @Get()
  async findAll(@Query() queryDto: QueryBookDto): Promise<{ data: Book[]; total: number }>

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Book>

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBookDto: UpdateBookDto,
  ): Promise<Book>

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void>
}
```

## Data Models

### Database Schema

```sql
-- Authors Table
CREATE TABLE authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  bio TEXT,
  birthDate DATE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Books Table
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  isbn VARCHAR(17) UNIQUE NOT NULL,
  publishedDate DATE,
  genre VARCHAR(50),
  authorId UUID NOT NULL REFERENCES authors(id),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_authors_name ON authors(firstName, lastName);
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_isbn ON books(isbn);
CREATE INDEX idx_books_author ON books(authorId);
```

### Relationships

- **Author → Books**: One-to-Many relationship
- **Book → Author**: Many-to-One relationship with eager loading
- **Referential Integrity**: Foreign key constraint prevents orphaned books

## Error Handling

### HTTP Status Codes Constants

```typescript
// src/common/constants/http-status.constants.ts
export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;
```

### Custom Exception Filters

```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    let status = HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    } else if (exception instanceof QueryFailedError) {
      if (exception.message.includes('UNIQUE constraint')) {
        status = HTTP_STATUS_CODES.CONFLICT;
        message = 'Resource already exists';
      }
    }
    
    response.status(status).json({
      statusCode: status,
      message,
      error: HttpStatus[status] || 'Unknown Error',
      timestamp: new Date().toISOString(),
    });
  }
}
```

### Validation Error Handling

- **Class-validator**: Automatic DTO validation with detailed error messages
- **ValidationPipe**: Global validation pipe with transform and whitelist options
- **Custom Validation**: ISBN validation using class-validator decorators

## Testing Strategy

### Unit Testing

#### AuthorsService Tests
```typescript
describe('AuthorsService', () => {
  let service: AuthorsService;
  let repository: Repository<Author>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthorsService,
        {
          provide: getRepositoryToken(Author),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<AuthorsService>(AuthorsService);
    repository = module.get<Repository<Author>>(getRepositoryToken(Author));
  });

  // Test cases for CRUD operations
  describe('create', () => { /* test implementation */ });
  describe('findAll', () => { /* test implementation */ });
  describe('findOne', () => { /* test implementation */ });
  describe('update', () => { /* test implementation */ });
  describe('remove', () => { /* test implementation */ });
});
```

### End-to-End Testing

#### Author Creation and Retrieval Test
```typescript
describe('Authors (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should create and retrieve an author', () => {
    const createAuthorDto = {
      firstName: 'John',
      lastName: 'Doe',
      bio: 'Test author',
    };

    return request(app.getHttpServer())
      .post('/authors')
      .send(createAuthorDto)
      .expect(201)
      .then((response) => {
        const authorId = response.body.id;
        return request(app.getHttpServer())
          .get(`/authors/${authorId}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.firstName).toBe('John');
            expect(res.body.lastName).toBe('Doe');
          });
      });
  });
});
```

### API Documentation

#### Simple API Contract
- **Markdown document**: Lists all endpoints with request/response formats
- **HTTP methods**: GET, POST, PATCH, DELETE for each resource
- **Status codes**: Success and error responses for each endpoint
- **Example payloads**: Sample requests and responses

#### Postman Collection
- **Simple structure**: Basic requests organized by Authors and Books
- **Example requests**: Pre-configured requests with sample data
- **Environment setup**: Base URL configuration for different environments

## Database Configuration

### TypeORM Configuration

```typescript
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'book-management.db',
      entities: [Author, Book],
      synchronize: true, // Only for development
      logging: process.env.NODE_ENV === 'development',
    }),
  ],
})
export class DatabaseModule {}
```

### Migration Strategy

- **Development**: Auto-synchronization enabled for rapid development
- **Production**: Migration-based approach with version control
- **Seeding**: Optional data seeding for development and testing

## Security Considerations

### Input Validation
- **DTO Validation**: Comprehensive validation using class-validator
- **UUID Validation**: Proper UUID format validation for IDs
- **ISBN Validation**: Standard ISBN format validation
- **SQL Injection Prevention**: TypeORM parameterized queries

### Data Integrity
- **Foreign Key Constraints**: Referential integrity between authors and books
- **Unique Constraints**: ISBN uniqueness enforcement
- **Cascade Operations**: Controlled cascade behavior for relationships