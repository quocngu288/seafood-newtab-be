import { Module } from '@nestjs/common';
import { ImageOptimizerService } from './image-optimizer.service';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';

@Module({
  controllers: [UploadsController],
  providers: [UploadsService, ImageOptimizerService],
  exports: [UploadsService],
})
export class UploadsModule {}
