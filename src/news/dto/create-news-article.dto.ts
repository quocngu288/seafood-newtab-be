import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { NewsTranslationDto } from './news-translation.dto';

export class CreateNewsArticleDto {
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
