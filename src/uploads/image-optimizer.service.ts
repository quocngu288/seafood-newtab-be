import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import sharp from 'sharp';

const FOLDER_LIMITS = {
  products: { maxWidth: 800, maxHeight: 800 },
  news: { maxWidth: 1600, maxHeight: 1200 },
} as const;

@Injectable()
export class ImageOptimizerService {
  async optimizeAndSave(
    buffer: Buffer,
    folder: 'products' | 'news',
  ): Promise<{ filename: string; bytes: number }> {
    const { maxWidth, maxHeight } = FOLDER_LIMITS[folder];
    const destination = join(process.cwd(), 'uploads', folder);

    if (!existsSync(destination)) {
      mkdirSync(destination, { recursive: true });
    }

    let metadata: sharp.Metadata;
    try {
      metadata = await sharp(buffer).metadata();
    } catch {
      throw new BadRequestException('File không phải ảnh hợp lệ');
    }

    if (!metadata.width || !metadata.height) {
      throw new BadRequestException('File không phải ảnh hợp lệ');
    }

    const filename = `${randomUUID()}.webp`;
    const outputPath = join(destination, filename);

    const result = await sharp(buffer, { animated: false })
      .rotate()
      .resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 82, effort: 4 })
      .toFile(outputPath);

    return { filename, bytes: result.size };
  }
}
