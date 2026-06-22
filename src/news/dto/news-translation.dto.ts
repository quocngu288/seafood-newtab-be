import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class NewsTranslationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50000)
  body: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;
}
