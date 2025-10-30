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
import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { QueryAuthorDto } from './dto/query-author.dto';
import { Author } from './entities/author.entity';
import { HTTP_STATUS_CODES } from '../common/constants/http-status.constants';

@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  /**
   * Create a new author
   * @param createAuthorDto - Author data to create
   * @returns Promise<Author> - Created author
   */
  @Post()
  @HttpCode(HTTP_STATUS_CODES.CREATED)
  async create(@Body() createAuthorDto: CreateAuthorDto): Promise<Author> {
    return await this.authorsService.create(createAuthorDto);
  }

  /**
   * Get all authors with pagination and search functionality
   * @param queryDto - Query parameters for pagination and search
   * @returns Promise<{ data: Author[]; total: number }> - Paginated authors with total count
   */
  @Get()
  async findAll(
    @Query() queryDto: QueryAuthorDto,
  ): Promise<{ data: Author[]; total: number }> {
    return await this.authorsService.findAll(queryDto);
  }

  /**
   * Get a single author by ID
   * @param id - Author ID (UUID)
   * @returns Promise<Author> - Found author
   */
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Author> {
    return await this.authorsService.findOne(id);
  }

  /**
   * Update an existing author
   * @param id - Author ID (UUID)
   * @param updateAuthorDto - Updated author data
   * @returns Promise<Author> - Updated author
   */
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAuthorDto: UpdateAuthorDto,
  ): Promise<Author> {
    return await this.authorsService.update(id, updateAuthorDto);
  }

  /**
   * Delete an author
   * @param id - Author ID (UUID)
   * @returns Promise<void>
   */
  @Delete(':id')
  @HttpCode(HTTP_STATUS_CODES.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return await this.authorsService.remove(id);
  }
}
