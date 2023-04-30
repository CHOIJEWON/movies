import { Decimal } from '@prisma/client/runtime';

export interface GetDirectorInfoByNameWithAssociateTable {
  directorName: string;
  directedMovie: {
    movie: {
      id: number;
      title: string;
      titleImg: string;
      originalTitle?: string;
      grade: Decimal;
      playTime: string;
      synopsis: string;
      releaseDate: number;
      createdAt: Date;
      updatedAt: Date;
      Genre: {
        genre: {
          id: number;
          genre: string;
          createdAt: Date;
          updatedAt: Date;
        };
      }[];
      movieCast: {
        roleName: string;
        actor: {
          name: string;
        };
      }[];
      Teaser: {
        url: string;
      }[];
    }[];
  }[];
}
