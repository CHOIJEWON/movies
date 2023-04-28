import { Injectable } from '@nestjs/common';
import { Genre } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { GenreRepository } from './genre.repository';

@Injectable()
export class GenreService {
  constructor(private readonly genreRepository: GenreRepository) {}

  async getExistingAndCreateGenes(
    tx: PrismaService,
    genres: string[],
  ): Promise<number[]> {
    const existingGenres: Genre[] =
      await this.genreRepository.findMaynGenresByNamesWithT(tx, genres);

    let allOfGenreIds: number[] = existingGenres.map((genre) => genre.id);

    const newGenres = genres.filter(
      (genre) => !existingGenres.some((g) => g.genre === genre),
    );

    for (const newGenre of newGenres) {
      const createdGenre: Genre = await this.genreRepository.createGenreWithT(
        tx,
        newGenre,
      );
      allOfGenreIds.push(createdGenre.id);
    }

    return allOfGenreIds;
  }
}
