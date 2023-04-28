import { HttpException, Injectable } from '@nestjs/common';
import { Movie, Prisma } from '@prisma/client';
import { ActorService } from 'src/actor/actor.service';
import { CreateMovieWithAssocationTable } from 'src/commons/DTO/movie.dto';
import { DirectorRepository } from 'src/director/direcotr.repository';
import { GenreService } from 'src/genre/genre.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { TeaserService } from 'src/teaser/teaser.service';
import { MovieRepository } from './movie.repository';

@Injectable()
export class MovieService {
  constructor(
    private readonly movieRepository: MovieRepository,
    private readonly genreService: GenreService,
    private readonly actorService: ActorService,
    private readonly prismaService: PrismaService,
    private readonly directorRepository: DirectorRepository,
    private readonly teaserService: TeaserService,
  ) {}

  async createMovieWithAssociated(
    createMovieWithGenre: CreateMovieWithAssocationTable,
  ): Promise<Movie> {
    let response;

    const { directorName, genres, actorDetails, teasers, ...createMovie } =
      createMovieWithGenre;

    const { title }: Prisma.MovieCreateInput = createMovie;

    try {
      await this.prismaService.$transaction(async (tx: PrismaService) => {
        // Determine if the movie already exists
        const existingMovie: Movie =
          await this.movieRepository.findMovieByTitle(tx, title);

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
}
