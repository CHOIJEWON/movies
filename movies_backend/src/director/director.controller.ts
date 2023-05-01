import { Body, Controller, Delete, HttpCode, Param, Put } from '@nestjs/common';
import { Director } from '@prisma/client';
import { DirectorService } from './director.service';

@Controller('director')
export class DirectorController {
  constructor(private readonly directorSerivce: DirectorService) {}

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

  @Delete('/:directorId')
  @HttpCode(204)
  async deleteActor(
    @Param('directorId') directorId: number,
  ): Promise<Director> {
    return await this.directorSerivce.deleteDirector(directorId);
  }
}
