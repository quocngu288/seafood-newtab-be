import { PartialType } from '@nestjs/mapped-types';
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
import { ProductTranslationDto } from './product-translation.dto';

export class UpdateProductTranslationDto extends PartialType(
  ProductTranslationDto,
) {}

export class UpdateProductDto {
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
  @IsObject()
  @ValidateNested()
  @Type(() => UpdateProductTranslationDto)
  vi?: UpdateProductTranslationDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UpdateProductTranslationDto)
  en?: UpdateProductTranslationDto;
}
