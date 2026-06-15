import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ImageOptimizerService } from './image-optimizer.service';
import { UploadsService } from './uploads.service';

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

function imageUploadInterceptor() {
  return FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: MAX_UPLOAD_BYTES },
    fileFilter: (_req, file, cb) => {
      if (!ALLOWED_MIME.has(file.mimetype)) {
        cb(
          new BadRequestException(
            'Chỉ chấp nhận ảnh JPEG, PNG, WebP hoặc GIF',
          ) as unknown as Error,
          false,
        );
        return;
      }
      cb(null, true);
    },
  });
}

@UseGuards(JwtAuthGuard)
@Controller('admin/uploads')
export class UploadsController {
  constructor(
    private readonly uploadsService: UploadsService,
    private readonly imageOptimizer: ImageOptimizerService,
  ) {}

  @Post('product-image')
  @UseInterceptors(imageUploadInterceptor())
  async uploadProductImage(@UploadedFile() file: Express.Multer.File) {
    return this.processUpload(file, 'products');
  }

  @Post('news-image')
  @UseInterceptors(imageUploadInterceptor())
  async uploadNewsImage(@UploadedFile() file: Express.Multer.File) {
    return this.processUpload(file, 'news');
  }

  private async processUpload(
    file: Express.Multer.File,
    folder: 'products' | 'news',
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Vui lòng chọn file ảnh');
    }

    const { filename, bytes } = await this.imageOptimizer.optimizeAndSave(
      file.buffer,
      folder,
    );

    const key = `uploads/${folder}/${filename}`;

    return {
      key,
      url: this.uploadsService.getPublicUrl(key),
      size: bytes,
      format: 'webp',
    };
  }
}
