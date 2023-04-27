import { Movie, MovieGenre, PrismaClient } from '@prisma/client';
import {
  AssociateMovieAndDirectorDto,
  associateMovieAndGenreDto,
  CreateMovieDto,
} from 'src/commons/DTO/movie.dto';

export class MovieRepository {
  prisma = new PrismaClient();

  async findMovieByTitle(title: string): Promise<Movie> {
    return await this.prisma.movie.findFirst({
      where: {
        title,
      },
    });
  }

  async createMovie(createMovieDto: CreateMovieDto): Promise<Movie> {
    const { title, originalTitle, grade, playTime, synopsis, releaseDate } =
      createMovieDto;

    return await this.prisma.movie.create({
      data: {
        title,
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
