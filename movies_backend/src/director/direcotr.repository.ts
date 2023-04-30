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

  async getDirectorInfoByNameWithAssociateTable(directorName: string) {
    return await this.prisma.director.findFirst({
      where: { directorName },
      select: {
        directorName: true,
        directedMovie: {
          orderBy: { movie: { createdAt: 'desc' } },
          select: {
            movie: {
              select: {
                id: true,
                title: true,
                titleImg: true,
                originalTitle: true,
                grade: true,
                playTime: true,
                synopsis: true,
                releaseDate: true,
                createdAt: true,
                updatedAt: true,
                Genre: {
                  select: {
                    genre: true,
                  },
                },
                movieCast: {
                  select: {
                    roleName: true,
                    actor: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
                Teaser: {
                  select: { url: true },
                },
              },
            },
          },
        },
      },
    });
  }
}
