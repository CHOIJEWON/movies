import { HttpException, Injectable } from '@nestjs/common';
import {
  DirectedMovie,
  Movie,
  MovieCast,
  MovieGenre,
  Prisma,
} from '@prisma/client';
import { ActorRepository } from 'src/actor/actor.repository';
import { ActorService } from 'src/actor/actor.service';
import {
  CreateMovieWithAssocationTable,
  FindMovieByDirectorNameDto,
  GetMovieByTitle,
  GetMoviesByGenresWith,
  GetMoviesByOrderByOption,
  MovieGenreDto,
  UpdateDirectedMovieByDirectorName,
  UpdateMovieCastConnection,
  UpdateMovieWithT,
  UpdateRoleNameWithIds,
} from 'src/commons/DTO/movie.dto';
import { MovieWithGenreAndAssocaitedTable } from 'src/commons/interface/genre.interface';
import {
  GetOneMovieFormatted,
  GetOneMovieWithAssociation,
  MovieWithDirectorAndAssocationTableProcessFormats,
} from 'src/commons/interface/movie.interface';
import { DirectorRepository } from 'src/director/direcotr.repository';
import { GenreRepository } from 'src/genre/genre.repository';
import { GenreService } from 'src/genre/genre.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { TeaserRepository } from 'src/teaser/teaser.repository';
import { TeaserService } from 'src/teaser/teaser.service';
import { MovieRepository } from './movie.repository';
@Injectable()
export class MovieService {
  constructor(
    private readonly movieRepository: MovieRepository,
    private readonly teaserRepository: TeaserRepository,
    private readonly genreService: GenreService,
    private readonly genreRpository: GenreRepository,
    private readonly actorService: ActorService,
    private readonly actorRepository: ActorRepository,
    private readonly prismaService: PrismaService,
    private readonly directorRepository: DirectorRepository,
    private readonly teaserService: TeaserService,
  ) {}

  async createMovieWithAssociated(
    createMovieWithAssocationTable: CreateMovieWithAssocationTable,
  ): Promise<Movie> {
    let response;

    const { directorName, genres, actorDetails, teasers, ...createMovie } =
      createMovieWithAssocationTable;

    const { title }: Prisma.MovieCreateInput = createMovie;

    try {
      await this.prismaService.$transaction(async (tx: PrismaService) => {
        // Determine if the movie already exists
        const existingMovie: Movie =
          await this.movieRepository.findMovieByTitleWithT(tx, title);

        // movie already exists exception
        if (existingMovie)
          throw new HttpException('THIS_MOVIE_ALREADY_EXISTS', 409);

        const genresIds = await this.genreService.getExistingAndCreateGenes(
          tx,
          genres,
        );

        // existing director
        const existingDirectorOrCreate =
          await this.directorRepository.upsertDirector(tx, directorName);

        if (!existingDirectorOrCreate)
          throw new HttpException(
            'CAUSE_AN_ERROR_WHILE_CONTECT_DIRECTOR_ENTITY',
            500,
          );

        const { id: directorId } = existingDirectorOrCreate;

        const movieCasts = await this.actorService.getExistingAndCreateActor(
          tx,
          actorDetails,
        );

        if (!movieCasts)
          throw new HttpException(
            'CAUSE_AN_ERROR_WHILE_CONECT_ACTOR_ENTITY',
            500,
          );

        const newTeasers = await this.teaserService.createTeaser(tx, teasers);

        if (!newTeasers)
          throw new HttpException('CREATE_TEASER_ERROR_WHILE_CONTECT_', 500);

        // create movie with connection another table
        const createMovieWithAssociated =
          await this.movieRepository.createMovieWithT(tx, {
            ...createMovie,
            directorId,
            genresIds,
            movieCasts,
            teasers: newTeasers,
          });

        if (!createMovieWithAssociated)
          throw new Error(
            'CAUSE_AN_ERROR_WHILE_CREATE_MOVIE_AND_CONNECT_TABLES',
          );

        response = createMovieWithAssociated;
      });
      return response;
    } catch (e) {
      const errorStatusMap = {
        THIS_MOVIE_ALREADY_EXISTS: 409,
        CAUSE_AN_ERROR_WHILE_CONTECT_DIRECTOR_ENTITY: 500,
        CREATE_ACTOR_ERROR_WHILE_CONTECT_MOVIE_ENTITY: 500,
        CAUSE_AN_ERROR_WHILE_CREATE_MOVIE_AND_CONNECT_TABLES: 500,
      };

      const statusCode = errorStatusMap[e.message] || 500;

      throw new HttpException(e.message, statusCode);
    } finally {
      await this.prismaService.$disconnect();
    }
  }

