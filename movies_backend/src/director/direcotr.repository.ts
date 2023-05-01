import { DirectedMovie, Director, PrismaClient } from '@prisma/client';
import { UpdateDirectorName } from 'src/commons/DTO/director.dto';
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

  async createDirecotWithT(
    tx: PrismaService,
    directorName: string,
  ): Promise<Director> {
    return await tx.director.create({
      data: { directorName },
    });
  }
  async getDirectorByNameWithT(
    tx: PrismaService,
    directorName: string,
  ): Promise<Director> {
    return await tx.director.findFirst({
      where: { directorName },
    });
  }

  async getDirectorByIdWithT(
    tx: PrismaService,
    directorId: number,
  ): Promise<Director> {
    return await tx.director.findFirst({
      where: { id: directorId },
    });
  }

  async updateDirectorNameWithT(
    tx: PrismaService,
    { directorId, directorName }: UpdateDirectorName,
  ): Promise<Director> {
    return await tx.director.update({
      where: { id: directorId },
      data: { directorName },
    });
  }

  async getDirectorConnectMovieByIdWithT(
    tx: PrismaService,
    directorId: number,
  ): Promise<DirectedMovie> {
    return await tx.directedMovie.findFirst({ where: { directorId } });
  }

  async getDiretedMoviesByIdWithT(
    tx: PrismaService,
    directorId: number,
  ): Promise<DirectedMovie[]> {
    return await tx.directedMovie.findMany({
      where: { directorId },
    });
  }

  async deleteDirectorWithT(
    tx: PrismaService,
    direcotrId: number,
  ): Promise<Director> {
    return await tx.director.delete({
      where: { id: direcotrId },
    });
  }

  async deleDirectedMovieWithT(
    tx: PrismaService,
    directorId: number,
  ): Promise<DirectedMovie> {
    return tx.directedMovie.delete({
      where: { id: directorId },
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
