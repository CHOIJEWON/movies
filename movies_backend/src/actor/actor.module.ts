import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ActorController } from './actor.controller';
import { ActorRepository } from './actor.repository';
import { ActorService } from './actor.service';

@Module({
  imports: [PrismaModule],
  controllers: [ActorController],
  providers: [ActorService, ActorRepository],
  exports: [ActorService, ActorRepository],
})
export class ActorModule {}
