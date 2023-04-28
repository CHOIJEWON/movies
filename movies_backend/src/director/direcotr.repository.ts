import { Director, PrismaClient } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

export class DirectorRepository {
  prisma = new PrismaClient();

  async createDirector(directorName: string): Promise<Director> {
    return await this.prisma.director.create({
      data: { directorName },
    });
  }

  async upsertDirector(
    tx: PrismaService,
    directorName: string,
  ): Promise<Director> {
    return await tx.director.upsert({
      where: { directorName },
      update: {},
      create: { directorName },
    });
  }
}
