import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { Book } from './entities/book.entity';
import { AuthorsService } from '../authors/authors.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { QueryBookDto } from './dto/query-book.dto';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly booksRepository: Repository<Book>,
    private readonly authorsService: AuthorsService,
  ) {}

  /**
   * Create a new book with author validation
   * @param createBookDto - Book data to create
   * @returns Promise<Book> - Created book with author information
   * @throws BadRequestException if author doesn't exist
   * @throws ConflictException if ISBN already exists
   */
  async create(createBookDto: CreateBookDto): Promise<Book> {
    // Validate that the author exists
    try {
      await this.authorsService.findOne(createBookDto.authorId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new BadRequestException(
          `Author with ID ${createBookDto.authorId} does not exist`,
        );
      }
      throw error;
    }

    const book = this.booksRepository.create({
      ...createBookDto,
      publishedDate: createBookDto.publishedDate
        ? new Date(createBookDto.publishedDate)
        : undefined,
    });

    try {
      return await this.booksRepository.save(book);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes('UNIQUE constraint')
      ) {
        throw new ConflictException(
          `Book with ISBN ${createBookDto.isbn} already exists`,
        );
      }
      throw error;
    }
  }

  /**
   * Find all books with pagination, search, and author filtering
   * @param queryDto - Query parameters for pagination, search, and filtering
   * @returns Promise<{ data: Book[]; total: number }> - Paginated books with total count
   */
  async findAll(
    queryDto: QueryBookDto,
  ): Promise<{ data: Book[]; total: number }> {
    const { page = 1, limit = 10, title, isbn, authorId } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.booksRepository
      .createQueryBuilder('book')
      .leftJoinAndSelect('book.author', 'author');

    // Apply search filters if provided
    if (title) {
      queryBuilder.andWhere('LOWER(book.title) LIKE LOWER(:title)', {
        title: `%${title}%`,
      });
    }

    if (isbn) {
      queryBuilder.andWhere('LOWER(book.isbn) LIKE LOWER(:isbn)', {
        isbn: `%${isbn}%`,
      });
    }

    if (authorId) {
      queryBuilder.andWhere('book.authorId = :authorId', { authorId });
    }

    // Apply pagination
    queryBuilder.skip(skip).take(limit);

    // Order by creation date (newest first)
    queryBuilder.orderBy('book.createdAt', 'DESC');

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  /**
   * Find a single book by ID
   * @param id - Book ID
   * @returns Promise<Book> - Found book with author information
   * @throws NotFoundException if book not found
   */
  async findOne(id: string): Promise<Book> {
    const book = await this.booksRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    return book;
  }

  /**
   * Update an existing book with author validation
   * @param id - Book ID to update
   * @param updateBookDto - Updated book data
   * @returns Promise<Book> - Updated book with author information
   * @throws NotFoundException if book not found
   * @throws BadRequestException if new author doesn't exist
   * @throws ConflictException if new ISBN already exists
   */
  async update(id: string, updateBookDto: UpdateBookDto): Promise<Book> {
    const book = await this.booksRepository.findOne({ where: { id } });

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    // Validate author exists if authorId is being updated
    if (updateBookDto.authorId && updateBookDto.authorId !== book.authorId) {
      try {
        await this.authorsService.findOne(updateBookDto.authorId);
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw new BadRequestException(
            `Author with ID ${updateBookDto.authorId} does not exist`,
          );
        }
        throw error;
      }
    }

    // Prepare update data
    const updatedData = {
      ...updateBookDto,
      publishedDate: updateBookDto.publishedDate
        ? new Date(updateBookDto.publishedDate)
        : book.publishedDate,
    };

    try {
      await this.booksRepository.update(id, updatedData);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes('UNIQUE constraint')
      ) {
        throw new ConflictException(
          `Book with ISBN ${updateBookDto.isbn} already exists`,
        );
      }
      throw error;
    }

    // Return the updated book with author information
    const updatedBook = await this.booksRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!updatedBook) {
      throw new NotFoundException(`Book with ID ${id} not found after update`);
    }

    return updatedBook;
  }

  /**
   * Remove a book
   * @param id - Book ID to remove
   * @throws NotFoundException if book not found
   */
  async remove(id: string): Promise<void> {
    const book = await this.booksRepository.findOne({ where: { id } });

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    await this.booksRepository.remove(book);
  }
}
