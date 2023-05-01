import { PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsUrl } from 'class-validator';

export class UpdateTeaserDtoWithIds {
  @IsNotEmpty()
  @IsNumber()
  movieId: number;

  @IsNotEmpty()
  @IsNumber()
  teaserId: number;

  @IsNotEmpty()
  @IsUrl()
  url: string;
}

export class UpdateTeaserPickUrl extends PickType(UpdateTeaserDtoWithIds, [
  'url',
] as const) {}

export class GetTeaserByMovieIdWithT extends PickType(UpdateTeaserDtoWithIds, [
  'movieId',
  'teaserId',
] as const) {}

export class UpdateTeaserWithT extends PickType(UpdateTeaserDtoWithIds, [
  'teaserId',
  'url',
] as const) {}
