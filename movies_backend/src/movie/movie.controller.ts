import { Body, Controller, Post } from '@nestjs/common';
import { CreateMovieWithAssocationTable } from 'src/commons/DTO/movie.dto';
import { MovieService } from './movie.service';

@Controller('movie')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Post()
  async createMovie(@Body() createWithGenre: CreateMovieWithAssocationTable) {
    return await this.movieService.createMovie(createWithGenre);
  }
}
