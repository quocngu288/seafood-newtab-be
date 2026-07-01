import { Controller, Get, Query } from '@nestjs/common';
import { LocaleQueryDto } from '../common/dto/locale-query.dto';
import { ProductCategoriesService } from './product-categories.service';

@Controller('product-categories')
export class ProductCategoriesController {
  constructor(
    private readonly categoriesService: ProductCategoriesService,
  ) {}

  @Get()
  findAll(@Query() query: LocaleQueryDto) {
    return this.categoriesService.findAll(query.locale);
  }
}
