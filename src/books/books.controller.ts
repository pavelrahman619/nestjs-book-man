import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  ParseUUIDPipe,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { QueryBookDto } from './dto/query-book.dto';
import { Book } from './entities/book.entity';
import { HTTP_STATUS_CODES } from '../common/constants/http-status.constants';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  /**
   * Create a new book
   * @param createBookDto - Book data to create
   * @returns Promise<Book> - Created book with author information
   */
  @Post()
  @HttpCode(HTTP_STATUS_CODES.CREATED)
  async create(@Body() createBookDto: CreateBookDto): Promise<Book> {
    return await this.booksService.create(createBookDto);
  }

  /**
   * Get all books with pagination, search, and filtering functionality
   * @param queryDto - Query parameters for pagination, search, and author filtering
   * @returns Promise<{ data: Book[]; total: number }> - Paginated books with total count
   */
  @Get()
  async findAll(
    @Query() queryDto: QueryBookDto,
  ): Promise<{ data: Book[]; total: number }> {
    return await this.booksService.findAll(queryDto);
  }

  /**
   * Get a single book by ID
   * @param id - Book ID (UUID)
   * @returns Promise<Book> - Found book with author information
   */
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Book> {
    return await this.booksService.findOne(id);
  }

  /**
   * Update an existing book
   * @param id - Book ID (UUID)
   * @param updateBookDto - Updated book data
   * @returns Promise<Book> - Updated book with author information
   */
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBookDto: UpdateBookDto,
  ): Promise<Book> {
    return await this.booksService.update(id, updateBookDto);
  }

  /**
   * Delete a book
   * @param id - Book ID (UUID)
   * @returns Promise<void>
   */
  @Delete(':id')
  @HttpCode(HTTP_STATUS_CODES.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return await this.booksService.remove(id);
  }
}