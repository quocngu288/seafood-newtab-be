import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UploadsModule } from '../uploads/uploads.module';
import { NewsAdminController } from './news-admin.controller';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { NewsArticle, NewsArticleSchema } from './schemas/news-article.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NewsArticle.name, schema: NewsArticleSchema },
    ]),
    UploadsModule,
  ],
  controllers: [NewsController, NewsAdminController],
  providers: [NewsService],
  exports: [MongooseModule],
})
export class NewsModule {}
