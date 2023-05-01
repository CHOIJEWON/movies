import { Movie } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime';

export interface MovieInterface {
  id: number;
  title: string;
  titleImg: string;
  originalTitle: string;
  grade: Decimal;
  playTime: string;
  synopsis: string;
  releaseDate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MovieWithDirectorAndAssocationTableProcessFormats
  extends Movie {
  Genre: string[];
  movieCast: {
    roleName: string;
    actor: string;
  }[];
  Teaser: string[];
}

export interface GetOneMovieWithAssociation extends Movie {
  directorMovie: DirectorMovie[];
  Genre: Genre[];
  movieCast: MovieCast[];
}

export interface GetOneMovieFormatted extends MovieInterface {
  director: string[];
  Genre: string[];
  movieCast: {
    roleName: string;
    actor: string;
  }[];
}

interface DirectorMovie {
  director: {
    directorName: string;
  };
}
9;
interface Genre {
  genre: {
    genre: string;
  };
}

interface MovieCast {
  roleName: string;
  actor: {
    name: string;
  };
}

interface MovieCastReturnInterface {
  movieCast: {
    roleName: string;
    actor: string;
  };
}
