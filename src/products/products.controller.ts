import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { LocaleQueryDto } from '../common/dto/locale-query.dto';
import { ProductCategoriesService } from '../product-categories/product-categories.service';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly categoriesService: ProductCategoriesService,
  ) {}

  @Get('categories')
  findCategories(@Query() query: LocaleQueryDto) {
    return this.categoriesService.findAll(query.locale);
  }

  @Get()
  findAll(@Query() query: LocaleQueryDto) {
    return this.productsService.findAll(query.locale);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: LocaleQueryDto,
  ) {
    return this.productsService.findOne(id, query.locale);
  }
}
