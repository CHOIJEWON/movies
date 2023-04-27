import { Module } from '@nestjs/common';
import { GenreController } from './genre.controller';
import { GenreRepository } from './genre.repository';
import { GenreService } from './genre.service';

@Module({
  controllers: [GenreController],
  providers: [GenreService, GenreRepository],
  exports: [GenreRepository],
})
export class GenreModule {}
