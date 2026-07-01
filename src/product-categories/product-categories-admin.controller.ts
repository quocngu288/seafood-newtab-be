import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';
import { ProductCategoriesService } from './product-categories.service';

@UseGuards(JwtAuthGuard)
@Controller('admin/product-categories')
export class ProductCategoriesAdminController {
  constructor(
    private readonly categoriesService: ProductCategoriesService,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  @Get()
  findAll() {
    return this.categoriesService.findAllAdmin();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOneAdmin(id);
  }

  @Post()
  create(@Body() dto: CreateProductCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductCategoryDto,
  ) {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const category = await this.categoriesService.findOneAdmin(id);
    const productCount = await this.productModel.countDocuments({
      categoryKey: category.key,
    });
    return this.categoriesService.remove(id, productCount);
  }
}
