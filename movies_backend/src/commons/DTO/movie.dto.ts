import {
  ApiProperty,
  ApiPropertyOptional,
  IntersectionType,
  PickType,
} from '@nestjs/swagger';
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
  @ApiProperty({
    example: '매트릭스',
    description:
      '영화 제목이 입력됩니다 해당 제목은 모두 대문자화 되며 띄어쓰기는 `_`로 대체됩니다',
  })
  title: string;

  @IsString()
  @IsUrl()
  @ApiProperty({
    example: 'https://test-teaser-4.com/matrix',
    description: '영화 타이틀 이미지를 입력합니다',
  })
  titleImg: string;

  @IsString()
  @Transform(({ value }) => value.toUpperCase().replace(/ /g, '_'))
  @ApiProperty({
    example: 'The Matirx',
    description:
      '영화 원제목을 입력합니다 해당 프로퍼티는 옵셔널입니다, 모든 원제목은 대문자화 되며 띄어쓰기는 `_`로 대체됩니다',
  })
  originalTitle?: string;

  @IsNumber()
  @ApiProperty({
    example: '9.43',
    description: '영화 평점을 입력합니다',
  })
  grade: number;

  @IsNotEmpty({
    context: {
      code: 'PLAY_TIME_OF_MOVIE_MUST_EXIST',
    },
  })
  @ApiProperty({
    example: '103분',
    description: '영화 상영 시간을 입력합니다',
  })
  playTime: string;

  @IsNotEmpty({
    context: {
      code: 'SYNOPSIS_OF_MOVIE_MUST_EXIST',
    },
  })
  @ApiProperty({
    example: '매트릭스는 가상세계의...',
    description: '영화의 시눕시스를 입력합니다',
  })
  synopsis: string;

  @IsNumber()
  @ApiProperty({
    example: '1999',
    description: '영화의 개봉 년도를 입력합니다',
  })
  releaseDate: number;
}

export class UpdateMovieDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.toUpperCase().replace(/ /g, '_'))
  @ApiPropertyOptional({
    example: '매트릭스',
    description: '영화의 개봉 년도를 입력합니다',
  })
  title?: string;

  @IsOptional()
  @IsUrl()
  @ApiPropertyOptional({
    example: 'https://test-teaser-4.com/matrix',
    description: '영화 타이틀 이미지를 입력합니다',
  })
  titleImg?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.toUpperCase().replace(/ /g, '_'))
  @ApiPropertyOptional({
    example: 'The Matirx',
    description:
      '영화 원제목을 입력합니다 해당 프로퍼티는 옵셔널입니다, 모든 원제목은 대문자화 되며 띄어쓰기는 `_`로 대체됩니다',
  })
  originalTitle?: string;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    example: '9.43',
    description: '영화 평점을 입력합니다',
  })
  grade?: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    example: '103분',
    description: '영화 상영 시간을 입력합니다',
  })
  playTime?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    example: '매트릭스는 가상세계의...',
    description: '영화의 시눕시스를 입력합니다',
  })
  synopsis?: string;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    example: '1999',
    description: '영화의 개봉 년도를 입력합니다',
  })
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
  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      enum: Object.values(GenreEnum),
    },
    example: ['ACTION', 'COMEDY'],
    description: 'An array of genres of the movie',
  })
  genres: string[];

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.toUpperCase().replace(/ /g, '_'))
  @ApiProperty({
    example: 'Lilly Wachowski',
    description:
      '감독 이름을 입력합니다 영어인경우 모두 대문자로 처리하며 띄어쓰기는 `_`로 대체됩니다',
  })
  directorName: string;

  @IsString({ each: true })
  @ArrayUnique()
  @ApiProperty({
    example: `["http://test-teaser-4.com"]`,
    description: '티저 영상의 URl을 등록합니다 url형태로 강제되고 있습니다',
  })
  teasers: string[];

  @IsNotEmpty()
  @Type(() => CreateActorWithRoleName)
  @ApiProperty({
    example: `[ {"name": "배우이름", "roleName": "배역이름"}]`,
    description: '배우와 배역의 이름을 넣습니다',
  })
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
  @ApiPropertyOptional({ example: '아들', description: '배역이름' })
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
  @ApiProperty({
    example: `COMEDY`,
    description: '영화의 장르를 입력합니다',
  })
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
