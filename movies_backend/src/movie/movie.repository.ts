import {
  DirectedMovie,
  Movie,
  MovieCast,
  MovieGenre,
  Prisma,
  PrismaClient,
} from '@prisma/client';
import {
  CreateMovieWithAssocationInRepositoryDto,
  GetMovieCast,
  GetMovieGenreWithIds,
  MovieAndDirectorId,
  UpdateDirectedMovie,
  UpdateMovieGenre,
  UpdateMovieWithT,
  UpdateRoleNameWithCastId,
} from 'src/commons/DTO/movie.dto';
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

  async getDirectedMovieByIdsWithT(
    tx: PrismaService,
    { movieId, directorId }: MovieAndDirectorId,
  ): Promise<DirectedMovie> {
    return await tx.directedMovie.findFirst({
      where: {
        AND: [{ movieId }, { directorId }],
      },
    });
  }

  async getMovieCastByIdsWith(
    tx: PrismaService,
    { movieId, actorId }: GetMovieCast,
  ): Promise<MovieCast> {
    return await tx.movieCast.findFirst({
      where: {
        AND: [{ movieId }, { actorId }],
      },
    });
  }

  async getOnlyMovieByIdWithT(tx: PrismaService, id: number): Promise<Movie> {
    return await tx.movie.findFirst({
      where: { id },
    });
  }

  async updateDirectedMovieWithT(
    tx: PrismaService,
    { directedId, directorId }: UpdateDirectedMovie,
  ): Promise<DirectedMovie> {
    return await tx.directedMovie.update({
      where: { id: directedId },
      data: { directorId },
    });
  }

  async updateRoleNameWithT(
    tx: PrismaService,
    { castId, roleName }: UpdateRoleNameWithCastId,
  ) {
    return await tx.movieCast.update({
      where: { id: castId },
      data: { roleName },
    });
  }

  async updateMovieCastWithT(
    tx: PrismaService,
    { castId, roleName, actorId },
  ): Promise<MovieCast> {
    return await tx.movieCast.update({
      where: { id: castId },
      data: { roleName, actorId },
    });
  }

  async getMovieGenre(
    tx: PrismaService,
    { movieId, genreId }: GetMovieGenreWithIds,
  ): Promise<MovieGenre> {
    return await tx.movieGenre.findFirst({
      where: {
        AND: [{ movieId }, { genreId }],
      },
    });
  }

  async updateMovieGenre(
    tx: PrismaService,
    { movieGenreId, genreId }: UpdateMovieGenre,
  ): Promise<MovieGenre> {
    return await tx.movieGenre.update({
      where: { id: movieGenreId },
      data: { genreId },
    });
  }

  async updateOnlyMovieWithT(
    tx: PrismaService,
    updateMovie: UpdateMovieWithT,
  ): Promise<Movie> {
    const {
      movieId: id,
      title,
      titleImg,
      originalTitle,
      grade,
      playTime,
      synopsis,
      releaseDate,
    } = updateMovie;
    return await tx.movie.update({
      where: { id },
      data: {
        title,
        titleImg,
        originalTitle,
        grade,
        playTime,
        synopsis,
        releaseDate,
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
