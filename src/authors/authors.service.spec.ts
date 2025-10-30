import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { Author } from './entities/author.entity';
import { Book } from '../books/entities/book.entity';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';

describe('AuthorsService', () => {
  let service: AuthorsService;
  let authorsRepository: jest.Mocked<Repository<Author>>;
  let booksRepository: jest.Mocked<Repository<Book>>;

  const mockAuthor: Author = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    firstName: 'John',
    lastName: 'Doe',
    bio: 'Test author bio',
    birthDate: new Date('1980-01-01'),
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    books: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorsService,
        {
          provide: getRepositoryToken(Author),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue({
              andWhere: jest.fn().mockReturnThis(),
              skip: jest.fn().mockReturnThis(),
              take: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              getManyAndCount: jest.fn().mockResolvedValue([[mockAuthor], 1]),
            }),
          },
        },
        {
          provide: getRepositoryToken(Book),
          useValue: {
            count: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthorsService>(AuthorsService);
    authorsRepository = module.get(getRepositoryToken(Author));
    booksRepository = module.get(getRepositoryToken(Book));
  });

  // CREATE - Test creating a new author
  describe('create', () => {
    it('should create a new author', async () => {
      const createAuthorDto: CreateAuthorDto = {
        firstName: 'John',
        lastName: 'Doe',
        bio: 'Test author',
      };

      authorsRepository.create.mockReturnValue(mockAuthor);
      authorsRepository.save.mockResolvedValue(mockAuthor);

      const result = await service.create(createAuthorDto);

      expect(authorsRepository.create).toHaveBeenCalled();
      expect(authorsRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockAuthor);
    });
  });

  // READ - Test finding authors
  describe('findAll', () => {
    it('should return all authors', async () => {
      const result = await service.findAll({});

      expect(result.data).toEqual([mockAuthor]);
      expect(result.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return one author', async () => {
      authorsRepository.findOne.mockResolvedValue(mockAuthor);

      const result = await service.findOne(mockAuthor.id);

      expect(result).toEqual(mockAuthor);
    });

    it('should throw error when author not found', async () => {
      authorsRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  // UPDATE - Test updating an author
  describe('update', () => {
    it('should update an author', async () => {
      const updateAuthorDto: UpdateAuthorDto = {
        firstName: 'Jane',
      };

      authorsRepository.findOne
        .mockResolvedValueOnce(mockAuthor)
        .mockResolvedValueOnce({ ...mockAuthor, firstName: 'Jane' });

      const result = await service.update(mockAuthor.id, updateAuthorDto);

      expect(authorsRepository.update).toHaveBeenCalled();
      expect(result.firstName).toBe('Jane');
    });

    it('should throw error when author to update not found', async () => {
      authorsRepository.findOne.mockResolvedValue(null);

      await expect(service.update('invalid-id', {})).rejects.toThrow(NotFoundException);
    });
  });

  // DELETE - Test removing an author
  describe('remove', () => {
    it('should remove an author', async () => {
      authorsRepository.findOne.mockResolvedValue(mockAuthor);
      booksRepository.count.mockResolvedValue(0); // No books associated

      await service.remove(mockAuthor.id);

      expect(authorsRepository.remove).toHaveBeenCalledWith(mockAuthor);
    });

    it('should throw error when author to remove not found', async () => {
      authorsRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });
});