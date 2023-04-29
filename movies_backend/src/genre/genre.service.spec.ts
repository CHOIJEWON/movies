//@ts-nocheck

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from 'src/prisma/prisma.service';
import { GenreRepository } from './genre.repository';
import { GenreService } from './genre.service';

describe('GenreService', () => {
  let genreService: GenreService;
  let genreRepositoy: GenreRepository;
  let prisma: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenreService,
        GenreRepository,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>({
            $transaction: jest.fn(),
          }),
        },
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    genreService = module.get<GenreService>(GenreService);
    genreRepositoy = module.get<GenreRepository>(GenreRepository);
    prisma = module.get<PrismaClient>(PrismaService);
  });

  afterEach(async () => {
    await prisma.$disconnect();
  });

  const tx = prisma;

  it('[Success] all geners exists on the database', async () => {
    const existingGenres: Genre[] = [
      { id: 1, genre: 'Action' },
      { id: 2, genre: 'Drama' },
    ];

    const genres: string[] = ['Action', 'Drama'];

    const mockFindMaynGenresByNamesWithT: Genre[] = jest
      .spyOn(genreRepositoy, 'findMaynGenresByNamesWithT')
      .mockResolvedValue(existingGenres);

    const allOfGenreIds: number[] =
      await genreService.getExistingAndCreateGenes(tx, genres);

    expect(mockFindMaynGenresByNamesWithT).toHaveBeenCalledWith(tx, genres);
    expect(allOfGenreIds).toEqual([1, 2]);
  });

  it('[Success] both eixist and nonExisist genres', async () => {
    const existingGenres: Genre[] = [
      { id: 1, genre: 'Action' },
      { id: 2, genre: 'Drama' },
    ];

    const mockFindMaynGenresByNamesWithT: Genre[] = jest
      .spyOn(genreRepositoy, 'findMaynGenresByNamesWithT')
      .mockResolvedValue(existingGenres);

    const genres: string[] = ['Action', 'Drama', 'Horror', 'Family'];

    const createdGenres: Genre[] = [
      { id: 3, genre: 'Horror' },
      { id: 4, genre: 'Family' },
    ];

    const mockCreateGenreWithT: Genre[] = jest
      .spyOn(genreRepositoy, 'createGenreWithT')
      .mockImplementation((tx, genre) => {
        const createdGenre = createdGenres.find((g) => g.genre === genre);
        return Promise.resolve(createdGenre);
      });

    const allOfGenreIds: number[] =
      await genreService.getExistingAndCreateGenes(tx, genres);

    expect(mockFindMaynGenresByNamesWithT).toHaveBeenCalledWith(tx, genres);
    expect(mockCreateGenreWithT).toHaveBeenCalledTimes(2);
    expect(allOfGenreIds).toEqual([1, 2, 3, 4]);
  });

  it('[Success] no genres on the dtabase', async () => {
    const existingGenres = [];
    jest
      .spyOn(genreRepositoy, 'findMaynGenresByNamesWithT')
      .mockResolvedValue(existingGenres);

    const genres: string[] = ['Horror', 'Family'];

    const createdGenres: Genre[] = [
      { id: 3, genre: 'Horror' },
      { id: 4, genre: 'Family' },
    ];

    const mockCreateGenreWithT: Genre[] = jest
      .spyOn(genreRepositoy, 'createGenreWithT')
      .mockImplementation((tx, genre) => {
        const createdGenre = createdGenres.find((g) => g.genre === genre);
        return Promise.resolve(createdGenre);
      });

    const allOfGenreIds: number[] =
      await genreService.getExistingAndCreateGenes(tx, genres);

    expect(allOfGenreIds).toEqual([3, 4]);

    expect(genreRepositoy.findMaynGenresByNamesWithT).toHaveBeenCalledWith(
      tx,
      genres,
    );

    expect(mockCreateGenreWithT).toHaveBeenCalledTimes(2);
  });
});
