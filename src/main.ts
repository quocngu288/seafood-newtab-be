import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { AppModule } from './app.module';
import { validateProductionEnv } from './config/app-config';

async function bootstrap() {
  const uploadsDir = join(process.cwd(), 'uploads', 'products');
  const newsUploadsDir = join(process.cwd(), 'uploads', 'news');
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }
  if (!existsSync(newsUploadsDir)) {
    mkdirSync(newsUploadsDir, { recursive: true });
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);
  validateProductionEnv(configService);

  // Healthcheck Railway (không qua global prefix /api)
  const express = app.getHttpAdapter().getInstance();
  express.get('/health', (_req: unknown, res: { json: (body: object) => void }) => {
    res.json({ status: 'ok', service: 'hai-huong-seafood-api' });
  });

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3002',
      'http://127.0.0.1:3002',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = Number(process.env.PORT) || 3001;
  const host = '0.0.0.0';

  await app.listen(port, host);
  console.log(`API listening on http://${host}:${port}/api`);
  console.log(`Health: http://${host}:${port}/health`);
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
