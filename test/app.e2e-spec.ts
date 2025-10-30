import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';

describe('Authors (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Configure the app with the same settings as main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should create an author and retrieve it successfully', async () => {
    const createAuthorDto = {
      firstName: 'John',
      lastName: 'Doe',
      bio: 'A prolific author known for his compelling narratives.',
      birthDate: '1980-05-15',
    };

    // Create an author
    const createResponse = await request(app.getHttpServer())
      .post('/authors')
      .send(createAuthorDto)
      .expect(201);

    // Validate the created author response
    expect(createResponse.body).toHaveProperty('id');
    expect(createResponse.body.firstName).toBe(createAuthorDto.firstName);
    expect(createResponse.body.lastName).toBe(createAuthorDto.lastName);
    expect(createResponse.body.bio).toBe(createAuthorDto.bio);
    expect(new Date(createResponse.body.birthDate).toISOString().split('T')[0]).toBe(createAuthorDto.birthDate);
    expect(createResponse.body).toHaveProperty('createdAt');
    expect(createResponse.body).toHaveProperty('updatedAt');

    const authorId = createResponse.body.id;

    // Retrieve the created author
    const getResponse = await request(app.getHttpServer())
      .get(`/authors/${authorId}`)
      .expect(200);

    // Validate the retrieved author response
    expect(getResponse.body.id).toBe(authorId);
    expect(getResponse.body.firstName).toBe(createAuthorDto.firstName);
    expect(getResponse.body.lastName).toBe(createAuthorDto.lastName);
    expect(getResponse.body.bio).toBe(createAuthorDto.bio);
    expect(new Date(getResponse.body.birthDate).toISOString().split('T')[0]).toBe(createAuthorDto.birthDate);
    expect(getResponse.body).toHaveProperty('createdAt');
    expect(getResponse.body).toHaveProperty('updatedAt');

    // Verify the author appears in the list of all authors
    const listResponse = await request(app.getHttpServer())
      .get('/authors')
      .expect(200);

    expect(listResponse.body).toHaveProperty('data');
    expect(listResponse.body).toHaveProperty('total');
    expect(Array.isArray(listResponse.body.data)).toBe(true);
    expect(listResponse.body.total).toBeGreaterThan(0);
    
    const foundAuthor = listResponse.body.data.find(
      (author: any) => author.id === authorId,
    );
    expect(foundAuthor).toBeDefined();
    expect(foundAuthor.firstName).toBe(createAuthorDto.firstName);
    expect(foundAuthor.lastName).toBe(createAuthorDto.lastName);
  });
});
