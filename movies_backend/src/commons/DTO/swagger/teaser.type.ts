import { ApiProperty } from '@nestjs/swagger';

export class ReturnTeaser {
  @ApiProperty({
    description: '티저 고유 ID',
    example: '10',
  })
  id: number;

  @ApiProperty({
    description: '티저 url',
    type: 'url',
    example: 'http://test-teaser-4.com',
  })
  url: string;

  @ApiProperty({
    description: '티저가 해당되는 MovieId',
    type: 'url',
    example: '24',
  })
  movieId: number;
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
