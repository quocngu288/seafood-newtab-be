import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  DEFAULT_PRODUCT_GRID_POSITION,
  type ProductGridPosition,
  type ProductTileSize,
} from '../product-grid-position';

@Schema({ _id: false })
export class ProductGridPositionSchema implements ProductGridPosition {
  @Prop({ default: 1 })
  col: number;

  @Prop({ default: 1 })
  row: number;

  @Prop({ default: 'standard' })
  tileSize: ProductTileSize;
}

@Schema({ _id: false })
export class ProductTranslationContent {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ default: '' })
  packing: string;

  @Prop({ default: '' })
  size: string;

  @Prop({ default: 0 })
  priceVnd: number;

  @Prop({ default: '' })
  date: string;
}

@Schema({ timestamps: true, collection: 'products' })
export class Product {
  @Prop({ required: true, unique: true })
  id: number;

  @Prop({ default: 'bg-slide.jpg' })
  thumbnailKey: string;

  @Prop({ default: '' })
  categoryKey: string;

  @Prop({ default: 0 })
  sortOrder: number;

  @Prop({
    type: ProductGridPositionSchema,
    default: () => ({ ...DEFAULT_PRODUCT_GRID_POSITION }),
  })
  gridPosition: ProductGridPosition;

  @Prop({ type: ProductTranslationContent, required: true })
  vi: ProductTranslationContent;

  @Prop({ type: ProductTranslationContent, required: true })
  en: ProductTranslationContent;
}

export type ProductDocument = HydratedDocument<Product>;
export const ProductSchema = SchemaFactory.createForClass(Product);
