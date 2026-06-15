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

export class CreateProductDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  thumbnailKey?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsObject()
  @ValidateNested()
  @Type(() => ProductTranslationDto)
  vi: ProductTranslationDto;

  @IsObject()
  @ValidateNested()
  @Type(() => ProductTranslationDto)
  en: ProductTranslationDto;
}
