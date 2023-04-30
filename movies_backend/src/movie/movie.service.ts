import { HttpException, Injectable } from '@nestjs/common';
import { Movie, Prisma } from '@prisma/client';
import { ActorRepository } from 'src/actor/actor.repository';
import { ActorService } from 'src/actor/actor.service';
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
import { DirectorRepository } from 'src/director/direcotr.repository';
import { GenreRepository } from 'src/genre/genre.repository';
import { GenreService } from 'src/genre/genre.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { TeaserService } from 'src/teaser/teaser.service';
import { MovieRepository } from './movie.repository';

@Injectable()
export class MovieService {
  constructor(
    private readonly movieRepository: MovieRepository,
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
