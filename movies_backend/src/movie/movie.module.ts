import { Module } from '@nestjs/common';
import { ActorModule } from 'src/actor/actor.module';
import { DirectorModule } from 'src/director/director.module';
import { GenreModule } from 'src/genre/genre.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TeaserModule } from 'src/teaser/teaser.module';
import { MovieController } from './movie.controller';
import { MovieRepository } from './movie.repository';
import { MovieService } from './movie.service';

@Module({
  imports: [
    PrismaModule,
    GenreModule,
    DirectorModule,
    ActorModule,
    TeaserModule,
  ],
  controllers: [MovieController],
  providers: [MovieService, MovieRepository],
})
export class MovieModule {}
