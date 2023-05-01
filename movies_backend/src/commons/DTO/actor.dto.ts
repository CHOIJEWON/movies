import { ApiProperty, PickType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateActorDto {
  roleName: string;
  actor: {
    connect: { id: number };
  };
}

export class CreateActorWithRoleName {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.toUpperCase().replace(/ /g, '_'))
  @ApiProperty({
    example: '최우식',
    description: '배우의 배역 이름을 할당합니다',
  })
  name: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.toUpperCase().replace(/ /g, '_'))
  @ApiProperty({
    example: '아들',
    description: '배우의 배역 이름을 할당합니다',
  })
  roleName: string;
}

export class UpdateActorName extends PickType(CreateActorWithRoleName, [
  'name',
] as const) {
  @IsNumber()
  @Transform(({ value }) => Number(value))
  actorId: number;
}
