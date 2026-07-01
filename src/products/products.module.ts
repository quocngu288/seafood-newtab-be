import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductCategoriesModule } from '../product-categories/product-categories.module';
import { UploadsModule } from '../uploads/uploads.module';
import { ProductsAdminController } from './products-admin.controller';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product, ProductSchema } from './schemas/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    ProductCategoriesModule,
    UploadsModule,
  ],
  controllers: [ProductsController, ProductsAdminController],
  providers: [ProductsService],
  exports: [ProductsService, MongooseModule],
})
export class ProductsModule {}
