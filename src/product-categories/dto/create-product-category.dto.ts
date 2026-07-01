import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

class CategoryTranslationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;
}

export class CreateProductCategoryDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'key must be a lowercase slug (e.g. whole-fish)',
  })
  key?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsObject()
  @ValidateNested()
  @Type(() => CategoryTranslationDto)
  vi: CategoryTranslationDto;

  @IsObject()
  @ValidateNested()
  @Type(() => CategoryTranslationDto)
  en: CategoryTranslationDto;
}
