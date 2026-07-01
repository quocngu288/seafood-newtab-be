export type ProductTileSize = 'standard' | 'tall' | 'wide';

export type ProductGridPosition = {
  col: number;
  row: number;
  tileSize: ProductTileSize;
};

export const PRODUCT_TILE_SIZES: ProductTileSize[] = [
  'standard',
  'tall',
  'wide',
];

/** Vị trí lưới mặc định theo id sản phẩm seed (mockup 3×4) */
export const DEFAULT_GRID_BY_PRODUCT_ID: Record<number, ProductGridPosition> = {
  1: { col: 1, row: 1, tileSize: 'standard' },
  5: { col: 2, row: 1, tileSize: 'tall' },
  9: { col: 3, row: 1, tileSize: 'standard' },
  2: { col: 1, row: 2, tileSize: 'standard' },
  6: { col: 2, row: 2, tileSize: 'standard' },
  10: { col: 3, row: 2, tileSize: 'wide' },
  3: { col: 1, row: 3, tileSize: 'standard' },
  7: { col: 2, row: 3, tileSize: 'standard' },
  11: { col: 3, row: 3, tileSize: 'standard' },
  4: { col: 1, row: 4, tileSize: 'standard' },
  8: { col: 2, row: 4, tileSize: 'standard' },
  12: { col: 3, row: 4, tileSize: 'wide' },
};

export const DEFAULT_PRODUCT_GRID_POSITION: ProductGridPosition = {
  col: 1,
  row: 1,
  tileSize: 'standard',
};

export function normalizeGridPosition(
  value?: Partial<ProductGridPosition> | null,
): ProductGridPosition {
  const col = Math.min(3, Math.max(1, Number(value?.col) || 1));
  const row = Math.min(4, Math.max(1, Number(value?.row) || 1));
  const tileSize = PRODUCT_TILE_SIZES.includes(value?.tileSize as ProductTileSize)
    ? (value!.tileSize as ProductTileSize)
    : 'standard';

  return { col, row, tileSize };
}
