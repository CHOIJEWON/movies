import { ApiProperty } from '@nestjs/swagger';

export class ReturnMovie {
  @ApiProperty({
    example: '24',
    description: '영화ID',
  })
  id: number;
  @ApiProperty({
    example: '매트릭스',
    description:
      '영화 제목이 입력됩니다 해당 제목은 모두 대문자화 되며 띄어쓰기는 `_`로 대체됩니다',
  })
  title: string;

  @ApiProperty({
    example: 'https://test-teaser-4.com/matrix',
    description: '영화 타이틀 이미지를 입력합니다',
  })
  titleImg: string;

  @ApiProperty({
    example: 'THE_MATRIX',
    description:
      '영화 원제목을 입력합니다 해당 프로퍼티는 옵셔널입니다, 모든 원제목은 대문자화 되며 띄어쓰기는 `_`로 대체됩니다',
  })
  originalTitle?: string;

  @ApiProperty({
    example: '9.43',
    description: '영화 평점을 입력합니다',
  })
  grade: number;

  @ApiProperty({
    example: '103분',
    description: '영화 상영 시간을 입력합니다',
  })
  playTime: string;

  @ApiProperty({
    example: '매트릭스는 가상세계의...',
    description: '영화의 시눕시스를 입력합니다',
  })
  synopsis: string;

  @ApiProperty({
    example: '1999',
    description: '영화의 개봉 년도를 입력합니다',
  })
  releaseDate: number;

  @ApiProperty({
    example: '2023-05-01T14:47:41.663Z',
    description: '해당 데이터 생성된 날짜',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2023-05-01T14:47:41.663Z',
    description: '해당 데이터 업데이트된 날짜',
  })
  updatedAt: Date;
}

export class ReturnConflict {
  @ApiProperty({
    example: '409',
  })
  status: string;

  @ApiProperty({
    example: '"2023-05-01T15:41:29.961Z',
  })
  timeStamp: Date;

  @ApiProperty({
    example: '/movie',
  })
  url: string;

  @ApiProperty({
    example: 'THIS_MOVIE_ALREADY_EXISTS',
  })
  response: string;
}

export class getMovieArray extends ReturnMovie {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
    },
    example: ['봉준호'],
  })
  director: string[];

  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
    },
    example: '[ ACTION, COMEDY ]',
  })
  genre: String[];

  @ApiProperty({
    type: 'array',
    items: {
      type: 'Object',
    },
    example: '[{roleName: 배역이름, actor: 배우이름}]',
  })
  movieCast: {
    roleName: string;
    actor: string;
  }[];
}

export class MovieCastReturn {
  @ApiProperty({
    example: '1',
    description: 'DirectedMovie 고유 ID',
  })
  id: number;

  @ApiProperty({
    example: '아들',
    description: '배우 배역 이름',
  })
  roleName: string;

  @ApiProperty({
    example: '24',
    description: 'movie 고유 ID',
  })
  movieId: number;

  @ApiProperty({
    example: '32',
    description: 'actor 고유 ID',
  })
  actorId: number;

  @ApiProperty({
    example: '2023-05-01T15:41:29.961Z',
    description: '해당 데이터가 생성된 날짜',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2023-05-01T15:41:29.961Z',
    description: '해당 데이터가 업데이트된 날짜',
  })
  updatedAt: Date;
}

export class GenreReturn {
  @ApiProperty({
    example: '24',
    description: 'movieGenre 고유 ID',
  })
  id: number;
  @ApiProperty({
    example: '24',
    description: '영화 고유 ID',
  })
  movieId: number;

  @ApiProperty({
    example: '11',
    description: '장르 고유 ID',
  })
  genreId: number;
  @ApiProperty({
    example: '2023-05-01T15:41:29.961Z',
    description: '해당 데이터가 생성된 날짜',
  })
  createdAt: Date;
  @ApiProperty({
    example: '2023-05-01T15:41:29.961Z',
    description: '해당 데이터가 업데이트된 날짜',
  })
  updatedAt: Date;
}

export class ReturnDirectedMovie {
  @ApiProperty({
    example: '24',
    description: 'directedMovie 고유 아이디',
  })
  id: number;

  @ApiProperty({
    example: '24',
    description: '영화 고유 ID',
  })
  movieId: number;

  @ApiProperty({
    example: '11',
    description: '감독 고유 ID',
  })
  directorId: number;
  @ApiProperty({
    example: '2023-05-01T15:41:29.961Z',
    description: '해당 데이터가 생성된 날짜',
  })
  createdAt: Date;
  @ApiProperty({
    example: '2023-05-01T15:41:29.961Z',
    description: '해당 데이터가 업데이트된 날짜',
  })
  updatedAt: Date;
}
