import { Module } from '@nestjs/common';
import { ActorController } from './actor.controller';
import { ActorRepository } from './actor.repository';
import { ActorService } from './actor.service';

@Module({
  controllers: [ActorController],
  providers: [ActorService, ActorRepository],
  exports: [ActorService, ActorRepository],
})
export class ActorModule {}
