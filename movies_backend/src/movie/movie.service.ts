import { HttpException, Injectable } from '@nestjs/common';
import { Director, Genre, Movie, PrismaClient } from '@prisma/client';
import { CreateMovieWithAssocationTable } from 'src/commons/DTO/movie.dto';
import { DirectorRepository } from 'src/director/direcotr.repository';
import { GenreRepository } from 'src/genre/genre.repository';
import { MovieRepository } from './movie.repository';

@Injectable()
export class MovieService {
  constructor(
    private readonly movieRepository: MovieRepository,
    private readonly genrRepository: GenreRepository,
    private readonly directorRepository: DirectorRepository,
  ) {}

  prisma = new PrismaClient();

  async test(title: string) {
    try {
      return await this.movieRepository.findMovieByTitle(title);
    } catch (e) {
      throw new HttpException(e.message, 500);
    }
  }

  async createMovie(createMovieWithGenre: CreateMovieWithAssocationTable) {
    let response;

    const { title, genre, directorName } = createMovieWithGenre;
    try {
      await this.prisma.$transaction(async () => {
        // Determine if the movie already exists
        const existsMovie = await this.movieRepository.findMovieByTitle(title);

        // movie already exists
        if (existsMovie)
          throw new HttpException('this movie already exists', 409);

        // create movie
        const insertMovie: Movie = await this.movieRepository.createMovie(
          createMovieWithGenre,
        );

        // create genre
        const insertGenre: Genre = await this.genrRepository.createGenre(genre);

        // create director
        const insertDirector: Director =
          await this.directorRepository.createDirector(directorName);

        // Properties pulled out by structural decomposition assignment
        const {
          id: movieId,
          title: movieTitle,
          originalTitle,
          grade,
          playTime,
          synopsis,
          releaseDate,
        } = insertMovie;
        const { id: directorId, directorName: pdName } = insertDirector;
        const { id: genreId, genre: movieGenre } = insertGenre;

        // Genre and Movie are connected using a foreign key
        await this.movieRepository.associateMovieAndGenre({
          movieId,
          genreId,
        });

        // Director and Movie are connected using a foreign key
        await this.movieRepository.associateMovieAndDirector({
          movieId,
          directorId,
        });

        // Define return value
        response = {
          title: movieTitle,
          originalTitle,
          grade,
          playTime,
          synopsis,
          releaseDate,
          genre: movieGenre,
          directorName: pdName,
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
