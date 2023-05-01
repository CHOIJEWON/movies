import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TeaserController } from './teaser.controller';
import { TeaserRepository } from './teaser.repository';
import { TeaserService } from './teaser.service';

@Module({
  imports: [PrismaModule],
  controllers: [TeaserController],
  providers: [TeaserService, TeaserRepository],
  exports: [TeaserService, TeaserRepository],
})
export class TeaserModule {}
