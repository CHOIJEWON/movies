import { HttpException, Injectable } from '@nestjs/common';
import { Genre, Movie, PrismaClient } from '@prisma/client';
import { CreateMovieWithGenreDto } from 'src/commons/DTO/movie.dto';
import { GenreRepository } from 'src/genre/genre.repository';
import { MovieRepository } from './movie.repository';

@Injectable()
export class MovieService {
  constructor(
    private readonly movieRepository: MovieRepository,
    private readonly genrRepository: GenreRepository,
  ) {}

  prisma = new PrismaClient();

  async test(title: string) {
    try {
      return await this.movieRepository.findMovieByTitle(title);
    } catch (e) {
      throw new HttpException(e.message, 500);
    }
  }

  async createMovie(createMovieWithGenre: CreateMovieWithGenreDto) {
    let response;

    const { title, genre } = createMovieWithGenre;
    try {
      await this.prisma.$transaction(async () => {
        const existsMovie = await this.movieRepository.findMovieByTitle(title);

        if (existsMovie)
          throw new HttpException('this movie already exists', 409);

        const insertMovie: Movie = await this.movieRepository.createMovie(
          createMovieWithGenre,
        );

        const insertGenre: Genre = await this.genrRepository.createGenre(genre);

        const {
          id: movieId,
          title: movieTitle,
          originalTitle,
          grade,
          playTime,
          synopsis,
          releaseDate,
        } = insertMovie;

        const { id: genreId, genre: movieGenre } = insertGenre;

        await this.movieRepository.associateMovieAndGenre({
          movieId,
          genreId,
        });

        response = {
          title: movieTitle,
          originalTitle,
          grade,
          playTime,
          synopsis,
          releaseDate,
          genre: movieGenre,
        };
      });

      return response;
    } catch (e) {
      throw new HttpException(e.message, 500);
    } finally {
      await this.prisma.$disconnect();
    }
  }
}
