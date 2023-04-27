import { Director, PrismaClient } from '@prisma/client';

export class DirectorRepository {
  prisma = new PrismaClient();

  async createDirector(directorName: string): Promise<Director> {
    return await this.prisma.director.create({
      data: { directorName },
    });
  }
}
