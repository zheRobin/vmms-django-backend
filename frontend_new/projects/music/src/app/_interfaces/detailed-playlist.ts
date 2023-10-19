export interface DetailedPlaylist {
  id: number;
  prefix: string;
  name: string;
  color: string; // "#7ae7bf"
  cover: null;
  parent: number; // parent folder ID
  content_mode: 0 | 1; // Filters & Genres or Manual song selection

  // Filters & Genres
  filters: PlaylistFilter[];
  include_tags: string; // "1,2,3" from tag IDs
  exclude_tags: string; // "1,2,3" from tag IDs
  genres: string; // "82,83,84" from genre IDs
  notes: string;

  songs: [];
}

export interface PlaylistFilter {
  id: number; // filter ID
  field: string; // ex. "Language"
  word: string; // ex. "is not"
  value: string; // ex. "2"
  playlist: number; // playlist ID
}

export interface PlaylistDependents {
  programs_with_playlist: {
    programs: { id: number, name: string }[];
    count: number;
  };
  events_count: number;
  client_basic_content_count: number;
  client_content_count: number;
}

export interface PlaylistPreviewPayload {
  content_mode: number;
  exclude_tags: string;
  filters: PlaylistFilter[];
  genres: string;
  include_tags: string;
  page?: number;
  per_page: number;
}
