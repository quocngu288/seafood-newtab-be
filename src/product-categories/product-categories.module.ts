import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { ProductCategoriesAdminController } from './product-categories-admin.controller';
import { ProductCategoriesController } from './product-categories.controller';
import { ProductCategoriesService } from './product-categories.service';
import {
  ProductCategory,
  ProductCategorySchema,
} from './schemas/product-category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProductCategory.name, schema: ProductCategorySchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [ProductCategoriesController, ProductCategoriesAdminController],
  providers: [ProductCategoriesService],
  exports: [ProductCategoriesService, MongooseModule],
})
export class ProductCategoriesModule {}
