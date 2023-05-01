import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DirectedMovie, Movie, MovieCast, MovieGenre } from '@prisma/client';
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
import {
  GenreReturn,
  getMovieArray,
  MovieCastReturn,
  ReturnDirectedMovie,
  ReturnMovie,
} from 'src/commons/DTO/swagger/movie.type';
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

  @ApiOperation({
    summary: '영화와 관련된 테이블을 모두 생성함',
  })
  @ApiBody({ type: CreateMovieWithAssocationTable })
  @ApiCreatedResponse({
    description: '성공',
    type: ReturnMovie,
  })
  @ApiConflictResponse({
    description: '영화 타이틀이 이미 존재하는 경우',
    schema: {
      example: {
        status: 409,
        timestamp: '2023-05-01T15:41:29.961Z',
        url: '/movie',
        response: 'THIS_MOVIE_ALREADY_EXISTS',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description:
      '영화 생성에 실패한 경우 // director 테이블과 연결이 실패한 경우 // actor 테이블과 연결이 실패한 경우 // 그 외 알 수 없는 에러',
    schema: {
      example: {
        status: 500,
        timestamp: '2023-05-01T15:41:29.961Z',
        url: '/movie',
        response: 'CAUSE_AN_ERROR_WHILE_CREATE_MOVIE_AND_CONNECT_TABLES',
      },
    },
  })
  @Post()
  async createMovie(
    @Body() createWithGenre: CreateMovieWithAssocationTable,
  ): Promise<Movie> {
    return await this.movieService.createMovieWithAssociated(createWithGenre);
  }

  @ApiOperation({
    summary:
      '생성된 모든 영화 조회, sorType 쿼리로 평점순, 업데이트순 필터링 가능',
  })
  @ApiQuery({
    name: 'sortType',
    required: true,
    description: '영화 정렬 타입',
    enum: ['GRADE_DESC', 'UPDATE_DESC'],
    example: 'GRADE_DESC',
    examples: {
      example1: {
        value: 'GRADE_DESC',
        summary: '영화 평점가 높은순으로 정렬됩니다',
      },
      example2: {
        value: 'UPDATE_DESC',
        summary: '영화가 update된 시간순으로 정렬됩니다',
      },
    },
  })
  @ApiOkResponse({
    description: '성공',
    type: [getMovieArray],
  })
  @ApiInternalServerErrorResponse({
    description: '알 수 없는 에러',
    schema: {
      example: {
        status: 500,
        timestamp: '2023-05-01T15:41:29.961Z',
        url: '/movie',
        response: '...',
      },
    },
  })
  @Get()
  async getAllMovies(
    @Query() sortType: GetMoviesByOrderByOption,
  ): Promise<GetOneMovieWithAssociation[]> {
    return await this.movieService.getAllMovies(sortType);
  }

  @ApiOperation({
    summary: '해당 id를 갖은 영화를 찾습니다',
  })
  @ApiParam({
    name: 'movieId',
    required: true,
    description: '영화 고유 ID',
    example: '24',
  })
  @ApiOkResponse({
    description: '성공',
    type: [getMovieArray],
  })
  @ApiNotFoundResponse({
    description: '존재하지 않는 movie',
    schema: {
      example: {
        status: 404,
        timestamp: '2023-05-01T15:41:29.961Z',
        url: '/movie/24',
        response: 'THERE_IS_NO_MOVIE_WITH_THAT_ID',
      },
    },
  })
  @Get('/:movieId')
  async getMovieById(
    @Param('movieId') movieId: number,
  ): Promise<GetOneMovieFormatted> {
    return await this.movieService.getMovieById(movieId);
  }

  @ApiOperation({
    summary:
      '영화에 관한 데이터만 업데이트합니다 연관된 테이블은 업데이트 하지 않습니다',
  })
  @ApiParam({
    name: 'movieId',
    required: true,
    description: '영화 고유 ID',
    example: '24',
  })
  @ApiBody({ type: UpdateMovieDto })
  @ApiOkResponse({
    description: '성공',
    type: ReturnMovie,
  })
  @ApiNotFoundResponse({
    description: '해당 Id의 영화가 존재하지 않는 경우',
    schema: {
      example: {
        status: 404,
        timestamp: '2023-05-01T15:41:29.961Z',
        url: '/movie/24',
        response: 'NO_MOVIE_HAS_TAHT_ID',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: '영화 업데이트에 실패한 경우 // 알수 없는 에러',
    schema: {
      example: {
        status: 500,
        timestamp: '2023-05-01T15:41:29.961Z',
        url: '/movie/24',
        response: 'CAUSE_AN_ERROR_WHILE_UPDATE_MOVIE',
      },
    },
  })
  @Patch('/:movieId')
  async updateMovie(
    @Body() updateMovieDto: UpdateMovieDto,
    @Param('movieId') movieId: number,
  ): Promise<Movie> {
    return await this.movieService.updateMovie({ movieId, ...updateMovieDto });
  }

  @ApiOperation({
    summary: '영화 데이터를 삭제합니다, 연관된 테이블도 모두 삭제됩니다',
  })
  @ApiParam({
    name: 'movieId',
    required: true,
    description: '영화 고유 ID',
    example: '24',
  })
  @ApiNoContentResponse({ description: '성공' })
  @ApiNotFoundResponse({
    description: '해당 Id의 영화가 존재하지 않는 경우',
    schema: {
      example: {
        status: 404,
        timestamp: '2023-05-01T15:41:29.961Z',
        url: '/movie/24',
        response: 'NO_MOVIE_HAS_TAHT_ID',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: '영화 업데이트에 실패한 경우 // 알수 없는 에러',
    schema: {
      example: {
        status: 500,
        timestamp: '2023-05-01T15:41:29.961Z',
        url: '/movie/24',
        response: 'CAUSE_AN_ERROR_WHILE_DELETE_MOVIE_WITH_ASSOCATED_TABLE',
      },
    },
  })
  @Delete('/:movieId')
  @HttpCode(204)
  async deleteMovie(@Param('movieId') movieId: number): Promise<Movie> {
    return await this.movieService.deleteMovie(movieId);
  }

  @ApiOperation({
    summary: '영화와 관련된 배우의 배역 이름을 수정합니다',
  })
  @ApiParam({
    name: 'movieId',
    required: true,
    description: '영화 고유 ID',
    example: '24',
  })
  @ApiParam({
    name: 'actorId',
    required: true,
    description: '배우 고유 ID',
    example: '32',
  })
  @ApiBody({ type: UpdateRoleName })
  @ApiOkResponse({ type: MovieCastReturn })
  @ApiNotFoundResponse({
    description:
      'movieCast 의 movieId와 acotrId가 모두 일치하는 항목이 없는 경우',
    schema: {
      example: {
        status: 404,
        timestamp: '2023-05-01T15:41:29.961Z',
        url: 'movie/24/cast/32',
        response: 'NO_MOVIE_CAST_HAS_TAHT_ID',
      },
    },
  })
  @ApiResponse({
    status: 304,
    description: 'Body값의 배역 이름과 기존 배역 이름이 같은 경우',
  })
  @ApiInternalServerErrorResponse({
    description: '배역 이름 업데이트에 실패한 경우 // 알 수 없는 에러',
    schema: {
      example: {
        status: 500,
        timestamp: '2023-05-01T15:41:29.961Z',
        url: '/movie',
        response: 'CAUSE_AN_ERROR_WHILE_UPDATE_MOVIE_CAST',
      },
    },
  })
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

  @ApiOperation({
    summary:
      '출연하는 배우를 변경하는 경우 필요하다면 배역의 이름을 변경하는것도 가능',
  })
  @ApiBody({ type: ActorNameAndRoleName })
  @ApiParam({
    name: 'movieId',
    required: true,
    description: '영화 고유 ID',
    example: '24',
  })
  @ApiParam({
    name: 'actorId',
    required: true,
    description: '배우 고유 ID',
    example: '32',
  })
  @ApiOkResponse({ type: MovieCastReturn })
  @ApiResponse({
    status: 304,
    description:
      '배우 혹은 배역이름 모두 변경이 없는 경우 // 배우를 같은 배우로 변경하는 경우',
  })
  @ApiNotFoundResponse({
    description:
      'movieCast 의 movieId와 acotrId가 모두 일치하는 항목이 없는 경우',
    schema: {
      example: {
        status: 404,
        timestamp: '2023-05-01T15:41:29.961Z',
        url: '/movie',
        response: 'NO_MOVIE_CAST_HAS_TAHT_ID',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description:
      '배역 이름을 변경하는데 실패한 경우 // 해당 이름을 갖은(없는 배우와 연결하는 경우) 배우를 생성 실패 // 알 수 없는 에러',
    schema: {
      example: {
        status: 500,
        timestamp: '2023-05-01T15:41:29.961Z',
        url: '/movie',
        response: 'CAUSE_AN_ERROR_WHILE_UPDATE_MOVIE_CAST',
      },
    },
  })
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

  @ApiOperation({
    summary: '영화와 연결된 배우의 출연 정보를 제거합니다',
  })
  @ApiParam({
    name: 'movieId',
    required: true,
    description: '영화 고유 ID',
    example: '24',
  })
  @ApiParam({
    name: 'actorId',
    required: true,
    description: '배우 고유 ID',
    example: '33',
  })
  @ApiNoContentResponse({ description: '성공' })
  @ApiNotFoundResponse({
    description:
      '해당 MovieId와 ActorId를 모두 포함한 MovieCast 정보가 없는 경우',
    schema: {
      example: {
        status: 404,
        timestamp: '2023-05-01T15:41:29.961Z',
        url: '/movie/24/cast/33',
        response: 'NO_MOVIE_CAST_HAS_TAHT_ID',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'MovieCast를 삭제 실패한 경우 // 알 수 없는 에러',
    schema: {
      example: {
        status: 500,
        timestamp: '2023-05-01T15:41:29.961Z',
        url: '/movie/24/cast/33',
        response: 'CAUSE_AN_ERROR_WHILE_DELETE_MOVIE_CAST',
      },
    },
  })
  @Delete('/:movieId/cast/:actorId')
  @HttpCode(204)
  async deleteMovieCast(
    @Param('movieId') movieId: number,
    @Param('actorId') actorId: number,
  ): Promise<MovieCast> {
    return await this.movieService.deleteMovieCast({ movieId, actorId });
  }

  @ApiOperation({
    summary:
      '영화와 연결된 감독의 연결을 변경합니다, 해당 이름을 갖은 감독이 없다면 생성후 연결합니다',
  })
  @ApiParam({
    name: 'movieId',
    required: true,
    description: '영화 고유 ID',
    example: '24',
  })
  @ApiParam({
    name: 'directorId',
    required: true,
    description: '감독 고유 ID',
    example: '10',
  })
  @ApiBody({ type: UpdateDirectorConnectMovie })
  @ApiOkResponse({ type: ReturnDirectedMovie })
  @ApiResponse({
    status: 304,
    description: '변경할 감독의 이름과 현재 감독의 이름이 같은 경우',
  })
  @ApiNotFoundResponse({
    description: '해당 배우와 감독의 ID를 모두 갖은 DirectedMovie가 없는 경우',
    schema: {
      example: {
        status: 404,
        timestamp: '2023-05-01T15:41:29.961Z',
        url: '/movie/24/director/10',
        response: 'NO_DIRECTED_MOIVE_HAS_TAHT_ID',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description:
      'DirectedMovie를 업데이트 실패한 경우 // 새로운 감독을 생성하는데 실패한 경우 // 알 수 없는 에러',
    schema: {
      example: {
        status: 500,
        timestamp: '2023-05-01T15:41:29.961Z',
        url: '/movie/24/director/10',
        response: 'CAUSE_AN_ERROR_WHILE_UPDATE_DIRECTED_MOVE',
      },
    },
  })
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

  @ApiOperation({
    summary: '영화와 감독의 관계를 제거합니다',
  })
  @ApiParam({
    name: 'movieId',
    required: true,
    description: '영화 고유 ID',
    example: '24',
  })
  @ApiParam({
    name: 'directorId',
    required: true,
    description: '배우 고유 ID',
    example: '10',
  })
  @ApiNoContentResponse({ description: '성공' })
  @ApiNotFoundResponse({
    description:
      '해당 MovieId와 DircetorId를 모두 포함한 DirectedMovie 정보가 없는 경우',
    schema: {
      example: {
        status: 404,
        timestamp: '2023-05-01T15:41:29.961Z',
        url: '/movie/24/director/33',
        response: 'NO_DIRECTED_MOVIE_HAS_TAHT_ID',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Directed Movie 삭제에 실패한 경우 //  알 수 없는 에러',
    schema: {
      example: {
        status: 500,
        timestamp: '2023-05-01T15:41:29.961Z',
        url: '/movie/24/cast/33',
        response: 'AUSE_AN_ERROR_WHILE_DELETE_MOVIE_CAST',
      },
    },
  })
  @Delete('/:movieId/director/:directorId')
  @HttpCode(204)
  async deleteDirectedMovie(
    @Param('movieId') movieId: number,
    @Param('directorId') directorId: number,
  ): Promise<DirectedMovie> {
    return await this.movieService.deleteDirectedMovie({ movieId, directorId });
  }

  @ApiOperation({
    summary: '특정 이름을 갖은 감독이 제작한 모든 영화를 정렬합니다',
  })
  @ApiParam({
    name: 'directorId',
    required: true,
    description: '감독 고유 ID',
    example: '10',
  })
  @ApiOkResponse({ type: getMovieArray })
  @ApiInternalServerErrorResponse({
    description: '해당 이름을 갖은 감독이 존재하지 않는 경우// 알 수 없는 에러',
    schema: {
      example: {
        status: 500,
        timestamp: '2023-05-01T15:41:29.961Z',
        url: '/movie/director/10',
        response: 'THERE_IS_NO_DIRECTOR_WITH_THAT_NAME',
      },
    },
  })
  @Get('/director/:directorName')
  async getMoviesByDirectorName(
    @Param() directorName: FindMovieByDirectorNameDto,
  ): Promise<MovieWithDirectorAndAssocationTableProcessFormats[]> {
    return await this.movieService.getMovieByDirectorName(directorName);
  }

  @ApiOperation({
    summary: '특정 장르를 갖은 영화를 정렬합니다',
  })
  @ApiParam({
    name: 'genre',
    description: '영화 장르',
    required: true,
    enum: [
      'ACTION',
      'COMEDY',
      'DRAMA',
      'HORROR',
      'THRILLER',
      'SF',
      'FANTASY',
      'ANIMATION',
      'DOCUMENT',
    ],
    examples: {
      example1: {
        value: 'ACTION',
        summary: '액션 장르',
      },
      example2: {
        value: 'COMEDY',
        summary: '코미디 장르',
      },
    },
  })
  @ApiQuery({
    name: 'sortType',
    required: true,
    description: '영화 정렬 타입',
    enum: ['GRADE_DESC', 'UPDATE_DESC'],
    example: 'GRADE_DESC',
    examples: {
      example1: {
        value: 'GRADE_DESC',
        summary: '특정 장르의 영화들이 평점이 높은순으로 정렬됩니다',
      },
      example2: {
        value: 'UPDATE_DESC',
        summary: '특정 장르의 영화들이 update된 시간순으로 정렬됩니다',
      },
    },
  })
  @ApiOkResponse({ type: getMovieArray })
  @ApiInternalServerErrorResponse({
    description: '알 수 없는 에러',
    schema: {
      example: {
        status: 500,
        timestamp: '2023-05-01T15:41:29.961Z',
        url: '/movie/genre/comedy?',
        response: 'error message...',
      },
    },
  })
  @Get('/genres/:genre')
  async getMoviesByGenre(
    @Param() genre: GetMoviesByGenresWith,
    @Query() sortType: GetMoviesByOrderByOption,
  ): Promise<MovieWithGenreAndAssocaitedTable[]> {
    return await this.movieService.getMovieByGenre(genre, sortType);
  }

  @ApiOperation({
    summary: '영화와 장르의 관계를 제거합니다',
  })
  @ApiParam({
    name: 'movieId',
    required: true,
    description: '영화 고유 ID',
    example: '24',
  })
  @ApiParam({
    name: 'genreId',
    required: true,
    description: '장르 고유 ID',
    example: '13',
  })
  @ApiNoContentResponse({ description: '성공' })
  @ApiNotFoundResponse({
    description:
      '해당 영화가 존재하지 않는경우, 영화와 연결된 장르가 존재하지 않는 경우',
    schema: {
      example: {
        status: 404,
        timestamp: '2023-05-01T15:41:29.961Z',
        url: '/movie/24/genres/13',
        response: 'NO_MOVIE_GENRE_HAS_TAHT_ID',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: '영화와 연결된 장르를 삭제하지 못한 경우//  알 수 없는 에러',
    schema: {
      example: {
        status: 500,
        timestamp: '2023-05-01T15:41:29.961Z',
        url: '/movie/24/genres/13',
        response: 'CAUSE_AN_ERROR_WHILE_DELETE_MOVIE_CAST',
      },
    },
  })
  @Delete(':movieId/genres/:genreId')
  @HttpCode(204)
  async deleteMovieGenre(
    @Param('movieId') movieId: number,
    @Param('genreId') genreId: number,
  ): Promise<MovieGenre> {
    return await this.movieService.deleteMovieGenre({ movieId, genreId });
  }

  @ApiOperation({
    summary: '영화의 장르를 업데이트 합니다',
  })
  @ApiParam({
    name: 'movieId',
    required: true,
    description: '영화 고유 ID',
    example: '24',
  })
  @ApiParam({
    name: 'genreId',
    required: true,
    description: '장르 고유 ID',
    example: '13',
  })
  @ApiBody({ type: InputGerne })
  @ApiOkResponse({ description: '성공', type: GenreReturn })
  @ApiResponse({
    status: 304,
    description: '변경할 장르와 현재 장르가 같은 경우',
  })
  @ApiNotFoundResponse({
    description: '영화와 연결된 장르가 존재하지 않는 경우',
    schema: {
      example: {
        status: 404,
        timestamp: '2023-05-01T15:41:29.961Z',
        url: '/movie/24/genres/13',
        response: 'NO_MOVIE_GENRE_HAS_TAHT_ID',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: '영화와 연결된 장르를 업데이트 못한 경우//  알 수 없는 에러',
    schema: {
      example: {
        status: 500,
        timestamp: '2023-05-01T15:41:29.961Z',
        url: '/movie/24/genres/13',
        response: 'CAUSE_AN_ERROR_WHILE_UPDATE_MOVIE_GENRE',
      },
    },
  })
  @Put('/:movieId/genres/:genreId')
  async updateMovieGenre(
    @Param('movieId') movieId: number,
    @Param('genreId') genreId: number,
    @Body() genreDto: InputGerne,
  ): Promise<MovieGenre> {
    return await this.movieService.updateMovieGenre({
      movieId,
      genreId,
      genre: genreDto.genre,
    });
  }

  @ApiOperation({
    summary: '영화를 제목으로 찾습니다',
  })
  @ApiParam({
    name: 'title',
    required: true,
    description: '영화 제목',
    example: '매트릭스',
  })
  @ApiOkResponse({ description: '성공', type: getMovieArray })
  @Get('/title/:title')
  async getMovieByTitle(
    @Param() title: GetMovieByTitle,
  ): Promise<GetOneMovieFormatted> {
    return await this.movieService.getMovieByTitle(title);
  }
}
