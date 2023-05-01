import { Body, Controller, Delete, HttpCode, Param, Put } from '@nestjs/common';
import {
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Actor } from '@prisma/client';
import { ReturnActor } from 'src/commons/DTO/swagger/acotr.tpye';
import { ActorService } from './actor.service';

@ApiTags('Actor')
@Controller('actor')
export class ActorController {
  constructor(private readonly actorService: ActorService) {}

  @ApiOperation({
    summary: '배우의 이름을 변경합니다',
  })
  @ApiParam({
    name: 'actorId',
    required: true,
    description: '배우 고유 ID',
    example: '24',
  })
  @ApiBody({
    description: '배우 이름',
    schema: {
      example: {
        actorName: '남주혁',
      },
    },
  })
  @ApiOkResponse({ description: '성공', type: ReturnActor })
  @ApiResponse({
    status: 304,
    description: '현재 배우 이름과 변경할 배우 이름이 같은 경우',
  })
  @ApiNotFoundResponse({
    description: '해당 ID를 갖은 배우가 없는 경우',
    schema: {
      example: {
        status: 404,
        timestamp: '2023-05-01T15:41:29.961Z',
        url: '/actor/24',
        response: 'NO_ACTOR_HAS_TAHT_ID',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: '해당 배우 이름 업데이트에 실패한 경우, 알 수 없는 에러',
    schema: {
      example: {
        status: 500,
        timestamp: '2023-05-01T15:41:29.961Z',
        url: '/actor/24',
        response: 'CAUSE_AN_ERROR_WHILE_UPDATE_ACTOR_NAME',
      },
    },
  })
  @Put('/:actorId')
  async updateActorName(
    @Param('actorId') actorId: number,
    @Body('name') actorName: string,
  ): Promise<Actor> {
    return await this.actorService.updateActorName({
      actorId,
      name: actorName,
    });
  }

  @ApiOperation({
    summary: '해당 ID를 갖은 배우 삭제 연관된 모든 MovieCast 모두 삭제',
  })
  @ApiParam({
    name: 'actorId',
    required: true,
    description: '배우 고유 ID',
    example: '32',
  })
  @ApiNoContentResponse({ description: '성공' })
  @ApiNotFoundResponse({
    description: '해당 ID를 갖고 있는 배우가 없는 경우',
    schema: {
      example: {
        status: 404,
        timestamp: '2023-05-01T15:41:29.961Z',
        url: '/actor/24',
        response: 'NO_ACTOR_HAS_TAHT_ID',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description:
      '배우 정보를 삭제하는데 실패한 경우 // moiveCast를 삭제하는데 실패한 경우 // 알 수 없는 에러',
    schema: {
      example: {
        status: 500,
        timestamp: '2023-05-01T15:41:29.961Z',
        url: '/actor/24',
        response: 'CAUSE_AN_ERROR_WHILE_DELETE_ACTOR',
      },
    },
  })
  @Delete('/:actorId')
  @HttpCode(204)
  async deleteActor(@Param('actorId') actorId: number): Promise<Actor> {
    return await this.actorService.deleteActor(actorId);
  }
}
