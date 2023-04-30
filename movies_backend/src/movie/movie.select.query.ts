export const movieSelectQuery = {
  id: true,
  title: true,
  titleImg: true,
  originalTitle: true,
  grade: true,
  playTime: true,
  synopsis: true,
  releaseDate: true,
  createdAt: true,
  updatedAt: true,
  directorMovie: {
    select: {
      director: {
        select: {
          directorName: true,
        },
      },
    },
  },
  Genre: {
    select: {
      genre: {
        select: {
          genre: true,
        },
      },
    },
  },
  movieCast: {
    select: {
      roleName: true,
      actor: {
        select: {
          name: true,
        },
      },
    },
  },
};
