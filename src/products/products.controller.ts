import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { LocaleQueryDto } from '../common/dto/locale-query.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

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
