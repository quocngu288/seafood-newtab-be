import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class ProductTranslationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  packing?: string;

  @IsString()
  @MaxLength(100)
  size: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  priceVnd: number;

  @IsString()
  @MaxLength(50)
  date: string;
}
