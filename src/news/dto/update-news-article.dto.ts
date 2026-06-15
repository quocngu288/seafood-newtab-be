import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { NewsTranslationDto } from './news-translation.dto';

export class UpdateNewsTranslationDto extends PartialType(NewsTranslationDto) {}

export class UpdateNewsArticleDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  slug?: string;

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
  @ValidateIf((_obj, value) => value !== null)
  @IsDateString()
  publishedAt?: string | null;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UpdateNewsTranslationDto)
  vi?: UpdateNewsTranslationDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UpdateNewsTranslationDto)
  en?: UpdateNewsTranslationDto;
}
