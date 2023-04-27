import { Body, Controller, Post } from '@nestjs/common';
import { Movie } from '@prisma/client';
import { CreateMovieWithAssocationTable } from 'src/commons/DTO/movie.dto';
import { MovieService } from './movie.service';

@Controller('movie')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Post()
  async createMovie(
    @Body() createWithGenre: CreateMovieWithAssocationTable,
  ): Promise<Movie> {
    return await this.movieService.createMovieWithAssociated(createWithGenre);
  }
}
