import { Injectable } from '@nestjs/common';
import { Teaser } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { TeaserRepository } from './teaser.repository';

@Injectable()
export class TeaserService {
  constructor(private readonly teaserRepository: TeaserRepository) {}

  async createTeaser(tx: PrismaService, teasers: string[]): Promise<string[]> {
    const existingTeasers: Teaser[] =
      await this.teaserRepository.findTeasersByNames(tx, teasers);

    const newTeasers: string[] = teasers.filter(
      (url) => !existingTeasers.some((t) => t.url === url),
    );

    return newTeasers;
  }
}
