import { IsArray, IsNotEmpty, IsString, MaxLength, ArrayMaxSize } from 'class-validator';

export class NewsTranslationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50000)
  body: string;

  @IsString()
  @MaxLength(500)
  excerpt: string;

  @IsString()
  @MaxLength(100)
  badgeMsc: string;

  @IsString()
  @MaxLength(100)
  badgeAsc: string;

  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(500, { each: true })
  bullets: string[];
}
