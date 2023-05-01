import { IntersectionType, PickType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayUnique,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
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

enum SortOption {
  GRADE = 'GRADE_DESC',
  UPDATE = 'UPDATE_DESC',
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

export class UpdateMovieDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.toUpperCase().replace(/ /g, '_'))
  title?: string;

  @IsOptional()
  @IsUrl()
  titleImg?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.toUpperCase().replace(/ /g, '_'))
  originalTitle?: string;

  @IsOptional()
  @IsNumber()
  grade?: number;

  @IsOptional()
  @IsString()
  playTime?: string;

  @IsOptional()
  @IsString()
  synopsis?: string;

  @IsOptional()
  @IsNumber()
  releaseDate?: number;
}

export class UpdateMovieWithT extends UpdateMovieDto {
  @IsNotEmpty()
  @IsNumber()
  movieId: number;
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

export class UpdateTeasr {
  @IsNotEmpty()
  @IsUrl()
  url: string;
}
export class UpdateRoleNameWithIds extends PickType(CreateActorWithRoleName, [
  'roleName',
] as const) {
  @IsNotEmpty()
  @IsNumber()
  actorId: number;

  @IsNotEmpty()
  @IsNumber()
  movieId: number;
}

export class UpdateRoleName extends PickType(CreateActorWithRoleName, [
  'roleName',
] as const) {}

export class GetMovieCast extends PickType(UpdateRoleNameWithIds, [
  'actorId',
  'movieId',
] as const) {}

export class UpdateRoleNameWithCastId extends PickType(UpdateRoleName, [
  'roleName',
] as const) {
  @IsNotEmpty()
  castId: number;
}

export class ActorNameAndRoleName extends PickType(CreateActorWithRoleName, [
  'name',
] as const) {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.toUpperCase().replace(/ /g, '_'))
  roleName: string;
}

export class UpdateMovieCastConnection extends PickType(ActorNameAndRoleName, [
  'name',
  'roleName',
]) {
  @IsNotEmpty()
  @IsNumber()
  movieId: number;

  @IsNotEmpty()
  @IsNumber()
  actorId: number;
}

export class MovieGenreDto {
  @IsNotEmpty()
  @IsNumber()
  movieId: number;

  @IsNotEmpty()
  @IsNumber()
  genreId: number;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.toUpperCase())
  @IsEnum(GenreEnum)
  genre: string;
}

export class InputGerne extends PickType(MovieGenreDto, ['genre'] as const) {}

export class GetMovieGenreWithIds extends PickType(MovieGenreDto, [
  'genreId',
  'movieId',
] as const) {}

export class UpdateMovieGenre extends PickType(MovieGenreDto, [
  'genreId',
] as const) {
  @IsNotEmpty()
  @IsNumber()
  movieGenreId: number;
}

export class CreateMovieWithAssocationTable extends IntersectionType(
  CreateMovieDto,
  CreateMovieAssocationTable,
) {}
export class GetMoviesByGenresWith {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.toUpperCase())
  @IsEnum(GenreEnum)
  genre: string;
}

export class GetMoviesByOrderByOption {
  @IsNotEmpty()
  @IsString()
  @IsEnum(SortOption)
  sortType: string;
}

export class GetMovieByTitle {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.toUpperCase().replace(/ /g, '_'))
  title: string;
}

export class FindMovieByTitleDto {
  @IsNotEmpty()
  tx: PrismaService;

  @IsNotEmpty()
  @IsString()
  @Validate(TeasersArrayValidator)
  title: string;
}

export class MovieAndDirectorId {
  @IsNotEmpty()
  @IsNumber()
  movieId: number;

  @IsNotEmpty()
  @IsNumber()
  directorId: number;
}

export class UpdateDirectedMovie extends PickType(MovieAndDirectorId, [
  'directorId',
] as const) {
  @IsNotEmpty()
  @IsNumber()
  directedId: number;
}

export class UpdateDirectedMovieByDirectorName extends MovieAndDirectorId {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.toUpperCase().replace(/ /g, '_'))
  updateDirectorName: string;
}
export class CreateMovieWithAssocationInRepositoryDto extends CreateMovieDto {
  directorId: number;
  genresIds: number[];
  movieCasts: CreateActorDto[];
  teasers: string[];
}

export class FindMovieByDirectorNameDto {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.toUpperCase().replace(/ /g, '_'))
  directorName: string;
}
