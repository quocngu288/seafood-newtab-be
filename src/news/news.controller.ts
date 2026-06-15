import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { LocaleQueryDto } from '../common/dto/locale-query.dto';
import { NewsQueryDto } from './dto/news-query.dto';
import { NewsService } from './news.service';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  findAll(@Query() query: NewsQueryDto) {
    return this.newsService.findAll(query.locale, query.page, query.limit);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: LocaleQueryDto,
  ) {
    return this.newsService.findOne(id, query.locale);
  }
}
