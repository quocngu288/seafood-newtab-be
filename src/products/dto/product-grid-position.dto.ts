import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { PRODUCT_TILE_SIZES } from '../product-grid-position';

export class ProductGridPositionDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(3)
  col: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(4)
  row: number;

  @IsOptional()
  @IsIn(PRODUCT_TILE_SIZES)
  tileSize?: (typeof PRODUCT_TILE_SIZES)[number];
}
