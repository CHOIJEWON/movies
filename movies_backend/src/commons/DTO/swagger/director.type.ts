import { ApiProperty } from '@nestjs/swagger';

export class ReturnDirector {
  @ApiProperty({
    description: '감독 고유 ID',
    example: '10',
  })
  id: number;
  @ApiProperty({
    description: '감독 이름',
    example: '박찬욱',
  })
  directorName: string;
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
