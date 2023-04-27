import { Genre, PrismaClient } from '@prisma/client';

export class GenreRepository {
  prisma = new PrismaClient();

  async createGenre(genre: string): Promise<Genre> {
    return await this.prisma.genre.create({
      data: {
        genre,
      },
    });
  }
}
