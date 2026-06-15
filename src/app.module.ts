import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { resolveMongoUri } from './config/app-config';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { ContactModule } from './contact/contact.module';
import { DatabaseModule } from './database/database.module';
import { NewsModule } from './news/news.module';
import { ProductsModule } from './products/products.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60000, limit: 100 },
      { name: 'auth', ttl: 60000, limit: 5 },
      { name: 'contact', ttl: 60000, limit: 3 },
    ]),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: resolveMongoUri(configService),
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 15000,
      }),
    }),
    DatabaseModule,
    AuthModule,
    ProductsModule,
    NewsModule,
    ContactModule,
    UploadsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
