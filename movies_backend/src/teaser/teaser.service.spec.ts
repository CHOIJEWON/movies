//@ts-nocheck

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from 'src/prisma/prisma.service';
import { TeaserRepository } from './teaser.repository';
import { TeaserService } from './teaser.service';

describe('TeasrService', () => {
  let teaserService: TeaserService;
  let teaserRepository: TeaserRepository;
  let prisma: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TeaserService, TeaserRepository, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    teaserRepository = module.get<TeaserRepository>(TeaserRepository);
    teaserService = module.get<TeaserService>(TeaserService);
    prisma = module.get<PrismaClient>(PrismaService);
  });

  afterEach(async () => {
    await prisma.$disconnect();
  });

  const tx = prisma;
  const teasers = ['https://www.naver.com/', 'https://www.youtube.com/'];
  it('[Success] If a teaser already exists in the database', async () => {
    jest
      .spyOn(teaserRepository, 'findTeasersByNames')
      .mockResolvedValue([{ id: 1, url: 'https://www.naver.com/' }]);

    const result: string[] = await teaserService.createTeaser(tx, teasers);

    expect(result).toEqual(['https://www.youtube.com/']);
  });

  it('[Success] if any teaser not exists in the database', async () => {
    const mockFindTeaser = jest
      .spyOn(teaserRepository, 'findTeasersByNames')
      .mockResolvedValue([]);

    const result: string[] = await teaserService.createTeaser(tx, teasers);

    expect(result).toEqual([
      'https://www.naver.com/',
      'https://www.youtube.com/',
    ]);

    expect(teaserRepository.findTeasersByNames).toHaveBeenCalledWith(
      tx,
      teasers,
    );

    expect(mockFindTeaser).toHaveBeenCalledTimes(1);
  });

  it('[Failure] Type does not match the type of teaser ', async () => {
    try {
      const unexpectedTeaser: string = 'not array';

      jest.spyOn(teaserRepository, 'findTeasersByNames').mockResolvedValue([]);

      await teaserService.createTeaser(tx, unexpectedTeaser);

      expect(teaserRepository.findTeasersByNames).toHaveBeenCalledWith(
        tx,
        teasers,
      );

      expect(mockFindTeaser).toHaveBeenCalledTimes(1);
    } catch (e) {
      expect(e).toBeDefined();
    }
  });
});
