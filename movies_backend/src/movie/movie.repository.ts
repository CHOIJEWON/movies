import { Movie, Prisma, PrismaClient } from '@prisma/client';
import { CreateMovieWithAssocationInRepositoryDto } from 'src/commons/DTO/movie.dto';
import { GetOneMovieWithAssociation } from 'src/commons/interface/movie.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { movieSelectQuery } from './movie.select.query';

export class MovieRepository {
  prisma = new PrismaClient();

  async findMovieByTitleWithT(
    tx: PrismaService,
    title: string,
  ): Promise<Movie> {
    return await tx.movie.findFirst({
      where: {
        title,
      },
    });
  }

  async createMovieWithT(
    tx: PrismaService,
    createMovieWithAssocationInRepositoryDto: CreateMovieWithAssocationInRepositoryDto,
  ): Promise<Movie> {
    const { genresIds, movieCasts, teasers, directorId, ...createMovie } =
      createMovieWithAssocationInRepositoryDto;
    const {
      title,
      titleImg,
      originalTitle,
      grade,
      synopsis,
      playTime,
      releaseDate,
    } = createMovie;
    return await tx.movie.create({
      data: {
        title,
        titleImg,
        originalTitle,
        grade,
        synopsis,
        playTime,
        releaseDate,
        directorMovie: {
          create: [
            {
              directorId,
            },
          ],
        },
        Genre: {
          create: genresIds.map((genreId) => ({
            genreId,
          })),
        },
        movieCast: {
          create: movieCasts.map((cast) => ({
            roleName: cast.roleName,
            actor: cast.actor,
          })),
        },
        Teaser: {
          create: teasers.map((url) => ({ url })),
        },
      },
    });
  }

  async getAllMovies(sortType: string): Promise<GetOneMovieWithAssociation[]> {
    const orderByClause =
      sortType === 'GRADE_DESC'
        ? { grade: Prisma.SortOrder.desc }
        : { createdAt: Prisma.SortOrder.desc };

    return await this.prisma.movie.findMany({
      select: movieSelectQuery,
      orderBy: orderByClause,
    });
  }

  async findMovieByTitle(title: string): Promise<GetOneMovieWithAssociation> {
    return await this.prisma.movie.findFirst({
      where: { title },
      select: movieSelectQuery,
    });
  }

  async findMovieById(movieId: number): Promise<GetOneMovieWithAssociation> {
    return await this.prisma.movie.findFirst({
      where: { id: movieId },
      select: movieSelectQuery,
    });
  }
}
