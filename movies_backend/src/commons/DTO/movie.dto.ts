import { IntersectionType, PickType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayUnique,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUrl,
  Validate,
} from 'class-validator';
import { PrismaService } from 'src/prisma/prisma.service';
import { TeasersArrayValidator } from '../validator.custom';
import { CreateActorDto, CreateActorWithRoleName } from './actor.dto';

enum GenreEnum {
  Action = 'ACTION',
  Comedy = 'COMEDY',
  Drama = 'DRAMA',
  Horror = 'HORROR',
  Thriller = 'THRILLER',
  SF = 'SF',
  Fantasy = 'FANTASY',
  Animation = 'ANIMATION',
  Document = 'DOCUMENT',
}
export class CreateMovieDto {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.toUpperCase().replace(/ /g, '_'))
  title: string;

  @IsString()
  @IsUrl()
  titleImg: string;

  @IsString()
  @Transform(({ value }) => value.toUpperCase().replace(/ /g, '_'))
  originalTitle?: string;

  @IsNumber()
  grade: number;

  @IsNotEmpty({
    context: {
      code: 'PLAY_TIME_OF_MOVIE_MUST_EXIST',
    },
  })
  playTime: string;

  @IsNotEmpty({
    context: {
      code: 'SYNOPSIS_OF_MOVIE_MUST_EXIST',
    },
  })
  synopsis: string;

  @IsNumber()
  releaseDate: number;
}

export class CreateMovieAssocationTable extends CreateMovieDto {
  @IsNotEmpty()
  @IsEnum(GenreEnum, { each: true })
  genres: string[];

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.toUpperCase().replace(/ /g, '_'))
  directorName: string;

  @IsString({ each: true })
  @ArrayUnique()
  teasers: string[];

  @IsNotEmpty()
  @Type(() => CreateActorWithRoleName)
  actorDetails: CreateActorWithRoleName[];
}

export class CreateMovieWithAssocationTable extends IntersectionType(
  CreateMovieDto,
  CreateMovieAssocationTable,
) {}

export class FindMovieByTitleDto {
  @IsNotEmpty()
  tx: PrismaService;

  @IsNotEmpty()
  @IsString()
  @Validate(TeasersArrayValidator)
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
