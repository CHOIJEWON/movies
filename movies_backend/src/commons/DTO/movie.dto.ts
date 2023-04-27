import { PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsUrl } from 'class-validator';

export class CreateMovieDto {
  @IsNotEmpty({
    context: {
      code: 'TITLE_OF_THE_MOVIE_MUST_EXIST',
    },
  })
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

export class CreateMovieWithAssocationTable extends CreateMovieDto {
  @IsNotEmpty()
  genres: string[];

  @IsNotEmpty()
  @IsString()
  directorName: string;
  @IsUrl()
  teasers: string[];

  @IsNotEmpty()
  actorDetails: CreateActorWithRoleName[];
}

export class CreateActorWithRoleName {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  roleName: string;
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
