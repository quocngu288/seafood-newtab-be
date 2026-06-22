import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

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

  @Prop({ default: 0 })
  sortOrder: number;

  @Prop({ type: ProductTranslationContent, required: true })
  vi: ProductTranslationContent;

  @Prop({ type: ProductTranslationContent, required: true })
  en: ProductTranslationContent;
}

export type ProductDocument = HydratedDocument<Product>;
export const ProductSchema = SchemaFactory.createForClass(Product);
