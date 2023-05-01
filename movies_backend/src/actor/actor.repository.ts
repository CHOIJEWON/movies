import { Actor, PrismaClient } from '@prisma/client';
import { UpdateActorName } from 'src/commons/DTO/actor.dto';
import { PrismaService } from 'src/prisma/prisma.service';

export class ActorRepository {
  prisma = new PrismaClient();
  async findActorByNameWithT(tx: PrismaService, actorName: string) {
    return await tx.actor.findFirst({ where: { name: actorName } });
  }

  async createActorWithT(tx: PrismaService, actorName: string) {
    return await tx.actor.create({ data: { name: actorName } });
  }

  async getActorByIdWithT(tx: PrismaService, id: number): Promise<Actor> {
    return await tx.actor.findFirst({
      where: { id },
    });
  }

  async updateActorNameWithT(
    tx: PrismaService,
    { actorId, name }: UpdateActorName,
  ): Promise<Actor> {
    return await tx.actor.update({
      where: { id: actorId },
      data: { name },
    });
  }
}
