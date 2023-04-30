import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Movie } from '@prisma/client';
import {
  CreateMovieWithAssocationTable,
  FindMovieByDirectorNameDto,
  GetMovieByTitle,
  GetMoviesByGenresWith,
  GetMoviesByOrderByOption,
} from 'src/commons/DTO/movie.dto';
import { MovieWithGenreAndAssocaitedTable } from 'src/commons/interface/genre.interface';
import {
  GetOneMovieFormatted,
  GetOneMovieWithAssociation,
  MovieWithDirectorAndAssocationTableProcessFormats,
} from 'src/commons/interface/movie.interface';

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

  @Get()
  async getAllMovies(
    @Query() sortType: GetMoviesByOrderByOption,
  ): Promise<GetOneMovieWithAssociation[]> {
    return await this.movieService.getAllMovies(sortType);
  }

  @Get('/:movieId')
  async getMovieById(
    @Param('movieId') movieId: number,
  ): Promise<GetOneMovieFormatted> {
    return await this.movieService.getMovieById(movieId);
  }

  @Get('/director/:directorName')
  async getMoviesByDirectorName(
    @Param() directorName: FindMovieByDirectorNameDto,
  ): Promise<MovieWithDirectorAndAssocationTableProcessFormats[]> {
    return await this.movieService.getMovieByDirectorName(directorName);
  }

  @Get('/genres/:genre')
  async getMoviesByGenre(
    @Param() genre: GetMoviesByGenresWith,
    @Query() sortType: GetMoviesByOrderByOption,
  ): Promise<MovieWithGenreAndAssocaitedTable[]> {
    return await this.movieService.getMovieByGenre(genre, sortType);
  }

  @Get('/title/:title')
  async getMovieByTitle(
    @Param() title: GetMovieByTitle,
  ): Promise<GetOneMovieFormatted> {
    return await this.movieService.getMovieByTitle(title);
  }
}
