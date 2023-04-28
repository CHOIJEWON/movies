import { PrismaService } from 'src/prisma/prisma.service';

export class TeaserRepository {
  async findTeasersByNames(tx: PrismaService, teasers: string[]) {
    return await tx.teaser.findMany({
      where: {
        url: {
          in: teasers,
        },
      },
    });
  }
}
