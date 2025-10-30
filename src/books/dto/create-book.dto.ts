import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsUUID,
  Matches,
} from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  @Matches(
    /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/,
    {
      message: 'ISBN must be a valid ISBN-10 or ISBN-13 format',
    },
  )
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
