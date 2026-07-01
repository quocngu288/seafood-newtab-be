import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);

  constructor(private readonly configService: ConfigService) {}

  getPublicUrl(relativePath: string): string {
    if (!relativePath) return '';
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
      return relativePath;
    }
    if (!relativePath.startsWith('uploads/')) {
      return '';
    }

    const base = (
      this.configService.get<string>('API_PUBLIC_URL') ??
      `http://localhost:${this.configService.get<string>('PORT') ?? 3002}`
    ).replace(/\/$/, '');

    const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
    return `${base}${path}`;
  }

  deleteIfUploaded(relativePath: string | undefined | null): void {
    if (!relativePath?.startsWith('uploads/')) return;

    const absolutePath = join(process.cwd(), relativePath);
    if (!existsSync(absolutePath)) return;

    try {
      unlinkSync(absolutePath);
    } catch (error) {
      this.logger.warn(`Failed to delete upload ${relativePath}`, error);
    }
  }

  replaceUploadedFile(
    previousKey: string | undefined | null,
    nextKey: string | undefined | null,
  ): void {
    if (previousKey && previousKey !== nextKey) {
      this.deleteIfUploaded(previousKey);
    }
  }
}
