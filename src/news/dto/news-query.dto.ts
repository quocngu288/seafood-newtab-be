import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { SUPPORTED_LOCALES, type Locale } from '../../common/locale';

export class NewsQueryDto {
  @IsOptional()
  @IsIn(SUPPORTED_LOCALES)
  locale?: Locale;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}
