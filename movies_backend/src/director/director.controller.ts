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
import { Director } from '@prisma/client';
import { ReturnDirector } from 'src/commons/DTO/swagger/director.type';
import { DirectorService } from './director.service';

@ApiTags('Director')
@Controller('director')
export class DirectorController {
  constructor(private readonly directorSerivce: DirectorService) {}

  @ApiOperation({
    summary: '감독의 이름을 변경합니다',
  })
  @ApiParam({
    name: 'directorId',
    required: true,
    description: '감독 고유 ID',
    example: '10',
  })
  @ApiBody({
    description: '감독 이름',
    schema: {
      example: {
        actorName: '박찬욱',
      },
    },
  })
  @ApiOkResponse({ description: '성공', type: ReturnDirector })
  @ApiResponse({
    status: 304,
    description: '현재 감독과 변경될 감독의 이름이 같은 경우',
  })
  @ApiNotFoundResponse({
    description: '해당 ID를 갖은 감독이 없는 경우',
    schema: {
      example: {
        status: 404,
        timestamp: '2023-05-01T15:41:29.961Z',
        url: '/director/10',
        response: 'NO_ACTOR_HAS_TAHT_ID',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: '감독 이름을 업데이트 하는데 실패한 경우, 알 수 없는 에러',
    schema: {
      example: {
        status: 500,
        timestamp: '2023-05-01T15:41:29.961Z',
        url: '/director/24',
        response: 'CAUSE_AN_ERROR_WHILE_UPDATE_DIRECTOR',
      },
    },
  })
  @Put('/:directorId')
  async updateDirectorName(
    @Body('directorName') directorName: string,
    @Param('directorId') directorId: number,
  ): Promise<Director> {
    return await this.directorSerivce.updateDirectorName({
      directorId,
      directorName,
    });
  }

  @ApiOperation({
    summary: '해당 ID를 갖은 감독 삭제 DirectedMovie역시 삭제',
  })
  @ApiParam({
    name: 'directorId',
    required: true,
    description: '감독 고유 ID',
    example: '10',
  })
  @ApiNoContentResponse({ description: '성공' })
  @ApiNotFoundResponse({
    description: '해당 ID를 갖고 있는 감독이 없는 경우',
    schema: {
      example: {
        status: 404,
        timestamp: '2023-05-01T15:41:29.961Z',
        url: '/director/24',
        response: 'NO_DIRECTOR_HAS_TAHT_ID',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description:
      '감독을 삭제하는데 실패한 경우 // DirectedMovie를 삭제하는데 실패한 경우 // moiveCast를 삭제하는데 실패한 경우 // 알 수 없는 에러',
    schema: {
      example: {
        status: 500,
        timestamp: '2023-05-01T15:41:29.961Z',
        url: '/director/24',
        response: 'CAUSE_AN_ERROR_WHILE_DELETE_DIRECTED_MOVIES',
      },
    },
  })
  @Delete('/:directorId')
  @HttpCode(204)
  async deleteActor(
    @Param('directorId') directorId: number,
  ): Promise<Director> {
    return await this.directorSerivce.deleteDirector(directorId);
  }
}
