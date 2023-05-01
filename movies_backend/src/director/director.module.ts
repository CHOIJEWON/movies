import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { DirectorRepository } from './direcotr.repository';
import { DirectorController } from './director.controller';
import { DirectorService } from './director.service';

@Module({
  imports: [PrismaModule],
  providers: [DirectorService, DirectorRepository],
  controllers: [DirectorController],
  exports: [DirectorRepository],
})
export class DirectorModule {}
