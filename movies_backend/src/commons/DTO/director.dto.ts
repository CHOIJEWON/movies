import { ApiProperty, PickType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateDirectorName {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  directorId: number;

  @IsNotEmpty()
  @Transform(({ value }) => value.toUpperCase().replace(/ /g, '_'))
  @ApiProperty({
    example: 'lilly wachbowski',
    description: '감독 이름',
  })
  directorName: string;
}

export class UpdateDirectorConnectMovie extends PickType(UpdateDirectorName, [
  'directorName',
] as const) {}
