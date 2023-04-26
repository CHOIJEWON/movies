import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateMovieDto {
  @IsNotEmpty({
    context: {
      code: 'TITLE_OF_THE_MOVIE_MUST_EXIST',
    },
  })
  title: string;

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
