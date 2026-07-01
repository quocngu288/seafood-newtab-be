import { Type } from 'class-transformer';
import {
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

class UpdateCategoryTranslationDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;
}

export class UpdateProductCategoryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UpdateCategoryTranslationDto)
  vi?: UpdateCategoryTranslationDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UpdateCategoryTranslationDto)
  en?: UpdateCategoryTranslationDto;
}
