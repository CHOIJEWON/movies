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
import { Teaser } from '@prisma/client';
import { ReturnTeaser } from 'src/commons/DTO/swagger/teaser.type';
import { UpdateTeaserPickUrl } from 'src/commons/DTO/teaser.dto';
import { TeaserService } from './teaser.service';

@ApiTags('Teaser')
@Controller('teaser')
export class TeaserController {
  constructor(private readonly teaserService: TeaserService) {}

  @ApiOperation({
    summary:
      '영화 ID와 티저 ID를 동시에 갖고 있는 티저를 찾습니다 존재한다면 url을 업데이트합니다 존재하지 않다면 movieId와 해당 url을 갖은 티저를 생성합니다 ',
  })
  @ApiParam({
    name: 'teaserId',
    required: true,
    description: 'teaser 고유 ID',
    example: '18',
  })
  @ApiParam({
    name: 'movieId',
    required: true,
    description: '영화 고유 ID',
    example: '24',
  })
  @ApiBody({ type: UpdateTeaserPickUrl })
  @ApiOkResponse({ description: '성공', type: ReturnTeaser })
  @ApiResponse({
    status: 304,
    description: '현재 티저 url과 변경될 url이 같은 경우',
  })
  @ApiInternalServerErrorResponse({
    description:
      '티저를 생성하는 과정에서 에러 // 티저를 업데이트 하는 과정에서에러 // 알 수 없는 에러 ',
    schema: {
      example: {
        status: 500,
        timestamp: '2023-05-01T15:41:29.961Z',
        url: '/director/24',
        response: 'CAUSE_AN_ERROR_WHILE_CREATE_TEASER',
      },
    },
  })
  @Put('/:teaserId/movie/:movieId')
  async updateTeaserConnect(
    @Param('teaserId') teaserId: number,
    @Param('movieId') movieId: number,
    @Body() teaser: UpdateTeaserPickUrl,
  ): Promise<Teaser> {
    return await this.teaserService.updateTeaser({
      movieId,
      teaserId,
      url: teaser.url,
    });
  }

  @ApiOperation({
    summary: '해당 ID를 갖은 Teaser삭제',
  })
  @ApiParam({
    name: 'teaserId',
    required: true,
    description: 'teaser 고유 ID',
    example: '18',
  })
  @ApiNoContentResponse({ description: '성공' })
  @ApiNotFoundResponse({
    description: '해당 ID를 갖고 있는 티저가 없는 경우',
    schema: {
      example: {
        status: 404,
        timestamp: '2023-05-01T15:41:29.961Z',
        url: '/teaser/18',
        response: 'NO_TEASER_HAS_TAHT_ID',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'teaser삭제에 실패한 경우 //  알 수 없는 에러',
    schema: {
      example: {
        status: 500,
        timestamp: '2023-05-01T15:41:29.961Z',
        url: '/teaser/18',
        response: 'CAUSE_AN_ERROR_WHILE_DELETE_TEASER',
      },
    },
  })
  @Delete('/:teaserId')
  @HttpCode(204)
  async delteTeaser(@Param('teaserId') teaserId: number): Promise<Teaser> {
    return await this.teaserService.deleteTeaser(teaserId);
  }
}
