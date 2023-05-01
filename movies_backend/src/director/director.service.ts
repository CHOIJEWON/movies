import { HttpException, Injectable } from '@nestjs/common';
import { Director } from '@prisma/client';
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
        CAUSE_AN_ERROR_WHILE_UPDATE_ACTOR: 500,
      };

      const statusCode = errorStatusMap[e.message] || 500;

      throw new HttpException(e.message, statusCode);
    }
  }
}
