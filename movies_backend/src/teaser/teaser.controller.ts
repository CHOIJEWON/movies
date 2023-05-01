import { Body, Controller, Param, Put } from '@nestjs/common';
import { Teaser } from '@prisma/client';
import { UpdateTeaserPickUrl } from 'src/commons/DTO/teaser.dto';
import { TeaserService } from './teaser.service';

@Controller('teaser')
export class TeaserController {
  constructor(private readonly teaserService: TeaserService) {}

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
}
