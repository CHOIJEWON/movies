import { HttpException, Injectable } from '@nestjs/common';
import { Movie, Prisma, Teaser } from '@prisma/client';
import { ActorService } from 'src/actor/actor.service';
import { CreateMovieWithAssocationTable } from 'src/commons/DTO/movie.dto';
import { DirectorRepository } from 'src/director/direcotr.repository';
import { GenreService } from 'src/genre/genre.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { MovieRepository } from './movie.repository';

@Injectable()
export class MovieService {
  constructor(
    private readonly movieRepository: MovieRepository,
    private readonly genreService: GenreService,
    private readonly actorService: ActorService,
    private readonly prismaService: PrismaService,
    private readonly directorRepository: DirectorRepository,
  ) {}

  async createMovieWithAssociated(
    createMovieWithGenre: CreateMovieWithAssocationTable,
  ): Promise<Movie> {
    let response;

    const { directorName, genres, actorDetails, teasers, ...createMovie } =
      createMovieWithGenre;

    const {
      title,
      titleImg,
      originalTitle,
      grade,
      synopsis,
      playTime,
      releaseDate,
    }: Prisma.MovieCreateInput = createMovie;

    try {
      await this.prismaService.$transaction(async (tx: PrismaService) => {
        // Determine if the movie already exists
        const existingMovie: Movie =
          await this.movieRepository.findMovieByTitle(tx, title);

        // movie already exists exception
        if (existingMovie)
          throw new HttpException('this movie already exists', 409);

        const genresIds = await this.genreService.getExistingAndCreateGenes(
          tx,
          genres,
        );

        // existing director
        const existingDirectorOrCreate =
          await this.directorRepository.upsertDirector(tx, directorName);

        const movieCast = await this.actorService.getExistingAndCreateActor(
          tx,
          actorDetails,
        );

        const existingTeasers: Teaser[] = await tx.teaser.findMany({
          where: {
            url: {
              in: teasers,
            },
          },
        });

        const newTeasers: string[] = teasers.filter(
          (url) => !existingTeasers.some((t) => t.url === url),
        );

        // create movie with connection another table
        const createMovieWithAssociated = await tx.movie.create({
          data: {
            title,
            titleImg,
            originalTitle,
            grade,
            synopsis,
            playTime,
            releaseDate,
            directorMovie: {
              create: [
                {
                  directorId: existingDirectorOrCreate.id,
                },
              ],
            },
            Genre: {
              create: genresIds.map((genreId) => ({
                genreId,
              })),
            },
            movieCast: {
              create: movieCast.map((cast) => ({
                roleName: cast.roleName,
                actor: cast.actor,
              })),
            },
            Teaser: {
              create: newTeasers.map((url) => ({
                url,
              })),
            },
          },
        });

        response = createMovieWithAssociated;
      });
      return response;
    } catch (e) {
      throw new HttpException(e.message, 500);
    } finally {
      await this.prismaService.$disconnect();
    }
  }
}
