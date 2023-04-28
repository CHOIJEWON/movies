import { IsNotEmpty } from 'class-validator';

export class CreateActorDto {
  roleName: string;
  actor: {
    connect: { id: number };
  };
}

export class CreateActorWithRoleName {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  roleName: string;
}
