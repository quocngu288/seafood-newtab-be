import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { NewsTranslationDto } from './news-translation.dto';

export class CreateNewsArticleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  slug: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  thumbnailKey?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @IsObject()
  @ValidateNested()
  @Type(() => NewsTranslationDto)
  vi: NewsTranslationDto;

  @IsObject()
  @ValidateNested()
  @Type(() => NewsTranslationDto)
  en: NewsTranslationDto;
}
