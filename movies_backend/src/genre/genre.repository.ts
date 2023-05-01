import { Genre, Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

export class GenreRepository {
  prisma = new PrismaClient();

  async createGenreWithT(tx: PrismaService, genre: string): Promise<Genre> {
    return await tx.genre.create({ data: { genre } });
  }

  async findMaynGenresByNamesWithT(
    tx: PrismaService,
    genres: string[],
  ): Promise<Genre[]> {
    return await tx.genre.findMany({
      where: { genre: { in: genres } },
    });
  }

  async getGenreById(tx: PrismaService, genre: string): Promise<Genre> {
    return await tx.genre.findFirst({
      where: { genre },
    });
  }

  async getMoviesByGenre(genre: string, sortType: string) {
    const orderByClause =
      sortType === 'GRADE_DESC'
        ? { grade: Prisma.SortOrder.asc }
        : { createdAt: Prisma.SortOrder.desc };

    return await this.prisma.genre.findFirst({
      where: { genre },
      select: {
        genre: true,
        movieGenre: {
          orderBy: { movie: orderByClause },
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
                directorMovie: {
                  select: {
                    director: {
                      select: {
                        directorName: true,
                      },
                    },
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
