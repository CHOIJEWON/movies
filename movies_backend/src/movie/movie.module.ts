import { Module } from '@nestjs/common';
import { GenreModule } from 'src/genre/genre.module';
import { MovieController } from './movie.controller';
import { MovieRepository } from './movie.repository';
import { MovieService } from './movie.service';

@Module({
  imports: [GenreModule],
  controllers: [MovieController],
  providers: [MovieService, MovieRepository],
})
export class MovieModule {}
