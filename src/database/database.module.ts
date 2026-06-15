import { Module } from '@nestjs/common';
import { ContactModule } from '../contact/contact.module';
import { NewsModule } from '../news/news.module';
import { ProductsModule } from '../products/products.module';
import { SeedService } from './seed.service';

@Module({
  imports: [ProductsModule, NewsModule, ContactModule],
  providers: [SeedService],
})
export class DatabaseModule {}
