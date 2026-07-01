import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ _id: false })
export class ProductCategoryTranslation {
  @Prop({ required: true })
  name: string;
}

@Schema({ timestamps: true, collection: 'product_categories' })
export class ProductCategory {
  @Prop({ required: true, unique: true })
  id: number;

  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ default: 0 })
  sortOrder: number;

  @Prop({ type: ProductCategoryTranslation, required: true })
  vi: ProductCategoryTranslation;

  @Prop({ type: ProductCategoryTranslation, required: true })
  en: ProductCategoryTranslation;
}

export type ProductCategoryDocument = HydratedDocument<ProductCategory>;
export const ProductCategorySchema =
  SchemaFactory.createForClass(ProductCategory);
