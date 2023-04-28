import { Genre, PrismaClient } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

export class GenreRepository {
  prisma = new PrismaClient();

  async createGenre(genre: string): Promise<Genre> {
    return await this.prisma.genre.create({
      data: {
        genre,
      },
    });
  }

  async findMaynGenresByNamesWithT(
    tx: PrismaService,
    genres: string[],
  ): Promise<Genre[]> {
    return await tx.genre.findMany({
      where: { genre: { in: genres } },
    });
  }

  async createGenreWithT(tx: PrismaService, genre: string): Promise<Genre> {
    return await tx.genre.create({ data: { genre } });
  }
}
