import { HttpException, Injectable } from '@nestjs/common';
import { Movie, PrismaClient } from '@prisma/client';
import { CreateMovieDto } from 'src/commons/DTO/movie.dto';
import { MovieRepository } from './movie.repository';

@Injectable()
export class MovieService {
  constructor(private readonly movieRepository: MovieRepository) {}

  prisma = new PrismaClient();

  async test(title: string) {
    try {
      return await this.movieRepository.findMovieByTitle(title);
    } catch (e) {
      throw new HttpException(e.message, 500);
    }
  }

  async createMovie(createMovieDto: CreateMovieDto): Promise<Movie> {
    let movie: Movie;

    const { title, originalTitle, grade, playTime, synopsis, releaseDate } =
      createMovieDto;
    try {
      await this.prisma.$transaction(async () => {
        const existsMovie = await this.movieRepository.findMovieByTitle(title);

        if (existsMovie)
          throw new HttpException('this movie already exists', 409);

        movie = await this.movieRepository.createMovie(createMovieDto);
      });
      return movie;
    } catch (e) {
      throw new HttpException(e.message, 500);
    } finally {
      await this.prisma.$disconnect();
    }
  }
}
