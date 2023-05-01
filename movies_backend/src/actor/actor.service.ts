import { HttpException, Injectable } from '@nestjs/common';
import { Actor } from '@prisma/client';
import {
  CreateActorWithRoleName,
  UpdateActorName,
} from 'src/commons/DTO/actor.dto';
import { createActorInterface } from 'src/commons/interface/actor.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { ActorRepository } from './actor.repository';

@Injectable()
export class ActorService {
  constructor(
    private readonly actorRepository: ActorRepository,
    private readonly prismaService: PrismaService,
  ) {}

  async getExistingAndCreateActor(
    tx: PrismaService,
    actorDetails: CreateActorWithRoleName[],
  ): Promise<createActorInterface[]> {
    const movieCast = [];
    for (let i = 0; i < actorDetails.length; i++) {
      const actorDetail = actorDetails[i];
      const actorName = actorDetail.name;

      let actor;

      // find existing actor or create new one
      const existingActor = await this.actorRepository.findActorByNameWithT(
        tx,
        actorName,
      );

      if (existingActor) {
        actor = { connect: { id: existingActor.id } };
      } else {
        const createdActor = await this.actorRepository.createActorWithT(
          tx,
          actorName,
        );

        actor = { connect: { id: createdActor.id } };
      }

      // add to movie cast array
      movieCast.push({
        roleName: actorDetail.roleName,
        actor: actor,
      });
    }

    return movieCast;
  }

  async updateActorName({ actorId, name }: UpdateActorName): Promise<Actor> {
    try {
      const updateActorName = this.prismaService.$transaction(
        async (tx: PrismaService) => {
          const existingActor = await this.actorRepository.getActorByIdWithT(
            tx,
            actorId,
          );

          if (!existingActor) throw new Error(`NO_ACTOR_HAS_TAHT_ID`);

          if (existingActor.name === name)
            throw new Error('NO_CHANGE_IN_ACTOR_NAME');

          const updateActorName =
            await this.actorRepository.updateActorNameWithT(tx, {
              actorId,
              name,
            });

          if (!updateActorName)
            throw new Error('CAUSE_AN_ERROR_WHILE_UPDATE_ACTOR_NAME');

          return updateActorName;
        },
      );

      return updateActorName;
    } catch (e) {
      const errorStatusMap = {
        NO_ACTOR_HAS_TAHT_ID: 404,
        NO_CHANGE_IN_ACTOR_NAME: 304,
        CAUSE_AN_ERROR_WHILE_UPDATE_ACTOR_NAME: 500,
      };

      const statusCode = errorStatusMap[e.message] || 500;

      const errorMessage = e.message;

      throw new HttpException(errorMessage, statusCode);
    }
  }
}
