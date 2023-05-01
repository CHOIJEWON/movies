import { PickType } from '@nestjs/swagger';
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
  name: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.toUpperCase().replace(/ /g, '_'))
  roleName: string;
}

export class UpdateActorName extends PickType(CreateActorWithRoleName, [
  'name',
] as const) {
  @IsNumber()
  @Transform(({ value }) => Number(value))
  actorId: number;
}
