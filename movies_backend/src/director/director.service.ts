import { HttpException, Injectable } from '@nestjs/common';
import { DirectedMovie, Director } from '@prisma/client';
import { UpdateDirectorName } from 'src/commons/DTO/director.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { DirectorRepository } from './direcotr.repository';

@Injectable()
export class DirectorService {
  constructor(
    private readonly directorRepository: DirectorRepository,
    private readonly prismaService: PrismaService,
  ) {}

  async updateDirectorName({
    directorId,
    directorName,
  }: UpdateDirectorName): Promise<Director> {
    try {
      const updateDirectorName = await this.prismaService.$transaction(
        async (tx: PrismaService) => {
          const existingDirector =
            await this.directorRepository.getDirectorByIdWithT(tx, directorId);

          if (!existingDirector) throw new Error('NO_DIRECTOR_HAS_TAHT_ID');

          if (existingDirector.directorName === directorName)
            throw new Error('NO_CHANGE_IN_DIRECTOR_NAME');

          const updateDirectorName =
            await this.directorRepository.updateDirectorNameWithT(tx, {
              directorId,
              directorName,
            });

          if (!updateDirectorName)
            throw new Error('CAUSE_AN_ERROR_WHILE_UPDATE_DIRECTOR_NAME');

          return updateDirectorName;
        },
      );

      return updateDirectorName;
    } catch (e) {
      const errorStatusMap = {
        NO_DIRECTOR_HAS_TAHT_ID: 404,
        NOTING_CHANGE_DIRECTOR_NAME: 304,
        CAUSE_AN_ERROR_WHILE_UPDATE_DIRECTOR: 500,
      };

      const statusCode = errorStatusMap[e.message] || 500;

      throw new HttpException(e.message, statusCode);
    }
  }

  async deleteDirector(direcotId: number): Promise<Director> {
    try {
      const deleteDirector = await this.prismaService.$transaction(
        async (tx: PrismaService) => {
          const existingDirector =
            await this.directorRepository.getDirectorByIdWithT(tx, direcotId);

          if (!existingDirector) throw new Error('NO_DIRECTOR_HAS_TAHT_ID');

          const directedMoviesInDirector =
            await this.directorRepository.getDiretedMoviesByIdWithT(
              tx,
              direcotId,
            );

          if (!directedMoviesInDirector) {
            const deleteDirector =
              await this.directorRepository.deleteDirectorWithT(tx, direcotId);

            if (!deleteDirector)
              throw new Error('CAUSE_AN_ERROR_WHILE_DELETE_DIRECTOR');

            return deleteDirector;
          }

          let deletedDirectedMovies: DirectedMovie[] = [];

          for (const { id } of directedMoviesInDirector) {
            const deleteDirectedMovie =
              await this.directorRepository.deleDirectedMovieWithT(tx, id);

            deletedDirectedMovies.push(deleteDirectedMovie);
          }

          if (deletedDirectedMovies.length !== directedMoviesInDirector.length)
            throw new Error('CAUSE_AN_ERROR_WHILE_DELETE_DIRECTED_MOVIES');

          const deleteDirector =
            await this.directorRepository.deleteDirectorWithT(tx, direcotId);

          if (!deleteDirector)
            throw new Error('CAUSE_AN_ERROR_WHILE_DELETE_DIRECTOR');

          return deleteDirector;
        },
      );
      return deleteDirector;
    } catch (e) {
      const errorStatusMap = {
        NO_DIRECTOR_HAS_TAHT_ID: 404,
        CAUSE_AN_ERROR_WHILE_DELETE_DIRECTOR: 500,
        CAUSE_AN_ERROR_WHILE_DELETE_DIRECTED_MOVIES: 500,
      };

      const statusCode = errorStatusMap[e.message] || 500;

      const errorMessage = e.message;

      throw new HttpException(errorMessage, statusCode);
    }
  }
}
