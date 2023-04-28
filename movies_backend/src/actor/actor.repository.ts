import { PrismaService } from 'src/prisma/prisma.service';

export class ActorRepository {
  async findActorByNameWithT(tx: PrismaService, actorName: string) {
    return await tx.actor.findFirst({ where: { name: actorName } });
  }

  async createActorWithT(tx: PrismaService, actorName: string) {
    return await tx.actor.create({ data: { name: actorName } });
  }
}
