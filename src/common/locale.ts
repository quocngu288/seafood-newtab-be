export const SUPPORTED_LOCALES = ['vi', 'en'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export function parseLocale(value?: string): Locale {
  if (value === 'en') return 'en';
  return 'vi';
}
