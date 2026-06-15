import { IsIn, IsOptional } from 'class-validator';
import { SUPPORTED_LOCALES, type Locale } from '../locale';

export class LocaleQueryDto {
  @IsOptional()
  @IsIn(SUPPORTED_LOCALES)
  locale?: Locale;
}
