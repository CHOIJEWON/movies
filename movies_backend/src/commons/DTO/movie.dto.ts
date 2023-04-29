import { PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsUrl } from 'class-validator';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateActorDto, CreateActorWithRoleName } from './actor.dto';

export class CreateMovieDto {
  @IsNotEmpty({
    context: {
      code: 'TITLE_OF_THE_MOVIE_MUST_EXIST',
    },
  })
  @IsString()
  title: string;

  @IsString()
  @IsUrl()
  titleImg: string;

  @IsString()
  originalTitle?: string;

  @IsNumber()
  grade: number;

  @IsNotEmpty({
    context: {
      code: 'PLAY_TIME_OF_MOVIE_MUST_EXIST',
    },
  })
  @IsString()
  playTime: string;

  @IsNotEmpty({
    context: {
      code: 'SYNOPSIS_OF_MOVIE_MUST_EXIST',
    },
  })
  @IsString()
  synopsis: string;

  @IsNumber()
  releaseDate: number;
}
export class CreateMovieWithAssocationTable extends CreateMovieDto {
  @IsNotEmpty()
  genres: string[];

  @IsNotEmpty()
  @IsString()
  directorName: string;

  teasers: string[];

  @IsNotEmpty()
  actorDetails: CreateActorWithRoleName[];
}

export class FindMovieByTitleDto {
  @IsNotEmpty()
  tx: PrismaService;

  @IsNotEmpty()
  @IsString()
  title: string;
}
export class associateMovieAndGenreDto {
  movieId: number;
  genreId: number;
}

export class AssociateMovieAndDirectorDto extends PickType(
  associateMovieAndGenreDto,
  ['movieId' as const],
) {
  directorId: number;
}

export class CreateMovieWithAssocationInRepositoryDto extends CreateMovieDto {
  directorId: number;
  genresIds: number[];
  movieCasts: CreateActorDto[];
  teasers: string[];
}