  async getAllMovies({
    sortType,
  }: GetMoviesByOrderByOption): Promise<GetOneMovieWithAssociation[]> {
    try {
      const allMovies = await this.movieRepository.getAllMovies(sortType);

      if (!allMovies) return [];

      const formatted = this.formattedGetAllMoives(allMovies);

      return formatted;
    } catch (e) {
      throw new HttpException(e.message, 500);
    }
  }

  async getMovieByDirectorName({
    directorName,
  }: FindMovieByDirectorNameDto): Promise<
    MovieWithDirectorAndAssocationTableProcessFormats[]
  > {
    try {
      const existingDirector =
        await this.directorRepository.getDirectorInfoByNameWithAssociateTable(
          directorName,
        );

      if (!existingDirector)
        throw new Error('THERE_IS_NO_DIRECTOR_WITH_THAT_NAME');

      const { directedMovie: directedMovies, directorName: productDriector } =
        existingDirector;

      if (directedMovies.length === 0) return [];

      const formattedMovies = directedMovies.map((directedMovie) => {
        const { movie } = directedMovie;
        const {
          id,
          title,
          titleImg,
          originalTitle,
          grade,
          playTime,
          synopsis,
          releaseDate,
          createdAt,
          updatedAt,
          Genre: Genres,
          movieCast: movieCasts,
          Teaser: Teasers,
        } = movie;

        return {
          id,
          title,
          titleImg,
          originalTitle,
          productDriector,
          grade,
          playTime,
          synopsis,
          releaseDate,
          createdAt,
          updatedAt,
          Genre: Genres.map((genre) => genre.genre.genre),
          movieCast: movieCasts.map((cast) => ({
            roleName: cast.roleName,
            actor: cast.actor.name,
          })),
          Teaser: Teasers.map((teaser) => teaser.url),
        };
      });

      return formattedMovies;
    } catch (e) {
      if ((e.message = 'THERE_IS_NO_DIRECTOR_WITH_THAT_NAME')) {
        throw new HttpException(e.message, 404);
      }
      throw new HttpException(e.message, 500);
    }
  }

  async getMovieByGenre(
    { genre }: GetMoviesByGenresWith,
    { sortType }: GetMoviesByOrderByOption,
  ): Promise<MovieWithGenreAndAssocaitedTable[]> {
    try {
      const existingMovieOnGenre = await this.genreRpository.getMoviesByGenre(
        genre,
        sortType,
      );

      if (!existingMovieOnGenre) return [];

      const { movieGenre: moviesGenre, genre: outPutGenre } =
        existingMovieOnGenre;

      const formattedMovies = moviesGenre.map((genreMovie) => {
        const { movie } = genreMovie;
        const {
          id,
          title,
          titleImg,
          originalTitle,
          grade,
          playTime,
          synopsis,
          releaseDate,
          createdAt,
          updatedAt,
          directorMovie,
          movieCast: movieCasts,
          Teaser: Teasers,
        } = movie;

        return {
          id,
          title,
          titleImg,
          originalTitle,
          productDriector: directorMovie.map(
            (movie) => movie.director.directorName,
          ),
          grade,
          playTime,
          synopsis,
          releaseDate,
          createdAt,
          updatedAt,
          genre: outPutGenre,
          movieCast: movieCasts.map((cast) => ({
            roleName: cast.roleName,
            actor: cast.actor.name,
          })),
          Teaser: Teasers.map((teaser) => teaser.url),
        };
      });

      return formattedMovies;
    } catch (e) {
      throw new HttpException(e.message, 500);
    }
  }

  async getMovieById(movieId: number): Promise<GetOneMovieFormatted> {
    try {
      const existingMovie = await this.movieRepository.findMovieById(movieId);

      if (!existingMovie) throw new Error('THERE_IS_NO_MOVIE_WITH_THAT_ID');

      const formattedMovie = this.formattedGetOneMovie(existingMovie);

      return formattedMovie;
    } catch (e) {
      if ((e.message = 'THERE_IS_NO_MOVIE_WITH_THAT_ID'))
        throw new HttpException('THERE_IS_NO_MOVIE_WITH_THAT_ID', 404);
      throw new HttpException(e.message, 500);
    }
  }

