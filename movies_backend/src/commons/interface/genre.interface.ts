import { Movie } from '@prisma/client';

export interface MovieWithGenreAndAssocaitedTable extends Movie {
  genre: string;
  movieCast: {
    roleName: string;
    actor: string;
  }[];
  Teaser: string[];
}
