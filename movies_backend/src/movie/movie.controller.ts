import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DirectedMovie, Movie, MovieCast } from '@prisma/client';
import { UpdateDirectorConnectMovie } from 'src/commons/DTO/director.dto';
import {
  ActorNameAndRoleName,
  CreateMovieWithAssocationTable,
  FindMovieByDirectorNameDto,
  GetMovieByTitle,
  GetMoviesByGenresWith,
  GetMoviesByOrderByOption,
  InputGerne,
  UpdateMovieDto,
  UpdateRoleName,
} from 'src/commons/DTO/movie.dto';
import { MovieWithGenreAndAssocaitedTable } from 'src/commons/interface/genre.interface';
import {
  GetOneMovieFormatted,
  GetOneMovieWithAssociation,
  MovieWithDirectorAndAssocationTableProcessFormats,
} from 'src/commons/interface/movie.interface';

import { MovieService } from './movie.service';

@ApiTags('Movie')
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

  @Patch('/:movieId')
  async updateMovie(
    @Body() updateMovieDto: UpdateMovieDto,
    @Param('movieId') movieId: number,
  ): Promise<Movie> {
    return await this.movieService.updateMovie({ movieId, ...updateMovieDto });
  }

  @Patch('/:movieId/cast/:actorId')
  async updateMovieCastRoleName(
    @Param('movieId') movieId: number,
    @Param('actorId') actorId: number,
    @Body() updateRoleName: UpdateRoleName,
  ): Promise<MovieCast> {
    return await this.movieService.updateRoleName({
      actorId,
      movieId,
      roleName: updateRoleName.roleName,
    });
  }

  @Put('/:movieId/cast/:actorId')
  async updateMovieCastConnetion(
    @Param('movieId') movieId: number,
    @Param('actorId') actorId: number,
    @Body() actorInfo: ActorNameAndRoleName,
  ): Promise<MovieCast> {
    return await this.movieService.updateMovieCastConnection({
      movieId,
      actorId,
      roleName: actorInfo.roleName,
      name: actorInfo.name,
    });
  }

  @Patch('/:movieId/director/:directorId')
  async updateMovieConnectDirector(
    @Param('movieId') movieId: number,
    @Param('directorId') directorId: number,
    @Body() updateDirectorName: UpdateDirectorConnectMovie,
  ): Promise<DirectedMovie> {
    return await this.movieService.updateConnectMovieAndDirector({
      movieId,
      directorId,
      updateDirectorName: updateDirectorName.directorName,
    });
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

  @Put('/:movieId/genres/:genreId')
  async updateMovieGenre(
    @Param('movieId') movieId: number,
    @Param('genreId') genreId: number,
    @Body() genreDto: InputGerne,
  ) {
    return await this.movieService.updateMovieGenre({
      movieId,
      genreId,
      genre: genreDto.genre,
    });
  }

  @Get('/title/:title')
  async getMovieByTitle(
    @Param() title: GetMovieByTitle,
  ): Promise<GetOneMovieFormatted> {
    return await this.movieService.getMovieByTitle(title);
  }
}
