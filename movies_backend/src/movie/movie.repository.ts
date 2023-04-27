import { Movie, MovieGenre, PrismaClient } from '@prisma/client';
import {
  AssociateMovieAndDirectorDto,
  associateMovieAndGenreDto,
  CreateMovieDto,
} from 'src/commons/DTO/movie.dto';
import { PrismaService } from 'src/prisma/prisma.service';

export class MovieRepository {
  prisma = new PrismaClient();

  async findMovieByTitle(tx: PrismaService, title: string): Promise<Movie> {
    return await tx.movie.findFirst({
      where: {
        title,
      },
    });
  }

  async createMovie(createMovieDto: CreateMovieDto): Promise<Movie> {
    const {
      title,
      titleImg,
      originalTitle,
      grade,
      playTime,
      synopsis,
      releaseDate,
    } = createMovieDto;

    return await this.prisma.movie.create({
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

  async associateMovieAndGenre({
    movieId,
    genreId,
  }: associateMovieAndGenreDto): Promise<MovieGenre> {
    return await this.prisma.movieGenre.create({
      data: {
        movieId,
        genreId,
      },
    });
  }

  async associateMovieAndDirector({
    movieId,
    directorId,
  }: AssociateMovieAndDirectorDto) {
    return await this.prisma.directedMovie.create({
      data: { movieId, directorId },
    });
  }
}
