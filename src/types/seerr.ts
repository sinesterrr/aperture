export interface SeerrMediaItem {
  id: number;
  mediaType: "movie" | "tv";
  tmdbId: number;
  tvdbId?: number;
  title?: string;
  name?: string;
  posterPath?: string;
  backdropPath?: string;
  releaseDate?: string;
  firstAirDate?: string;
  voteAverage?: number;
  overview?: string;
  status?: number;
  jellyfinMediaId?: string;
  mediaAddedAt?: string;
}

export type SeerrResponse<T> = {
  page?: number;
  totalPages?: number;
  totalResults?: number;
  results: T[];
};
