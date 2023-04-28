import { Module } from '@nestjs/common';
import { TeaserController } from './teaser.controller';
import { TeaserRepository } from './teaser.repository';
import { TeaserService } from './teaser.service';

@Module({
  controllers: [TeaserController],
  providers: [TeaserService, TeaserRepository],
  exports: [TeaserService, TeaserRepository],
})
export class TeaserModule {}
