import { PickType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateDirectorName {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  directorId: number;

  @IsNotEmpty()
  @Transform(({ value }) => value.toUpperCase().replace(/ /g, '_'))
  directorName: string;
}

export class UpdateDirectorConnectMovie extends PickType(UpdateDirectorName, [
  'directorName',
] as const) {}