  async getMovieByTitle({
    title,
  }: GetMovieByTitle): Promise<GetOneMovieFormatted> {
    try {
      const existingMovie = await this.movieRepository.findMovieByTitle(title);

      if (!existingMovie) throw new Error('THERE_IS_NO_MOVIE_WITH_THAT_TITLE');

      const formattedMovie = this.formattedGetOneMovie(existingMovie);

      return formattedMovie;
    } catch (e) {
      if ((e.message = 'THERE_IS_NO_MOVIE_WITH_THAT_TITLE'))
        throw new HttpException(e.message, 404);
      throw new HttpException(e.message, 500);
    }
  }

  async updateMovie({
    movieId,
    ...updateMovieDto
  }: UpdateMovieWithT): Promise<Movie> {
    try {
      const updateMovie = await this.prismaService.$transaction(
        async (tx: PrismaService) => {
          const existingMovie =
            await this.movieRepository.getOnlyMovieByIdWithT(tx, movieId);

          if (!existingMovie) throw new Error('NO_MOVIE_HAS_TAHT_ID');

          const updateMovie = await this.movieRepository.updateOnlyMovieWithT(
            tx,
            { movieId, ...updateMovieDto },
          );

          if (!updateMovie)
            throw new Error('CAUSE_AN_ERROR_WHILE_UPDATE_MOVIE');

          return updateMovie;
        },
      );

      return updateMovie;
    } catch (e) {
      const errorStatusMap = {
        NO_MOVIE_HAS_TAHT_ID: 404,
        CAUSE_AN_ERROR_WHILE_UPDATE_MOVIE: 500,
      };

      const statusCode = errorStatusMap[e.message] || 500;

      throw new HttpException(e.message, statusCode);
    }
  }

  async updateConnectMovieAndDirector({
    movieId,
    directorId,
    updateDirectorName,
  }: UpdateDirectedMovieByDirectorName): Promise<DirectedMovie> {
    try {
      const updateMovie = await this.prismaService.$transaction(
        async (tx: PrismaService) => {
          const existingDirectedMovie =
            await this.movieRepository.getDirectedMovieByIdsWithT(tx, {
              movieId,
              directorId,
            });

          if (!existingDirectedMovie)
            throw new Error('NO_DIRECTED_MOIVE_HAS_TAHT_ID');

          const existingDirector =
            await this.directorRepository.getDirectorByNameWithT(
              tx,
              updateDirectorName,
            );

          if (existingDirector.directorName === updateDirectorName)
            throw new Error('NO_CHANGE_IN_DIRECTOR_NAME');

          // 이미 존재하는 directed movie
          const { id: directeMoviedId } = existingDirectedMovie;

          if (!existingDirector) {
            const createDirecotr =
              await this.directorRepository.createDirecotWithT(
                tx,
                updateDirectorName,
              );

            if (!createDirecotr)
              throw new Error('CAUSE_AN_ERROR_WHILE_CREATE_DIRECTOR');

            const { id: updateDirectorId } = createDirecotr;

            const updateDiretedMoive =
              await this.movieRepository.updateDirectedMovieWithT(tx, {
                directedId: directeMoviedId,
                directorId: updateDirectorId,
              });

            if (!updateDiretedMoive)
              throw new Error('CAUSE_AN_ERROR_WHILE_UPDATE_DIRECTED_MOVE');

            return updateDiretedMoive;
          }
          // 업데이트 해야 되는 driector가 이미 존재하는 경우
          const { id: existingDirectorId } = existingDirector;

          const updateDirectedMovie =
            await this.movieRepository.updateDirectedMovieWithT(tx, {
              directedId: directeMoviedId,
              directorId: existingDirectorId,
            });

          if (!updateDirectedMovie)
            throw new Error('CAUSE_AN_ERROR_WHILE_UPDATE_DIRECTED_MOVE');

          return updateDirectedMovie;
        },
      );

      return updateMovie;
    } catch (e) {
      const errorStatusMap = {
        NO_DIRECTED_MOIVE_HAS_TAHT_ID: 404,
        NO_CHANGE_IN_DIRECTOR_NAME: 304,
        CAUSE_AN_ERROR_WHILE_CREATE_DIRECTOR: 500,
        CAUSE_AN_ERROR_WHILE_UPDATE_DIRECTED_MOVE: 500,
      };

      const statusCode = errorStatusMap[e.message] || 500;

      throw new HttpException(e.message, statusCode);
    }
  }

