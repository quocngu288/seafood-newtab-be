/** Parse "92.000 ₫", "92000", "92,000 VND" → số VNĐ */
export function parseVndPrice(input: string | number | undefined): number {
  if (typeof input === 'number') {
    return Number.isFinite(input) ? Math.max(0, Math.round(input)) : 0;
  }
  if (!input || input.trim() === '' || input.trim() === '—') return 0;

  const digits = input.replace(/[^\d]/g, '');
  if (!digits) return 0;
  return parseInt(digits, 10);
}

export function formatVndPrice(
  amount: number,
  locale: 'vi' | 'en' = 'vi',
): string {
  if (!amount || amount <= 0) return '—';

  if (locale === 'en') {
    return `${amount.toLocaleString('en-US')} VND`;
  }

  return `${amount.toLocaleString('vi-VN')} ₫`;
}
