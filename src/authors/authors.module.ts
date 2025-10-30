import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorsService } from './authors.service';
import { Author } from './entities/author.entity';
import { Book } from '../books/entities/book.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Author, Book])],
  providers: [AuthorsService],
  exports: [AuthorsService],
})
export class AuthorsModule {}