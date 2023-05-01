import { HttpException, Injectable } from '@nestjs/common';
import { Teaser } from '@prisma/client';
import { UpdateTeaserDtoWithIds } from 'src/commons/DTO/teaser.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { TeaserRepository } from './teaser.repository';

@Injectable()
export class TeaserService {
  constructor(
    private readonly teaserRepository: TeaserRepository,
    private readonly prismaService: PrismaService,
  ) {}

  async createTeaser(tx: PrismaService, teasers: string[]): Promise<string[]> {
    const existingTeasers: Teaser[] =
      await this.teaserRepository.findTeasersByNames(tx, teasers);

    const newTeasers: string[] = teasers.filter(
      (url) => !existingTeasers.some((t) => t.url === url),
    );

    return newTeasers;
  }

  async updateTeaser({
    url,
    teaserId,
    movieId,
  }: UpdateTeaserDtoWithIds): Promise<Teaser> {
    try {
      const updateTeaser = await this.prismaService.$transaction(
        async (tx: PrismaService) => {
          const existingTeaser =
            await this.teaserRepository.getTeaserByMovieIdWithT(tx, {
              movieId,
              teaserId,
            });

          if (!existingTeaser) {
            const createTeaser = await this.teaserRepository.createTeaserWithT(
              tx,
              { url, movieId },
            );

            if (!createTeaser)
              throw new Error('CAUSE_AN_ERROR_WHILE_CREATE_TEASER');

            return createTeaser;
          }

          const { id: existingTeaserId, url: existingTeasrUrl } =
            existingTeaser;

          if (existingTeasrUrl == url) throw new Error('NO_CHANGE_TEASER_URL');

          const updateMovieTeaser =
            await this.teaserRepository.updateTeaserWithT(tx, {
              teaserId: existingTeaserId,
              url,
            });

          if (!updateMovieTeaser)
            throw new Error('CAUSE_AN_ERROR_WHILE_UPDATE_TEASER');

          return updateMovieTeaser;
        },
      );

      return updateTeaser;
    } catch (e) {
      const errorStatusMap = {
        CAUSE_AN_ERROR_WHILE_CREATE_TEASER: 500,
        NO_CHANGE_TEASER_URL: 304,
        CAUSE_AN_ERROR_WHILE_UPDATE_TEASER: 500,
      };

      const statusCode = errorStatusMap[e.message] || 500;

      throw new HttpException(e.message, statusCode);
    }
  }
}
