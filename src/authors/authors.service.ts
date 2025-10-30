import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Author } from './entities/author.entity';
import { Book } from '../books/entities/book.entity';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { QueryAuthorDto } from './dto/query-author.dto';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectRepository(Author)
    private readonly authorsRepository: Repository<Author>,
    @InjectRepository(Book)
    private readonly booksRepository: Repository<Book>,
  ) {}

  /**
   * Create a new author
   * @param createAuthorDto - Author data to create
   * @returns Promise<Author> - Created author
   */
  async create(createAuthorDto: CreateAuthorDto): Promise<Author> {
    const author = this.authorsRepository.create({
      ...createAuthorDto,
      birthDate: createAuthorDto.birthDate ? new Date(createAuthorDto.birthDate) : undefined,
    });

    return await this.authorsRepository.save(author);
  }

  /**
   * Find all authors with pagination and search functionality
   * @param queryDto - Query parameters for pagination and search
   * @returns Promise<{ data: Author[]; total: number }> - Paginated authors with total count
   */
  async findAll(queryDto: QueryAuthorDto): Promise<{ data: Author[]; total: number }> {
    const { page = 1, limit = 10, firstName, lastName } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.authorsRepository.createQueryBuilder('author');

    // Apply search filters if provided
    if (firstName) {
      queryBuilder.andWhere('LOWER(author.firstName) LIKE LOWER(:firstName)', {
        firstName: `%${firstName}%`,
      });
    }

    if (lastName) {
      queryBuilder.andWhere('LOWER(author.lastName) LIKE LOWER(:lastName)', {
        lastName: `%${lastName}%`,
      });
    }

    // Apply pagination
    queryBuilder.skip(skip).take(limit);

    // Order by creation date (newest first)
    queryBuilder.orderBy('author.createdAt', 'DESC');

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  /**
   * Find a single author by ID
   * @param id - Author ID
   * @returns Promise<Author> - Found author
   * @throws NotFoundException if author not found
   */
  async findOne(id: string): Promise<Author> {
    const author = await this.authorsRepository.findOne({
      where: { id },
      relations: ['books'],
    });

    if (!author) {
      throw new NotFoundException(`Author with ID ${id} not found`);
    }

    return author;
  }

  /**
   * Update an existing author
   * @param id - Author ID to update
   * @param updateAuthorDto - Updated author data
   * @returns Promise<Author> - Updated author
   * @throws NotFoundException if author not found
   */
  async update(id: string, updateAuthorDto: UpdateAuthorDto): Promise<Author> {
    const author = await this.authorsRepository.findOne({ where: { id } });

    if (!author) {
      throw new NotFoundException(`Author with ID ${id} not found`);
    }

    // Merge the update data
    const updatedData = {
      ...updateAuthorDto,
      birthDate: updateAuthorDto.birthDate ? new Date(updateAuthorDto.birthDate) : author.birthDate,
    };

    await this.authorsRepository.update(id, updatedData);

    // Return the updated author
    const updatedAuthor = await this.authorsRepository.findOne({ where: { id } });
    if (!updatedAuthor) {
      throw new NotFoundException(`Author with ID ${id} not found after update`);
    }
    
    return updatedAuthor;
  }

  /**
   * Remove an author
   * @param id - Author ID to remove
   * @throws NotFoundException if author not found
   * @throws ConflictException if author has associated books
   */
  async remove(id: string): Promise<void> {
    const author = await this.authorsRepository.findOne({ where: { id } });

    if (!author) {
      throw new NotFoundException(`Author with ID ${id} not found`);
    }

    // Check if author has associated books
    const hasAssociatedBooks = await this.hasBooks(id);
    if (hasAssociatedBooks) {
      throw new ConflictException(
        `Cannot delete author with ID ${id} because they have associated books`,
      );
    }

    await this.authorsRepository.remove(author);
  }

  /**
   * Check if an author has associated books
   * @param authorId - Author ID to check
   * @returns Promise<boolean> - True if author has books, false otherwise
   */
  async hasBooks(authorId: string): Promise<boolean> {
    const bookCount = await this.booksRepository.count({
      where: { authorId },
    });

    return bookCount > 0;
  }
}