  async updateRoleName({
    actorId,
    movieId,
    roleName,
  }: UpdateRoleNameWithIds): Promise<MovieCast> {
    try {
      const updateRoleName = await this.prismaService.$transaction(
        async (tx: PrismaService) => {
          const existingMovieCast =
            await this.movieRepository.getMovieCastByIdsWith(tx, {
              actorId,
              movieId,
            });

          if (!existingMovieCast) throw new Error('NO_MOVIE_CAST_HAS_TAHT_ID');

          if (existingMovieCast.roleName === roleName)
            throw new Error('NO_CHANGE_IN_ROLE_NAME');

          const { id: castId } = existingMovieCast;

          const updateRoleName = await this.movieRepository.updateRoleNameWithT(
            tx,
            {
              castId,
              roleName,
            },
          );

          if (!updateRoleName)
            throw new Error('CAUSE_AN_ERROR_WHILE_UPDATE_MOVIE_CAST');

          return updateRoleName;
        },
      );
      return updateRoleName;
    } catch (e) {
      const errorStatusMap = {
        NO_MOVIE_CAST_HAS_TAHT_ID: 404,
        NO_CHANGE_IN_ROLE_NAME: 304,
        CAUSE_AN_ERROR_WHILE_UPDATE_MOVIE_CAST: 500,
      };

      const statusCode = errorStatusMap[e.message] || 500;

      throw new HttpException(e.message, statusCode);
    }
  }

  async updateMovieCastConnection({
    movieId,
    actorId,
    roleName,
    name,
  }: UpdateMovieCastConnection): Promise<MovieCast> {
    try {
      const updateMovieCastConnect = await this.prismaService.$transaction(
        async (tx: PrismaService) => {
          // 해당 영화에 출연진이 있는지 조사
          const existingMovieCast =
            await this.movieRepository.getMovieCastByIdsWith(tx, {
              movieId,
              actorId,
            });

          // 없다면 에러
          if (!existingMovieCast) throw new Error('NO_MOVIE_CAST_HAS_TAHT_ID');

          // 기존 Connection actor
          const existingActor = await this.actorRepository.getActorByIdWithT(
            tx,
            existingMovieCast.actorId,
          );

          // 유저가 변경 사항이 극중 역할과 배우 이름 둘중 아무것도 변경 사항이 없는 경우
          if (
            existingActor.name === name &&
            existingMovieCast.roleName === roleName
          ) {
            throw new Error('NOT_CHANGE_ANYTHING');
          } else if (existingActor.name === name) {
            throw new Error('NOT_CHANGE_ACTOR');
          }

          // MovieCast Id 추출
          const { id: castId } = existingMovieCast;

          // 업데이트를 하기 위한 body값의 actor를 조사
          const existingActorToUpdate =
            await this.actorRepository.findActorByNameWithT(tx, name);

          if (!existingActorToUpdate) {
            // 해당 이름을 갖은 actor가 존재하지 않는 경우

            // 해당 이름을 갖은 Actor 생성
            const createActor = await this.actorRepository.createActorWithT(
              tx,
              name,
            );

            // 생성 과정에 오류
            if (!createActor)
              throw new Error('CAUSE_AN_ERROR_WHILE_CREATE_ACTOR');

            const { id: createActorId } = createActor;

            // 존재하던 cast에 Update
            const updateMovieCast =
              await this.movieRepository.updateMovieCastWithT(tx, {
                castId,
                roleName,
                actorId: createActorId,
              });

            if (!updateMovieCast)
              throw new Error('CAUSE_AN_ERROR_WHILE_UPDATE_MOVIE_CAST');

            return updateMovieCast;
          }

          // update를 위한 actor가 이미 존재하는 경우
          const { id: existingActorId } = existingActorToUpdate;

          const updateMovieCast =
            await this.movieRepository.updateMovieCastWithT(tx, {
              castId,
              roleName,
              actorId: existingActorId,
            });

          if (!updateMovieCast)
            throw new Error('CAUSE_AN_ERROR_WHILE_UPDATE_MOVIE_CAST');

          return updateMovieCast;
        },
      );

      return updateMovieCastConnect;
    } catch (e) {
      const errorStatusMap = {
        NO_MOVIE_CAST_HAS_TAHT_ID: 404,
        NOT_CHANGE_ANYTHING: 304,
        NOT_CHANGE_ACTOR: 304,
        CAUSE_AN_ERROR_WHILE_UPDATE_MOVIE_CAST: 500,
        CAUSE_AN_ERROR_WHILE_CREATE_ACTOR: 500,
      };

      const statusCode = errorStatusMap[e.message] || 500;

      throw new HttpException(e.message, statusCode);
    }
  }

