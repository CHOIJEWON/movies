import { Teaser } from '@prisma/client';
import {
  GetTeaserByMovieIdWithT,
  UpdateTeaserWithT,
} from 'src/commons/DTO/teaser.dto';
import { PrismaService } from 'src/prisma/prisma.service';

export class TeaserRepository {
  async createTeaserWithT(
    tx: PrismaService,
    { url, movieId },
  ): Promise<Teaser> {
    return await tx.teaser.create({
      data: { url, movieId },
    });
  }

  async findTeasersByNames(
    tx: PrismaService,
    teasers: string[],
  ): Promise<Teaser[]> {
    return await tx.teaser.findMany({
      where: {
        url: {
          in: teasers,
        },
      },
    });
  }

  async getTeaserByMovieIdWithT(
    tx: PrismaService,
    { movieId, teaserId }: GetTeaserByMovieIdWithT,
  ): Promise<Teaser> {
    return await tx.teaser.findFirst({
      where: {
        AND: [{ id: teaserId }, { movieId }],
      },
    });
  }

  async updateTeaserWithT(
    tx: PrismaService,
    { teaserId, url }: UpdateTeaserWithT,
  ): Promise<Teaser> {
    return await tx.teaser.update({
      where: { id: teaserId },
      data: { url },
    });
  }

  async getTeaserByIdWithT(
    tx: PrismaService,
    teaserId: number,
  ): Promise<Teaser> {
    return tx.teaser.findFirst({
      where: { id: teaserId },
    });
  }

  async deleteTeaserByIdWithT(
    tx: PrismaService,
    teaserId: number,
  ): Promise<Teaser> {
    return tx.teaser.delete({
      where: { id: teaserId },
    });
  }
}
