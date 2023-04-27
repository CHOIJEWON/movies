import { PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateMovieDto {
  @IsNotEmpty({
    context: {
      code: 'TITLE_OF_THE_MOVIE_MUST_EXIST',
    },
  })
  title: string;

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
  genre: string;
  directorName: string;
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
