import { Body, Controller, Param, Put } from '@nestjs/common';
import { Actor } from '@prisma/client';
import { ActorService } from './actor.service';

@Controller('actor')
export class ActorController {
  constructor(private readonly actorService: ActorService) {}

  @Put('/:actorId')
  async updateActorName(
    @Param('actorId') actorId: number,
    @Body('name') actorName: string,
  ): Promise<Actor> {
    return await this.actorService.updateActorName({
      actorId,
      name: actorName,
    });
  }
}
