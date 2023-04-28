import { Injectable } from '@nestjs/common';
import {
  CreateActorDto,
  CreateActorWithRoleName,
} from 'src/commons/DTO/actor.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ActorRepository } from './actor.repository';

@Injectable()
export class ActorService {
  constructor(private readonly actorRepository: ActorRepository) {}

  async getExistingAndCreateActor(
    tx: PrismaService,
    actorDetails: CreateActorWithRoleName[],
  ): Promise<CreateActorDto[]> {
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
}
