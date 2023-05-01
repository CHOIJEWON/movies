import { ApiProperty } from '@nestjs/swagger';

export class ReturnActor {
  @ApiProperty({
    description: '배우 고유 Id',
    example: '24',
  })
  id: number;

  @ApiProperty({
    description: '배우 이름',
    example: '남주혁',
  })
  name: string;

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
