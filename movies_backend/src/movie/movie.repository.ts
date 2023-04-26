import { Movie, PrismaClient } from '@prisma/client';
import { CreateMovieDto } from 'src/commons/DTO/movie.dto';

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
}
