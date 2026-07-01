import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ProductTranslationDto } from './product-translation.dto';
import { ProductGridPositionDto } from './product-grid-position.dto';

export class CreateProductDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  thumbnailKey?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  categoryKey?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => ProductGridPositionDto)
  gridPosition?: ProductGridPositionDto;

  @IsObject()
  @ValidateNested()
  @Type(() => ProductTranslationDto)
  vi: ProductTranslationDto;

  @IsObject()
  @ValidateNested()
  @Type(() => ProductTranslationDto)
  en: ProductTranslationDto;
}
