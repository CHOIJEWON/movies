import { Module } from '@nestjs/common';
import { DirectorRepository } from './direcotr.repository';
import { DirectorController } from './director.controller';
import { DirectorService } from './director.service';

@Module({
  providers: [DirectorService, DirectorRepository],
  controllers: [DirectorController],
  exports: [DirectorRepository],
})
export class DirectorModule {}