  async updateMovieGenre({
    movieId,
    genreId,
    genre,
  }: MovieGenreDto): Promise<MovieGenre> {
    try {
      const updateMovieGenre = await this.prismaService.$transaction(
        async (tx: PrismaService) => {
          const existingMovieGenre = await this.movieRepository.getMovieGenre(
            tx,
            { movieId, genreId },
          );

          const updateToGenre = await this.genreRpository.getGenreById(
            tx,
            genre,
          );

          if (!existingMovieGenre)
            throw new Error('NO_MOVIE_GENRE_HAS_TAHT_ID');

          const { id: movieGenreId } = existingMovieGenre;

          const { id: existingGenreId, genre: existingGenre } = updateToGenre;

          if (existingGenre === genre) throw new Error('NO_CHANGE_IN_GENRE');

          const updateMovieGenre = await this.movieRepository.updateMovieGenre(
            tx,
            { movieGenreId, genreId: existingGenreId },
          );

          if (!updateMovieGenre)
            throw new Error('CAUSE_AN_ERROR_WHILE_UPDATE_MOVIE_GENRE');

          return updateMovieGenre;
        },
      );

      return updateMovieGenre;
    } catch (e) {
      const errorStatusMap = {
        NO_MOVIE_CAST_HAS_TAHT_ID: 404,
        NO_CHANGE_IN_GENRE: 304,
        CAUSE_AN_ERROR_WHILE_UPDATE_MOVIE_GENRE: 500,
      };

      const statusCode = errorStatusMap[e.message] || 500;

      throw new HttpException(e.message, statusCode);
    }
  }

  formattedGetOneMovie(existingMovie) {
    const {
      directorMovie,
      Genre,
      movieCast: movieCasts,
      ...movieInfo
    } = existingMovie;

    return {
      id: movieInfo.id,
      title: movieInfo.title,
      titleImg: movieInfo.titleImg,
      originalTitle: movieInfo.originalTitle,
      grade: movieInfo.grade,
      playTime: movieInfo.playTime,
      synopsis: movieInfo.synopsis,
      releaseDate: movieInfo.releaseDate,
      createdAt: movieInfo.createdAt,
      updatedAt: movieInfo.updatedAt,
      director: directorMovie.map((d) => d.director.directorName),
      Genre: Genre.map((g) => g.genre.genre),
      movieCast: movieCasts.map((cast) => ({
        roleName: cast.roleName,
        actor: cast.actor.name,
      })),
    };
  }

  formattedGetAllMoives(existingMovie) {
    const formattedExistingMovies = existingMovie.map((test) => {
      const {
        directorMovie,
        Genre,
        movieCast: movieCasts,
        ...movieInfo
      } = test;

      return {
        id: movieInfo.id,
        title: movieInfo.title,
        titleImg: movieInfo.titleImg,
        originalTitle: movieInfo.originalTitle,
        grade: movieInfo.grade,
        playTime: movieInfo.playTime,
        synopsis: movieInfo.synopsis,
        releaseDate: movieInfo.releaseDate,
        createdAt: movieInfo.createdAt,
        updatedAt: movieInfo.updatedAt,
        director: directorMovie.map((d) => d.director.directorName),
        Genre: Genre.map((g) => g.genre.genre),
        movieCast: movieCasts.map((cast) => ({
          roleName: cast.roleName,
          actor: cast.actor.name,
        })),
      };
    });

    return formattedExistingMovies;
  }
}
