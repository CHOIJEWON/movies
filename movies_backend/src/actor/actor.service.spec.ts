//@ts-nocheck

import { Test, TestingModule } from '@nestjs/testing';
import { Actor, PrismaClient } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from 'src/prisma/prisma.service';
import { ActorRepository } from './actor.repository';
import { ActorService } from './actor.service';

describe('ActorService', () => {
  let actorService: ActorService;
  let actorRepository: ActorRepository;
  let prisma: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActorService,
        ActorRepository,
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

    actorService = module.get<ActorService>(ActorService);
    actorRepository = module.get<ActorRepository>(ActorRepository);
    prisma = module.get<PrismaClient>(PrismaService);
  });

  afterEach(async () => {
    await prisma.$disconnect();
  });

  const tx = prisma;

  const actorDetails = [
    { name: '최제원', roleName: '응시자' },
    { name: '백엔드', roleName: '과제' },
    { name: '테스트', roleName: '화이팅' },
  ];

  it('[Success] exists all actors on database', async () => {
    const existingActors: Actor[] = [
      { id: 1, name: '최제원' },
      { id: 2, name: '백엔드' },
      { id: 3, name: '테스트' },
    ];

    const mockFindActorByNameWithT = jest.spyOn(
      actorRepository,
      'findActorByNameWithT',
    );

    mockFindActorByNameWithT.mockImplementation(async (tx, name) => {
      const existingActor = existingActors.find((actor) => actor.name === name);
      return existingActor ? { ...existingActor } : undefined;
    });

    const expected: CreateActorDto[] = [
      {
        roleName: '응시자',
        actor: { connect: { id: 1 } },
      },
      {
        roleName: '과제',
        actor: { connect: { id: 2 } },
      },
      {
        roleName: '화이팅',
        actor: { connect: { id: 3 } },
      },
    ];

    const result = await actorService.getExistingAndCreateActor(
      tx,
      actorDetails,
    );

    expect(result).toEqual(expected);
    expect(mockFindActorByNameWithT).toHaveBeenCalledTimes(3);
  });

  it('[Success] both eixist and nonExisist actor names', async () => {
    const existingActors: Actor[] = [
      { id: 1, name: '최제원' },
      { id: 2, name: '백엔드' },
    ];

    const expected: CreateActorDto[] = [
      {
        roleName: '응시자',
        actor: { connect: { id: 1 } },
      },
      {
        roleName: '과제',
        actor: { connect: { id: 2 } },
      },
      {
        roleName: '화이팅',
        actor: { connect: { id: 3 } },
      },
    ];

    const mockFindActorByNameWithT = jest.spyOn(
      actorRepository,
      'findActorByNameWithT',
    );

    mockFindActorByNameWithT.mockImplementation(async (tx, name) => {
      const existingActor = existingActors.find((actor) => actor.name === name);
      return existingActor ? { ...existingActor } : undefined;
    });

    const createdAcor = [{ id: 3, name: '테스트' }];

    const mockCreateGenreWithT: Genre[] = jest
      .spyOn(actorRepository, 'createActorWithT')
      .mockImplementation((tx, actor) => {
        const createActor = createdAcor.find((a) => a.name === actor);
        return Promise.resolve(createActor);
      });

    const result = await actorService.getExistingAndCreateActor(
      tx,
      actorDetails,
    );

    expect(result).toEqual(expected);
    expect(mockCreateGenreWithT).toHaveBeenCalledTimes(1);
  });

  it('[Succcess] no actors on the dtabase', async () => {
    const existingActors: Actor[] = [];

    const expected: CreateActorDto[] = [
      {
        roleName: '응시자',
        actor: { connect: { id: 1 } },
      },
      {
        roleName: '과제',
        actor: { connect: { id: 2 } },
      },
      {
        roleName: '화이팅',
        actor: { connect: { id: 3 } },
      },
    ];

    const mockFindActorByNameWithT = jest.spyOn(
      actorRepository,
      'findActorByNameWithT',
    );

    mockFindActorByNameWithT.mockImplementation(async (tx, name) => {
      const existingActor = existingActors.find((actor) => actor.name === name);
      return existingActor ? { ...existingActor } : undefined;
    });

    const createdAcor = [
      { id: 1, name: '최제원' },
      { id: 2, name: '백엔드' },
      { id: 3, name: '테스트' },
    ];

    const mockCreateGenreWithT: Genre[] = jest
      .spyOn(actorRepository, 'createActorWithT')
      .mockImplementation((tx, actor) => {
        const createActor = createdAcor.find((a) => a.name === actor);
        return Promise.resolve(createActor);
      });

    const result = await actorService.getExistingAndCreateActor(
      tx,
      actorDetails,
    );

    expect(result).toEqual(expected);
    expect(mockCreateGenreWithT).toHaveBeenCalledTimes(3);
  });
});
