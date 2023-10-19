export interface FileSystem {
  folders: Folder[];
  items: any;
}

export interface Folder {
  id: number;
  name: string;
  type: string;
  parent: number;
  folders?: Folder[];
  playlists?: Playlist[];
  programs?: Program[];
}

export interface Playlist {
  id: number;
  name: string;
  type: string;
  parent: number;
  prefix: string;
  songCount: number; // TODO: discuss
}

export interface Program {
  id: number;
  name: string;
  type: string;
  parent: number;
  prefix: string;
  playlists: {
    id: number;
    percentage: number; // 0-100
    playlist: number; // playlist ID
    program: number; // program ID
  }[];
}

export interface Tag {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
  order: number;
  genres?: Genre[];
}

export interface Genre {
  id: number;
  name: string;
  order: number;
  category: number;
  isSelected: boolean;
}

export interface Preview {
  total: number;
  songs: PlaylistSong[];
}

export interface PlaylistSong {
  album: string;
  artist: string;
  artist_addition: string;
  bpm: number
  cast: string;
  cover: any;
  created_at: Date;
  cue_in: number;
  cue_out: number;
  daytime: string;
  energy: string;
  fame: string;
  filename: string;
  genre: string;
  hash: string;
  id: number;
  language: string;
  length: number;
  mood: string;
  season: string;
  songs_cast_id: number;
  songs_daytime_id: number;
  songs_energy_id: number;
  songs_fame_id: number;
  songs_language_id: number;
  songs_mood_id: number;
  songs_season_id: number;
  songs_speed_id: number;
  songs_voice_id: number;
  speed: string;
  status: number;
  tags: string;
  target_age: string;
  title: string;
  updated_at: Date;
  username: string;
  version: string;
  voice: string;
  year: number;
}
